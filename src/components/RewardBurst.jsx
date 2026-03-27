import { useEffect, useState } from 'react';
import '../styles/RewardBurst.css';

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

const EMOJIS = ['⭐', '✨', '💎', '🌟'];

export default function RewardBurst({ active = false }) {
  const [stars, setStars] = useState([]);

  useEffect(() => {
    if (!active) {
      setStars([]);
      return;
    }
    const s = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      emoji: EMOJIS[i % EMOJIS.length],
      startX: randomBetween(25, 75),
      startY: randomBetween(40, 70),
      delay: randomBetween(0, 0.4),
    }));
    setStars(s);
  }, [active]);

  if (!active || stars.length === 0) return null;

  return (
    <div className="reward-burst" aria-hidden="true">
      {stars.map((s) => (
        <span
          key={s.id}
          className="reward-burst__star"
          style={{
            left: `${s.startX}%`,
            top: `${s.startY}%`,
            animationDelay: `${s.delay}s`,
          }}
        >
          {s.emoji}
        </span>
      ))}
    </div>
  );
}
