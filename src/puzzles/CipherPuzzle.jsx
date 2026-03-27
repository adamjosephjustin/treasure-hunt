import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sparkles from '../components/Sparkles';
import { audioManager } from '../utils/audio';
import '../styles/Puzzle.css';
import '../styles/PuzzleUX.css';

const WORDS = [
  { word: "LUMINA", shift: 1, diff: 1 },
  { word: "MAGIC", shift: 2, diff: 1 },
  { word: "FOREST", shift: 3, diff: 2 },
  { word: "CRYSTAL", shift: 2, diff: 2 },
  { word: "PHOENIX", shift: 4, diff: 3 },
  { word: "DRAGON", shift: 5, diff: 3 }
];

export default function CipherPuzzle({ onComplete, difficulty = 1 }) {
  const available = WORDS.filter(w => w.diff <= Math.max(1, Math.min(3, difficulty)));
  const [puzzle] = useState(() => available[Math.floor(Math.random() * available.length)]);
  
  // Scramble word using caesar shift
  const scrambled = puzzle.word.split('').map(char => {
    let charCode = char.charCodeAt(0) + puzzle.shift;
    if (charCode > 90) charCode -= 26; // wrap around Z->A
    return String.fromCharCode(charCode);
  }).join('');

  const [guess, setGuess] = useState(Array(puzzle.word.length).fill(''));
  const [feedback, setFeedback] = useState(null);
  const [fails, setFails] = useState(0);

  const handleInput = (idx, val) => {
    if (feedback === 'correct') return;
    const char = val.toUpperCase().replace(/[^A-Z]/g, '').slice(-1);
    const newGuess = [...guess];
    newGuess[idx] = char;
    setGuess(newGuess);
    audioManager.playSFX('click');
  };

  const handleCheck = () => {
    const wordGuess = guess.join('');
    if (wordGuess === puzzle.word) {
      audioManager.playSFX('correct');
      setFeedback('correct');
      const stars = Math.max(1, 3 - Math.floor(fails / 2));
      setTimeout(() => onComplete?.(stars), 2500);
    } else {
      audioManager.playSFX('wrong');
      setFeedback('wrong');
      setFails(f => f + 1);
      setTimeout(() => setFeedback(null), 1500);
    }
  };

  return (
    <motion.div 
      className={`puzzle puzzle--cipher ${feedback ? `puzzle--${feedback}` : ''}`} 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <h2 className="puzzle__title">🌪️ The Whispering Wind</h2>
      <div className="puzzle__instruction-box">
        <p><strong>Goal:</strong> Decode the scrambled magical word!</p>
        <p><em>Hint: Each letter is shifted forward by {puzzle.shift} in the alphabet. (e.g. A becomes {String.fromCharCode(65 + puzzle.shift)})</em></p>
      </div>

      <div style={{ margin: '2rem 0' }}>
        <h3 style={{ fontSize: '2rem', letterSpacing: '0.5rem', color: '#fbbf24', textShadow: '0 0 10px rgba(251,191,36,0.5)' }}>
          {scrambled}
        </h3>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
        {guess.map((char, idx) => (
          <input
            key={idx}
            type="text"
            value={char}
            onChange={(e) => handleInput(idx, e.target.value)}
            style={{
              width: '40px', height: '50px', fontSize: '1.5rem', textAlign: 'center',
              background: 'rgba(15,23,42,0.8)', border: '2px solid #3b82f6', color: 'white',
              borderRadius: '8px', textTransform: 'uppercase'
            }}
            disabled={feedback === 'correct'}
            maxLength={1}
          />
        ))}
      </div>

      <button className="btn-glow" onClick={handleCheck} disabled={guess.includes('') || feedback === 'correct'}>
        Speak Word
      </button>

      <AnimatePresence>
        {feedback === 'correct' && (
          <motion.div className="puzzle__feedback puzzle__feedback--correct" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}>
            ✨ True Name Spoken!
            <Sparkles count={30} />
          </motion.div>
        )}
        {feedback === 'wrong' && (
          <motion.div className="puzzle__feedback puzzle__feedback--wrong" initial={{ x: [-10, 10, -10, 10, 0] }} transition={{ duration: 0.4 }}>
            💫 The wind rejects your word!
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
