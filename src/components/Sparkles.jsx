import { useEffect, useState } from 'react';
import '../styles/Sparkles.css';

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

export default function Sparkles({ count = 12, active = true }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }
    const p = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: randomBetween(10, 90),
      y: randomBetween(10, 90),
      size: randomBetween(4, 10),
      delay: randomBetween(0, 0.8),
      duration: randomBetween(0.6, 1.4),
    }));
    setParticles(p);
  }, [active, count]);

  if (!active) return null;

  return (
    <div className="sparkles" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className="sparkles__dot"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
