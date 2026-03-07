import type {
  LogKind,
  LogRow,
  LogSourceRecord,
  ParseStats,
  StoredLogRow,
  YearInferredFrom
} from './types';

const DB_NAME = 'prv-log-index-lab';
const DB_VERSION = 1;

const SOURCE_STORE = 'log_sources';
const ROW_STORE = 'log_rows';

const DEFAULT_STATS: ParseStats = {
  totalRows: 0,
  kindCounts: { entry: 0, continuation: 0, repeat: 0, meta: 0, unknown: 0 },
  entryWithTs: 0,
  unknownRate: 0,
  topComponents: [],
  topTags: []
};

export type CreateSourceRecordInput = {
  reportId: string;
  sourceFile: string;
  filePath: string;
  fileSize: number | null;
  downloadMode: 'head' | 'tail';
  maxBytes: number;
  maxLines: number | null;
  truncated: boolean;
  trimmedFirstLine: boolean;
  baseYear: number | null;
  yearInferredFrom: YearInferredFrom | null;
  timezoneOffsetSeconds: number | null;
  parseVersion: string;
  status: LogSourceRecord['status'];
  warnings?: string[];
  rowCount?: number;
  stats?: ParseStats;
  createdAt?: number;
  updatedAt?: number;
  lastJobId: number;
};

export type LogRowsQuery = {
  reportId: string;
  sourceFiles: string[];
  search: string;
  kinds: LogKind[] | null;
  limit: number;
  requireTimestamp?: boolean; // hide rows with tsWallMs=null
  requireNonEmptyMessage?: boolean; // hide rows with empty/whitespace message
};

export type LogRowsQueryResult = {
  rows: LogRow[];
  totalMatches: number;
  clipped: boolean;
};

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed'));
  });
}

function transactionDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('IndexedDB transaction failed'));
    tx.onabort = () => reject(tx.error ?? new Error('IndexedDB transaction aborted'));
  });
}

function makeSourceKey(reportId: string, sourceFile: string): string {
  return `${reportId}:${sourceFile}`;
}

function makeRowKey(sourceKey: string, lineNo: number): string {
  return `${sourceKey}:${lineNo}`;
}

function createEmptySourceRecord(input: CreateSourceRecordInput): LogSourceRecord {
  const createdAt = input.createdAt ?? Date.now();
  const updatedAt = input.updatedAt ?? createdAt;

  return {
    sourceKey: makeSourceKey(input.reportId, input.sourceFile),
    reportId: input.reportId,
    sourceFile: input.sourceFile,
    filePath: input.filePath,
    fileSize: input.fileSize,
    downloadMode: input.downloadMode,
    maxBytes: input.maxBytes,
    maxLines: input.maxLines,
    truncated: input.truncated,
    trimmedFirstLine: input.trimmedFirstLine,
    baseYear: input.baseYear,
    yearInferredFrom: input.yearInferredFrom,
    timezoneOffsetSeconds: input.timezoneOffsetSeconds,
    parseVersion: input.parseVersion,
    status: input.status,
    warnings: [...(input.warnings ?? [])],
    rowCount: input.rowCount ?? 0,
    stats: input.stats ?? DEFAULT_STATS,
    createdAt,
    updatedAt,
    lastJobId: input.lastJobId
  };
}

function stripStoredRow(row: StoredLogRow): LogRow {
  const { rowKey: _rowKey, sourceKey: _sourceKey, ...plain } = row;
  return plain;
}

function rowMatchesKinds(row: LogRow, kinds: Set<LogKind> | null): boolean {
  return !kinds || kinds.has(row.kind);
}

function rowMatchesSearch(row: LogRow, searchLower: string): boolean {
  if (!searchLower) return true;
  return `${row.sourceFile}\n${row.component ?? ''}\n${row.message}\n${row.raw}`
    .toLowerCase()
    .includes(searchLower);
}

function rowIsDisplayable(row: LogRow, requireTimestamp: boolean, requireNonEmptyMessage: boolean): boolean {
  if (requireTimestamp && row.tsWallMs == null) return false;
  if (requireNonEmptyMessage && row.message.trim() === '') return false;
  return true;
}

