/**
 * VoiceChatControls.jsx — Voice chat join/leave/mute UI.
 */

import { motion } from 'framer-motion';

export default function VoiceChatControls({
  isInVoice,
  isMuted,
  voiceError,
  onJoin,
  onLeave,
  onToggleMute,
  speakingPeers,
  players,
}) {
  return (
    <div className="voice-controls">
      {voiceError && (
        <div className="voice-controls__error">{voiceError}</div>
      )}

      {!isInVoice ? (
        <motion.button
          className="voice-controls__btn voice-controls__btn--join"
          onClick={onJoin}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🎙️ Join Voice
        </motion.button>
      ) : (
        <div className="voice-controls__active">
          <motion.button
            className={`voice-controls__btn ${isMuted ? 'voice-controls__btn--muted' : 'voice-controls__btn--unmuted'}`}
            onClick={onToggleMute}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isMuted ? '🔇 Muted' : '🎙️ On'}
          </motion.button>
          <motion.button
            className="voice-controls__btn voice-controls__btn--leave"
            onClick={onLeave}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Leave
          </motion.button>

          {/* Speaking indicators */}
          {players && (
            <div className="voice-controls__speakers">
              {players.map((p) => (
                <div
                  key={p.uid}
                  className={`voice-controls__speaker ${
                    speakingPeers?.has(p.uid) ? 'voice-controls__speaker--speaking' : ''
                  }`}
                >
                  <span className="voice-controls__speaker-dot" />
                  <span className="voice-controls__speaker-name">
                    {p.displayName?.slice(0, 8)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
