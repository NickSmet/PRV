import { browser } from '$app/environment';

import { getSourceRecord, queryRowsForSources } from '$lib/lab/log-index/db';
import type { LogRow, LogSourceRecord } from '$lib/lab/log-index/types';
import { buildCompactTimeline, type BuiltCompactTimeline } from '$lib/lab/log-timeline/buildCompactPayload';
import { extractTimelineEventsFromRows } from '$lib/lab/log-timeline/extractEvents';
import {
  clusterTimelineEvents,
  DEFAULT_TIMELINE_CLUSTERING,
  type VisibleWindow
} from '$lib/lab/log-timeline/clustering/clusterTimelineEvents';
import type { LogWorkspaceFile, LogWorkspacePageData } from '$lib/lab/log-workspace/types';
import type { QueryMessage, ViewerPlaceholderState, ViewerStats, ViewerVirtualState, WorkerProgressMessage } from '$lib/lab/log-viewer/types';
import type { LogRowLocator, TimelineEvent } from '$lib/lab/timeline/types';

const DEBUG_TIMELINE_CLUSTER = true;

type QueryWorkerRequest =
	| {
			type: 'query';
			jobId: number;
			reportId: string;
			sourceFiles: string[];
			search: string;
			kinds: null;
			limit: number;
			requireTimestamp: boolean;
			requireNonEmptyMessage: boolean;
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
			kinds: null;
			limit: number;
			requireTimestamp: boolean;
			requireNonEmptyMessage: boolean;
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
			type: 'window';
			jobId: number;
			windowStart: number;
			windowSize: number;
	  }
	| {
			type: 'locate';
			jobId: number;
			locator: LogRowLocator;
	  };

export class LogWorkspaceController {
	readonly data: LogWorkspacePageData;

	readonly parseVersion = 'log-index-v1';
	readonly maxBytes = 2 * 1024 * 1024;
	readonly maxLines = 20_000;
	readonly downloadMode = 'tail' as const;
	readonly requireTimestamp = true;
	readonly requireNonEmptyMessage = true;
	readonly rowHeight = 32;
	readonly overscanRows = 16;
	readonly chunkSize = 150;
	readonly maxRetainedRows = 500;
	readonly prefetchThreshold = 150;
	readonly searchDebounceMs = 1500;

	selectedFiles = $state<string[]>([]);
	sourceRecords = $state<Record<string, LogSourceRecord>>({});
	progressByFile = $state<Record<string, string>>({});
	activeWorkers = $state<Record<string, Worker>>({});
	activeJobIds = $state<Record<string, number>>({});
	rowsWrittenByFile = $state<Record<string, number>>({});

	error = $state<string | null>(null);
	timelineError = $state<string | null>(null);
	timelineNotice = $state<string | null>(null);

	totalRows = $state(0);
	totalMatches = $state(0);
	clipped = $state(false);
	windowStart = $state(0);
	windowRows = $state<LogRow[]>([]);
	lastQueryKey = $state<string | null>(null);

	searchInput = $state('');
	debouncedSearch = $state('');
	/** $state.raw avoids Svelte's deep-proxy traversal on large arrays. */
	matchIndexes = $state.raw<number[]>([]);
	/** $state.raw avoids Svelte's deep-proxy traversal on large arrays. */
	matchRowIds = $state.raw<string[]>([]);
	/** Actual match count (before the MAX_FIND_HIGHLIGHTS cap). */
	totalFindMatchCount = $state(0);
	/** True while the worker is computing find results for the current query. */
	findLoading = $state(false);
	/** Global ordinal of matchRowIds[0] within the full match list. */
	matchWindowStartOrdinal = $state(0);
	activeMatchOrdinal = $state(-1);
	activeMatchRowId = $state<string | null>(null);
	pendingRevealRowIndex = $state<number | null>(null);

	selectedRow = $state<LogRow | null>(null);
	detailOpen = $state(false);

	tableEl = $state<HTMLDivElement | null>(null);
	viewportHeight = $state(560);
	scrollTop = $state(0);
	pinnedToBottom = $state(true);
	windowLoading = $state(false);
	pendingWindowStart = $state<number | null>(null);

	events = $state<TimelineEvent[]>([]);
	eventById = $state<Record<string, TimelineEvent>>({});
	/**
	 * Render model can differ from `events` (e.g. clustered view when zoomed out).
	 * `events` remains the full extracted list so we can still show totals.
	 */
	renderedEvents = $state<TimelineEvent[]>([]);
	renderedEventById = $state<Record<string, TimelineEvent>>({});
	builtTimeline = $state<BuiltCompactTimeline | null>(null);
	/** Monotonic revision to force downstream timeline payload refreshes. */
	timelineRevision = $state(0);
	timelineClusters = $state<Record<string, string[]>>({});
	timelineVisibleWindow = $state<VisibleWindow | null>(null);
	/**
	 * The last window explicitly set by user interaction (wheel/drag).
	 * Clustering decisions are based on this, NOT on timelineVisibleWindow,
	 * to avoid feedback loops from vis-timeline's internal reflows.
	 */
	userIntendedWindow = $state<VisibleWindow | null>(null);
	timelineClusterMode = $state<'none' | 'apps'>('none');
	timelineLoading = $state(false);
	selectedEventId = $state<string | null>(null);
	eventFilter = $state('');
	flashEventId = $state<string | null>(null);

	queryWorker: Worker | null = null;
	#nextJobId = 0;
	#nextQueryJobId = 0;
	#activeQueryJobId = 0;
	#activeQueryKind: 'query' | 'poll' | 'window' = 'query';
	#nextFindJobId = 0;
	#activeFindJobId = 0;
	#nextLocateJobId = 0;
	#activeLocateJobId = 0;
	#ensureRunId = 0;
	#loadEventsSeq = 0;
	#scrollTopRef = 0;
	#pinnedToBottomRef = true;
	#lastScrollBucket = -1;
	#lastPollAt = 0;
	#searchTimer: ReturnType<typeof setTimeout> | null = null;
	#viewerRefreshTimer: ReturnType<typeof setTimeout> | null = null;
	#timelineRefreshTimer: ReturnType<typeof setTimeout> | null = null;
	#noticeTimer: ReturnType<typeof setTimeout> | null = null;
	#pendingJumpLocator: LogRowLocator | null = null;
	#programmaticScroll = false;
	#autoFocusFindResults = false;