async function deleteRowsBySource(
  index: IDBIndex,
  sourceKey: string
): Promise<void> {
  return await new Promise((resolve, reject) => {
    const range = IDBKeyRange.bound([sourceKey, 0], [sourceKey, Number.MAX_SAFE_INTEGER]);
    const request = index.openCursor(range);

    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor) {
        resolve();
        return;
      }
      const deleteRequest = cursor.delete();
      deleteRequest.onsuccess = () => cursor.continue();
      deleteRequest.onerror = () => reject(deleteRequest.error ?? new Error('Failed to delete rows'));
    };

    request.onerror = () => reject(request.error ?? new Error('Failed to iterate rows for delete'));
  });
}

export async function openLogIndexDb(): Promise<IDBDatabase> {
  if (typeof indexedDB === 'undefined') {
    throw new Error('IndexedDB not available');
  }

  return await new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      const sourceStore = db.objectStoreNames.contains(SOURCE_STORE)
        ? request.transaction!.objectStore(SOURCE_STORE)
        : db.createObjectStore(SOURCE_STORE, { keyPath: 'sourceKey' });

      if (!sourceStore.indexNames.contains('by_report')) {
        sourceStore.createIndex('by_report', 'reportId', { unique: false });
      }

      const rowStore = db.objectStoreNames.contains(ROW_STORE)
        ? request.transaction!.objectStore(ROW_STORE)
        : db.createObjectStore(ROW_STORE, { keyPath: 'rowKey' });

      if (!rowStore.indexNames.contains('by_source_line')) {
        rowStore.createIndex('by_source_line', ['sourceKey', 'lineNo'], { unique: false });
      }
      if (!rowStore.indexNames.contains('by_report_ts')) {
        rowStore.createIndex('by_report_ts', ['reportId', 'tsWallMs'], { unique: false });
      }
      if (!rowStore.indexNames.contains('by_source_ts')) {
        rowStore.createIndex('by_source_ts', ['sourceKey', 'tsWallMs'], { unique: false });
      }
      if (!rowStore.indexNames.contains('by_source_kind')) {
        rowStore.createIndex('by_source_kind', ['sourceKey', 'kind'], { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Failed to open IndexedDB'));
  });
}

export async function resetSourceForIngest(input: CreateSourceRecordInput): Promise<LogSourceRecord> {
  const db = await openLogIndexDb();
  const sourceKey = makeSourceKey(input.reportId, input.sourceFile);
  const current = await getSourceRecord(input.reportId, input.sourceFile);
  const next = createEmptySourceRecord({
    ...input,
    createdAt: current?.createdAt ?? input.createdAt
  });

  const clearTx = db.transaction(ROW_STORE, 'readwrite');
  await deleteRowsBySource(clearTx.objectStore(ROW_STORE).index('by_source_line'), sourceKey);
  await transactionDone(clearTx);

  const putTx = db.transaction(SOURCE_STORE, 'readwrite');
  putTx.objectStore(SOURCE_STORE).put(next);
  await transactionDone(putTx);
  db.close();
  return next;
}

export async function putRowBatch(
  reportId: string,
  sourceFile: string,
  rows: LogRow[]
): Promise<void> {
  if (rows.length === 0) return;

  const db = await openLogIndexDb();
  const tx = db.transaction(ROW_STORE, 'readwrite');
  const store = tx.objectStore(ROW_STORE);
  const sourceKey = makeSourceKey(reportId, sourceFile);

  for (const row of rows) {
    const stored: StoredLogRow = {
      ...row,
      sourceKey,
      rowKey: makeRowKey(sourceKey, row.lineNo)
    };
    store.put(stored);
  }

  await transactionDone(tx);
  db.close();
}

export async function putSourceRecord(record: LogSourceRecord): Promise<void> {
  const db = await openLogIndexDb();
  const tx = db.transaction(SOURCE_STORE, 'readwrite');
  tx.objectStore(SOURCE_STORE).put(record);
  await transactionDone(tx);
  db.close();
}

export async function getSourceRecord(
  reportId: string,
  sourceFile: string
): Promise<LogSourceRecord | null> {
  const db = await openLogIndexDb();
  const tx = db.transaction(SOURCE_STORE, 'readonly');
  const result = (await requestToPromise(
    tx.objectStore(SOURCE_STORE).get(makeSourceKey(reportId, sourceFile))
  )) as LogSourceRecord | undefined;
  await transactionDone(tx);
  db.close();
  return result ?? null;
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

export async function queryRowsForSources(query: LogRowsQuery): Promise<LogRowsQueryResult> {
  if (query.sourceFiles.length === 0) {
    return { rows: [], totalMatches: 0, clipped: false };
  }

  const db = await openLogIndexDb();
  const searchLower = query.search.trim().toLowerCase();
  const kinds = query.kinds?.length ? new Set(query.kinds) : null;
  const requireTimestamp = query.requireTimestamp ?? false;
  const requireNonEmptyMessage = query.requireNonEmptyMessage ?? false;
  let totalMatches = 0;
  const matches: LogRow[] = [];

  for (const sourceFile of query.sourceFiles) {
    const sourceKey = makeSourceKey(query.reportId, sourceFile);
    const rowsTx = db.transaction(ROW_STORE, 'readonly');
    const rowIndex = rowsTx.objectStore(ROW_STORE).index('by_source_line');
    const sourceMatches = await new Promise<LogRow[]>((resolve, reject) => {
      const collected: LogRow[] = [];
      const range = IDBKeyRange.bound([sourceKey, 0], [sourceKey, Number.MAX_SAFE_INTEGER]);
      const request = rowIndex.openCursor(range);

      request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor) {
          resolve(collected);
          return;
        }

        const row = stripStoredRow(cursor.value as StoredLogRow);
        if (
          rowIsDisplayable(row, requireTimestamp, requireNonEmptyMessage) &&
          rowMatchesKinds(row, kinds) &&
          rowMatchesSearch(row, searchLower)
        ) {
          collected.push(row);
        }
        cursor.continue();
      };

      request.onerror = () => reject(request.error ?? new Error('Failed to query rows'));
    });

    totalMatches += sourceMatches.length;
    matches.push(...sourceMatches);
  }

  db.close();

  const rowById = new Map(matches.map((row) => [row.id, row]));
  matches.sort((a, b) => compareRowsByTimeThenSource(a, b, rowById));
  const clipped = matches.length > query.limit;
  const rows = clipped ? matches.slice(-query.limit) : matches;

  return {
    rows,
    totalMatches,
    clipped
  };
}

