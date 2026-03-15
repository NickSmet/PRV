import { browser } from '$app/environment';
import { queryRowsForSources } from '$lib/lab/log-index/db';
import {
	buildCompactTimeline,
	deriveInitialWindowFromExtent,
	type BuiltCompactTimeline
} from '$lib/lab/log-timeline/buildCompactPayload';
import {
	APP_TIMELINE_CATEGORIES,
	DEFAULT_APP_CATEGORY_VISIBILITY,
	isAppTimelineCategory
} from '$lib/lab/log-timeline/appCategories';
import { extractTimelineEventsFromRows } from '$lib/lab/log-timeline/extractEvents';
import {
	clusterTimelineEvents,
	DEFAULT_TIMELINE_CLUSTERING,
	type VisibleWindow
} from '$lib/lab/log-timeline/clustering/clusterTimelineEvents';
import type { LogRowLocator, TimelineEvent } from '$lib/lab/timeline/types';

const DEBUG_TIMELINE_CLUSTER = true;

export type TimelineManagerDeps = {
	reportId: () => string;
	reportOk: () => boolean;
	selectedFiles: () => string[];
	maxLines: () => number;
	requireTimestamp: () => boolean;
	requireNonEmptyMessage: () => boolean;
	clearSearch: () => void;
	jumpToLocator: (locator: LogRowLocator | null) => Promise<void>;
};

export class TimelineManager {
	readonly #deps: TimelineManagerDeps;

	events = $state<TimelineEvent[]>([]);
	eventById = $state<Record<string, TimelineEvent>>({});
	renderedEvents = $state<TimelineEvent[]>([]);
	renderedEventById = $state<Record<string, TimelineEvent>>({});
	builtTimeline = $state<BuiltCompactTimeline | null>(null);
	revision = $state(0);
	clusters = $state<Record<string, string[]>>({});
	visibleWindow = $state<VisibleWindow | null>(null);
	userIntendedWindow = $state<VisibleWindow | null>(null);
	clusterMode = $state<'none' | 'clustered'>('none');
	loading = $state(false);
	selectedEventId = $state<string | null>(null);
	eventFilter = $state('');
	flashEventId = $state<string | null>(null);
	error = $state<string | null>(null);
	notice = $state<string | null>(null);
	appCategoryVisibility = $state<Record<string, boolean>>({
		...DEFAULT_APP_CATEGORY_VISIBILITY
	});

	#refreshTimer: ReturnType<typeof setTimeout> | null = null;
	#noticeTimer: ReturnType<typeof setTimeout> | null = null;
	#loadSeq = 0;

	constructor(deps: TimelineManagerDeps) {
		this.#deps = deps;
	}

	// ---------------------------------------------------------------------------
	// Getters
	// ---------------------------------------------------------------------------

	get selectedEvent(): TimelineEvent | null {
		if (!this.selectedEventId) return null;
		return this.renderedEventById[this.selectedEventId] ?? this.eventById[this.selectedEventId] ?? null;
	}

	get payload() {
		if (!this.builtTimeline) return null;
		return {
			groups: this.builtTimeline.groups,
			items: this.builtTimeline.items,
			options: this.builtTimeline.options,
			initialWindow: this.builtTimeline.initialWindow,
			customTimes: this.builtTimeline.customTimes
		};
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

	get rawEventCount() {
		return this.events.length;
	}

	get renderedEventCount() {
		return this.renderedEvents.length;
	}

	get appCategoryCounts() {
		const counts: Record<string, number> = {};
		for (const category of APP_TIMELINE_CATEGORIES) {
			counts[category] = 0;
		}
		for (const event of this.events) {
			if (!isAppTimelineCategory(event.category)) continue;
			counts[event.category] = (counts[event.category] ?? 0) + 1;
		}
		return counts;
	}

	// ---------------------------------------------------------------------------
	// Window handling
	// ---------------------------------------------------------------------------

	/**
	 * Called on every visible-window change (including vis-timeline internal reflows).
	 * Updates display state only -- does NOT drive clustering decisions.
	 */
	handleVisibleWindowChange(window: VisibleWindow) {
		this.visibleWindow = window;
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
		this.visibleWindow = window;

		if (DEBUG_TIMELINE_CLUSTER) {
			console.info('[timeline-cluster] user-window', {
				spanMin: Math.round(window.spanMs / 60000),
				prevMode: this.clusterMode
			});
		}

		const visibleEvents = this.#eventsForTimeline();
		const model = clusterTimelineEvents(visibleEvents, window, DEFAULT_TIMELINE_CLUSTERING);
		const nextMode = model.mode === 'clustered' ? ('clustered' as const) : ('none' as const);

		if (nextMode === this.clusterMode && this.#sameEventIds(model.events)) {
			return;
		}

		this.#applyClusterModel(model, 'user-window-change');
	}

	// ---------------------------------------------------------------------------
	// Clustering
	// ---------------------------------------------------------------------------

	/** Fast check: do the event IDs match what's currently rendered? */
	#sameEventIds(nextEvents: TimelineEvent[]): boolean {
		const current = this.renderedEvents;
		if (current.length !== nextEvents.length) return false;
		for (let i = 0; i < current.length; i++) {
			if (current[i].id !== nextEvents[i].id) return false;
		}
		return true;
	}

