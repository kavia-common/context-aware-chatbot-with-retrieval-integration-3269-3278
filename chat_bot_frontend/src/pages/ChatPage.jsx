import React, { useMemo, useRef, useState } from 'react';
import { getRAGClient } from '../api/ragClient';
import { RAG_BACKEND } from '../config/appConfig';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';
import '../styles/chat.css';

function makeId() {
  return Math.random().toString(36).slice(2);
}

export default function ChatPage() {
  const client = useMemo(() => getRAGClient(), []);
  const [messages, setMessages] = useState(
    /** @type {import('../api/types').Message[]} */ ([
      {
        id: makeId(),
        role: 'assistant',
        content: 'Hi! I am your RAG-enabled assistant. Ask a question and I will cite helpful sources.',
      }
    ])
  );
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState('');
  const abortRef = useRef(null);

  const sendNonStreaming = async (userText) => {
    const req = {
      conversationId: client.conversationId,
      messages: [{ role: 'user', content: userText }],
      topK: 3
    };
    const resp = await client.sendMessage(req);
    setMessages((prev) => {
      const next = prev.slice();
      next.push({
        id: makeId(),
        role: 'assistant',
        content: resp.answer,
        sources: resp.sources || []
      });
      return next;
    });
  };

  const sendStreaming = async (userText) => {
    const req = {
      conversationId: client.conversationId,
      messages: [{ role: 'user', content: userText }],
      topK: 3
    };

    const controller = new AbortController();
    abortRef.current = controller;
    setIsStreaming(true);
    setError('');

    // create placeholder assistant message to progressively update
    const assistantId = makeId();
    setMessages((prev) => prev.concat([{ id: assistantId, role: 'assistant', content: '' }]));

    try {
      const stream = client.sendMessageStream(req, controller.signal);
      for await (const chunk of stream) {
        if (typeof chunk === 'string') {
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: (m.content || '') + chunk } : m))
          );
        } else if (chunk && typeof chunk === 'object' && chunk.done) {
          const resp = chunk.response;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: resp.answer, sources: resp.sources || [] }
                : m
            )
          );
        }
      }
    } catch (e) {
      if (e && e.name === 'AbortError') {
        setMessages((prev) =>
          prev.filter((m) => m.id !== assistantId)
        );
        setError('Streaming was cancelled.');
      } else {
        setError('Something went wrong while streaming the response.');
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  };

  const handleSend = async (text) => {
    setError('');
    setMessages((prev) => prev.concat([{ id: makeId(), role: 'user', content: text }]));
    try {
      if (RAG_BACKEND.streaming) {
        await sendStreaming(text);
      } else {
        await sendNonStreaming(text);
      }
    } catch (e) {
      setError('Failed to send message. Please try again.');
      setIsStreaming(false);
    }
  };

  const handleStop = () => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
  };

  return (
    <div className="chat-app">
      <header className="chat-header">
        <span className="brand-dot" />
        <div className="chat-title">RAG Chat</div>
      </header>

      <main className="chat-container">
        {error ? <div className="inline-error" role="alert">{error}</div> : null}
        <MessageList messages={messages} />
        {isStreaming ? (
          <div className="typing" aria-live="polite" style={{ marginTop: 8 }}>
            <span className="dot" /><span className="dot" /><span className="dot" />
          </div>
        ) : null}
      </main>

      <MessageInput
        onSend={handleSend}
        onStop={handleStop}
        isStreaming={isStreaming}
        disabled={false}
      />
    </div>
  );
}
