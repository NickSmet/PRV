/**
 * XML Utility Functions
 *
 * Shared utilities for parsing XML data across multiple parsers.
 */

/**
 * Parse XML string into a Document object
 */
export function parseXml(xml: string): Document | null {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'application/xml');
    const parseError = doc.querySelector('parsererror');
    if (parseError) {
      console.error('[xmlUtils] XML parsing error:', parseError.textContent);
      return null;
    }
    return doc;
  } catch (e) {
    console.error('[xmlUtils] Failed to parse XML:', e);
    return null;
  }
}

/**
 * Get text content from an element by selector
 * Can be used with Document or Element as parent
 */
export function getText(parent: Document | Element, selector: string): string | undefined {
  const el = parent.querySelector(selector);
  return el?.textContent?.trim() || undefined;
}
