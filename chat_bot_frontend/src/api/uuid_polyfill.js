/**
 * PUBLIC_INTERFACE
 * Generate a pseudo UUID v4 string. Not cryptographically secure.
 * @returns {string}
 */
export function v4() {
  const rnd = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).slice(1);
  return `${rnd()}${rnd()}-${rnd()}-${rnd()}-${rnd()}-${rnd()}${rnd()}${rnd()}`;
}

// default export compatibility
export default v4;
