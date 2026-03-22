import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Plus, Trash2, Settings2 } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (words: string[], attempts: number) => void;
  initialWords: string[];
  initialAttempts: number;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialWords,
  initialAttempts,
}) => {
  const [words, setWords] = useState<string[]>(initialWords.length > 0 ? initialWords : ['']);
  const [attempts, setAttempts] = useState(initialAttempts);

  if (!isOpen) return null;

  const handleAddWord = () => {
    setWords([...words, '']);
  };

  const handleRemoveWord = (index: number) => {
    const newWords = words.filter((_, i) => i !== index);
    setWords(newWords.length > 0 ? newWords : ['']);
  };

  const handleWordChange = (index: number, value: string) => {
    const newWords = [...words];
    // Allow spaces and convert to dash, remove other non-alpha
    newWords[index] = value.toUpperCase().replace(/ /g, '-').replace(/[^A-Z-]/g, '').slice(0, 15);
    setWords(newWords);
  };

  const handleSave = () => {
    const validWords = words.filter(w => w.length >= 3);
    if (validWords.length === 0) {
      alert(`Please add at least one word (min 3 letters).`);
      return;
    }
    onSave(validWords, attempts);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] border border-transparent dark:border-zinc-800"
      >
        <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Settings2 size={20} className="text-zinc-900 dark:text-zinc-100" />
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Custom Game Settings</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
            <X size={20} className="text-zinc-400" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <section>
            <label className="block text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2 uppercase tracking-wider">
              Attempts Allowed ({attempts})
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={attempts}
              onChange={(e) => setAttempts(parseInt(e.target.value))}
              className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-zinc-900 dark:accent-zinc-100"
            />
            <div className="flex justify-between text-[10px] text-zinc-400 mt-1 font-bold">
              <span>1 ATTEMPT</span>
              <span>10 ATTEMPTS</span>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                Custom Words / Phrases
              </label>
              <button
                onClick={handleAddWord}
                className="text-xs font-bold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-2 py-1 rounded flex items-center gap-1 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
              >
                <Plus size={14} /> ADD
              </button>
            </div>
            <div className="space-y-2">
              {words.map((word, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={word}
                    onChange={(e) => handleWordChange(index, e.target.value)}
                    placeholder="MY WORD"
                    className="flex-1 border-2 border-zinc-100 dark:border-zinc-700 bg-transparent dark:text-white rounded-lg px-3 py-2 font-mono font-bold focus:border-zinc-900 dark:focus:border-zinc-500 outline-none transition-colors"
                  />
                  <button
                    onClick={() => handleRemoveWord(index)}
                    className="p-2 text-zinc-400 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-zinc-400 mt-2 font-medium italic">
              * Spaces will be converted to dashes (-)
            </p>
          </section>
        </div>

        <div className="p-6 border-t border-zinc-100 dark:border-zinc-800">
          <button
            onClick={handleSave}
            className="w-full py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            Save & Start Custom Game
          </button>
          <p className="text-[10px] text-center text-zinc-400 mt-4 font-bold uppercase tracking-widest">
            Leave words empty to use standard word list
          </p>
        </div>
      </motion.div>
    </div>
  );
};
