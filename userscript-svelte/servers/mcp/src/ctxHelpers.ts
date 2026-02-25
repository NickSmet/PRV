/**
 * ctx helpers for the execute_report_code sandbox.
 *
 * Kept in a separate module so they can be reused by local tooling.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function preview(value: unknown, maxLen = 200): string {
  const s =
    typeof value === 'string'
      ? value
      : value === null || value === undefined
        ? ''
        : JSON.stringify(value, null, 2);
  if (s.length <= maxLen) return s;
  return s.slice(0, maxLen) + '…';
}

export type RawCloneOptions = {
  maxDepth?: number;
  includeSymbols?: boolean;
  maxArrayItems?: number;
};

export type SchemaOptions = {
  /**
   * Max characters to return. Defaults to 200k (keeps tool output safe).
   * If truncated, "…truncated…" is appended.
   */
  maxChars?: number;
  /**
   * Optional substring filter. If provided, only matching lines are returned,
   * including a few surrounding context lines.
   *
   * Tip: query for "Path: host.storage" or "export interface ReportViewVmsSettings".
   */
  query?: string;
  /** Number of context lines around each match (default 3, max 20). */
  contextLines?: number;
};

let cachedSchema: string | null = null;

function resolveSchemaPath(): string | null {
  const cwdCandidate = path.resolve(process.cwd(), 'docs', 'reportview-shape.generated.ts');
  if (fs.existsSync(cwdCandidate)) return cwdCandidate;

  // Fallback: resolve relative to this module (monorepo layout).
  try {
    const here = path.dirname(fileURLToPath(import.meta.url));
    const candidate = path.resolve(here, '..', '..', '..', 'docs', 'reportview-shape.generated.ts');
    if (fs.existsSync(candidate)) return candidate;
  } catch {
    // ignore
  }

  return null;
}

export function schema(opts?: SchemaOptions): string {
  const maxChars = Math.max(1000, Math.min(opts?.maxChars ?? 200_000, 2_000_000));
  if (cachedSchema === null) {
    const schemaPath = resolveSchemaPath();
    if (!schemaPath) {
      cachedSchema = 'Schema not available: docs/reportview-shape.generated.ts not found.';
    } else {
      try {
        cachedSchema = fs.readFileSync(schemaPath, 'utf8');
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        cachedSchema = `Schema not available: failed to read ${schemaPath} (${msg})`;
      }
    }
  }

  const query = (opts?.query ?? '').trim();
  const contextLines = Math.max(0, Math.min(opts?.contextLines ?? 3, 20));

  let out = cachedSchema;
  if (query) {
    const lines = cachedSchema.split('\n');
    const hits: Array<{ start: number; end: number }> = [];

    for (let i = 0; i < lines.length; i++) {
      if (!lines[i]?.includes(query)) continue;
      const start = Math.max(0, i - contextLines);
      const end = Math.min(lines.length - 1, i + contextLines);
      hits.push({ start, end });
    }

    // Merge overlapping ranges
    hits.sort((a, b) => a.start - b.start);
    const merged: Array<{ start: number; end: number }> = [];
    for (const r of hits) {
      const last = merged[merged.length - 1];
      if (!last || r.start > last.end + 1) merged.push({ ...r });
      else last.end = Math.max(last.end, r.end);
    }

    const pieces: string[] = [];
    pieces.push(`// schema(query=${JSON.stringify(query)}, contextLines=${contextLines})`);
    for (const r of merged) {
      pieces.push(...lines.slice(r.start, r.end + 1));
      pieces.push(''); // visual separator
    }
    out = pieces.join('\n').trimEnd() + '\n';
  }

  if (out.length <= maxChars) return out;
  return out.slice(0, maxChars) + '\n…truncated…\n';
}

export function cloneIncludingHidden(value: unknown, opts?: RawCloneOptions): unknown {
  const maxDepth = Math.max(0, Math.min(opts?.maxDepth ?? 3, 10));
  const includeSymbols = !!opts?.includeSymbols;
  const maxArrayItems = Math.max(0, Math.min(opts?.maxArrayItems ?? 200, 5000));

  const isDateLike = (v: unknown): v is Date =>
    Object.prototype.toString.call(v) === '[object Date]';

  const seen = new WeakMap<object, any>();

  const clone = (v: any, depth: number): any => {
    if (v === null || v === undefined) return v;
    if (typeof v !== 'object') return v;
    if (isDateLike(v)) return new Date(v.valueOf()).toISOString();
    if (depth >= maxDepth) return preview(v, 200);
    if (seen.has(v)) return '[Circular]';

    if (Array.isArray(v)) {
      const arr = v.slice(0, maxArrayItems).map((x) => clone(x, depth + 1));
      if (v.length > arr.length) arr.push(`… +${v.length - arr.length} more`);
      return arr;
    }

    const out: Record<string, any> = {};
    seen.set(v, out);
    const keys = includeSymbols ? Reflect.ownKeys(v) : Object.getOwnPropertyNames(v);

    for (const key of keys) {
      if (typeof key === 'symbol') continue;
      const desc = Object.getOwnPropertyDescriptor(v, key);
      if (!desc || !('value' in desc)) continue;
      out[key] = clone((desc as any).value, depth + 1);
    }
    return out;
  };

  return clone(value, 0);
}
