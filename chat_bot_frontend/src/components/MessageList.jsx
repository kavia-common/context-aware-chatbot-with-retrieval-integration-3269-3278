import React from 'react';
import '../styles/chat.css';

/**
 * PUBLIC_INTERFACE
 * @param {{ messages: Array<import('../api/types').Message> }} props
 */
export default function MessageList({ messages }) {
  return (
    <div className="msg-list" role="log" aria-live="polite">
      {messages.map((m) => (
        <div key={m.id} className={`msg-row ${m.role}`}>
          <div className={`msg-bubble ${m.role}`}>
            <div>{m.content}</div>
            {m.role === 'assistant' && m.sources?.length ? (
              <div className="sources" aria-label="sources">
                {m.sources.map((s) => (
                  <div key={s.id} className="source-card">
                    <p className="source-title">{s.title}</p>
                    {s.url ? (
                      <a className="source-link" href={s.url} target="_blank" rel="noreferrer">
                        View source ↗
                      </a>
                    ) : null}
                    {s.snippet ? <div className="source-snippet">{s.snippet}</div> : null}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
