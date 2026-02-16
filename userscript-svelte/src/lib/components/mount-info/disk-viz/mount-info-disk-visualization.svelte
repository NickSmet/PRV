<script lang="ts">
  import type { ParsedMountInfo } from '../../../../services/parseMountInfo';
  import MountInfoDiskCard from './mount-info-disk-card.svelte';
  import MountInfoShareCard from './mount-info-share-card.svelte';
  import { Badge } from '$lib/components/ui/badge';

  let { data }: { data: ParsedMountInfo } = $props();

  let significant = $derived(data.localDisks.filter((d) => d.significant));
  let minor = $derived(data.localDisks.filter((d) => !d.significant));
</script>

{#if data.meta.parseWarnings.length > 0}
  <div class="mb-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-[12px] text-amber-800">
    <div class="font-semibold">MountInfo parse warnings</div>
    <ul class="mt-1 list-disc pl-5">
      {#each data.meta.parseWarnings as w (w)}
        <li>{w}</li>
      {/each}
    </ul>
  </div>
{/if}

<!-- Header -->
<div class="mb-2">
  <div class="text-[13px] font-semibold text-foreground">Storage Overview</div>
  <div class="mt-0.5 text-[11px] text-muted-foreground">
    {data.localDisks.length} local disk{data.localDisks.length === 1 ? '' : 's'} ·
    {data.networkShares.length} network share{data.networkShares.length === 1 ? '' : 's'}
  </div>
</div>

<!-- Alerts -->
{#if data.alerts.hddFull || data.alerts.lowStorage || data.alerts.hasNtfs}
  <div class="mb-3 space-y-2">
    {#if data.alerts.hddFull}
      <div class="rounded-md border border-red-200 bg-red-50 p-3 text-[12px] text-red-700">
        Disk full — a local disk is at ≥ 99% capacity
      </div>
    {:else if data.alerts.lowStorage}
      <div class="rounded-md border border-amber-200 bg-amber-50 p-3 text-[12px] text-amber-700">
        Low storage — a local disk is at ≥ 90% capacity
      </div>
    {/if}
    {#if data.alerts.hasNtfs}
      <div class="rounded-md border border-amber-200 bg-amber-50 p-3 text-[12px] text-amber-700">
        NTFS volume detected — may cause macOS compatibility issues
      </div>
    {/if}
  </div>
{/if}

<!-- Local disks -->
<div class="mt-4 flex items-center gap-2">
  <div class="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Local Disks</div>
  <Badge variant="outline" class="text-[10px]">{data.localDisks.length}</Badge>
  <div class="h-px flex-1 bg-border/70"></div>
</div>

<div class="mt-2 space-y-2">
  {#each significant as disk (disk.diskId)}
    <MountInfoDiskCard {disk} />
  {/each}

  {#if minor.length > 0}
    <div class="rounded-xl border border-border bg-background p-4 text-[12px] text-muted-foreground">
      {minor.length} minor system disk{minor.length === 1 ? '' : 's'} hidden (not significant)
    </div>
  {/if}
</div>

<!-- Network shares -->
{#if data.networkShares.length > 0}
  <div class="mt-6 flex items-center gap-2">
    <div class="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Network Shares</div>
    <Badge variant="outline" class="text-[10px]">{data.networkShares.length}</Badge>
    <div class="h-px flex-1 bg-border/70"></div>
  </div>

  <div class="mt-2 space-y-2">
    {#each data.networkShares as share (share.shareId)}
      <MountInfoShareCard {share} />
    {/each}
  </div>
{/if}

