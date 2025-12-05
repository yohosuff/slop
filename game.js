// Game Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game State
let gameRunning = false;
let score = 0;
let lives = 3;
let level = 1;
let animationId;

// Player
const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 80,
    width: 50,
    height: 50,
    speed: 7,
    color: '#00ff88'
};

// Game Arrays
let bullets = [];
let enemies = [];
let particles = [];
let stars = [];

// Controls
const keys = {
    left: false,
    right: false
};

let canShoot = true;
let shootCooldown = 250; // milliseconds between shots

// Initialize stars for background
function initStars() {
    stars = [];
    for (let i = 0; i < 100; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 1,
            speed: Math.random() * 2 + 0.5
        });
    }
}

// Draw stars
function drawStars() {
    ctx.fillStyle = '#fff';
    stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Move stars down
        star.y += star.speed;
        if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
        }
    });
}

// Draw player ship
function drawPlayer() {
    ctx.save();
    
    // Ship body
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2, player.y);
    ctx.lineTo(player.x + player.width, player.y + player.height);
    ctx.lineTo(player.x + player.width * 0.75, player.y + player.height * 0.7);
    ctx.lineTo(player.x + player.width * 0.25, player.y + player.height * 0.7);
    ctx.lineTo(player.x, player.y + player.height);
    ctx.closePath();
    ctx.fill();
    
    // Engine glow
    ctx.fillStyle = '#ff6600';
    ctx.beginPath();
    ctx.moveTo(player.x + player.width * 0.3, player.y + player.height * 0.7);
    ctx.lineTo(player.x + player.width * 0.5, player.y + player.height + 10 + Math.random() * 10);
    ctx.lineTo(player.x + player.width * 0.7, player.y + player.height * 0.7);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
}

// Update player position
function updatePlayer() {
    if (keys.left && player.x > 0) {
        player.x -= player.speed;
    }
    if (keys.right && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }
}

// Create bullet
function shootBullet() {
    if (!canShoot) return;
    
    bullets.push({
        x: player.x + player.width / 2 - 3,
        y: player.y,
        width: 6,
        height: 15,
        speed: 10,
        color: '#ffff00'
    });
    
    canShoot = false;
    setTimeout(() => {
        canShoot = true;
    }, shootCooldown);
}

// Draw bullets
function drawBullets() {
    bullets.forEach(bullet => {
        ctx.fillStyle = bullet.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = bullet.color;
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        ctx.shadowBlur = 0;
    });
}

// Update bullets
function updateBullets() {
    bullets = bullets.filter(bullet => {
        bullet.y -= bullet.speed;
        return bullet.y + bullet.height > 0;
    });
}

// Spawn enemy
function spawnEnemy() {
    const types = [
        { width: 40, height: 40, color: '#ff4444', points: 10, speed: 2 },
        { width: 50, height: 50, color: '#ff8800', points: 20, speed: 3 },
        { width: 60, height: 60, color: '#ff00ff', points: 30, speed: 4 }
    ];
    
    const type = types[Math.floor(Math.random() * types.length)];
    const speedBonus = (level - 1) * 0.5;
    
    enemies.push({
        x: Math.random() * (canvas.width - type.width),
        y: -type.height,
        width: type.width,
        height: type.height,
        color: type.color,
        points: type.points,
        speed: type.speed + speedBonus
    });
}

