import React, { useEffect, useRef, useState } from 'react';
import '../styles/chat.css';

/**
 * PUBLIC_INTERFACE
 * @param {{ onSend: (text: string) => void, onStop?: () => void, isStreaming?: boolean, disabled?: boolean }} props
 */
export default function MessageInput({ onSend, onStop, isStreaming, disabled }) {
  const [text, setText] = useState('');
  const taRef = useRef(null);

  useEffect(() => {
    if (taRef.current) {
      taRef.current.style.height = 'auto';
      taRef.current.style.height = `${Math.min(160, taRef.current.scrollHeight)}px`;
    }
  }, [text]);

  const handleSend = () => {
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="input-bar">
      <div className="input-inner">
        <textarea
          ref={taRef}
          className="textarea"
          placeholder="Ask anything about your knowledge..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!!disabled}
          aria-label="Message input"
        />
        {!isStreaming ? (
          <button className="btn btn-primary" onClick={handleSend} disabled={!!disabled}>
            Send
          </button>
        ) : (
          <button className="btn btn-warning" onClick={onStop}>
            Stop
          </button>
        )}
      </div>
    </div>
  );
}
