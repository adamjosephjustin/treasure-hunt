/**
 * ThurupCard.jsx — Pure CSS playing card component.
 *
 * Renders a face-up or face-down card with proper suit symbols,
 * hover effects, selection glow, and disabled dimming.
 */

import { motion } from 'framer-motion';
import { SUIT_SYMBOLS, SUIT_COLORS, cardLabel } from './gameEngine';

export default function ThurupCard({
  card,
  faceDown = false,
  onClick,
  disabled = false,
  selected = false,
  played = false,
  small = false,
  style = {},
  delay = 0,
}) {
  const suitColor = card ? SUIT_COLORS[card.suit] : 'black';
  const symbol = card ? SUIT_SYMBOLS[card.suit] : '';
  const rank = card ? card.rank : '';

  const handleClick = () => {
    if (!disabled && onClick) onClick(card);
  };

  if (faceDown) {
    return (
      <motion.div
        className={`thurup-card thurup-card--back ${small ? 'thurup-card--small' : ''}`}
        style={style}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay, duration: 0.3 }}
      >
        <div className="thurup-card__back-pattern">
          <span className="thurup-card__back-diamond">◆</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={[
        'thurup-card',
        `thurup-card--${suitColor}`,
        disabled ? 'thurup-card--disabled' : '',
        selected ? 'thurup-card--selected' : '',
        played ? 'thurup-card--played' : '',
        small ? 'thurup-card--small' : '',
        onClick && !disabled ? 'thurup-card--clickable' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={handleClick}
      style={style}
      initial={{ scale: 0.8, opacity: 0, y: 30 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.8, opacity: 0, y: -20 }}
      transition={{ delay, duration: 0.3, type: 'spring', stiffness: 300 }}
      whileHover={
        onClick && !disabled
          ? { y: -12, scale: 1.05, transition: { duration: 0.15 } }
          : {}
      }
      whileTap={
        onClick && !disabled ? { scale: 0.95, transition: { duration: 0.1 } } : {}
      }
    >
      {/* Top-left corner */}
      <div className="thurup-card__corner thurup-card__corner--top">
        <span className="thurup-card__rank">{rank}</span>
        <span className="thurup-card__suit-small">{symbol}</span>
      </div>

      {/* Center suit */}
      <div className="thurup-card__center">
        <span className="thurup-card__suit-large">{symbol}</span>
      </div>

      {/* Bottom-right corner (inverted) */}
      <div className="thurup-card__corner thurup-card__corner--bottom">
        <span className="thurup-card__rank">{rank}</span>
        <span className="thurup-card__suit-small">{symbol}</span>
      </div>

      {/* Points indicator */}
      {card.points > 0 && (
        <div className="thurup-card__points">{card.points}pt</div>
      )}
    </motion.div>
  );
}

/** Face-down thurup indicator card */
export function ThurupIndicator({ revealed, suit, small = false }) {
  if (revealed && suit) {
    return (
      <motion.div
        className={`thurup-card thurup-card--${SUIT_COLORS[suit]} thurup-card--thurup-revealed ${small ? 'thurup-card--small' : ''}`}
        initial={{ rotateY: 180 }}
        animate={{ rotateY: 0 }}
        transition={{ duration: 0.6, type: 'spring' }}
      >
        <div className="thurup-card__corner thurup-card__corner--top">
          <span className="thurup-card__suit-small">{SUIT_SYMBOLS[suit]}</span>
        </div>
        <div className="thurup-card__center">
          <span className="thurup-card__suit-large thurup-card__thurup-label">
            {SUIT_SYMBOLS[suit]}
          </span>
          <span className="thurup-card__thurup-text">THURUP</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`thurup-card thurup-card--back thurup-card--thurup-hidden ${small ? 'thurup-card--small' : ''}`}
      animate={{ rotateZ: [0, 2, -2, 0] }}
      transition={{ duration: 3, repeat: Infinity }}
    >
      <div className="thurup-card__back-pattern">
        <span className="thurup-card__back-label">?</span>
      </div>
    </motion.div>
  );
}
