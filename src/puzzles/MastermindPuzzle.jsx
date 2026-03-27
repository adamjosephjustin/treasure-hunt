import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sparkles from '../components/Sparkles';
import { audioManager } from '../utils/audio';
import '../styles/Puzzle.css';

const COLORS = ['🔴', '🔵', '🟢', '🟡', '🟣'];

function generateCode(length) {
  const code = [];
  // Ensure unique colors for simplicity
  const available = [...COLORS];
  for (let i = 0; i < length; i++) {
    const idx = Math.floor(Math.random() * available.length);
    code.push(available.splice(idx, 1)[0]);
  }
  return code;
}

export default function MastermindPuzzle({ onComplete, difficulty = 1 }) {
  const codeLength = difficulty === 1 ? 3 : difficulty === 2 ? 4 : 4; 
  const allowedAttempts = difficulty === 1 ? 8 : 6;
  
  const [secretCode] = useState(() => generateCode(codeLength));
  const [attempts, setAttempts] = useState([]);
  const [currentGuess, setCurrentGuess] = useState([]);
  const [feedback, setFeedback] = useState(null);

  const addColor = (color) => {
    if (currentGuess.length < codeLength && feedback !== 'correct' && feedback !== 'gameover') {
      audioManager.playSFX('click');
      setCurrentGuess([...currentGuess, color]);
    }
  };

  const removeColor = (idx) => {
    audioManager.playSFX('click');
    const newGuess = [...currentGuess];
    newGuess.splice(idx, 1);
    setCurrentGuess(newGuess);
  };

  const submitGuess = () => {
    if (currentGuess.length !== codeLength) return;

    // Calculate Mastermind logic
    let exact = 0;    // Right color, right position
    let partial = 0;  // Right color, wrong position

    const tempSecret = [...secretCode];
    const tempGuess = [...currentGuess];

    // Check exacts first
    for (let i = codeLength - 1; i >= 0; i--) {
      if (tempGuess[i] === tempSecret[i]) {
        exact++;
        tempSecret.splice(i, 1);
        tempGuess.splice(i, 1);
      }
    }

    // Check partials
    for (let i = tempGuess.length - 1; i >= 0; i--) {
      const idx = tempSecret.indexOf(tempGuess[i]);
      if (idx !== -1) {
        partial++;
        tempSecret.splice(idx, 1);
      }
    }

    const result = { guess: [...currentGuess], exact, partial };
    const newAttempts = [...attempts, result];
    setAttempts(newAttempts);
    setCurrentGuess([]);

    if (exact === codeLength) {
      audioManager.playSFX('correct');
      setFeedback('correct');
      // Stars based on attempts used
      const efficiency = newAttempts.length / allowedAttempts;
      let stars = 1;
      if (efficiency <= 0.4) stars = 3;
      else if (efficiency <= 0.7) stars = 2;
      
      setTimeout(() => onComplete?.(stars), 3000);
    } else if (newAttempts.length >= allowedAttempts) {
      audioManager.playSFX('wrong');
      setFeedback('gameover');
      // Allow them to retry the ultimate puzzle
    } else {
      audioManager.playSFX('wrong');
    }
  };

  return (
    <motion.div 
      className={`puzzle puzzle--mastermind ${feedback ? `puzzle--${feedback}` : ''}`} 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <h2 className="puzzle__title">🔮 The Core of Lumina</h2>
      <div className="puzzle__instruction-box">
        <p><strong>Goal:</strong> Guess the exact 3 colors in the correct order!</p>
        <p>After each guess, you get hints:</p>
        <ul style={{ textAlign: 'left', display: 'inline-block', margin: '0.5rem auto' }}>
          <li>🟢 = Right color, IN THE RIGHT SPOT.</li>
          <li>⚪ = Right color, BUT WRONG SPOT.</li>
        </ul>
      </div>

      <div className="mastermind__board">
        {/* Past Attempts */}
        <div className="mastermind__history">
          {attempts.map((att, i) => (
            <div key={i} className="mastermind__row">
              <div className="mastermind__guess">
                {att.guess.map((g, gi) => <span key={gi}>{g}</span>)}
              </div>
              <div className="mastermind__pins">
                {Array.from({ length: att.exact }).map((_, pi) => <span key={`e-${pi}`} className="pin pin--exact">🟢</span>)}
                {Array.from({ length: att.partial }).map((_, pi) => <span key={`p-${pi}`} className="pin pin--partial">⚪</span>)}
              </div>
            </div>
          ))}
          {/* Fill remaining empty rows */}
          {Array.from({ length: allowedAttempts - attempts.length }).map((_, i) => (
            <div key={`empty-${i}`} className="mastermind__row mastermind__row--empty">
               <div className="mastermind__guess">
                {Array.from({ length: codeLength }).map((_, gi) => <span key={`emptyslot-${gi}`} className="mastermind__slot" />)}
              </div>
            </div>
          ))}
        </div>

        {/* Current Guess Input */}
        <div className="mastermind__input-row">
          <div className="mastermind__guess">
            {Array.from({ length: codeLength }).map((_, i) => (
              <span 
                key={i} 
                className={`mastermind__slot ${currentGuess[i] ? 'mastermind__slot--filled' : ''}`}
                onClick={() => currentGuess[i] && removeColor(i)}
              >
                {currentGuess[i]}
              </span>
            ))}
          </div>
          <button 
            className="mastermind__submit"
            onClick={submitGuess}
            disabled={currentGuess.length !== codeLength || feedback}
          >
            Check
          </button>
        </div>
      </div>

      <div className="mastermind__palette">
        {COLORS.map(c => (
          <motion.button
            key={c}
            className="mastermind__color-btn"
            onClick={() => addColor(c)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            disabled={currentGuess.length >= codeLength || feedback}
          >
            {c}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {feedback === 'correct' && (
          <motion.div className="puzzle__feedback puzzle__feedback--correct" initial={{ y: 20 }} animate={{ y: 0 }}>
            ✨ The Core Unlocked!
            <Sparkles count={50} />
          </motion.div>
        )}
        {feedback === 'gameover' && (
          <motion.div className="puzzle__feedback puzzle__feedback--wrong" initial={{ y: 20 }} animate={{ y: 0 }}>
            <p>The magic faded...</p>
            <button className="mastermind__retry" onClick={() => window.location.reload()}>Try Again 🔄</button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
