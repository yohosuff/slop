/**
 * Math Mastery Game
 * A fun addition and subtraction game for 5-6 year olds
 */

// Game state
const gameState = {
    mode: 'addition', // 'addition', 'subtraction', or 'mixed'
    score: 0,
    streak: 0,
    correctCount: 0,
    totalCount: 0,
    currentProblem: null,
    showingHelp: false
};

// Emoji arrays for visual helpers
const emojis = ['🍎', '🌟', '🎈', '🦋', '🐸', '🌻', '🍕', '🚗'];

// Positive feedback messages
const correctMessages = [
    "Amazing! 🎉",
    "You're a star! ⭐",
    "Super job! 🌟",
    "Wow! Great work! 💪",
    "Fantastic! 🎊",
    "You did it! 🏆",
    "Awesome! 🌈",
    "Perfect! 💯"
];

const encourageMessages = [
    "Try again! You can do it! 💪",
    "Almost! Give it another try! 🌟",
    "Keep going! You're learning! 📚",
    "That's okay! Try another one! 🎯"
];

// DOM Elements
const num1El = document.getElementById('num1');
const num2El = document.getElementById('num2');
const operatorEl = document.getElementById('operator');
const answerDisplayEl = document.getElementById('answer-display');
const answerButtonsEl = document.getElementById('answer-buttons');
const feedbackEl = document.getElementById('feedback');
const feedbackEmojiEl = document.getElementById('feedback-emoji');
const feedbackTextEl = document.getElementById('feedback-text');
const scoreEl = document.getElementById('score');
const streakEl = document.getElementById('streak');
const correctCountEl = document.getElementById('correct-count');
const totalCountEl = document.getElementById('total-count');
const progressBarEl = document.getElementById('progress-bar');
const visualHelperEl = document.getElementById('visual-helper');
const celebrationEl = document.getElementById('celebration');
const helpBtnEl = document.getElementById('help-btn');
const modeBtns = document.querySelectorAll('.mode-btn');

/**
 * Generate a random number within a range appropriate for the age group
 */
function getRandomNumber(max) {
    return Math.floor(Math.random() * (max + 1));
}

/**
 * Generate a new math problem
 */
function generateProblem() {
    let num1, num2, operator, answer;
    
    // Determine operation based on mode
    if (gameState.mode === 'mixed') {
        operator = Math.random() < 0.5 ? '+' : '-';
    } else if (gameState.mode === 'addition') {
        operator = '+';
    } else {
        operator = '-';
    }
    
    // Generate numbers appropriate for 5-6 year olds
    // Keep numbers small and answers positive
    if (operator === '+') {
        // For addition: numbers 0-10, sum max 20
        num1 = getRandomNumber(10);
        num2 = getRandomNumber(10 - num1);
        answer = num1 + num2;
    } else {
        // For subtraction: ensure result is non-negative
        num1 = getRandomNumber(10);
        num2 = getRandomNumber(num1); // num2 is always <= num1
        answer = num1 - num2;
    }
    
    gameState.currentProblem = {
        num1,
        num2,
        operator,
        answer
    };
    
    return gameState.currentProblem;
}

/**
 * Display the current problem on screen
 */
function displayProblem(problem) {
    num1El.textContent = problem.num1;
    num2El.textContent = problem.num2;
    operatorEl.textContent = problem.operator;
    answerDisplayEl.textContent = '?';
    
    // Clear previous state
    feedbackEmojiEl.textContent = '';
    feedbackTextEl.textContent = '';
    gameState.showingHelp = false;
    helpBtnEl.textContent = '🤔 Need Help?';
    
    // Generate answer buttons
    generateAnswerButtons(problem.answer);
    
    // Update visual helper
    updateVisualHelper(problem, false);
}

/**
 * Generate answer buttons with the correct answer and distractors
 */
function generateAnswerButtons(correctAnswer) {
    answerButtonsEl.innerHTML = '';
    
    // Generate 4 answer options
    const answers = new Set([correctAnswer]);
    
    while (answers.size < 4) {
        // Generate distractors close to the correct answer
        const distractor = correctAnswer + getRandomNumber(6) - 3;
        if (distractor >= 0 && distractor !== correctAnswer) {
            answers.add(distractor);
        }
    }
    
    // Convert to array and shuffle
    const answersArray = Array.from(answers);
    shuffleArray(answersArray);
    
    // Create buttons
    answersArray.forEach(answer => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.textContent = answer;
        btn.addEventListener('click', () => checkAnswer(answer, btn));
        answerButtonsEl.appendChild(btn);
    });
}

/**
 * Shuffle an array in place
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

/**
 * Check if the selected answer is correct
 */
function checkAnswer(selectedAnswer, buttonEl) {
    const isCorrect = selectedAnswer === gameState.currentProblem.answer;
    gameState.totalCount++;
    
    // Disable all buttons temporarily
    const allButtons = answerButtonsEl.querySelectorAll('.answer-btn');
    allButtons.forEach(btn => btn.style.pointerEvents = 'none');
    
    if (isCorrect) {
        handleCorrectAnswer(buttonEl);
    } else {
        handleWrongAnswer(buttonEl);
    }
    
    // Update progress display
    updateProgress();
    
    // Move to next problem after delay
    setTimeout(() => {
        nextProblem();
    }, 2000);
}

/**
 * Handle correct answer
 */
