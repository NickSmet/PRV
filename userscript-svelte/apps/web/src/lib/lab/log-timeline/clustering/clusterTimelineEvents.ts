import type { TimelineEvent } from '$lib/lab/timeline/types';

export type VisibleWindow = {
  startMs: number;
  endMs: number;
  spanMs: number;
};

export type ClusteredTimelineModel = {
  mode: 'none' | 'clustered';
  events: TimelineEvent[];
  clusters?: Record<string, string[]>;
  stats: {
    totalApps: number;
    clusteredApps: number;
  };
};

export type AppsClusterKey = string;

export type TimelineClusteringConfig = {
  apps: {
    enabled: boolean;
    /** Cluster when span is >= this value (ms). */
    minSpanMs: number;
    /** Cluster only if there are at least this many app events. */
    minItems: number;
    /**
     * Cluster is computed from app events that overlap the visible window.
     * This makes clustering dynamic as you pan/zoom.
     */
    useVisibleWindowOnly: boolean;
    /**
     * Apps are merged into "bursts" if the gap between consecutive events is below this threshold.
     * The effective gap is computed from visible span and clamped by these bounds.
     */
    burstGap: {
      fractionOfSpan: number;
      minMs: number;
      maxMs: number;
      /** Try increasing gap until clusters are <= this count per key. */
      maxClustersPerKey: number;
      maxIterations: number;
    };
    /**
     * Dimension classifier for apps. When undefined, all apps collapse into a single bucket.
     * This is where "system vs third-party" can be plugged in later.
     */
    classify?: (event: TimelineEvent) => AppsClusterKey;
  };
};

export const DEFAULT_TIMELINE_CLUSTERING: TimelineClusteringConfig = {
  apps: {
    enabled: true,
    // Tweaked as we iterate; start conservative (zoomed out >= 6 hours).
    minSpanMs: 6 * 60 * 60 * 1000,
    minItems: 12,
    // Filtering the dataset to "visible only" made behavior feel inconsistent
    // when zooming/panning through sparse regions. Keep clustering global.
    useVisibleWindowOnly: false,
    burstGap: {
      // Keep burst gap stable across zoom levels; we don't want clusters to reshape as you zoom.
      fractionOfSpan: 0,
      // Never merge across long quiet periods.
      minMs: 10 * 60 * 1000, // 10 minutes
      // But avoid making gaps so large that everything collapses into one blob.
      maxMs: 12 * 60 * 60 * 1000, // 12 hours
      maxClustersPerKey: 12,
      maxIterations: 6
    },
    classify: undefined
  }
};

function clampWindow(window: VisibleWindow): VisibleWindow {
  const startMs = Math.trunc(window.startMs);
  const endMs = Math.trunc(window.endMs);
  const safeStart = Number.isFinite(startMs) ? startMs : 0;
  const safeEnd = Number.isFinite(endMs) ? endMs : safeStart;
  return {
    startMs: safeStart,
    endMs: safeEnd,
    spanMs: Math.max(0, safeEnd - safeStart)
  };
}

function summarizeLabels(events: TimelineEvent[], max = 24) {
  const names = events
    .map((e) => e.label)
    .filter(Boolean)
    .slice(0, max);
  const extra = Math.max(0, events.length - names.length);
  if (names.length === 0) return '';
  return extra > 0 ? `${names.join('\n')}\n… +${extra} more` : names.join('\n');
}

function overlapsWindow(event: TimelineEvent, w: VisibleWindow): boolean {
  const startMs = event.start.getTime();
  const endMs = (event.end ?? event.start).getTime();
  return startMs <= w.endMs && endMs >= w.startMs;
}

type AppBurst = {
  items: TimelineEvent[];
  startMs: number;
  endMs: number;
};

function buildAppBursts(sorted: TimelineEvent[], gapMs: number): AppBurst[] {
  const bursts: AppBurst[] = [];
  for (const ev of sorted) {
    const s = ev.start.getTime();
    const e = (ev.end ?? ev.start).getTime();
    const last = bursts[bursts.length - 1];
    if (!last) {
      bursts.push({ items: [ev], startMs: s, endMs: e });
      continue;
    }
    const gap = s - last.endMs;
    if (gap <= gapMs) {
      last.items.push(ev);
      last.startMs = Math.min(last.startMs, s);
      last.endMs = Math.max(last.endMs, e);
      continue;
    }
    bursts.push({ items: [ev], startMs: s, endMs: e });
  }
  return bursts;
}

export function clusterTimelineEvents(
  input: TimelineEvent[],
  window: VisibleWindow | null,
  config: TimelineClusteringConfig = DEFAULT_TIMELINE_CLUSTERING
): ClusteredTimelineModel {
  const apps = input.filter((e) => e.category === 'Apps');
  const totalApps = apps.length;

  const w = window ? clampWindow(window) : null;
  const canClusterApps =
    !!w &&
    config.apps.enabled &&
    w.spanMs >= config.apps.minSpanMs &&
    totalApps >= config.apps.minItems;

  if (!canClusterApps) {
    return {
      mode: 'none',
      events: input,
      stats: { totalApps, clusteredApps: 0 }
    };
  }

  const classify = config.apps.classify ?? (() => 'all');
  const buckets = new Map<string, TimelineEvent[]>();
  const appsInScope =
    config.apps.useVisibleWindowOnly && w ? apps.filter((e) => overlapsWindow(e, w)) : apps;

  for (const e of appsInScope) {
    const key = String(classify(e) ?? 'all');
    const arr = buckets.get(key) ?? [];
    arr.push(e);
    buckets.set(key, arr);
  }

  const clusters: Record<string, string[]> = {};
  const clusteredEvents: TimelineEvent[] = [];
  const gapBase = Math.max(
    config.apps.burstGap.minMs,
    Math.min(config.apps.burstGap.maxMs, w.spanMs * config.apps.burstGap.fractionOfSpan)
  );

  for (const [key, group] of buckets.entries()) {
    const sorted = [...group].sort((a, b) => a.start.getTime() - b.start.getTime());

    let gapMs = gapBase;
    let bursts = buildAppBursts(sorted, gapMs);
    for (let i = 0; i < config.apps.burstGap.maxIterations; i++) {
      if (bursts.length <= config.apps.burstGap.maxClustersPerKey) break;
      gapMs = Math.min(config.apps.burstGap.maxMs, gapMs * 1.6);
      bursts = buildAppBursts(sorted, gapMs);
    }

    const labelBase = key === 'all' ? 'apps' : `${key} apps`;

    bursts.forEach((burst, idx) => {
      const clusterId = `cluster:apps:${key}:${idx}:${burst.startMs}:${burst.endMs}`;
      clusters[clusterId] = burst.items.map((e) => e.id);
      const label = `${burst.items.length} ${labelBase}`;
      const detail = summarizeLabels(burst.items);

      clusteredEvents.push({
        id: clusterId,
        sourceFile: burst.items[0]?.sourceFile ?? 'vm.log',
        category: 'Apps',
        severity: 'info',
        start: new Date(burst.startMs),
        end: new Date(burst.endMs),
        label,
        detail,
        startRef: null,
        endRef: null
      });
    });
  }

  const nonApps = input.filter((e) => e.category !== 'Apps');
  const events = [...nonApps, ...clusteredEvents].sort((a, b) => a.start.getTime() - b.start.getTime());

  return {
    mode: 'clustered',
    events,
    clusters,
    stats: { totalApps, clusteredApps: clusteredEvents.length }
  };
}

