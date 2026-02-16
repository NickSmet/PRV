<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { DataSet, Timeline, type TimelineOptions } from 'vis-timeline/standalone';
  import timelineStyles from 'vis-timeline/styles/vis-timeline-graph2d.min.css?inline';

  export interface TimelinePayload {
    groups: any[];
    items: any[];
    options?: TimelineOptions;
    initialWindow?: { start: string | number | Date; end: string | number | Date };
  }

  export let payload: TimelinePayload;
  export let onItemClick: (item: any) => void = () => {};

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
    groups?.update(nextPayload.groups);
    items?.update(nextPayload.items);
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

  $: if (timeline) {
    updateData(payload);
  }

  onDestroy(() => timeline?.destroy());
</script>

<div class="timeline-container" bind:this={container}></div>

<style>
  .timeline-container {
    min-height: 380px;
    width: 100%;
    background: #fff;
    border: 1px solid #e3e3e3;
    border-radius: 12px;
    overflow: hidden;
  }
</style>
