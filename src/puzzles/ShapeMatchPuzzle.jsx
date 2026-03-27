import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sparkles from '../components/Sparkles';
import { audioManager } from '../utils/audio';
import '../styles/Puzzle.css';
import '../styles/Sparkles.css';

const ALL_SHAPES = [
  { id: 'circle', emoji: '🔴', label: 'Circle' },
  { id: 'square', emoji: '🟦', label: 'Square' },
  { id: 'triangle', emoji: '🔺', label: 'Triangle' },
  { id: 'star', emoji: '⭐', label: 'Star' },
  { id: 'diamond', emoji: '🔷', label: 'Diamond' },
  { id: 'heart', emoji: '💖', label: 'Heart' },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function ShapeMatchPuzzle({ onComplete, difficulty = 1 }) {
  // Difficulty scales number of shapes: 1=3, 2=4, 3=6
  const shapeCount = difficulty === 1 ? 3 : difficulty === 2 ? 4 : 6;
  
  const [activeShapes] = useState(() => ALL_SHAPES.slice(0, shapeCount));
  const [slots, setSlots] = useState(() =>
    activeShapes.map((s) => ({ ...s, filled: false, filledWith: null }))
  );
  const [pieces] = useState(() => shuffle([...activeShapes]));
  
  const [usedPieces, setUsedPieces] = useState(new Set());
  const [feedback, setFeedback] = useState(null);
  const [wrongSlot, setWrongSlot] = useState(null);
  const [fails, setFails] = useState(0);
  const dragRef = useRef(null);

  const tryDrop = (slotId) => {
    const draggedId = dragRef.current;
    if (!draggedId) return;
    dragRef.current = null;

    if (draggedId === slotId) {
      audioManager.playSFX('correct');
      const newSlots = slots.map((s) =>
        s.id === slotId ? { ...s, filled: true, filledWith: draggedId } : s
      );
      setSlots(newSlots);
      setUsedPieces((prev) => new Set([...prev, draggedId]));

      if (newSlots.every((s) => s.filled)) {
        setFeedback('correct');
        const stars = Math.max(1, 3 - Math.floor(fails / 2));
        setTimeout(() => onComplete?.(stars), 2000);
      }
    } else {
      audioManager.playSFX('wrong');
      setWrongSlot(slotId);
      setFeedback('wrong');
      setFails(f => f + 1);
      setTimeout(() => {
        setWrongSlot(null);
        setFeedback(null);
      }, 900);
    }
  };

  const handleSlotClick = (slotId) => {
    if (dragRef.current) {
      tryDrop(slotId);
    }
  };

  return (
    <motion.div 
      className={`puzzle puzzle--shape ${feedback ? `puzzle--${feedback}` : ''}`} 
      id="shape-puzzle"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <h2 className="puzzle__title">🔷 Shape Match</h2>
      <p className="puzzle__instruction">Match the magical symbols! (Level: {difficulty})</p>

      <div className="shape__pieces">
        {pieces.map((shape) => (
          <motion.div
            key={shape.id}
            className={`shape__piece ${usedPieces.has(shape.id) ? 'shape__piece--used' : ''}`}
            draggable={!usedPieces.has(shape.id)}
            onDragStart={() => {
              audioManager.playSFX('click');
              dragRef.current = shape.id;
            }}
            onTouchStart={() => {
              audioManager.playSFX('click');
              dragRef.current = shape.id;
            }}
            whileHover={!usedPieces.has(shape.id) ? { scale: 1.1, y: -5 } : {}}
            whileTap={!usedPieces.has(shape.id) ? { scale: 1.2 } : {}}
            layout
            id={`piece-${shape.id}`}
          >
            <span className="shape__emoji">{shape.emoji}</span>
          </motion.div>
        ))}
      </div>

      <div className={`shape__slots ${difficulty === 3 ? 'shape__slots--hard' : ''}`}>
        {slots.map((slot) => (
          <motion.div
            key={slot.id}
            className={`shape__slot ${slot.filled ? 'shape__slot--filled' : ''}`}
            animate={wrongSlot === slot.id ? { x: [-5, 5, -5, 5, 0] } : {}}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); tryDrop(slot.id); }}
            onClick={() => handleSlotClick(slot.id)}
            whileHover={!slot.filled ? { scale: 1.05, backgroundColor: "rgba(167, 139, 250, 0.1)" } : {}}
            id={`slot-${slot.id}`}
          >
            {slot.filled ? (
              <motion.span 
                className="shape__emoji"
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
              >
                {ALL_SHAPES.find((s) => s.id === slot.filledWith)?.emoji}
              </motion.span>
            ) : (
              <span className="shape__slot-label">{slot.label}</span>
            )}
            {slot.filled && <Sparkles count={5} />}
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {feedback === 'correct' && (
          <motion.div className="puzzle__feedback puzzle__feedback--correct" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
            ✨ Perfect Match!
            <Sparkles count={25} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
