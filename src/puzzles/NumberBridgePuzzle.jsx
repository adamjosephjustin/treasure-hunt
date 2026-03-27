import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sparkles from '../components/Sparkles';
import { audioManager } from '../utils/audio';
import '../styles/Puzzle.css';
import '../styles/Sparkles.css';

const puzzles = [
  { sequence: [2, 4, '?', 8], answer: 6, choices: [4, 6, 7, 8], diff: 1 },
  { sequence: [3, 6, '?', 12], answer: 9, choices: [8, 9, 10, 11], diff: 2 },
  { sequence: [1, 3, 5, '?'], answer: 7, choices: [6, 7, 8, 9], diff: 1 },
  { sequence: [5, 10, '?', 20], answer: 15, choices: [12, 15, 18, 20], diff: 2 },
  { sequence: [100, 200, '?', 400], answer: 300, choices: [250, 300, 350, 400], diff: 3 },
  { sequence: [2, 6, 18, '?'], answer: 54, choices: [36, 48, 54, 64], diff: 3 },
];

export default function NumberBridgePuzzle({ onComplete, difficulty = 1 }) {
  // Filter puzzles based on difficulty
  const availablePuzzles = puzzles.filter(p => p.diff <= difficulty);
  const [puzzleIdx] = useState(() => Math.floor(Math.random() * availablePuzzles.length));
  const puzzle = availablePuzzles[puzzleIdx];
  
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [fails, setFails] = useState(0);

  const handleChoice = (value) => {
    if (feedback === 'correct') return;
    setSelected(value);

    if (value === puzzle.answer) {
      audioManager.playSFX('correct');
      setFeedback('correct');
      
      // Calculate stars based on fails: 0 fails = 3 stars, 1-2 = 2 stars, 3+ = 1 star
      const stars = Math.max(1, 3 - Math.floor(fails / 2));
      setTimeout(() => onComplete?.(stars), 2000);
    } else {
      audioManager.playSFX('wrong');
      setFeedback('wrong');
      setFails(f => f + 1);
      setTimeout(() => {
        setFeedback(null);
        setSelected(null);
      }, 900);
    }
  };

  return (
    <motion.div 
      className={`puzzle puzzle--number ${feedback ? `puzzle--${feedback}` : ''}`} 
      id="number-puzzle"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <h2 className="puzzle__title">🌉 Number Bridge</h2>
      <p className="puzzle__instruction">Find the missing number! (Difficulty: {difficulty})</p>

      <div className="number__sequence">
        {puzzle.sequence.map((val, i) => (
          <motion.span
            key={i}
            className={`number__item ${val === '?' ? 'number__item--missing' : ''}`}
            animate={val === '?' && feedback === 'correct' ? { scale: [1, 1.2, 1], color: '#34d399' } : {}}
          >
            {val === '?' && feedback === 'correct' ? puzzle.answer : val}
          </motion.span>
        ))}
      </div>

      <div className="number__choices">
        {puzzle.choices.map((val) => (
          <motion.button
            key={val}
            className={`number__choice ${
              selected === val
                ? val === puzzle.answer
                  ? 'number__choice--correct'
                  : 'number__choice--wrong'
                : ''
            }`}
            onClick={() => {
              audioManager.playSFX('click');
              handleChoice(val);
            }}
            id={`choice-${val}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {val}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {feedback === 'correct' && (
          <motion.div 
            className="puzzle__feedback puzzle__feedback--correct"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            ✨ Brilliant!
            <Sparkles count={20} />
          </motion.div>
        )}
        {feedback === 'wrong' && (
          <motion.div 
            className="puzzle__feedback puzzle__feedback--wrong"
            initial={{ x: [-10, 10, -10, 10, 0] }}
            transition={{ duration: 0.4 }}
          >
            💫 Not quite, try again!
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
