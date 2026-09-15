/**
 * Unique ID generator for offline-created entities in SmritiCare.
 * Generates unique, collision-resistant CUID/UUID-like strings.
 */
export function generateLocalId(prefix: string = 'loc'): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  const counter = Math.floor(Math.random() * 10000).toString(36);
  return `${prefix}_${timestamp}${randomPart}${counter}`;
}
