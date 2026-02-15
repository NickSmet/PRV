<script lang="ts">
  import type { DisplayInfo } from '@prv/report-core';
  import { computeDisplayMiniatures, resLabel } from './more-host-info-utils';

  let { displays }: { displays: DisplayInfo[] } = $props();

  const minis = $derived(computeDisplayMiniatures(displays));
</script>

<div class="flex items-end justify-center gap-3.5 bg-muted/15 px-4 pb-4 pt-5">
  {#each minis as d, idx (d.name + ':' + d.logicalWidth + 'x' + d.logicalHeight + ':' + (d.refreshRate ?? '') + ':' + idx)}
    <div class="flex flex-col items-center gap-1.5">
      <div
        class="relative flex flex-col items-center justify-center gap-0.5 rounded border shadow-sm"
        style:width={`${d.renderW}px`}
        style:height={`${d.renderH}px`}
        class:border-blue-500={d.builtin}
        class:bg-blue-50={d.builtin}
        class:border-slate-400={!d.builtin}
        class:bg-background={!d.builtin}
      >
        <span class={`font-mono font-bold ${d.renderW > 80 ? 'text-[10px]' : 'text-[8px]'} ${d.builtin ? 'text-blue-600' : 'text-slate-600'}`}>
          {resLabel(d.logicalWidth, d.logicalHeight)}
        </span>
        {#if d.refreshRate && d.renderW > 80}
          <span class="font-mono text-[8px] font-semibold text-emerald-600">{d.refreshRate}Hz</span>
        {/if}

        {#if d.builtin}
          <div
            class="absolute left-1/2 top-0 h-1 w-4 -translate-x-1/2 rounded-b bg-blue-600"
          ></div>
        {/if}
      </div>

      {#if !d.builtin}
        <div class="h-1.5 w-3 rounded-b bg-slate-300"></div>
      {/if}

      <span class="max-w-[220px] text-center text-[10px] font-medium text-muted-foreground">
        {d.builtin ? 'Built-in' : d.name}
      </span>
    </div>
  {/each}
</div>

