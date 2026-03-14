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

// ── Subsystem mapping ──────────────────────────────────────────────────────

const FILE_TO_SUBSYSTEM: Record<string, string> = {
	'parallels-system.log': 'system',
	'vm.log': 'vm'
};

function subsystemForFile(file: string): string {
	return FILE_TO_SUBSYSTEM[file] ?? 'system';
}

// ── Category ───────────────────────────────────────────────────────────────

function categoryKey(category: string): string {
	const c = category.trim().toLowerCase();
	if (c.includes('app')) return 'apps';
	if (c.includes('gui')) return 'gui';
	if (c.includes('config')) return 'config';
	return c.replace(/\s+/g, '-');
}

// Preferred display order for categories within a subsystem
const CATEGORY_ORDER: Record<string, number> = {
	apps: 0,
	gui: 1,
	config: 2
};

function catOrder(cat: string): number {
	return CATEGORY_ORDER[categoryKey(cat)] ?? 99;
}

// ── Subsystem display ─────────────────────────────────────────────────────

const SUBSYSTEM_ORDER: Record<string, number> = { vm: 0, system: 1 };
const SUBSYSTEM_LABEL: Record<string, string> = { vm: 'VM', system: 'System' };

function subOrder(sub: string): number {
	return SUBSYSTEM_ORDER[sub] ?? 99;
}

// ── Severity indicator ─────────────────────────────────────────────────────

function severityDot(severity: string): string {
	if (severity === 'danger') return '<span class="prv-ct-sev prv-ct-sev--danger"></span>';
	if (severity === 'warn') return '<span class="prv-ct-sev prv-ct-sev--warn"></span>';
	return '';
}

// ── Build ──────────────────────────────────────────────────────────────────

export function buildCompactTimeline(events: TimelineEvent[]): BuiltCompactTimeline {
	const groups: VisGroup[] = [];
	const items: VisItem[] = [];

	// ── Level 1: group by subsystem ──────────────────────────────────
	const bySub = new Map<string, TimelineEvent[]>();
	for (const ev of events) {
		const sub = subsystemForFile(ev.sourceFile);
		if (!bySub.has(sub)) bySub.set(sub, []);
		bySub.get(sub)!.push(ev);
	}

	const subsystems = Array.from(bySub.keys()).sort((a, b) => subOrder(a) - subOrder(b));

	for (let si = 0; si < subsystems.length; si++) {
		const sub = subsystems[si];
		const subEvents = bySub.get(sub) ?? [];

		// ── Level 2: group by category within subsystem ──────────────
		const byCat = new Map<string, TimelineEvent[]>();
		for (const ev of subEvents) {
			if (!byCat.has(ev.category)) byCat.set(ev.category, []);
			byCat.get(ev.category)!.push(ev);
		}

		const categories = Array.from(byCat.keys()).sort((a, b) => catOrder(a) - catOrder(b));
		const catGroupIds: string[] = [];

		for (let ci = 0; ci < categories.length; ci++) {
			const cat = categories[ci];
			const catK = categoryKey(cat);
			const catEvents = byCat.get(cat) ?? [];
			const catGroupId = `cat:${sub}:${catK}`;
			catGroupIds.push(catGroupId);

			// Category group (level 2 leaf — holds items)
			const count = catEvents.length;
			groups.push({
				id: catGroupId,
				content: `<span class="prv-ct-cat-label prv-ct-cat-label--${catK}">${cat}</span> <span class="prv-ct-cat-count">${count}</span>`,
				className: `prv-ct-group prv-ct-group--cat prv-ct-group--${catK}`,
				treeLevel: 2,
				order: si * 1000 + ci + 1
			});

			// Items for this category
			for (const ev of catEvents) {
				const sev = severityDot(ev.severity);
				const label = ev.label;
				const content = `${sev}<span class="prv-ct-label">${label}</span>`;

				items.push({
					id: ev.id,
					group: catGroupId,
					start: ev.start,
					end: ev.end,
					content,
					className: `prv-ct-item prv-ct-item--${ev.severity} prv-ct-item--${catK}`,
					title: `${label}\n${ev.sourceFile} · ${ev.category}`
				});
			}
		}

		// Subsystem parent group (level 1 — collapsible)
		const subLabel = SUBSYSTEM_LABEL[sub] ?? sub;
		const subCount = subEvents.length;
		groups.push({
			id: `sub:${sub}`,
			content: `<span class="prv-ct-sub-label">${subLabel}</span> <span class="prv-ct-cat-count">${subCount}</span>`,
			nestedGroups: catGroupIds,
			showNested: true,
			className: `prv-ct-group prv-ct-group--sub-parent`,
			treeLevel: 1,
			order: si * 1000
		});
	}

	// Initial window
	let min = Number.POSITIVE_INFINITY;
	let max = Number.NEGATIVE_INFINITY;
	for (const ev of events) {
		const s = ev.start.getTime();
		const e = (ev.end ?? ev.start).getTime();
		if (s < min) min = s;
		if (e > max) max = e;
	}

	const padMs = 2 * 60 * 1000;
	const initialWindow =
		Number.isFinite(min) && Number.isFinite(max) && max > min
			? { start: new Date(min - padMs), end: new Date(max + padMs) }
			: undefined;

	const options: TimelineOptions = {
		stack: true,
		zoomKey: 'ctrlKey',
		orientation: 'top',
		groupOrder: 'order',
		tooltip: { followMouse: true, overflowMethod: 'flip' },
		margin: { item: { horizontal: 2, vertical: 3 } },
		showCurrentTime: false,
		verticalScroll: true,
		// Let the parent container control the height (resizable panes / full-height layouts).
		height: '100%'
	};

	return { groups, items, options, initialWindow };
}
