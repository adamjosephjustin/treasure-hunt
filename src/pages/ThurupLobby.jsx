/**
 * ThurupLobby.jsx — Landing page for the Thurup card game.
 *
 * Create or join a room. Provides a brief rules summary
 * and a premium-looking hero section.
 */

import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AnimatedPage from '../components/AnimatedPage';
import { useThurupRoom } from '../thurup/useThurupRoom';
import { ensureAuth } from '../utils/firebase';
import { audioManager } from '../utils/audio';
import '../styles/Thurup.css';

const RANK_DISPLAY = ['J', '9', 'A', '10', 'K', 'Q', '8', '7'];
const SUIT_DISPLAY = ['♠', '♥', '♦', '♣'];

export default function ThurupLobby() {
  const navigate = useNavigate();
  const { createRoom, joinRoom } = useThurupRoom(null);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialCode = searchParams.get('code') || '';

  // Pause background music in Thurup game
  React.useEffect(() => {
    if (audioManager.music) audioManager.music.pause();
  }, []);

  const [mode, setMode] = useState(initialCode ? 'join' : null); // 'create' | 'join'
  const [displayName, setDisplayName] = useState(
    () => localStorage.getItem('thurup_name') || ''
  );
  const [joinCode, setJoinCode] = useState(initialCode);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const saveName = (name) => {
    setDisplayName(name);
    localStorage.setItem('thurup_name', name);
  };

  const handleCreate = async () => {
    if (!displayName.trim()) { setError('Enter your name'); return; }
    setIsLoading(true);
    setError('');
    try {
      await ensureAuth();
      const roomId = await createRoom(displayName.trim());
      navigate(`/thurup/room/${roomId}`);
    } catch (e) {
      setError(e.message);
    }
    setIsLoading(false);
  };

  const handleJoin = async () => {
    if (!displayName.trim()) { setError('Enter your name'); return; }
    if (!joinCode.trim()) { setError('Enter the room code'); return; }
    setIsLoading(true);
    setError('');
    try {
      await ensureAuth();
      const roomId = await joinRoom(joinCode.trim(), displayName.trim());
      navigate(`/thurup/room/${roomId}`);
    } catch (e) {
      setError(e.message);
    }
    setIsLoading(false);
  };

  return (
    <AnimatedPage className="thurup-lobby">
      {/* Floating card decorations */}
      <div className="thurup-lobby__cards-bg">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="thurup-lobby__floating-card"
            style={{
              left: `${10 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [0, -15, 0],
              rotate: [-5 + i * 3, 5 + i * 2, -5 + i * 3],
              opacity: [0.15, 0.25, 0.15],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <span className="thurup-lobby__card-suit">
              {SUIT_DISPLAY[i % 4]}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="thurup-lobby__content">
        {/* Hero */}
        <motion.div
          className="thurup-lobby__hero"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <span className="thurup-lobby__icon">🃏</span>
          <h1 className="thurup-lobby__title">Thurup</h1>
          <p className="thurup-lobby__subtitle">
            The classic Kerala card game <strong>28</strong> — play online with friends
          </p>
        </motion.div>

        {/* Name input (always shown) */}
        <motion.div
          className="thurup-lobby__name-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <input
            type="text"
            className="thurup-input"
            placeholder="Your display name"
            value={displayName}
            onChange={(e) => saveName(e.target.value)}
            maxLength={16}
            id="thurup-name-input"
          />
        </motion.div>

        {/* Mode selection */}
        {!mode && (
          <motion.div
            className="thurup-lobby__actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.button
              className="thurup-btn thurup-btn--primary thurup-btn--large"
              onClick={() => setMode('create')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              id="create-room-btn"
            >
              ✨ Create Room
            </motion.button>
            <motion.button
              className="thurup-btn thurup-btn--secondary thurup-btn--large"
              onClick={() => setMode('join')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              id="join-room-btn"
            >
              🔗 Join Room
            </motion.button>
          </motion.div>
        )}

        {/* Create mode */}
        {mode === 'create' && (
          <motion.div
            className="thurup-lobby__form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="thurup-lobby__form-desc">
              Create a private room and share the code with 3 friends
            </p>
            <motion.button
              className="thurup-btn thurup-btn--primary thurup-btn--large"
              onClick={handleCreate}
              disabled={isLoading}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {isLoading ? 'Creating...' : '🎲 Create & Get Code'}
            </motion.button>
            <button className="thurup-link" onClick={() => { setMode(null); setError(''); }}>
              ← Back
            </button>
          </motion.div>
        )}

        {/* Join mode */}
        {mode === 'join' && (
          <motion.div
            className="thurup-lobby__form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <input
              type="text"
              className="thurup-input thurup-input--code"
              placeholder="Enter 6-letter room code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              maxLength={6}
              autoFocus
              id="join-code-input"
            />
            <motion.button
              className="thurup-btn thurup-btn--primary thurup-btn--large"
              onClick={handleJoin}
              disabled={isLoading}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {isLoading ? 'Joining...' : '🚪 Join Room'}
            </motion.button>
            <button className="thurup-link" onClick={() => { setMode(null); setError(''); }}>
              ← Back
            </button>
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <motion.div
            className="thurup-error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.div>
        )}

        {/* Rules summary */}
        <motion.div
          className="thurup-lobby__rules"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3>📜 Quick Rules</h3>
          <div className="thurup-lobby__rules-grid">
            <div className="thurup-lobby__rule-card">
              <span className="thurup-lobby__rule-icon">👥</span>
              <strong>4 Players, 2 Teams</strong>
              <p>Partners sit opposite (seats 1&3, 2&4)</p>
            </div>
            <div className="thurup-lobby__rule-card">
              <span className="thurup-lobby__rule-icon">🏆</span>
              <strong>Card Ranking</strong>
              <p>J → 9 → A → 10 → K → Q → 8 → 7</p>
            </div>
            <div className="thurup-lobby__rule-card">
              <span className="thurup-lobby__rule-icon">⭐</span>
              <strong>Points</strong>
              <p>J=3, 9=2, A=1, 10=1 (Total: 28)</p>
            </div>
            <div className="thurup-lobby__rule-card">
              <span className="thurup-lobby__rule-icon">🎯</span>
              <strong>Thurup (Trump)</strong>
              <p>Bid winner sets secret trump suit</p>
            </div>
          </div>
        </motion.div>

        <Link to="/" className="thurup-link thurup-lobby__back-home">
          ← Back to Lumina Forest
        </Link>
      </div>
    </AnimatedPage>
  );
}
