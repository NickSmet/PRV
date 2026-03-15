import type { TimelineEvent } from '$lib/lab/timeline/types';

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
};

export type BuiltCompactTimeline = {
	groups: VisGroup[];
	items: VisItem[];
	options: TimelineOptions;
	initialWindow?: { start: Date; end: Date };
};

const FILE_TO_SUBSYSTEM: Record<string, string> = {
	'parallels-system.log': 'system',
	'vm.log': 'vm',
	'tools.log': 'vm'
};

const SUBSYSTEM_ORDER: Record<string, number> = { vm: 0, system: 1 };
const SUBSYSTEM_LABEL: Record<string, string> = { vm: 'VM', system: 'System' };

const CATEGORY_ORDER: Record<string, number> = {
	apps: 0,
	gui: 1,
	config: 2
};

function subsystemForFile(file: string): string {
	return FILE_TO_SUBSYSTEM[file] ?? 'system';
}

function subsystemOrder(subsystem: string): number {
	return SUBSYSTEM_ORDER[subsystem] ?? 99;
}

function categoryKey(category: string): string {
	const normalized = category.trim().toLowerCase();
	if (normalized.includes('app')) return 'apps';
	if (normalized.includes('gui')) return 'gui';
	if (normalized.includes('config')) return 'config';
	return normalized.replace(/\s+/g, '-');
}

function categoryOrder(category: string): number {
	return CATEGORY_ORDER[categoryKey(category)] ?? 99;
}

function severityDot(severity: string): string {
	if (severity === 'danger') return '<span class="prv-ct-sev prv-ct-sev--danger"></span>';
	if (severity === 'warn') return '<span class="prv-ct-sev prv-ct-sev--warn"></span>';
	return '';
}

export function buildCompactTimeline(events: TimelineEvent[]): BuiltCompactTimeline {
	const POINT_AS_RANGE_MS = 1000;
	const groups: VisGroup[] = [];
	const items: VisItem[] = [];
	const bySubsystem = new Map<string, TimelineEvent[]>();

	for (const event of events) {
		const subsystem = subsystemForFile(event.sourceFile);
		const bucket = bySubsystem.get(subsystem) ?? [];
		bucket.push(event);
		bySubsystem.set(subsystem, bucket);
	}

	const subsystems = Array.from(bySubsystem.keys()).sort(
		(left, right) => subsystemOrder(left) - subsystemOrder(right)
	);

	for (let subsystemIndex = 0; subsystemIndex < subsystems.length; subsystemIndex += 1) {
		const subsystem = subsystems[subsystemIndex]!;
		const subsystemEvents = bySubsystem.get(subsystem) ?? [];
		const byCategory = new Map<string, TimelineEvent[]>();

		for (const event of subsystemEvents) {
			const bucket = byCategory.get(event.category) ?? [];
			bucket.push(event);
			byCategory.set(event.category, bucket);
		}

		const categoryIds: string[] = [];
		const categories = Array.from(byCategory.keys()).sort(
			(left, right) => categoryOrder(left) - categoryOrder(right)
		);

		for (let categoryIndex = 0; categoryIndex < categories.length; categoryIndex += 1) {
			const category = categories[categoryIndex]!;
			const categoryEvents = byCategory.get(category) ?? [];
			const categoryId = `cat:${subsystem}:${categoryKey(category)}`;
			categoryIds.push(categoryId);

			groups.push({
				id: categoryId,
				content: `<span class="prv-ct-cat-label prv-ct-cat-label--${categoryKey(category)}">${category}</span> <span class="prv-ct-cat-count">${categoryEvents.length}</span>`,
				className: `prv-ct-group prv-ct-group--cat prv-ct-group--${categoryKey(category)}`,
				treeLevel: 2,
				order: subsystemIndex * 1000 + categoryIndex + 1
			});

			for (const event of categoryEvents) {
				const startMs = event.start.getTime();
				const rawEnd = event.end ?? null;
				const endMs = rawEnd ? rawEnd.getTime() : startMs;
				const end =
					rawEnd && endMs > startMs ? rawEnd : new Date(startMs + POINT_AS_RANGE_MS);
				items.push({
					id: event.id,
					group: categoryId,
					start: event.start,
					// For events without an end (or with a zero-length end), render as a tiny range
					// to avoid the tall "instant" bar/marker and keep the UI consistent.
					end,
					content: `${severityDot(event.severity)}<span class="prv-ct-label">${event.label}</span>`,
					className: `prv-ct-item ${event.id.startsWith('cluster:') ? 'prv-ct-item--cluster ' : ''}prv-ct-item--${event.severity} prv-ct-item--${categoryKey(event.category)}`,
					title: `${event.label}\n${event.sourceFile} · ${event.category}`
				});
			}
		}

		groups.push({
			id: `sub:${subsystem}`,
			content: `<span class="prv-ct-sub-label">${SUBSYSTEM_LABEL[subsystem] ?? subsystem}</span> <span class="prv-ct-cat-count">${subsystemEvents.length}</span>`,
			nestedGroups: categoryIds,
			showNested: true,
			className: 'prv-ct-group prv-ct-group--sub-parent',
			treeLevel: 1,
			order: subsystemIndex * 1000
		});
	}

	let min = Number.POSITIVE_INFINITY;
	let max = Number.NEGATIVE_INFINITY;
	for (const event of events) {
		const start = event.start.getTime();
		const end = (event.end ?? event.start).getTime();
		if (start < min) min = start;
		if (end > max) max = end;
	}

	const padMs = 2 * 60 * 1000;
	const initialWindow =
		Number.isFinite(min) && Number.isFinite(max) && max > min
			? { start: new Date(min - padMs), end: new Date(max + padMs) }
			: undefined;

	// Important: `zoomMax` must not shrink when we swap datasets (e.g. clustering).
	// If it shrinks to the clustered window span, users can get "stuck" and be unable to zoom out.
	const DEFAULT_ZOOM_MAX_MS = 400 * 24 * 60 * 60 * 1000; // ~13 months
	const dataSpanMs = initialWindow ? initialWindow.end.getTime() - initialWindow.start.getTime() : 0;
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
		initialWindow
	};
}
