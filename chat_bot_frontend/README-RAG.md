# RAG Integration (Mock + Ready for HTTP)

This frontend includes a mock RAG client so the chat UI works end-to-end without a backend. You can later switch to a real backend by updating the config.

## Where things live

- Config: `src/config/appConfig.js`
- API types (JSDoc): `src/api/types.js`
- Mock client: `src/api/mockRagClient.js`
- RAG client factory: `src/api/ragClient.js`
- Chat UI:
  - Page: `src/pages/ChatPage.jsx`
  - Components: `src/components/MessageList.jsx`, `src/components/MessageInput.jsx`, `src/components/IngestionBar.jsx`
  - Styles: `src/styles/chat.css`

## URL Ingestion (Mock)

You can paste a URL and ingest it locally (no external services). After ingestion, answers are grounded in that page.

How to use:
1. In the header, use the “Ingest” bar to paste a URL (e.g., https://learn.microsoft.com/en-us/azure/virtual-machines/windows/quick-create-portal) and click Ingest.
2. A success banner will confirm ingestion and a pill will show the active source domain.
3. Ask questions; the assistant will reference that page and cite it in the sources.
4. Click the ✕ on the pill to clear the active source.

Notes:
- Ingested corpora live in-memory per browser session. Re-ingesting the same URL reuses the same corpus ID.
- The chat request includes `options.corpusId` so answers can be grounded.
- All logic is local and mock-only.

## Switching modes

- By default, the app runs in `mock` mode.
- To switch to HTTP (real backend), change `RAG_BACKEND.mode` to `'http'` in `src/config/appConfig.js`, or set the environment variable:

```bash
# .env (create in project root or set in your env)
REACT_APP_RAG_MODE=http
REACT_APP_RAG_BASE_URL=https://your-rag-backend.example.com
```

In `http` mode, the `HttpRAGClient` in `src/api/ragClient.js` provides the interface but is not implemented. You will need to implement:
- `ingestUrl(url): Promise<IngestionResult>` -> POST `/ingest/url`
- `sendMessage(req): Promise<ChatResponse>` -> POST `/chat`
- `sendMessageStream(req, signal): AsyncGenerator` -> POST `/chat/stream` (optional)

## Expected endpoints (for future backend)

- `POST /ingest/url`
  - Request: `{ url: string }`
  - Response:
    ```json
    {
      "corpus": {
        "id": "abc123",
        "title": "Ingested: learn.microsoft.com",
        "url": "https://learn.microsoft.com/en-us/azure/virtual-machines/windows/quick-create-portal",
        "createdAt": "2024-01-01T12:00:00.000Z"
      },
      "summary": "Content parsed and embedded."
    }
    ```

- `POST /chat`
  - Request:
    ```json
    {
      "conversationId": "optional",
      "messages": [{ "role": "user", "content": "How do I create a Windows VM in Azure portal?" }],
      "topK": 3,
      "options": { "corpusId": "abc123" }
    }
    ```
  - Response:
    ```json
    {
      "conversationId": "conv-1",
      "answer": "Grounded answer...",
      "sources": [
        { "id": "s1", "title": "Azure portal quick create", "url": "https://learn.microsoft.com/..."}
      ],
      "usage": { "tokens": 512 }
    }
    ```

- `POST /chat/stream` (optional)
  - Stream chunks of text and a final JSON payload with `sources`.

CORS: Enable CORS for `http://localhost:3000`.

## Auth headers

If your backend requires authentication, add header logic in `HttpRAGClient` methods inside `src/api/ragClient.js`:
```js
// Example:
// const token = localStorage.getItem('token');
// const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }, body: JSON.stringify(req) });
```

## Environment variables

The mock client requires no external keys. For HTTP mode, configure:

```bash
# .env (examples)
REACT_APP_RAG_MODE=http
REACT_APP_RAG_BASE_URL=https://your-rag-backend.example.com
```

Restart dev server after changes.

## Styling

The chat uses a modern style with:
- primary: #2563EB
- secondary: #F59E0B
- background: #f9fafb
- surface: #ffffff
- text: #111827

Adjust in `src/config/appConfig.js` or `src/styles/chat.css`.
