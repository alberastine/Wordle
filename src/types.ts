export type LetterStatus = 'correct' | 'present' | 'absent' | 'empty' | 'tbd';

export interface GuessLetter {
  char: string;
  status: LetterStatus;
}

export type GameStatus = 'playing' | 'won' | 'lost';

export interface GameState {
  guesses: GuessLetter[][];
  currentGuess: string;
  targetWord: string;
  status: GameStatus;
  currentRow: number;
}
