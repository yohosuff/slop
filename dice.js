/**
 * Dice Rolling Utility
 * A simple web-based dice roller with history tracking
 */

/**
 * Rolls a single die with the specified number of sides
 * @param {number} sides - The number of sides on the die
 * @returns {number} A random number between 1 and sides (inclusive)
 */
function rollDie(sides) {
    return Math.floor(Math.random() * sides) + 1;
}

/**
 * Rolls multiple dice and returns the results
 * @param {number} count - The number of dice to roll
 * @param {number} sides - The number of sides per die
 * @returns {number[]} An array of roll results
 */
function rollDice(count, sides) {
    const results = [];
    for (let i = 0; i < count; i++) {
        results.push(rollDie(sides));
    }
    return results;
}

/**
 * Calculates the sum of an array of numbers
 * @param {number[]} values - The array of numbers to sum
 * @returns {number} The total sum
 */
function calculateTotal(values) {
    return values.reduce((sum, value) => sum + value, 0);
}

/**
 * Displays the dice roll results on the page
 * @param {number[]} results - The array of roll results
 * @param {number} sides - The number of sides per die (for display)
 */
function displayResults(results, sides) {
    const diceContainer = document.getElementById('dice-container');
    const totalElement = document.getElementById('total');
    
    // Clear previous results
    diceContainer.innerHTML = '';
    
    // Create a die element for each result
    results.forEach((result, index) => {
        const die = document.createElement('div');
        die.className = 'die';
        die.textContent = result;
        die.style.animationDelay = `${index * 0.1}s`;
        diceContainer.appendChild(die);
    });
    
    // Display the total
    const total = calculateTotal(results);
    totalElement.textContent = `Total: ${total}`;
}

/**
 * Adds a roll to the history list
 * @param {number} count - Number of dice rolled
 * @param {number} sides - Number of sides per die
 * @param {number[]} results - The roll results
 * @param {number} total - The total of all rolls
 */
function addToHistory(count, sides, results, total) {
    const historyList = document.getElementById('history-list');
    const listItem = document.createElement('li');
    
    const timestamp = new Date().toLocaleTimeString();
    listItem.textContent = `${timestamp} - ${count}d${sides}: [${results.join(', ')}] = ${total}`;
    
    // Add new item at the top
    historyList.insertBefore(listItem, historyList.firstChild);
    
    // Keep only the last 10 rolls
    while (historyList.children.length > 10) {
        historyList.removeChild(historyList.lastChild);
    }
}

/**
 * Handles the roll button click event
 */
function handleRoll() {
    const countInput = document.getElementById('dice-count');
    const sidesSelect = document.getElementById('dice-sides');
    
    const count = Math.min(Math.max(parseInt(countInput.value) || 1, 1), 10);
    const sides = parseInt(sidesSelect.value);
    
    // Update input to show clamped value
    countInput.value = count;
    
    // Roll the dice
    const results = rollDice(count, sides);
    const total = calculateTotal(results);
    
    // Display results
    displayResults(results, sides);
    
    // Add to history
    addToHistory(count, sides, results, total);
}

// Initialize event listeners when the DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    const rollButton = document.getElementById('roll-btn');
    rollButton.addEventListener('click', handleRoll);
    
    // Allow pressing Enter to roll
    document.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            handleRoll();
        }
    });
});