export async function readRowsAfterLineNo(opts: {
  reportId: string;
  sourceFile: string;
  afterLineNo: number;
  search: string;
  kinds: LogKind[] | null;
  maxRows?: number;
  requireTimestamp?: boolean;
  requireNonEmptyMessage?: boolean;
}): Promise<{ rows: LogRow[]; maxLineNo: number }> {
  const db = await openLogIndexDb();
  const sourceKey = makeSourceKey(opts.reportId, opts.sourceFile);
  const searchLower = opts.search.trim().toLowerCase();
  const kinds = opts.kinds?.length ? new Set(opts.kinds) : null;
  const requireTimestamp = opts.requireTimestamp ?? false;
  const requireNonEmptyMessage = opts.requireNonEmptyMessage ?? false;
  const maxRows = Math.max(0, Math.trunc(opts.maxRows ?? 10_000));
  let maxLineNo = Math.max(0, Math.trunc(opts.afterLineNo));

  const rowsTx = db.transaction(ROW_STORE, 'readonly');
  const rowIndex = rowsTx.objectStore(ROW_STORE).index('by_source_line');

  const rows = await new Promise<LogRow[]>((resolve, reject) => {
    const collected: LogRow[] = [];
    const startLine = Math.max(0, Math.trunc(opts.afterLineNo)) + 1;
    const range = IDBKeyRange.bound([sourceKey, startLine], [sourceKey, Number.MAX_SAFE_INTEGER]);
    const request = rowIndex.openCursor(range);

    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor) {
        resolve(collected);
        return;
      }

      const row = stripStoredRow(cursor.value as StoredLogRow);
      maxLineNo = Math.max(maxLineNo, row.lineNo);
      if (
        rowIsDisplayable(row, requireTimestamp, requireNonEmptyMessage) &&
        rowMatchesKinds(row, kinds) &&
        rowMatchesSearch(row, searchLower)
      ) {
        collected.push(row);
        if (maxRows > 0 && collected.length >= maxRows) {
          resolve(collected);
          return;
        }
      }

      cursor.continue();
    };

    request.onerror = () => reject(request.error ?? new Error('Failed to read new rows'));
  });

  db.close();
  return { rows, maxLineNo };
}
