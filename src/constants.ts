export const WORDS = [
  'REACT', 'VITE', 'STUDIO', 'MODERN', 'DESIGN', 'SLEEK', 'PIXEL', 'GAMES', 'WORLD', 'WORDS',
  'LIGHT', 'NIGHT', 'DREAM', 'SPACE', 'CLOUD', 'BRAIN', 'HEART', 'SMART', 'CLEAN', 'FRESH',
  'BRIGHT', 'SHARP', 'QUICK', 'SOUND', 'VOICE', 'MUSIC', 'DANCE', 'HAPPY', 'PEACE', 'POWER',
  'FOCUS', 'LEVEL', 'STAGE', 'POINT', 'SCORE', 'MATCH', 'START', 'FINISH', 'READY', 'STEADY',
  'FLIGHT', 'GROUND', 'OCEAN', 'RIVER', 'MOUNTAIN', 'VALLEY', 'FOREST', 'DESERT', 'ISLAND', 'COAST'
].map(w => w.toUpperCase()).filter(w => w.length === 5);

export const MAX_GUESSES = 6;
export const WORD_LENGTH = 5;

export const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
];
