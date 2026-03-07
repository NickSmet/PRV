import { queryRowsForSources, readRowsAfterLineNo } from './db';
import type { LogKind, LogRow } from './types';

type QueryRequest =
  | {
      type: 'query';
      jobId: number;
      reportId: string;
      sourceFiles: string[];
      search: string;
      kinds: LogKind[] | null;
      limit: number;
      requireTimestamp?: boolean;
      requireNonEmptyMessage?: boolean;
      windowStart: number;
      windowSize: number;
      align?: 'top' | 'bottom';
    }
  | {
      type: 'poll';
      jobId: number;
      reportId: string;
      sourceFiles: string[];
      search: string;
      kinds: LogKind[] | null;
      limit: number;
      requireTimestamp?: boolean;
      requireNonEmptyMessage?: boolean;
      windowSize: number;
      align?: 'top' | 'bottom';
    }
  | {
      type: 'find';
      jobId: number;
      query: string;
      activeRowId?: string | null;
      anchorRowId?: string | null;
    }
  | {
      type: 'window';
      jobId: number;
      windowStart: number;
      windowSize: number;
    };

type QueryResponse =
  | {
      type: 'result';
      jobId: number;
      result: {
        totalRows: number;
        totalMatches: number;
        clipped: boolean;
        windowStart: number;
        rows: LogRow[];
      };
    }
  | {
      type: 'find';
      jobId: number;
      result: {
        query: string;
        matchIndexes: number[];
        matchRowIds: string[];
        activeOrdinal: number;
      };
    }
  | {
      type: 'error';
      jobId: number;
      message: string;
    };

