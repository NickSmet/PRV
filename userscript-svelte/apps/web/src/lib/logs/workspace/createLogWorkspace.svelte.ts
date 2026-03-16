import { browser } from '$app/environment';

import { getSourceRecord } from '$lib/logs/index/db';
import type { LogRow } from '$lib/logs/index/types';
import type { LogWorkspaceFile, LogWorkspacePageData } from '$lib/logs/workspace/types';
import type {
	QueryMessage,
	ViewerPlaceholderState,
	ViewerStats,
	ViewerVirtualState,
	WorkerProgressMessage
} from '$lib/logs/viewer/types';
import type { LogRowLocator, TimelineEvent } from '$lib/lab/timeline/types';
import type { VisibleWindow } from '$lib/logs/timeline/clustering/clusterTimelineEvents';
import { TimelineManager } from './timelineManager.svelte';
import { IngestManager } from './ingestManager.svelte';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Controller
// ---------------------------------------------------------------------------

export class LogWorkspaceController {
	readonly data: LogWorkspacePageData;

	// --- Config constants ---
	readonly parseVersion = 'log-index-v2';
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

	// --- Sub-managers ---
	readonly timeline: TimelineManager;
	readonly ingest: IngestManager;

	// --- File selection ---
	selectedFiles = $state<string[]>([]);

	// --- Viewer error (separate from timeline error) ---
	error = $state<string | null>(null);

	// --- Viewer data ---
	totalRows = $state(0);
	totalMatches = $state(0);
	clipped = $state(false);
	windowStart = $state(0);
	windowRows = $state<LogRow[]>([]);
	lastQueryKey = $state<string | null>(null);

	// --- Search / Find ---
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

	// --- Row detail ---
	selectedRow = $state<LogRow | null>(null);
	detailOpen = $state(false);

	// --- Viewport / Scroll ---
	tableEl = $state<HTMLDivElement | null>(null);
	viewportHeight = $state(560);
	scrollTop = $state(0);
	pinnedToBottom = $state(true);
	windowLoading = $state(false);
	pendingWindowStart = $state<number | null>(null);

	// --- Private bookkeeping ---
	queryWorker: Worker | null = null;
	#nextQueryJobId = 0;
	#activeQueryJobId = 0;
	#activeQueryKind: 'query' | 'poll' | 'window' = 'query';
	#nextFindJobId = 0;
	#activeFindJobId = 0;
	#nextLocateJobId = 0;
	#activeLocateJobId = 0;
	#ensureRunId = 0;
	#scrollTopRef = 0;
	#pinnedToBottomRef = true;
	#lastScrollBucket = -1;
	#lastPollAt = 0;
	#searchTimer: ReturnType<typeof setTimeout> | null = null;
		#viewerRefreshTimer: ReturnType<typeof setTimeout> | null = null;
		#pendingJumpLocator: LogRowLocator | null = null;
		#programmaticScroll = false;
		#autoFocusFindResults = false;
		#findCorrectionAttempts = 0;

	constructor(data: LogWorkspacePageData) {
		this.data = data;
		this.selectedFiles = [...data.defaultSelected];

		this.timeline = new TimelineManager({
			reportId: () => this.data.reportId,
			reportOk: () => this.data.reportOk,
			selectedFiles: () => this.selectedFiles,
			maxLines: () => this.maxLines,
			requireTimestamp: () => this.requireTimestamp,
			requireNonEmptyMessage: () => this.requireNonEmptyMessage,
			clearSearch: () => this.clearSearch(),
			jumpToLocator: (locator) => this.jumpToLocator(locator)
		});

		this.ingest = new IngestManager({
			reportId: () => this.data.reportId,
			sourceKind: () => this.data.sourceKind,
			downloadMode: this.downloadMode,
			maxBytes: this.maxBytes,
			maxLines: this.maxLines,
			parseVersion: this.parseVersion,
			reportReceivedAt: () => this.data.reportReceivedAt,
			timezoneOffsetSeconds: () => this.data.timezoneOffsetSeconds,
			yearHint: () => this.data.yearHint,
			isFileSelected: (filename) => this.selectedFiles.includes(filename),
			onParsingMilestone: (_filename) => {
				if (this.searchQuery) {
					this.#scheduleViewerRefresh(250, true);
				} else if (this.#pinnedToBottomRef) {
					this.#sendPoll();
				} else if (!this.renderReady) {
					this.#scheduleViewerRefresh(0, true);
				}
				this.timeline.scheduleRefresh(250);
			},
			onIngestComplete: (_filename) => {
				this.#scheduleViewerRefresh(0, true);
				this.timeline.scheduleRefresh(100);
			},
			onError: (message) => {
				this.error = message;
			}
		});
	}

