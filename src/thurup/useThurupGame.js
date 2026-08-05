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
  getDoc,
  onSnapshot,
  getUid,
  serverTimestamp,
} from '../utils/firebase';
import { getValidMoves, sortHand, PHASE } from './gameEngine';

export function useThurupGame(gameId) {
  const [game, setGame] = useState(null);
  const [hand, setHand] = useState([]);
  const [loading, setLoading] = useState(true);
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
      // Date.now() instead of a locally-incrementing counter: a counter
      // resets to 0 on every reload, which — after a mobile tab reload —
      // would look "older" than the seq the host already has on record
      // for this player, causing the host to silently ignore the action
      // and the player's turn to appear permanently stuck. Wall-clock
      // time only moves forward, so it survives the reload.
      await setDoc(doc(db, 'thurup_games', gameId, 'actions', uid), {
        type,
        data,
        seq: Date.now(),
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
    (suit, cardId) => _dispatch('setThurup', { suit, cardId }),
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

  /**
   * Let the bidder privately re-check the Thurup suit they set, for as
   * long as it stays hidden. Firestore rules only grant read access to
   * the host and to whoever's uid is stamped as bidderUid on this doc —
   * a non-bidder calling this just gets a permission-denied and null.
   */
  const peekThurup = useCallback(async () => {
    if (!gameId) return null;
    try {
      const snap = await getDoc(doc(db, 'thurup_games', gameId, 'secrets', 'thurup'));
      return snap.exists() ? snap.data().suit || null : null;
    } catch (e) {
      console.error('peekThurup failed:', e);
      return null;
    }
  }, [gameId]);

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
    peekThurup,
  };
}
