// Word lists organized by difficulty
const wordLists = {
    easy: [
        'cat', 'dog', 'sun', 'run', 'big', 'red', 'bed', 'cup', 'hat', 'map',
        'pen', 'top', 'box', 'fox', 'bus', 'hug', 'bug', 'rug', 'mug', 'jug',
        'bat', 'rat', 'sat', 'mat', 'pat', 'fan', 'can', 'man', 'pan', 'van',
        'leg', 'egg', 'beg', 'peg', 'hen', 'ten', 'men', 'den', 'wet', 'pet',
        'sit', 'hit', 'bit', 'fit', 'kit', 'pig', 'wig', 'dig', 'fig', 'jig'
    ],
    medium: [
        'apple', 'happy', 'sunny', 'funny', 'bunny', 'honey', 'money', 'candy',
        'puppy', 'kitty', 'party', 'sorry', 'story', 'glory', 'worry', 'hurry',
        'carry', 'marry', 'berry', 'cherry', 'merry', 'ferry', 'jelly', 'belly',
        'hello', 'yellow', 'fellow', 'pillow', 'window', 'shadow', 'meadow',
        'garden', 'market', 'basket', 'pocket', 'rocket', 'ticket', 'jacket',
        'planet', 'magnet', 'carpet', 'puppet', 'rabbit', 'carrot', 'parrot',
        'butter', 'better', 'letter', 'matter', 'bitter', 'litter', 'kitten',
        'mitten', 'button', 'cotton', 'ribbon', 'lesson', 'blossom', 'possum',
        'friend', 'school', 'beautiful', 'together', 'important', 'different'
    ],
    hard: [
        'necessary', 'accommodate', 'occurrence', 'millennium', 'committee',
        'embarrass', 'harassment', 'definitely', 'occasionally', 'consensus',
        'conscience', 'conscientious', 'entrepreneur', 'maintenance', 'privilege',
        'restaurant', 'questionnaire', 'recommend', 'separate', 'calendar',
        'cemetery', 'category', 'rhythm', 'mischievous', 'fluorescent',
        'hierarchy', 'guarantee', 'lieutenant', 'parliament', 'tyranny',
        'vacuum', 'occurred', 'referring', 'preferred', 'beginning',
        'disappoint', 'disappear', 'dissatisfied', 'misspell', 'unnecessary',
        'accessories', 'accidentally', 'acknowledgment', 'acquaintance', 'amateur',
        'apparent', 'argument', 'atheist', 'believe', 'bizarre',
        'broccoli', 'bureaucracy', 'camouflage', 'Caribbean', 'chauffeur'
    ]
};

// Game state
let currentWord = '';
let score = 0;
let streak = 0;
let wordNumber = 1;
let hintsUsed = 0;
let history = [];

// DOM elements
const speakBtn = document.getElementById('speakBtn');
const hintBtn = document.getElementById('hintBtn');
const hintText = document.getElementById('hint');
const spellingInput = document.getElementById('spellingInput');
const submitBtn = document.getElementById('submitBtn');
const feedback = document.getElementById('feedback');
const scoreDisplay = document.getElementById('score');
const streakDisplay = document.getElementById('streak');
const wordNumberDisplay = document.getElementById('wordNumber');
const difficultySelect = document.getElementById('difficulty');
const skipBtn = document.getElementById('skipBtn');
const newGameBtn = document.getElementById('newGameBtn');
const historyList = document.getElementById('historyList');

// Initialize the game
function init() {
    loadNewWord();
    bindEvents();
}

// Bind event listeners
function bindEvents() {
    speakBtn.addEventListener('click', speakCurrentWord);
    hintBtn.addEventListener('click', showHint);
    submitBtn.addEventListener('click', checkSpelling);
    spellingInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkSpelling();
        }
    });
    difficultySelect.addEventListener('change', () => {
        resetGame();
    });
    skipBtn.addEventListener('click', skipWord);
    newGameBtn.addEventListener('click', resetGame);
}

// Load a new word
function loadNewWord() {
    const difficulty = difficultySelect.value;
    const words = wordLists[difficulty];
    
    // Get a random word that hasn't been used recently
    let newWord;
    do {
        newWord = words[Math.floor(Math.random() * words.length)];
    } while (newWord === currentWord && words.length > 1);
    
    currentWord = newWord;
    hintsUsed = 0;
    hintText.textContent = '';
    spellingInput.value = '';
    feedback.textContent = '';
    feedback.className = 'feedback';
    
    // Auto-speak the word after a brief delay
    setTimeout(() => {
        speakCurrentWord();
    }, 300);
}

