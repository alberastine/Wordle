import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Grid } from './components/Grid';
import { Keyboard } from './components/Keyboard';
import { SettingsModal } from './components/SettingsModal';
import { WORDS, MAX_GUESSES, WORD_LENGTH } from './constants';
import { GameStatus, GuessLetter, LetterStatus } from './types';
import { RefreshCw, Trophy, XCircle, Info, Settings2, ChevronRight, Sun, Moon } from 'lucide-react';

export default function App() {
  const [customWords, setCustomWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [maxAttempts, setMaxAttempts] = useState(MAX_GUESSES);
  const [wordLength, setWordLength] = useState(WORD_LENGTH);
  
  const [targetWord, setTargetWord] = useState('');
  const [guesses, setGuesses] = useState<GuessLetter[][]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [currentRow, setCurrentRow] = useState(0);
  const [status, setStatus] = useState<GameStatus>('playing');
  const [letterStatuses, setLetterStatuses] = useState<Record<string, LetterStatus>>({});
  const [showModal, setShowModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [message, setMessage] = useState('');

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('wordle-theme');
      return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('wordle-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('wordle-theme', 'light');
    }
  }, [isDarkMode]);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const initGame = useCallback((isNextWord = false, newCustomWords?: string[], newMaxAttempts?: number) => {
    let wordsToUse = newCustomWords !== undefined ? newCustomWords : customWords;
    const attemptsToUse = newMaxAttempts !== undefined ? newMaxAttempts : maxAttempts;
    
    let word = '';
    let nextIndex = currentWordIndex;

    if (wordsToUse.length > 0) {
      if (isNextWord) {
        nextIndex = (currentWordIndex + 1) % wordsToUse.length;
      } else if (newCustomWords !== undefined) {
        nextIndex = 0;
      }
      // If we've reached the end and calling initGame() normally (not isNextWord), 
      // it might mean a full restart is requested.
      
      setCurrentWordIndex(nextIndex);
      word = wordsToUse[nextIndex] || wordsToUse[0];
    } else {
      const lengthToUse = WORD_LENGTH;
      const filteredWords = WORDS.filter(w => w.length === lengthToUse);
      word = filteredWords[Math.floor(Math.random() * filteredWords.length)];
    }

    const upperWord = word.toUpperCase();
    setTargetWord(upperWord);
    setWordLength(upperWord.length);
    
    // Pre-fill dashes if any
    let initialGuess = '';
    while (initialGuess.length < upperWord.length && upperWord[initialGuess.length] === '-') {
      initialGuess += '-';
    }
    
    setGuesses([]);
    setCurrentGuess(initialGuess);
    setCurrentRow(0);
    setStatus('playing');
    setLetterStatuses({});
    setShowModal(false);
    setMessage('');
    if (newMaxAttempts !== undefined) setMaxAttempts(newMaxAttempts);
    if (newCustomWords !== undefined) setCustomWords(newCustomWords);
  }, [customWords, currentWordIndex, maxAttempts]);

  useEffect(() => {
    initGame();
  }, []); // Only run once on mount

  const onChar = useCallback((char: string) => {
    if (status !== 'playing' || currentGuess.length >= wordLength) return;
    
    const charToUse = char.toUpperCase();
    let nextGuess = currentGuess + charToUse;
    
    // Auto-fill following dashes
    while (nextGuess.length < wordLength && targetWord[nextGuess.length] === '-') {
      nextGuess += '-';
    }
    
    setCurrentGuess(nextGuess);
  }, [currentGuess, status, wordLength, targetWord]);

  const onDelete = useCallback(() => {
    if (status !== 'playing' || currentGuess.length === 0) return;
    
    let nextGuess = currentGuess.slice(0, -1);
    
    // If we just deleted a character and now the end is a dash, it means it was an auto-filled dash
    while (nextGuess.length > 0 && targetWord[nextGuess.length - 1] === '-') {
      nextGuess = nextGuess.slice(0, -1);
    }
    
    setCurrentGuess(nextGuess);
  }, [currentGuess, status, targetWord]);

  const onEnter = useCallback(() => {
    if (status !== 'playing') return;
    if (currentGuess.length !== wordLength) {
      showMessage('Not enough letters');
      return;
    }

    // Evaluate guess
    const targetChars = targetWord.split('');
    const guessChars = currentGuess.split('');
    const newLetterStatuses = { ...letterStatuses };

    // First pass: Correct positions
    const usedIndices = new Set<number>();
    const result = Array(wordLength).fill('absent') as LetterStatus[];

    guessChars.forEach((char, i) => {
      if (char === targetChars[i]) {
        result[i] = 'correct';
        usedIndices.add(i);
        newLetterStatuses[char] = 'correct';
      }
    });

    // Second pass: Present but wrong position
    guessChars.forEach((char, i) => {
      if (result[i] === 'correct' || char === '-') return;

      const targetIndex = targetChars.findIndex((tc, idx) => tc === char && !usedIndices.has(idx));
      if (targetIndex !== -1) {
        result[i] = 'present';
        usedIndices.add(targetIndex);
        if (newLetterStatuses[char] !== 'correct') {
          newLetterStatuses[char] = 'present';
        }
      } else {
        if (!newLetterStatuses[char]) {
          newLetterStatuses[char] = 'absent';
        }
      }
    });

    const guessWithStatus: GuessLetter[] = guessChars.map((char, i) => ({
      char,
      status: result[i]
    }));

    const newGuesses = [...guesses, guessWithStatus];
    setGuesses(newGuesses);
    setLetterStatuses(newLetterStatuses);
    setCurrentGuess('');
    setCurrentRow(prev => prev + 1);

    if (currentGuess === targetWord) {
      setStatus('won');
      setTimeout(() => setShowModal(true), 1500);
    } else if (newGuesses.length >= maxAttempts) {
      setStatus('lost');
      setTimeout(() => setShowModal(true), 1500);
    }
  }, [currentGuess, guesses, letterStatuses, status, targetWord, maxAttempts, wordLength]);

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 2000);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      
      if (e.key === 'Enter') {
        onEnter();
      } else if (e.key === 'Backspace') {
        onDelete();
      } else if (e.key === ' ') {
        onChar('-');
      } else if (/^[a-zA-Z-]$/.test(e.key)) {
        onChar(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onChar, onDelete, onEnter]);

  const handleSaveSettings = (words: string[], attempts: number) => {
    const shuffled = shuffleArray(words);
    initGame(false, shuffled, attempts);
  };

  const isCustomMode = customWords.length > 0;
  const hasMoreWords = isCustomMode && currentWordIndex < customWords.length - 1;

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 transition-colors duration-200">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 transition-colors duration-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-zinc-900 dark:bg-zinc-100 rounded flex items-center justify-center text-white dark:text-zinc-900 font-bold transition-colors">W</div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 transition-colors">SHAINA'S WORDLE</h1>
          {isCustomMode && (
            <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-[10px] font-bold px-2 py-0.5 rounded-full ml-2 transition-colors">
              CUSTOM {currentWordIndex + 1}/{customWords.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
            title="Toggle Theme"
          >
            {isDarkMode ? <Sun size={20} className="text-zinc-600 dark:text-zinc-400" /> : <Moon size={20} className="text-zinc-600 dark:text-zinc-400" />}
          </button>
          <button 
            onClick={() => initGame()}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
            title="Restart Current Word"
          >
            <RefreshCw size={20} className="text-zinc-600 dark:text-zinc-400" />
          </button>
          <button 
            onClick={() => setShowSettings(true)}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
            title="Settings"
          >
            <Settings2 size={20} className="text-zinc-600 dark:text-zinc-400" />
          </button>
          <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
            <Info size={20} className="text-zinc-600 dark:text-zinc-400" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center py-4 sm:py-8 overflow-y-auto">
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-20 z-50 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 rounded shadow-lg font-medium text-sm transition-colors"
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>

        <Grid 
          guesses={guesses} 
          currentGuess={currentGuess} 
          currentRow={currentRow} 
          maxGuesses={maxAttempts}
          wordLength={wordLength}
          targetWord={targetWord}
        />
      </main>

      {/* Keyboard */}
      <Keyboard 
        onChar={onChar} 
        onDelete={onDelete} 
        onEnter={onEnter} 
        letterStatuses={letterStatuses} 
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSave={handleSaveSettings}
        initialWords={customWords}
        initialAttempts={maxAttempts}
      />

      {/* Game Over Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center border border-zinc-100 dark:border-zinc-800 transition-colors"
            >
              <div className="flex justify-center mb-4">
                {status === 'won' ? (
                  <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 transition-colors">
                    <Trophy size={32} />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/40 rounded-full flex items-center justify-center text-rose-600 dark:text-rose-400 transition-colors">
                    <XCircle size={32} />
                  </div>
                )}
              </div>

              <h2 className="text-2xl font-bold mb-2 text-zinc-900 dark:text-zinc-100 transition-colors">
                {status === 'won' ? 'Magnificent!' : 'Game Over'}
              </h2>
              
              <p className="text-zinc-500 dark:text-zinc-400 mb-6 transition-colors">
                {status === 'won' 
                  ? `You guessed the word in ${guesses.length} ${guesses.length === 1 ? 'try' : 'tries'}!` 
                  : `The word was ${targetWord}. Better luck next time!`}
              </p>

              <div className="flex flex-col gap-3">
                {status === 'won' && hasMoreWords && (
                  <button
                    onClick={() => initGame(true)}
                    className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                  >
                    Next Word
                    <ChevronRight size={18} />
                  </button>
                )}

                {status === 'lost' && hasMoreWords && (
                  <>
                    <button
                      onClick={() => initGame()}
                      className="w-full py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <RefreshCw size={18} />
                      Try Again
                    </button>
                    <button
                      onClick={() => initGame(true)}
                      className="w-full py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-xl font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
                    >
                      Skip to Next
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}

                {((status === 'won' && !hasMoreWords) || (status === 'lost' && !hasMoreWords)) && (
                  <button
                    onClick={() => {
                      if (isCustomMode) {
                        // Restart the whole shuffled list
                        const reshuffled = shuffleArray(customWords);
                        initGame(false, reshuffled);
                      } else {
                        initGame();
                      }
                    }}
                    className="w-full py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={18} />
                    {isCustomMode ? 'Restart List' : 'Play Again'}
                  </button>
                )}
                
                {isCustomMode && (
                  <button
                    onClick={() => {
                      setCustomWords([]);
                      initGame(false, []);
                    }}
                    className="text-xs font-bold text-zinc-400 hover:text-zinc-600 transition-colors uppercase tracking-widest mt-2"
                  >
                    Return to Standard Mode
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer / Stats */}
      <footer className="py-4 text-center text-xs text-zinc-400 uppercase tracking-widest font-medium">
        Modern Wordle v1.1
      </footer>
    </div>
  );
}
