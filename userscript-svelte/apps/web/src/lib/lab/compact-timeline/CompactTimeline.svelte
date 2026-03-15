<script lang="ts">
	import { untrack } from 'svelte';
	import { Timeline } from '@prv/report-ui-svelte';
	import { RefreshCw, Copy } from '@lucide/svelte';

	import type { TimelineEvent } from '$lib/lab/timeline/types';
	import { inferBaseYear, parseParallelsSystemLog, parseVmLog } from '$lib/lab/timeline/parsers';

	import { FONTS, COLORS, BADGE, SUBSYSTEMS, subsystemForFile } from './types';
	import { buildCompactTimeline, type BuiltCompactTimeline } from './buildCompactPayload';
	import { formatTimeMs, formatDuration } from './svg-utils';

	import TimelineTable from './TimelineTable.svelte';
	import DetailPanel from './DetailPanel.svelte';

	type PageData = {
		reportId: string;
		fixtureOk: boolean;
		timezoneOffsetSeconds: number | null;
		yearHint?: number | null;
		files: Array<{ filename: string; size: number }>;
		defaultSelected: string[];
	};

	let { data }: { data: PageData } = $props();

	// ── File selection ────────────────────────────────────────────────────
	const initialSelected = $derived.by(() => data.defaultSelected ?? []);
	let selectedFiles = $state<string[]>([]);

	// ── Data loading state ────────────────────────────────────────────────
	let loading = $state(false);
	let error = $state<string | null>(null);
	let fileTextByName = $state<Record<string, { text: string; truncated: boolean }>>({});

	// ── Parsed events ─────────────────────────────────────────────────────
	let events = $state<TimelineEvent[]>([]);
	let eventById = $state<Record<string, TimelineEvent>>({});
	let built = $state<BuiltCompactTimeline | null>(null);

	// ── Interaction state ─────────────────────────────────────────────────
	let selectedEvent = $state<TimelineEvent | null>(null);
	let flashId = $state<string | null>(null);
	let tableFilter = $state('');

	// ── Table refs ────────────────────────────────────────────────────────
	const rowRefs = new Map<string, HTMLElement>();

	// ── Derived ───────────────────────────────────────────────────────────
	const timelinePayload = $derived(
		built
			? {
					groups: built.groups,
					items: built.items,
					options: built.options,
					initialWindow: built.initialWindow
				}
			: null
	);

	const sortedEvents = $derived.by(() =>
		[...events].sort((a, b) => a.start.getTime() - b.start.getTime())
	);

	const tableEvents = $derived.by(() => {
		if (!tableFilter) return sortedEvents;
		const q = tableFilter.toLowerCase();
		return sortedEvents.filter(
			(e) =>
				e.label.toLowerCase().includes(q) ||
				e.sourceFile.toLowerCase().includes(q) ||
				e.category.toLowerCase().includes(q) ||
				(e.detail ?? '').toLowerCase().includes(q)
		);
	});

	const selectedId = $derived(selectedEvent?.id ?? null);

	// ── Reset on route change ─────────────────────────────────────────────
	$effect.pre(() => {
		selectedFiles = initialSelected;
		selectedEvent = null;
	});

	// ── Data loading ─────────────────────────────────────────────────────
	let loadSeq = 0;

	async function loadAndParse(forceReload = false, selected: string[] = selectedFiles) {
		if (!data.fixtureOk) return;

		const seq = ++loadSeq;
		loading = true;
		error = null;

		try {
			const next = { ...$state.snapshot(fileTextByName) };

			for (const f of selected) {
				if (!forceReload && next[f]) continue;
				const res = await fetch(
					`/lab/fixtures/${encodeURIComponent(data.reportId)}/files/${encodeURIComponent(f)}?mode=head&maxBytes=2097152`
				);
				if (!res.ok) {
					const msg = await res.text().catch(() => '');
					throw new Error(msg || `HTTP ${res.status}`);
				}
				const truncated = res.headers.get('x-prv-truncated') === 'true';
				const text = await res.text();
				next[f] = { text, truncated };
			}

			if (seq !== loadSeq) return;
			fileTextByName = next;

			const selectedTexts = selected
				.map((filename) => ({ filename, text: next[filename]?.text ?? '' }))
				.filter((x) => x.text);

			const nowYear = new Date().getUTCFullYear();
			const inferredYear = data.yearHint ?? inferBaseYear(selectedTexts) ?? nowYear;
			const safeYear =
				inferredYear >= 2000 && inferredYear <= nowYear + 2 ? inferredYear : nowYear;
			const tz = data.timezoneOffsetSeconds ?? null;

			const parsed: TimelineEvent[] = [];
			for (const { filename, text } of selectedTexts) {
				if (filename === 'parallels-system.log') {
					parsed.push(
						...parseParallelsSystemLog(text, {
							sourceFile: filename,
							year: safeYear,
							timezoneOffsetSeconds: tz
						})
					);
				} else if (filename === 'vm.log') {
					parsed.push(
						...parseVmLog(text, {
							sourceFile: filename,
							year: safeYear,
							timezoneOffsetSeconds: tz
						})
					);
				}
			}

			events = parsed;

			const map: Record<string, TimelineEvent> = {};
			for (const e of parsed) map[e.id] = e;
			eventById = map;

			built = parsed.length ? buildCompactTimeline(parsed) : null;
		} catch (e) {
			if (seq !== loadSeq) return;
			error = e instanceof Error ? e.message : String(e);
			events = [];
			eventById = {};
			built = null;
		} finally {
			if (seq === loadSeq) loading = false;
		}
	}

	$effect(() => {
		const selected = selectedFiles;
		untrack(() => {
			void loadAndParse(false, selected);
		});
	});

	// ── Timeline item click → select + scroll table ──────────────────────
	function onItemClick(item: unknown) {
		const id = (item as any)?.id as string | undefined;
		const ev = id && eventById[id] ? eventById[id] : null;
		selectedEvent = selectedEvent?.id === ev?.id ? null : ev;
		if (selectedEvent) {
			const row = rowRefs.get(selectedEvent.id);
			if (row) {
				row.scrollIntoView({ behavior: 'smooth', block: 'center' });
				flashId = selectedEvent.id;
				setTimeout(() => {
					flashId = null;
				}, 400);
			}
		}
	}

	// ── Table row click → select ─────────────────────────────────────────
	function selectFromTable(ev: TimelineEvent) {
		selectedEvent = selectedEvent?.id === ev.id ? null : ev;
	}

	function handleHover(ev: TimelineEvent | null) {
		// no-op for table hover (vis-timeline handles its own hover)
	}

	function fmtBytes(bytes: number): string {
		if (!Number.isFinite(bytes)) return '';
		const kb = 1024;
		const mb = kb * 1024;
		if (bytes >= mb) return `${(bytes / mb).toFixed(1)} MiB`;
		if (bytes >= kb) return `${Math.round(bytes / kb)} KiB`;
		return `${bytes} B`;
	}

	function toggleFile(filename: string) {
		if (selectedFiles.includes(filename)) {
			selectedFiles = selectedFiles.filter((f) => f !== filename);
		} else {
			selectedFiles = [...selectedFiles, filename];
		}
		selectedEvent = null;
	}

	async function copyDetail() {
		if (selectedEvent?.detail) {
			try {
				await navigator.clipboard.writeText(selectedEvent.detail);
			} catch {
				// ignore
			}
		}
	}
