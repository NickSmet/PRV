import type { LogRow } from '$lib/logs/index/types';

export function messageSegments(text: string, query: string): Array<{ text: string; match: boolean }> {
  if (!query) return [{ text, match: false }];
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const segments: Array<{ text: string; match: boolean }> = [];
  let offset = 0;

  while (offset < text.length) {
    const matchAt = lowerText.indexOf(lowerQuery, offset);
    if (matchAt < 0) break;
    if (matchAt > offset) {
      segments.push({ text: text.slice(offset, matchAt), match: false });
    }
    segments.push({ text: text.slice(matchAt, matchAt + query.length), match: true });
    offset = matchAt + query.length;
  }

  if (offset < text.length) {
    segments.push({ text: text.slice(offset), match: false });
  }

  return segments.length > 0 ? segments : [{ text, match: false }];
}

export function rowHasVisibleMatch(row: LogRow, query: string): boolean {
  if (!query) return false;
  return row.message.toLowerCase().includes(query.toLowerCase());
}
