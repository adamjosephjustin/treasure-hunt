/**
 * useChat.js — Real-time text chat backed by Firestore.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  db,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  getUid,
} from '../utils/firebase';

export function useChat(roomId) {
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const isVisibleRef = useRef(true);
  const unsubRef = useRef(null);

  useEffect(() => {
    if (!roomId) return;

    const q = query(
      collection(db, 'thurup_rooms', roomId, 'chat'),
      orderBy('timestamp', 'asc'),
      limit(200)
    );

    unsubRef.current = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMessages(msgs);
      if (!isVisibleRef.current) {
        setUnreadCount((prev) => prev + snap.docChanges().filter(c => c.type === 'added').length);
      }
    });

    return () => unsubRef.current?.();
  }, [roomId]);

  const sendMessage = useCallback(
    async (text, displayName) => {
      if (!roomId || !text.trim()) return;
      const uid = getUid();
      await addDoc(collection(db, 'thurup_rooms', roomId, 'chat'), {
        sender: uid,
        displayName: displayName || 'Player',
        text: text.trim(),
        timestamp: new Date().toISOString(),
      });
    },
    [roomId]
  );

  const markVisible = useCallback((visible) => {
    isVisibleRef.current = visible;
    if (visible) setUnreadCount(0);
  }, []);

  return { messages, sendMessage, unreadCount, markVisible };
}