</script>

<main class="p-4">
	<!-- Header -->
	<div class="mb-3 flex items-center justify-between gap-2 flex-wrap">
		<div class="flex items-center gap-2 flex-wrap">
			<a
				class="text-[12px] underline underline-offset-2 text-muted-foreground"
				href="/lab/timeline">Fixtures</a
			>
			<div class="text-[12px] text-muted-foreground">/</div>
			<a
				class="text-[12px] underline underline-offset-2 text-muted-foreground"
				href="/lab/timeline/{data.reportId}">Timeline</a
			>
			<div class="text-[12px] text-muted-foreground">/</div>
			<div class="text-[14px] font-bold">Compact</div>
			<div class="text-[12px] text-muted-foreground">Report {data.reportId}</div>
		</div>

		<button
			type="button"
			class="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background text-[12px] hover:bg-muted/20"
			onclick={() => loadAndParse(true)}
			title="Reload selected logs"
		>
			<RefreshCw class="h-4 w-4" />
			Reload
		</button>
	</div>

	{#if !data.fixtureOk}
		<div
			class="rounded-lg border border-border bg-background p-4 text-[12px] text-muted-foreground"
		>
			Fixture folder not found for <code class="font-mono">report-{data.reportId}</code>.
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-3">
			<!-- File selector + legend -->
			<div
				style="display: flex; gap: 6px; flex-wrap: wrap; align-items: center;"
			>
				{#each data.files.filter((f) => ['vm.log', 'parallels-system.log'].includes(f.filename)) as f (f.filename)}
					{@const active = selectedFiles.includes(f.filename)}
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<span
						onclick={() => toggleFile(f.filename)}
						style="display: inline-flex; align-items: center; padding: 2px 8px; height: 22px; border-radius: 4px; font-size: 10px; font-weight: 600; font-family: {FONTS.mono}; white-space: nowrap; cursor: pointer; background: {active
							? BADGE.blue.bg
							: BADGE.dim.bg}; color: {active
							? BADGE.blue.fg
							: BADGE.dim.fg}; border: 1px solid {active
							? BADGE.blue.bd
							: BADGE.dim.bd}; opacity: {active ? 1 : 0.5};"
					>
						{f.filename}
						<span style="font-size: 8px; margin-left: 4px; opacity: 0.6;">
							{fmtBytes(f.size)}
						</span>
					</span>
				{/each}

				<span style="width: 1px; height: 14px; background: {COLORS.b2};"></span>

				<span class="prv-ct-pill prv-ct-pill--apps">Apps</span>
				<span class="prv-ct-pill prv-ct-pill--gui">GUI</span>
				<span class="prv-ct-pill prv-ct-pill--config">Config</span>

				{#if loading}
					<span class="text-[11px] text-muted-foreground">Loading...</span>
				{/if}

				<div style="flex: 1;"></div>

				<span
					style="display: inline-flex; align-items: center; padding: 0 5px; height: 18px; border-radius: 3px; font-size: 9px; font-weight: 600; font-family: {FONTS.mono}; background: {BADGE.dim.bg}; color: {BADGE.dim.fg}; border: 1px solid {BADGE.dim.bd};"
				>
					{events.length} events
				</span>
			</div>

			<!-- Timeline -->
			<div class="rounded-xl border border-border bg-background p-3">
				{#if error}
					<div
						class="rounded-lg border border-border bg-background p-3 text-[12px] text-destructive"
					>
						{error}
					</div>
				{:else if selectedFiles.length === 0}
					<div
						class="rounded-lg border border-border bg-background p-3 text-[12px] text-muted-foreground"
					>
						Select at least one log file above.
					</div>
				{:else if !timelinePayload}
					<div
						class="rounded-lg border border-border bg-background p-3 text-[12px] text-muted-foreground"
					>
						{loading ? 'Loading...' : 'No events parsed from selected logs.'}
					</div>
				{:else}
					<Timeline payload={timelinePayload} {onItemClick} wheelMode="zoom" />
				{/if}
			</div>

			<!-- Detail panel -->
			{#if selectedEvent}
				<DetailPanel
					event={selectedEvent}
					onClose={() => {
						selectedEvent = null;
					}}
				/>
			{/if}

			<!-- Joined log table -->
			{#if events.length > 0}
				<div class="rounded-xl border border-border bg-background overflow-hidden" style="max-height: 360px;">
					<TimelineTable
						events={tableEvents}
						filter={tableFilter}
						{selectedId}
						hoveredId={null}
						{flashId}
						onSelect={selectFromTable}
						onHover={handleHover}
						onFilterChange={(val) => {
							tableFilter = val;
						}}
						{rowRefs}
					/>
				</div>
			{/if}
		</div>
	{/if}
</main>

<style>
	/* ── Compact vis-timeline item styling ────────────────────────────────── */

	:global(.vis-item.prv-ct-item) {
		border-radius: 4px;
		border-width: 1px;
		font-size: 11px;
		font-weight: 500;
		line-height: 1.3;
		min-width: 10px;
	}

	:global(.vis-item.vis-point.prv-ct-item) {
		min-width: 12px;
	}

	:global(.vis-item.prv-ct-item .vis-item-content) {
		padding: 1px 6px;
		display: flex;
		align-items: center;
		gap: 3px;
	}

	/* Category colors */
	:global(.vis-item.prv-ct-item--apps) {
		background: rgba(16, 185, 129, 0.12);
		border-color: rgba(16, 185, 129, 0.35);
		color: rgb(6, 95, 70);
	}

	:global(.vis-item.prv-ct-item--gui) {
		background: rgba(59, 130, 246, 0.12);
		border-color: rgba(59, 130, 246, 0.35);
		color: rgb(30, 64, 175);
	}

	:global(.vis-item.prv-ct-item--config) {
		background: rgba(217, 119, 6, 0.12);
		border-color: rgba(217, 119, 6, 0.35);
		color: rgb(120, 53, 15);
	}

	/* Severity overrides */
	:global(.vis-item.prv-ct-item--warn) {
		border-color: rgba(234, 179, 8, 0.5);
		background: rgba(234, 179, 8, 0.12);
		color: rgb(113, 63, 18);
	}

	:global(.vis-item.prv-ct-item--danger) {
		border-color: rgba(239, 68, 68, 0.5);
		background: rgba(239, 68, 68, 0.1);
		color: rgb(127, 29, 29);
	}

	/* Selected item */
	:global(.vis-item.prv-ct-item.vis-selected) {
		box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.4);
	}

	/* Severity dots inside items */
	:global(.prv-ct-sev) {
		display: inline-block;
		width: 6px;
		height: 6px;
		border-radius: 50%;
		flex-shrink: 0;
	}
	:global(.prv-ct-sev--warn) {
		background: #f59e0b;
	}
	:global(.prv-ct-sev--danger) {
		background: #ef4444;
	}

	:global(.prv-ct-label) {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* Category parent group labels */
	:global(.prv-ct-cat-label) {
		font-weight: 700;
		font-size: 12px;
	}
	:global(.prv-ct-cat-label--apps) {
		color: rgb(6, 95, 70);
	}
	:global(.prv-ct-cat-label--gui) {
		color: rgb(30, 64, 175);
	}
	:global(.prv-ct-cat-label--config) {
		color: rgb(120, 53, 15);
	}
	:global(.prv-ct-cat-count) {
		font-size: 9px;
		font-weight: 500;
		color: #94a3b8;
		margin-left: 2px;
	}

	/* Group styling — subsystem parent (level 1) */
	:global(.vis-label.prv-ct-group--sub-parent) {
		font-weight: 700;
	}
	:global(.prv-ct-sub-label) {
		font-weight: 700;
		font-size: 12px;
		color: #1e293b;
	}

	/* Group styling — category (level 2) */
	:global(.vis-label.prv-ct-group--cat) {
		font-size: 11px;
	}

	/* Make the container more compact */
	:global(.prv-timeline-container) {
		min-height: 200px !important;
		border-radius: 8px !important;
	}

	/* Pill badges */
	.prv-ct-pill {
		display: inline-flex;
		align-items: center;
		padding: 2px 8px;
		border-radius: 999px;
		border: 1px solid hsl(var(--border));
		font-size: 10px;
		line-height: 1.4;
		color: hsl(var(--muted-foreground));
		background: hsl(var(--background));
	}

	.prv-ct-pill--apps {
		border-color: rgba(16, 185, 129, 0.35);
		color: rgba(6, 95, 70, 0.95);
	}
	.prv-ct-pill--gui {
		border-color: rgba(59, 130, 246, 0.35);
		color: rgba(30, 64, 175, 0.95);
	}
	.prv-ct-pill--config {
		border-color: rgba(217, 119, 6, 0.35);
		color: rgba(120, 53, 15, 0.95);
	}
</style>
