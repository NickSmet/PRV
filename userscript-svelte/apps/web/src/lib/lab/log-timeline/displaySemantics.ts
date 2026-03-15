import type { TimelineEvent } from '$lib/lab/timeline/types';

export const POINT_EVENT_THRESHOLD_MS = 5000;
export const READABLE_ITEM_PX = 168;
export const MAX_CLUSTER_ITEM_PX = 220;
export const CLUSTERING_FOOTPRINT_PX = 60;
const ASSUMED_CONTAINER_PX = 800;

export function computeReadableDurationMs(spanMs: number): number {
	const fraction = READABLE_ITEM_PX / ASSUMED_CONTAINER_PX;
	const computed = spanMs * fraction;
	return Math.max(POINT_EVENT_THRESHOLD_MS + 1, computed);
}

export function computeMaxClusterDurationMs(spanMs: number): number {
	const fraction = MAX_CLUSTER_ITEM_PX / ASSUMED_CONTAINER_PX;
	const computed = spanMs * fraction;
	return Math.max(5000, computed);
}

export function naturalEventDurationMs(event: TimelineEvent): number {
	const endMs = (event.end ?? event.start).getTime();
	const startMs = event.start.getTime();
	return endMs > startMs ? endMs - startMs : 0;
}

function computeClusteringFootprintMs(spanMs: number): number {
	const fraction = CLUSTERING_FOOTPRINT_PX / ASSUMED_CONTAINER_PX;
	return Math.max(POINT_EVENT_THRESHOLD_MS + 1, spanMs * fraction);
}

export function isPointLikeEvent(event: TimelineEvent): boolean {
	if (event.id.startsWith('cluster:')) return false;
	return naturalEventDurationMs(event) <= POINT_EVENT_THRESHOLD_MS;
}

export function clusteringFootprintEndMs(event: TimelineEvent, visibleSpanMs: number): number {
	const startMs = event.start.getTime();
	const naturalDurationMs = naturalEventDurationMs(event);
	const clusteringFootprintMs = computeClusteringFootprintMs(visibleSpanMs);

	if (event.id.startsWith('cluster:')) {
		return startMs + Math.min(Math.max(naturalDurationMs, clusteringFootprintMs), computeMaxClusterDurationMs(visibleSpanMs));
	}

	if (naturalDurationMs <= POINT_EVENT_THRESHOLD_MS) {
		return startMs + clusteringFootprintMs;
	}

	if (naturalDurationMs < clusteringFootprintMs) {
		return startMs + clusteringFootprintMs;
	}

	return startMs + naturalDurationMs;
}