// Speak the current word using Text-to-Speech
function speakCurrentWord() {
    if ('speechSynthesis' in window) {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(currentWord);
        utterance.rate = 0.8; // Slightly slower for clarity
        utterance.pitch = 1;
        utterance.volume = 1;
        
        // Try to use a clear English voice
        const voices = window.speechSynthesis.getVoices();
        const englishVoice = voices.find(voice => 
            voice.lang.startsWith('en') && voice.name.includes('Female')
        ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];
        
        if (englishVoice) {
            utterance.voice = englishVoice;
        }
        
        window.speechSynthesis.speak(utterance);
        
        // Visual feedback that the word is being spoken
        speakBtn.textContent = '🔊 Speaking...';
        utterance.onend = () => {
            speakBtn.textContent = '🔊 Play Word';
        };
    } else {
        feedback.textContent = 'Text-to-Speech is not supported in your browser.';
        feedback.className = 'feedback incorrect';
    }
}

// Show a hint
function showHint() {
    hintsUsed++;
    
    if (hintsUsed === 1) {
        // First hint: number of letters
        hintText.textContent = `The word has ${currentWord.length} letters.`;
    } else if (hintsUsed === 2) {
        // Second hint: first letter
        hintText.textContent = `It starts with "${currentWord[0].toUpperCase()}" and has ${currentWord.length} letters.`;
    } else if (hintsUsed === 3) {
        // Third hint: first and last letter
        hintText.textContent = `It starts with "${currentWord[0].toUpperCase()}" and ends with "${currentWord[currentWord.length - 1]}" (${currentWord.length} letters).`;
    } else {
        // Fourth hint: partial word
        const revealed = currentWord.substring(0, Math.ceil(currentWord.length / 2));
        const hidden = '_'.repeat(currentWord.length - revealed.length);
        hintText.textContent = `${revealed}${hidden}`;
    }
}

// Check the spelling
function checkSpelling() {
    const userInput = spellingInput.value.trim().toLowerCase();
    
    if (!userInput) {
        feedback.textContent = 'Please type your spelling first!';
        feedback.className = 'feedback incorrect';
        return;
    }
    
    if (userInput === currentWord.toLowerCase()) {
        // Correct!
        const points = calculatePoints();
        score += points;
        streak++;
        
        feedback.textContent = `✓ Correct! +${points} points`;
        feedback.className = 'feedback correct';
        
        addToHistory(currentWord, 'correct', points);
        
        // Move to next word after a brief delay
        wordNumber++;
        updateDisplays();
        
        setTimeout(() => {
            loadNewWord();
        }, 1500);
    } else {
        // Incorrect
        streak = 0;
        
        feedback.textContent = `✗ Not quite. The correct spelling is: ${currentWord}`;
        feedback.className = 'feedback incorrect';
        
        addToHistory(currentWord, 'incorrect');
        
        // Move to next word after showing the correct answer
        wordNumber++;
        updateDisplays();
        
        setTimeout(() => {
            loadNewWord();
        }, 2500);
    }
}

// Calculate points based on difficulty, hints used, and streak
function calculatePoints() {
    let basePoints;
    
    switch (difficultySelect.value) {
        case 'easy':
            basePoints = 10;
            break;
        case 'medium':
            basePoints = 25;
            break;
        case 'hard':
            basePoints = 50;
            break;
        default:
            basePoints = 10;
    }
    
    // Reduce points for hints used
    const hintPenalty = hintsUsed * 5;
    let points = Math.max(basePoints - hintPenalty, 5);
    
    // Bonus for streak
    if (streak >= 5) {
        points = Math.floor(points * 1.5);
    } else if (streak >= 3) {
        points = Math.floor(points * 1.25);
    }
    
    return points;
}

// Update the display values
function updateDisplays() {
    scoreDisplay.textContent = score;
    streakDisplay.textContent = streak;
    wordNumberDisplay.textContent = wordNumber;
}

// Add entry to history
function addToHistory(word, status, points = 0) {
    const entry = { word, status, points };
    history.unshift(entry);
    
    // Keep only last 10 entries
    if (history.length > 10) {
        history.pop();
    }
    
    renderHistory();
}

// Render the history list
function renderHistory() {
    historyList.innerHTML = '';
    
    history.forEach(entry => {
        const li = document.createElement('li');
        li.className = entry.status;
        
        if (entry.status === 'correct') {
            li.textContent = `✓ ${entry.word} (+${entry.points})`;
        } else if (entry.status === 'incorrect') {
            li.textContent = `✗ ${entry.word}`;
        } else {
            li.textContent = `⊘ ${entry.word} (skipped)`;
        }
        
        historyList.appendChild(li);
    });
}

// Skip the current word
function skipWord() {
    streak = 0;
    addToHistory(currentWord, 'skipped');
    
    feedback.textContent = `Skipped. The word was: ${currentWord}`;
    feedback.className = 'feedback';
    
    wordNumber++;
    updateDisplays();
    
    setTimeout(() => {
        loadNewWord();
    }, 1500);
}

// Reset the game
function resetGame() {
    score = 0;
    streak = 0;
    wordNumber = 1;
    history = [];
    historyList.innerHTML = '';
    updateDisplays();
    loadNewWord();
}

// Initialize voices when they're loaded
if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => {
        // Voices are now loaded
    };
}

// Start the game when the page loads
document.addEventListener('DOMContentLoaded', init);
