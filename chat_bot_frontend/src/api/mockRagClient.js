/* eslint-disable no-unused-vars */
import uuidv4 from './uuid_polyfill'; // tiny local polyfill since no external deps

/**
 * Simple delay utility
 * @param {number} ms
 * @returns {Promise<void>}
 */
export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generates mock sources for demonstration
 * @param {string} userText
 * @returns {import('./types').Source[]}
 */
function generateMockSources(userText) {
  const base = userText.slice(0, 24) || 'query';
  return [
    {
      id: uuidv4(),
      title: `Doc: ${base} Overview`,
      url: 'https://example.com/docs/overview',
      snippet: 'This section provides an overview related to your question.',
      score: 0.92
    },
    {
      id: uuidv4(),
      title: `Guide: Best Practices`,
      url: 'https://example.com/guide/best-practices',
      snippet: 'Recommended steps and guidelines for effective usage.',
      score: 0.87
    },
    {
      id: uuidv4(),
      title: `Reference: API Spec`,
      url: 'https://example.com/api/spec',
      snippet: 'Detailed API reference that might be relevant.',
      score: 0.81
    }
  ];
}

/**
 * In-memory conversation store
 */
const memoryStore = {
  currentConversationId: '',
};

/**
 * Mock RAG client with streaming simulation
 */
export class MockRAGClient {
  constructor() {
    this.conversationId = memoryStore.currentConversationId || '';
  }

  ensureConvId() {
    if (!this.conversationId) {
      this.conversationId = uuidv4();
      memoryStore.currentConversationId = this.conversationId;
    }
    return this.conversationId;
  }

  /**
   * PUBLIC_INTERFACE
   * Send a non-streaming message and get a full response
   * @param {import('./types').ChatRequest} req
   * @returns {Promise<import('./types').ChatResponse>}
   */
  async sendMessage(req) {
    const convId = req.conversationId || this.ensureConvId();
    const last = req.messages[req.messages.length - 1];
    const userText = last?.content || '';
    await delay(500);

    const sources = generateMockSources(userText);
    const answer = [
      'Here is a concise, context-aware answer to your question.',
      'This mock response demonstrates how the UI handles sources and content.',
      'You can switch to a real backend later via configuration.'
    ].join(' ');

    return {
      conversationId: convId,
      answer,
      sources,
      usage: { tokens: 128, latencyMs: 500 }
    };
  }

  /**
   * PUBLIC_INTERFACE
   * Simulated streaming via async generator
   * Yields string chunks and finally an object with { done: true, response }
   * @param {import('./types').ChatRequest} req
   * @param {AbortSignal} [signal]
   */
  async *sendMessageStream(req, signal) {
    const convId = req.conversationId || this.ensureConvId();
    const last = req.messages[req.messages.length - 1];
    const userText = last?.content || '';

    const chunks = [
      'Sure, let me think through that. ',
      'First, we consider the key context and constraints. ',
      'Then, we identify relevant sources and evidence. ',
      'Finally, we synthesize a clear, actionable answer.'
    ];

    for (let i = 0; i < chunks.length; i++) {
      if (signal?.aborted) {
        // Throw to allow caller to handle cancel
        throw new DOMException('Aborted', 'AbortError');
      }
      await delay(350 + Math.random() * 200);
      yield chunks[i];
    }

    await delay(300);
    const sources = generateMockSources(userText);
    /** @type {import('./types').ChatResponse} */
    const finalPayload = {
      conversationId: convId,
      answer: chunks.join('') + ' Hope this helps!',
      sources,
      usage: { tokens: 196, latencyMs: 1400 }
    };
    yield { done: true, response: finalPayload };
  }
}

/**
 * Minimal UUID v4 polyfill using random numbers to avoid extra deps
 * Only for mock/demo purposes
 */
