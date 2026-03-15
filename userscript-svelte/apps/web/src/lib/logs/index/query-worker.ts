import { queryRowsForSources, readRowsAfterLineNo } from './db';
import type { LogKind, LogRow } from './types';
import type { LogRowLocator } from '$lib/lab/timeline/types';

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
      /** Optional global match ordinal to focus (0-based). */
      targetOrdinal?: number | null;
    }
  | {
      type: 'locate';
      jobId: number;
      locator: LogRowLocator;
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
        /** Active match ordinal in the full (uncapped) match list. */
        activeOrdinal: number;
        /** Global ordinal of matchIndexes[0] within the full match list. */
        windowStartOrdinal: number;
        totalMatchCount: number;
      };
    }
  | {
      type: 'locate';
      jobId: number;
      result: {
        rowIndex: number;
        row: LogRow | null;
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

/**
 * Maximum number of match positions returned to the main thread per find.
 * Capping prevents large postMessage payloads (structured-clone cost) and
 * avoids main-thread stalls when queries like "driver" match tens of thousands
 * of rows. Navigation still works within the capped window;
 * totalMatchCount carries the real total for display.
 */
const MAX_FIND_HIGHLIGHTS = 10_000;

function buildFindResult(
  query: string,
  activeRowId?: string | null,
  anchorRowId?: string | null,
  targetOrdinal?: number | null
) {
  const trimmed = query.trim();
  if (!cache || !trimmed) {
    return {
      query: trimmed,
      matchIndexes: [] as number[],
      matchRowIds: [] as string[],
      activeOrdinal: -1,
      windowStartOrdinal: 0,
      totalMatchCount: 0
    };
  }

  const queryLower = trimmed.toLowerCase();
  const allMatchIndexes: number[] = [];
  const allMatchRowIds: string[] = [];

  for (let i = 0; i < cache.rows.length; i += 1) {
    const row = cache.rows[i]!;
    if (!row.raw.toLowerCase().includes(queryLower)) continue;
    allMatchIndexes.push(i);
    allMatchRowIds.push(row.id);
  }

  const totalMatchCount = allMatchIndexes.length;

  if (totalMatchCount === 0) {
    return {
      query: trimmed,
      matchIndexes: allMatchIndexes,
      matchRowIds: allMatchRowIds,
      activeOrdinal: -1,
      windowStartOrdinal: 0,
      totalMatchCount: 0
    };
  }

  // Determine active ordinal before we potentially cap the arrays.
  let activeOrdinal = 0;
  if (targetOrdinal != null && Number.isFinite(targetOrdinal)) {
    const desired = Math.trunc(targetOrdinal);
    activeOrdinal = Math.max(0, Math.min(desired, totalMatchCount - 1));
  } else if (activeRowId) {
    const ordinal = allMatchRowIds.indexOf(activeRowId);
    if (ordinal >= 0) activeOrdinal = ordinal;
  } else if (anchorRowId) {
    const anchorIndex = cache.rows.findIndex((row) => row.id === anchorRowId);
    if (anchorIndex >= 0) {
      const ordinal = allMatchIndexes.findIndex((matchIndex) => matchIndex >= anchorIndex);
      activeOrdinal = ordinal >= 0 ? ordinal : 0;
    }
  }

  // Cap transferred arrays to keep postMessage payload small and avoid main-thread stalls.
  // We centre the window around the active ordinal so the user can navigate in both directions.
  let matchIndexes: number[];
  let matchRowIds: string[];
  let windowStartOrdinal = 0;

  if (totalMatchCount <= MAX_FIND_HIGHLIGHTS) {
    matchIndexes = allMatchIndexes;
    matchRowIds = allMatchRowIds;
  } else {
    const halfWindow = Math.floor(MAX_FIND_HIGHLIGHTS / 2);
    const sliceStart = Math.max(0, Math.min(activeOrdinal - halfWindow, totalMatchCount - MAX_FIND_HIGHLIGHTS));
    matchIndexes = allMatchIndexes.slice(sliceStart, sliceStart + MAX_FIND_HIGHLIGHTS);
    matchRowIds = allMatchRowIds.slice(sliceStart, sliceStart + MAX_FIND_HIGHLIGHTS);
    windowStartOrdinal = sliceStart;
  }

  return { query: trimmed, matchIndexes, matchRowIds, activeOrdinal, windowStartOrdinal, totalMatchCount };
}

function sendFind(
  jobId: number,
  query: string,
  activeRowId?: string | null,
  anchorRowId?: string | null,
  targetOrdinal?: number | null
) {
  postMessageSafe({
    type: 'find',
    jobId,
    result: buildFindResult(query, activeRowId, anchorRowId, targetOrdinal)
  });
}

function locateRowIndex(locator: LogRowLocator): number {
  if (!cache || cache.rows.length === 0) return -1;

  if (locator.rowId) {
    const directIndex = cache.rows.findIndex((row) => row.id === locator.rowId);
    if (directIndex >= 0) return directIndex;
  }

  const sourceRows = cache.rows
    .map((row, index) => ({ row, index }))
    .filter(({ row }) => row.sourceFile === locator.sourceFile);

  if (sourceRows.length === 0) return -1;

  if (locator.lineNo != null) {
    const exact = sourceRows.find(({ row }) => row.lineNo === locator.lineNo);
    if (exact) return exact.index;

    let nearest = sourceRows[0]!;
    let bestDistance = Math.abs(nearest.row.lineNo - locator.lineNo);
    for (let index = 1; index < sourceRows.length; index += 1) {
      const candidate = sourceRows[index]!;
      const distance = Math.abs(candidate.row.lineNo - locator.lineNo);
      if (distance < bestDistance) {
        nearest = candidate;
        bestDistance = distance;
      }
    }
    return nearest.index;
  }

  if (locator.tsWallMs != null) {
    let nearest = sourceRows[0]!;
    let bestDistance = Math.abs((nearest.row.tsWallMs ?? locator.tsWallMs) - locator.tsWallMs);
    for (let index = 1; index < sourceRows.length; index += 1) {
      const candidate = sourceRows[index]!;
      const distance = Math.abs((candidate.row.tsWallMs ?? locator.tsWallMs) - locator.tsWallMs);
      if (distance < bestDistance) {
        nearest = candidate;
        bestDistance = distance;
      }
    }
    return nearest.index;
  }

  return sourceRows[0]!.index;
}

function sendLocate(jobId: number, locator: LogRowLocator) {
  const rowIndex = locateRowIndex(locator);
  const row = rowIndex >= 0 && cache ? cache.rows[rowIndex] ?? null : null;
  postMessageSafe({
    type: 'locate',
    jobId,
    result: {
      rowIndex,
      row,
      locator
    }
  });
}

self.onmessage = (event: MessageEvent<QueryRequest>) => {
  if (!event.data) return;

  if (event.data.type === 'window') {
    sendWindow(event.data.jobId, event.data.windowStart, event.data.windowSize);
    return;
  }

  if (event.data.type === 'find') {
    sendFind(event.data.jobId, event.data.query, event.data.activeRowId, event.data.anchorRowId, event.data.targetOrdinal ?? null);
    return;
  }

  if (event.data.type === 'locate') {
    sendLocate(event.data.jobId, event.data.locator);
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
