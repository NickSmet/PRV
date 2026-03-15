<script lang="ts">
  import { onMount } from 'svelte';
  import { DataSet, Timeline } from 'vis-timeline/standalone';
  // @ts-expect-error Vite resolves ?inline imports at build time.
  import timelineStyles from 'vis-timeline/styles/vis-timeline-graph2d.min.css?inline';

  import type { TimelinePayload, TimelineWindowEvent, VisCustomTime, VisGroup, VisItem } from './types';

  let {
    payload,
    payloadRevision = 0,
    onItemClick = () => {},
    onVisibleWindowChange,
    onUserWindowChange,
    wheelMode = 'native'
  }: {
    payload: TimelinePayload;
    payloadRevision?: number;
    onItemClick?: (item: unknown) => void;
    /** Fires on every visible-window change (including internal vis-timeline reflows). */
    onVisibleWindowChange?: (window: TimelineWindowEvent) => void;
    /**
     * Fires only when the window changes due to explicit user interaction
     * (wheel zoom or drag/pinch). Safe to use for clustering decisions
     * without risk of feedback loops from data-update reflows.
     */
    onUserWindowChange?: (window: TimelineWindowEvent) => void;
    /**
     * - native: keep vis-timeline's default wheel behavior (e.g. vertical lane scroll, ctrl+wheel zoom)
     * - zoom: wheel zooms time axis; shift+wheel scrolls lanes (if enabled in options)
     */
    wheelMode?: 'native' | 'zoom';
  } = $props();

  let container: HTMLDivElement | null = null;
  let timeline: Timeline | null = null;
  let groups: DataSet<VisGroup> | null = null;
  let items: DataSet<VisItem> | null = null;
  let initialized = false;
  let resizeObserver: ResizeObserver | null = null;
  let pendingRedraw = false;
  let wheelCleanup: (() => void) | null = null;
  let optionsRef: Record<string, unknown> = {};
  let customTimeIds = new Set<string | number>();
  const DEBUG_TIMELINE_WINDOW = true;
  const DEBUG_TIMELINE_PAYLOAD = true;
  let lastClusterLike = 0;
  /** Last window explicitly set by the user (wheel/drag). Used to restore after data updates. */
  let userIntendedWindow: { start: Date; end: Date } | null = null;

  function emitWindow(source: 'init' | 'rangechange' | 'rangechanged', start: Date, end: Date, isUserDriven: boolean) {
    const startMs = start.getTime();
    const endMs = end.getTime();
    if (DEBUG_TIMELINE_WINDOW) {
      console.info('[timeline-window] emit', {
        source,
        isUserDriven,
        spanMin: Math.round(Math.max(0, endMs - startMs) / 60000),
        startIso: new Date(startMs).toISOString(),
        endIso: new Date(endMs).toISOString()
      });
    }
    const windowEvent: TimelineWindowEvent = {
      start,
      end,
      startMs,
      endMs,
      spanMs: Math.max(0, endMs - startMs),
      source
    };
    onVisibleWindowChange?.(windowEvent);
    if (isUserDriven) {
      userIntendedWindow = { start, end };
      onUserWindowChange?.(windowEvent);
    }
  }

  function scheduleRedraw() {
    if (!timeline) return;
    if (pendingRedraw) return;
    pendingRedraw = true;
    window.requestAnimationFrame(() => {
      pendingRedraw = false;
      timeline?.redraw();
    });
  }

  function schedulePostToggleRedraw() {
    window.setTimeout(() => {
      scheduleRedraw();
      window.setTimeout(() => {
        scheduleRedraw();
      }, 50);
    }, 0);
  }

  function injectStylesIntoRoot() {
    if (!container) return;
    const root = container.getRootNode();

    // Tooltip overrides: vis-timeline uses white-space:nowrap which makes tooltips
    // expand horizontally without limit. Force wrapping and cap width.
    const tooltipOverrides = [
      '.vis-tooltip { max-width: 380px !important; white-space: normal !important;',
      '  word-break: break-word !important; box-sizing: border-box !important; }',
      '.vis-custom-time { background-color: #ea580c !important; width: 2px !important; cursor: default !important; z-index: 2 !important; }',
      '.vis-custom-time > .vis-custom-time-marker {',
      '  background-color: #fff7ed !important;',
      '  border: 1px solid #fdba74 !important;',
      '  border-radius: 4px !important;',
      '  color: #9a3412 !important;',
      '  font-size: 11px !important;',
      '  font-weight: 600 !important;',
      '  padding: 2px 6px !important;',
      '  top: 4px !important;',
      '}'
    ].join('\n');

    if (root instanceof ShadowRoot) {
      const hasStyle = root.querySelector('style[data-vis-timeline]');
      if (!hasStyle) {
        const styleEl = document.createElement('style');
        styleEl.dataset.visTimeline = 'true';
        styleEl.textContent = timelineStyles + '\n' + tooltipOverrides;
        root.appendChild(styleEl);
      }
    } else if (!document.head.querySelector('style[data-vis-timeline]')) {
      const styleEl = document.createElement('style');
      styleEl.dataset.visTimeline = 'true';
      styleEl.textContent = timelineStyles + '\n' + tooltipOverrides;
      document.head.appendChild(styleEl);
    }
  }

  function bindTimelineEvents(instance: Timeline) {
    instance.on('click', (props) => {
      if (props.what === 'group-label' && props.group != null) {
        schedulePostToggleRedraw();
      }
      if (!props.item) return;
      const record = items?.get(props.item);
      onItemClick(record);
    });

    instance.on('rangechange', (props: any) => {
      if (!props?.start || !props?.end) return;
      emitWindow('rangechange', props.start, props.end, !!props.byUser);
    });

    instance.on('rangechanged', (props: any) => {
      if (!props?.start || !props?.end) return;
      emitWindow('rangechanged', props.start, props.end, !!props.byUser);
    });
  }

  function syncCustomTimes(instance: Timeline, customTimes: VisCustomTime[] | undefined) {
    const timelineAny = instance as Timeline & {
      addCustomTime: (time: Date | string | number, id?: string | number) => string | number;
      removeCustomTime: (id?: string | number) => void;
      setCustomTime: (time: Date | string | number, id?: string | number) => void;
      setCustomTimeTitle: (title: string, id?: string | number) => void;
      setCustomTimeMarker: (title: string, id?: string | number, editable?: boolean) => void;
    };

    const nextCustomTimes = customTimes ?? [];
    const nextIds = new Set(nextCustomTimes.map((customTime) => customTime.id));

    for (const id of customTimeIds) {
      if (nextIds.has(id)) continue;
      timelineAny.removeCustomTime(id);
    }

    for (const customTime of nextCustomTimes) {
      if (customTimeIds.has(customTime.id)) {
        timelineAny.setCustomTime(customTime.time, customTime.id);
      } else {
        timelineAny.addCustomTime(customTime.time, customTime.id);
      }
      if (customTime.title) {
        timelineAny.setCustomTimeTitle(customTime.title, customTime.id);
      }
      if (customTime.marker) {
        timelineAny.setCustomTimeMarker(customTime.marker, customTime.id, false);
      }
    }

    customTimeIds = nextIds;
  }

  function recreateTimeline(nextPayload: TimelinePayload, preserveWindow: { start: Date; end: Date } | null) {
    if (!container) return;
    timeline?.destroy();
    customTimeIds = new Set();
    const nextGroups = new DataSet(nextPayload.groups);
    const nextItems = new DataSet(nextPayload.items);
    groups = nextGroups;
    items = nextItems;

    // Bake the intended window into the constructor options so vis-timeline
    // uses it from the very start. A post-construction setWindow() call is
    // unreliable because vis-timeline's async internal fit() can override it.
    const opts: Record<string, unknown> = { ...(nextPayload.options ?? {}) };
    if (preserveWindow) {
      opts.start = preserveWindow.start;
      opts.end = preserveWindow.end;
    }

    timeline = new Timeline(container, nextItems, nextGroups, opts);
    bindTimelineEvents(timeline);
    syncCustomTimes(timeline, nextPayload.customTimes);

    // After construction vis-timeline's internal DOM is inserted but the
    // browser hasn't performed layout yet. rAFs fire before the layout is
    // stable; setTimeout(0) fires after the current task + pending layout,
    // matching the timing of ResizeObserver callbacks (which is what reliably
    // triggers a correct redraw in practice).
    const tl = timeline;
    setTimeout(() => {
      if (timeline !== tl) return;
      tl.redraw();
      // Second pass in case the first measured stale dimensions (e.g. during
      // a flex/percent-height layout recalculation).
      setTimeout(() => {
        if (timeline !== tl) return;
        tl.redraw();
      }, 50);
    }, 0);
  }

  /**
   * Detect whether the group structure changed (different group IDs or count).
   * When groups are identical we can skip the expensive empty-data flush.
   */
  function groupsChanged(nextGroups: TimelinePayload['groups']): boolean {
    if (!groups) return true;
    const current = groups.getIds();
    if (current.length !== nextGroups.length) return true;
    const nextIds = new Set(nextGroups.map((g) => g.id));
    for (const id of current) {
      if (!nextIds.has(String(id))) return true;
    }
    return false;
  }

  function updateData(nextPayload: TimelinePayload) {
    if (!timeline) return;
    // Prefer the user-intended window over whatever vis-timeline currently reports
    // (which may already be polluted by a previous data-update reflow).
    const windowToPreserve = userIntendedWindow ?? timeline.getWindow();
    const nextClusterLike = nextPayload.items.filter((item) => String(item.id).startsWith('cluster:')).length;
    const structureChanged = groupsChanged(nextPayload.groups);
    lastClusterLike = nextClusterLike;

    const timelineAny = timeline as unknown as {
      setData?: (data: { items: DataSet<VisItem>; groups: DataSet<VisGroup> }) => void;
      setGroups?: (groups: DataSet<VisGroup>) => void;
      setItems?: (items: DataSet<VisItem>) => void;
    };

    // Only flush via empty-data when the group/item structure changes
    // significantly (e.g. cluster ↔ expand adds/removes groups).
    // When structure is stable (e.g. zooming within the same mode),
    // skip the flush to avoid the visual stacking collapse.
    if (structureChanged && typeof timelineAny.setData === 'function') {
      timelineAny.setData({ items: new DataSet([]), groups: new DataSet([]) });
    }

    const nextGroups = new DataSet(nextPayload.groups);
    const nextItems = new DataSet(nextPayload.items);
    groups = nextGroups;
    items = nextItems;

    if (typeof timelineAny.setData === 'function') {
      timelineAny.setData({ items: nextItems, groups: nextGroups });
    } else {
      timelineAny.setGroups?.(nextGroups);
      timelineAny.setItems?.(nextItems);
    }

    // Merge the intended window into setOptions so vis-timeline applies both
    // atomically. A separate setWindow() call can be overridden by async reflows.
    const opts: Record<string, unknown> = { ...(nextPayload.options ?? {}) };
    opts.start = windowToPreserve.start;
    opts.end = windowToPreserve.end;
    timeline.setOptions(opts);
    syncCustomTimes(timeline, nextPayload.customTimes);
    scheduleRedraw();

    if (DEBUG_TIMELINE_PAYLOAD) {
      const ids = nextPayload.items.slice(0, 3).map((item) => String(item.id));
      const clusterLike = nextClusterLike;
      console.info('[timeline-payload] updateData', {
        items: nextPayload.items.length,
        groups: nextPayload.groups.length,
        clusterLike,
        structureChanged,
        firstIds: ids,
        windowPreserved: !!userIntendedWindow
      });
    }
  }

  onMount(() => {
    if (!container) return;

    injectStylesIntoRoot();

    groups = new DataSet(payload.groups);
    items = new DataSet(payload.items);

    // Bake initialWindow into constructor options — same pattern as recreateTimeline.
    // A post-construction setWindow() is unreliable: vis-timeline's async internal
    // fit() fires after construction and can override it, leaving the view at the
    // full data extent instead of the desired initial window.
    const mountOpts: Record<string, unknown> = { ...(payload.options ?? {}) };
    if (payload.initialWindow) {
      mountOpts.start = payload.initialWindow.start;
      mountOpts.end = payload.initialWindow.end;
    }
    timeline = new Timeline(container, items, groups, mountOpts);
    optionsRef = mountOpts;
    customTimeIds = new Set();
    lastClusterLike = payload.items.filter((item) => String(item.id).startsWith('cluster:')).length;
    if (DEBUG_TIMELINE_PAYLOAD) {
      const ids = payload.items.slice(0, 3).map((item) => String(item.id));
      const clusterLike = payload.items.filter((item) => String(item.id).startsWith('cluster:')).length;
      console.info('[timeline-payload] mount', {
        items: payload.items.length,
        groups: payload.groups.length,
        clusterLike,
        firstIds: ids
      });
    }

    if (!payload.initialWindow) {
      timeline.fit({ animation: false });
    }

    syncCustomTimes(timeline, payload.customTimes);

    {
      const w = timeline.getWindow();
      // Init emission is treated as user-driven so the controller gets an initial
      // userIntendedWindow to base clustering decisions on.
      userIntendedWindow = { start: w.start, end: w.end };
      emitWindow('init', w.start, w.end, true);
    }

    bindTimelineEvents(timeline);

    if (wheelMode === 'zoom') {
      const handler = (event: WheelEvent) => {
        if (!timeline || !container) return;
        // Escape hatch: allow lane scrolling with Shift.
        if (event.shiftKey) return;

        event.preventDefault();
        event.stopPropagation();

        // Use userIntendedWindow as the source of truth for zoom calculations.
        // After a timeline recreation (e.g. cluster→expand), timeline.getWindow()
        // may return the auto-fitted range before setWindow takes effect, which
        // would cause the zoom to compute from the wrong base and re-trigger clustering.
        const windowRange = userIntendedWindow ?? timeline.getWindow();
        const startMs = windowRange.start.getTime();
        const endMs = windowRange.end.getTime();
        const rangeMs = Math.max(1, endMs - startMs);

        const props = timeline.getEventProperties(event);
        const anchorMs =
          props?.time instanceof Date
            ? props.time.getTime()
            : typeof props?.time === 'number'
              ? props.time
              : (startMs + endMs) / 2;

        const zoomMin = typeof optionsRef.zoomMin === 'number' ? (optionsRef.zoomMin as number) : null;
        const zoomMax = typeof optionsRef.zoomMax === 'number' ? (optionsRef.zoomMax as number) : null;

        const deltaMultiplier =
          event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 120 : 1; // line/page → px-ish
        const delta = event.deltaY * deltaMultiplier;

        // Smooth exponential scaling feels better across mice/trackpads.
        const scale = Math.exp(delta * 0.002); // >1 zoom out, <1 zoom in
        let nextRange = rangeMs * scale;
        if (zoomMin != null) nextRange = Math.max(zoomMin, nextRange);
        if (zoomMax != null) nextRange = Math.min(zoomMax, nextRange);

        const t = rangeMs > 0 ? (anchorMs - startMs) / rangeMs : 0.5;
        const clampedT = Math.max(0, Math.min(1, t));
        const nextStart = anchorMs - clampedT * nextRange;
        const nextEnd = nextStart + nextRange;

        timeline.setWindow(nextStart, nextEnd, { animation: false });
        // vis-timeline does not reliably emit rangechange/rangechanged for programmatic setWindow().
        // Emit the new window explicitly so consumers (e.g. clustering) can react deterministically.
        const nextStartDate = new Date(nextStart);
        const nextEndDate = new Date(nextEnd);
        emitWindow('rangechange', nextStartDate, nextEndDate, true);
        window.requestAnimationFrame(() => {
          emitWindow('rangechanged', nextStartDate, nextEndDate, true);
        });
      };

      container.addEventListener('wheel', handler, { passive: false, capture: true });
      wheelCleanup = () => container.removeEventListener('wheel', handler, true);
    }

    // Pane resize (via drag handles) doesn't trigger a window resize event, and
    // vis-timeline doesn't automatically re-measure height. Observe the container
    // so the timeline always fills the available vertical space.
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        scheduleRedraw();
      });
      resizeObserver.observe(container);
    }
    scheduleRedraw();

    return () => {
      wheelCleanup?.();
      wheelCleanup = null;
      resizeObserver?.disconnect();
      resizeObserver = null;
      timeline?.destroy();
      timeline = null;
      groups = null;
      items = null;
      customTimeIds = new Set();
    };
  });

  $effect(() => {
    if (!timeline) return;
    const revision = payloadRevision;
    // Skip the first run — onMount already initialized the data.
    // This prevents resetting vis-timeline's internal state (e.g. group collapse)
    // on every parent re-render.
    if (!initialized) {
      initialized = true;
      return;
    }
    optionsRef = (payload.options ?? {}) as unknown as Record<string, unknown>;
    if (DEBUG_TIMELINE_PAYLOAD) {
      console.info('[timeline-payload] effect', { revision });
    }
    updateData(payload);
  });
</script>

<div class="prv-timeline-container" bind:this={container}></div>

<style>
  .prv-timeline-container {
    height: 100%;
    min-height: 200px;
    width: 100%;
    background: hsl(var(--background));
    border: 1px solid hsl(var(--border));
    border-radius: 12px;
    overflow: hidden;
  }
</style>
