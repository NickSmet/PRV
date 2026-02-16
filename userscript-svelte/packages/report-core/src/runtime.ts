import { parseHTML } from 'linkedom';

/**
 * Ensure DOMParser/XMLSerializer exist on globalThis in Node runtimes.
 * Many existing parsers use DOMParser; this provides compatibility without rewriting them.
 */
export function ensureDomParser(): void {
  if (typeof (globalThis as any).DOMParser !== 'undefined') return;
  const { window } = parseHTML('<html></html>');
  (globalThis as any).DOMParser = window.DOMParser;
  (globalThis as any).XMLSerializer = window.XMLSerializer;
}

