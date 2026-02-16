<script lang="ts">
  import Badge from '../ui/badge.svelte';
  import { FileText } from '@lucide/svelte';
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
  <div class="flex items-center gap-1.5 flex-wrap">
    {#each sources as src}
      <button
        type="button"
        class="inline-flex items-center gap-1"
        onclick={(e) => {
          e.stopPropagation();
          onOpen(src);
        }}
      >
        <Badge variant="outline" class="text-[10px] gap-1 px-1.5 py-0.5">
          <FileText class="h-3 w-3" />
          {#if src.kind === 'node'}
            {src.label ?? src.nodeKey}
          {:else}
            {src.label ?? src.filename}
          {/if}
        </Badge>
      </button>
    {/each}
  </div>
{/if}