	// =========================================================================
	// Proxy getters — timeline (keeps the public API unchanged)
	// =========================================================================

	get events() {
		return this.timeline.events;
	}
	get eventById() {
		return this.timeline.eventById;
	}
	get renderedEvents() {
		return this.timeline.renderedEvents;
	}
	get renderedEventById() {
		return this.timeline.renderedEventById;
	}
	get builtTimeline() {
		return this.timeline.builtTimeline;
	}
	get timelineRevision() {
		return this.timeline.revision;
	}
	get timelineClusters() {
		return this.timeline.clusters;
	}
	get timelineVisibleWindow() {
		return this.timeline.visibleWindow;
	}
	get userIntendedWindow() {
		return this.timeline.userIntendedWindow;
	}
	get timelineClusterMode() {
		return this.timeline.clusterMode;
	}
	get timelineLoading() {
		return this.timeline.loading;
	}
	get selectedEventId() {
		return this.timeline.selectedEventId;
	}
	get eventFilter() {
		return this.timeline.eventFilter;
	}
	get flashEventId() {
		return this.timeline.flashEventId;
	}
	get timelineError() {
		return this.timeline.error;
	}
	get timelineNotice() {
		return this.timeline.notice;
	}
	get selectedEvent() {
		return this.timeline.selectedEvent;
	}
	get timelinePayload() {
		return this.timeline.payload;
	}
	get filteredEvents() {
		return this.timeline.filteredEvents;
	}
	get timelineRawEventCount() {
		return this.timeline.rawEventCount;
	}
	get timelineRenderedEventCount() {
		return this.timeline.renderedEventCount;
	}
	get timelineAppCategoryVisibility() {
		return this.timeline.appCategoryVisibility;
	}
	get timelineAppCategoryCounts() {
		return this.timeline.appCategoryCounts;
	}

	// =========================================================================
	// Proxy getters — ingest
	// =========================================================================

	get sourceRecords() {
		return this.ingest.sourceRecords;
	}
	get progressByFile() {
		return this.ingest.progressByFile;
	}
	get activeWorkers() {
		return this.ingest.activeWorkers;
	}
	get activeJobIds() {
		return this.ingest.activeJobIds;
	}
	get rowsWrittenByFile() {
		return this.ingest.rowsWrittenByFile;
	}

	// =========================================================================
	// Delegate methods — timeline
	// =========================================================================

	handleTimelineVisibleWindowChange(window: VisibleWindow) {
		this.timeline.handleVisibleWindowChange(window);
	}

	handleUserWindowChange(window: VisibleWindow) {
		this.timeline.handleUserWindowChange(window);
	}

	selectTimelineEvent(event: TimelineEvent | null) {
		this.timeline.selectEvent(event);
	}

	selectTimelineEventById(id: string | null) {
		this.timeline.selectEventById(id);
	}

	onTimelineItemClick(item: unknown) {
		this.timeline.handleItemClick(item);
	}

	setEventFilter(value: string) {
		this.timeline.setEventFilter(value);
	}

	toggleTimelineAppCategory(category: string) {
		this.timeline.toggleAppCategoryVisibility(category);
	}

	// =========================================================================
	// Computed getters
	// =========================================================================

	get selectedFileMetas(): LogWorkspaceFile[] {
		return this.data.files.filter((file) => this.selectedFiles.includes(file.filename));
	}