function handleCorrectAnswer(buttonEl) {
    buttonEl.classList.add('correct');
    
    gameState.score++;
    gameState.streak++;
    gameState.correctCount++;
    
    scoreEl.textContent = gameState.score;
    streakEl.textContent = gameState.streak;
    
    answerDisplayEl.textContent = gameState.currentProblem.answer;
    answerDisplayEl.style.color = '#43a047';
    
    // Show feedback
    const message = correctMessages[Math.floor(Math.random() * correctMessages.length)];
    feedbackEmojiEl.textContent = '🎉';
    feedbackTextEl.textContent = message;
    
    // Celebrate with confetti for streaks
    if (gameState.streak >= 3) {
        createConfetti();
    }
}

/**
 * Handle wrong answer
 */
function handleWrongAnswer(buttonEl) {
    buttonEl.classList.add('wrong');
    
    gameState.streak = 0;
    streakEl.textContent = gameState.streak;
    
    // Show the correct answer
    const allButtons = answerButtonsEl.querySelectorAll('.answer-btn');
    allButtons.forEach(btn => {
        if (parseInt(btn.textContent) === gameState.currentProblem.answer) {
            btn.classList.add('correct');
        }
    });
    
    answerDisplayEl.textContent = gameState.currentProblem.answer;
    answerDisplayEl.style.color = '#e53935';
    
    // Show encouraging feedback
    const message = encourageMessages[Math.floor(Math.random() * encourageMessages.length)];
    feedbackEmojiEl.textContent = '💪';
    feedbackTextEl.textContent = message;
}

/**
 * Update progress bar
 */
function updateProgress() {
    correctCountEl.textContent = gameState.correctCount;
    totalCountEl.textContent = gameState.totalCount;
    
    const percentage = gameState.totalCount > 0 
        ? (gameState.correctCount / gameState.totalCount) * 100 
        : 0;
    progressBarEl.style.width = `${percentage}%`;
}

/**
 * Move to the next problem
 */
function nextProblem() {
    const problem = generateProblem();
    displayProblem(problem);
    answerDisplayEl.style.color = '#6c63ff';
}

/**
 * Update visual helper to show objects representing the numbers
 */
function updateVisualHelper(problem, showAnswer) {
    visualHelperEl.innerHTML = '';
    
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    
    // Create first group of items
    const group1 = document.createElement('div');
    group1.className = 'visual-group';
    for (let i = 0; i < problem.num1; i++) {
        const item = document.createElement('span');
        item.className = 'visual-item';
        item.textContent = emoji;
        item.style.animationDelay = `${i * 0.1}s`;
        group1.appendChild(item);
    }
    
    // Create operator
    const operatorSpan = document.createElement('span');
    operatorSpan.className = 'visual-operator';
    operatorSpan.textContent = problem.operator;
    
    // Create second group of items
    const group2 = document.createElement('div');
    group2.className = 'visual-group';
    for (let i = 0; i < problem.num2; i++) {
        const item = document.createElement('span');
        item.className = 'visual-item';
        item.textContent = emoji;
        item.style.animationDelay = `${(problem.num1 + i) * 0.1}s`;
        if (problem.operator === '-') {
            item.style.opacity = '0.5';
            item.style.textDecoration = 'line-through';
        }
        group2.appendChild(item);
    }
    
    visualHelperEl.appendChild(group1);
    visualHelperEl.appendChild(operatorSpan);
    visualHelperEl.appendChild(group2);
    
    if (showAnswer) {
        // Show equals and result
        const equalsSpan = document.createElement('span');
        equalsSpan.className = 'visual-operator';
        equalsSpan.textContent = '=';
        
        const resultGroup = document.createElement('div');
        resultGroup.className = 'visual-group';
        for (let i = 0; i < problem.answer; i++) {
            const item = document.createElement('span');
            item.className = 'visual-item';
            item.textContent = emoji;
            resultGroup.appendChild(item);
        }
        
        visualHelperEl.appendChild(equalsSpan);
        visualHelperEl.appendChild(resultGroup);
    }
}

/**
 * Create confetti celebration
 */
function createConfetti() {
    const colors = ['#ff6b6b', '#ffd93d', '#6c63ff', '#4fc3f7', '#66bb6a', '#ff9ff3'];
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = `${Math.random() * 100}%`;
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = `${Math.random() * 0.5}s`;
        confetti.style.animationDuration = `${2 + Math.random() * 2}s`;
        celebrationEl.appendChild(confetti);
        
        // Remove confetti after animation
        setTimeout(() => {
            confetti.remove();
        }, 4000);
    }
}

/**
 * Toggle help display
 */
function toggleHelp() {
    gameState.showingHelp = !gameState.showingHelp;
    
    if (gameState.showingHelp) {
        updateVisualHelper(gameState.currentProblem, true);
        helpBtnEl.textContent = '🙈 Hide Help';
    } else {
        updateVisualHelper(gameState.currentProblem, false);
        helpBtnEl.textContent = '🤔 Need Help?';
    }
}

/**
 * Change game mode
 */
function changeMode(mode) {
    gameState.mode = mode;
    
    // Update button states
    modeBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.mode === mode) {
            btn.classList.add('active');
        }
    });
    
    // Generate new problem for new mode
    nextProblem();
}

/**
 * Initialize the game
 */
function init() {
    // Set up mode button listeners
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => changeMode(btn.dataset.mode));
    });
    
    // Set up help button listener
    helpBtnEl.addEventListener('click', toggleHelp);
    
    // Start with first problem
    nextProblem();
}

// Start the game when page loads
document.addEventListener('DOMContentLoaded', init);