	recomputeModel(reason: string = 'unknown') {
		const visibleEvents = this.#eventsForTimeline();
		const model = clusterTimelineEvents(
			visibleEvents,
			this.userIntendedWindow ?? this.visibleWindow,
			DEFAULT_TIMELINE_CLUSTERING
		);
		this.#applyClusterModel(model, reason);
	}

	#eventsForTimeline() {
		return this.events.filter((event) => this.#isCategoryVisible(event.category));
	}

	#isCategoryVisible(category: string) {
		if (!isAppTimelineCategory(category)) return true;
		return this.appCategoryVisibility[category] ?? true;
	}

	toggleAppCategoryVisibility(category: string) {
		if (!isAppTimelineCategory(category)) return;
		this.appCategoryVisibility = {
			...this.appCategoryVisibility,
			[category]: !(this.appCategoryVisibility[category] ?? true)
		};
		this.recomputeModel('toggle-app-category-visibility');
	}

	#applyClusterModel(model: ReturnType<typeof clusterTimelineEvents>, reason: string) {
		this.clusterMode = model.mode === 'clustered' ? 'clustered' : 'none';
		this.renderedEvents = model.events;
		this.clusters = model.clusters ?? {};

		const nextRenderedMap: Record<string, TimelineEvent> = {};
		for (const ev of model.events) nextRenderedMap[ev.id] = ev;
		this.renderedEventById = nextRenderedMap;

		const spanMs = this.userIntendedWindow?.spanMs ?? this.visibleWindow?.spanMs;
		this.#setBuiltTimeline(
			this.events.length > 0
				? buildCompactTimeline(model.events, {
						visibleSpanMs: spanMs,
						categoryTotals: this.#categoryTotals(),
						ensureCategories: this.#ensureCategories(),
						extentEvents: this.events
					})
				: null,
			reason
		);

		const selectedEvent =
			(this.selectedEventId
				? this.renderedEventById[this.selectedEventId] ?? this.eventById[this.selectedEventId] ?? null
				: null);
		if (selectedEvent && !this.#isCategoryVisible(selectedEvent.category)) {
			this.selectedEventId = null;
		} else if (
			this.selectedEventId &&
			!nextRenderedMap[this.selectedEventId] &&
			!this.eventById[this.selectedEventId]
		) {
			this.selectedEventId = null;
		}

		if (DEBUG_TIMELINE_CLUSTER) {
			console.info('[timeline-cluster] recompute', {
				reason,
				mode: this.clusterMode,
				spanMin: this.visibleWindow ? Math.round(this.visibleWindow.spanMs / 60000) : null,
				totalByCategory: model.stats.totalByCategory,
				clusteredByCategory: model.stats.clusteredByCategory
			});
		}
	}

	#setBuiltTimeline(next: BuiltCompactTimeline | null, reason: string) {
		this.builtTimeline = next;
		this.revision += 1;
		if (DEBUG_TIMELINE_CLUSTER) {
			console.info('[timeline-cluster] payload-assign', {
				reason,
				revision: this.revision,
				items: next?.items?.length ?? 0,
				groups: next?.groups?.length ?? 0,
				clusterLike: next ? next.items.filter((item) => String(item.id).startsWith('cluster:')).length : 0
			});
		}
	}

	#categoryTotals() {
		const totals: Record<string, number> = {};
		for (const event of this.events) {
			totals[event.category] = (totals[event.category] ?? 0) + 1;
		}
		return totals;
	}

	#ensureCategories() {
		if (!this.events.some((event) => isAppTimelineCategory(event.category))) {
			return [];
		}
		return [...APP_TIMELINE_CATEGORIES];
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
		const initialWindow = deriveInitialWindowFromExtent(min, max);
		if (initialWindow) {
			const startMs = initialWindow.start.getTime();
			const endMs = initialWindow.end.getTime();
			return { startMs, endMs, spanMs: Math.max(0, endMs - startMs) };
		}
		return { startMs: min, endMs: max, spanMs: Math.max(0, max - min) };
	}

	// ---------------------------------------------------------------------------
	// Event selection
	// ---------------------------------------------------------------------------

	selectEvent(event: TimelineEvent | null) {
		this.selectedEventId = event?.id ?? null;
		this.notice = null;
		if (!event) return;

		this.flashEventId = event.id;
		window.setTimeout(() => {
			if (this.flashEventId === event.id) this.flashEventId = null;
		}, 400);

		this.#deps.clearSearch();
		if (!event.startRef) return;
		void this.#deps.jumpToLocator(event.startRef);
	}

	selectEventById(id: string | null) {
		this.selectEvent(id ? (this.eventById[id] ?? null) : null);
	}

	handleItemClick(item: unknown) {
		const id = (item as { id?: string } | null)?.id ?? null;
		this.selectEventById(id);
	}

	setEventFilter(value: string) {
		this.eventFilter = value;
	}

	// ---------------------------------------------------------------------------
	// Data refresh
	// ---------------------------------------------------------------------------

	scheduleRefresh(delayMs: number) {
		if (!browser) return;
		if (this.#refreshTimer) window.clearTimeout(this.#refreshTimer);
		this.#refreshTimer = window.setTimeout(() => {
			void this.#refresh();
		}, delayMs);
	}

	async #refresh() {
		if (!browser || !this.#deps.reportOk()) return;
		const sourceFiles = [...this.#deps.selectedFiles()];
		if (sourceFiles.length === 0) {
			this.reset('refresh-timeline-empty-files');
			return;
		}

		const seq = ++this.#loadSeq;
		this.loading = true;
		this.error = null;

		try {
			const result = await queryRowsForSources({
				reportId: this.#deps.reportId(),
				sourceFiles,
				search: '',
				kinds: null,
				limit: Math.max(1, sourceFiles.length) * this.#deps.maxLines(),
				requireTimestamp: this.#deps.requireTimestamp(),
				requireNonEmptyMessage: this.#deps.requireNonEmptyMessage()
			});
			if (seq !== this.#loadSeq) return;

			const nextEvents = extractTimelineEventsFromRows(result.rows);
			const nextMap: Record<string, TimelineEvent> = {};
			for (const event of nextEvents) nextMap[event.id] = event;

			this.events = nextEvents;
			this.eventById = nextMap;

			if (!this.visibleWindow) {
				this.visibleWindow = this.#deriveFallbackWindow(nextEvents);
			}

			this.recomputeModel('refresh-timeline');

			if (this.selectedEventId && !nextMap[this.selectedEventId] && !this.renderedEventById[this.selectedEventId]) {
				this.selectedEventId = null;
			}
		} catch (error) {
			if (seq !== this.#loadSeq) return;
			this.error = error instanceof Error ? error.message : String(error);
			this.events = [];
			this.eventById = {};
			this.renderedEvents = [];
			this.renderedEventById = {};
			this.#setBuiltTimeline(null, 'refresh-timeline-error');
			this.clusters = {};
		} finally {
			if (seq === this.#loadSeq) {
				this.loading = false;
			}
		}
	}

	// ---------------------------------------------------------------------------
	// Reset & lifecycle
	// ---------------------------------------------------------------------------

	reset(reason: string) {
		this.events = [];
		this.eventById = {};
		this.renderedEvents = [];
		this.renderedEventById = {};
		this.clusters = {};
		this.notice = null;
		this.loading = false;
		this.#setBuiltTimeline(null, reason);
	}

	showNotice(message: string) {
		this.notice = message;
		if (this.#noticeTimer) window.clearTimeout(this.#noticeTimer);
		this.#noticeTimer = window.setTimeout(() => {
			if (this.notice === message) this.notice = null;
		}, 3000);
	}

	destroy() {
		if (this.#refreshTimer) window.clearTimeout(this.#refreshTimer);
		if (this.#noticeTimer) window.clearTimeout(this.#noticeTimer);
	}
}
