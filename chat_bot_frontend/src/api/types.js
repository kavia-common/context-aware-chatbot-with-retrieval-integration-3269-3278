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
 * @typedef {Object} ChatRequest
 * @property {string} [conversationId]
 * @property {{ role: Role; content: string }[]} messages
 * @property {number} [topK]
 * @property {Record<string, any>} [meta]
 */

/**
 * @typedef {Object} ChatResponse
 * @property {string} conversationId
 * @property {string} answer
 * @property {Source[]} [sources]
 * @property {Record<string, any>} [usage]
 */
