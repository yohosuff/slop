// Space Dodge - Mobile Action Game

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.ui = {
            score: document.getElementById('score'),
            lives: document.getElementById('lives'),
            startScreen: document.getElementById('startScreen'),
            gameOverScreen: document.getElementById('gameOverScreen'),
            finalScore: document.getElementById('finalScore'),
            highScore: document.getElementById('highScore'),
            startBtn: document.getElementById('startBtn'),
            restartBtn: document.getElementById('restartBtn')
        };
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        this.player = null;
        this.asteroids = [];
        this.stars = [];
        this.particles = [];
        this.score = 0;
        this.lives = 3;
        this.gameRunning = false;
        this.highScoreValue = parseInt(localStorage.getItem('spaceDodgeHighScore')) || 0;
        
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.isTouching = false;
        
        this.setupEventListeners();
        this.drawBackground();
    }
    
    resizeCanvas() {
        const container = document.getElementById('gameContainer');
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
    }
    
    setupEventListeners() {
        // Touch events
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        this.canvas.addEventListener('touchend', () => this.handleTouchEnd());
        
        // Mouse events for desktop testing
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.handleMouseUp());
        
        // Buttons
        this.ui.startBtn.addEventListener('click', () => this.startGame());
        this.ui.startBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.startGame();
        });
        
        this.ui.restartBtn.addEventListener('click', () => this.startGame());
        this.ui.restartBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.startGame();
        });
    }
    
    handleTouchStart(e) {
        e.preventDefault();
        if (!this.gameRunning) return;
        
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        this.touchStartX = touch.clientX - rect.left;
        this.touchStartY = touch.clientY - rect.top;
        this.isTouching = true;
        
        // Move player to touch position
        if (this.player) {
            this.player.targetX = this.touchStartX;
            this.player.targetY = this.touchStartY;
        }
    }
    
    handleTouchMove(e) {
        e.preventDefault();
        if (!this.gameRunning || !this.isTouching) return;
        
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        if (this.player) {
            this.player.targetX = x;
            this.player.targetY = y;
        }
    }
    
    handleTouchEnd() {
        this.isTouching = false;
    }
    
    handleMouseDown(e) {
        if (!this.gameRunning) return;
        
        const rect = this.canvas.getBoundingClientRect();
        this.touchStartX = e.clientX - rect.left;
        this.touchStartY = e.clientY - rect.top;
        this.isTouching = true;
        
        if (this.player) {
            this.player.targetX = this.touchStartX;
            this.player.targetY = this.touchStartY;
        }
    }
    
    handleMouseMove(e) {
        if (!this.gameRunning || !this.isTouching) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (this.player) {
            this.player.targetX = x;
            this.player.targetY = y;
        }
    }
    
    handleMouseUp() {
        this.isTouching = false;
    }
    
    startGame() {
        this.ui.startScreen.classList.add('hidden');
        this.ui.gameOverScreen.classList.add('hidden');
        
        this.score = 0;
        this.lives = 3;
        this.asteroids = [];
        this.stars = [];
        this.particles = [];
        this.gameRunning = true;
        
        // Initialize player
        this.player = {
            x: this.canvas.width / 2,
            y: this.canvas.height - 100,
            targetX: this.canvas.width / 2,
            targetY: this.canvas.height - 100,
            width: 40,
            height: 50,
            speed: 0.15,
            invincible: false,
            invincibleTimer: 0
        };
        
        this.updateUI();
        this.lastTime = performance.now();
        this.spawnTimer = 0;
        this.starSpawnTimer = 0;
        this.difficultyTimer = 0;
        this.spawnRate = 1500;
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    gameLoop(currentTime) {
        if (!this.gameRunning) return;
        
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update(deltaTime) {
        // Update player position (smooth movement)
        if (this.player) {
            const dx = this.player.targetX - this.player.x;
            const dy = this.player.targetY - this.player.y;
            this.player.x += dx * this.player.speed * (deltaTime / 16);
            this.player.y += dy * this.player.speed * (deltaTime / 16);
            
            // Keep player in bounds
            this.player.x = Math.max(this.player.width / 2, Math.min(this.canvas.width - this.player.width / 2, this.player.x));
            this.player.y = Math.max(this.player.height / 2, Math.min(this.canvas.height - this.player.height / 2, this.player.y));
            
            // Update invincibility
            if (this.player.invincible) {
                this.player.invincibleTimer -= deltaTime;
                if (this.player.invincibleTimer <= 0) {
                    this.player.invincible = false;
                }
            }
        }
        
        // Spawn asteroids
        this.spawnTimer += deltaTime;
        if (this.spawnTimer >= this.spawnRate) {
            this.spawnTimer = 0;
            this.spawnAsteroid();
        }
        
        // Spawn stars
        this.starSpawnTimer += deltaTime;
        if (this.starSpawnTimer >= 2000) {
            this.starSpawnTimer = 0;
            this.spawnStar();
        }
        
        // Increase difficulty over time
        this.difficultyTimer += deltaTime;
        if (this.difficultyTimer >= 5000) {
            this.difficultyTimer = 0;
            this.spawnRate = Math.max(400, this.spawnRate - 100);
        }
        
        // Update asteroids
        for (let i = this.asteroids.length - 1; i >= 0; i--) {
            const asteroid = this.asteroids[i];
            asteroid.y += asteroid.speed * (deltaTime / 16);
            asteroid.rotation += asteroid.rotationSpeed * (deltaTime / 16);
            
            // Remove if off screen
            if (asteroid.y > this.canvas.height + asteroid.size) {
                this.asteroids.splice(i, 1);
                continue;
            }
            
            // Check collision with player
            if (this.player && !this.player.invincible && this.checkCollision(this.player, asteroid)) {
                this.asteroids.splice(i, 1);
                this.hitPlayer();
            }
        }
        
        // Update stars
        for (let i = this.stars.length - 1; i >= 0; i--) {
            const star = this.stars[i];
            star.y += star.speed * (deltaTime / 16);
            star.rotation += 0.05 * (deltaTime / 16);
            star.pulse += 0.1 * (deltaTime / 16);
            
            // Remove if off screen
            if (star.y > this.canvas.height + star.size) {
                this.stars.splice(i, 1);
                continue;
            }
            
            // Check collision with player
            if (this.player && this.checkStarCollision(this.player, star)) {
                this.stars.splice(i, 1);
                this.collectStar(star);
            }
        }
        
        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.vx * (deltaTime / 16);
            particle.y += particle.vy * (deltaTime / 16);
            particle.life -= deltaTime;
            particle.alpha = particle.life / particle.maxLife;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    spawnAsteroid() {
        const size = 30 + Math.random() * 30;
        this.asteroids.push({
            x: Math.random() * (this.canvas.width - size * 2) + size,
            y: -size,
            size: size,
            speed: 2 + Math.random() * 3,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.1
        });
    }
    
    spawnStar() {
        const size = 20 + Math.random() * 10;
        this.stars.push({
            x: Math.random() * (this.canvas.width - size * 2) + size,
            y: -size,
            size: size,
            speed: 1.5 + Math.random() * 1.5,
            rotation: 0,
            pulse: 0,
            value: Math.random() > 0.8 ? 50 : 10
        });
    }
    
    checkCollision(player, asteroid) {
        const dx = player.x - asteroid.x;
        const dy = player.y - asteroid.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (player.width / 2 + asteroid.size / 2) * 0.8;
    }
    
    checkStarCollision(player, star) {
        const dx = player.x - star.x;
        const dy = player.y - star.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (player.width / 2 + star.size / 2);
    }
    
    hitPlayer() {
        this.lives--;
        this.updateUI();
        
        // Create explosion particles
        this.createExplosion(this.player.x, this.player.y, '#ff4444');
        
        if (this.lives <= 0) {
            this.gameOver();
        } else {
            // Make player invincible briefly
            this.player.invincible = true;
            this.player.invincibleTimer = 2000;
        }
    }
    
    collectStar(star) {
        this.score += star.value;
        this.updateUI();
        
        // Create sparkle particles
        this.createExplosion(star.x, star.y, '#ffd54f');
    }
    
    createExplosion(x, y, color) {
        for (let i = 0; i < 15; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 3;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 3 + Math.random() * 5,
                color: color,
                life: 500 + Math.random() * 300,
                maxLife: 800,
                alpha: 1
            });
        }
    }
    
    updateUI() {
        this.ui.score.textContent = `Score: ${this.score}`;
        this.ui.lives.textContent = `Lives: ${this.lives}`;
    }
    
    gameOver() {
        this.gameRunning = false;
        
        // Update high score
        if (this.score > this.highScoreValue) {
            this.highScoreValue = this.score;
            localStorage.setItem('spaceDodgeHighScore', this.highScoreValue.toString());
        }
        
        this.ui.finalScore.textContent = this.score;
        this.ui.highScore.textContent = `Best: ${this.highScoreValue}`;
        this.ui.gameOverScreen.classList.remove('hidden');
    }
    
    render() {
        // Clear and draw background
        this.drawBackground();
        
        // Draw particles
        for (const particle of this.particles) {
            this.ctx.save();
            this.ctx.globalAlpha = particle.alpha;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }
        
        // Draw stars (collectibles)
        for (const star of this.stars) {
            this.drawStar(star);
        }
        
        // Draw asteroids
        for (const asteroid of this.asteroids) {
            this.drawAsteroid(asteroid);
        }
        
        // Draw player
        if (this.player) {
            this.drawPlayer();
        }
    }
    
    drawBackground() {
        // Create gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#0a0a2e');
        gradient.addColorStop(1, '#1a1a4e');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw some background stars
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        for (let i = 0; i < 50; i++) {
            const x = (i * 73) % this.canvas.width;
            const y = (i * 97) % this.canvas.height;
            const size = (i % 3) + 1;
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    drawPlayer() {
        const p = this.player;
        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        
        // Flashing effect when invincible
        if (p.invincible && Math.floor(Date.now() / 100) % 2 === 0) {
            this.ctx.globalAlpha = 0.5;
        }
        
        // Draw ship body
        this.ctx.fillStyle = '#4fc3f7';
        this.ctx.beginPath();
        this.ctx.moveTo(0, -p.height / 2);
        this.ctx.lineTo(-p.width / 2, p.height / 2);
        this.ctx.lineTo(0, p.height / 3);
        this.ctx.lineTo(p.width / 2, p.height / 2);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Draw cockpit
        this.ctx.fillStyle = '#81d4fa';
        this.ctx.beginPath();
        this.ctx.moveTo(0, -p.height / 4);
        this.ctx.lineTo(-p.width / 4, p.height / 6);
        this.ctx.lineTo(p.width / 4, p.height / 6);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Draw engine glow
        this.ctx.fillStyle = '#ff9800';
        this.ctx.beginPath();
        this.ctx.moveTo(-p.width / 4, p.height / 2);
        this.ctx.lineTo(0, p.height / 2 + 15 + Math.random() * 10);
        this.ctx.lineTo(p.width / 4, p.height / 2);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    drawAsteroid(asteroid) {
        this.ctx.save();
        this.ctx.translate(asteroid.x, asteroid.y);
        this.ctx.rotate(asteroid.rotation);
        
        // Draw rocky asteroid
        this.ctx.fillStyle = '#5d4037';
        this.ctx.beginPath();
        
        const points = 8;
        for (let i = 0; i < points; i++) {
            const angle = (i / points) * Math.PI * 2;
            const radius = asteroid.size / 2 * (0.7 + Math.sin(i * 3) * 0.3);
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.closePath();
        this.ctx.fill();
        
        // Add some crater details
        this.ctx.fillStyle = '#3e2723';
        this.ctx.beginPath();
        this.ctx.arc(-asteroid.size / 6, -asteroid.size / 8, asteroid.size / 8, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(asteroid.size / 5, asteroid.size / 6, asteroid.size / 10, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    drawStar(star) {
        this.ctx.save();
        this.ctx.translate(star.x, star.y);
        this.ctx.rotate(star.rotation);
        
        const pulseScale = 1 + Math.sin(star.pulse) * 0.1;
        this.ctx.scale(pulseScale, pulseScale);
        
        // Glow effect
        const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, star.size);
        gradient.addColorStop(0, star.value > 10 ? 'rgba(255, 64, 129, 0.8)' : 'rgba(255, 213, 79, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 213, 79, 0)');
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, star.size, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw star shape
        this.ctx.fillStyle = star.value > 10 ? '#ff4081' : '#ffd54f';
        this.ctx.beginPath();
        
        const spikes = 5;
        const outerRadius = star.size / 2;
        const innerRadius = star.size / 4;
        
        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.restore();
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    new Game();
});
