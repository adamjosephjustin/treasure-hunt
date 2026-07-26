/**
 * ThurupGame.jsx — Main game table page.
 *
 * Renders the card table with 4 player positions, bidding UI,
 * thurup selection, card play, scores, chat, and voice.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedPage from '../components/AnimatedPage';
import { useThurupGame } from '../thurup/useThurupGame';
import { useThurupRoom } from '../thurup/useThurupRoom';
import { useChat } from '../thurup/useChat';
import { useVoiceChat } from '../thurup/useVoiceChat';
import { HostEngine } from '../thurup/hostEngine';
import ThurupCard, { ThurupIndicator } from '../thurup/ThurupCard';
import ThurupScoreboard, { RunningScore } from '../thurup/ThurupScoreboard';
import ChatPanel from '../thurup/ChatPanel';
import VoiceChatControls from '../thurup/VoiceChatControls';
import { getUid } from '../utils/firebase';
import { SUIT_SYMBOLS, PHASE, MIN_BID, MAX_BID, SUITS } from '../thurup/gameEngine';
import { audioManager } from '../utils/audio';
import '../styles/Thurup.css';
import '../styles/ThurupCards.css';

const POSITION_LABELS = ['You', 'Right', 'Partner', 'Left'];

export default function ThurupGamePage() {
  const { gameId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const roomId = location.state?.roomId;
  const locationPlayers = location.state?.players;
  const isHost = location.state?.isHost;

  // Pause background music
  useEffect(() => {
    if (audioManager.music) audioManager.music.pause();
  }, []);

  const { game, hand, loading, mySeat, isMyTurn, phase, validMoveIds, canRequestReveal, submitBid, passBid, setThurup, playCard, requestReveal } = useThurupGame(gameId);
  const { room } = useThurupRoom(roomId);
  const { messages, sendMessage, unreadCount, markVisible } = useChat(roomId);
  const { isInVoice, isMuted, speakingPeers, voiceError, joinVoice, leaveVoice, toggleMute } =
    useVoiceChat(roomId, game?.players);

  const [bidAmount, setBidAmount] = useState(MIN_BID);
  const [selectedThurup, setSelectedThurup] = useState(null);
  const [toast, setToast] = useState(null);
  const [showRules, setShowRules] = useState(false);
  const hostEngineRef = useRef(null);

  const uid = getUid();

  // ─── Host engine lifecycle ────────────────────────────

  useEffect(() => {
    if (!isHost || !gameId || !roomId) return;

    const players = locationPlayers || game?.players || [];
    if (players.length < 4) return;

    const engine = new HostEngine(gameId, roomId, uid, players, 0);
    hostEngineRef.current = engine;

    // Start or resume
    (async () => {
      try {
        if (!game) {
          await engine.start();
        } else {
          await engine.resume();
        }
      } catch (e) {
        console.error('Host engine error:', e);
      }
    })();

    return () => engine.destroy();
  }, [isHost, gameId, roomId]);

  // ─── Toast for game events ────────────────────────────

  useEffect(() => {
    if (!game?.lastAction) return;
    const la = game.lastAction;

    if (la.type === 'error' && la.seat === mySeat) {
      showToast(la.detail, 'error');
      audioManager.playSFX('wrong');
    } else if (la.type === 'trickWin') {
      const winner = game.players.find((p) => p.seat === la.seat);
      showToast(`${winner?.displayName || 'Player'} won the trick! ${la.detail}`, 'success');
      audioManager.playSFX('correct');
    } else if (la.type === 'requestReveal') {
      showToast(`🔮 ${la.detail}`, 'info');
      audioManager.playSFX('success');
    } else if (la.type === 'bid' && la.seat !== mySeat) {
      showToast(la.detail, 'info');
    }
  }, [game?.lastAction]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ─── Bid constraints ──────────────────────────────────

  useEffect(() => {
    let newMin = MIN_BID;
    if (phase === PHASE.SECOND_BIDDING) {
      newMin = 24;
    }
    if (game?.bid?.amount > 0) {
      newMin = Math.max(newMin, game.bid.amount + 1);
    }
    // Also consider partner rule if raising partner
    const isPartnerHighest = game?.bid?.seat !== -1 && (mySeat + 2) % 4 === game?.bid?.seat;
    if (isPartnerHighest && phase !== PHASE.SECOND_BIDDING) {
      newMin = Math.max(newMin, 20);
    }
    setBidAmount(newMin);
  }, [game?.bid?.amount, phase, mySeat]);

  // ─── Card play handler ────────────────────────────────

  const handlePlayCard = useCallback(
    (card) => {
      if (!isMyTurn || phase !== PHASE.PLAYING) return;
      if (!validMoveIds.includes(card.id)) {
        showToast("You can't play that card", 'error');
        audioManager.playSFX('wrong');
        return;
      }
      playCard(card.id);
      audioManager.playSFX('click');
    },
    [isMyTurn, phase, validMoveIds, playCard]
  );

  // ─── Thurup selection ─────────────────────────────────

  const handleSetThurup = () => {
    if (!selectedThurup) {
      showToast('Select a suit for Thurup', 'error');
      return;
    }
    setThurup(selectedThurup);
    audioManager.playSFX('success');
  };

  // ─── Next round (host only) ───────────────────────────

  const handleNextRound = async () => {
    if (hostEngineRef.current) {
      await hostEngineRef.current.startNextRound();
    }
  };

  const handleBackToLobby = () => {
    navigate('/thurup');
  };

  // ─── Render helpers ───────────────────────────────────

  const getPlayerAtPosition = (positionOffset) => {
    const targetSeat = (mySeat + positionOffset) % 4;
    return game?.players?.find((p) => p.seat === targetSeat);
  };

  const getCardCount = (playerUid) => {
    // We don't know exact card count of others, estimate from trick number
    if (!game) return 0;
    const cardsPlayed = (game.trickNumber - 1) * 4 + (game.currentTrick?.length || 0);
    const cardsPerPlayer = phase === PHASE.BIDDING || phase === PHASE.SETTING_THURUP ? 4 : 8;
    const tricksCompleted = game.trickNumber - 1;
    return cardsPerPlayer - tricksCompleted - (game.currentTrick?.some(t => {
      const p = game.players?.find(pl => pl.seat === t.seat);
      return p?.uid === playerUid;
    }) ? 1 : 0);
  };

  // ─── Loading ──────────────────────────────────────────

  if (loading || !game) {
    return (
      <AnimatedPage className="thurup-game-page">
        <div className="thurup-loading">
          <motion.div
            className="thurup-loading__spinner"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            🃏
          </motion.div>
          <p>Dealing cards...</p>
        </div>
      </AnimatedPage>
    );
  }

  const myDisplayName = game.players?.find((p) => p.uid === uid)?.displayName || 'You';

  return (
    <AnimatedPage className="thurup-game-page">
      <div className="thurup-game">
        {/* ─── Header bar ─────────────────────────── */}
        <div className="thurup-game__header">
          <RunningScore game={game} room={room} />
          <div className="thurup-game__phase-indicator">
            {phase === PHASE.BIDDING && '📢 Bidding (1st Round)'}
            {phase === PHASE.SETTING_THURUP && '🔮 Setting Thurup'}
            {phase === PHASE.SECOND_BIDDING && '📢 Bidding (2nd Round)'}
            {phase === PHASE.PLAYING && `🃏 Trick ${game.trickNumber}/8`}
            {phase === PHASE.TRICK_END && '✨ Trick Complete'}
            {phase === PHASE.ROUND_END && '🏁 Round Over'}
          </div>
          <button
            className="thurup-btn thurup-btn--small thurup-btn--secondary"
            onClick={() => setShowRules(!showRules)}
          >
            📖 Rules
          </button>
        </div>

        {/* ─── Game table ─────────────────────────── */}
        <div className="thurup-table">
          {/* Partner (top) */}
          <div className="thurup-table__seat thurup-table__seat--top">
            <PlayerSeat
              player={getPlayerAtPosition(2)}
              isCurrentTurn={game.currentPlayer === ((mySeat + 2) % 4)}
              cardCount={getCardCount(getPlayerAtPosition(2)?.uid)}
              isSpeaking={speakingPeers?.has(getPlayerAtPosition(2)?.uid)}
              label="Partner"
            />
          </div>

          {/* Left player */}
          <div className="thurup-table__seat thurup-table__seat--left">
            <PlayerSeat
              player={getPlayerAtPosition(3)}
              isCurrentTurn={game.currentPlayer === ((mySeat + 3) % 4)}
              cardCount={getCardCount(getPlayerAtPosition(3)?.uid)}
              isSpeaking={speakingPeers?.has(getPlayerAtPosition(3)?.uid)}
              label="Left"
            />
          </div>

          {/* Center play area */}
          <div className="thurup-table__center">
            {/* Thurup indicator */}
            <div className="thurup-table__thurup-area">
              <ThurupIndicator
                revealed={game.thurupRevealed}
                suit={game.thurupSuit}
                small
              />
            </div>

            {/* Played cards in the current trick */}
            <div className="thurup-table__trick">
              <AnimatePresence>
                {(game.currentTrick || []).map((play, i) => {
                  const relPos = (play.seat - mySeat + 4) % 4;
                  const posClass = ['bottom', 'right', 'top', 'left'][relPos];
                  return (
                    <motion.div
                      key={play.card.id}
                      className={`thurup-table__played-card thurup-table__played-card--${posClass}`}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 400 }}
                    >
                      <ThurupCard card={play.card} small played />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Turn indicator text */}
            {phase === PHASE.PLAYING && (
              <div className="thurup-table__turn-label">
                {isMyTurn ? '🎯 Your Turn' : `Waiting for ${game.players?.find(p => p.seat === game.currentPlayer)?.displayName}...`}
              </div>
            )}
          </div>

          {/* Right player */}
          <div className="thurup-table__seat thurup-table__seat--right">
            <PlayerSeat
              player={getPlayerAtPosition(1)}
              isCurrentTurn={game.currentPlayer === ((mySeat + 1) % 4)}
              cardCount={getCardCount(getPlayerAtPosition(1)?.uid)}
              isSpeaking={speakingPeers?.has(getPlayerAtPosition(1)?.uid)}
              label="Right"
            />
          </div>

          {/* Your hand (bottom) */}
          <div className="thurup-table__seat thurup-table__seat--bottom">
            <div className="thurup-table__my-info">
              <span className={`thurup-table__my-name ${isMyTurn ? 'thurup-table__my-name--active' : ''}`}>
                {myDisplayName} (Team {mySeat % 2 === 0 ? 'A' : 'B'})
              </span>
            </div>
          </div>
        </div>

        {/* ─── Your hand ──────────────────────────── */}
        <div className="thurup-hand">
          <div className="thurup-hand__cards">
            {hand.map((card, i) => (
              <ThurupCard
                key={card.id}
                card={card}
                onClick={phase === PHASE.PLAYING && isMyTurn ? handlePlayCard : undefined}
                disabled={phase !== PHASE.PLAYING || !isMyTurn || !validMoveIds.includes(card.id)}
                delay={i * 0.05}
                style={{
                  transform: `rotate(${(i - (hand.length - 1) / 2) * 4}deg)`,
                  marginLeft: i > 0 ? '-20px' : '0',
                  zIndex: i,
                }}
              />
            ))}
          </div>

          {/* Reveal request button */}
          {canRequestReveal && (
            <motion.button
              className="thurup-btn thurup-btn--accent thurup-hand__reveal-btn"
              onClick={requestReveal}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              🔮 Request Thurup Reveal
            </motion.button>
          )}
        </div>

        {/* ─── Bidding UI ─────────────────────────── */}
        <AnimatePresence>
          {(phase === PHASE.BIDDING || phase === PHASE.SECOND_BIDDING) && isMyTurn && (
            <motion.div
              className="thurup-bid-panel"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
            >
              <h3 className="thurup-bid-panel__title">Your Bid</h3>
              {game.bid.amount > 0 && (
                <p className="thurup-bid-panel__current">
                  Current: <strong>{game.bid.amount}</strong> by{' '}
                  {game.players?.find((p) => p.seat === game.bid.seat)?.displayName}
                </p>
              )}
              <div className="thurup-bid-panel__controls">
                <input
                  type="range"
                  min={phase === PHASE.SECOND_BIDDING ? Math.max(24, (game.bid.amount || 23) + 1) : Math.max(MIN_BID, (game.bid.amount || MIN_BID - 1) + 1)}
                  max={MAX_BID}
                  value={bidAmount}
                  onChange={(e) => setBidAmount(parseInt(e.target.value))}
                  className="thurup-bid-panel__slider"
                />
                <span className="thurup-bid-panel__value">{bidAmount}</span>
              </div>
              <div className="thurup-bid-panel__actions">
                <motion.button
                  className="thurup-btn thurup-btn--primary"
                  onClick={() => { submitBid(bidAmount); audioManager.playSFX('click'); }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Bid {bidAmount}
                </motion.button>
                <motion.button
                  className="thurup-btn thurup-btn--secondary"
                  onClick={() => { passBid(); audioManager.playSFX('click'); }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Pass
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bidding status for non-active player */}
        {(phase === PHASE.BIDDING || phase === PHASE.SECOND_BIDDING) && !isMyTurn && (
          <div className="thurup-bid-panel thurup-bid-panel--waiting">
            <p>
              {game.bid.amount > 0
                ? `Current bid: ${game.bid.amount} by ${game.players?.find(p => p.seat === game.bid.seat)?.displayName}`
                : 'Waiting for bids...'}
            </p>
            <p className="thurup-bid-panel__waiting-text">
              Waiting for {game.players?.find(p => p.seat === game.currentPlayer)?.displayName}...
            </p>
          </div>
        )}

        {/* ─── Thurup selection UI ────────────────── */}
        <AnimatePresence>
          {phase === PHASE.SETTING_THURUP && isMyTurn && (
            <motion.div
              className="thurup-select-panel"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <h3 className="thurup-select-panel__title">🔮 Choose Thurup Suit</h3>
              <p className="thurup-select-panel__desc">
                Select the trump suit based on your strongest cards
              </p>
              <div className="thurup-select-panel__suits" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1.25rem' }}>
                {hand.map((card) => (
                  <motion.div
                    key={card.id}
                    onClick={() => setSelectedThurup(card.suit)}
                    whileHover={{ scale: 1.1, y: -10 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ 
                      cursor: 'pointer', 
                      filter: selectedThurup && selectedThurup !== card.suit ? 'brightness(0.5)' : 'none',
                      transition: 'filter 0.2s',
                      margin: '0 4px'
                    }}
                  >
                    <ThurupCard card={card} />
                  </motion.div>
                ))}
              </div>
              <motion.button
                className="thurup-btn thurup-btn--primary"
                onClick={handleSetThurup}
                disabled={!selectedThurup}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Confirm Thurup
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Thurup selection waiting */}
        {phase === PHASE.SETTING_THURUP && !isMyTurn && (
          <div className="thurup-select-panel thurup-select-panel--waiting">
            <p>
              🔮 {game.players?.find(p => p.seat === game.bid.seat)?.displayName} is choosing the Thurup suit...
            </p>
          </div>
        )}

        {/* ─── Round end scoreboard ───────────────── */}
        <AnimatePresence>
          {phase === PHASE.ROUND_END && (
            <ThurupScoreboard
              game={game}
              onNextRound={isHost ? handleNextRound : undefined}
              onBackToLobby={handleBackToLobby}
            />
          )}
        </AnimatePresence>

        {/* ─── Toast notifications ────────────────── */}
        <AnimatePresence>
          {toast && (
            <motion.div
              className={`thurup-toast thurup-toast--${toast.type}`}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
            >
              {toast.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Rules modal ────────────────────────── */}
        <AnimatePresence>
          {showRules && (
            <motion.div
              className="thurup-rules-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRules(false)}
            >
              <motion.div
                className="thurup-rules-modal"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3>📜 Game Rules</h3>
                <ul>
                  <li><strong>Card Rank:</strong> J &gt; 9 &gt; A &gt; 10 &gt; K &gt; Q &gt; 8 &gt; 7</li>
                  <li><strong>Points:</strong> J=3, 9=2, A=1, 10=1 (Total: 28)</li>
                  <li><strong>Must follow suit</strong> — play a card of the led suit if you have one</li>
                  <li><strong>Thurup (Trump)</strong> — bid winner sets a secret trump suit</li>
                  <li>If you can't follow suit, you can <strong>request Thurup reveal</strong></li>
                  <li>After reveal, you <strong>must play trump</strong> if you have one</li>
                  <li>8 tricks per round, team with bid must meet their target</li>
                </ul>
                <button className="thurup-btn thurup-btn--secondary" onClick={() => setShowRules(false)}>
                  Close
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Footer controls ────────────────────── */}
        <div className="thurup-game__footer">
          <VoiceChatControls
            isInVoice={isInVoice}
            isMuted={isMuted}
            voiceError={voiceError}
            onJoin={joinVoice}
            onLeave={leaveVoice}
            onToggleMute={toggleMute}
            speakingPeers={speakingPeers}
            players={game.players}
          />
        </div>
      </div>

      {/* Chat */}
      <ChatPanel
        messages={messages}
        onSend={sendMessage}
        displayName={myDisplayName}
        unreadCount={unreadCount}
        onVisibilityChange={markVisible}
      />
    </AnimatedPage>
  );
}

/** Compact player seat component */
function PlayerSeat({ player, isCurrentTurn, cardCount, isSpeaking, label }) {
  if (!player) return <div className="player-seat player-seat--empty">Waiting...</div>;

  return (
    <div className={`player-seat ${isCurrentTurn ? 'player-seat--active' : ''} ${isSpeaking ? 'player-seat--speaking' : ''}`}>
      <div className="player-seat__avatar">
        {player.displayName?.[0]?.toUpperCase() || '?'}
      </div>
      <div className="player-seat__name">{player.displayName}</div>
      <div className="player-seat__meta">
        <span className="player-seat__team">Team {player.seat % 2 === 0 ? 'A' : 'B'}</span>
      </div>
      {/* Card backs for other players */}
      <div className="player-seat__cards">
        {Array.from({ length: Math.max(0, cardCount) }, (_, i) => (
          <div key={i} className="player-seat__card-back" style={{ marginLeft: i > 0 ? '-8px' : '0' }} />
        ))}
      </div>
    </div>
  );
}
