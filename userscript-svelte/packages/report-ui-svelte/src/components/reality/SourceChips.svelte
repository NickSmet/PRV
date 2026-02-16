<script lang="ts">
  import type { RealitySourceRef } from '@prv/report-viewmodel';

  let {
    sources,
    onOpen
  }: {
    sources: RealitySourceRef[];
    onOpen: (src: RealitySourceRef) => void;
  } = $props();
</script>

{#if sources.length}
  <div class="flex items-center gap-px">
    {#each sources as src}
      <button
        type="button"
        class="inline-flex items-center px-1 h-4 text-[9px] font-mono font-medium text-zinc-400 hover:text-zinc-600 bg-transparent transition-colors"
        style="color: rgb(161 161 170) !important;"
        onmouseenter={(e) => (e.currentTarget.style.color = 'rgb(82 82 91) !important')}
        onmouseleave={(e) => (e.currentTarget.style.color = 'rgb(161 161 170) !important')}
        onclick={(e) => {
          e.stopPropagation();
          onOpen(src);
        }}
      >
        {#if src.kind === 'node'}
          {src.label ?? src.nodeKey}
        {:else}
          {src.label ?? src.filename}
        {/if}
      </button>
    {/each}
  </div>
{/if}