	constructor(data: LogWorkspacePageData) {
		this.data = data;
		this.selectedFiles = [...data.defaultSelected];
	}

	get selectedFileMetas(): LogWorkspaceFile[] {
		return this.data.files.filter((file) => this.selectedFiles.includes(file.filename));
	}

	get loading() {
		return this.selectedFiles.some((file) => !!this.progressByFile[file]);
	}

	get searchQuery() {
		return this.debouncedSearch.trim();
	}

	get matchCount() {
		return this.totalFindMatchCount;
	}

	get matchRowIdSet() {
		return new Set(this.matchRowIds);
	}

	get indexedEstimate() {
		let total = 0;
		for (const sourceFile of this.selectedFiles) {
			const record = this.sourceRecords[sourceFile];
			total += record?.status === 'complete' ? record.rowCount : (this.rowsWrittenByFile[sourceFile] ?? 0);
		}
		return total;
	}

	get allSelectedComplete() {
		return this.selectedFiles.length > 0 && this.selectedFiles.every((sourceFile) => this.sourceRecords[sourceFile]?.status === 'complete');
	}

	get renderReady() {
		return this.indexedEstimate >= 1000 || this.allSelectedComplete || this.totalRows > 0;
	}

	get stats(): ViewerStats {
		const levels: ViewerStats = { F: 0, E: 0, W: 0, I: 0, D: 0, T: 0 };
		for (const row of this.windowRows) {
			if (row.level && row.level in levels) levels[row.level] += 1;
		}
		return levels;
	}

	get virtual(): ViewerVirtualState {
		const start = this.windowStart;
		const end = this.windowStart + this.windowRows.length;
		return {
			total: this.totalRows,
			start,
			end,
			rows: this.windowRows,
			topPad: start * this.rowHeight,
			bottomPad: Math.max(0, (this.totalRows - end) * this.rowHeight)
		};
	}

	get placeholder(): ViewerPlaceholderState {
		if (!this.windowLoading || this.pendingWindowStart == null) return null;
		const viewportRows = Math.max(1, Math.ceil(this.viewportHeight / this.rowHeight));
		const count = Math.max(1, viewportRows + this.overscanRows);
		const start = Math.max(0, Math.min(this.pendingWindowStart, Math.max(0, this.totalRows - count)));
		const end = Math.min(this.totalRows, start + count);
		return {
			start,
			end,
			count: end - start,
			topPad: start * this.rowHeight,
			bottomPad: Math.max(0, (this.totalRows - end) * this.rowHeight)
		};
	}

	get selectedEvent(): TimelineEvent | null {
		if (!this.selectedEventId) return null;
		return this.renderedEventById[this.selectedEventId] ?? this.eventById[this.selectedEventId] ?? null;
	}

	get timelinePayload() {
		if (!this.builtTimeline) return null;
		return {
			groups: this.builtTimeline.groups,
			items: this.builtTimeline.items,
			options: this.builtTimeline.options,
			initialWindow: this.builtTimeline.initialWindow
		};
	}

