/**
 * useThurupRoom.js — Room creation, joining, and real-time membership.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  db,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  ensureAuth,
  getUid,
} from '../utils/firebase';
import { generateRoomCode } from './gameEngine';

export function useThurupRoom(roomId) {
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const unsubRef = useRef(null);

  // Listen for room updates
  useEffect(() => {
    if (!roomId) { setLoading(false); return; }

    const ref = doc(db, 'thurup_rooms', roomId);
    unsubRef.current = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setRoom({ id: snap.id, ...snap.data() });
      } else {
        setRoom(null);
        setError('Room not found.');
      }
      setLoading(false);
    }, (err) => {
      console.error('Room listener error:', err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsubRef.current?.();
  }, [roomId]);

  // Cleanup on unmount / tab close
  useEffect(() => {
    const handleUnload = () => {
      const uid = getUid();
      if (uid && roomId) {
        // Best-effort remove player (sendBeacon not great for Firestore)
        // We rely on the host detecting disconnections instead
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [roomId]);

  /** Create a new room. Returns the room ID. */
  const createRoom = useCallback(async (displayName) => {
    await ensureAuth();
    const uid = getUid();
    const code = generateRoomCode();
    const id = `room_${code}_${Date.now()}`;

    const roomData = {
      code,
      host: uid,
      players: [
        { uid, displayName, seat: 0, isReady: false },
      ],
      status: 'waiting',
      gameId: null,
      teamAGamePoints: 0,
      teamBGamePoints: 0,
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'thurup_rooms', id), roomData);
    return id;
  }, []);

  /** Join an existing room by invite code. Returns the room ID. */
  const joinRoom = useCallback(async (code, displayName) => {
    await ensureAuth();
    const uid = getUid();

    // Find the room by code
    const q = query(
      collection(db, 'thurup_rooms'),
      where('code', '==', code.toUpperCase()),
      where('status', '==', 'waiting')
    );
    const snap = await getDocs(q);
    if (snap.empty) throw new Error('Room not found or already started.');

    const roomDoc = snap.docs[0];
    const roomData = roomDoc.data();

    // Check if already in room
    if (roomData.players.some((p) => p.uid === uid)) {
      return roomDoc.id;
    }

    // Check room capacity
    if (roomData.players.length >= 4) {
      throw new Error('Room is full (4/4 players).');
    }

    // Find next available seat
    const takenSeats = new Set(roomData.players.map((p) => p.seat));
    let seat = 0;
    while (takenSeats.has(seat)) seat++;

    const updatedPlayers = [
      ...roomData.players,
      { uid, displayName, seat, isReady: false },
    ];

    await updateDoc(doc(db, 'thurup_rooms', roomDoc.id), {
      players: updatedPlayers,
    });

    return roomDoc.id;
  }, []);

  /** Toggle ready status for current player */
  const toggleReady = useCallback(async () => {
    if (!room) return;
    const uid = getUid();
    const updated = room.players.map((p) =>
      p.uid === uid ? { ...p, isReady: !p.isReady } : p
    );
    await updateDoc(doc(db, 'thurup_rooms', room.id), { players: updated });
  }, [room]);

  /** Leave the room */
  const leaveRoom = useCallback(async () => {
    if (!room) return;
    const uid = getUid();
    const updated = room.players.filter((p) => p.uid !== uid);

    if (updated.length === 0) {
      // Last player — delete room
      await deleteDoc(doc(db, 'thurup_rooms', room.id));
    } else {
      // Reassign host if the host is leaving
      const newHost = room.host === uid ? updated[0].uid : room.host;
      await updateDoc(doc(db, 'thurup_rooms', room.id), {
        players: updated,
        host: newHost,
      });
    }
  }, [room]);

  /** Start the game (host only). Returns gameId. */
  const startGame = useCallback(async () => {
    if (!room) return null;
    const uid = getUid();
    if (room.host !== uid) throw new Error('Only the host can start the game.');

    const isFull = room.players.length === 4;
    if (!isFull) throw new Error('All 4 players must join before starting.');

    const gameId = `game_${Date.now()}`;
    await updateDoc(doc(db, 'thurup_rooms', room.id), {
      status: 'playing',
      gameId,
    });

    return gameId;
  }, [room]);

  return {
    room,
    loading,
    error,
    createRoom,
    joinRoom,
    toggleReady,
    leaveRoom,
    startGame,
  };
}