function postMessageSafe(message: QueryResponse) {
  (self as DedicatedWorkerGlobalScope).postMessage(message);
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

async function runQuery(request: QueryRequest) {
  if (request.type === 'window') {
    throw new Error('Window request cannot be handled without an active query');
  }
  if (request.type === 'poll') {
    throw new Error('Poll request cannot be handled without an active query');
  }
  if (request.type === 'find') {
    throw new Error('Find request cannot be handled by query runner');
  }

  const result = await queryRowsForSources({
    reportId: request.reportId,
    sourceFiles: request.sourceFiles,
    search: request.search,
    kinds: request.kinds,
    limit: request.limit,
    requireTimestamp: request.requireTimestamp,
    requireNonEmptyMessage: request.requireNonEmptyMessage
  });

  const totalRows = result.rows.length;
  const totalMatches = result.totalMatches;
  const clipped = result.clipped;

  const windowSize = Math.max(1, Math.trunc(request.windowSize));
  const windowStart =
    request.align === 'bottom'
      ? Math.max(0, totalRows - windowSize)
      : Math.max(0, Math.min(Math.trunc(request.windowStart), Math.max(0, totalRows - windowSize)));

  cache = {
    key: makeKey({
      reportId: request.reportId,
      sourceFiles: request.sourceFiles,
      search: request.search,
      kinds: request.kinds,
      limit: request.limit,
      requireTimestamp: request.requireTimestamp,
      requireNonEmptyMessage: request.requireNonEmptyMessage
    }),
    rows: result.rows,
    totalRows,
    totalMatches,
    clipped,
    reportId: request.reportId,
    sourceFiles: [...request.sourceFiles],
    search: request.search,
    kinds: request.kinds ? [...request.kinds] : null,
    limit: request.limit,
    requireTimestamp: request.requireTimestamp ?? false,
    requireNonEmptyMessage: request.requireNonEmptyMessage ?? false,
    perSourceMaxLineNo: Object.fromEntries(
      request.sourceFiles.map((sourceFile) => [
        sourceFile,
        result.rows
          .filter((row) => row.sourceFile === sourceFile)
          .reduce((acc, row) => Math.max(acc, row.lineNo), 0)
      ])
    )
  };

  postMessageSafe({
    type: 'result',
    jobId: request.jobId,
    result: {
      totalRows,
      totalMatches,
      clipped,
      windowStart,
      rows: cache.rows.slice(windowStart, windowStart + windowSize)
    }
  });
}

type Cache = {
  key: string;
  rows: LogRow[];
  totalRows: number;
  totalMatches: number;
  clipped: boolean;
  reportId: string;
  sourceFiles: string[];
  search: string;
  kinds: LogKind[] | null;
  limit: number;
  requireTimestamp: boolean;
  requireNonEmptyMessage: boolean;
  perSourceMaxLineNo: Record<string, number>;
} | null;

let cache: Cache = null;

function makeKey(request: {
  reportId: string;
  sourceFiles: string[];
  search: string;
  kinds: LogKind[] | null;
  limit: number;
  requireTimestamp?: boolean;
  requireNonEmptyMessage?: boolean;
}): string {
  const kindsKey = request.kinds?.join(',') ?? '';
  const tsKey = request.requireTimestamp ? 'ts' : 'all';
  const msgKey = request.requireNonEmptyMessage ? 'msg' : 'raw';
  return `${request.reportId}|${request.sourceFiles.join(',')}|${request.search}|${kindsKey}|${request.limit}|${tsKey}|${msgKey}`;
}

function effectiveTs(row: LogRow, rowById: Map<string, LogRow>): number {
  if (row.tsWallMs != null) return row.tsWallMs;
  if (!row.parentId) return Number.POSITIVE_INFINITY;
  return rowById.get(row.parentId)?.tsWallMs ?? Number.POSITIVE_INFINITY;
}

function compareRowsByTimeThenSource(a: LogRow, b: LogRow, rowById: Map<string, LogRow>): number {
  const ta = effectiveTs(a, rowById);
  const tb = effectiveTs(b, rowById);
  if (ta !== tb) return ta - tb;
  if (a.sourceFile !== b.sourceFile) return a.sourceFile.localeCompare(b.sourceFile);
  return a.lineNo - b.lineNo;
}

function sendWindow(jobId: number, windowStart: number, windowSize: number) {
  if (!cache) {
    postMessageSafe({
      type: 'error',
      jobId,
      message: 'No cached query available for window request'
    });
    return;
  }

  const size = Math.max(1, Math.trunc(windowSize));
  const start = Math.max(0, Math.min(Math.trunc(windowStart), Math.max(0, cache.totalRows - size)));
  postMessageSafe({
    type: 'result',
    jobId,
    result: {
      totalRows: cache.totalRows,
      totalMatches: cache.totalMatches,
      clipped: cache.clipped,
      windowStart: start,
      rows: cache.rows.slice(start, start + size)
    }
  });
}

function buildFindResult(query: string, activeRowId?: string | null, anchorRowId?: string | null) {
  const trimmed = query.trim();
  if (!cache || !trimmed) {
    return {
      query: trimmed,
      matchIndexes: [],
      matchRowIds: [],
      activeOrdinal: -1
    };
  }

  const queryLower = trimmed.toLowerCase();
  const matchIndexes: number[] = [];
  const matchRowIds: string[] = [];

  for (let i = 0; i < cache.rows.length; i += 1) {
    const row = cache.rows[i]!;
    if (!row.raw.toLowerCase().includes(queryLower)) continue;
    matchIndexes.push(i);
    matchRowIds.push(row.id);
  }

  if (matchIndexes.length === 0) {
    return {
      query: trimmed,
      matchIndexes,
      matchRowIds,
      activeOrdinal: -1
    };
  }

  if (activeRowId) {
    const ordinal = matchRowIds.indexOf(activeRowId);
    if (ordinal >= 0) {
      return {
        query: trimmed,
        matchIndexes,
        matchRowIds,
        activeOrdinal: ordinal
      };
    }
  }

  if (anchorRowId) {
    const anchorIndex = cache.rows.findIndex((row) => row.id === anchorRowId);
    if (anchorIndex >= 0) {
      const ordinal = matchIndexes.findIndex((matchIndex) => matchIndex >= anchorIndex);
      return {
        query: trimmed,
        matchIndexes,
        matchRowIds,
        activeOrdinal: ordinal >= 0 ? ordinal : 0
      };
    }
  }

  return {
    query: trimmed,
    matchIndexes,
    matchRowIds,
    activeOrdinal: 0
  };
}

function sendFind(jobId: number, query: string, activeRowId?: string | null, anchorRowId?: string | null) {
  postMessageSafe({
    type: 'find',
    jobId,
    result: buildFindResult(query, activeRowId, anchorRowId)
  });
}

self.onmessage = (event: MessageEvent<QueryRequest>) => {
  if (!event.data) return;

  if (event.data.type === 'window') {
    sendWindow(event.data.jobId, event.data.windowStart, event.data.windowSize);
    return;
  }

  if (event.data.type === 'find') {
    sendFind(event.data.jobId, event.data.query, event.data.activeRowId, event.data.anchorRowId);
    return;
  }

  if (event.data.type === 'poll') {
    void runPoll(event.data).catch((error) => {
      postMessageSafe({ type: 'error', jobId: event.data.jobId, message: toErrorMessage(error) });
    });
    return;
  }

  void runQuery(event.data).catch((error) => {
    postMessageSafe({ type: 'error', jobId: event.data.jobId, message: toErrorMessage(error) });
  });
};

async function runPoll(request: Extract<QueryRequest, { type: 'poll' }>) {
  // Only poll for the "default" view (no filtering). Once filtering/search is enabled,
  // we fall back to a full query so totals and ordering remain correct.
  const hasFilters = request.search.trim() !== '' || (request.kinds?.length ?? 0) > 0;
  const requestKey = makeKey({
    reportId: request.reportId,
    sourceFiles: request.sourceFiles,
    search: request.search,
    kinds: request.kinds,
    limit: request.limit,
    requireTimestamp: request.requireTimestamp,
    requireNonEmptyMessage: request.requireNonEmptyMessage
  });

  if (hasFilters || !cache || cache.key !== requestKey) {
    await runQuery({
      type: 'query',
      jobId: request.jobId,
      reportId: request.reportId,
      sourceFiles: request.sourceFiles,
      search: request.search,
      kinds: request.kinds,
      limit: request.limit,
      requireTimestamp: request.requireTimestamp,
      requireNonEmptyMessage: request.requireNonEmptyMessage,
      windowStart: 0,
      windowSize: request.windowSize,
      align: request.align ?? 'bottom'
    });
    return;
  }

  let added = 0;
  for (const sourceFile of request.sourceFiles) {
    const afterLineNo = cache.perSourceMaxLineNo[sourceFile] ?? 0;
    // eslint-disable-next-line no-await-in-loop
    const next = await readRowsAfterLineNo({
      reportId: cache.reportId,
      sourceFile,
      afterLineNo,
      search: cache.search,
      kinds: cache.kinds,
      requireTimestamp: cache.requireTimestamp,
      requireNonEmptyMessage: cache.requireNonEmptyMessage,
      maxRows: 20_000
    });
    if (next.rows.length > 0) {
      cache.rows.push(...next.rows);
      cache.perSourceMaxLineNo[sourceFile] = Math.max(cache.perSourceMaxLineNo[sourceFile] ?? 0, next.maxLineNo);
      added += next.rows.length;
    }
  }

  if (added > 0) {
    cache.totalMatches += added;
    const rowById = new Map(cache.rows.map((row) => [row.id, row]));
    cache.rows.sort((a, b) => compareRowsByTimeThenSource(a, b, rowById));
    cache.clipped = cache.totalMatches > cache.limit;
    if (cache.rows.length > cache.limit) {
      cache.rows = cache.rows.slice(-cache.limit);
    }
    cache.totalRows = cache.rows.length;
  }

  const totalRows = cache.totalRows;
  const totalMatches = cache.totalMatches;
  const clipped = cache.clipped;
  const windowSize = Math.max(1, Math.trunc(request.windowSize));
  const windowStart = request.align === 'bottom' ? Math.max(0, totalRows - windowSize) : 0;

  postMessageSafe({
    type: 'result',
    jobId: request.jobId,
    result: {
      totalRows,
      totalMatches,
      clipped,
      windowStart,
      rows: cache.rows.slice(windowStart, windowStart + windowSize)
    }
  });
}
