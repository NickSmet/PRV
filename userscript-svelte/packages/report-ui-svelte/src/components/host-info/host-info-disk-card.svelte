<script lang="ts">
  import * as Collapsible from '../ui/collapsible';
  import { Badge } from '../ui/badge';
  import DenseChevron from '../dense/DenseChevron.svelte';
  import HardDrive from '@lucide/svelte/icons/hard-drive';

  import type { HostInfoSummary } from '@prv/report-core';
  import { fmtBytes } from './host-info-utils';

  let { disk }: { disk: HostInfoSummary['hardDisks'][number] } = $props();

  let open = $state(false);

  const partitions = $derived(disk.partitions ?? []);
  const sizeLabel = $derived(disk.sizeFormatted ?? fmtBytes(disk.sizeBytes));
  const isExternal = $derived(disk.external === true);
  const isVirtual = $derived(disk.isVirtualDisk === true);
  const parentStore = $derived(disk.parentStore);
</script>

<Collapsible.Root bind:open>
  <Collapsible.Trigger class="w-full">
    <div
      class={`flex items-center gap-1.5 py-[4px] px-1 pl-1 min-h-[26px] cursor-pointer select-none border-b border-slate-100
        ${open ? 'bg-slate-50/80' : 'bg-transparent'}
        hover:bg-slate-50/50`}
    >
      <DenseChevron {open} />
      <HardDrive class="size-3 text-muted-foreground shrink-0 opacity-60" />
      <span class="text-[11.5px] font-medium text-foreground truncate">{disk.name}</span>
      <Badge variant="outline" class="text-[9px]">{disk.partitionScheme}</Badge>
      {#if isExternal}
        <Badge variant="default" class="text-[9px]">External</Badge>
      {/if}
      {#if isVirtual}
        <Badge variant="dim" class="text-[9px]">Container</Badge>
      {/if}
      <div class="flex-1"></div>
      <span class="font-mono text-[11px] text-foreground/70 shrink-0">{sizeLabel}</span>
    </div>
  </Collapsible.Trigger>

  <Collapsible.Content>
    <div class="py-1 px-2 pl-6 border-b border-slate-100 bg-slate-50/30 space-y-1">
      <div class="grid grid-cols-[90px_1fr] gap-x-2 gap-y-0.5 text-[11px]">
        <span class="text-muted-foreground font-medium">Identifier</span>
        <span class="font-mono text-foreground/80">{disk.identifier || '—'}</span>

        {#if parentStore}
          <span class="text-muted-foreground font-medium">Backed by</span>
          <span class="font-mono text-foreground/80">/dev/{parentStore}</span>
        {/if}

        {#if disk.logicalSectorSize !== null}
          <span class="text-muted-foreground font-medium">Sector size</span>
          <span class="font-mono text-foreground/80">{disk.logicalSectorSize} bytes</span>
        {/if}

        {#if disk.removable !== null}
          <span class="text-muted-foreground font-medium">Removable</span>
          <span class="font-mono text-foreground/80">{disk.removable ? 'Yes' : 'No'}</span>
        {/if}
      </div>

      {#if partitions.length > 0}
        <div class="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground pt-0.5">
          Partitions ({partitions.length})
        </div>
        {#each partitions as p, idx (p.systemName ?? p.name + ':' + idx)}
          <div class="flex items-center gap-1.5 py-[2px] text-[11px]">
            <span class="font-mono text-[10px] text-muted-foreground shrink-0">
              {p.systemName ? p.systemName.split('/').pop() : '—'}
            </span>
            <span class="font-medium text-foreground truncate">{p.name}</span>
            {#if p.typeName}
              <Badge variant="dim" class="text-[9px]">{p.typeName}</Badge>
            {/if}
            <div class="flex-1"></div>
            <span class="font-mono text-[10px] text-foreground/70 shrink-0">{fmtBytes(p.sizeBytes)}</span>
            {#if p.freeSizeBytes !== null && p.freeSizeBytes >= 0}
              <span class="font-mono text-[10px] text-muted-foreground shrink-0">{fmtBytes(p.freeSizeBytes)} free</span>
            {/if}
          </div>
        {/each}
      {:else}
        <div class="text-[11px] text-muted-foreground">No partition data.</div>
      {/if}
    </div>
  </Collapsible.Content>
</Collapsible.Root>
