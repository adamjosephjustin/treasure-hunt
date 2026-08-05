/**
 * ThurupScoreboard.jsx — End-of-round results and running score display.
 */

import { motion } from 'framer-motion';
import { STARTING_PETTI } from './gameEngine';

export default function ThurupScoreboard({ game, onNextRound, onNewSeries, onBackToLobby }) {
  const result = game?.roundResult;
  if (!result) return null;

  const bidderTeam = game.bid.seat % 2 === 0 ? 'A' : 'B';
  const hasPetti = typeof result.pettiTransferred === 'number';
  const loserTeam = result.winningTeam === 'A' ? 'B' : 'A';

  return (
    <motion.div
      className="thurup-scoreboard-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="thurup-scoreboard"
        initial={{ scale: 0.8, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <h2 className="thurup-scoreboard__title">
          {result.bidMet ? '🎉 Bid Met!' : '💔 Bid Failed!'}
        </h2>

        <div className="thurup-scoreboard__details">
          <div className="thurup-scoreboard__bid-info">
            <span>Bid: <strong>{game.bid.amount}</strong> by Team {bidderTeam}</span>
          </div>

          <div className="thurup-scoreboard__teams">
            <div className={`thurup-scoreboard__team ${result.winningTeam === 'A' ? 'thurup-scoreboard__team--winner' : ''}`}>
              <h3>Team A</h3>
              <div className="thurup-scoreboard__points">{game.teamAPoints} pts</div>
              <div className="thurup-scoreboard__tricks">{game.teamATricks} tricks</div>
            </div>

            <div className="thurup-scoreboard__vs">VS</div>

            <div className={`thurup-scoreboard__team ${result.winningTeam === 'B' ? 'thurup-scoreboard__team--winner' : ''}`}>
              <h3>Team B</h3>
              <div className="thurup-scoreboard__points">{game.teamBPoints} pts</div>
              <div className="thurup-scoreboard__tricks">{game.teamBTricks} tricks</div>
            </div>
          </div>

          <div className="thurup-scoreboard__result">
            <span>
              Team {result.winningTeam} earns{' '}
              <strong>{result.gamePoints}</strong> game point{result.gamePoints > 1 ? 's' : ''}!
            </span>
          </div>

          {hasPetti && result.pettiTransferred > 0 && (
            <div className="thurup-petti-transfer">
              <div className="thurup-petti-transfer__label">
                Team {loserTeam} gives Team {result.winningTeam} {result.pettiTransferred} petti
              </div>
              <div className="thurup-petti-transfer__cards">
                {Array.from({ length: result.pettiTransferred }, (_, i) => (
                  <motion.span
                    key={i}
                    className="thurup-petti-transfer__card"
                    initial={{ x: result.winningTeam === 'A' ? 40 : -40, opacity: 0, rotate: -8 }}
                    animate={{ x: 0, opacity: 1, rotate: 0 }}
                    transition={{ delay: 0.3 + i * 0.15, type: 'spring', stiffness: 300 }}
                  >
                    🎴
                  </motion.span>
                ))}
              </div>
              <div className="thurup-petti-transfer__totals">
                <span>Team A: <strong>{result.teamAPetti}</strong> 🎴</span>
                <span>Team B: <strong>{result.teamBPetti}</strong> 🎴</span>
              </div>
            </div>
          )}
        </div>

        {result.seriesComplete ? (
          <>
            <motion.div
              className="thurup-series-complete"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', delay: 0.5 }}
            >
              🏆 Team {result.seriesWinner} wins the whole Petti — series complete!
            </motion.div>
            <div className="thurup-scoreboard__actions">
              {onNewSeries ? (
                <motion.button
                  className="thurup-btn thurup-btn--primary"
                  onClick={onNewSeries}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  🎲 New Series
                </motion.button>
              ) : (
                <p className="thurup-scoreboard__waiting-text">Waiting for host to start a new series…</p>
              )}
              <motion.button
                className="thurup-btn thurup-btn--secondary"
                onClick={onBackToLobby}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Back to Lobby
              </motion.button>
            </div>
          </>
        ) : (
          <div className="thurup-scoreboard__actions">
            {onNextRound ? (
              <motion.button
                className="thurup-btn thurup-btn--primary"
                onClick={onNextRound}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Next Round →
              </motion.button>
            ) : (
              <p className="thurup-scoreboard__waiting-text">Waiting for host to start the next round…</p>
            )}
            <motion.button
              className="thurup-btn thurup-btn--secondary"
              onClick={onBackToLobby}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Back to Lobby
            </motion.button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/** Compact running score shown during the game */
export function RunningScore({ game, room }) {
  if (!game) return null;

  return (
    <div className="running-score">
      <div className="running-score__row">
        <span className="running-score__label">Team A</span>
        <span className="running-score__value">{game.teamAPoints || 0} pts</span>
        <span className="running-score__petti" title="Petti remaining">
          🎴{room?.teamAPetti ?? STARTING_PETTI}
        </span>
      </div>
      <div className="running-score__divider">|</div>
      <div className="running-score__row">
        <span className="running-score__label">Team B</span>
        <span className="running-score__value">{game.teamBPoints || 0} pts</span>
        <span className="running-score__petti" title="Petti remaining">
          🎴{room?.teamBPetti ?? STARTING_PETTI}
        </span>
      </div>
      <div className="running-score__divider">|</div>
      <div className="running-score__trick-info">
        Trick {game.trickNumber || 1} / 8
      </div>
    </div>
  );
}
