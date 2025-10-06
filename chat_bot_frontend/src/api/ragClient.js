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
  async sendMessage(_req) {
    throw new Error('HTTP RAG client is not implemented yet. Set RAG_BACKEND.mode to "mock" for demo.');
  }

  // PUBLIC_INTERFACE
  async *sendMessageStream(_req, _signal) {
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
