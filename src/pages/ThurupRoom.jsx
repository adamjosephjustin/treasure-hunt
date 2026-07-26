/**
 * ThurupRoom.jsx — Waiting room before game starts.
 *
 * Shows 4 seats around a table, invite code, ready toggles,
 * chat, and voice chat controls.
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedPage from '../components/AnimatedPage';
import { useThurupRoom } from '../thurup/useThurupRoom';
import { useChat } from '../thurup/useChat';
import { useVoiceChat } from '../thurup/useVoiceChat';
import ChatPanel from '../thurup/ChatPanel';
import VoiceChatControls from '../thurup/VoiceChatControls';
import { getUid } from '../utils/firebase';
import { audioManager } from '../utils/audio';
import '../styles/Thurup.css';

const SEAT_LABELS = ['South (You)', 'East', 'North', 'West'];
const SEAT_ICONS = ['🟢', '🔵', '🟡', '🔴'];

export default function ThurupRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { room, loading, error, leaveRoom, startGame } = useThurupRoom(roomId);
  const { messages, sendMessage, unreadCount, markVisible } = useChat(roomId);
  const { isInVoice, isMuted, speakingPeers, voiceError, joinVoice, leaveVoice, toggleMute } =
    useVoiceChat(roomId, room?.players);

  const [copied, setCopied] = useState(false);
  const [startError, setStartError] = useState('');

  const uid = getUid();
  const isHost = room?.host === uid;
  const myPlayer = room?.players?.find((p) => p.uid === uid);

  // Pause background music
  useEffect(() => {
    if (audioManager.music) audioManager.music.pause();
  }, []);

  // Navigate to game when game starts
  useEffect(() => {
    if (room?.status === 'playing' && room?.gameId) {
      navigate(`/thurup/game/${room.gameId}`, {
        state: { roomId: room.id, players: room.players, isHost },
      });
    }
  }, [room?.status, room?.gameId, navigate, isHost]);

  const handleCopy = async () => {
    if (room?.code) {
      await navigator.clipboard.writeText(room.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const [linkCopied, setLinkCopied] = useState(false);
  const handleCopyLink = async () => {
    if (room?.code) {
      const link = `${window.location.origin}/#/thurup?code=${room.code}`;
      await navigator.clipboard.writeText(link);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const handleStart = async () => {
    try {
      setStartError('');
      await startGame();
    } catch (e) {
      setStartError(e.message);
    }
  };

  const handleLeave = async () => {
    await leaveRoom();
    navigate('/thurup');
  };

  if (loading) {
    return (
      <AnimatedPage className="thurup-lobby">
        <div className="thurup-loading">
          <motion.div
            className="thurup-loading__spinner"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            🃏
          </motion.div>
          <p>Loading room...</p>
        </div>
      </AnimatedPage>
    );
  }

  if (error || !room) {
    return (
      <AnimatedPage className="thurup-lobby">
        <div className="thurup-error-page">
          <h2>Room not found</h2>
          <p>{error || 'This room may have been closed.'}</p>
          <button className="thurup-btn thurup-btn--primary" onClick={() => navigate('/thurup')}>
            Back to Lobby
          </button>
        </div>
      </AnimatedPage>
    );
  }

  // Build seat display — rotate so current player is always at bottom
  const mySeat = myPlayer?.seat || 0;
  const seatOrder = [0, 1, 2, 3].map((offset) => (mySeat + offset) % 4);

  return (
    <AnimatedPage className="thurup-lobby thurup-room">
      <div className="thurup-room__content">
        {/* Room header */}
        <motion.div
          className="thurup-room__header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="thurup-room__title">🃏 Game Room</h2>
          <div className="thurup-room__code-section" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span className="thurup-room__code-label" style={{ alignSelf: 'center' }}>Invite Code:</span>
            <motion.button
              className="thurup-room__code"
              onClick={handleCopy}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Copy code only"
            >
              {room.code}
              <span className="thurup-room__copy-icon">{copied ? '✓' : '📋'}</span>
            </motion.button>
            <motion.button
              className="thurup-btn thurup-btn--secondary"
              onClick={handleCopyLink}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
              title="Copy full invite link"
            >
              🔗 {linkCopied ? 'Link Copied!' : 'Copy Link'}
            </motion.button>
          </div>
        </motion.div>

        {/* Table with 4 seats */}
        <div className="thurup-room__table-wrapper">
          <div className="thurup-room__table">
            <div className="thurup-room__table-felt">
              <span className="thurup-room__table-label">28</span>
            </div>

            {seatOrder.map((seatIdx, position) => {
              const player = room.players.find((p) => p.seat === seatIdx);
              const posClass = ['bottom', 'right', 'top', 'left'][position];
              const isMe = player?.uid === uid;
              const isSpeaking = speakingPeers?.has(player?.uid);

              return (
                <motion.div
                  key={seatIdx}
                  className={`thurup-room__seat thurup-room__seat--${posClass} ${
                    player ? 'thurup-room__seat--occupied' : ''
                  } ${
                    isSpeaking ? 'thurup-room__seat--speaking' : ''
                  }`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: position * 0.1, type: 'spring' }}
                >
                  <div className="thurup-room__seat-icon">
                    {player ? SEAT_ICONS[seatIdx] : '⬜'}
                  </div>
                  <div className="thurup-room__seat-name">
                    {player ? (
                      <>
                        {player.displayName}
                        {isMe && ' (You)'}
                        {player.uid === room.host && ' 👑'}
                      </>
                    ) : (
                      'Waiting...'
                    )}
                  </div>
                  {/* Team indicator */}
                  <div className="thurup-room__seat-team">
                    Team {seatIdx % 2 === 0 ? 'A' : 'B'}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Team info */}
        <div className="thurup-room__teams-info">
          <span className="thurup-room__team-badge thurup-room__team-badge--a">
            Team A: Seats {SEAT_ICONS[0]} & {SEAT_ICONS[2]}
          </span>
          <span className="thurup-room__team-badge thurup-room__team-badge--b">
            Team B: Seats {SEAT_ICONS[1]} & {SEAT_ICONS[3]}
          </span>
        </div>

        {/* Actions */}
        <div className="thurup-room__actions">
          {isHost && (
            <motion.button
              className="thurup-btn thurup-btn--accent"
              onClick={handleStart}
              disabled={room.players.length < 4}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🎮 Start Game ({room.players.length}/4)
            </motion.button>
          )}

          <motion.button
            className="thurup-btn thurup-btn--danger"
            onClick={handleLeave}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🚪 Leave
          </motion.button>
        </div>

        {startError && <div className="thurup-error">{startError}</div>}

        {/* Voice chat */}
        <VoiceChatControls
          isInVoice={isInVoice}
          isMuted={isMuted}
          voiceError={voiceError}
          onJoin={joinVoice}
          onLeave={leaveVoice}
          onToggleMute={toggleMute}
          speakingPeers={speakingPeers}
          players={room.players}
        />
      </div>

      {/* Chat */}
      <ChatPanel
        messages={messages}
        onSend={sendMessage}
        displayName={myPlayer?.displayName}
        unreadCount={unreadCount}
        onVisibilityChange={markVisible}
      />
    </AnimatedPage>
  );
}
