# Log Timeline (Lab) Specification (`apps/web/src/lib/lab/log-timeline`)

## Overview

This module provides the **lab log timeline** used by:

- `/lab/timeline/:reportId` (timeline prototype over selected fixture logs)
- `/lab/timeline/:reportId/compact` (shared timeline + log viewer workspace)

It is responsible for:

- extracting `TimelineEvent[]` from indexed log rows (browser-local IndexedDB substrate)
- building a `vis-timeline` payload (`groups/items/options/initialWindow`)
- rendering the timeline and a details pane
- coordinating selection so a timeline click can jump the log viewer to a specific row

**Key principle:** lab timeline logic is **workspace-driven** and consumes a local row substrate; it should not fetch/parse raw logs inside the timeline renderer.

---

## Architecture

```
IndexedDB row substrate (query-worker)
  └─ LogWorkspaceController
     ├─ extractTimelineEventsFromRows(rows) → TimelineEvent[]
     ├─ buildCompactTimeline(events) → { groups, items, options, initialWindow }
     └─ LogTimelineWorkspace.svelte
        ├─ <LogTimeline payload=timelinePayload onItemClick />
        │   └─ <Timeline /> from @prv/report-ui-svelte (vis-timeline wrapper)
        └─ <LogTimelineDetailPane event />
```

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
  startRef?: import('$lib/lab/timeline/types').LogRowLocator;
};
```

### Payload builder

`buildCompactTimeline(events)` produces:

```ts
export type BuiltCompactTimeline = {
  groups: Array<{ id: string; content: string; nestedGroups?: string[]; showNested?: boolean; className?: string; order?: number }>;
  items: Array<{ id: string; group: string; start: Date; end?: Date; content: string; className?: string; title?: string }>;
  options: Record<string, unknown>; // forwarded to vis-timeline
  initialWindow?: { start: Date; end: Date };
};
```

---

## Behavior

### Grouping + labeling (current)

Current payload builder groups as:

- **Subsystem parent lane** (level 1): `VM` vs `System` (derived from `sourceFile`)
  - **Category lanes** (level 2): e.g. `Apps`, `GUI`, `Config`

Items:
- range item when `end` exists
- point item when `end` is absent

Severity is rendered via className hooks (color language) and optional HTML dot prefix.

### Selection + drilldown (current)

1. User clicks an item on the timeline.
2. `@prv/report-ui-svelte` emits `onItemClick(record)` for the clicked item.
3. Workspace maps `record.id` → `TimelineEvent.id` and sets `selectedEventId`.
4. If the event has `startRef`, the log viewer is asked to jump to that locator.
5. The details pane shows `TimelineEvent.detail` and provenance.

### Sizing contract (current)

Timeline height should be controlled by the parent container:

- timeline payload sets `options.height = '100%'`
- consumers must avoid fixed caps like `options.maxHeight = 400`
- the underlying `Timeline.svelte` wrapper redraws on container resize

### Scroll / zoom (current behavior; expected to evolve)

Current options enable:
- `zoomKey: 'ctrlKey'`
- `verticalScroll: true`

Implications:
- **Mouse wheel** scrolls the timeline vertically (lane list) when the cursor is over the timeline.
- **Ctrl + wheel** zooms in/out (browser-like zoom gesture).

---

## Configuration

### Timeline options (vis-timeline)

Current baseline options are defined in:
- `apps/web/src/lib/lab/log-timeline/buildCompactPayload.ts`

Rules:
- Prefer `height: '100%'` so resizable containers control the viewport height.
- Avoid fixed caps (`maxHeight`) in embedded layouts.
- Prefer additive changes to options (keep current UX stable unless explicitly changing behavior).

---

## Error Handling

| Error | Handling |
|---|---|
| Timeline payload missing / no selected logs | Timeline UI shows an empty/placeholder state (handled by `LogTimeline.svelte`) |
| Event click cannot be mapped to a `TimelineEvent` | No selection change |
| Event has no `startRef` | Details can still show; viewer jump is skipped |
| Viewer jump locator is outside indexed slice | Viewer shows a notice (workspace-level) |

---

## Future Enhancements (planned)

These are the next expected changes to align the timeline with our use-case:

- **Minimum visual width for short events**: ultra-short ranges should still be clickable and readable.
- **Wheel behavior**: wheel should primarily **zoom** (with a modifier for vertical scroll), not scroll lanes by default.
- **Zoom bounds**: define a maximum zoom-out window (overview) and a minimum zoom-in (precision).
- **Pan model**: horizontal panning should feel consistent with log viewer navigation.
- **Density controls**: compact vs readable lane heights; label visibility policies.
- **Selection sync**: optional highlight/scroll-to-event when the viewer jumps due to other interactions.

---

## Dependencies

- vis timeline wrapper: `packages/report-ui-svelte/src/ui/timeline/Timeline.svelte`
- timeline wrapper spec: `packages/report-ui-svelte/src/ui/timeline/SPEC.md`
- prototype goals (WIP): `docs/work-in-progress/log-workspace/LOG-TIMELINE-PROTOTYPE.md`
- shared workspace/controller: `apps/web/src/lib/lab/log-workspace/createLogWorkspace.svelte.ts`

---

## Status

**🔶 Outline** — prototype timeline is functional; behavior is expected to change as we refine zoom/scroll and event rendering rules.

