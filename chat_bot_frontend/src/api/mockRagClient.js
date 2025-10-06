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
 * Domain helper
 */
function domainFromUrl(url) {
  try {
    const u = new URL(url);
    return u.host.replace(/^www\./, '');
  } catch {
    return '';
  }
}

/**
 * Generates mock sources based on user text and optional corpus
 * @param {string} userText
 * @param {import('./types').Corpus | null} corpus
 * @returns {import('./types').Source[]}
 */
function generateMockSources(userText, corpus) {
  const base = userText.slice(0, 24) || 'query';
  if (corpus) {
    return [
      {
        id: uuidv4(),
        title: `${corpus.title} — Key Steps`,
        url: corpus.url,
        snippet: `Context grounded from ${domainFromUrl(corpus.url)} for: "${base}..."`,
        score: 0.96
      },
      {
        id: uuidv4(),
        title: `${corpus.title} — Reference`,
        url: corpus.url,
        snippet: 'Relevant excerpt aligned with your question from the ingested page.',
        score: 0.89
      }
    ];
  }
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
 * In-memory conversation and corpus store (per browser session)
 */
const memoryStore = {
  currentConversationId: '',
  corporaById: /** @type {Record<string, import('./types').Corpus>} */ ({}),
  corpusIdByUrl: /** @type {Record<string, string>} */ ({})
};

/**
 * Mock RAG client with ingestion and streaming simulation
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
   * Ingest a URL and return a corpus descriptor. Simulates fetching, chunking, embedding.
   * @param {string} url
   * @returns {Promise<import('./types').IngestionResult>}
   */
  async ingestUrl(url) {
    // Simulate network and processing latency
    await delay(600 + Math.random() * 400);

    // Reuse existing corpus for same URL within the session
    let corpusId = memoryStore.corpusIdByUrl[url];
    if (!corpusId) {
      corpusId = uuidv4();
      const d = domainFromUrl(url);
      /** @type {import('./types').Corpus} */
      const corpus = {
        id: corpusId,
        title: d ? `Ingested: ${d}` : 'Ingested Source',
        url,
        createdAt: new Date().toISOString()
      };
      memoryStore.corpusIdByUrl[url] = corpusId;
      memoryStore.corporaById[corpusId] = corpus;
    }
    const corpus = memoryStore.corporaById[corpusId];
    return {
      corpus,
      summary: `Content from ${corpus.title} has been parsed and embedded for retrieval.`
    };
  }

  /**
   * PUBLIC_INTERFACE
   * Send a non-streaming message and get a full response grounded by corpus when provided.
   * @param {import('./types').ChatRequest} req
   * @returns {Promise<import('./types').ChatResponse>}
   */
  async sendMessage(req) {
    const convId = req.conversationId || this.ensureConvId();
    const last = req.messages[req.messages.length - 1];
    const userText = last?.content || '';
    await delay(400 + Math.random() * 300);

    const corpusId = req.options?.corpusId || req.meta?.corpusId; // support either location
    const corpus = corpusId ? memoryStore.corporaById[corpusId] || null : null;

    let answer;
    if (corpus) {
      const dom = domainFromUrl(corpus.url);
      // Vary answer using simple hash of question
      const variant = userText.length % 3;
      const azureHint = corpus.url.includes('learn.microsoft.com')
        ? ' For Azure portal quick-create, open Azure portal, select Virtual Machines, click Create, pick an image/size, configure networking, and Review + create.'
        : '';
      const base =
        `Grounded in ${dom}: Based on the ingested content, here's a focused answer to your query.` + azureHint;
      if (variant === 0) {
        answer = base + ' I included steps and considerations specific to that page.';
      } else if (variant === 1) {
        answer = base + ' Key points are summarized with references below.';
      } else {
        answer = base + ' See the cited page for detailed walkthroughs.';
      }
    } else {
      const variants = [
        'Here is a concise, general mock answer without a specific corpus.',
        'This is a generic response. Ingest a URL to get page-grounded answers.',
        'General mock reply. Provide a URL to tailor results.'
      ];
      answer = variants[userText.length % variants.length];
    }

    const sources = generateMockSources(userText, corpus);
    return {
      conversationId: convId,
      answer,
      sources,
      usage: { tokens: 128, latencyMs: 500 }
    };
  }

  /**
   * PUBLIC_INTERFACE
   * Simulated streaming via async generator (grounded by corpus when provided)
   * Yields string chunks and finally an object with { done: true, response }
   * @param {import('./types').ChatRequest} req
   * @param {AbortSignal} [signal]
   */
  async *sendMessageStream(req, signal) {
    const convId = req.conversationId || this.ensureConvId();
    const last = req.messages[req.messages.length - 1];
    const userText = last?.content || '';

    const corpusId = req.options?.corpusId || req.meta?.corpusId;
    const corpus = corpusId ? memoryStore.corporaById[corpusId] || null : null;
    const dom = corpus ? domainFromUrl(corpus.url) : null;

    const intro = corpus
      ? `Grounding on ${dom}. `
      : 'No corpus selected. ';
    const chunks = [
      intro,
      'Thinking through the question. ',
      corpus ? 'Retrieving context chunks from the ingested page. ' : 'Using general knowledge. ',
      'Composing answer... '
    ];

    for (let i = 0; i < chunks.length; i++) {
      if (signal?.aborted) {
        // Throw to allow caller to handle cancel
        throw new DOMException('Aborted', 'AbortError');
      }
      await delay(250 + Math.random() * 220);
      yield chunks[i];
    }

    await delay(250);
    const sources = generateMockSources(userText, corpus);
    /** @type {import('./types').ChatResponse} */
    const finalPayload = {
      conversationId: convId,
      answer:
        chunks.join('') +
        (corpus ? ' Answer grounded by the provided URL.' : ' General mock response.') +
        ' Hope this helps!',
      sources,
      usage: { tokens: 196, latencyMs: 1200 }
    };
    yield { done: true, response: finalPayload };
  }
}

/**
 * Minimal UUID v4 polyfill using random numbers to avoid extra deps
 * Only for mock/demo purposes
 */
