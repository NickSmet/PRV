<script lang="ts">
  import { Badge } from '$lib/components/ui/badge';
  import type { MountInfoSummary } from '../../../services/parseMountInfo';
  import MountInfoDiskVisualization from './disk-viz/mount-info-disk-visualization.svelte';

  let { summary }: { summary: MountInfoSummary } = $props();
</script>

<!-- <div class="rv-section-block">
  <div class="rv-section-heading">Overview</div>
  <div class="rv-row">
    <div class="rv-row-label">Volumes</div>
    <div class="rv-row-value">
      <span class="font-mono text-[11px] text-muted-foreground">{summary.volumes.length}</span>
    </div>
  </div>
  <div class="rv-row">
    <div class="rv-row-label">Status</div>
    <div class="rv-row-value">
      {#if summary.hddFull}
        <Badge variant="destructive" class="text-[11px]">HDD FULL</Badge>
      {:else if summary.lowStorage}
        <Badge variant="default" class="text-[11px]">Low storage</Badge>
      {:else}
        <Badge variant="success" class="text-[11px]">OK</Badge>
      {/if}
      {#if summary.hasNtfsVolumes}
        <Badge variant="secondary" class="ml-2 text-[11px]">NTFS detected</Badge>
      {/if}
    </div>
  </div>
</div> -->

{#if summary.parsed}
  <div class="rv-section-block">
    <!-- <div class="rv-section-heading">Visualization</div> -->
    <MountInfoDiskVisualization data={summary.parsed} />
  </div>
{/if}

