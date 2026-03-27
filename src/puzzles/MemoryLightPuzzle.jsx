import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sparkles from '../components/Sparkles';
import { audioManager } from '../utils/audio';
import '../styles/Puzzle.css';
import '../styles/Sparkles.css';

const COLORS = [
  { id: 0, color: '#ef4444', label: 'Red' },
  { id: 1, color: '#3b82f6', label: 'Blue' },
  { id: 2, color: '#22c55e', label: 'Green' },
  { id: 3, color: '#f59e0b', label: 'Yellow' },
  { id: 4, color: '#a855f7', label: 'Purple' },
  { id: 5, color: '#ec4899', label: 'Pink' },
];

function generateSequence(length, colorCount) {
  const seq = [];
  for (let i = 0; i < length; i++) {
    seq.push(Math.floor(Math.random() * colorCount));
  }
  return seq;
}

export default function MemoryLightPuzzle({ onComplete, difficulty = 1 }) {
  // Difficulty scales sequence length and speed
  const seqLength = 3 + difficulty;
  const colorCount = difficulty === 3 ? 6 : 4;
  const speed = Math.max(300, 800 - (difficulty * 150));

  const [sequence] = useState(() => generateSequence(seqLength, colorCount));
  const [phase, setPhase] = useState('showing');
  const [showIdx, setShowIdx] = useState(-1);
  const [userInput, setUserInput] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [activeLight, setActiveLight] = useState(null);
  const timeoutRef = useRef(null);

  const playSequence = useCallback(() => {
    setPhase('showing');
    setShowIdx(-1);
    let i = 0;
    const play = () => {
      if (i < sequence.length) {
        const colorId = sequence[i];
        setShowIdx(colorId);
        audioManager.playSFX('click');
        i++;
        timeoutRef.current = setTimeout(() => {
          setShowIdx(-1);
          timeoutRef.current = setTimeout(play, speed / 2);
        }, speed);
      } else {
        setPhase('input');
      }
    };
    timeoutRef.current = setTimeout(play, 1000);
  }, [sequence, speed]);

  useEffect(() => {
    playSequence();
    return () => clearTimeout(timeoutRef.current);
  }, [playSequence]);

  const handleLightClick = (colorId) => {
    if (phase !== 'input' || feedback === 'correct') return;

    audioManager.playSFX('click');
    setActiveLight(colorId);
    setTimeout(() => setActiveLight(null), 200);

    const nextInput = [...userInput, colorId];
    const idx = nextInput.length - 1;

    if (nextInput[idx] !== sequence[idx]) {
      audioManager.playSFX('wrong');
      setFeedback('wrong');
      setTimeout(() => {
        setFeedback(null);
        setUserInput([]);
        playSequence();
      }, 1500);
      return;
    }

    setUserInput(nextInput);

    if (nextInput.length === sequence.length) {
      audioManager.playSFX('correct');
      setFeedback('correct');
      setPhase('done');
      // Stars based on if they got it right in first attempt phase? 
      // Memory puzzle is binary, so 3 stars if done.
      setTimeout(() => onComplete?.(3), 2000);
    }
  };

  const activeColors = COLORS.slice(0, colorCount);

  return (
    <motion.div 
      className={`puzzle puzzle--memory ${feedback ? `puzzle--${feedback}` : ''}`} 
      id="memory-puzzle"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <h2 className="puzzle__title">💡 Memory Lights</h2>
      <p className="puzzle__instruction">
        {phase === 'showing' ? 'Remember the pattern…' : `Your turn! (${userInput.length}/${sequence.length})`}
      </p>

      <div className={`memory__grid memory__grid--${colorCount}`}>
        {activeColors.map((c) => (
          <motion.button
            key={c.id}
            className={`memory__light ${showIdx === c.id || activeLight === c.id ? 'memory__light--active' : ''}`}
            style={{ '--light-color': c.color, '--light-glow': `${c.color}88` }}
            onClick={() => handleLightClick(c.id)}
            disabled={phase === 'showing'}
            whileHover={phase === 'input' ? { scale: 1.05 } : {}}
            whileTap={phase === 'input' ? { scale: 0.95 } : {}}
            animate={showIdx === c.id ? { scale: [1, 1.1, 1], boxShadow: [`0 0 40px ${c.color}aa`] } : {}}
          >
            <span className="memory__light-inner" />
          </motion.button>
        ))}
      </div>

      <div className="memory__dots">
        {sequence.map((_, i) => (
          <motion.span
            key={i}
            className={`memory__dot ${i < userInput.length ? 'memory__dot--filled' : ''}`}
            animate={i < userInput.length ? { scale: [1, 1.4, 1] } : {}}
          />
        ))}
      </div>

      <AnimatePresence>
        {feedback === 'correct' && (
          <motion.div className="puzzle__feedback puzzle__feedback--correct" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            ✨ Incredible Memory!
            <Sparkles count={30} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