	get loading() {
		return this.selectedFiles.some((file) => !!this.ingest.progressByFile[file]);
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
			const record = this.ingest.sourceRecords[sourceFile];
			total += record?.status === 'complete'
				? record.rowCount
				: (this.ingest.rowsWrittenByFile[sourceFile] ?? 0);
		}
		return total;
	}

	get allSelectedComplete() {
		return (
			this.selectedFiles.length > 0 &&
			this.selectedFiles.every((sourceFile) => this.ingest.sourceRecords[sourceFile]?.status === 'complete')
		);
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

	// =========================================================================
	// Lifecycle
	// =========================================================================

	init() {
		if (!browser || this.queryWorker) return;

		this.queryWorker = new Worker(new URL('$lib/logs/index/query-worker.ts', import.meta.url), {
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
				const hasActiveMatch = this.activeMatchOrdinal >= 0;
				this.#requestFind({ keepActive: hasActiveMatch, autoFocus: !hasActiveMatch });
			}
		};

		if (this.data.reportOk) {
			if (this.data.forceReparse) {
				void this.reloadSelected();
			} else {
				void this.ensureIndexed(false);
				this.#scheduleViewerRefresh(0, true);
				this.timeline.scheduleRefresh(0);
			}
		}
	}

	destroy() {
		this.ingest.destroy();
		this.timeline.destroy();
		if (this.queryWorker) {
			this.queryWorker.terminate();
			this.queryWorker = null;
		}
		if (this.#searchTimer) window.clearTimeout(this.#searchTimer);
		if (this.#viewerRefreshTimer) window.clearTimeout(this.#viewerRefreshTimer);
	}

	// =========================================================================
	// File management
	// =========================================================================

	toggleFile(filename: string) {
		if (this.selectedFiles.includes(filename)) {
			this.selectedFiles = this.selectedFiles.filter((value) => value !== filename);
		} else {
			this.selectedFiles = [...this.selectedFiles, filename];
		}

		if (this.timeline.selectedEvent && !this.selectedFiles.includes(this.timeline.selectedEvent.sourceFile)) {
			this.timeline.selectedEventId = null;
		}

		if (this.selectedRow && !this.selectedFiles.includes(this.selectedRow.sourceFile)) {
			this.selectedRow = null;
			this.detailOpen = false;
		}

		void this.ensureIndexed(false);
		this.#scheduleViewerRefresh(0, true);
		this.timeline.scheduleRefresh(100);
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
		this.timeline.reset('toggle-file-reset');
		await this.ensureIndexed(true);
		this.#scheduleViewerRefresh(0, true);
		this.timeline.scheduleRefresh(0);
	}

	async ensureIndexed(force = false) {
		if (!browser || !this.data.reportOk) return;
		this.error = null;
		const runId = ++this.#ensureRunId;

		const files = this.selectedFileMetas;
		if (files.length === 0) {
			this.ingest.sourceRecords = {};
			this.totalRows = 0;
			this.totalMatches = 0;
			this.clipped = false;
			this.windowStart = 0;
			this.windowRows = [];
			this.lastQueryKey = null;
			this.windowLoading = false;
			this.pendingWindowStart = null;
			this.timeline.reset('reload-selected-empty');
			return;
		}

		const records = await Promise.all(
			files.map(async (file) => [file.filename, await getSourceRecord(this.data.reportId, file.filename)] as const)
		);
		if (runId !== this.#ensureRunId) return;

		const nextRecords: Record<string, import('$lib/logs/index/types').LogSourceRecord> = {};
		for (const [sourceFile, record] of records) {
			if (record) nextRecords[sourceFile] = record;
		}
		this.ingest.sourceRecords = nextRecords;

		for (const file of files) {
			if (!force && this.ingest.activeWorkers[file.filename]) continue;
			const record = nextRecords[file.filename] ?? null;
			if (!force && !this.ingest.needsIngest(file, record)) continue;
			this.ingest.rowsWrittenByFile = { ...this.ingest.rowsWrittenByFile, [file.filename]: 0 };
			this.ingest.startIngest(file);
		}
	}

	// =========================================================================
	// Search / Find
	// =========================================================================

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
			this.#findCorrectionAttempts = 0;
		}

	#jumpToLocalMatch(localOrdinal: number) {
		if (localOrdinal < 0 || localOrdinal >= this.matchIndexes.length) return;
		const rowIndex = this.matchIndexes[localOrdinal]!;
		this.activeMatchOrdinal = this.matchWindowStartOrdinal + localOrdinal;
		this.activeMatchRowId = this.matchRowIds[localOrdinal] ?? null;
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

		this.pinnedToBottom = false;
		this.#pinnedToBottomRef = false;
		this.#requestFind({ autoFocus: true, targetOrdinal: clamped });
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
			this.#findCorrectionAttempts = 0;

		if (nextRevealIndex == null || nextRevealIndex < 0) {
			this.pendingRevealRowIndex = null;
			return;
		}

		if (!shouldAutoFocus) {
			this.pendingRevealRowIndex = null;
			return;
		}

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

	// =========================================================================
	// Scroll / Viewport
	// =========================================================================

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

	async jumpToLocator(locator: LogRowLocator | null) {
		if (!locator) return;

		if (!this.selectedFiles.includes(locator.sourceFile)) {
			this.selectedFiles = [...this.selectedFiles, locator.sourceFile];
			this.#pendingJumpLocator = locator;
			await this.ensureIndexed(false);
			this.#scheduleViewerRefresh(0, true);
			this.timeline.scheduleRefresh(100);
			return;
		}

		this.#pendingJumpLocator = locator;
		this.#requestLocate(locator);
	}

	// =========================================================================
	// Locate
	// =========================================================================

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

	#handleLocateMessage(event: Extract<QueryMessage, { type: 'locate' }>) {
		if (event.jobId !== this.#activeLocateJobId) return;

		if (event.result.rowIndex < 0 || !event.result.row) {
			const locator = event.result.locator;
			const sourceFile = locator?.sourceFile ?? this.#pendingJumpLocator?.sourceFile ?? null;
			if (sourceFile && (this.ingest.progressByFile[sourceFile] || this.ingest.activeWorkers[sourceFile])) {
				this.#pendingJumpLocator = locator ?? this.#pendingJumpLocator;
				return;
			}
			this.#pendingJumpLocator = null;
			this.timeline.showNotice('Source log row not available in the current indexed slice.');
			return;
		}

		this.selectedRow = event.result.row;
		this.detailOpen = true;
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

	// =========================================================================
	// Viewport helpers
	// =========================================================================

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
				window.requestAnimationFrame(() => {
					if (this.pendingRevealRowIndex === rowIndex) {
						this.#revealRowIndex(rowIndex);
						this.pendingRevealRowIndex = null;
						if (this.detailOpen) {
							const localIndex = rowIndex - this.windowStart;
							const row = this.windowRows[localIndex];
							if (row) this.selectedRow = row;
						}
					}
				});
			});
		}

		#syncViewportToLoadedRows() {
			if (!this.tableEl || this.windowRows.length === 0) return;
			const viewportRows = Math.max(1, Math.ceil(this.tableEl.clientHeight / this.rowHeight));

			if (this.pendingRevealRowIndex != null) {
				const pendingLocalIndex = this.pendingRevealRowIndex - this.windowStart;
				if (
					this.activeMatchRowId &&
					pendingLocalIndex >= 0 &&
					pendingLocalIndex < this.windowRows.length
				) {
					const pendingRow = this.windowRows[pendingLocalIndex] ?? null;
					if (pendingRow?.id !== this.activeMatchRowId) {
						if (this.#findCorrectionAttempts < 2 && this.activeMatchOrdinal >= 0) {
							this.#findCorrectionAttempts += 1;
							this.#requestFind({
								autoFocus: true,
								targetOrdinal: this.activeMatchOrdinal
							});
						}
						return;
					}
				}

				const minScrollTop = this.windowStart * this.rowHeight;
				const maxScrollTop = Math.max(
					minScrollTop,
					(this.windowStart + this.windowRows.length - viewportRows) * this.rowHeight
				);
				if (this.tableEl.scrollTop < minScrollTop || this.tableEl.scrollTop > maxScrollTop) {
					this.#programmaticScroll = true;
					this.tableEl.scrollTop = Math.min(
						Math.max(this.pendingRevealRowIndex * this.rowHeight, minScrollTop),
						maxScrollTop
					);
					this.scrollTop = this.tableEl.scrollTop;
					this.#scrollTopRef = this.tableEl.scrollTop;
					this.#lastScrollBucket = Math.floor(this.tableEl.scrollTop / this.rowHeight);
					window.requestAnimationFrame(() => {
						this.#programmaticScroll = false;
						if (this.pendingRevealRowIndex != null) {
							this.#scheduleRevealIfVisible(this.pendingRevealRowIndex);
						}
					});
					return;
				}
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

	// =========================================================================
	// Query worker communication
	// =========================================================================

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

	// =========================================================================
	// Refresh scheduling
	// =========================================================================

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
}
