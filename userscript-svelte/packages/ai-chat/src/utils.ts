/**
 * Safely stringify a value to JSON. Never throws.
 * Returns `"null"` for circular or non-serializable values.
 */
export function safeJsonStringify(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return 'null';
  }
}
