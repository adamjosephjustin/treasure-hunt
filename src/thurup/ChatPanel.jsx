/**
 * ChatPanel.jsx — Collapsible text chat panel.
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getUid } from '../utils/firebase';

export default function ChatPanel({ messages, onSend, displayName, unreadCount, onVisibilityChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState('');
  const listRef = useRef(null);
  const uid = getUid();

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (listRef.current && isOpen) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  useEffect(() => {
    onVisibilityChange?.(isOpen);
  }, [isOpen, onVisibilityChange]);

  const handleSend = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onSend(text, displayName);
      setText('');
    }
  };

  const toggle = () => setIsOpen((prev) => !prev);

  return (
    <div className="chat-panel-wrapper">
      {/* Toggle button */}
      <motion.button
        className="chat-panel__toggle"
        onClick={toggle}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        💬
        {!isOpen && unreadCount > 0 && (
          <span className="chat-panel__badge">{unreadCount}</span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="chat-panel"
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div className="chat-panel__header">
              <h4>Chat</h4>
              <button className="chat-panel__close" onClick={toggle}>✕</button>
            </div>

            <div className="chat-panel__messages" ref={listRef}>
              {messages.length === 0 && (
                <p className="chat-panel__empty">No messages yet. Say hi! 👋</p>
              )}
              {messages.map((msg) => {
                const isMe = msg.sender === uid;
                return (
                  <div
                    key={msg.id}
                    className={`chat-panel__msg ${isMe ? 'chat-panel__msg--me' : ''}`}
                  >
                    {!isMe && (
                      <span className="chat-panel__sender">{msg.displayName}</span>
                    )}
                    <span className="chat-panel__text">{msg.text}</span>
                  </div>
                );
              })}
            </div>

            <form className="chat-panel__input-row" onSubmit={handleSend}>
              <input
                type="text"
                className="chat-panel__input"
                placeholder="Type a message..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={200}
              />
              <button type="submit" className="chat-panel__send">
                ➤
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
