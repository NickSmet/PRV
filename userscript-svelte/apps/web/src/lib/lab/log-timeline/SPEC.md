# Log Timeline (Lab) Specification (`apps/web/src/lib/lab/log-timeline`)

## Overview

This module provides the **lab log timeline** used by:

- `/lab/timeline/:reportId` (timeline prototype over selected fixture logs)
- `/lab/timeline/:reportId/compact` (shared timeline + log viewer workspace)

It is responsible for:

- extracting `TimelineEvent[]` from indexed log rows (browser-local IndexedDB substrate)
- building a `vis-timeline` payload (`groups/items/options/initialWindow`)
- clustering events by density and zoom level for readability at any zoom
- rendering the timeline and a details pane
- coordinating selection so a timeline click can jump the log viewer to a specific row

**Key principle:** lab timeline logic is **workspace-driven** and consumes a local row substrate; it should not fetch/parse raw logs inside the timeline renderer.

---

## Architecture

```
IndexedDB row substrate (query-worker)
  └─ LogWorkspaceController
     ├─ TimelineManager                         ← owns all timeline state
     │   ├─ clusterTimelineEvents(events, window) → ClusteredTimelineModel
     │   └─ buildCompactTimeline(events, options) → BuiltCompactTimeline
     ├─ IngestManager                           ← owns worker lifecycle
     └─ LogTimelineWorkspace.svelte
        ├─ <LogTimeline payload onItemClick />
        │   └─ <Timeline /> from @prv/report-ui-svelte (vis-timeline wrapper)
        └─ <LogTimelineDetailPane event />
```

### Code organisation

The workspace controller is split across three files:

| File | Responsibility |
|---|---|
| `createLogWorkspace.svelte.ts` | Orchestrator + viewer/search/scroll/query-worker |
| `timelineManager.svelte.ts` | All timeline state, clustering, payload, selection |
| `ingestManager.svelte.ts` | Worker lifecycle, source records, progress tracking |

---

## Interfaces

### Timeline event model

The UI-level event model is library-agnostic and lives in `apps/web/src/lib/lab/timeline/types.ts`:

```ts
export type TimelineEvent = {
  id: string;
  sourceFile: string;
  category: string;
  severity: 'info' | 'warn' | 'danger';
  start: Date;
  end?: Date;
  label: string;
  detail?: string;
  startRef: LogRowLocator | null;
  endRef?: LogRowLocator | null;
  rawRef?: { line: number };
};
```

### Payload builder

`buildCompactTimeline(events, options?)` produces:

```ts
export type BuiltCompactTimeline = {
  groups: VisGroup[];
  items: VisItem[];
  options: Record<string, unknown>; // forwarded to vis-timeline
  initialWindow?: { start: Date; end: Date };
  customTimes?: Array<{ id: string; time: Date; title?: string; marker?: string }>;
};
```

`options.visibleSpanMs` is optional; when supplied it drives readability expansion and point/range display decisions at the current zoom level.
`options.categoryTotals` and `options.ensureCategories` let the builder keep empty category rows visible when their items are filtered out.
Display semantics are defined in `DISPLAY-MODES.md`.

---

## Behavior

### Grouping + labeling

Payload builder groups as:

- **Subsystem parent lane** (level 1): `VM` vs `System` (derived from `sourceFile`)
  - **Category lanes** (level 2): e.g. `Apps: System`, `Apps: Microsoft`, `Apps: Third-party`, `Tools Install`, `Tools Issues`, `GUI Messages`, `Config Diffs`

Items:
- `point` items for semantic point events (`<= 5s`, or no `end`)
- `range` items for real duration events and cluster summaries

Severity is rendered via CSS class hooks and an HTML severity dot prefix in the item content.

### App categories + visibility

`vm.log` app activity is classified at extraction time into three concrete timeline categories:

- `Apps: System`
- `Apps: Microsoft`
- `Apps: Third-party`

