import type { TimelineSeverity } from '$lib/lab/timeline/types';

// ── Subsystem definitions ──────────────────────────────────────────────────

export type Subsystem = {
	id: string;
	label: string;
	color: string;
};

export const SUBSYSTEMS: Subsystem[] = [
	{ id: 'system', label: 'System', color: '#8B5CF6' },
	{ id: 'vm', label: 'VM', color: '#059669' }
];

const FILE_TO_SUBSYSTEM: Record<string, string> = {
	'parallels-system.log': 'system',
	'vm.log': 'vm'
};

export function subsystemForFile(file: string): string {
	return FILE_TO_SUBSYSTEM[file] ?? 'system';
}

export function subsystemColor(file: string): string {
	const id = subsystemForFile(file);
	return SUBSYSTEMS.find((s) => s.id === id)?.color ?? '#64748B';
}

// ── Category colors ────────────────────────────────────────────────────────

export type CategoryColors = { bg: string; fg: string; bd: string };

export const CATEGORY_COLORS: Record<string, CategoryColors> = {
	'GUI Messages': { bg: '#EFF6FF', fg: '#2563EB', bd: '#BFDBFE' },
	'Config Diffs': { bg: '#FEF3C7', fg: '#D97706', bd: '#FDE68A' },
	Apps: { bg: '#ECFDF5', fg: '#059669', bd: '#A7F3D0' }
};

const DEFAULT_CATEGORY: CategoryColors = { bg: '#F1F5F9', fg: '#475569', bd: '#E2E8F0' };

export function categoryColors(category: string): CategoryColors {
	return CATEGORY_COLORS[category] ?? DEFAULT_CATEGORY;
}

export const CATEGORY_BADGE_VARIANT: Record<string, string> = {
	'GUI Messages': 'blue',
	'Config Diffs': 'amber',
	Apps: 'green'
};

// ── Severity colors ────────────────────────────────────────────────────────

export const SEVERITY_COLORS: Record<TimelineSeverity, string> = {
	info: '#10B981',
	warn: '#F59E0B',
	danger: '#EF4444'
};

// ── Badge palette (for table/detail badges) ────────────────────────────────

export type BadgeColors = { bg: string; fg: string; bd: string };

export const BADGE: Record<string, BadgeColors> = {
	default: { bg: '#F1F5F9', fg: '#475569', bd: '#E2E8F0' },
	green: { bg: '#ECFDF5', fg: '#059669', bd: '#A7F3D0' },
	blue: { bg: '#EFF6FF', fg: '#2563EB', bd: '#BFDBFE' },
	purple: { bg: '#F3E8FF', fg: '#7C3AED', bd: '#DDD6FE' },
	amber: { bg: '#FEF3C7', fg: '#D97706', bd: '#FDE68A' },
	red: { bg: '#FEE2E2', fg: '#DC2626', bd: '#FECACA' },
	dim: { bg: '#F8FAFC', fg: '#94A3B8', bd: '#E2E8F0' }
};

// ── Fonts ──────────────────────────────────────────────────────────────────

export const FONTS = {
	sans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
	mono: "'SF Mono', Consolas, monospace"
};

// ── Colors ─────────────────────────────────────────────────────────────────

export const COLORS = {
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
	selBorder: '#3B82F6',
	corBg: '#F8FAFF',
	flash: '#DBEAFE',
	laneEven: '#FAFBFD',
	laneOdd: '#FFFFFF'
};

// ── SVG layout constants ───────────────────────────────────────────────────

export const LAYOUT = {
	GUTTER: 120,
	LANE_HEIGHT: 52,
	LANE_PAD: 6,
	BAR_HEIGHT: 16,
	BAR_GAP: 2,
	TOP_AXIS: 28,
	RIGHT_PAD: 12,
	MIN_BAR_W: 6,
	LABEL_MIN_W: 50
} as const;
