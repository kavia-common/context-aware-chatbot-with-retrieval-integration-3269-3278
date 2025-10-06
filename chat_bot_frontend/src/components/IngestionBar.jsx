import React, { useState } from 'react';
import '../styles/chat.css';

/**
 * PUBLIC_INTERFACE
 * IngestionBar: URL ingestion UI with loading, success, and error states.
 * Props:
 * - client: RAG client that implements ingestUrl(url): Promise<IngestionResult>
 * - onIngested: (corpus: import('../api/types').Corpus) => void
 */
export default function IngestionBar({ client, onIngested }) {
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [okMsg, setOkMsg] = useState('');
  const [errMsg, setErrMsg] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setOkMsg('');
    setErrMsg('');
    const trimmed = url.trim();
    if (!trimmed) {
      setErrMsg('Please paste a URL to ingest.');
      return;
    }
    try {
      setBusy(true);
      const res = await client.ingestUrl(trimmed);
      setOkMsg(`Ingested: ${res.corpus.title}`);
      setUrl('');
      onIngested?.(res.corpus);
    } catch (err) {
      setErrMsg('Failed to ingest URL. Please check the link and try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="ingest-bar">
      <form className="ingest-inner" onSubmit={onSubmit}>
        <input
          className="ingest-input"
          type="url"
          placeholder="Paste a URL to ground answers (e.g., https://learn.microsoft.com/...)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={busy}
          aria-label="URL to ingest"
        />
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? 'Ingesting…' : 'Ingest'}
        </button>
      </form>
      {okMsg ? <div className="banner banner-success" role="status">{okMsg}</div> : null}
      {errMsg ? <div className="banner banner-error" role="alert">{errMsg}</div> : null}
    </div>
  );
}
