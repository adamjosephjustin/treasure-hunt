/**
 * usePresence.js — Lightweight heartbeat presence.
 *
 * Mobile connections drop constantly (backgrounded tabs, spotty cellular,
 * a phone getting locked) and until now there was zero signal for that —
 * a dropped player just looked like "Waiting..." or a stuck turn forever.
 *
 * Each mounted client writes its own heartbeat doc every few seconds;
 * anyone whose heartbeat goes stale is surfaced to the rest of the table
 * as "reconnecting…" instead of silently hanging.
 */

import { useState, useEffect, useRef } from 'react';
import { db, doc, setDoc, collection, onSnapshot, getUid } from '../utils/firebase';

const HEARTBEAT_INTERVAL_MS = 8000;
const STALE_MS = 20000;

export function usePresence(roomId) {
  const [stalePeers, setStalePeers] = useState(new Set());
  const heartbeatsRef = useRef({}); // { uid: lastSeenMs }
  const uid = getUid();

  // Write our own heartbeat periodically.
  useEffect(() => {
    if (!roomId || !uid) return;

    const beat = () => {
      setDoc(doc(db, 'thurup_rooms', roomId, 'presence', uid), {
        uid,
        lastSeen: Date.now(),
      }).catch(() => {});
    };

    beat();
    const interval = setInterval(beat, HEARTBEAT_INTERVAL_MS);

    // Beat immediately when the tab regains focus so a player who
    // un-backgrounds their phone clears "reconnecting" quickly.
    const onVisible = () => {
      if (document.visibilityState === 'visible') beat();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [roomId, uid]);

  // Listen to everyone's heartbeats and recompute who's stale.
  useEffect(() => {
    if (!roomId) return;

    const recompute = () => {
      const now = Date.now();
      const stale = new Set();
      for (const [peerUid, lastSeen] of Object.entries(heartbeatsRef.current)) {
        if (peerUid !== uid && now - lastSeen > STALE_MS) stale.add(peerUid);
      }
      setStalePeers(stale);
    };

    const unsub = onSnapshot(
      collection(db, 'thurup_rooms', roomId, 'presence'),
      (snap) => {
        const next = {};
        snap.docs.forEach((d) => {
          const data = d.data();
          next[data.uid] = data.lastSeen;
        });
        heartbeatsRef.current = next;
        recompute();
      },
      (err) => {
        // Presence is a nice-to-have UX signal, not core gameplay — fail
        // quietly (e.g. Firestore rules not yet deployed) rather than
        // spamming the console or breaking the page.
        console.warn('Presence listener error:', err.message);
      }
    );

    // Staleness must also be re-checked on a timer even without new
    // snapshots — a peer that stops beating won't trigger new events.
    const interval = setInterval(recompute, 5000);

    return () => {
      unsub();
      clearInterval(interval);
    };
  }, [roomId, uid]);

  return { stalePeers };
}
