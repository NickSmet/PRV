<script lang="ts">
  import { onMount } from 'svelte';
  import { DataSet, Timeline, type TimelineOptions } from 'vis-timeline/standalone';
  import timelineStyles from 'vis-timeline/styles/vis-timeline-graph2d.min.css?inline';

  type VisGroup = Record<string, unknown> & { id: string | number; content?: string };
  type VisItem = Record<string, unknown> & { id: string | number; content?: string; start: Date | string | number; end?: Date | string | number };

  export type TimelinePayload = {
    groups: VisGroup[];
    items: VisItem[];
    options?: TimelineOptions;
    initialWindow?: { start: string | number | Date; end: string | number | Date };
  };

  let { payload, onItemClick = () => {} }: {
    payload: TimelinePayload;
    onItemClick?: (item: unknown) => void;
  } = $props();

  let container: HTMLDivElement | null = null;
  let timeline: Timeline | null = null;
  let groups: DataSet | null = null;
  let items: DataSet | null = null;

  function injectStylesIntoRoot() {
    if (!container) return;
    const root = container.getRootNode();

    if (root instanceof ShadowRoot) {
      const hasStyle = root.querySelector('style[data-vis-timeline]');
      if (!hasStyle) {
        const styleEl = document.createElement('style');
        styleEl.dataset.visTimeline = 'true';
        styleEl.textContent = timelineStyles;
        root.appendChild(styleEl);
      }
    } else if (!document.head.querySelector('style[data-vis-timeline]')) {
      const styleEl = document.createElement('style');
      styleEl.dataset.visTimeline = 'true';
      styleEl.textContent = timelineStyles;
      document.head.appendChild(styleEl);
    }
  }

  function updateData(nextPayload: TimelinePayload) {
    groups?.clear();
    items?.clear();
    groups?.add(nextPayload.groups);
    items?.add(nextPayload.items);
    timeline?.setOptions(nextPayload.options ?? {});
  }

  onMount(() => {
    if (!container) return;

    injectStylesIntoRoot();

    groups = new DataSet(payload.groups);
    items = new DataSet(payload.items);
    timeline = new Timeline(container, items, groups, payload.options ?? {});

    if (payload.initialWindow) {
      const { start, end } = payload.initialWindow;
      timeline.setWindow(start, end, { animation: false });
    } else {
      timeline.fit({ animation: false });
    }

    timeline.on('click', (props) => {
      if (!props.item) return;
      const record = items?.get(props.item);
      onItemClick(record);
    });

    return () => {
      timeline?.destroy();
      timeline = null;
      groups = null;
      items = null;
    };
  });

  $effect(() => {
    if (!timeline) return;
    updateData(payload);
  });
</script>

<div class="prv-timeline-container" bind:this={container}></div>

<style>
  .prv-timeline-container {
    min-height: 420px;
    width: 100%;
    background: hsl(var(--background));
    border: 1px solid hsl(var(--border));
    border-radius: 12px;
    overflow: hidden;
  }
</style>

