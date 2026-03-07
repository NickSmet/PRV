<script lang="ts">
  import { browser } from '$app/environment';
  import { onDestroy, onMount } from 'svelte';
  import { ChevronDown, ChevronUp, Clipboard, RefreshCw, Search, X } from '@lucide/svelte';

  import { getSourceRecord } from '$lib/lab/log-index/db';
  import type { LogRow, LogSourceRecord } from '$lib/lab/log-index/types';

  type PageData = {
    reportId: string;
    sourceKind: 'api' | 'fixture';
    reportOk: boolean;
    timezoneOffsetSeconds: number | null;
    yearHint: number | null;
    files: Array<{ filename: string; filePath: string; size: number }>;
    defaultFile: string | null;
    defaultSelected: string[];
  };

  type WorkerProgressMessage =
    | {
        type: 'progress';
        jobId: number;
        phase: 'fetching' | 'parsing';
        rowsWritten: number;
        message: string;
      }
    | {
        type: 'complete';
        jobId: number;
        source: LogSourceRecord;
      }
    | {
        type: 'error';
        jobId: number;
        message: string;
      };

  type QueryMessage =
    | {
        type: 'result';
        jobId: number;
        result: { totalRows: number; totalMatches: number; clipped: boolean; windowStart: number; rows: LogRow[] };
      }
    | {
        type: 'find';
        jobId: number;
        result: { query: string; matchIndexes: number[]; matchRowIds: string[]; activeOrdinal: number };
      }
    | { type: 'error'; jobId: number; message: string };

  let { data }: { data: PageData } = $props();

  // Fixed viewer settings (no controls).
  const parseVersion = 'log-index-v1';
  const maxBytes = 2 * 1024 * 1024;
  const maxLines = 20_000;
  const downloadMode = 'tail' as const;
  const requireTimestamp = true;
  const requireNonEmptyMessage = true;

  // Visual/UX tokens (copied from references/logViewer/log-viewer-tight.jsx).
  const F = {
    sans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    mono: "'SF Mono', Consolas, monospace"
  };

  const C = {
    bg: '#FFFFFF',
    panelBg: '#FAFBFC',
    headerBg: '#F8FAFC',
    b0: '#F1F5F9',
    b1: '#E2E8F0',
    b2: '#E4E4E7',
    t0: '#0F172A',
    t1: '#1E293B',
    t2: '#64748B',
    t3: '#94A3B8',
    t4: '#A1A1AA',
    sel: '#EFF6FF',
    selBorder: '#3B82F6'
  };

  const LOG_COLORS = [
    { fg: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', dot: '#3B82F6' }, // blue
    { fg: '#7C3AED', bg: '#F3E8FF', border: '#DDD6FE', dot: '#8B5CF6' }, // purple
    { fg: '#059669', bg: '#ECFDF5', border: '#A7F3D0', dot: '#10B981' } // green
  ];

  const LVL: Record<string, { label: string; color: string; bg: string }> = {
    F: { label: 'F', color: '#DC2626', bg: '#FEE2E2' },
    E: { label: 'E', color: '#DC2626', bg: '#FEE2E2' },
    W: { label: 'W', color: '#D97706', bg: '#FEF3C7' },
    I: { label: 'I', color: '#2563EB', bg: '#EFF6FF' },
    D: { label: 'D', color: '#64748B', bg: '#F1F5F9' },
    T: { label: 'T', color: '#94A3B8', bg: '#F8FAFC' }
  };

  let selectedFiles = $state<string[]>([]);
  let sourceRecords = $state<Record<string, LogSourceRecord>>({});
  let progressByFile = $state<Record<string, string>>({});
  let activeWorkers = $state<Record<string, Worker>>({});
  let activeJobIds = $state<Record<string, number>>({});
  let nextJobId = 0;
  let error = $state<string | null>(null);
  let ensureRunId = 0;

  let queryWorker: Worker | null = null;
  let nextQueryJobId = 0;
  let activeQueryJobId = 0;
  let totalRows = $state(0);
  let totalMatches = $state(0);
  let clipped = $state(false);
  let windowStart = $state(0);
  let windowRows = $state<LogRow[]>([]);
  let lastQueryKey = $state<string | null>(null);
  let rowsWrittenByFile = $state<Record<string, number>>({});

  let searchInput = $state('');
  let debouncedSearch = $state('');
  let matchIndexes = $state<number[]>([]);
  let matchRowIds = $state<string[]>([]);
  let activeMatchOrdinal = $state(-1);
  let activeMatchRowId = $state<string | null>(null);
  let nextFindJobId = 0;
  let activeFindJobId = 0;
  let pendingRevealRowIndex = $state<number | null>(null);

  let selectedRow = $state<LogRow | null>(null);
  let detailOpen = $state(false);
  const showDetail = $derived(detailOpen && !!selectedRow);

  // Virtualization (constant row height due to 2-line clamp).
  const rowHeight = 32;
  const overscanRows = 16;
  const chunkSize = 150;
  const maxRetainedRows = 500;
  const prefetchThreshold = 150;
  let tableEl = $state<HTMLDivElement | null>(null);
  let viewportHeight = $state(560);
  let scrollTop = $state(0);
  let lastScrollBucket = -1;
  let pinnedToBottom = $state(true);
  let scrollTopRef = 0;
  let pinnedToBottomRef = true;
  let lastPollAt = 0;
  let windowLoading = $state(false);
  let pendingWindowStart = $state<number | null>(null);

  const selectedFileMetas = $derived.by(() =>
    data.files.filter((file) => selectedFiles.includes(file.filename))
  );

  const loading = $derived.by(() => selectedFiles.some((file) => !!progressByFile[file]));
  const searchQuery = $derived(debouncedSearch.trim());
  const matchCount = $derived(matchIndexes.length);
  const matchRowIdSet = $derived.by(() => new Set(matchRowIds));

  const indexedEstimate = $derived.by(() => {
    let sum = 0;
    for (const sourceFile of selectedFiles) {
      const record = sourceRecords[sourceFile];
      if (record?.status === 'complete') {
        sum += record.rowCount;
      } else {
        sum += rowsWrittenByFile[sourceFile] ?? 0;
      }
    }
    return sum;
  });

  const allSelectedComplete = $derived.by(() => {
    if (selectedFiles.length === 0) return false;
    return selectedFiles.every((sourceFile) => sourceRecords[sourceFile]?.status === 'complete');
  });

  // Start rendering once:
  // - at least ~1k rows are indexed (progressive UX for large logs), OR
  // - all selected sources are complete (even if small/empty), OR
  // - a query already populated totalRows.
  const renderReady = $derived(indexedEstimate >= 1000 || allSelectedComplete || totalRows > 0);

  const stats = $derived.by(() => {
    const levels: Record<string, number> = { F: 0, E: 0, W: 0, I: 0, D: 0, T: 0 };
    for (const row of windowRows) {
      if (row.level && row.level in levels) levels[row.level] += 1;
    }
    return levels;
  });

  const virtual = $derived.by(() => {
    const total = totalRows;
    const start = windowStart;
    const end = windowStart + windowRows.length;
    return {
      total,
      start,
      end,
      rows: windowRows,
      topPad: start * rowHeight,
      bottomPad: Math.max(0, (total - end) * rowHeight)
    };
  });

  const placeholder = $derived.by(() => {
    if (!windowLoading || pendingWindowStart == null) return null;
    const viewportRows = Math.max(1, Math.ceil(viewportHeight / rowHeight));
    const count = Math.max(1, viewportRows + overscanRows);
    const start = Math.max(0, Math.min(pendingWindowStart, Math.max(0, totalRows - count)));
    const end = Math.min(totalRows, start + count);
    const topPad = start * rowHeight;
    const bottomPad = Math.max(0, (totalRows - end) * rowHeight);
    return { start, end, count: end - start, topPad, bottomPad };
  });

  $effect.pre(() => {
    selectedFiles = [...data.defaultSelected];
    sourceRecords = {};
    progressByFile = {};
    activeWorkers = {};
    activeJobIds = {};
    error = null;
    totalRows = 0;
    totalMatches = 0;
    clipped = false;
    windowStart = 0;
    windowRows = [];
    lastQueryKey = null;
    rowsWrittenByFile = {};
    searchInput = '';
    debouncedSearch = '';
    selectedRow = null;
    detailOpen = false;
    scrollTop = 0;
    lastScrollBucket = -1;
    pinnedToBottom = true;
    windowLoading = false;
    pendingWindowStart = null;
  });

  onMount(() => {
    queryWorker = new Worker(new URL('$lib/lab/log-index/query-worker.ts', import.meta.url), {
      type: 'module'
    });

    queryWorker.onmessage = (event: MessageEvent<QueryMessage>) => {
      if (event.data.type === 'find') {
        if (event.data.jobId !== activeFindJobId) return;
        matchIndexes = event.data.result.matchIndexes;
        matchRowIds = event.data.result.matchRowIds;
        activeMatchOrdinal = event.data.result.activeOrdinal;
        const nextActiveRowId =
          event.data.result.activeOrdinal >= 0 ? (event.data.result.matchRowIds[event.data.result.activeOrdinal] ?? null) : null;
        const nextRevealIndex =
          event.data.result.activeOrdinal >= 0 ? (event.data.result.matchIndexes[event.data.result.activeOrdinal] ?? null) : null;
        activeMatchRowId = nextActiveRowId;

        if (nextRevealIndex == null || nextRevealIndex < 0) {
          pendingRevealRowIndex = null;
          return;
        }

        pendingRevealRowIndex = nextRevealIndex;
        const windowEnd = windowStart + windowRows.length;
        if (nextRevealIndex >= windowStart && nextRevealIndex < windowEnd) {
          window.requestAnimationFrame(() => {
            if (pendingRevealRowIndex === nextRevealIndex) {
              revealRowIndex(nextRevealIndex);
              pendingRevealRowIndex = null;
            }
          });
          return;
        }

        const viewportRows = Math.max(1, Math.ceil(viewportHeight / rowHeight));
        sendWindow(windowStartForViewport(nextRevealIndex, totalRows, viewportRows));
        return;
      }

      if (event.data.jobId !== activeQueryJobId) return;

      if (event.data.type === 'error') {
        error = event.data.message;
        windowLoading = false;
        pendingWindowStart = null;
        return;
      }

      totalRows = event.data.result.totalRows;
      totalMatches = event.data.result.totalMatches;
      clipped = event.data.result.clipped;
      windowStart = event.data.result.windowStart;
      windowRows = event.data.result.rows;
      windowLoading = false;
      pendingWindowStart = null;

      if (pendingRevealRowIndex != null) {
        const revealIndex = pendingRevealRowIndex;
        if (revealIndex >= windowStart && revealIndex < windowStart + windowRows.length) {
          window.requestAnimationFrame(() => {
            if (pendingRevealRowIndex === revealIndex) {
              revealRowIndex(revealIndex);
              pendingRevealRowIndex = null;
            }
          });
        }
      }

      // Auto-scroll only when not searching and user is pinned to bottom.
      const q = debouncedSearch.trim();
      if (!q && pinnedToBottom) {
        window.requestAnimationFrame(() => {
          if (!tableEl) return;
          tableEl.scrollTop = tableEl.scrollHeight;
        });
      } else if (q) {
        requestFind({ keepActive: true });
      }
    };

    if (data.reportOk) {
      void ensureIndexed(false);
    }

    return () => {
      if (queryWorker) queryWorker.terminate();
      queryWorker = null;
    };
  });

  $effect(() => {
    if (!browser) return;
    void searchInput;
    const timer = window.setTimeout(() => {
      debouncedSearch = searchInput;
    }, 1500);
    return () => window.clearTimeout(timer);
  });

  onDestroy(() => {
    stopAllWorkers();
    if (queryWorker) queryWorker.terminate();
  });

  function fmtSize(bytes: number): string {
    const kb = 1024;
    const mb = kb * 1024;
    if (bytes >= mb) return `${(bytes / mb).toFixed(1)} MiB`;
    if (bytes >= kb) return `${Math.round(bytes / kb)} KiB`;
    return `${bytes} B`;
  }

  function sourceLabel(sourceFile: string): string {
    if (sourceFile === 'parallels-system.log') return 'prl-sys.log';
    return sourceFile;
  }

  function sourceIndex(sourceFile: string): number {
    if (sourceFile === 'vm.log') return 0;
    if (sourceFile === 'parallels-system.log') return 1;
    return 2; // tools.log
  }

  function colorForSource(sourceFile: string) {
    return LOG_COLORS[sourceIndex(sourceFile)] ?? LOG_COLORS[0]!;
  }

  function encodeFilePath(filePath: string): string {
    return filePath.split('/').map(encodeURIComponent).join('/');
  }

  function buildSourceUrl(file: PageData['files'][number]): string {
    if (data.sourceKind === 'api') {
      return `/api/reports/${encodeURIComponent(data.reportId)}/files/${encodeFilePath(file.filePath)}?mode=${downloadMode}&maxBytes=${maxBytes}`;
    }
    return `/lab/fixtures/${encodeURIComponent(data.reportId)}/files/${encodeURIComponent(file.filePath)}?mode=${downloadMode}&maxBytes=${maxBytes}`;
  }

  function stopWorker(sourceFile: string) {
    const worker = activeWorkers[sourceFile];
    if (worker) worker.terminate();

    if (sourceFile in activeWorkers) {
      const nextWorkers = { ...activeWorkers };
      delete nextWorkers[sourceFile];
      activeWorkers = nextWorkers;
    }

    if (sourceFile in progressByFile) {
      const nextProgress = { ...progressByFile };
      delete nextProgress[sourceFile];
      progressByFile = nextProgress;
    }

    if (sourceFile in activeJobIds) {
      const nextJobIds = { ...activeJobIds };
      delete nextJobIds[sourceFile];
      activeJobIds = nextJobIds;
    }
  }

  function stopAllWorkers() {
    for (const worker of Object.values(activeWorkers)) worker.terminate();
    activeWorkers = {};
    progressByFile = {};
    activeJobIds = {};
  }

  function toggleFile(filename: string) {
    if (selectedFiles.includes(filename)) {
      selectedFiles = selectedFiles.filter((value) => value !== filename);
      return;
    }
    selectedFiles = [...selectedFiles, filename];
  }

  function levelMeta(level: string | null): { label: string; color: string; bg: string } {
    if (!level) return LVL.I;
    return LVL[level] ?? LVL.I;
  }

  function needsIngest(file: PageData['files'][number], record: LogSourceRecord | null): boolean {
    if (!record) return true;
    if (record.status !== 'complete') return true;
    if (record.filePath !== file.filePath) return true;
    if (record.fileSize !== file.size) return true;
    if (record.downloadMode !== downloadMode) return true;
    if (record.maxBytes !== maxBytes) return true;
    if ((record.maxLines ?? null) !== maxLines) return true;
    if (record.parseVersion !== parseVersion) return true;
    return false;
  }

  function windowSizeForViewport(): number {
    return maxRetainedRows;
  }

  function clampWindowStart(start: number, total: number): number {
    const safeStart = Math.max(0, Math.trunc(start));
    const maxStart = Math.max(0, total - maxRetainedRows);
    const aligned = Math.floor(safeStart / chunkSize) * chunkSize;
    return Math.min(aligned, maxStart);
  }

  function windowStartForViewport(viewportStart: number, total: number, viewportRows: number): number {
    if (total <= maxRetainedRows) return 0;
    const centered = viewportStart - Math.floor((maxRetainedRows - viewportRows) / 2);
    return clampWindowStart(centered, total);
  }

  function queryKeyForState(sourceFiles: string[]): string {
    const tsKey = requireTimestamp ? 'ts' : 'all';
    const msgKey = requireNonEmptyMessage ? 'msg' : 'raw';
    return `${data.reportId}|${sourceFiles.join(',')}|${downloadMode}|${maxBytes}|${maxLines}|${parseVersion}|${tsKey}|${msgKey}`;
  }

  function currentViewportRowId(): string | null {
    const viewportIndex = Math.max(0, Math.floor(scrollTopRef / rowHeight));
    if (viewportIndex < windowStart) return windowRows[0]?.id ?? null;
    const localIndex = viewportIndex - windowStart;
    return windowRows[localIndex]?.id ?? windowRows[0]?.id ?? null;
  }

  function requestFind(opts?: { keepActive?: boolean }) {
    if (!browser || !queryWorker) return;

    const jobId = ++nextFindJobId;
    activeFindJobId = jobId;
    queryWorker.postMessage({
      type: 'find',
      jobId,
      query: searchQuery,
      activeRowId: opts?.keepActive ? activeMatchRowId : null,
      anchorRowId: opts?.keepActive ? activeMatchRowId : currentViewportRowId()
    });
  }

  function revealRowIndex(rowIndex: number) {
    if (!tableEl) return;
    const centerOffset = Math.max(0, Math.floor((viewportHeight - rowHeight) / 2));
    const maxScrollTop = Math.max(0, tableEl.scrollHeight - tableEl.clientHeight);
    const nextScrollTop = Math.max(0, Math.min(rowIndex * rowHeight - centerOffset, maxScrollTop));
    tableEl.scrollTop = nextScrollTop;
    scrollTop = nextScrollTop;
    scrollTopRef = nextScrollTop;
    lastScrollBucket = Math.floor(nextScrollTop / rowHeight);
  }

  function jumpToMatch(ordinal: number) {
    if (ordinal < 0 || ordinal >= matchIndexes.length) return;
    const rowIndex = matchIndexes[ordinal]!;
    const rowId = matchRowIds[ordinal] ?? null;
    activeMatchOrdinal = ordinal;
    activeMatchRowId = rowId;
    pendingRevealRowIndex = rowIndex;

    const windowEnd = windowStart + windowRows.length;
    if (rowIndex < windowStart || rowIndex >= windowEnd) {
      const viewportRows = Math.max(1, Math.ceil(viewportHeight / rowHeight));
      sendWindow(windowStartForViewport(rowIndex, totalRows, viewportRows));
      return;
    }

    window.requestAnimationFrame(() => {
      if (pendingRevealRowIndex === rowIndex) {
        revealRowIndex(rowIndex);
        pendingRevealRowIndex = null;
      }
    });
  }

  function moveMatch(delta: -1 | 1) {
    if (matchIndexes.length === 0) return;
    if (activeMatchOrdinal < 0) {
      jumpToMatch(delta > 0 ? 0 : matchIndexes.length - 1);
      return;
    }
    const nextOrdinal = (activeMatchOrdinal + delta + matchIndexes.length) % matchIndexes.length;
    jumpToMatch(nextOrdinal);
  }

  function handleSearchKeydown(event: KeyboardEvent) {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    moveMatch(event.shiftKey ? -1 : 1);
  }

  function messageSegments(text: string, query: string): Array<{ text: string; match: boolean }> {
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

  function rowHasVisibleMatch(row: LogRow, query: string): boolean {
    if (!query) return false;
    return row.message.toLowerCase().includes(query.toLowerCase());
  }

  function sendQuery(opts?: { align?: 'top' | 'bottom'; force?: boolean; windowStart?: number }) {
    if (!browser || !queryWorker) return;
    const sourceFiles = [...selectedFiles];
    const key = queryKeyForState(sourceFiles);
    if (!opts?.force && lastQueryKey === key) return;

    lastQueryKey = key;
    const jobId = ++nextQueryJobId;
    activeQueryJobId = jobId;
    const limit = Math.max(1, sourceFiles.length) * maxLines;
    const windowSize = windowSizeForViewport();
    const requestedStart = Math.trunc(opts?.windowStart ?? 0);

    const payload: Record<string, unknown> = {
      type: 'query',
      jobId,
      reportId: data.reportId,
      sourceFiles,
      search: '',
      kinds: null,
      limit,
      requireTimestamp,
      requireNonEmptyMessage,
      windowStart: requestedStart,
      windowSize
    };

    if (opts?.align) {
      payload.align = opts.align;
    } else if (opts?.windowStart == null) {
      payload.align = 'bottom';
    }

    queryWorker.postMessage(payload);
  }

  function sendWindow(nextStart: number) {
    if (!browser || !queryWorker) return;
    const clampedStart = clampWindowStart(nextStart, totalRows);
    if (clampedStart === windowStart) return;
    if (windowLoading && pendingWindowStart === clampedStart) return;
    const jobId = ++nextQueryJobId;
    activeQueryJobId = jobId;
    windowLoading = true;
    pendingWindowStart = clampedStart;
    queryWorker.postMessage({
      type: 'window',
      jobId,
      windowStart: clampedStart,
      windowSize: windowSizeForViewport()
    });
  }

  function sendPoll() {
    if (!browser || !queryWorker) return;
    const now = Date.now();
    if (now - lastPollAt < 220) return;
    lastPollAt = now;

    const sourceFiles = [...selectedFiles];
    const key = queryKeyForState(sourceFiles);
    lastQueryKey = key;

    const jobId = ++nextQueryJobId;
    activeQueryJobId = jobId;
    const limit = Math.max(1, sourceFiles.length) * maxLines;
    const windowSize = windowSizeForViewport();

    queryWorker.postMessage({
      type: 'poll',
      jobId,
      reportId: data.reportId,
      sourceFiles,
      search: '',
      kinds: null,
      limit,
      requireTimestamp,
      requireNonEmptyMessage,
      windowSize,
      align: 'bottom'
    });
  }

  function maybeRequestWindow() {
    if (!browser) return;
    if (!queryWorker) return;
    if (totalRows <= 0) return;
    if (windowRows.length === 0) return;

    const viewportRows = Math.max(1, Math.ceil(viewportHeight / rowHeight));
    const viewportStart = Math.max(0, Math.floor(scrollTop / rowHeight));
    const viewportEnd = viewportStart + viewportRows;
    const currentEnd = windowStart + windowRows.length;
    const nextPendingStart = pendingWindowStart ?? windowStart;

    if (viewportStart < windowStart || viewportEnd > currentEnd) {
      const nextStart = windowStartForViewport(viewportStart, totalRows, viewportRows);
      if (nextStart !== nextPendingStart) sendWindow(nextStart);
      return;
    }

    if (viewportEnd >= currentEnd - prefetchThreshold) {
      const nextStart = clampWindowStart(windowStart + chunkSize, totalRows);
      if (nextStart !== nextPendingStart) sendWindow(nextStart);
      return;
    }

    if (viewportStart <= windowStart + prefetchThreshold) {
      const nextStart = clampWindowStart(windowStart - chunkSize, totalRows);
      if (nextStart !== nextPendingStart) sendWindow(nextStart);
    }
  }

  async function startSourceIngest(file: PageData['files'][number]) {
    stopWorker(file.filename);

    const worker = new Worker(new URL('$lib/lab/log-index/worker.ts', import.meta.url), {
      type: 'module'
    });
    const jobId = ++nextJobId;

    activeWorkers = { ...activeWorkers, [file.filename]: worker };
    activeJobIds = { ...activeJobIds, [file.filename]: jobId };
    progressByFile = { ...progressByFile, [file.filename]: 'Indexing…' };

    worker.addEventListener('message', (event: MessageEvent<WorkerProgressMessage>) => {
      if (activeJobIds[file.filename] !== jobId) return;

      if (event.data.type === 'progress') {
        progressByFile = { ...progressByFile, [file.filename]: event.data.message };
        if (event.data.phase === 'parsing') {
          rowsWrittenByFile = { ...rowsWrittenByFile, [file.filename]: event.data.rowsWritten };
          // Keep the "tail" view alive while indexing: as new rows arrive, refresh the cached query
          // in the background so the user doesn't need to scroll to see more lines.
          if (pinnedToBottomRef && selectedFiles.includes(file.filename) && event.data.rowsWritten >= 1000) {
            sendPoll();
          }
        }
        return;
      }

      stopWorker(file.filename);

      if (event.data.type === 'complete') {
        sourceRecords = { ...sourceRecords, [file.filename]: event.data.source };
        rowsWrittenByFile = { ...rowsWrittenByFile, [file.filename]: 0 };
        // Avoid disrupting the viewer if a background-selected file finishes indexing.
        if (selectedFiles.includes(file.filename)) {
          sendQuery({ force: true });
        }
        return;
      }

      error = event.data.message;
    });

    worker.addEventListener('error', (event) => {
      if (activeJobIds[file.filename] !== jobId) return;
      stopWorker(file.filename);
      error = event.message || 'Worker failed';
    });

    worker.postMessage({
      type: 'ingest',
      jobId,
      reportId: data.reportId,
      sourceFile: file.filename,
      filePath: file.filePath,
      fileSize: file.size,
      sourceUrl: buildSourceUrl(file),
      downloadMode,
      maxBytes,
      maxLines,
      timezoneOffsetSeconds: data.timezoneOffsetSeconds,
      yearHint: data.yearHint,
      nowYear: new Date().getUTCFullYear()
    });
  }

  async function ensureIndexed(force = false) {
    if (!browser || !data.reportOk) return;
    error = null;
    const runId = ++ensureRunId;

    const files = selectedFileMetas;
    if (files.length === 0) {
      sourceRecords = {};
      totalRows = 0;
      totalMatches = 0;
      clipped = false;
      windowStart = 0;
      windowRows = [];
      lastQueryKey = null;
      windowLoading = false;
      pendingWindowStart = null;
      return;
    }

    const records = await Promise.all(
      files.map(async (file) => [file.filename, await getSourceRecord(data.reportId, file.filename)] as const)
    );
    if (runId !== ensureRunId) return;

    const nextRecords: Record<string, LogSourceRecord> = {};
    for (const [sourceFile, record] of records) {
      if (record) nextRecords[sourceFile] = record;
    }
    sourceRecords = nextRecords;

    for (const file of files) {
      // If a worker is already ingesting this file, do not restart it.
      // This prevents "unselect -> reselect" from triggering a full reset + reindex.
      if (!force && activeWorkers[file.filename]) continue;
      const record = nextRecords[file.filename] ?? null;
      if (!force && !needsIngest(file, record)) continue;
      rowsWrittenByFile = { ...rowsWrittenByFile, [file.filename]: 0 };
      void startSourceIngest(file);
    }
  }

  async function reloadSelected() {
    totalRows = 0;
    totalMatches = 0;
    clipped = false;
    windowStart = 0;
    windowRows = [];
    lastQueryKey = null;
    windowLoading = false;
    pendingWindowStart = null;
    await ensureIndexed(true);
    sendQuery({ force: true });
  }

  function handleScroll(event: Event) {
    const el = event.currentTarget as HTMLDivElement;
    const nextTop = el.scrollTop;
    const nextBucket = Math.floor(nextTop / rowHeight);
    if (nextBucket !== lastScrollBucket) {
      lastScrollBucket = nextBucket;
      scrollTop = nextTop;
    }
    scrollTopRef = nextTop;

    const remaining = el.scrollHeight - (el.scrollTop + el.clientHeight);
    const pinned = remaining <= rowHeight * 2;
    pinnedToBottom = pinned;
    pinnedToBottomRef = pinned;
    maybeRequestWindow();
  }

  function openRow(row: LogRow) {
    selectedRow = row;
    detailOpen = true;
  }

  async function copyRaw(row: LogRow) {
    try {
      await navigator.clipboard.writeText(row.raw);
    } catch {
      // ignore
    }
  }

  $effect(() => {
    if (!browser || !data.reportOk) return;
    void selectedFiles.join('|');
    const timer = window.setTimeout(() => {
      void ensureIndexed(false);
    }, 0);
    return () => window.clearTimeout(timer);
  });

  $effect(() => {
    if (!browser || !data.reportOk) return;
    if (!renderReady) return;

    const timer = window.setTimeout(() => {
      if (pinnedToBottomRef) {
        sendQuery({ force: true, align: 'bottom' });
        return;
      }

      const viewportRows = Math.max(1, Math.ceil(viewportHeight / rowHeight));
      const desiredStart = windowStartForViewport(Math.floor(scrollTopRef / rowHeight), totalRows, viewportRows);
      sendQuery({ force: true, windowStart: desiredStart });
    }, 0);
    return () => window.clearTimeout(timer);
  });

  $effect(() => {
    if (!browser || !data.reportOk) return;
    void renderReady;
    void selectedFiles.join('|');
    if (!renderReady) return;

    const timer = window.setTimeout(() => {
      if (pinnedToBottomRef) {
        sendQuery({ align: 'bottom' });
        return;
      }
      const viewportRows = Math.max(1, Math.ceil(viewportHeight / rowHeight));
      const desiredStart = windowStartForViewport(Math.floor(scrollTopRef / rowHeight), totalRows, viewportRows);
      sendQuery({ windowStart: desiredStart });
    }, 0);
    return () => window.clearTimeout(timer);
  });

  $effect(() => {
    if (!browser || !data.reportOk) return;
    void searchQuery;
    void renderReady;
    if (!renderReady) return;

    if (!searchQuery) {
      matchIndexes = [];
      matchRowIds = [];
      activeMatchOrdinal = -1;
      activeMatchRowId = null;
      pendingRevealRowIndex = null;
      return;
    }

    const timer = window.setTimeout(() => {
      requestFind({ keepActive: false });
    }, 0);
    return () => window.clearTimeout(timer);
  });
</script>

<main
  style={`font-family:${F.sans}; background:${C.bg}; display:flex; flex-direction:column; height:100vh; overflow:hidden; color:${C.t0}; font-size:11px;`}
>
  <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; padding:8px 12px;">
    <div class="flex items-center gap-2 flex-wrap">
      <a style={`font-size:12px; color:${C.t2}; text-decoration:underline; text-underline-offset:2px;`} href="/lab/logs">
        Logs
      </a>
      <span style={`color:${C.t3}; font-size:12px;`}>/</span>
      <a
        style={`font-size:12px; color:${C.t2}; text-decoration:underline; text-underline-offset:2px;`}
        href={`/lab/logs/${encodeURIComponent(data.reportId)}`}
      >
        Debug
      </a>
      <span style={`color:${C.t3}; font-size:12px;`}>/</span>
      <span style={`font-size:14px; font-weight:700; color:${C.t1};`}>Viewer</span>
      <span style={`font-size:12px; color:${C.t2};`}>Report {data.reportId}</span>
    </div>

    <button
      type="button"
      style={`display:inline-flex; align-items:center; gap:8px; padding:6px 10px; border-radius:6px; border:1px solid ${C.b1}; background:#fff; font-size:12px; cursor:pointer;`}
      onclick={reloadSelected}
      disabled={selectedFileMetas.length === 0}
    >
      <RefreshCw class="h-4 w-4" />
      Reload
    </button>
  </div>

  {#if !data.reportOk}
    <div style={`margin:0 12px 12px; border:1px solid ${C.b1}; border-radius:10px; background:#fff; padding:12px; color:${C.t2}; font-size:12px;`}>
      Report <code style={`font-family:${F.mono};`}>{data.reportId}</code> is not available through Reportus and no matching fixture fallback was found.
    </div>
  {:else}
    <div
      style={`display:flex; align-items:center; gap:8px; padding:6px 12px; border-top:1px solid ${C.b1}; border-bottom:1px solid ${C.b1}; background:${C.headerBg}; flex-shrink:0;`}
    >
      {#each data.files as file (file.filename)}
        {@const lc = colorForSource(file.filename)}
        {@const on = selectedFiles.includes(file.filename)}
        <button
          type="button"
          onclick={() => toggleFile(file.filename)}
          style={`display:flex; align-items:center; gap:5px; padding:3px 8px; border-radius:4px; cursor:pointer; border:1px solid ${on ? lc.border : C.b1}; background:${on ? lc.bg : '#fff'}; opacity:${on ? 1 : 0.45}; transition:all 80ms; user-select:none;`}
        >
          <span
            style={`width:10px; height:10px; border-radius:2px; border:1.5px solid ${on ? lc.fg : C.b1}; background:${on ? lc.fg : 'transparent'}; display:flex; align-items:center; justify-content:center; flex-shrink:0;`}
          >
            {#if on}
              <svg width="7" height="7" viewBox="0 0 12 12" aria-hidden="true">
                <path
                  d="M2 6l3 3 5-5"
                  stroke="#fff"
                  stroke-width="2"
                  fill="none"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            {/if}
          </span>
          <span style={`font-size:11px; font-weight:600; font-family:${F.mono}; color:${on ? lc.fg : C.t3};`}>
            {sourceLabel(file.filename)}
          </span>
          <span style={`font-size:9px; font-family:${F.mono}; color:${on ? lc.fg : C.t4}; opacity:0.6;`}>
            {fmtSize(file.size)}
          </span>
        </button>
      {/each}

      <div style="flex:1"></div>

      <div style="display:flex; gap:3px; align-items:center;">
        {#if stats.F > 0}
          <span style={`font-size:9px; font-family:${F.mono}; font-weight:700; color:${LVL.F.color}; background:${LVL.F.bg}; padding:1px 4px; border-radius:2px;`}>
            {stats.F} F
          </span>
        {/if}
        {#if stats.W > 0}
          <span style={`font-size:9px; font-family:${F.mono}; font-weight:700; color:${LVL.W.color}; background:${LVL.W.bg}; padding:1px 4px; border-radius:2px;`}>
            {stats.W} W
          </span>
        {/if}
        <span style={`font-size:9px; font-family:${F.mono}; color:${C.t4};`}>
          {clipped ? totalMatches.toLocaleString() : totalRows.toLocaleString()} rows
        </span>
      </div>

      <div style={`width:1px; height:18px; background:${C.b2};`}></div>

      <div style="display:flex; align-items:center; gap:8px;">
        <div style="position:relative;">
        <input
          type="text"
          placeholder="Find in logs…"
          bind:value={searchInput}
          onkeydown={handleSearchKeydown}
          style={`width:220px; padding:4px 8px 4px 24px; font-size:11px; font-family:${F.mono}; border:1px solid ${C.b1}; border-radius:3px; outline:none; background:#fff; color:${C.t1};`}
        />
        <span style="position:absolute; left:7px; top:6px; opacity:0.35;">
          <Search class="h-3 w-3" />
        </span>
        {#if searchInput}
          <button
            type="button"
            onclick={() => (searchInput = '')}
            style={`position:absolute; right:6px; top:4px; cursor:pointer; background:transparent; border:none; padding:0; color:${C.t4};`}
            aria-label="Clear search"
          >
            <X class="h-3.5 w-3.5" />
          </button>
        {/if}
        </div>

        {#if searchQuery}
          <div style={`display:flex; align-items:center; gap:8px; font-family:${F.mono};`}>
            <span style={`font-size:11px; color:${matchCount > 0 ? C.t1 : C.t4}; min-width:42px; text-align:right;`}>
              {#if matchCount > 0 && activeMatchOrdinal >= 0}
                {activeMatchOrdinal + 1} of {matchCount}
              {:else}
                0 of {matchCount}
              {/if}
            </span>

            <button
              type="button"
              onclick={() => moveMatch(-1)}
              disabled={matchCount === 0}
              style={`display:inline-flex; align-items:center; justify-content:center; width:20px; height:20px; border:1px solid ${C.b1}; border-radius:3px; background:#fff; color:${matchCount === 0 ? C.t4 : C.t1}; cursor:${matchCount === 0 ? 'default' : 'pointer'}; opacity:${matchCount === 0 ? 0.45 : 1};`}
              aria-label="Previous match"
            >
              <ChevronUp class="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onclick={() => moveMatch(1)}
              disabled={matchCount === 0}
              style={`display:inline-flex; align-items:center; justify-content:center; width:20px; height:20px; border:1px solid ${C.b1}; border-radius:3px; background:#fff; color:${matchCount === 0 ? C.t4 : C.t1}; cursor:${matchCount === 0 ? 'default' : 'pointer'}; opacity:${matchCount === 0 ? 0.45 : 1};`}
              aria-label="Next match"
            >
              <ChevronDown class="h-3.5 w-3.5" />
            </button>
          </div>
        {/if}
      </div>
    </div>

    {#if error}
      <div style={`margin:10px 12px 0; border:1px solid ${C.b1}; border-radius:8px; background:#fff; padding:10px; font-size:12px; color:#B91C1C;`}>
        {error}
      </div>
    {/if}

    <div style="flex:1; display:flex; overflow:hidden;">
      <div style="flex:1; display:flex; flex-direction:column; overflow:hidden; min-width:0;">
        <div
          style={`display:flex; align-items:center; padding:0 8px; height:22px; border-bottom:1px solid ${C.b1}; background:${C.panelBg}; flex-shrink:0; font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; color:${C.t3}; user-select:none;`}
        >
          <span style="width:70px; flex-shrink:0;">Source</span>
          <span style="width:90px; flex-shrink:0;">Time</span>
          <span style="width:18px; flex-shrink:0; text-align:center;">Lv</span>
          <span style="width:90px; flex-shrink:0; padding-left:6px;">Comp</span>
          <span style="width:80px; flex-shrink:0; padding-left:4px;">Pid:ctx</span>
          <span style="flex:1; padding-left:4px;">Message</span>
        </div>

        <div
          bind:this={tableEl}
          style="flex:1; overflow:auto; overflow-anchor:none;"
          bind:clientHeight={viewportHeight}
          onscroll={handleScroll}
        >
          {#if !renderReady}
            <div style={`padding:12px; font-family:${F.mono}; font-size:11px; color:${C.t2};`}>
              {#if loading}
                <div style="margin-bottom:6px;">Loading…</div>
                <div style={`display:flex; flex-direction:column; gap:2px;`}>
                  {#each selectedFileMetas as file (file.filename)}
                    {@const msg = progressByFile[file.filename]}
                    {#if msg}
                      {@const lc = colorForSource(file.filename)}
                      <div style="display:flex; gap:6px; align-items:baseline;">
                        <span style={`width:80px; flex-shrink:0; color:${lc.fg}; font-weight:700;`}>
                          {sourceLabel(file.filename)}
                        </span>
                        <span style="flex:1; opacity:0.85;">{msg}</span>
                      </div>
                    {/if}
                  {/each}
                </div>
              {:else}
                Waiting for indexed rows…
              {/if}
            </div>
          {:else if totalRows === 0}
            <div style={`padding:12px; font-family:${F.mono}; font-size:11px; color:${C.t2};`}>
              No rows.
            </div>
          {:else if placeholder}
            {#if placeholder.topPad > 0}
              <div style={`height:${placeholder.topPad}px;`}></div>
            {/if}

            {#each Array(placeholder.count) as _, i (i)}
              <div
                style={`display:flex; align-items:center; padding:0 8px; height:${rowHeight}px; min-height:${rowHeight}px; border-bottom:1px solid ${C.b0}; background:${i % 2 === 0 ? '#fff' : '#FAFBFD'};`}
              >
                <span style={`width:70px; flex-shrink:0;`}></span>
                <span style={`width:90px; flex-shrink:0;`}></span>
                <span style={`width:18px; flex-shrink:0;`}></span>
                <span style={`width:90px; flex-shrink:0;`}></span>
                <span style={`width:80px; flex-shrink:0;`}></span>
                <span style="flex:1; padding-left:4px; min-width:0;">
                  <span style={`font-family:${F.mono}; font-size:10px; color:${C.t4};`}>
                    Loading…
                  </span>
                </span>
              </div>
            {/each}

            {#if placeholder.bottomPad > 0}
              <div style={`height:${placeholder.bottomPad}px;`}></div>
            {/if}
          {:else}
            {#if virtual.topPad > 0}
              <div style={`height:${virtual.topPad}px;`}></div>
            {/if}

            {#each virtual.rows as row, i (row.id)}
              {@const idx = virtual.start + i}
              {@const isSel = selectedRow?.id === row.id}
              {@const isMatch = matchRowIdSet.has(row.id)}
              {@const isActiveMatch = activeMatchRowId === row.id}
              {@const lc = colorForSource(row.sourceFile)}
              {@const lvl = levelMeta(row.level)}
              {@const isF = row.level === 'F'}
              {@const baseBg = idx % 2 === 0 ? '#fff' : '#FAFBFD'}
              {@const matchBg = isActiveMatch ? '#FEF3C7' : isMatch ? '#FFFBEB' : null}
              {@const bg = isSel ? C.sel : matchBg ?? (isF ? (idx % 2 === 0 ? '#FFFBFB' : '#FFF5F5') : baseBg)}
              {@const leftBorder = isSel || isActiveMatch ? `2px solid ${C.selBorder}` : '2px solid transparent'}
              {@const hasVisibleMatch = rowHasVisibleMatch(row, searchQuery)}

              <button
                type="button"
                class="tight-row"
                style={`display:flex; align-items:center; padding:0 8px; height:${rowHeight}px; min-height:${rowHeight}px; border:none; border-left:${leftBorder}; border-bottom:1px solid ${C.b0}; background:${bg}; cursor:pointer; user-select:none; transition:background 40ms; width:100%; text-align:left; outline:none;`}
                onclick={() => openRow(row)}
              >
                <span
                  style={`width:70px; flex-shrink:0; font-size:10px; font-family:${F.mono}; font-weight:600; color:${lc.fg}; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;`}
                  title={row.sourceFile}
                >
                  {sourceLabel(row.sourceFile)}
                </span>
                <span
                  style={`width:90px; flex-shrink:0; font-size:10px; font-family:${F.mono}; color:${C.t2};`}
                >
                  {row.tsRaw ?? ''}
                </span>
                <span style="width:18px; flex-shrink:0; display:flex; justify-content:center;">
                  <span
                    style={`display:inline-flex; align-items:center; justify-content:center; width:16px; height:16px; border-radius:2px; font-size:9px; font-weight:700; font-family:${F.mono}; background:${lvl.bg}; color:${lvl.color}; line-height:1; flex-shrink:0;`}
                  >
                    {lvl.label}
                  </span>
                </span>
                <span
                  style={`width:90px; flex-shrink:0; padding-left:6px; font-size:10px; font-family:${F.mono}; color:${C.t2}; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;`}
                  title={row.component ?? ''}
                >
                  {row.component ?? ''}
                </span>
                <span
                  style={`width:80px; flex-shrink:0; padding-left:4px; font-size:10px; font-family:${F.mono}; color:${C.t2}; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;`}
                >
                  {row.pid != null || row.ctx ? `${row.pid ?? ''}:${row.ctx ?? ''}` : ''}
                </span>
                <span style="flex:1; padding-left:4px; min-width:0;">
                  <span class="tight-msg" style={`font-family:${F.mono}; font-size:11px; color:${C.t1};`}>
                    {#if hasVisibleMatch}
                      {#each messageSegments(row.message, searchQuery) as segment, segmentIndex (`${row.id}:${segmentIndex}`)}
                        {#if segment.match}
                          <mark
                            style={`background:${isActiveMatch ? '#FDE68A' : '#FEF08A'}; color:${C.t0}; padding:0 1px; border-radius:2px;`}
                          >
                            {segment.text}
                          </mark>
                        {:else}
                          {segment.text}
                        {/if}
                      {/each}
                    {:else}
                      {row.message}
                    {/if}
                  </span>
                </span>
              </button>
            {/each}

            {#if virtual.bottomPad > 0}
              <div style={`height:${virtual.bottomPad}px;`}></div>
            {/if}
          {/if}
        </div>
      </div>

      <!-- Detail slide-over -->
      <div
        style={`width:${showDetail ? 300 : 0}px; border-left:${showDetail ? `1px solid ${C.b1}` : '0'}; background:${C.panelBg}; transition:width 120ms; overflow:hidden; flex-shrink:0;`}
      >
        {#if showDetail && selectedRow}
          {@const lc = colorForSource(selectedRow.sourceFile)}
          <div style={`display:flex; align-items:center; justify-content:space-between; padding:8px 10px; border-bottom:1px solid ${C.b1}; background:#fff;`}>
            <div style={`font-size:11px; font-family:${F.mono}; color:${lc.fg}; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;`}>
              {sourceLabel(selectedRow.sourceFile)}:{selectedRow.lineNo}
            </div>
            <button
              type="button"
              onclick={() => (detailOpen = false)}
              style={`background:transparent; border:none; cursor:pointer; color:${C.t3}; padding:2px;`}
              aria-label="Close details"
            >
              <X class="h-4 w-4" />
            </button>
          </div>

          <div style="padding:8px 10px; overflow:auto;">
            <div style={`display:grid; grid-template-columns:65px 1fr; gap:2px 6px; font-size:10.5px; margin-bottom:8px;`}>
              <span style={`color:${C.t3}; font-weight:500;`}>source</span>
              <span style={`font-family:${F.mono}; font-size:10px; color:${C.t2};`}>{sourceLabel(selectedRow.sourceFile)}</span>

              <span style={`color:${C.t3}; font-weight:500;`}>kind</span>
              <span style={`font-family:${F.mono}; font-size:10px; color:${C.t2};`}>{selectedRow.kind}</span>

              <span style={`color:${C.t3}; font-weight:500;`}>level</span>
              <span style={`font-family:${F.mono}; font-size:10px; color:${C.t2};`}>{selectedRow.level ?? '—'}</span>

              <span style={`color:${C.t3}; font-weight:500;`}>line</span>
              <span style={`font-family:${F.mono}; font-size:10px; color:${C.t2};`}>{selectedRow.lineNo}</span>

              <span style={`color:${C.t3}; font-weight:500;`}>component</span>
              <span style={`font-family:${F.mono}; font-size:10px; color:${C.t2};`}>{selectedRow.component ?? '—'}</span>

              <span style={`color:${C.t3}; font-weight:500;`}>pid</span>
              <span style={`font-family:${F.mono}; font-size:10px; color:${C.t2};`}>{selectedRow.pid ?? '—'}</span>

              <span style={`color:${C.t3}; font-weight:500;`}>ctx</span>
              <span style={`font-family:${F.mono}; font-size:10px; color:${C.t2};`}>{selectedRow.ctx ?? '—'}</span>

              <span style={`color:${C.t3}; font-weight:500;`}>time</span>
              <span style={`font-family:${F.mono}; font-size:10px; color:${C.t2};`}>{selectedRow.tsRaw ?? '—'}</span>
            </div>

            <div style="margin-bottom:8px;">
              <div style={`font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:${C.t4}; margin-bottom:3px;`}>
                message
              </div>
              <div
                style={`padding:4px 6px; background:#fff; border:1px solid ${C.b0}; border-radius:2px; font-size:11px; font-family:${F.mono}; color:${C.t1}; line-height:1.4; word-break:break-word; white-space:pre-wrap;`}
              >
                {selectedRow.message}
              </div>
            </div>

            <div>
              <div style="display:flex; align-items:center; gap:6px; margin-bottom:3px;">
                <div style={`font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:${C.t4};`}>
                  raw
                </div>
                <button
                  type="button"
                  onclick={() => copyRaw(selectedRow)}
                  style={`margin-left:auto; display:inline-flex; align-items:center; gap:6px; background:transparent; border:none; cursor:pointer; color:${C.selBorder}; font-size:9px; font-family:${F.mono};`}
                >
                  <Clipboard class="h-3.5 w-3.5" />
                  Copy raw
                </button>
              </div>
              <pre
                style={`padding:4px 6px; background:#fff; border:1px solid ${C.b0}; border-radius:2px; font-size:10px; font-family:${F.mono}; color:${C.t2}; line-height:1.4; margin:0; white-space:pre-wrap; word-break:break-word;`}
              >{selectedRow.raw}</pre>
            </div>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</main>

<style>
  .tight-msg {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    white-space: normal;
    word-break: break-word;
    line-height: 1.25;
  }

  .tight-row:hover {
    filter: saturate(1.02);
  }
</style>
