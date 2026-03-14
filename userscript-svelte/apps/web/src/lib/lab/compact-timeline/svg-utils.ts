import type { TimelineEvent } from '$lib/lab/timeline/types';
import { LAYOUT } from './types';

/** Convert a timestamp (ms) to an SVG X coordinate. */
export function timeToX(ms: number, viewStart: number, viewEnd: number, width: number): number {
	const dataW = width - LAYOUT.GUTTER - LAYOUT.RIGHT_PAD;
	return LAYOUT.GUTTER + ((ms - viewStart) / (viewEnd - viewStart)) * dataW;
}

/** Convert an SVG X coordinate back to a timestamp (ms). */
export function xToTime(x: number, viewStart: number, viewEnd: number, width: number): number {
	const dataW = width - LAYOUT.GUTTER - LAYOUT.RIGHT_PAD;
	return viewStart + ((x - LAYOUT.GUTTER) / dataW) * (viewEnd - viewStart);
}

/** Generate adaptive time axis ticks. */
export function generateTicks(viewStart: number, viewEnd: number): number[] {
	const range = viewEnd - viewStart;
	const step =
		range < 120_000
			? 10_000
			: range < 600_000
				? 60_000
				: range < 3_600_000
					? 300_000
					: range < 14_400_000
						? 900_000
						: 3_600_000;

	const ticks: number[] = [];
	for (let t = Math.ceil(viewStart / step) * step; t <= viewEnd; t += step) {
		ticks.push(t);
	}
	return ticks;
}

/** Stacked event with row index for vertical positioning within a lane. */
export type StackedEvent = TimelineEvent & { _row: number };
export type StackResult = { events: StackedEvent[]; rowCount: number };

/** Assign vertical rows to events so overlapping bars stack. */
export function stackEvents(events: TimelineEvent[]): StackResult {
	const sorted = [...events].sort((a, b) => a.start.getTime() - b.start.getTime());
	const rowEnds: number[] = [];
	const stacked: StackedEvent[] = sorted.map((ev) => {
		const es = ev.start.getTime();
		const ee = ev.end ? ev.end.getTime() : es + 30_000;
		for (let r = 0; r < rowEnds.length; r++) {
			if (es >= rowEnds[r]) {
				rowEnds[r] = ee;
				return { ...ev, _row: r };
			}
		}
		rowEnds.push(ee);
		return { ...ev, _row: rowEnds.length - 1 };
	});
	return { events: stacked, rowCount: Math.max(rowEnds.length, 1) };
}

/** Format ms timestamp → HH:MM:SS */
export function formatTime(ms: number): string {
	return new Date(ms).toLocaleTimeString('en-US', {
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hour12: false
	});
}

/** Format Date → HH:MM:SS.mmm */
export function formatTimeMs(d: Date): string {
	const base = d.toLocaleTimeString('en-US', {
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hour12: false
	});
	return `${base}.${String(d.getMilliseconds()).padStart(3, '0')}`;
}

/** Format duration in ms → human string */
export function formatDuration(ms: number): string {
	if (ms < 1000) return `${ms}ms`;
	if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
	return `${(ms / 60_000).toFixed(1)}m`;
}

/** Compute initial view window from events, with 5-minute padding. */
export function computeInitialWindow(events: TimelineEvent[]): { start: number; end: number } {
	let min = Infinity;
	let max = -Infinity;
	for (const ev of events) {
		const s = ev.start.getTime();
		const e = (ev.end ?? ev.start).getTime();
		if (s < min) min = s;
		if (e > max) max = e;
	}
	const padMs = 5 * 60_000;
	if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) {
		const now = Date.now();
		return { start: now - 30 * 60_000, end: now + 30 * 60_000 };
	}
	return { start: min - padMs, end: max + padMs };
}