// Draw enemies
function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.fillStyle = enemy.color;
        
        // Draw alien ship shape
        ctx.beginPath();
        ctx.moveTo(enemy.x + enemy.width / 2, enemy.y + enemy.height);
        ctx.lineTo(enemy.x + enemy.width, enemy.y);
        ctx.lineTo(enemy.x + enemy.width * 0.75, enemy.y + enemy.height * 0.3);
        ctx.lineTo(enemy.x + enemy.width * 0.25, enemy.y + enemy.height * 0.3);
        ctx.lineTo(enemy.x, enemy.y);
        ctx.closePath();
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(enemy.x + enemy.width * 0.35, enemy.y + enemy.height * 0.5, 5, 0, Math.PI * 2);
        ctx.arc(enemy.x + enemy.width * 0.65, enemy.y + enemy.height * 0.5, 5, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Update enemies
function updateEnemies() {
    enemies = enemies.filter(enemy => {
        enemy.y += enemy.speed;
        
        // Check if enemy reached bottom
        if (enemy.y > canvas.height) {
            loseLife();
            return false;
        }
        return true;
    });
}

// Create explosion particles
function createExplosion(x, y, color) {
    for (let i = 0; i < 20; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            radius: Math.random() * 5 + 2,
            color: color,
            life: 1
        });
    }
}

// Draw particles
function drawParticles() {
    particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    });
}

// Update particles
function updateParticles() {
    particles = particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        p.radius *= 0.98;
        return p.life > 0;
    });
}

// Check collisions
function checkCollisions() {
    // Bullets hitting enemies
    bullets.forEach((bullet, bIndex) => {
        enemies.forEach((enemy, eIndex) => {
            if (bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y) {
                
                // Create explosion
                createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.color);
                
                // Add score
                score += enemy.points;
                
                // Level up every 100 points (check before current score crosses threshold)
                const newLevel = Math.floor(score / 100) + 1;
                if (newLevel > level) {
                    level = newLevel;
                }
                
                updateUI();
                
                // Remove bullet and enemy
                bullets.splice(bIndex, 1);
                enemies.splice(eIndex, 1);
            }
        });
    });
    
    // Enemies hitting player
    enemies.forEach((enemy, eIndex) => {
        if (player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y) {
            
            createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.color);
            enemies.splice(eIndex, 1);
            loseLife();
        }
    });
}

// Lose a life
function loseLife() {
    lives--;
    updateUI();
    
    if (lives <= 0) {
        gameOver();
    }
}

// Update UI
function updateUI() {
    document.getElementById('score').textContent = `Score: ${score}`;
    document.getElementById('lives').textContent = `Lives: ${lives}`;
    document.getElementById('level').textContent = `Level: ${level}`;
}

// Game Over
function gameOver() {
    gameRunning = false;
    cancelAnimationFrame(animationId);
    clearInterval(enemySpawnInterval);
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').classList.remove('hidden');
}

// Main game loop
function gameLoop() {
    if (!gameRunning) return;
    
    // Clear canvas
    ctx.fillStyle = '#000022';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw and update everything
    drawStars();
    updatePlayer();
    drawPlayer();
    updateBullets();
    drawBullets();
    updateEnemies();
    drawEnemies();
    updateParticles();
    drawParticles();
    checkCollisions();
    
    animationId = requestAnimationFrame(gameLoop);
}

// Spawn enemies periodically
let enemySpawnInterval;

function startEnemySpawning() {
    const baseInterval = 1500;
    const levelReduction = (level - 1) * 100;
    const interval = Math.max(500, baseInterval - levelReduction);
    
    clearInterval(enemySpawnInterval);
    enemySpawnInterval = setInterval(() => {
        spawnEnemy();
    }, interval);
}

// Start game
function startGame() {
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('gameOver').classList.add('hidden');
    
    // Reset game state
    score = 0;
    lives = 3;
    level = 1;
    player.x = canvas.width / 2 - 25;
    player.y = canvas.height - 80;
    bullets = [];
    enemies = [];
    particles = [];
    
    updateUI();
    initStars();
    
    gameRunning = true;
    startEnemySpawning();
    gameLoop();
}

// Restart game
function restartGame() {
    startGame();
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keys.left = true;
    }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keys.right = true;
    }
    if (e.key === ' ') {
        e.preventDefault();
        if (gameRunning) {
            shootBullet();
        }
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keys.left = false;
    }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keys.right = false;
    }
});

// Initialize stars on load
initStars();
