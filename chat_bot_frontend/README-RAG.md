# RAG Integration (Mock + Ready for HTTP)

This frontend includes a mock RAG client so the chat UI works end-to-end without a backend. You can later switch to a real backend by updating the config.

## Where things live

- Config: `src/config/appConfig.js`
- API types (JSDoc): `src/api/types.js`
- Mock client: `src/api/mockRagClient.js`
- RAG client factory: `src/api/ragClient.js`
- Chat UI:
  - Page: `src/pages/ChatPage.jsx`
  - Components: `src/components/MessageList.jsx`, `src/components/MessageInput.jsx`
  - Styles: `src/styles/chat.css`

## Switching modes

- By default, the app runs in `mock` mode.
- To switch to HTTP (real backend), change `RAG_BACKEND.mode` to `'http'` in `src/config/appConfig.js`, or set the environment variable:

```bash
# .env (create in project root or set in your env)
REACT_APP_RAG_MODE=http
REACT_APP_RAG_BASE_URL=https://your-rag-backend.example.com
```

In `http` mode, the `HttpRAGClient` in `src/api/ragClient.js` provides the interface but is not implemented. You will need to implement:
- `sendMessage(req): Promise<ChatResponse>`
- `sendMessageStream(req, signal): AsyncGenerator`

pointing to your backend endpoints.

## Expected endpoints (example)

- Non-streaming: `POST /chat`
  - Body: `{ conversationId?: string, messages: [{role, content}], topK?: number, meta?: {} }`
  - Response: `{ conversationId: string, answer: string, sources?: Source[], usage?: {} }`

- Streaming: `POST /chat/stream` (SSE or chunked)
  - Yields text chunks and a final message with sources.

You can adjust these in your implementation.

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
