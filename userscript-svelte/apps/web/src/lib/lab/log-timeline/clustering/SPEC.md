# Timeline Clustering Specification (Lab)

## Overview

This module defines **dynamic clustering/aggregation rules** for timeline rendering when the user is zoomed out.

**Goal:** when the visible time window is large (zoomed out), show **fewer, higher-level items** (summary lanes/items). When zoomed in, show the **fully expanded** per-event items.

**Key principle:** clustering is a **view-layer transformation**:
- it must not change the underlying event timestamps or provenance
- it must be reversible (zoom in → regain original events)
- it should be configurable per event category (Apps vs GUI vs Config, etc.)

This spec is intended to support clustering across multiple categories, not only Apps.

---

## Inputs and outputs

### Input

- `TimelineEvent[]` (library-agnostic UI events)
  - Spec: `apps/web/src/lib/lab/timeline/types.ts`
- `VisibleWindow`

```ts
type VisibleWindow = {
  startMs: number;
  endMs: number;
};
```

### Output

- `ClusteredTimelineModel`

```ts
type ClusteredTimelineModel = {
  mode: 'none' | 'clustered';
  /** Events actually rendered (either original or aggregated). */
  events: TimelineEvent[];
  /**
   * Optional mapping to support drilldown:
   * clusterEventId -> child event ids.
   */
  clusters?: Record<string, string[]>;
};
```

---

## Clustering triggers

Clustering is driven by **zoom level** (visible window span).

```ts
const spanMs = endMs - startMs;
```

### Baseline policy (initial)

- If `spanMs >= CLUSTER_APPS_THRESHOLD_MS`, enable Apps clustering.
- Otherwise, show the fully expanded list.

The threshold is intentionally coarse and should be tuned empirically.

---

## Clustering dimensions

Clustering groups events by a **dimension key** derived from the event.

Examples:
- Apps: `system` vs `thirdParty`
- GUI: `prompt` vs `notification`
- Config: `sharing` vs `network` vs `storage` (future)

```ts
type ClusterDimensionKey = string;
type ClusterDimensionFn = (event: TimelineEvent) => ClusterDimensionKey;
```

---

## Rendering model

When clustered:

1. Replace many child items with a small number of **summary items**.
2. Summary item labels must encode:
   - count
   - cluster dimension name (e.g. “System apps”)
3. Summary items MUST remain clickable:
   - clicking a summary item can either:
     - zoom in to a narrower window (recommended), or
     - open a list panel (future)

### Summary item time range

The summary item time range is purely a visual affordance.

Baseline strategy:
- Use the **current visible window** as the summary item range:
  - `start = window.start`
  - `end = window.end`

This avoids implying specific durations while still providing a stable “band” in the lane.

---

## Integration points

### Timeline library capabilities (vis-timeline)

`vis-timeline` has a built-in `cluster` option:

- `TimelineOptions.cluster`
- `clusterCriteria(firstItem, secondItem) => boolean`
- `maxItems`

This can reduce visual density, but it does not produce the domain-specific “System apps vs Third-party apps” lane summaries we want.

**Policy:** prefer app-level clustering (this spec) for semantic summaries; use built-in `cluster` only for purely visual density reduction.

### Where clustering applies

Primary surfaces:
- `/lab/timeline/:reportId/compact` (shared timeline + viewer workspace)
- `/lab/timeline/:reportId` and other lab timelines that reuse `TimelineEvent[]`

---

## Status

**🔶 Outline** — defines the intended behavior and interfaces. Implementation will add:
- range-change hooks (visible window observation)
- an event → cluster key classifier (Apps first)
- dataset switching between expanded and clustered views

