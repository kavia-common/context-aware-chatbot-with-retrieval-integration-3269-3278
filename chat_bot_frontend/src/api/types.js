/**
 * @typedef {'user'|'assistant'|'system'} Role
 */

/**
 * @typedef {Object} Source
 * @property {string} id
 * @property {string} title
 * @property {string} [url]
 * @property {string} [snippet]
 * @property {number} [score]
 */

/**
 * @typedef {Object} Message
 * @property {string} id
 * @property {Role} role
 * @property {string} content
 * @property {Source[]} [sources]
 */

/**
 * Optional options for chat calls.
 * @typedef {Object} ChatOptions
 * @property {string} [corpusId] - If provided, the backend should ground answers using this corpus.
 */

/**
 * @typedef {Object} ChatRequest
 * @property {string} [conversationId]
 * @property {{ role: Role; content: string }[]} messages
 * @property {number} [topK]
 * @property {Record<string, any>} [meta]
 * @property {ChatOptions} [options]
 */

/**
 * @typedef {Object} ChatResponse
 * @property {string} conversationId
 * @property {string} answer
 * @property {Source[]} [sources]
 * @property {Record<string, any>} [usage]
 */

/**
 * A corpus created by ingesting a URL or other source.
 * @typedef {Object} Corpus
 * @property {string} id
 * @property {string} title
 * @property {string} url
 * @property {string} createdAt
 */

/**
 * Result from ingestion.
 * @typedef {Object} IngestionResult
 * @property {Corpus} corpus
 * @property {string} summary
 */
