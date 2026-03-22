import React from 'react';
import { KEYBOARD_ROWS } from '../constants';
import { LetterStatus } from '../types';
import { Delete, CornerDownLeft } from 'lucide-react';

interface KeyboardProps {
  onChar: (char: string) => void;
  onDelete: () => void;
  onEnter: () => void;
  letterStatuses: Record<string, LetterStatus>;
}

export const Keyboard: React.FC<KeyboardProps> = ({ onChar, onDelete, onEnter, letterStatuses }) => {
  const getKeyClasses = (key: string) => {
    const status = letterStatuses[key];
    const base = "flex items-center justify-center rounded font-bold cursor-pointer select-none transition-colors duration-100 ";
    
    if (key === 'ENTER' || key === 'BACKSPACE') {
      return base + "px-3 sm:px-4 h-14 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-xs sm:text-sm dark:text-zinc-100";
    }

    switch (status) {
      case 'correct': return base + "w-8 sm:w-10 h-14 bg-correct text-white";
      case 'present': return base + "w-8 sm:w-10 h-14 bg-present text-white";
      case 'absent': return base + "w-8 sm:w-10 h-14 bg-absent dark:bg-zinc-800 text-white dark:text-zinc-300";
      default: return base + "w-8 sm:w-10 h-14 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-100";
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-2 pb-8">
      {KEYBOARD_ROWS.map((row, i) => (
        <div key={i} className="flex justify-center gap-1.5 mb-2">
          {row.map((key) => {
            if (key === 'ENTER') {
              return (
                <button
                  key={key}
                  onClick={onEnter}
                  className={getKeyClasses(key)}
                >
                  <CornerDownLeft size={18} className="mr-1" />
                  ENTER
                </button>
              );
            }
            if (key === 'BACKSPACE') {
              return (
                <button
                  key={key}
                  onClick={onDelete}
                  className={getKeyClasses(key)}
                >
                  <Delete size={20} />
                </button>
              );
            }
            return (
              <button
                key={key}
                onClick={() => onChar(key)}
                className={getKeyClasses(key)}
              >
                {key}
              </button>
            );
          })}
        </div>
      ))}
      <div className="flex justify-center mt-2">
        <button
          onClick={() => onChar('-')}
          className="w-full max-w-[200px] h-12 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded font-bold text-zinc-700 dark:text-zinc-100 transition-colors flex items-center justify-center gap-2 uppercase text-xs tracking-widest"
        >
          Space / Dash
        </button>
      </div>
    </div>
  );
};
