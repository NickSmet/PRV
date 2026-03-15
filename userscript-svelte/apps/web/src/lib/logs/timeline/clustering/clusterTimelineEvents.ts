import type { TimelineEvent, TimelineSeverity } from '$lib/lab/timeline/types';
import { clusteringFootprintEndMs } from '../displaySemantics';

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
    totalByCategory: Record<string, number>;
    clusteredByCategory: Record<string, number>;
  };
};

export type BurstGapConfig = {
  /** Fraction of visible span used as base gap. 0 = use minMs directly. */
  fractionOfSpan: number;
  minMs: number;
  maxMs: number;
  /** Iteratively widen gap until cluster count per category ≤ this. */
  maxClustersPerKey: number;
  maxIterations: number;
};

export type CategoryClusterConfig = {
  /**
   * Density threshold: aggregate when the category has more than this many
   * events visible in the current window. Evaluated per-category independently.
   * Set to Infinity to effectively disable clustering for a category.
   */
  maxVisibleEvents: number;
  /**
   * Minimum total events in the category to be eligible for clustering.
   * Categories with fewer events than this are never clustered.
   */
  minItems: number;
  /** Burst gap tuning for this category. */
  burstGap?: Partial<BurstGapConfig>;
  /**
   * Optional sub-dimension classifier within a category.
   * E.g. for Apps: "system" vs "thirdParty".
   */
  classify?: (event: TimelineEvent) => string;
};

export type TimelineClusteringConfig = {
  enabled: boolean;
  /**
   * Hard floor: never aggregate when span is below this value.
   * Prevents hiding detail at human-readable zoom levels.
   */
  noAggregationFloorMs: number;
  /**
   * Span threshold: always aggregate eligible categories when the visible
   * window is wider than this, regardless of density. At wide zoom levels
   * even a small number of events become unreadable pixel slivers.
   */
  alwaysClusterAboveSpanMs: number;
  /** Default density threshold for categories without an override. */
  defaultMaxVisibleEvents: number;
  /** Default minimum items for clustering eligibility. */
  defaultMinItems: number;
  /** Default burst gap config. */
  burstGap: BurstGapConfig;
  /** Per-category overrides. Key = normalized category string. */
  categories?: Record<string, Partial<CategoryClusterConfig>>;
};

export const DEFAULT_TIMELINE_CLUSTERING: TimelineClusteringConfig = {
  enabled: true,
  noAggregationFloorMs: 5 * 60 * 1000, // 5 minutes — always show everything
  alwaysClusterAboveSpanMs: 6 * 60 * 60 * 1000, // 6 hours — force-cluster at wide zoom
  defaultMaxVisibleEvents: 15,
  defaultMinItems: 6,
  burstGap: {
    fractionOfSpan: 0,
    minMs: 10 * 60 * 1000, // 10 minutes
    maxMs: 12 * 60 * 60 * 1000, // 12 hours
    maxClustersPerKey: 12,
    maxIterations: 6
  }
};

// ---------------------------------------------------------------------------
// Severity ordering (highest → lowest)
// ---------------------------------------------------------------------------
const SEVERITY_RANK: Record<TimelineSeverity, number> = { danger: 2, warn: 1, info: 0 };

function highestSeverity(events: TimelineEvent[]): TimelineSeverity {
  let max: TimelineSeverity = 'info';
  for (const e of events) {
    if (SEVERITY_RANK[e.severity] > SEVERITY_RANK[max]) {
      max = e.severity;
      if (max === 'danger') break; // can't go higher
    }
  }
  return max;
}

function severityBreakdown(events: TimelineEvent[]): Record<TimelineSeverity, number> {
  const counts: Record<TimelineSeverity, number> = { danger: 0, warn: 0, info: 0 };
  for (const e of events) counts[e.severity]++;
  return counts;
}

