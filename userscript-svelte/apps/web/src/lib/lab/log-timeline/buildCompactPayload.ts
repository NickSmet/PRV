import type { TimelineEvent } from '$lib/lab/timeline/types';

import { isAppTimelineCategory } from './appCategories';
import {
	computeMaxClusterDurationMs,
	computeReadableDurationMs,
	isPointLikeEvent
} from './displaySemantics';

type TimelineOptions = Record<string, unknown>;

type VisGroup = Record<string, unknown> & {
	id: string;
	content: string;
	nestedGroups?: string[];
	showNested?: boolean;
	className?: string;
	order?: number;
	treeLevel?: number;
};

type VisItem = Record<string, unknown> & {
	id: string;
	group: string;
	start: Date;
	end?: Date;
	content: string;
	className?: string;
	title?: string;
	type?: 'point' | 'range';
};

type VisCustomTime = {
	id: string;
	time: Date;
	title?: string;
	marker?: string;
};

export type BuiltCompactTimeline = {
	groups: VisGroup[];
	items: VisItem[];
	options: TimelineOptions;
	initialWindow?: { start: Date; end: Date };
	customTimes?: VisCustomTime[];
};

export type BuildCompactTimelineOptions = {
	visibleSpanMs?: number;
	categoryTotals?: Record<string, number>;
	ensureCategories?: string[];
	extentEvents?: TimelineEvent[];
};

export const DEFAULT_INITIAL_VISIBLE_SPAN_MS = 5 * 60 * 60 * 1000;
export const DEFAULT_INITIAL_TRAIL_PAD_MS = 60 * 60 * 1000;
const FILE_TO_SUBSYSTEM: Record<string, string> = {
	'parallels-system.log': 'system',
	'vm.log': 'vm',
	'tools.log': 'vm'
};

const SUBSYSTEM_ORDER: Record<string, number> = { vm: 0, system: 1 };
const SUBSYSTEM_LABEL: Record<string, string> = { vm: 'VM', system: 'System' };

const CATEGORY_ORDER: Record<string, number> = {
	'Apps: System': 0,
	'Apps: Microsoft': 1,
	'Apps: Third-party': 2,
	'Tools Install': 3,
	'Tools Issues': 4,
	'GUI Messages': 10,
	'Config Diffs': 11
};

function subsystemForFile(file: string): string {
	return FILE_TO_SUBSYSTEM[file] ?? 'system';
}

function subsystemOrder(subsystem: string): number {
	return SUBSYSTEM_ORDER[subsystem] ?? 99;
}

function categorySlug(category: string): string {
	switch (category) {
		case 'Apps: System':
			return 'apps-system';
		case 'Apps: Microsoft':
			return 'apps-microsoft';
		case 'Apps: Third-party':
			return 'apps-third-party';
		default:
			return category.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
	}
}

function categoryStyleKey(category: string): string {
	const normalized = category.trim().toLowerCase();
	if (normalized.includes('app')) return 'apps';
	if (normalized.includes('tool')) return 'tools';
	if (normalized.includes('gui')) return 'gui';
	if (normalized.includes('config')) return 'config';
	return normalized.replace(/\s+/g, '-');
}

function categoryOrder(category: string): number {
	return CATEGORY_ORDER[category] ?? 99;
}

function subsystemForCategory(category: string): string | null {
	if (isAppTimelineCategory(category)) return 'vm';
	return null;
}

function severityDot(severity: string): string {
	if (severity === 'danger') return '<span class="prv-ct-sev prv-ct-sev--danger"></span>';
	if (severity === 'warn') return '<span class="prv-ct-sev prv-ct-sev--warn"></span>';
	return '';
}

export function deriveInitialWindowFromExtent(
	dataMin: number,
	dataMax: number
): { start: Date; end: Date } | undefined {
	if (!Number.isFinite(dataMin) || !Number.isFinite(dataMax)) return undefined;
	const endMs = dataMax + DEFAULT_INITIAL_TRAIL_PAD_MS;
	return {
		start: new Date(endMs - DEFAULT_INITIAL_VISIBLE_SPAN_MS),
		end: new Date(endMs)
	};
}

