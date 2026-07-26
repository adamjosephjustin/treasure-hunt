/**
 * useThurupGame.js — Real-time game state + action dispatchers.
 *
 * Every player (including the host) uses this hook to:
 * 1. Listen to the public game state
 * 2. Listen to their own private hand
 * 3. Dispatch action intents (bid, pass, setThurup, playCard, requestReveal)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  db,
  doc,
  setDoc,
  onSnapshot,
  getUid,
  serverTimestamp,
} from '../utils/firebase';
import { getValidMoves, sortHand, PHASE } from './gameEngine';

export function useThurupGame(gameId) {
  const [game, setGame] = useState(null);
  const [hand, setHand] = useState([]);
  const [loading, setLoading] = useState(true);
  const seqRef = useRef(0);
  const unsubGameRef = useRef(null);
  const unsubHandRef = useRef(null);

  const uid = getUid();

  // Listen to public game state
  useEffect(() => {
    if (!gameId) return;

    unsubGameRef.current = onSnapshot(
      doc(db, 'thurup_games', gameId),
      (snap) => {
        if (snap.exists()) {
          setGame(snap.data());
        }
        setLoading(false);
      }
    );

    return () => unsubGameRef.current?.();
  }, [gameId]);

  // Listen to private hand
  useEffect(() => {
    if (!gameId || !uid) return;

    unsubHandRef.current = onSnapshot(
      doc(db, 'thurup_games', gameId, 'hands', uid),
      (snap) => {
        if (snap.exists()) {
          setHand(sortHand(snap.data().cards || []));
        }
      }
    );

    return () => unsubHandRef.current?.();
  }, [gameId, uid]);

  // ─── Action dispatchers ─────────────────────────────────

  const _dispatch = useCallback(
    async (type, data = {}) => {
      if (!gameId || !uid) return;
      seqRef.current += 1;
      await setDoc(doc(db, 'thurup_games', gameId, 'actions', uid), {
        type,
        data,
        seq: seqRef.current,
        timestamp: new Date().toISOString(),
      });
    },
    [gameId, uid]
  );

  const submitBid = useCallback(
    (amount) => _dispatch('bid', { amount }),
    [_dispatch]
  );

  const passBid = useCallback(
    () => _dispatch('pass'),
    [_dispatch]
  );

  const setThurup = useCallback(
    (suit) => _dispatch('setThurup', { suit }),
    [_dispatch]
  );

  const playCard = useCallback(
    (cardId) => _dispatch('playCard', { cardId }),
    [_dispatch]
  );

  const requestReveal = useCallback(
    () => _dispatch('requestReveal'),
    [_dispatch]
  );

  // ─── Computed values ────────────────────────────────────

  const mySeat = game?.players?.find((p) => p.uid === uid)?.seat ?? -1;
  const isMyTurn = game?.currentPlayer === mySeat;
  const phase = game?.phase || PHASE.WAITING;

  // Compute valid moves for the current hand
  const validMoveIds = (() => {
    if (!game || phase !== PHASE.PLAYING || !isMyTurn || hand.length === 0) return [];
    const valid = getValidMoves({
      hand,
      currentTrick: game.currentTrick || [],
      leadSuit: game.leadSuit,
      thurupSuit: game.thurupSuit || null,
      thurupRevealed: game.thurupRevealed || false,
    });
    return valid.map((c) => c.id);
  })();

  // Can request thurup reveal?
  const canRequestReveal = (() => {
    if (!game || phase !== PHASE.PLAYING || !isMyTurn) return false;
    if (game.thurupRevealed) return false;
    if ((game.currentTrick || []).length === 0) return false;
    // Must not have the led suit
    const hasLeadSuit = hand.some((c) => c.suit === game.leadSuit);
    return !hasLeadSuit;
  })();

  return {
    game,
    hand,
    loading,
    mySeat,
    isMyTurn,
    phase,
    validMoveIds,
    canRequestReveal,
    submitBid,
    passBid,
    setThurup,
    playCard,
    requestReveal,
  };
}