	#setBuiltTimeline(next: BuiltCompactTimeline | null, reason: string) {
		this.builtTimeline = next;
		this.timelineRevision += 1;
		if (DEBUG_TIMELINE_CLUSTER) {
			console.info('[timeline-cluster] payload-assign', {
				reason,
				revision: this.timelineRevision,
				items: next?.items?.length ?? 0,
				groups: next?.groups?.length ?? 0,
				clusterLike: next ? next.items.filter((item) => String(item.id).startsWith('cluster:')).length : 0
			});
		}
	}

	/**
	 * Called on every visible-window change (including vis-timeline internal reflows).
	 * Updates display state only — does NOT drive clustering decisions.
	 */
	handleTimelineVisibleWindowChange(window: VisibleWindow) {
		this.timelineVisibleWindow = window;
		if (DEBUG_TIMELINE_CLUSTER) {
			console.info('[timeline-cluster] window (display)', {
				spanMin: Math.round(window.spanMs / 60000)
			});
		}
	}

	/**
	 * Called only when the window changes due to explicit user interaction
	 * (wheel zoom or drag/pinch). This is the sole driver of clustering decisions.
	 */
	handleUserWindowChange(window: VisibleWindow) {
		this.userIntendedWindow = window;
		this.timelineVisibleWindow = window;

		const cfg = DEFAULT_TIMELINE_CLUSTERING.apps;
		const appsCount = this.events.reduce((acc, e) => (e.category === 'Apps' ? acc + 1 : acc), 0);
		const nextMode =
			cfg.enabled && window.spanMs >= cfg.minSpanMs && appsCount >= cfg.minItems ? ('apps' as const) : ('none' as const);
		const renderedHasCluster = this.renderedEvents.some((event) => event.id.startsWith('cluster:'));

		if (DEBUG_TIMELINE_CLUSTER) {
			console.info('[timeline-cluster] user-window', {
				spanMin: Math.round(window.spanMs / 60000),
				rawApps: appsCount,
				prevMode: this.timelineClusterMode,
				nextMode
			});
		}

		// Force deterministic unclustering when we are below threshold.
		if (nextMode === 'none') {
			// Already unclustered with non-cluster payload; avoid reassign loops.
			if (this.timelineClusterMode === 'none' && !renderedHasCluster) return;

			this.timelineClusterMode = 'none';
			this.renderedEvents = this.events;
			this.timelineClusters = {};

			const nextRenderedMap: Record<string, TimelineEvent> = {};
			for (const ev of this.events) nextRenderedMap[ev.id] = ev;
			this.renderedEventById = nextRenderedMap;
			this.#setBuiltTimeline(this.events.length > 0 ? buildCompactTimeline(this.events) : null, 'forced-uncluster');
			if (DEBUG_TIMELINE_CLUSTER) {
				console.info('[timeline-cluster] forced-uncluster', {
					spanMin: Math.round(window.spanMs / 60000),
					rawApps: this.timelineRawAppsCount,
					renderedApps: this.timelineRenderedAppsCount
				});
			}
			return;
		}

		// Recompute on mode transitions. While clustered we only need window-driven recompute
		// if clustering itself depends on current visible window.
		const shouldRecomputeWhileClustered = nextMode === 'apps' && cfg.useVisibleWindowOnly;
		if (nextMode !== this.timelineClusterMode || shouldRecomputeWhileClustered) {
			this.#recomputeTimelineModel('user-window-change');
		}
	}

	#recomputeTimelineModel(reason: string = 'unknown') {
		const model = clusterTimelineEvents(this.events, this.userIntendedWindow ?? this.timelineVisibleWindow, DEFAULT_TIMELINE_CLUSTERING);
		this.timelineClusterMode = model.mode === 'clustered' ? 'apps' : 'none';
		this.renderedEvents = model.events;
		this.timelineClusters = model.clusters ?? {};

		const nextRenderedMap: Record<string, TimelineEvent> = {};
		for (const ev of model.events) nextRenderedMap[ev.id] = ev;
		this.renderedEventById = nextRenderedMap;

		this.#setBuiltTimeline(model.events.length > 0 ? buildCompactTimeline(model.events) : null, reason);

		if (this.selectedEventId && !nextRenderedMap[this.selectedEventId] && !this.eventById[this.selectedEventId]) {
			this.selectedEventId = null;
		}

		if (DEBUG_TIMELINE_CLUSTER) {
			console.info('[timeline-cluster] recompute', {
				reason,
				mode: this.timelineClusterMode,
				spanMin: this.timelineVisibleWindow ? Math.round(this.timelineVisibleWindow.spanMs / 60000) : null,
				rawApps: this.timelineRawAppsCount,
				renderedApps: this.timelineRenderedAppsCount
			});
		}
	}

	#deriveFallbackWindow(events: TimelineEvent[]): VisibleWindow | null {
		if (events.length === 0) return null;
		let min = Number.POSITIVE_INFINITY;
		let max = Number.NEGATIVE_INFINITY;
		for (const ev of events) {
			const startMs = ev.start.getTime();
			const endMs = (ev.end ?? ev.start).getTime();
			if (Number.isFinite(startMs)) min = Math.min(min, startMs);
			if (Number.isFinite(endMs)) max = Math.max(max, endMs);
		}
		if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
		return { startMs: min, endMs: max, spanMs: Math.max(0, max - min) };
	}

	get filteredEvents() {
		const ordered = [...this.events].sort((left, right) => left.start.getTime() - right.start.getTime());
		const query = this.eventFilter.trim().toLowerCase();
		if (!query) return ordered;
		return ordered.filter(
			(event) =>
				event.label.toLowerCase().includes(query) ||
				event.sourceFile.toLowerCase().includes(query) ||
				event.category.toLowerCase().includes(query) ||
				(event.detail ?? '').toLowerCase().includes(query)
		);
	}

	get timelineRawAppsCount() {
		let count = 0;
		for (const ev of this.events) if (ev.category === 'Apps') count += 1;
		return count;
	}

	get timelineRenderedAppsCount() {
		let count = 0;
		for (const ev of this.renderedEvents) if (ev.category === 'Apps') count += 1;
		return count;
	}

	init() {
		if (!browser || this.queryWorker) return;

		this.queryWorker = new Worker(new URL('$lib/lab/log-index/query-worker.ts', import.meta.url), {
			type: 'module'
		});

		this.queryWorker.onmessage = (event: MessageEvent<QueryMessage>) => {
			if (event.data.type === 'find') {
				this.#handleFindMessage(event.data);
				return;
			}

			if (event.data.type === 'locate') {
				this.#handleLocateMessage(event.data);
				return;
			}

			if (event.data.jobId !== this.#activeQueryJobId) return;

			if (event.data.type === 'error') {
				this.error = event.data.message;
				this.windowLoading = false;
				this.pendingWindowStart = null;
				return;
			}

			this.totalRows = event.data.result.totalRows;
			this.totalMatches = event.data.result.totalMatches;
			this.clipped = event.data.result.clipped;
			this.windowStart = event.data.result.windowStart;
			this.windowRows = event.data.result.rows;
			const queryKind = this.#activeQueryKind;
			this.windowLoading = false;
			this.pendingWindowStart = null;

			if (this.#pendingJumpLocator) {
				this.#requestLocate(this.#pendingJumpLocator);
			}

			if (this.pendingRevealRowIndex != null) {
				this.#scheduleRevealIfVisible(this.pendingRevealRowIndex);
			}

			if (!this.searchQuery && this.#pinnedToBottomRef) {
				window.requestAnimationFrame(() => {
					this.#syncViewportToLoadedRows();
				});
				return;
			}

			if (this.searchQuery && queryKind !== 'window') {
				// If we already have an active match, keep it; otherwise treat this as
				// the first find result and auto-jump (covers the "search fired before
				// rows were indexed" race where the initial find returned empty).
				const hasActiveMatch = this.activeMatchOrdinal >= 0;
				this.#requestFind({ keepActive: hasActiveMatch, autoFocus: !hasActiveMatch });
			}
		};

		if (this.data.reportOk) {
			void this.ensureIndexed(false);
			this.#scheduleViewerRefresh(0, true);
			this.#scheduleTimelineRefresh(0);
		}
	}

	destroy() {
		this.#stopAllWorkers();
		if (this.queryWorker) {
			this.queryWorker.terminate();
			this.queryWorker = null;
		}
		if (this.#searchTimer) window.clearTimeout(this.#searchTimer);
		if (this.#viewerRefreshTimer) window.clearTimeout(this.#viewerRefreshTimer);
		if (this.#timelineRefreshTimer) window.clearTimeout(this.#timelineRefreshTimer);
		if (this.#noticeTimer) window.clearTimeout(this.#noticeTimer);
	}

	toggleFile(filename: string) {
		if (this.selectedFiles.includes(filename)) {
			this.selectedFiles = this.selectedFiles.filter((value) => value !== filename);
		} else {
			this.selectedFiles = [...this.selectedFiles, filename];
		}

		if (this.selectedEvent && !this.selectedFiles.includes(this.selectedEvent.sourceFile)) {
			this.selectedEventId = null;
		}

		if (this.selectedRow && !this.selectedFiles.includes(this.selectedRow.sourceFile)) {
			this.selectedRow = null;
			this.detailOpen = false;
		}

		void this.ensureIndexed(false);
		this.#scheduleViewerRefresh(0, true);
		this.#scheduleTimelineRefresh(100);
	}

	setSearchInput(value: string) {
		this.searchInput = value;
		if (this.#searchTimer) window.clearTimeout(this.#searchTimer);
		if (!value.trim()) {
			this.debouncedSearch = '';
			this.#clearFindState();
			return;
		}

		this.#searchTimer = window.setTimeout(() => {
			this.debouncedSearch = value;
			if (!this.searchQuery) {
				this.#clearFindState();
				return;
			}

			// autoFocus: true so the view jumps to the first match once results arrive.
			this.#requestFind({ autoFocus: true });
		}, this.searchDebounceMs);
	}

	clearSearch() {
		if (this.#searchTimer) window.clearTimeout(this.#searchTimer);
		this.searchInput = '';
		this.debouncedSearch = '';
		this.#clearFindState();
	}

	handleSearchKeydown(event: KeyboardEvent) {
		if (event.key !== 'Enter') return;
		event.preventDefault();
		this.moveMatch(event.shiftKey ? -1 : 1);
	}

	moveMatch(delta: -1 | 1) {
		const total = this.totalFindMatchCount;
		if (total === 0) return;
		if (this.activeMatchOrdinal < 0) {
			this.#jumpToGlobalMatchOrdinal(delta > 0 ? 0 : total - 1);
			return;
		}
		const nextOrdinal = (this.activeMatchOrdinal + delta + total) % total;
		this.#jumpToGlobalMatchOrdinal(nextOrdinal);
	}

	/** Jump to a specific global match ordinal (0-based). */
	jumpToMatchOrdinal(ordinal: number) {
		this.#jumpToGlobalMatchOrdinal(ordinal);
	}

	handleTableElementChange(element: HTMLDivElement | null) {
		this.tableEl = element;
		if (!element) return;

		window.requestAnimationFrame(() => {
			if (this.tableEl !== element) return;
			this.#syncViewportToLoadedRows();
		});
	}

	handleViewportHeightChange(value: number) {
		this.viewportHeight = value;
		if (!this.tableEl || value <= 0 || this.windowRows.length === 0) return;
		window.requestAnimationFrame(() => {
			this.#syncViewportToLoadedRows();
		});
	}

	handleScroll(event: Event) {
		const element = event.currentTarget as HTMLDivElement;
		const nextTop = element.scrollTop;
		const nextBucket = Math.floor(nextTop / this.rowHeight);
		if (nextBucket !== this.#lastScrollBucket) {
			this.#lastScrollBucket = nextBucket;
			this.scrollTop = nextTop;
		}
		this.#scrollTopRef = nextTop;

		const remaining = element.scrollHeight - (element.scrollTop + element.clientHeight);
		const pinned = remaining <= this.rowHeight * 2;
		this.pinnedToBottom = pinned;
		this.#pinnedToBottomRef = pinned;
		// Even for programmatic scrolls we still update pinned state above, otherwise
		// the viewer can remain "stuck" in pinned mode and snap back to the bottom
		// after an auto-jump (e.g. find/locate).
		if (this.#programmaticScroll) return;
		this.#maybeRequestWindow();
	}

	openRow(row: LogRow) {
		this.selectedRow = row;
		this.detailOpen = true;
	}

	async copyRaw(row: LogRow) {
		try {
			await navigator.clipboard.writeText(row.raw);
		} catch {
			// ignore
		}
	}

	setEventFilter(value: string) {
		this.eventFilter = value;
	}

	selectTimelineEvent(event: TimelineEvent | null) {
		this.selectedEventId = event?.id ?? null;
		this.timelineNotice = null;
		if (!event) return;

		this.flashEventId = event.id;
		window.setTimeout(() => {
			if (this.flashEventId === event.id) this.flashEventId = null;
		}, 400);

		this.clearSearch();
		if (!event.startRef) return;
		void this.jumpToLocator(event.startRef);
	}

	selectTimelineEventById(id: string | null) {
		this.selectTimelineEvent(id ? this.eventById[id] ?? null : null);
	}

	async reloadSelected() {
		this.totalRows = 0;
		this.totalMatches = 0;
		this.clipped = false;
		this.windowStart = 0;
		this.windowRows = [];
		this.lastQueryKey = null;
		this.windowLoading = false;
		this.pendingWindowStart = null;
		this.events = [];
		this.eventById = {};
		this.#setBuiltTimeline(null, 'toggle-file-reset');
		this.timelineNotice = null;
		await this.ensureIndexed(true);
		this.#scheduleViewerRefresh(0, true);
		this.#scheduleTimelineRefresh(0);
	}

	async ensureIndexed(force = false) {
		if (!browser || !this.data.reportOk) return;
		this.error = null;
		const runId = ++this.#ensureRunId;

		const files = this.selectedFileMetas;
		if (files.length === 0) {
			this.sourceRecords = {};
			this.totalRows = 0;
			this.totalMatches = 0;
			this.clipped = false;
			this.windowStart = 0;
			this.windowRows = [];
			this.lastQueryKey = null;
			this.windowLoading = false;
			this.pendingWindowStart = null;
			this.events = [];
			this.eventById = {};
			this.#setBuiltTimeline(null, 'reload-selected-empty');
			return;
		}

		const records = await Promise.all(
			files.map(async (file) => [file.filename, await getSourceRecord(this.data.reportId, file.filename)] as const)
		);
		if (runId !== this.#ensureRunId) return;

		const nextRecords: Record<string, LogSourceRecord> = {};
		for (const [sourceFile, record] of records) {
			if (record) nextRecords[sourceFile] = record;
		}
		this.sourceRecords = nextRecords;

		for (const file of files) {
			if (!force && this.activeWorkers[file.filename]) continue;
			const record = nextRecords[file.filename] ?? null;
			if (!force && !this.#needsIngest(file, record)) continue;
			this.rowsWrittenByFile = { ...this.rowsWrittenByFile, [file.filename]: 0 };
			void this.#startSourceIngest(file);
		}
	}

	async jumpToLocator(locator: LogRowLocator | null) {
		if (!locator) return;

		if (!this.selectedFiles.includes(locator.sourceFile)) {
			this.selectedFiles = [...this.selectedFiles, locator.sourceFile];
			this.#pendingJumpLocator = locator;
			await this.ensureIndexed(false);
			this.#scheduleViewerRefresh(0, true);
			this.#scheduleTimelineRefresh(100);
			return;
		}

		this.#pendingJumpLocator = locator;
		this.#requestLocate(locator);
	}

	onTimelineItemClick(item: unknown) {
		const id = (item as { id?: string } | null)?.id ?? null;
		this.selectTimelineEventById(id);
	}

	#stopWorker(sourceFile: string) {
		const worker = this.activeWorkers[sourceFile];
		if (worker) worker.terminate();

		if (sourceFile in this.activeWorkers) {
			const nextWorkers = { ...this.activeWorkers };
			delete nextWorkers[sourceFile];
			this.activeWorkers = nextWorkers;
		}

		if (sourceFile in this.progressByFile) {
			const nextProgress = { ...this.progressByFile };
			delete nextProgress[sourceFile];
			this.progressByFile = nextProgress;
		}

		if (sourceFile in this.activeJobIds) {
			const nextJobIds = { ...this.activeJobIds };
			delete nextJobIds[sourceFile];
			this.activeJobIds = nextJobIds;
		}
	}

	#stopAllWorkers() {
		for (const worker of Object.values(this.activeWorkers)) worker.terminate();
		this.activeWorkers = {};
		this.progressByFile = {};
		this.activeJobIds = {};
	}

	#needsIngest(file: LogWorkspaceFile, record: LogSourceRecord | null) {
		if (!record) return true;
		if (record.status !== 'complete') return true;
		if (record.filePath !== file.filePath) return true;
		if (record.fileSize !== file.size) return true;
		if (record.downloadMode !== this.downloadMode) return true;
		if (record.maxBytes !== this.maxBytes) return true;
		if ((record.maxLines ?? null) !== this.maxLines) return true;
		if (record.parseVersion !== this.parseVersion) return true;
		return false;
	}

	#encodeFilePath(filePath: string) {
		return filePath.split('/').map(encodeURIComponent).join('/');
	}

	#buildSourceUrl(file: LogWorkspaceFile) {
		if (this.data.sourceKind === 'api') {
			return `/api/reports/${encodeURIComponent(this.data.reportId)}/files/${this.#encodeFilePath(file.filePath)}?mode=${this.downloadMode}&maxBytes=${this.maxBytes}`;
		}

		return `/lab/fixtures/${encodeURIComponent(this.data.reportId)}/files/${encodeURIComponent(file.filePath)}?mode=${this.downloadMode}&maxBytes=${this.maxBytes}`;
	}

	async #startSourceIngest(file: LogWorkspaceFile) {
		this.#stopWorker(file.filename);

		const worker = new Worker(new URL('$lib/lab/log-index/worker.ts', import.meta.url), {
			type: 'module'
		});
		const jobId = ++this.#nextJobId;

		this.activeWorkers = { ...this.activeWorkers, [file.filename]: worker };
		this.activeJobIds = { ...this.activeJobIds, [file.filename]: jobId };
		this.progressByFile = { ...this.progressByFile, [file.filename]: 'Indexing…' };

		worker.addEventListener('message', (event: MessageEvent<WorkerProgressMessage>) => {
			if (this.activeJobIds[file.filename] !== jobId) return;

			if (event.data.type === 'progress') {
				this.progressByFile = { ...this.progressByFile, [file.filename]: event.data.message };
				if (event.data.phase === 'parsing') {
					this.rowsWrittenByFile = { ...this.rowsWrittenByFile, [file.filename]: event.data.rowsWritten };
					if (this.selectedFiles.includes(file.filename) && event.data.rowsWritten >= 1000) {
						if (this.searchQuery) {
							this.#scheduleViewerRefresh(250, true);
						} else if (this.#pinnedToBottomRef) {
							this.#sendPoll();
						} else if (!this.renderReady) {
							this.#scheduleViewerRefresh(0, true);
						}
						this.#scheduleTimelineRefresh(250);
					}
				}
				return;
			}

			this.#stopWorker(file.filename);

			if (event.data.type === 'complete') {
				this.sourceRecords = { ...this.sourceRecords, [file.filename]: event.data.source };
				this.rowsWrittenByFile = { ...this.rowsWrittenByFile, [file.filename]: 0 };
				if (this.selectedFiles.includes(file.filename)) {
					this.#scheduleViewerRefresh(0, true);
					this.#scheduleTimelineRefresh(100);
				}
				return;
			}

			this.error = event.data.message;
		});

		worker.addEventListener('error', (event) => {
			if (this.activeJobIds[file.filename] !== jobId) return;
			this.#stopWorker(file.filename);
			this.error = event.message || 'Worker failed';
		});

		worker.postMessage({
			type: 'ingest',
			jobId,
			reportId: this.data.reportId,
			sourceFile: file.filename,
			filePath: file.filePath,
			fileSize: file.size,
			sourceUrl: this.#buildSourceUrl(file),
			downloadMode: this.downloadMode,
			maxBytes: this.maxBytes,
			maxLines: this.maxLines,
			timezoneOffsetSeconds: this.data.timezoneOffsetSeconds,
			yearHint: this.data.yearHint,
			nowYear: new Date().getUTCFullYear()
		});
	}

	#windowSizeForViewport() {
		return this.maxRetainedRows;
	}

	#clampWindowStart(start: number, total: number) {
		const safeStart = Math.max(0, Math.trunc(start));
		const maxStart = Math.max(0, total - this.maxRetainedRows);
		const aligned = Math.floor(safeStart / this.chunkSize) * this.chunkSize;
		return Math.min(aligned, maxStart);
	}

	#windowStartForViewport(viewportStart: number, total: number, viewportRows: number) {
		if (total <= this.maxRetainedRows) return 0;
		const centered = viewportStart - Math.floor((this.maxRetainedRows - viewportRows) / 2);
		return this.#clampWindowStart(centered, total);
	}

	#queryKeyForState(sourceFiles: string[]) {
		return `${this.data.reportId}|${sourceFiles.join(',')}|${this.downloadMode}|${this.maxBytes}|${this.maxLines}|${this.parseVersion}|ts|msg`;
	}

	#currentViewportRowId() {
		const viewportIndex = Math.max(0, Math.floor(this.#scrollTopRef / this.rowHeight));
		if (viewportIndex < this.windowStart) return this.windowRows[0]?.id ?? null;
		const localIndex = viewportIndex - this.windowStart;
		return this.windowRows[localIndex]?.id ?? this.windowRows[0]?.id ?? null;
	}

	#requestFind(opts?: { keepActive?: boolean; autoFocus?: boolean; targetOrdinal?: number | null }) {
		if (!browser || !this.queryWorker) return;
		const jobId = ++this.#nextFindJobId;
		this.#activeFindJobId = jobId;
		this.#autoFocusFindResults = opts?.autoFocus ?? !opts?.keepActive;
		this.findLoading = true;
		this.queryWorker.postMessage({
			type: 'find',
			jobId,
			query: this.searchQuery,
			activeRowId: opts?.keepActive ? this.activeMatchRowId : null,
			// For fresh searches (keepActive = false) pass null so the worker returns
			// ordinal 0 — the absolute first match — instead of the nearest match to
			// the current viewport position.
			anchorRowId: opts?.keepActive ? this.activeMatchRowId : null,
			targetOrdinal: opts?.targetOrdinal ?? null
		} satisfies QueryWorkerRequest);
	}

	#clearFindState() {
		this.matchIndexes = [];
		this.matchRowIds = [];
		this.totalFindMatchCount = 0;
		this.findLoading = false;
		this.matchWindowStartOrdinal = 0;
		this.activeMatchOrdinal = -1;
		this.activeMatchRowId = null;
		this.pendingRevealRowIndex = null;
	}

	#requestLocate(locator: LogRowLocator) {
		if (!browser || !this.queryWorker) return;
		const jobId = ++this.#nextLocateJobId;
		this.#activeLocateJobId = jobId;
		this.queryWorker.postMessage({
			type: 'locate',
			jobId,
			locator: {
				sourceFile: locator.sourceFile,
				rowId: locator.rowId ?? undefined,
				lineNo: locator.lineNo ?? undefined,
				tsWallMs: locator.tsWallMs ?? undefined
			}
		} satisfies QueryWorkerRequest);
	}

	#revealRowIndex(rowIndex: number) {
		if (!this.tableEl) return;
		const centerOffset = Math.max(0, Math.floor((this.viewportHeight - this.rowHeight) / 2));
		const maxScrollTop = Math.max(0, this.tableEl.scrollHeight - this.tableEl.clientHeight);
		const nextScrollTop = Math.max(0, Math.min(rowIndex * this.rowHeight - centerOffset, maxScrollTop));
		this.#programmaticScroll = true;
		this.tableEl.scrollTop = nextScrollTop;
		this.scrollTop = nextScrollTop;
		this.#scrollTopRef = nextScrollTop;
		this.#lastScrollBucket = Math.floor(nextScrollTop / this.rowHeight);
		window.requestAnimationFrame(() => {
			this.#programmaticScroll = false;
		});
	}

	#scheduleRevealIfVisible(rowIndex: number) {
		if (rowIndex < this.windowStart || rowIndex >= this.windowStart + this.windowRows.length) return;
		window.requestAnimationFrame(() => {
			if (this.pendingRevealRowIndex === rowIndex) {
				this.#revealRowIndex(rowIndex);
				this.pendingRevealRowIndex = null;
				// If the detail pane is open, sync it to the newly revealed row so
				// the sidebar reflects the match the user just jumped to.
				if (this.detailOpen) {
					const localIndex = rowIndex - this.windowStart;
					const row = this.windowRows[localIndex];
					if (row) this.selectedRow = row;
				}
			}
		});
	}

	#syncViewportToLoadedRows() {
		if (!this.tableEl || this.windowRows.length === 0) return;
		const viewportRows = Math.max(1, Math.ceil(this.tableEl.clientHeight / this.rowHeight));

		if (this.pendingRevealRowIndex != null) {
			this.#scheduleRevealIfVisible(this.pendingRevealRowIndex);
			return;
		}

		this.#programmaticScroll = true;
		if (this.#pinnedToBottomRef) {
			const lastVisibleRow = Math.max(0, this.windowStart + this.windowRows.length - viewportRows);
			this.tableEl.scrollTop = lastVisibleRow * this.rowHeight;
		} else if (this.tableEl.scrollTop === 0 && this.windowStart > 0) {
			this.tableEl.scrollTop = this.windowStart * this.rowHeight;
		}

		this.scrollTop = this.tableEl.scrollTop;
		this.#scrollTopRef = this.tableEl.scrollTop;
		this.#lastScrollBucket = Math.floor(this.tableEl.scrollTop / this.rowHeight);
		window.requestAnimationFrame(() => {
			this.#programmaticScroll = false;
		});
	}

	#jumpToLocalMatch(localOrdinal: number) {
		if (localOrdinal < 0 || localOrdinal >= this.matchIndexes.length) return;
		const rowIndex = this.matchIndexes[localOrdinal]!;
		this.activeMatchOrdinal = this.matchWindowStartOrdinal + localOrdinal;
		this.activeMatchRowId = this.matchRowIds[localOrdinal] ?? null;
		// Navigating to a match is an explicit jump away from the live tail.
		this.pinnedToBottom = false;
		this.#pinnedToBottomRef = false;
		this.pendingRevealRowIndex = rowIndex;

		const windowEnd = this.windowStart + this.windowRows.length;
		if (rowIndex < this.windowStart || rowIndex >= windowEnd) {
			const viewportRows = Math.max(1, Math.ceil(this.viewportHeight / this.rowHeight));
			this.#sendWindow(this.#windowStartForViewport(rowIndex, this.totalRows, viewportRows));
			return;
		}

		this.#scheduleRevealIfVisible(rowIndex);
	}

	#jumpToGlobalMatchOrdinal(globalOrdinal: number) {
		const total = this.totalFindMatchCount;
		if (total <= 0) return;
		const clamped = Math.max(0, Math.min(Math.trunc(globalOrdinal), total - 1));

		const localOrdinal = clamped - this.matchWindowStartOrdinal;
		if (localOrdinal >= 0 && localOrdinal < this.matchIndexes.length) {
			this.#jumpToLocalMatch(localOrdinal);
			return;
		}

		// Request a new find window centred around the desired ordinal.
		this.pinnedToBottom = false;
		this.#pinnedToBottomRef = false;
		this.#requestFind({ autoFocus: true, targetOrdinal: clamped });
	}

	#sendQuery(opts?: { align?: 'top' | 'bottom'; force?: boolean; windowStart?: number }) {
		if (!browser || !this.queryWorker) return;
		const sourceFiles = [...this.selectedFiles];
		if (sourceFiles.length === 0) return;
		const key = this.#queryKeyForState(sourceFiles);
		if (!opts?.force && this.lastQueryKey === key) return;

		this.lastQueryKey = key;
		const jobId = ++this.#nextQueryJobId;
		this.#activeQueryJobId = jobId;
		this.#activeQueryKind = 'query';
		const limit = Math.max(1, sourceFiles.length) * this.maxLines;
		const requestedStart = Math.trunc(opts?.windowStart ?? 0);

		this.queryWorker.postMessage({
			type: 'query',
			jobId,
			reportId: this.data.reportId,
			sourceFiles,
			search: '',
			kinds: null,
			limit,
			requireTimestamp: this.requireTimestamp,
			requireNonEmptyMessage: this.requireNonEmptyMessage,
			windowStart: requestedStart,
			windowSize: this.#windowSizeForViewport(),
			align: opts?.align ?? (opts?.windowStart == null ? 'bottom' : undefined)
		} satisfies QueryWorkerRequest);
	}

	#sendWindow(nextStart: number) {
		if (!browser || !this.queryWorker) return;
		const clampedStart = this.#clampWindowStart(nextStart, this.totalRows);
		if (clampedStart === this.windowStart) return;
		if (this.windowLoading && this.pendingWindowStart === clampedStart) return;
		const jobId = ++this.#nextQueryJobId;
		this.#activeQueryJobId = jobId;
		this.#activeQueryKind = 'window';
		this.windowLoading = true;
		this.pendingWindowStart = clampedStart;
		this.queryWorker.postMessage({
			type: 'window',
			jobId,
			windowStart: clampedStart,
			windowSize: this.#windowSizeForViewport()
		} satisfies QueryWorkerRequest);
	}

	#sendPoll() {
		if (!browser || !this.queryWorker) return;
		const now = Date.now();
		if (now - this.#lastPollAt < 220) return;
		this.#lastPollAt = now;

		const sourceFiles = [...this.selectedFiles];
		if (sourceFiles.length === 0) return;
		this.lastQueryKey = this.#queryKeyForState(sourceFiles);

		const jobId = ++this.#nextQueryJobId;
		this.#activeQueryJobId = jobId;
		this.#activeQueryKind = 'poll';
		this.queryWorker.postMessage({
			type: 'poll',
			jobId,
			reportId: this.data.reportId,
			sourceFiles,
			search: '',
			kinds: null,
			limit: Math.max(1, sourceFiles.length) * this.maxLines,
			requireTimestamp: this.requireTimestamp,
			requireNonEmptyMessage: this.requireNonEmptyMessage,
			windowSize: this.#windowSizeForViewport(),
			align: 'bottom'
		} satisfies QueryWorkerRequest);
	}

	#maybeRequestWindow() {
		if (!browser || !this.queryWorker || this.totalRows <= 0 || this.windowRows.length === 0) return;
		const viewportRows = Math.max(1, Math.ceil(this.viewportHeight / this.rowHeight));
		const viewportStart = Math.max(0, Math.floor(this.scrollTop / this.rowHeight));
		const viewportEnd = viewportStart + viewportRows;
		const currentEnd = this.windowStart + this.windowRows.length;
		const nextPendingStart = this.pendingWindowStart ?? this.windowStart;

		if (viewportStart < this.windowStart || viewportEnd > currentEnd) {
			const nextStart = this.#windowStartForViewport(viewportStart, this.totalRows, viewportRows);
			if (nextStart !== nextPendingStart) this.#sendWindow(nextStart);
			return;
		}

		if (viewportEnd >= currentEnd - this.prefetchThreshold) {
			const nextStart = this.#clampWindowStart(this.windowStart + this.chunkSize, this.totalRows);
			if (nextStart !== nextPendingStart) this.#sendWindow(nextStart);
			return;
		}

		if (viewportStart <= this.windowStart + this.prefetchThreshold) {
			const nextStart = this.#clampWindowStart(this.windowStart - this.chunkSize, this.totalRows);
			if (nextStart !== nextPendingStart) this.#sendWindow(nextStart);
		}
	}

	#handleFindMessage(event: Extract<QueryMessage, { type: 'find' }>) {
		if (event.jobId !== this.#activeFindJobId) return;
		const shouldAutoFocus = this.#autoFocusFindResults;
		this.#autoFocusFindResults = false;
		this.findLoading = false;
		this.matchIndexes = event.result.matchIndexes;
		this.matchRowIds = event.result.matchRowIds;
		this.totalFindMatchCount = event.result.totalMatchCount;
		this.matchWindowStartOrdinal = event.result.windowStartOrdinal;
		this.activeMatchOrdinal = event.result.activeOrdinal;
		const localOrdinal =
			event.result.activeOrdinal >= 0 ? event.result.activeOrdinal - event.result.windowStartOrdinal : -1;
		const nextActiveRowId = localOrdinal >= 0 ? (event.result.matchRowIds[localOrdinal] ?? null) : null;
		const nextRevealIndex = localOrdinal >= 0 ? (event.result.matchIndexes[localOrdinal] ?? null) : null;
		this.activeMatchRowId = nextActiveRowId;

		if (nextRevealIndex == null || nextRevealIndex < 0) {
			this.pendingRevealRowIndex = null;
			return;
		}

		if (!shouldAutoFocus) {
			this.pendingRevealRowIndex = null;
			return;
		}

		// Auto-focusing a find result is a jump away from the live tail; unpin
		// immediately so background refreshes don't snap the viewport back down.
		this.pinnedToBottom = false;
		this.#pinnedToBottomRef = false;
		this.pendingRevealRowIndex = nextRevealIndex;
		const windowEnd = this.windowStart + this.windowRows.length;
		if (nextRevealIndex >= this.windowStart && nextRevealIndex < windowEnd) {
			this.#scheduleRevealIfVisible(nextRevealIndex);
			return;
		}

		const viewportRows = Math.max(1, Math.ceil(this.viewportHeight / this.rowHeight));
		this.#sendWindow(this.#windowStartForViewport(nextRevealIndex, this.totalRows, viewportRows));
	}

	#handleLocateMessage(event: Extract<QueryMessage, { type: 'locate' }>) {
		if (event.jobId !== this.#activeLocateJobId) return;

		if (event.result.rowIndex < 0 || !event.result.row) {
			const locator = event.result.locator;
			const sourceFile = locator?.sourceFile ?? this.#pendingJumpLocator?.sourceFile ?? null;
			if (sourceFile && (this.progressByFile[sourceFile] || this.activeWorkers[sourceFile])) {
				this.#pendingJumpLocator = locator ?? this.#pendingJumpLocator;
				return;
			}
			this.#pendingJumpLocator = null;
			this.#showTimelineNotice('Source log row not available in the current indexed slice.');
			return;
		}

		this.selectedRow = event.result.row;
		this.detailOpen = true;
		// Locating a row is also a jump away from the live tail.
		this.pinnedToBottom = false;
		this.#pinnedToBottomRef = false;
		this.pendingRevealRowIndex = event.result.rowIndex;
		this.#pendingJumpLocator = null;

		const windowEnd = this.windowStart + this.windowRows.length;
		if (event.result.rowIndex < this.windowStart || event.result.rowIndex >= windowEnd) {
			const viewportRows = Math.max(1, Math.ceil(this.viewportHeight / this.rowHeight));
			this.#sendWindow(this.#windowStartForViewport(event.result.rowIndex, this.totalRows, viewportRows));
			return;
		}

		this.#scheduleRevealIfVisible(event.result.rowIndex);
	}

	#scheduleViewerRefresh(delayMs: number, force: boolean) {
		if (!browser) return;
		if (this.#viewerRefreshTimer) window.clearTimeout(this.#viewerRefreshTimer);
		this.#viewerRefreshTimer = window.setTimeout(() => {
			if (this.selectedFiles.length === 0) return;
			if (this.#pinnedToBottomRef) {
				this.#sendQuery({ force, align: 'bottom' });
				return;
			}

			const viewportRows = Math.max(1, Math.ceil(this.viewportHeight / this.rowHeight));
			const desiredStart = this.#windowStartForViewport(
				Math.floor(this.#scrollTopRef / this.rowHeight),
				this.totalRows,
				viewportRows
			);
			this.#sendQuery({ force, windowStart: desiredStart });
		}, delayMs);
	}

	#scheduleTimelineRefresh(delayMs: number) {
		if (!browser) return;
		if (this.#timelineRefreshTimer) window.clearTimeout(this.#timelineRefreshTimer);
		this.#timelineRefreshTimer = window.setTimeout(() => {
			void this.#refreshTimeline();
		}, delayMs);
	}

	async #refreshTimeline() {
		if (!browser || !this.data.reportOk) return;
		const sourceFiles = [...this.selectedFiles];
		if (sourceFiles.length === 0) {
			this.events = [];
			this.eventById = {};
			this.renderedEvents = [];
			this.renderedEventById = {};
			this.#setBuiltTimeline(null, 'refresh-timeline-empty-files');
			this.timelineClusters = {};
			this.timelineLoading = false;
			return;
		}

		const seq = ++this.#loadEventsSeq;
		this.timelineLoading = true;
		this.timelineError = null;

		try {
			const result = await queryRowsForSources({
				reportId: this.data.reportId,
				sourceFiles,
				search: '',
				kinds: null,
				limit: Math.max(1, sourceFiles.length) * this.maxLines,
				requireTimestamp: this.requireTimestamp,
				requireNonEmptyMessage: this.requireNonEmptyMessage
			});
			if (seq !== this.#loadEventsSeq) return;

			const nextEvents = extractTimelineEventsFromRows(result.rows);
			const nextMap: Record<string, TimelineEvent> = {};
			for (const event of nextEvents) nextMap[event.id] = event;

			this.events = nextEvents;
			this.eventById = nextMap;
			// If the timeline hasn't reported its current visible window yet, use a fallback
			// derived from the event extents so clustering can activate immediately.
			if (!this.timelineVisibleWindow) {
				this.timelineVisibleWindow = this.#deriveFallbackWindow(nextEvents);
			}
			// Rendered timeline may differ (clustering); recompute from current window.
			this.#recomputeTimelineModel();

			if (this.selectedEventId && !nextMap[this.selectedEventId] && !this.renderedEventById[this.selectedEventId]) {
				this.selectedEventId = null;
			}
		} catch (error) {
			if (seq !== this.#loadEventsSeq) return;
			this.timelineError = error instanceof Error ? error.message : String(error);
			this.events = [];
			this.eventById = {};
			this.renderedEvents = [];
			this.renderedEventById = {};
			this.#setBuiltTimeline(null, 'refresh-timeline-error');
			this.timelineClusters = {};
		} finally {
			if (seq === this.#loadEventsSeq) {
				this.timelineLoading = false;
			}
		}
	}

	#showTimelineNotice(message: string) {
		this.timelineNotice = message;
		if (this.#noticeTimer) window.clearTimeout(this.#noticeTimer);
		this.#noticeTimer = window.setTimeout(() => {
			if (this.timelineNotice === message) this.timelineNotice = null;
		}, 3000);
	}
}
