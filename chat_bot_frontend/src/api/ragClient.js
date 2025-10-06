import { RAG_BACKEND } from '../config/appConfig';
import { MockRAGClient } from './mockRagClient';

/**
 * Placeholder HTTP client with the same interface as MockRAGClient.
 * Not implemented; left ready for future integration.
 */
class HttpRAGClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.conversationId = '';
  }

  ensureConvId() {
    // Real implementation would maintain conversation via backend or local state
    if (!this.conversationId) {
      this.conversationId = 'pending-real-conv';
    }
    return this.conversationId;
  }

  // PUBLIC_INTERFACE
  async ingestUrl(_url) {
    // Placeholder to be replaced with: POST {baseURL}/ingest/url { url }
    // Expected response: { corpus: { id, title, url, createdAt }, summary }
    throw new Error('HTTP ingestUrl not implemented. Use mock mode or implement POST /ingest/url.');
  }

  // PUBLIC_INTERFACE
  async sendMessage(_req) {
    // Placeholder to be replaced with: POST {baseURL}/chat { messages, corpusId?, ... }
    throw new Error('HTTP RAG client is not implemented yet. Set RAG_BACKEND.mode to "mock" for demo.');
  }

  // PUBLIC_INTERFACE
  async *sendMessageStream(_req, _signal) {
    // Placeholder to be replaced with streaming endpoint, e.g., POST {baseURL}/chat/stream
    throw new Error('HTTP RAG client streaming is not implemented yet. Set RAG_BACKEND.mode to "mock" for demo.');
  }
}

// PUBLIC_INTERFACE
export function getRAGClient() {
  if (RAG_BACKEND.mode === 'mock') {
    return new MockRAGClient();
  }
  return new HttpRAGClient(RAG_BACKEND.baseURL);
}