function formatSeverityLabel(count: number, category: string, events: TimelineEvent[]): string {
  const bd = severityBreakdown(events);
  const parts: string[] = [];
  if (bd.danger > 0) parts.push(`${bd.danger} error${bd.danger > 1 ? 's' : ''}`);
  if (bd.warn > 0) parts.push(`${bd.warn} warn`);
  if (bd.info > 0) parts.push(`${bd.info} info`);
  // If all same severity, use simple label
  if (parts.length <= 1) return `${count} ${category}`;
  return `${count} ${category} (${parts.join(', ')})`;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

type Burst = {
  items: TimelineEvent[];
  startMs: number;
  endMs: number;
};

function buildBursts(sorted: TimelineEvent[], gapMs: number, visibleSpanMs: number): Burst[] {
  const bursts: Burst[] = [];
  for (const ev of sorted) {
    const s = ev.start.getTime();
    const rawEnd = (ev.end ?? ev.start).getTime();
    const e = Math.max(rawEnd, clusteringFootprintEndMs(ev, visibleSpanMs));
    const last = bursts[bursts.length - 1];
    if (!last) {
      bursts.push({ items: [ev], startMs: s, endMs: e });
      continue;
    }
    if (s - last.endMs <= gapMs) {
      last.items.push(ev);
      last.startMs = Math.min(last.startMs, s);
      last.endMs = Math.max(last.endMs, e);
      continue;
    }
    bursts.push({ items: [ev], startMs: s, endMs: e });
  }
  return bursts;
}

function resolveBurstGap(base: BurstGapConfig, override?: Partial<BurstGapConfig>): BurstGapConfig {
  if (!override) return base;
  return {
    fractionOfSpan: override.fractionOfSpan ?? base.fractionOfSpan,
    minMs: override.minMs ?? base.minMs,
    maxMs: override.maxMs ?? base.maxMs,
    maxClustersPerKey: override.maxClustersPerKey ?? base.maxClustersPerKey,
    maxIterations: override.maxIterations ?? base.maxIterations
  };
}

function categoryKeyNormalized(category: string): string {
  return category.trim().toLowerCase();
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export function clusterTimelineEvents(
  input: TimelineEvent[],
  window: VisibleWindow | null,
  config: TimelineClusteringConfig = DEFAULT_TIMELINE_CLUSTERING
): ClusteredTimelineModel {
  const w = window ? clampWindow(window) : null;

  // Group all events by category
  const byCategory = new Map<string, TimelineEvent[]>();
  for (const e of input) {
    const arr = byCategory.get(e.category) ?? [];
    arr.push(e);
    byCategory.set(e.category, arr);
  }

  // Build stats
  const totalByCategory: Record<string, number> = {};
  for (const [cat, evts] of byCategory) totalByCategory[cat] = evts.length;

  // Check global conditions
  const canCluster = !!w && config.enabled && w.spanMs >= config.noAggregationFloorMs;

  if (!canCluster) {
    return {
      mode: 'none',
      events: input,
      stats: { totalByCategory, clusteredByCategory: {} }
    };
  }

  const clusters: Record<string, string[]> = {};
  const clusteredByCategory: Record<string, number> = {};
  let anyClustered = false;
  // Collect events that will be in the output: unclustered categories keep originals,
  // clustered categories get their cluster items.
  const outputEvents: TimelineEvent[] = [];

  const wideZoom = w!.spanMs >= config.alwaysClusterAboveSpanMs;

  for (const [category, categoryEvents] of byCategory) {
    const catKey = categoryKeyNormalized(category);
    const catConfig = config.categories?.[catKey];
    const maxVisible = catConfig?.maxVisibleEvents ?? config.defaultMaxVisibleEvents;
    const minItems = catConfig?.minItems ?? config.defaultMinItems;
    const classify = catConfig?.classify;
    const gap = resolveBurstGap(config.burstGap, catConfig?.burstGap);

    // Not enough events to bother clustering
    if (categoryEvents.length < minItems) {
      for (const e of categoryEvents) outputEvents.push(e);
      continue;
    }

    // Count events overlapping the visible window
    const visibleCount = categoryEvents.filter((e) => overlapsWindow(e, w!)).length;

    // Two triggers for clustering:
    // 1. Density: too many events visible in the current window
    // 2. Span: window is very wide (events are unreadable pixel slivers).
    //    Uses total event count (not visible count) so that panning doesn't
    //    cause de-aggregation when events slide to the edge of view.
    const densityTrigger = visibleCount > maxVisible;
    const spanTrigger = wideZoom && categoryEvents.length >= minItems;

    if (!densityTrigger && !spanTrigger) {
      for (const e of categoryEvents) outputEvents.push(e);
      continue;
    }

    // Sub-dimension bucketing (optional classifier)
    const buckets = new Map<string, TimelineEvent[]>();
    for (const e of categoryEvents) {
      const key = classify ? String(classify(e) ?? 'all') : 'all';
      const arr = buckets.get(key) ?? [];
      arr.push(e);
      buckets.set(key, arr);
    }

    const gapBase = Math.max(gap.minMs, Math.min(gap.maxMs, w!.spanMs * gap.fractionOfSpan));
    let categoryClusterCount = 0;

    for (const [dimKey, group] of buckets) {
      const sorted = [...group].sort((a, b) => a.start.getTime() - b.start.getTime());

      let gapMs = gapBase;
      let bursts = buildBursts(sorted, gapMs, w!.spanMs);
      for (let i = 0; i < gap.maxIterations; i++) {
        if (bursts.length <= gap.maxClustersPerKey) break;
        gapMs = Math.min(gap.maxMs, gapMs * 1.6);
        bursts = buildBursts(sorted, gapMs, w!.spanMs);
      }

      const labelBase = dimKey === 'all' ? category.toLowerCase() : `${dimKey} ${category.toLowerCase()}`;

      bursts.forEach((burst, idx) => {
        if (burst.items.length <= 1) {
          outputEvents.push(...burst.items);
          return;
        }

        anyClustered = true;
        const clusterId = `cluster:${catKey}:${dimKey}:${idx}:${burst.startMs}:${burst.endMs}`;
        clusters[clusterId] = burst.items.map((e) => e.id);

        const label = formatSeverityLabel(burst.items.length, labelBase, burst.items);
        const detail = summarizeLabels(burst.items);
        const severity = highestSeverity(burst.items);

        outputEvents.push({
          id: clusterId,
          sourceFile: burst.items[0]?.sourceFile ?? '',
          category,
          severity,
          start: new Date(burst.startMs),
          end: new Date(burst.endMs),
          label,
          detail,
          startRef: null,
          endRef: null
        });
        categoryClusterCount++;
      });
    }

    if (categoryClusterCount > 0) {
      clusteredByCategory[category] = categoryClusterCount;
    }
  }

  // Sort output by start time
  outputEvents.sort((a, b) => a.start.getTime() - b.start.getTime());

  return {
    mode: anyClustered ? 'clustered' : 'none',
    events: outputEvents,
    clusters: anyClustered ? clusters : undefined,
    stats: { totalByCategory, clusteredByCategory }
  };
}