The compact workspace keeps per-category visibility state for these three lanes only:

- `Apps: System` hidden by default
- `Apps: Microsoft` hidden by default
- `Apps: Third-party` visible by default

Hidden means:

- the lane row remains in the timeline
- no items are rendered into that lane
- clustering runs only on currently visible events

The toolbar exposes checkboxes for these three app lanes along with raw counts from the unfiltered event set.

App extraction semantics:

- each matching `D3D*.**: <path>.exe` row is treated as an **app sighting**, not a process lifetime
- app sightings are emitted as point events
- no synthetic start/end pairing is performed for repeated sightings of the same app
- consecutive sightings of the same executable path within `2s` are deduped
- dedupe ignores D3D version so `D3D11.32` and `D3D12.20` rows for the same path still collapse when they are effectively the same launch observation

### Tools log extraction

`tools.log` contributes timeline events under the `VM` subsystem:

- `Tools Install` for setup milestones such as install mode, update source version, success, and fatal install exit codes
- `Tools Issues` for known tail-signatures such as registry corruption and the `prl_dd.inf` / `KB125243` driver-install pattern

The extraction is heuristic and intentionally mirrors the older tools-log summary logic, but now emits clickable timeline events instead of a plain text summary.

### Display modes + readability

Timeline items use three zoom-sensitive display modes:

- **Point mode**: no `end`, or real duration `<= 5s`
- **Readability range mode**: real duration `> 5s` but too narrow to read at current zoom
- **True-duration range mode**: real duration `> 5s` and already readable at current zoom

Point items use vis-timeline `type: 'point'` with a bounded chip label.
Readability-range items widen rightward from the true start, but remain visually distinct from true-duration bars.
True-duration items render at their exact elapsed span.

Cluster items remain synthetic summaries with bounded width.
Cluster summaries are not flattened back to leaf rows in tooltips/details; their child list may contain already summarized extracted events.

`Config Diffs` no longer pre-aggregate adjacent rows during extraction. Each diff row becomes its own timeline event, and any visual grouping is handled later by clustering.

### Dynamic clustering

Events are clustered by `clusterTimelineEvents()` before the payload is built. See `clustering/SPEC.md` for the full specification. Key behaviors:

- **Category-agnostic**: every category participates
- **Dual trigger**: density (too many visible events) OR span (window > 6 hours) with enough total events
- **Hard floor**: no clustering below 5-minute span
- **Display-footprint aware**: burst formation uses a small synthetic footprint for point-like / narrow events so visually colliding items can cluster even when their raw timestamps do not overlap
- **Severity-aware**: composite labels + highest-severity CSS class
- **Stable under panning**: span trigger uses total event count so clusters don't disappear when panning pushes events to the edge of view

### Initial view window

On load, the timeline opens at the **last 5 hours** of the data:

```
initialWindow.start = (dataMax + 1h) − 5h
initialWindow.end   = dataMax + 1h
```

This is baked into vis-timeline's constructor options (not a post-construction `setWindow` call) to prevent vis-timeline's internal async `fit()` from overriding it.
The payload also adds a custom vertical time marker at `dataMax` labeled `Report end`.

### Reparse test hook

The compact route supports a one-shot `?reparse=1` query parameter:

- route: `/lab/timeline/:reportId/compact?reparse=1`
- effect: workspace init forces `ensureIndexed(true)` before the first normal refresh cycle
- purpose: end-to-end parser testing against the selected report without trusting the existing IndexedDB snapshot

### Selection + drilldown

1. User clicks an item on the timeline.
2. `@prv/report-ui-svelte` emits `onItemClick(record)` for the clicked item.
3. Workspace maps `record.id` → `TimelineEvent.id` and sets `selectedEventId`.
4. If the event has `startRef`, the log viewer is asked to jump to that locator.
5. The details pane shows `TimelineEvent.detail` and provenance.

