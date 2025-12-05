# 🐝 Spelling Bee Game

A fun, web-based spelling bee game that reads words aloud and challenges players to spell them correctly.

## Features

- **Text-to-Speech**: Words are read aloud using the Web Speech API
- **Three Difficulty Levels**: Easy, Medium, and Hard word lists
- **Progressive Hints**: Get hints about word length, first letter, last letter, and partial spelling
- **Score Tracking**: Earn points based on difficulty and streak bonuses
- **Streak System**: Build up streaks for bonus points
- **History Panel**: See your recent attempts at a glance

## How to Play

1. **Open the game** in a modern web browser (Chrome, Firefox, Safari, or Edge recommended)
2. **Listen to the word** by clicking the "🔊 Play Word" button
3. **Type your spelling** in the input field
4. **Submit your answer** by clicking "Check" or pressing Enter
5. **Use hints** if you need help (each hint reduces potential points)
6. **Build streaks** for bonus points!

## Scoring

- **Easy words**: 10 base points
- **Medium words**: 25 base points  
- **Hard words**: 50 base points

### Bonuses & Penalties
- Each hint used: -5 points (minimum 5 points)
- 3+ streak: 1.25x multiplier
- 5+ streak: 1.5x multiplier

## Getting Started

Simply open `index.html` in your web browser. No server or installation required!

```bash
# Using a simple HTTP server (optional)
python -m http.server 8000
# Then open http://localhost:8000
```

Or just double-click the `index.html` file to open it directly in your browser.

## Browser Compatibility

This game uses the Web Speech API for text-to-speech functionality. It works best on:
- Google Chrome
- Microsoft Edge
- Safari
- Firefox

## Files

- `index.html` - Main HTML structure
- `styles.css` - Styling and responsive design
- `game.js` - Game logic and text-to-speech functionality

## License

MIT License - Feel free to use and modify!
