import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GuessLetter, LetterStatus } from '../types';

interface CellProps {
  letter?: string;
  status?: LetterStatus;
  index: number;
  isCurrent?: boolean;
}

const Cell: React.FC<CellProps> = ({ letter, status = 'empty', index, isCurrent }) => {
  const isDash = letter === '-';

  const getStatusClasses = () => {
    if (isDash) return 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-400 dark:text-zinc-500';
    switch (status) {
      case 'correct': return 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20';
      case 'present': return 'bg-amber-400 border-amber-400 text-white shadow-lg shadow-amber-400/20';
      case 'absent': return 'bg-zinc-400 dark:bg-zinc-700 border-zinc-400 dark:border-zinc-700 text-white dark:text-zinc-300';
      case 'tbd': return 'border-zinc-400 dark:border-zinc-500 text-zinc-900 dark:text-zinc-100';
      default: return 'border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100';
    }
  };

  return (
    <motion.div
      initial={false}
      animate={{
        scale: letter ? [1, 1.05, 1] : 1,
        borderColor: letter ? 'var(--color-zinc-400)' : 'var(--color-zinc-200)',
      }}
      transition={{ duration: 0.1 }}
      className={`
        w-12 h-12 sm:w-14 sm:h-14 border-2 flex items-center justify-center 
        text-xl sm:text-2xl font-black uppercase rounded-xl select-none transition-all duration-500
        ${getStatusClasses()}
        ${letter && status === 'empty' && !isDash ? 'border-zinc-400 dark:border-zinc-500 scale-105' : ''}
      `}
    >
      {letter}
    </motion.div>
  );
};

interface GridProps {
  guesses: GuessLetter[][];
  currentGuess: string;
  currentRow: number;
  maxGuesses: number;
  wordLength: number;
  targetWord: string;
}

export const Grid: React.FC<GridProps> = ({ guesses, currentGuess, currentRow, maxGuesses, wordLength, targetWord }) => {
  const rows = Array.from({ length: maxGuesses });

  return (
    <div 
      className="grid gap-1.5 p-2 mx-auto"
      style={{ 
        gridTemplateRows: `repeat(${maxGuesses}, minmax(0, 1fr))`,
        width: 'fit-content'
      }}
    >
      {rows.map((_, i) => {
        if (i === currentRow) {
          return (
            <div 
              key={i} 
              className="grid gap-1.5"
              style={{ gridTemplateColumns: `repeat(${wordLength}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: wordLength }).map((_, j) => {
                const isTargetDash = targetWord[j] === '-';
                return <Cell key={j} letter={currentGuess[j] || (isTargetDash ? '-' : undefined)} index={j} isCurrent />;
              })}
            </div>
          );
        }

        const guess = guesses[i];
        if (guess) {
          return (
            <div 
              key={i} 
              className="grid gap-1.5"
              style={{ gridTemplateColumns: `repeat(${wordLength}, minmax(0, 1fr))` }}
            >
              {guess.map((l, j) => (
                <Cell key={j} letter={l.char} status={l.status} index={j} />
              ))}
            </div>
          );
        }

        return (
          <div 
            key={i} 
            className="grid gap-1.5"
            style={{ gridTemplateColumns: `repeat(${wordLength}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: wordLength }).map((_, j) => {
              const isTargetDash = targetWord[j] === '-';
              return <Cell key={j} letter={isTargetDash ? '-' : undefined} index={j} />;
            })}
          </div>
        );
      })}
    </div>
  );
};
