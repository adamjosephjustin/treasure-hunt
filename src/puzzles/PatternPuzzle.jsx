import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sparkles from '../components/Sparkles';
import { audioManager } from '../utils/audio';
import '../styles/Puzzle.css';

const PATTERNS = [
  { seq: ['🌙', '⭐', '☀️', '🌙', '⭐', '?'], answer: '☀️', choices: ['🌙', '⭐', '☀️', '☁️'], diff: 1 },
  { seq: ['🔥', '💧', '🌿', '🔥', '💧', '?'], answer: '🌿', choices: ['🔥', '💧', '🌿', '❄️'], diff: 1 },
  { seq: ['🟣', '🟦', '🟣', '🟦', '🟣', '?'], answer: '🟦', choices: ['🟣', '🟦', '🟨', '🟢'], diff: 2 },
  { seq: ['🔺', '🔺', '🔵', '🔺', '🔺', '?'], answer: '🔵', choices: ['🔺', '🔵', '🟩', '⭐'], diff: 2 },
  { seq: ['⭐', '🌙', '🌙', '⭐', '🌙', '?'], answer: '🌙', choices: ['⭐', '🌙', '☀️', '☁️'], diff: 3 },
  { seq: ['⬆️', '➡️', '⬇️', '⬅️', '⬆️', '?'], answer: '➡️', choices: ['⬆️', '⬇️', '⬅️', '➡️'], diff: 3 },
];

export default function PatternPuzzle({ onComplete, difficulty = 1 }) {
  const available = PATTERNS.filter(p => p.diff <= Math.max(1, Math.min(3, difficulty)));
  const [puzzle] = useState(() => available[Math.floor(Math.random() * available.length)]);
  
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [fails, setFails] = useState(0);

  const handleChoice = (val) => {
    if (feedback === 'correct') return;
    setSelected(val);

    if (val === puzzle.answer) {
      audioManager.playSFX('correct');
      setFeedback('correct');
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
      className={`puzzle puzzle--pattern ${feedback ? `puzzle--${feedback}` : ''}`} 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <h2 className="puzzle__title">📜 Rune Sequences</h2>
      <p className="puzzle__instruction">Predict the next magical rune in the pattern!</p>

      <div className="pattern__sequence">
        {puzzle.seq.map((sym, i) => (
          <motion.div
            key={i}
            className={`pattern__item ${sym === '?' ? 'pattern__item--missing' : ''}`}
            animate={sym === '?' && feedback === 'correct' ? { scale: [1, 1.2, 1] } : {}}
          >
            {sym === '?' && feedback === 'correct' ? puzzle.answer : sym}
          </motion.div>
        ))}
      </div>

      <div className="pattern__choices">
        {puzzle.choices.map((val, i) => (
          <motion.button
            key={i}
            className={`pattern__choice ${
              selected === val
                ? val === puzzle.answer
                  ? 'pattern__choice--correct'
                  : 'pattern__choice--wrong'
                : ''
            }`}
            onClick={() => {
              audioManager.playSFX('click');
              handleChoice(val);
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {val}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {feedback === 'correct' && (
          <motion.div className="puzzle__feedback puzzle__feedback--correct" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            ✨ Perfect Pattern!
            <Sparkles count={20} />
          </motion.div>
        )}
        {feedback === 'wrong' && (
          <motion.div className="puzzle__feedback puzzle__feedback--wrong" initial={{ x: [-10, 10, -10, 10, 0] }} transition={{ duration: 0.4 }}>
            💫 That breaks the magic, try again!
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