// ---------------------------------------------------------------------------
// Tooltip HTML
// ---------------------------------------------------------------------------

const SEV_COLOR: Record<string, string> = {
	danger: '#ef4444',
	warn: '#f59e0b',
	info: '#94a3b8'
};

function escapeHtml(s: string): string {
	return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatTimestamp(d: Date): string {
	const p = (n: number) => String(n).padStart(2, '0');
	return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

function formatDuration(ms: number): string {
	if (ms < 1000) return `${ms}ms`;
	const s = Math.floor(ms / 1000);
	if (s < 60) return `${s}s`;
	const m = Math.floor(s / 60);
	const rs = s % 60;
	if (m < 60) return rs > 0 ? `${m}m ${rs}s` : `${m}m`;
	const h = Math.floor(m / 60);
	const rm = m % 60;
	return rm > 0 ? `${h}h ${rm}m` : `${h}h`;
}

function buildTooltipHtml(event: TimelineEvent): string {
	const isCluster = event.id.startsWith('cluster:');
	const sevColor = SEV_COLOR[event.severity] ?? '#94a3b8';
	const startMs = event.start.getTime();
	const endMs = event.end ? event.end.getTime() : 0;
	const durationMs = endMs > startMs ? endMs - startMs : 0;

	const dot = `<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${sevColor};flex-shrink:0;margin-top:3px;"></span>`;

	const header = `<div style="display:flex;align-items:flex-start;gap:6px;margin-bottom:5px;">${dot}<span style="font-weight:600;font-size:12px;line-height:1.4;word-break:break-word;">${escapeHtml(event.label)}</span></div>`;

	let timeRow: string;
	if (isCluster && event.end) {
		timeRow = `<div style="font-size:11px;color:#64748b;margin-bottom:3px;">${escapeHtml(formatTimestamp(event.start))} &ndash; ${escapeHtml(formatTimestamp(event.end))}</div>`;
	} else {
		const dur = durationMs > 0 ? ` &nbsp;&middot;&nbsp; ${formatDuration(durationMs)}` : '';
		timeRow = `<div style="font-size:11px;color:#64748b;margin-bottom:3px;">${escapeHtml(formatTimestamp(event.start))}${dur}</div>`;
	}

	const meta = `<div style="font-size:11px;color:#94a3b8;">${escapeHtml(event.sourceFile)} &nbsp;&middot;&nbsp; ${escapeHtml(event.category)}</div>`;

	let detail = '';
	if (event.detail && isCluster) {
		const lines = event.detail.split('\n');
		const shown = lines.slice(0, 8);
		const extra = lines.length - shown.length;
		const items = shown.map((l) => `<li>${escapeHtml(l)}</li>`).join('');
		const more = extra > 0 ? `<li style="color:#94a3b8;list-style:none;padding-left:0;">+${extra} more</li>` : '';
		detail = `<ul style="margin:6px 0 0;padding:0 0 0 14px;font-size:11px;color:#475569;line-height:1.7;">${items}${more}</ul>`;
	} else if (event.detail && !isCluster) {
		detail = `<div style="margin-top:5px;font-size:11px;color:#475569;white-space:pre-wrap;word-break:break-word;">${escapeHtml(event.detail)}</div>`;
	}

	return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:340px;padding:8px 10px;line-height:1.5;color:#1e293b;">${header}${timeRow}${meta}${detail}</div>`;
}

/**
 * @param options.visibleSpanMs  Current visible window span in ms. Used to compute a
 *   minimum item duration so that short/point events remain readable and
 *   vis-timeline's stacking algorithm accounts for their visual width.
 *   If omitted, falls back to the data extent span.
 */
export function buildCompactTimeline(
	events: TimelineEvent[],
	options: BuildCompactTimelineOptions = {}
): BuiltCompactTimeline {
	const groups: VisGroup[] = [];
	const items: VisItem[] = [];
	const bySubsystem = new Map<string, TimelineEvent[]>();
	const categoryTotals = options.categoryTotals ?? {};

	for (const event of events) {
		const subsystem = subsystemForFile(event.sourceFile);
		const bucket = bySubsystem.get(subsystem) ?? [];
		bucket.push(event);
		bySubsystem.set(subsystem, bucket);
	}

	for (const category of options.ensureCategories ?? []) {
		const subsystem = subsystemForCategory(category);
		if (!subsystem || bySubsystem.has(subsystem)) continue;
		bySubsystem.set(subsystem, []);
	}

	const subsystems = Array.from(bySubsystem.keys()).sort(
		(left, right) => subsystemOrder(left) - subsystemOrder(right)
	);

	// Compute data extent for fallback span and initial window.
	const extentEvents = options.extentEvents ?? events;
	let dataMin = Number.POSITIVE_INFINITY;
	let dataMax = Number.NEGATIVE_INFINITY;
	for (const event of extentEvents) {
		const start = event.start.getTime();
		const end = (event.end ?? event.start).getTime();
		if (start < dataMin) dataMin = start;
		if (end > dataMax) dataMax = end;
	}
	const dataSpanMs = Number.isFinite(dataMin) && Number.isFinite(dataMax) ? Math.max(0, dataMax - dataMin) : 0;
	const effectiveSpanMs = options.visibleSpanMs ?? dataSpanMs;
	const readableDurationMs = effectiveSpanMs > 0 ? computeReadableDurationMs(effectiveSpanMs) : POINT_EVENT_THRESHOLD_MS + 1;
	const maxClusterDurationMs = effectiveSpanMs > 0 ? computeMaxClusterDurationMs(effectiveSpanMs) : 5000;
	const reportCutoffMs = Number.isFinite(dataMax) ? dataMax : null;

	for (let subsystemIndex = 0; subsystemIndex < subsystems.length; subsystemIndex += 1) {
		const subsystem = subsystems[subsystemIndex]!;
		const subsystemEvents = bySubsystem.get(subsystem) ?? [];
		const byCategory = new Map<string, TimelineEvent[]>();

		for (const event of subsystemEvents) {
			const bucket = byCategory.get(event.category) ?? [];
			bucket.push(event);
			byCategory.set(event.category, bucket);
		}

		for (const category of options.ensureCategories ?? []) {
			if (subsystemForCategory(category) !== subsystem || byCategory.has(category)) continue;
			byCategory.set(category, []);
		}

		const categoryIds: string[] = [];
		const categories = Array.from(byCategory.keys()).sort(
			(left, right) => categoryOrder(left) - categoryOrder(right)
		);
		let subsystemTotal = 0;

		for (let categoryIndex = 0; categoryIndex < categories.length; categoryIndex += 1) {
			const category = categories[categoryIndex]!;
			const categoryEvents = byCategory.get(category) ?? [];
			const categoryId = `cat:${subsystem}:${categorySlug(category)}`;
			const categoryTotal = categoryTotals[category] ?? categoryEvents.length;
			categoryIds.push(categoryId);
			subsystemTotal += categoryTotal;

			groups.push({
				id: categoryId,
				content: `<span class="prv-ct-cat-label prv-ct-cat-label--${categoryStyleKey(category)}">${category}</span> <span class="prv-ct-cat-count">${categoryTotal}</span>`,
				className: `prv-ct-group prv-ct-group--cat prv-ct-group--${categoryStyleKey(category)}`,
				treeLevel: 2,
				order: subsystemIndex * 1000 + categoryIndex + 1
			});

			for (const event of categoryEvents) {
				const startMs = event.start.getTime();
				const rawEnd = event.end ?? null;
				const rawEndMs = rawEnd ? rawEnd.getTime() : startMs;
				const naturalDuration = rawEnd && rawEndMs > startMs ? rawEndMs - startMs : 0;
				const isCluster = event.id.startsWith('cluster:');
				const isPointLike = isPointLikeEvent(event);
				const needsReadableRange = !isCluster && !isPointLike && naturalDuration < readableDurationMs;

				let type: 'point' | 'range' = 'range';
				let end: Date | undefined = rawEnd && naturalDuration > 0 ? rawEnd : undefined;
				let displayModeClass = 'prv-ct-item--range';

				if (isCluster) {
					const effectiveDuration = Math.min(
						Math.max(naturalDuration, readableDurationMs),
						maxClusterDurationMs
					);
					const unclampedEndMs = startMs + effectiveDuration;
					const endMs =
						reportCutoffMs != null && unclampedEndMs > reportCutoffMs
							? Math.max(startMs, reportCutoffMs)
							: unclampedEndMs;
					end = endMs > startMs ? new Date(endMs) : undefined;
					displayModeClass = 'prv-ct-item--cluster prv-ct-item--readability';
				} else if (isPointLike) {
					type = 'point';
					end = undefined;
					displayModeClass = 'prv-ct-item--point';
				} else if (needsReadableRange) {
					const unclampedEndMs = startMs + readableDurationMs;
					const endMs =
						reportCutoffMs != null && unclampedEndMs > reportCutoffMs
							? Math.max(startMs, reportCutoffMs)
							: unclampedEndMs;
					end = endMs > startMs ? new Date(endMs) : undefined;
					displayModeClass = 'prv-ct-item--readability';
				}

				items.push({
					id: event.id,
					group: categoryId,
					start: event.start,
					end,
					type,
					content: `${type === 'point' ? '' : severityDot(event.severity)}<span class="prv-ct-label">${event.label}</span>`,
					className: `prv-ct-item ${displayModeClass} prv-ct-item--${event.severity} prv-ct-item--${categoryStyleKey(event.category)}`,
					title: buildTooltipHtml(event)
				});
			}
		}

		groups.push({
			id: `sub:${subsystem}`,
			content: `<span class="prv-ct-sub-label">${SUBSYSTEM_LABEL[subsystem] ?? subsystem}</span> <span class="prv-ct-cat-count">${subsystemTotal}</span>`,
			nestedGroups: categoryIds,
			showNested: true,
			className: 'prv-ct-group prv-ct-group--sub-parent',
			treeLevel: 1,
			order: subsystemIndex * 1000
		});
	}

	const initialWindow = deriveInitialWindowFromExtent(dataMin, dataMax);
	const customTimes =
		Number.isFinite(dataMax)
			? [
					{
						id: 'report-cutoff',
						time: new Date(dataMax),
						title: 'Last report timestamp',
						marker: 'Report end'
					}
				]
			: undefined;

	// Important: `zoomMax` must not shrink when we swap datasets (e.g. clustering).
	// If it shrinks to the clustered window span, users can get "stuck" and be unable to zoom out.
	const DEFAULT_ZOOM_MAX_MS = 400 * 24 * 60 * 60 * 1000; // ~13 months
	const zoomMax = Math.max(DEFAULT_ZOOM_MAX_MS, Number.isFinite(dataSpanMs) ? dataSpanMs : 0);

	return {
		groups,
		items,
		options: {
			stack: true,
			zoomKey: 'ctrlKey',
			orientation: 'top',
			groupOrder: 'order',
			tooltip: { followMouse: true, overflowMethod: 'flip' },
			margin: { item: { horizontal: 2, vertical: 3 } },
			showCurrentTime: false,
			verticalScroll: true,
			zoomMin: 5000,
			zoomMax,
			// Let the parent container control the height (resizable panes).
			height: '100%'
		},
		initialWindow,
		customTimes
	};
}