### Tooltips

Every timeline item carries a structured HTML tooltip built by `buildTooltipHtml()` in `buildCompactPayload.ts`. Layout:

- **Individual event**: severity dot + bold label → timestamp (+ duration if > 0) → source file · category → `detail` text if present
- **Cluster event**: severity dot + composite label (e.g. `"12 apps (3 errors, 2 warn, 7 info)"`) → time range (start – end) → source file · category → first 8 child event labels as a list

For point-mode items, the tooltip still reports the real event timestamp and any true duration from the source event model; the bounded chip width is purely a display affordance.

All styles are inlined so the tooltip works in both normal DOM and shadow DOM (userscript) contexts. vis-timeline's `.vis-tooltip` CSS is overridden to allow word-wrapping (by default it is `white-space: nowrap`) with a max-width of 380px.

### Wheel zoom policy

Mouse wheel zooms the time axis (not the lane list). Shift + wheel scrolls lanes vertically. Implemented via `wheelMode="zoom"` prop on `<Timeline>`.

### Sizing contract

Timeline height is controlled by the parent container:

- timeline payload sets `options.height = '100%'`
- the underlying `Timeline.svelte` wrapper redraws on container resize via `ResizeObserver`

---

## Configuration

### Timeline options (vis-timeline)

Defined in `buildCompactPayload.ts`:

| Option | Value | Notes |
|---|---|---|
| `stack` | `true` | Items stack vertically to avoid overlap |
| `zoomKey` | `'ctrlKey'` | Ctrl+wheel zooms (fallback for native scroll mode) |
| `orientation` | `'top'` | Time axis at the top |
| `groupOrder` | `'order'` | Groups sorted by `order` field |
| `tooltip.followMouse` | `true` | Tooltip tracks cursor |
| `tooltip.overflowMethod` | `'flip'` | Tooltip flips when near edge |
| `margin.item` | `{ horizontal: 2, vertical: 3 }` | Compact item spacing |
| `verticalScroll` | `true` | Lane list scrollable |
| `zoomMin` | `5000ms` | 5 seconds minimum |
| `zoomMax` | `~13 months` (or data span if larger) | Can always zoom out to full data |
| `height` | `'100%'` | Container-controlled height |

---

## Error Handling

| Error | Handling |
|---|---|
| Timeline payload missing / no selected logs | Timeline UI shows "Loading…" or "No events" placeholder (`LogTimeline.svelte`) |
| Event click cannot be mapped to a `TimelineEvent` | No selection change |
| Event has no `startRef` | Details can still show; viewer jump is skipped |
| Viewer jump locator is outside indexed slice | Viewer shows a transient notice (via `timeline.showNotice()`) |
| Timeline data load fails | `timeline.error` state shown in-pane |

---

## Dependencies

- vis-timeline wrapper: `packages/report-ui-svelte/src/ui/timeline/Timeline.svelte`
- clustering spec: `apps/web/src/lib/lab/log-timeline/clustering/SPEC.md`
- clustering debug background: `docs/work-in-progress/timeline-clustering-debug.md`
- shared workspace/controller: `apps/web/src/lib/lab/log-workspace/`

---

## Status

**✅ Working** — all planned phases from timeline-v2-scope are implemented:

| Phase | Feature | Status |
|---|---|---|
| 1 | Universal aggregation (all categories) | ✅ Done |
| 2 | Density-based dynamic aggregation with dual triggers | ✅ Done |
| 3 | Severity-aware aggregation (composite labels + highest-severity styling) | ✅ Done |
| 4 | Minimum event width (time-range inflation) | ✅ Done |
| 5 | Structured HTML tooltips | ✅ Done |
| — | Initial 5-hour view window | ✅ Done |
| — | Pan stability (no de-aggregation when events near edge of view) | ✅ Done |
| — | Controller refactor (TimelineManager / IngestManager split) | ✅ Done |
