<script lang="ts">
  import { browser } from '$app/environment';
  import { onDestroy, onMount } from 'svelte';

  import { getSourceRecord } from '$lib/logs/index/db';
  import type { LogRow, LogSourceRecord } from '$lib/logs/index/types';

  import LogViewerDetailPane from './LogViewerDetailPane.svelte';
  import LogViewerHeader from './LogViewerHeader.svelte';
  import LogViewerTable from './LogViewerTable.svelte';
  import LogViewerToolbar from './LogViewerToolbar.svelte';
  import { VIEWER_COLORS, VIEWER_FONTS } from './theme';
  import type {
    LogViewerFile,
    LogViewerPageData,
    QueryMessage,
    ViewerPlaceholderState,
    ViewerStats,
    ViewerVirtualState,
    WorkerProgressMessage
  } from './types';

  let { data }: { data: LogViewerPageData } = $props();

  const parseVersion = 'log-index-v2';
  const maxBytes = 2 * 1024 * 1024;
  const maxLines = 20_000;
  const downloadMode = 'tail' as const;
  const requireTimestamp = true;
  const requireNonEmptyMessage = true;

  const rowHeight = 32;
  const overscanRows = 16;
  const chunkSize = 150;
  const maxRetainedRows = 500;
  const prefetchThreshold = 150;
  const searchDebounceMs = 1500;

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
  let totalFindMatchCount = $state(0);
  let findLoading = $state(false);
  let matchWindowStartOrdinal = $state(0);
  let activeMatchOrdinal = $state(-1);
  let activeMatchRowId = $state<string | null>(null);
  let nextFindJobId = 0;
  let activeFindJobId = 0;
  let pendingRevealRowIndex = $state<number | null>(null);

  let selectedRow = $state<LogRow | null>(null);
  let detailOpen = $state(false);

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
  let programmaticScroll = false;

  const selectedFileMetas = $derived.by(() =>
    data.files.filter((file) => selectedFiles.includes(file.filename))
  );

  const loading = $derived.by(() => selectedFiles.some((file) => !!progressByFile[file]));
  const searchQuery = $derived(debouncedSearch.trim());
  const matchCount = $derived(totalFindMatchCount);
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

  const renderReady = $derived(indexedEstimate >= 1000 || allSelectedComplete || totalRows > 0);

  const stats = $derived.by<ViewerStats>(() => {
    const levels: ViewerStats = { F: 0, E: 0, W: 0, I: 0, D: 0, T: 0 };
    for (const row of windowRows) {
      if (row.level && row.level in levels) levels[row.level] += 1;
    }
    return levels;
  });

  const virtual = $derived.by<ViewerVirtualState>(() => {
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

  const placeholder = $derived.by<ViewerPlaceholderState>(() => {
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
    totalFindMatchCount = 0;
    findLoading = false;
    matchWindowStartOrdinal = 0;
    selectedRow = null;
    detailOpen = false;
    scrollTop = 0;
    lastScrollBucket = -1;
    pinnedToBottom = true;
    windowLoading = false;
    pendingWindowStart = null;
  });

  onMount(() => {
    queryWorker = new Worker(new URL('$lib/logs/index/query-worker.ts', import.meta.url), {
      type: 'module'
    });

    queryWorker.onmessage = (event: MessageEvent<QueryMessage>) => {
      if (event.data.type === 'find') {
        handleFindMessage(event.data);
        return;
      }

      if (event.data.jobId !== activeQueryJobId) return;

      if (event.data.type === 'error') {
        error = event.data.message;
        windowLoading = false;
        pendingWindowStart = null;
        return;
      }

      if (event.data.type !== 'result') return;

      totalRows = event.data.result.totalRows;
      totalMatches = event.data.result.totalMatches;
      clipped = event.data.result.clipped;
      windowStart = event.data.result.windowStart;
      windowRows = event.data.result.rows;
      windowLoading = false;
      pendingWindowStart = null;

      if (pendingRevealRowIndex != null) {
        scheduleRevealIfVisible(pendingRevealRowIndex);
      }

      const q = debouncedSearch.trim();
      if (!q && pinnedToBottom) {
        window.requestAnimationFrame(() => {
          syncViewportToLoadedRows();
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
    }, searchDebounceMs);
    return () => window.clearTimeout(timer);
  });

  onDestroy(() => {
    stopAllWorkers();
    if (queryWorker) queryWorker.terminate();
  });

  function encodeFilePath(filePath: string): string {
    return filePath.split('/').map(encodeURIComponent).join('/');
  }

  function buildSourceUrl(file: LogViewerFile): string {
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

  function needsIngest(file: LogViewerFile, record: LogSourceRecord | null): boolean {
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

  function requestFind(opts?: { keepActive?: boolean; targetOrdinal?: number | null }) {
    if (!browser || !queryWorker) return;

    const jobId = ++nextFindJobId;
    activeFindJobId = jobId;
    findLoading = true;
    queryWorker.postMessage({
      type: 'find',
      jobId,
      query: searchQuery,
      activeRowId: opts?.keepActive ? activeMatchRowId : null,
      anchorRowId: opts?.keepActive ? activeMatchRowId : currentViewportRowId(),
      targetOrdinal: opts?.targetOrdinal ?? null
    });
  }

  function revealRowIndex(rowIndex: number) {
    if (!tableEl) return;
    const centerOffset = Math.max(0, Math.floor((viewportHeight - rowHeight) / 2));
    const maxScrollTop = Math.max(0, tableEl.scrollHeight - tableEl.clientHeight);
    const nextScrollTop = Math.max(0, Math.min(rowIndex * rowHeight - centerOffset, maxScrollTop));
    programmaticScroll = true;
    tableEl.scrollTop = nextScrollTop;
    scrollTop = nextScrollTop;
    scrollTopRef = nextScrollTop;
    lastScrollBucket = Math.floor(nextScrollTop / rowHeight);
    window.requestAnimationFrame(() => {
      programmaticScroll = false;
    });
  }

  function scheduleRevealIfVisible(rowIndex: number) {
    if (rowIndex < windowStart || rowIndex >= windowStart + windowRows.length) return;
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (pendingRevealRowIndex === rowIndex) {
          revealRowIndex(rowIndex);
          pendingRevealRowIndex = null;
        }
      });
    });
  }

  function syncViewportToLoadedRows() {
    if (!tableEl || windowRows.length === 0) return;
    const viewportRows = Math.max(1, Math.ceil(tableEl.clientHeight / rowHeight));

    if (pendingRevealRowIndex != null) {
      const minScrollTop = windowStart * rowHeight;
      const maxScrollTop = Math.max(minScrollTop, (windowStart + windowRows.length - viewportRows) * rowHeight);
      if (tableEl.scrollTop < minScrollTop || tableEl.scrollTop > maxScrollTop) {
        programmaticScroll = true;
        tableEl.scrollTop = Math.min(Math.max(pendingRevealRowIndex * rowHeight, minScrollTop), maxScrollTop);
        scrollTop = tableEl.scrollTop;
        scrollTopRef = tableEl.scrollTop;
        lastScrollBucket = Math.floor(tableEl.scrollTop / rowHeight);
        window.requestAnimationFrame(() => {
          programmaticScroll = false;
          if (pendingRevealRowIndex != null) {
            scheduleRevealIfVisible(pendingRevealRowIndex);
          }
        });
        return;
      }
      scheduleRevealIfVisible(pendingRevealRowIndex);
      return;
    }

    programmaticScroll = true;
    if (pinnedToBottomRef) {
      const lastVisibleRow = Math.max(0, windowStart + windowRows.length - viewportRows);
      tableEl.scrollTop = lastVisibleRow * rowHeight;
    } else if (tableEl.scrollTop === 0 && windowStart > 0) {
      tableEl.scrollTop = windowStart * rowHeight;
    }

    scrollTop = tableEl.scrollTop;
    scrollTopRef = tableEl.scrollTop;
    lastScrollBucket = Math.floor(tableEl.scrollTop / rowHeight);
    window.requestAnimationFrame(() => {
      programmaticScroll = false;
    });
  }

  function jumpToLocalMatch(localOrdinal: number) {
    if (localOrdinal < 0 || localOrdinal >= matchIndexes.length) return;
    const rowIndex = matchIndexes[localOrdinal]!;
    const rowId = matchRowIds[localOrdinal] ?? null;
    activeMatchOrdinal = matchWindowStartOrdinal + localOrdinal;
    activeMatchRowId = rowId;
    pinnedToBottom = false;
    pinnedToBottomRef = false;
    pendingRevealRowIndex = rowIndex;

    const windowEnd = windowStart + windowRows.length;
    if (rowIndex < windowStart || rowIndex >= windowEnd) {
      const viewportRows = Math.max(1, Math.ceil(viewportHeight / rowHeight));
      sendWindow(windowStartForViewport(rowIndex, totalRows, viewportRows));
      return;
    }

    scheduleRevealIfVisible(rowIndex);
  }

  function jumpToMatch(ordinal: number) {
    if (totalFindMatchCount <= 0) return;
    const clamped = Math.max(0, Math.min(Math.trunc(ordinal), totalFindMatchCount - 1));
    const localOrdinal = clamped - matchWindowStartOrdinal;
    if (localOrdinal >= 0 && localOrdinal < matchIndexes.length) {
      jumpToLocalMatch(localOrdinal);
      return;
    }

    pinnedToBottom = false;
    pinnedToBottomRef = false;
    requestFind({ targetOrdinal: clamped });
  }

  function moveMatch(delta: -1 | 1) {
    const total = totalFindMatchCount;
    if (total === 0) return;
    if (activeMatchOrdinal < 0) {
      jumpToMatch(delta > 0 ? 0 : total - 1);
      return;
    }
    const nextOrdinal = (activeMatchOrdinal + delta + total) % total;
    jumpToMatch(nextOrdinal);
  }

  function handleSearchKeydown(event: KeyboardEvent) {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    moveMatch(event.shiftKey ? -1 : 1);
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
    if (!browser || !queryWorker || totalRows <= 0 || windowRows.length === 0) return;

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

  function handleFindMessage(event: Extract<QueryMessage, { type: 'find' }>) {
    if (event.jobId !== activeFindJobId) return;
    findLoading = false;
    matchIndexes = event.result.matchIndexes;
    matchRowIds = event.result.matchRowIds;
    totalFindMatchCount = event.result.totalMatchCount;
    matchWindowStartOrdinal = event.result.windowStartOrdinal;
    activeMatchOrdinal = event.result.activeOrdinal;
    const localOrdinal =
      event.result.activeOrdinal >= 0 ? event.result.activeOrdinal - event.result.windowStartOrdinal : -1;
    const nextActiveRowId = localOrdinal >= 0 ? (event.result.matchRowIds[localOrdinal] ?? null) : null;
    const nextRevealIndex = localOrdinal >= 0 ? (event.result.matchIndexes[localOrdinal] ?? null) : null;
    activeMatchRowId = nextActiveRowId;

    if (nextRevealIndex == null || nextRevealIndex < 0) {
      pendingRevealRowIndex = null;
      return;
    }

    pendingRevealRowIndex = nextRevealIndex;
    const windowEnd = windowStart + windowRows.length;
    if (nextRevealIndex >= windowStart && nextRevealIndex < windowEnd) {
      scheduleRevealIfVisible(nextRevealIndex);
      return;
    }

    const viewportRows = Math.max(1, Math.ceil(viewportHeight / rowHeight));
    sendWindow(windowStartForViewport(nextRevealIndex, totalRows, viewportRows));
  }

  async function startSourceIngest(file: LogViewerFile) {
    stopWorker(file.filename);

    const worker = new Worker(new URL('$lib/logs/index/worker.ts', import.meta.url), {
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
    if (programmaticScroll) return;
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

  function handleSearchInput(value: string) {
    searchInput = value;
  }

  function clearSearch() {
    searchInput = '';
    totalFindMatchCount = 0;
    findLoading = false;
    matchWindowStartOrdinal = 0;
  }

  function handleTableElementChange(element: HTMLDivElement | null) {
    tableEl = element;
    if (!element) return;
    window.requestAnimationFrame(() => {
      if (tableEl !== element) return;
      syncViewportToLoadedRows();
    });
  }

  function handleViewportHeightChange(value: number) {
    viewportHeight = value;
    if (!tableEl || value <= 0 || windowRows.length === 0) return;
    window.requestAnimationFrame(() => {
      syncViewportToLoadedRows();
    });
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
    if (!browser || !data.reportOk || !renderReady) return;

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
      totalFindMatchCount = 0;
      findLoading = false;
      matchWindowStartOrdinal = 0;
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
  style={`font-family:${VIEWER_FONTS.sans}; background:${VIEWER_COLORS.bg}; display:flex; flex-direction:column; height:100vh; overflow:hidden; color:${VIEWER_COLORS.t0}; font-size:11px;`}
>
  <LogViewerHeader reportId={data.reportId} canReload={selectedFileMetas.length > 0} onReload={reloadSelected} />

  {#if !data.reportOk}
    <div style={`margin:0 12px 12px; border:1px solid ${VIEWER_COLORS.b1}; border-radius:10px; background:#fff; padding:12px; color:${VIEWER_COLORS.t2}; font-size:12px;`}>
      Report <code style={`font-family:${VIEWER_FONTS.mono};`}>{data.reportId}</code> is not available through Reportus and no matching fixture fallback was found.
    </div>
  {:else}
    <LogViewerToolbar
      files={data.files}
      {selectedFiles}
      stats={stats}
      {clipped}
      {totalRows}
      {totalMatches}
      {searchInput}
      {searchQuery}
      {matchCount}
      {activeMatchOrdinal}
      {findLoading}
      onToggleFile={toggleFile}
      onSearchInput={handleSearchInput}
      onClearSearch={clearSearch}
      onSearchKeydown={handleSearchKeydown}
      onMoveMatch={moveMatch}
      onJumpToMatch={(ordinal) => jumpToMatch(ordinal)}
    />

    {#if error}
      <div style={`margin:10px 12px 0; border:1px solid ${VIEWER_COLORS.b1}; border-radius:8px; background:#fff; padding:10px; font-size:12px; color:#B91C1C;`}>
        {error}
      </div>
    {/if}

    <div style="flex:1; display:flex; overflow:hidden;">
      <LogViewerTable
        {renderReady}
        {loading}
        {selectedFileMetas}
        {progressByFile}
        {totalRows}
        {virtual}
        {placeholder}
        {rowHeight}
        selectedRowId={selectedRow?.id ?? null}
        {searchQuery}
        {matchRowIdSet}
        {activeMatchRowId}
        onTableElementChange={handleTableElementChange}
        onViewportHeightChange={handleViewportHeightChange}
        onScroll={handleScroll}
        onOpenRow={openRow}
      />

      <LogViewerDetailPane
        {selectedRow}
        {detailOpen}
        onClose={() => (detailOpen = false)}
        onCopyRaw={copyRaw}
      />
    </div>
  {/if}
</main>
