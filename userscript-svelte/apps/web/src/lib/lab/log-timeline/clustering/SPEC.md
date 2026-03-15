# Timeline Clustering Specification (Lab)

## Overview

This module defines **dynamic clustering/aggregation rules** for timeline rendering. When the visible time window contains too many events per category, events are aggregated into burst-based clusters. When zoomed in (or when event density is low), the fully expanded per-event view is shown.

**Key principles:**
- Clustering is a **view-layer transformation** — it does not change underlying event timestamps or provenance
- It is **reversible** — zoom in to regain original events
- It is **category-agnostic** — every category is evaluated independently for density
- It is **severity-aware** — cluster labels show severity breakdown; cluster items inherit the highest severity
- Clustering decisions are driven by the **user-intended window** (wheel/drag), not vis-timeline's internal reflow window, to prevent feedback loops

---

## Inputs and outputs

### Input

- `TimelineEvent[]` — library-agnostic UI events (see `apps/web/src/lib/lab/timeline/types.ts`)
- `VisibleWindow | null` — current user-intended zoom window; null means no window known yet

```ts
type VisibleWindow = {
  startMs: number;
  endMs: number;
  spanMs: number;
};
```

### Output

```ts
type ClusteredTimelineModel = {
  mode: 'none' | 'clustered';
  events: TimelineEvent[];
  clusters?: Record<string, string[]>; // clusterId → child event ids
  stats: {
    totalByCategory: Record<string, number>;
    clusteredByCategory: Record<string, number>;
  };
};
```

---

## Clustering triggers

### Global guard

Clustering requires all of the following to be true:
1. `config.enabled` is true
2. A visible window is known (`window !== null`)
3. `spanMs >= noAggregationFloorMs` (default: 5 minutes)

If any condition fails, all events are returned unclustered.

### Per-category evaluation

Each category is evaluated independently with **two triggers**:

```
densityTrigger = visibleCount > maxVisibleEvents
spanTrigger    = (spanMs >= alwaysClusterAboveSpanMs) && (categoryEvents.length >= minItems)
```

- **Density trigger** — counts events overlapping the visible window. If there are too many to read comfortably, cluster.
- **Span trigger** — when the window is very wide (default: ≥ 6 hours), cluster any category with enough total events. Uses **total** event count (not visible count) so panning doesn't cause de-aggregation when events slide to the edge of view.

Important: the `minItems` gate still applies before burst formation. This means a visually close pair in a sparse category can remain unclustered if that category does not meet the configured minimum total event count.

### Hard floor

When `spanMs < noAggregationFloorMs` (default: 5 minutes), **no aggregation occurs** regardless of density or category size.

### Default thresholds

| Parameter | Default | Description |
|---|---|---|
| `noAggregationFloorMs` | 5 min | Minimum span below which clustering never triggers |
| `alwaysClusterAboveSpanMs` | 6 hours | Span above which span trigger evaluates |
| `defaultMaxVisibleEvents` | 15 | Density threshold per category |
| `defaultMinItems` | 6 | Minimum total events for a category to be eligible |

### Configuration

```ts
type TimelineClusteringConfig = {
  enabled: boolean;
  noAggregationFloorMs: number;
  alwaysClusterAboveSpanMs: number;
  defaultMaxVisibleEvents: number;
  defaultMinItems: number;
  burstGap: BurstGapConfig;
  categories?: Record<string, Partial<CategoryClusterConfig>>;
};
```

Per-category overrides allow tuning `maxVisibleEvents`, `minItems`, `burstGap`, and an optional sub-dimension `classify` function.

---

## Burst formation

Within a clustered category, events are grouped into **temporal bursts**:
1. Sort events by start time
2. Compute each event's **clustering footprint end**
3. Merge consecutive events when the gap between them is ≤ `gapMs`
3. If the resulting burst count exceeds `maxClustersPerKey`, iteratively widen the gap (×1.6 per iteration, up to `maxIterations`)

The clustering footprint is not always the raw event end:

- point-like events (`<= 5s`, or no `end`) get a small synthetic footprint
- narrow summary/range items may also get a small synthetic footprint
- cluster summary items use a bounded synthetic footprint
- wide true-duration items use their actual end

This keeps burst formation aligned with what is visually competing on screen without using the full readability expansion width.

### Burst gap defaults

| Parameter | Default |
|---|---|
| `fractionOfSpan` | 0 (use minMs directly) |
| `minMs` | 10 minutes |
| `maxMs` | 12 hours |
| `maxClustersPerKey` | 12 |
| `maxIterations` | 6 |

### Clustering footprint defaults

| Parameter | Default | Meaning |
|---|---|---|
| point-like / narrow footprint | ~`60px` at assumed `800px` viewport | Footprint used for burst formation, not final render width |
| point threshold | `<= 5s` | Events treated as point-like for display/clustering semantics |

### Sub-dimensions

An optional `classify` function can split a category into sub-buckets. The current compact timeline does not use that for app activity, because app events are extracted into separate categories up front (`Apps: System`, `Apps: Microsoft`, `Apps: Third-party`). Each category still clusters independently.

---

## Severity-aware aggregation

Cluster items carry severity information:
- **Highest severity wins**: the cluster item's `severity` field is set to the worst severity in its children
- **Composite labels**: when a burst contains mixed severities, the label shows a breakdown — e.g. `"12 apps (3 errors, 2 warn, 7 info)"`
- **Visual styling**: `buildCompactPayload` applies severity-based CSS classes, so cluster items with errors render with error styling
- **Child label summary**: the cluster item's `detail` field contains the first 24 child event labels (newline-separated), shown in the hover tooltip

---

## Rendering model

When clustered:
1. Original events in that category are replaced by **burst summary items**
2. Summary item labels encode: count, category name, severity breakdown
3. Summary item time range spans the burst's actual `[startMs, endMs]`
4. Summary items remain clickable (click emits the cluster item for drill-down)
5. Cluster items carry a CSS class `prv-ct-item--cluster` for special sizing rules

Cluster children are whatever items entered clustering at that layer. In practice this means a cluster can contain raw point events, real range events, or already summarized extracted events such as individual config-diff rows. The current implementation does not recursively flatten child provenance back to leaf log rows inside cluster detail text.

### Cluster item IDs

Format: `cluster:{categoryKey}:{dimensionKey}:{burstIndex}:{startMs}:{endMs}`

The `clusters` map in the output maps each cluster ID to its child event IDs for drill-down support.

---

## Integration points

### vis-timeline

vis-timeline has a built-in `cluster` option, but it doesn't produce domain-specific semantic summaries. **Policy:** use app-level clustering (this module) for semantic aggregation.

### Key architectural note

Clustering decisions must be driven by **user-intended window** only (not vis-timeline's internal window state) to avoid feedback loops. The controller maintains a separate `userIntendedWindow` that is only updated on explicit user wheel/drag events. See `timeline-clustering-debug.md` for the full explanation.

### Where clustering applies

- Log timeline workspace (`LogTimelineWorkspace.svelte`)
- Managed by `TimelineManager` (in `createLogWorkspace` directory); the controller filters hidden app lanes, calls `clusterTimelineEvents()` on the visible event set, and then passes the result to `buildCompactTimeline()`

---

## Status

**Working** — universal density-based clustering with dual triggers (density + span) and severity awareness is implemented. See `clusterTimelineEvents.ts`.
