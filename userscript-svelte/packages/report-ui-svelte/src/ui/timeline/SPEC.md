# Timeline (vis-timeline wrapper) Specification

## Overview

`packages/report-ui-svelte/src/ui/timeline/Timeline.svelte` is a Svelte 5 (runes mode) wrapper around `vis-timeline/standalone`.
It provides a **Shadow DOM-safe** timeline primitive that:

- renders a timeline from a payload (`groups`, `items`, `options`, optional `initialWindow`)
- injects `vis-timeline` CSS into the correct root (document or shadow root)
- forwards item clicks to the consumer via `onItemClick`
- redraws on container resize (e.g. resizable pane drag)

**Key principle:** this module is a **rendering primitive**. It does not know about logs, report IDs, or event taxonomies.

---

## Architecture

```
Consumer (apps/web or userscript)
  └─ builds TimelinePayload (groups/items/options/initialWindow)
     └─ <Timeline payload onItemClick />
        ├─ injects vis-timeline CSS into root
        ├─ creates DataSet(groups) + DataSet(items)
        ├─ creates new vis Timeline(container, items, groups, options)
        ├─ sets initial window (setWindow) or fits
        └─ observes container resize → timeline.redraw()
```

---

## Interfaces

### Public props

```ts
export type TimelinePayload = {
  groups: Array<Record<string, unknown> & { id: string | number; content?: string }>;
  items: Array<
    Record<string, unknown> & {
      id: string | number;
      content?: string;
      start: Date | string | number;
      end?: Date | string | number;
    }
  >;
  options?: import('vis-timeline/standalone').TimelineOptions;
  initialWindow?: { start: string | number | Date; end: string | number | Date };
};

// Svelte component props
payload: TimelinePayload
onItemClick?: (item: unknown) => void
```

### Styling hooks

Consumers can provide:
- `group.className` to style lanes
- `item.className` to style events

The timeline root element is:
- `div.prv-timeline-container`

---

## Behavior

### Initialization (mount)

1. Inject `vis-timeline` CSS into the correct root:
   - if the component is mounted in a shadow root, inject into that shadow root
   - otherwise inject into `document.head`
2. Create `DataSet` instances from `payload.groups` and `payload.items`.
3. Create the `vis-timeline` instance with the provided `payload.options`.
4. Apply viewport:
   - if `payload.initialWindow` exists, call `timeline.setWindow(start, end, { animation: false })`
   - else call `timeline.fit({ animation: false })`
5. Attach `click` handler:
   - when an item is clicked, look up its record via `items.get(props.item)` and call `onItemClick(record)`
6. Observe container resize and call `timeline.redraw()` on changes (throttled via `requestAnimationFrame`).

### Updates (payload changes)

On subsequent payload changes (after the first mount):

1. Clear and repopulate groups/items datasets.
2. Call `timeline.setOptions(payload.options ?? {})`.

**Important:** the initial mount intentionally avoids re-initializing the timeline instance to preserve internal state (e.g., group collapse).

### Sizing / layout contract

`vis-timeline` may apply its own sizing rules based on options.

**Consumer requirement:** if the timeline must resize with its container (e.g. resizable panes), the payload should:

- set `options.height = '100%'`
- avoid fixed caps such as `options.maxHeight = 400`

The container element itself is styled to `height: 100%` and expects a parent that provides a concrete height.

---

## Configuration

This wrapper passes `payload.options` through to `vis-timeline`.

Common options used by consumers:
- `height`: recommended `'100%'` when embedded in a resizable container
- `zoomKey`: e.g. `'ctrlKey'`
- `verticalScroll`: when enabled, mouse wheel can scroll the timeline vertically
- `minZoom` / `maxZoom`: constrain zoom range for UX
- `zoomMin` / `zoomMax`: additional range-related constraints (depending on vis version)

---

## Error Handling

| Error | Handling |
|---|---|
| Invalid payload shape / invalid `vis-timeline` options | `vis-timeline` may throw during construction; the error propagates to the caller |
| Missing `ResizeObserver` (older env) | Resize observation is skipped; timeline still renders |

---

## Examples

### Minimal usage

```svelte
<script lang="ts">
  import { Timeline, type TimelinePayload } from '@prv/report-ui-svelte';

  const payload: TimelinePayload = {
    groups: [{ id: 'g1', content: 'Group 1' }],
    items: [{ id: 'i1', group: 'g1', start: new Date(), content: 'Event' }],
    options: { height: '100%', zoomKey: 'ctrlKey' }
  };
</script>

<div style="height: 360px;">
  <Timeline {payload} onItemClick={(item) => console.log(item)} />
</div>
```

---

## Dependencies

- `vis-timeline/standalone`
- Consumer payload builders (e.g. `apps/web/src/lib/lab/log-timeline/buildCompactPayload.ts`)

---

## Status

**🔶 Outline** — stable primitive used by lab timelines; expect additive improvements as timeline UX is customized.

## Related Specifications

- Timeline prototype / UX target (WIP): `docs/work-in-progress/log-workspace/LOG-TIMELINE-PROTOTYPE.md`
- Web lab workspace orchestration: `apps/web/src/lib/lab/log-workspace/` (see WIP folder in docs)

