<script lang="ts">
  import { browser } from '$app/environment';
  import { onDestroy } from 'svelte';
  import { Copy, RefreshCw } from '@lucide/svelte';

  import {
    getSourceRecord,
    queryRowsForSources,
    type LogRowsQueryResult
  } from '$lib/logs/index/db';
  import type { LogKind, LogRow, LogSourceRecord } from '$lib/logs/index/types';

  type PageData = {
    reportId: string;
    sourceKind: 'api' | 'fixture';
    reportOk: boolean;
    reportReceivedAt: string | null;
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

  type DisplayRow = {
    row: LogRow;
    depth: 0 | 1;
    isEntry: boolean;
    isContinuation: boolean;
    entryHasChildren: boolean;
  };

  let { data }: { data: PageData } = $props();

  const renderCap = 5000;
  const parseVersion = 'log-index-v2';

  let fileFilter = $state('');
  let selectedFiles = $state<string[]>([]);
  let mode = $state<'head' | 'tail'>('head');
  let maxBytes = $state(1 * 1024 * 1024);
  let maxLines = $state<number | null>(1000);

  let error = $state<string | null>(null);
  let rowsState = $state<LogRowsQueryResult>({ rows: [], totalMatches: 0, clipped: false });
  let sourceRecords = $state<Record<string, LogSourceRecord>>({});

  let focus = $state<'all' | 'unknown' | 'meta' | 'repeat'>('all');
  let search = $state('');
  let groupContinuations = $state(true);
  let showRaw = $state(false);

  let expandedEntries = $state(new Set<string>());
  let selectedRowId = $state<string | null>(null);
  let tableViewportHeight = $state(560);
  let tableScrollTop = $state(0);
  let lastScrollBucket = -1;

  let activeWorkers = $state<Record<string, Worker>>({});
  let progressByFile = $state<Record<string, string>>({});
  let activeJobIds = $state<Record<string, number>>({});
  let nextJobId = 0;

  const virtualRowHeight = 34;
  const virtualOverscan = 12;

  const supportsTail = $derived(data.sourceKind === 'fixture');
  const loading = $derived(Object.keys(progressByFile).length > 0);

  const filteredFiles = $derived.by(() => {
    const q = fileFilter.trim().toLowerCase();
    const base = q ? data.files.filter((file) => file.filename.toLowerCase().includes(q)) : data.files;
    return base;
  });

  const selectedFileMetas = $derived.by(() =>
    data.files.filter((file) => selectedFiles.includes(file.filename))
  );

  const selectedRow = $derived.by(() => {
    if (!selectedRowId) return null;
    return rowsState.rows.find((row) => row.id === selectedRowId) ?? null;
  });

  const aggregateStats = $derived.by(() => {
    const totals = {
      rowCount: 0,
      kindCounts: { entry: 0, continuation: 0, repeat: 0, meta: 0, unknown: 0 },
      unknownCount: 0
    };

    for (const sourceFile of selectedFiles) {
      const record = sourceRecords[sourceFile];
      if (!record) continue;
      totals.rowCount += record.rowCount;
      totals.kindCounts.entry += record.stats.kindCounts.entry;
      totals.kindCounts.continuation += record.stats.kindCounts.continuation;
      totals.kindCounts.repeat += record.stats.kindCounts.repeat;
      totals.kindCounts.meta += record.stats.kindCounts.meta;
      totals.kindCounts.unknown += record.stats.kindCounts.unknown;
      totals.unknownCount += record.stats.kindCounts.unknown;
    }

    return {
      rowCount: totals.rowCount,
      kindCounts: totals.kindCounts,
      unknownRate: totals.rowCount ? totals.unknownCount / totals.rowCount : 0
    };
  });

  const warnings = $derived.by(() => {
    const items = new Set<string>();
    for (const sourceFile of selectedFiles) {
      for (const warning of sourceRecords[sourceFile]?.warnings ?? []) {
        items.add(`${sourceLabel(sourceFile)}: ${warning}`);
      }
    }
    return [...items];
  });

  const displayRows = $derived.by(() => {
    const rows = rowsState.rows;
    const q = search.trim().toLowerCase();

    const matchingIds = new Set<string>();
    const matchingContinuationParents = new Set<string>();

    for (const row of rows) {
      if (!matchesFocus(row)) continue;
      if (!matchesSearch(row, q)) continue;
      if (groupContinuations && focus === 'all' && !q && row.kind === 'continuation') continue;
      matchingIds.add(row.id);
      if (row.kind === 'continuation' && row.parentId) matchingContinuationParents.add(row.parentId);
    }

    const out: DisplayRow[] = [];

    for (let index = 0; index < rows.length; index += 1) {
      const row = rows[index]!;

      if (row.kind === 'entry') {
        const isExpanded = groupContinuations && expandedEntries.has(row.id);
        const entryHasChildren =
          groupContinuations &&
          index + 1 < rows.length &&
          rows[index + 1]?.kind === 'continuation' &&
          rows[index + 1]?.parentId === row.id;
        const showEntry = matchingIds.has(row.id) || matchingContinuationParents.has(row.id);

        if (showEntry || (isExpanded && entryHasChildren)) {
          out.push({ row, depth: 0, isEntry: true, isContinuation: false, entryHasChildren });
        }

        if (isExpanded && entryHasChildren) {
          let nextIndex = index + 1;
          while (nextIndex < rows.length) {
            const continuation = rows[nextIndex]!;
            if (continuation.kind !== 'continuation' || continuation.parentId !== row.id) break;
            out.push({
              row: continuation,
              depth: 1,
              isEntry: false,
              isContinuation: true,
              entryHasChildren: false
            });
            nextIndex += 1;
          }
          index = nextIndex - 1;
        }
        continue;
      }

      if (groupContinuations && row.kind === 'continuation') {
        if (!matchingIds.has(row.id)) continue;
        out.push({ row, depth: 1, isEntry: false, isContinuation: true, entryHasChildren: false });
        continue;
      }

      if (!matchesFocus(row)) continue;
      if (!matchesSearch(row, q)) continue;
      out.push({ row, depth: 0, isEntry: false, isContinuation: false, entryHasChildren: false });
    }

    return out;
  });

  const virtualRows = $derived.by(() => {
    const total = displayRows.length;
    const viewportRows = Math.max(1, Math.ceil(tableViewportHeight / virtualRowHeight));
    const start = Math.max(0, Math.floor(tableScrollTop / virtualRowHeight) - virtualOverscan);
    const end = Math.min(total, start + viewportRows + virtualOverscan * 2);

    return {
      rows: displayRows.slice(start, end),
      start,
      end,
      topPadding: start * virtualRowHeight,
      bottomPadding: Math.max(0, (total - end) * virtualRowHeight),
      total
    };
  });

  $effect.pre(() => {
    selectedFiles = [...data.defaultSelected];
    fileFilter = '';
    mode = data.sourceKind === 'fixture' ? 'tail' : 'head';
    error = null;
    rowsState = { rows: [], totalMatches: 0, clipped: false };
    sourceRecords = {};
    progressByFile = {};
    activeJobIds = {};
    selectedRowId = null;
    expandedEntries = new Set();
    tableScrollTop = 0;
    lastScrollBucket = -1;
  });

  onDestroy(() => {
    stopAllWorkers();
  });

  function fmtBytes(bytes: number): string {
    if (!Number.isFinite(bytes)) return '';
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

  function encodeFilePath(filePath: string): string {
    return filePath.split('/').map(encodeURIComponent).join('/');
  }

  function buildSourceUrl(file: PageData['files'][number]): string {
    if (data.sourceKind === 'api') {
      return `/api/reports/${encodeURIComponent(data.reportId)}/files/${encodeFilePath(file.filePath)}?maxBytes=${maxBytes}`;
    }

    return `/lab/fixtures/${encodeURIComponent(data.reportId)}/files/${encodeURIComponent(file.filePath)}?mode=${encodeURIComponent(mode)}&maxBytes=${maxBytes}`;
  }

  function replaceWorkers(next: Record<string, Worker>) {
    activeWorkers = next;
  }

  function replaceProgress(next: Record<string, string>) {
    progressByFile = next;
  }

  function replaceJobIds(next: Record<string, number>) {
    activeJobIds = next;
  }

  function stopWorker(sourceFile: string) {
    const worker = activeWorkers[sourceFile];
    if (worker) worker.terminate();

    if (sourceFile in activeWorkers) {
      const nextWorkers = { ...activeWorkers };
      delete nextWorkers[sourceFile];
      replaceWorkers(nextWorkers);
    }

    if (sourceFile in progressByFile) {
      const nextProgress = { ...progressByFile };
      delete nextProgress[sourceFile];
      replaceProgress(nextProgress);
    }

    if (sourceFile in activeJobIds) {
      const nextJobIds = { ...activeJobIds };
      delete nextJobIds[sourceFile];
      replaceJobIds(nextJobIds);
    }
  }

  function stopAllWorkers() {
    for (const worker of Object.values(activeWorkers)) worker.terminate();
    replaceWorkers({});
    replaceProgress({});
    replaceJobIds({});
  }

  function toggleFile(filename: string) {
    if (selectedFiles.includes(filename)) {
      selectedFiles = selectedFiles.filter((value) => value !== filename);
      return;
    }
    selectedFiles = [...selectedFiles, filename];
  }

  function focusKinds(): LogKind[] | null {
    if (focus === 'all') return null;
    if (focus === 'unknown') return ['unknown'];
    if (focus === 'meta') return ['meta'];
    return ['repeat'];
  }

  function matchesFocus(row: LogRow): boolean {
    if (focus === 'all') return true;
    return row.kind === focus;
  }

  function matchesSearch(row: LogRow, q: string): boolean {
    if (!q) return true;
    return `${row.message}\n${row.raw}`.toLowerCase().includes(q);
  }

  function toggleExpandEntry(id: string) {
    const next = new Set($state.snapshot(expandedEntries));
    if (next.has(id)) next.delete(id);
    else next.add(id);
    expandedEntries = next;
  }

  function currentDownloadMode(): 'head' | 'tail' {
    return data.sourceKind === 'fixture' ? mode : 'head';
  }

  function sourceNeedsIngest(file: PageData['files'][number], record: LogSourceRecord | null): boolean {
    if (!record) return true;
    if (record.status !== 'complete') return true;
    if (record.filePath !== file.filePath) return true;
    if (record.fileSize !== file.size) return true;
    if (record.downloadMode !== currentDownloadMode()) return true;
    if (record.maxBytes !== maxBytes) return true;
    if ((record.maxLines ?? null) !== (maxLines ?? null)) return true;
    if (record.parseVersion !== parseVersion) return true;
    return false;
  }

  function handleTableScroll(event: Event) {
    const nextTop = (event.currentTarget as HTMLDivElement).scrollTop;
    const nextBucket = Math.floor(nextTop / virtualRowHeight);
    if (nextBucket === lastScrollBucket) return;
    lastScrollBucket = nextBucket;
    tableScrollTop = nextTop;
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
  }

  async function refreshSourcesAndRows() {
    if (!browser) return;
    const sourceFiles = [...selectedFiles];

    if (sourceFiles.length === 0) {
      sourceRecords = {};
      rowsState = { rows: [], totalMatches: 0, clipped: false };
      selectedRowId = null;
      return;
    }

    const records = await Promise.all(
      sourceFiles.map(async (sourceFile) => [sourceFile, await getSourceRecord(data.reportId, sourceFile)] as const)
    );

    const nextRecords: Record<string, LogSourceRecord> = {};
    for (const [sourceFile, record] of records) {
      if (record) nextRecords[sourceFile] = record;
    }

    sourceRecords = nextRecords;
    rowsState = await queryRowsForSources({
      reportId: data.reportId,
      sourceFiles,
      search,
      kinds: focusKinds(),
      limit: renderCap
    });

    if (selectedRowId && !rowsState.rows.some((row) => row.id === selectedRowId)) {
      selectedRowId = null;
    }
  }

  async function startSourceIngest(file: PageData['files'][number]) {
    stopWorker(file.filename);

    const worker = new Worker(new URL('$lib/logs/index/worker.ts', import.meta.url), {
      type: 'module'
    });
    const jobId = ++nextJobId;

    replaceWorkers({ ...activeWorkers, [file.filename]: worker });
    replaceJobIds({ ...activeJobIds, [file.filename]: jobId });
    replaceProgress({ ...progressByFile, [file.filename]: 'Preparing ingest…' });

    worker.addEventListener('message', (event: MessageEvent<WorkerProgressMessage>) => {
      if (activeJobIds[file.filename] !== jobId) return;

      if (event.data.type === 'progress') {
        replaceProgress({ ...progressByFile, [file.filename]: event.data.message });
        if (event.data.phase === 'parsing') {
          void refreshSourcesAndRows();
        }
        return;
      }

      const nextWorkers = { ...activeWorkers };
      delete nextWorkers[file.filename];
      replaceWorkers(nextWorkers);

      const nextProgress = { ...progressByFile };
      delete nextProgress[file.filename];
      replaceProgress(nextProgress);

      if (event.data.type === 'complete') {
        sourceRecords = { ...sourceRecords, [file.filename]: event.data.source };
        void refreshSourcesAndRows();
        worker.terminate();
        return;
      }

      error = event.data.message;
      worker.terminate();
    });

    worker.addEventListener('error', (event) => {
      if (activeJobIds[file.filename] !== jobId) return;
      const nextWorkers = { ...activeWorkers };
      delete nextWorkers[file.filename];
      replaceWorkers(nextWorkers);

      const nextProgress = { ...progressByFile };
      delete nextProgress[file.filename];
      replaceProgress(nextProgress);

      error = event.message || 'Worker failed';
      worker.terminate();
    });

    worker.postMessage({
      type: 'ingest',
      jobId,
      reportId: data.reportId,
      sourceFile: file.filename,
      filePath: file.filePath,
      fileSize: file.size,
      sourceUrl: buildSourceUrl(file),
      downloadMode: currentDownloadMode(),
      maxBytes,
      maxLines,
      reportReceivedAt: data.reportReceivedAt,
      timezoneOffsetSeconds: data.timezoneOffsetSeconds,
      yearHint: data.yearHint,
      nowYear: new Date().getUTCFullYear()
    });
  }

  async function ensureSelectedSourcesIndexed(force = false) {
    if (!browser || !data.reportOk) return;

    error = null;

    const files = selectedFileMetas;
    if (files.length === 0) {
      sourceRecords = {};
      rowsState = { rows: [], totalMatches: 0, clipped: false };
      selectedRowId = null;
      return;
    }

    const selectedSet = new Set(files.map((file) => file.filename));
    for (const sourceFile of Object.keys(activeWorkers)) {
      if (!selectedSet.has(sourceFile)) stopWorker(sourceFile);
    }

    const records = await Promise.all(
      files.map(async (file) => [file.filename, await getSourceRecord(data.reportId, file.filename)] as const)
    );

    const nextRecords: Record<string, LogSourceRecord> = {};
    for (const [sourceFile, record] of records) {
      if (record) nextRecords[sourceFile] = record;
    }
    sourceRecords = nextRecords;

    await refreshSourcesAndRows();

    for (const file of files) {
      const record = nextRecords[file.filename] ?? null;
      if (!force && !sourceNeedsIngest(file, record)) continue;
      void startSourceIngest(file);
    }
  }

  async function forceReingestSelected() {
    if (!browser || !data.reportOk) return;
    rowsState = { rows: [], totalMatches: 0, clipped: false };
    selectedRowId = null;
    expandedEntries = new Set();
    tableScrollTop = 0;
    lastScrollBucket = -1;
    await ensureSelectedSourcesIndexed(true);
  }

  $effect(() => {
    if (!browser || !data.reportOk) return;
    void selectedFiles.join('|');
    void mode;
    void maxBytes;
    void maxLines;
    const timer = window.setTimeout(() => {
      void ensureSelectedSourcesIndexed(false);
    }, 0);
    return () => window.clearTimeout(timer);
  });

  $effect(() => {
    if (!browser) return;
    void search;
    void focus;
    void selectedFiles.join('|');
    const timer = window.setTimeout(() => {
      void refreshSourcesAndRows();
    }, 75);
    return () => window.clearTimeout(timer);
  });
</script>

<main class="p-4">
  <div class="mb-3 flex items-center justify-between gap-2 flex-wrap">
    <div class="flex items-center gap-2 flex-wrap">
      <a class="text-[12px] underline underline-offset-2 text-muted-foreground" href="/lab/logs">Logs</a>
      <div class="text-[12px] text-muted-foreground">/</div>
      <div class="text-[14px] font-bold">Log parsing</div>
      <div class="text-[12px] text-muted-foreground">Report {data.reportId}</div>
      <span class="prv-pill">{data.sourceKind === 'api' ? 'reportus api' : 'fixture fallback'}</span>
      <a
        class="text-[12px] underline underline-offset-2 text-muted-foreground"
        href={`/lab/logs/${encodeURIComponent(data.reportId)}/viewer`}
      >
        Viewer
      </a>
    </div>

    <button
      type="button"
      class="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background text-[12px] hover:bg-muted/20"
      onclick={() => forceReingestSelected()}
      disabled={selectedFileMetas.length === 0}
    >
      <RefreshCw class="h-4 w-4" />
      Reload
    </button>
  </div>

  {#if !data.reportOk}
    <div class="rounded-lg border border-border bg-background p-4 text-[12px] text-muted-foreground">
      Report <code class="font-mono">{data.reportId}</code> is not available through Reportus and no matching fixture fallback was found.
    </div>
  {:else}
    <div class="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4">
      <section class="rounded-xl border border-border bg-background p-3">
        <div class="mb-2 flex items-center justify-between gap-2">
          <div class="text-[12px] font-semibold">Current VM logs</div>
          <div class="text-[11px] text-muted-foreground">{data.files.length} available</div>
        </div>

        <input class="rv-search mb-2" placeholder="Filter files…" bind:value={fileFilter} />

        <div class="space-y-1 max-h-[220px] overflow-auto pr-1">
          {#each filteredFiles as file (file.filename)}
            <label class="flex items-center justify-between gap-2 rounded-md px-2 py-1 hover:bg-muted/20 cursor-pointer">
              <div class="flex items-center gap-2 min-w-0">
                <input
                  type="checkbox"
                  class="h-4 w-4"
                  checked={selectedFiles.includes(file.filename)}
                  onchange={() => toggleFile(file.filename)}
                />
                <div class="min-w-0">
                  <div class="text-[12px] font-medium truncate">{sourceLabel(file.filename)}</div>
                  <div class="text-[11px] text-muted-foreground truncate">{file.filename}</div>
                </div>
              </div>
              <div class="text-[11px] text-muted-foreground">{fmtBytes(file.size)}</div>
            </label>
          {/each}
        </div>

        <div class="mt-3 grid grid-cols-2 gap-2">
          <label class="text-[11px] text-muted-foreground">
            Mode
            <select
              class="mt-1 w-full rounded-md border border-border bg-background px-2 py-2 text-[12px]"
              bind:value={mode}
              disabled={!supportsTail}
            >
              <option value="head">head</option>
              {#if supportsTail}
                <option value="tail">tail</option>
              {/if}
            </select>
          </label>

          <label class="text-[11px] text-muted-foreground">
            Max bytes
            <select
              class="mt-1 w-full rounded-md border border-border bg-background px-2 py-2 text-[12px]"
              value={String(maxBytes)}
              onchange={(event) => {
                const value = Number((event.currentTarget as HTMLSelectElement).value);
                maxBytes = Number.isFinite(value) ? value : 1 * 1024 * 1024;
              }}
            >
              <option value="524288">512 KiB</option>
              <option value="1048576">1 MiB</option>
              <option value="2097152">2 MiB</option>
              <option value="4194304">4 MiB</option>
            </select>
          </label>
        </div>

        <div class="mt-2 grid grid-cols-2 gap-2">
          <label class="text-[11px] text-muted-foreground">
            Max lines
            <select
              class="mt-1 w-full rounded-md border border-border bg-background px-2 py-2 text-[12px]"
              value={maxLines == null ? 'all' : String(maxLines)}
              onchange={(event) => {
                const value = (event.currentTarget as HTMLSelectElement).value;
                maxLines = value === 'all' ? null : Number(value);
              }}
            >
              <option value="250">250</option>
              <option value="500">500</option>
              <option value="1000">1,000</option>
              <option value="5000">5,000</option>
              <option value="20000">20,000</option>
              <option value="all">All</option>
            </select>
          </label>

          <div class="text-[11px] text-muted-foreground flex items-end">
            <div class="rounded-md border border-border bg-muted/10 px-2 py-2 w-full">
              Query cap: {renderCap.toLocaleString()}
            </div>
          </div>
        </div>

        <div class="mt-3 rounded-lg border border-border bg-muted/10 p-2 text-[11px] text-muted-foreground">
          Selector is limited to <code class="font-mono">vm.log</code>, <code class="font-mono">parallels-system.log</code>, and <code class="font-mono">tools.log</code>.
          {#if !supportsTail}
            <div class="mt-1">Reportus is treated as head-only; tail mode is available only for fixture fallback.</div>
          {/if}
        </div>

        {#if selectedFiles.length}
          <div class="mt-3 space-y-1">
            {#each selectedFiles as sourceFile (sourceFile)}
              <div class="rounded-md border border-border bg-muted/5 px-2 py-1 text-[11px]">
                <div class="flex items-center justify-between gap-2">
                  <span class="font-medium">{sourceLabel(sourceFile)}</span>
                  <span class="text-muted-foreground">
                    {progressByFile[sourceFile] ?? sourceRecords[sourceFile]?.status ?? 'idle'}
                  </span>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </section>

      <section class="space-y-3">
        <div class="rounded-xl border border-border bg-background p-3">
          <div class="mb-2 flex items-center justify-between gap-2 flex-wrap">
            <div class="text-[12px] font-semibold">Joined rows</div>
            <div class="flex items-center gap-2 flex-wrap">
              {#if loading}
                {#each Object.entries(progressByFile) as [sourceFile, message] (sourceFile)}
                  <span class="text-[11px] text-muted-foreground">{sourceLabel(sourceFile)} · {message}</span>
                {/each}
              {:else}
                <span class="text-[11px] text-muted-foreground">
                  {aggregateStats.rowCount.toLocaleString()} rows
                </span>
              {/if}
            </div>
          </div>

          {#if error}
            <div class="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-[12px] text-destructive">
              {error}
            </div>
          {/if}

          {#if warnings.length}
            <div class="rounded-lg border border-border bg-muted/10 p-2 text-[11px] text-muted-foreground space-y-1">
              {#each warnings as warning (warning)}
                <div>{warning}</div>
              {/each}
            </div>
          {/if}

          <div class="mt-2 flex items-center gap-2 flex-wrap">
            <span class="prv-pill">unknown: {(aggregateStats.unknownRate * 100).toFixed(1)}%</span>
            <span class="prv-pill">entries: {aggregateStats.kindCounts.entry.toLocaleString()}</span>
            <span class="prv-pill">cont: {aggregateStats.kindCounts.continuation.toLocaleString()}</span>
            <span class="prv-pill">meta: {aggregateStats.kindCounts.meta.toLocaleString()}</span>
            <span class="prv-pill">repeat: {aggregateStats.kindCounts.repeat.toLocaleString()}</span>
          </div>

          <div class="mt-3 grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-3">
            <div class="min-w-0">
              <div class="mb-2 flex items-center justify-between gap-2 flex-wrap">
                <div class="flex items-center gap-2 flex-wrap">
                  <input class="rv-search max-w-sm" placeholder="Search message/raw…" bind:value={search} />
                  <div class="inline-flex items-center gap-2 text-[11px] text-muted-foreground">
                    <label class="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        class="h-4 w-4"
                        checked={groupContinuations}
                        onchange={() => (groupContinuations = !groupContinuations)}
                      />
                      Group continuations
                    </label>
                    <label class="inline-flex items-center gap-2">
                      <input type="checkbox" class="h-4 w-4" checked={showRaw} onchange={() => (showRaw = !showRaw)} />
                      Show raw
                    </label>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <button type="button" class="prv-pill hover:bg-muted/20" onclick={() => (focus = 'all')}>All</button>
                  <button type="button" class="prv-pill hover:bg-muted/20" onclick={() => (focus = 'unknown')}>Unknown</button>
                  <button type="button" class="prv-pill hover:bg-muted/20" onclick={() => (focus = 'meta')}>Meta</button>
                  <button type="button" class="prv-pill hover:bg-muted/20" onclick={() => (focus = 'repeat')}>Repeats</button>
                </div>
              </div>

              {#if rowsState.clipped}
                <div class="mb-2 text-[11px] text-muted-foreground">
                  Showing last {renderCap.toLocaleString()} of {rowsState.totalMatches.toLocaleString()} matching rows.
                </div>
              {/if}

              <div class="rounded-lg border border-border">
                <div
                  class="max-h-[560px] overflow-auto"
                  bind:clientHeight={tableViewportHeight}
                  onscroll={handleTableScroll}
                >
                <table class="w-full text-[11px]">
                  <thead class="sticky top-0 bg-background border-b border-border">
                    <tr class="text-left text-muted-foreground">
                      <th class="px-2 py-2 w-[96px]">Source</th>
                      <th class="px-2 py-2 w-[132px]">Time</th>
                      <th class="px-2 py-2 w-[36px]">Lvl</th>
                      <th class="px-2 py-2 w-[140px]">Comp</th>
                      <th class="px-2 py-2 w-[88px]">Pid:ctx</th>
                      <th class="px-2 py-2 w-[92px]">Kind</th>
                      <th class="px-2 py-2">Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {#if virtualRows.topPadding > 0}
                      <tr aria-hidden="true">
                        <td colspan="7" class="p-0 border-0" style={`height:${virtualRows.topPadding}px;`}></td>
                      </tr>
                    {/if}

                    {#each virtualRows.rows as item (item.row.id)}
                      {@const row = item.row}
                      <tr
                        class={`border-b border-border hover:bg-muted/20 cursor-pointer ${selectedRowId === row.id ? 'bg-muted/10' : ''}`}
                        onclick={() => (selectedRowId = row.id)}
                      >
                        <td class="px-2 py-1 font-mono text-[10px] text-muted-foreground whitespace-nowrap">
                          {sourceLabel(row.sourceFile)}
                        </td>
                        <td class="px-2 py-1 font-mono text-[10px] text-muted-foreground whitespace-nowrap">
                          {row.tsRaw ?? ''}
                        </td>
                        <td class="px-2 py-1">
                          {#if row.level}
                            <span class={`prv-pill prv-pill--lvl-${row.level}`}>{row.level}</span>
                          {/if}
                        </td>
                        <td class="px-2 py-1 truncate">
                          {#if item.depth === 1}
                            <span class="text-muted-foreground mr-1">↳</span>
                          {/if}
                          {row.component ?? ''}
                        </td>
                        <td class="px-2 py-1 font-mono text-[10px] text-muted-foreground whitespace-nowrap">
                          {#if row.pid != null || row.ctx}
                            {row.pid ?? ''}:{row.ctx ?? ''}
                          {/if}
                        </td>
                        <td class="px-2 py-1">
                          {#if item.isEntry && item.entryHasChildren && groupContinuations}
                            <button
                              type="button"
                              class="prv-pill hover:bg-muted/20"
                              onclick={(event) => {
                                event.stopPropagation();
                                toggleExpandEntry(row.id);
                              }}
                            >
                              {expandedEntries.has(row.id) ? '▾' : '▸'} entry
                            </button>
                          {:else}
                            <span class="prv-pill">{row.kind}</span>
                          {/if}
                        </td>
                        <td class="px-2 py-1">
                          <div class="min-w-0">
                            <div class="truncate">{row.message}</div>
                            {#if showRaw && row.raw !== row.message}
                              <div class="mt-0.5 font-mono text-[10px] text-muted-foreground truncate">{row.raw}</div>
                            {/if}
                          </div>
                        </td>
                      </tr>
                    {/each}

                    {#if virtualRows.bottomPadding > 0}
                      <tr aria-hidden="true">
                        <td colspan="7" class="p-0 border-0" style={`height:${virtualRows.bottomPadding}px;`}></td>
                      </tr>
                    {/if}
                  </tbody>
                </table>
                </div>
              </div>
            </div>

            <aside class="rounded-lg border border-border bg-muted/5 p-3">
              <div class="mb-2 flex items-center justify-between gap-2">
                <div class="text-[12px] font-semibold">Details</div>
                {#if selectedRow}
                  <button
                    type="button"
                    class="inline-flex items-center gap-2 px-2 py-1 rounded-md border border-border bg-background text-[11px] hover:bg-muted/20"
                    onclick={() => copy(selectedRow.raw)}
                  >
                    <Copy class="h-3.5 w-3.5" />
                    Copy raw
                  </button>
                {/if}
              </div>

              {#if !selectedRow}
                <div class="text-[11px] text-muted-foreground">Click a row to inspect parsed fields.</div>
              {:else}
                <div class="space-y-2 text-[11px]">
                  <div class="text-muted-foreground">
                    <span class="font-mono">{selectedRow.id}</span>
                  </div>

                  <div class="grid grid-cols-2 gap-2">
                    <div><span class="text-muted-foreground">source</span> {sourceLabel(selectedRow.sourceFile)}</div>
                    <div><span class="text-muted-foreground">kind</span> {selectedRow.kind}</div>
                    <div><span class="text-muted-foreground">level</span> {selectedRow.level ?? '—'}</div>
                    <div><span class="text-muted-foreground">line</span> {selectedRow.lineNo}</div>
                    <div class="col-span-2"><span class="text-muted-foreground">component</span> {selectedRow.component ?? '—'}</div>
                    <div><span class="text-muted-foreground">pid</span> {selectedRow.pid ?? '—'}</div>
                    <div><span class="text-muted-foreground">ctx</span> {selectedRow.ctx ?? '—'}</div>
                    <div class="col-span-2"><span class="text-muted-foreground">tsRaw</span> {selectedRow.tsRaw ?? '—'}</div>
                    <div class="col-span-2"><span class="text-muted-foreground">tsWallMs</span> {selectedRow.tsWallMs ?? '—'}</div>
                  </div>

                  {#if selectedRow.tags.length}
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="text-muted-foreground">tags</span>
                      {#each selectedRow.tags as tag (tag)}
                        <span class="prv-pill">{tag}</span>
                      {/each}
                    </div>
                  {/if}

                  {#if selectedRow.fields}
                    <div>
                      <div class="text-muted-foreground mb-1">fields</div>
                      <pre class="text-[10px] leading-[1.35] whitespace-pre-wrap break-words rounded-lg border border-border bg-background p-2 max-h-[200px] overflow-auto">{JSON.stringify(selectedRow.fields, null, 2)}</pre>
                    </div>
                  {/if}

                  <div>
                    <div class="text-muted-foreground mb-1">message</div>
                    <pre class="text-[10px] leading-[1.35] whitespace-pre-wrap break-words rounded-lg border border-border bg-background p-2 max-h-[160px] overflow-auto">{selectedRow.message}</pre>
                  </div>

                  <div>
                    <div class="text-muted-foreground mb-1">raw</div>
                    <pre class="text-[10px] leading-[1.35] whitespace-pre-wrap break-words rounded-lg border border-border bg-background p-2 max-h-[160px] overflow-auto">{selectedRow.raw}</pre>
                  </div>
                </div>
              {/if}
            </aside>
          </div>
        </div>
      </section>
    </div>
  {/if}
</main>

<style>
  .prv-pill {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: 999px;
    border: 1px solid hsl(var(--border));
    font-size: 10px;
    line-height: 1.4;
    color: hsl(var(--muted-foreground));
    background: hsl(var(--background));
    user-select: none;
  }

  .prv-pill--lvl-F {
    border-color: rgba(148, 163, 184, 0.6);
    color: rgba(30, 41, 59, 0.95);
  }

  .prv-pill--lvl-W {
    border-color: rgba(234, 179, 8, 0.45);
    color: rgb(113, 63, 18);
  }

  .prv-pill--lvl-I {
    border-color: rgba(34, 197, 94, 0.35);
    color: rgb(20, 83, 45);
  }

  .prv-pill--lvl-D {
    border-color: rgba(59, 130, 246, 0.35);
    color: rgb(30, 64, 175);
  }
</style>
