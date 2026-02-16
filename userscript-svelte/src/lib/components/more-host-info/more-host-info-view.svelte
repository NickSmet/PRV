<script lang="ts">
  import { Badge } from '$lib/components/ui/badge';
  import type { MoreHostInfoSummary } from '../../../services/parseMoreHostInfo';
  import { totalDisplays } from './more-host-info-utils';
  import MoreHostInfoGpuCard from './more-host-info-gpu-card.svelte';

  let { summary }: { summary: MoreHostInfoSummary } = $props();

  const gpus = $derived(summary.gpus ?? []);
  const displayTotal = $derived(totalDisplays(gpus));
</script>

<div class="space-y-3">
  <div class="flex items-center gap-2">
    <div class="text-[13px] font-semibold text-foreground">GPUs & Displays</div>
    <Badge variant="muted" class="text-[10px]">
      {gpus.length} GPU{gpus.length === 1 ? '' : 's'}
    </Badge>
    <Badge variant="muted" class="text-[10px]">
      {displayTotal} display{displayTotal === 1 ? '' : 's'}
    </Badge>
  </div>

  {#if gpus.length === 0}
    <div class="rv-empty">No GPU information available.</div>
  {:else}
    <div class="space-y-2">
      {#each gpus as gpu, idx (gpu.name + ':' + idx)}
        <MoreHostInfoGpuCard {gpu} />
      {/each}
    </div>
  {/if}
</div>

