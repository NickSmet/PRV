<script lang="ts">
  import * as Collapsible from '$lib/components/ui/collapsible';
  import { Badge } from '$lib/components/ui/badge';
  import ChevronRight from '@lucide/svelte/icons/chevron-right';
  import HardDrive from '@lucide/svelte/icons/hard-drive';

  import type { HostInfoSummary } from '../../../services/parseHostInfo';
  import { fmtBytes } from './host-info-utils';

  let { disk }: { disk: HostInfoSummary['hardDisks'][number] } = $props();

  let open = $state(false);

  const partitions = $derived(disk.partitions ?? []);
  const sizeLabel = $derived(disk.sizeFormatted ?? fmtBytes(disk.sizeBytes));
  const isExternal = $derived(disk.external === true);
  const isVirtual = $derived(disk.isVirtualDisk === true);
  const parentStore = $derived(disk.parentStore);
  const schemeTitle = $derived(() => {
    switch (disk.partitionScheme) {
      case 'GPT':
        return 'GPT (GUID Partition Table)';
      case 'MBR':
        return 'MBR (Master Boot Record)';
      case 'APFS':
        return 'APFS container / synthesized disk';
      default:
        return 'Partition scheme';
    }
  });
</script>

<div class="overflow-hidden rounded-xl border border-border bg-background">
  <Collapsible.Root bind:open>
    <Collapsible.Trigger class="flex w-full items-center gap-2 px-4 py-2.5 text-left select-none">
      <ChevronRight class={`size-4 text-muted-foreground transition-transform ${open ? 'rotate-90' : 'rotate-0'}`} />

      <HardDrive class="size-4 text-muted-foreground" />

      <span class="text-[13px] font-semibold text-foreground truncate">
        {disk.name}
      </span>

      <Badge variant="outline" class="text-[10px]" title={schemeTitle}>
        {disk.partitionScheme}
      </Badge>
      {#if isExternal}
        <Badge variant="default" class="text-[10px]">External</Badge>
      {/if}
      {#if isVirtual}
        <Badge variant="secondary" class="text-[10px]">Container</Badge>
      {/if}

      <span class="ml-auto font-mono text-[12px] text-foreground/80">
        {sizeLabel}
      </span>
    </Collapsible.Trigger>

    <Collapsible.Content class="border-t border-border/50 bg-muted/15 px-4 py-3 space-y-2">
      <div class="grid grid-cols-[110px_1fr] gap-x-3 gap-y-1 text-[12px]">
        <span class="text-muted-foreground/80 font-medium">Identifier</span>
        <span class="font-mono text-foreground/80">{disk.identifier || '—'}</span>

        {#if parentStore}
          <span class="text-muted-foreground/80 font-medium">Backed by</span>
          <span class="font-mono text-foreground/80">/dev/{parentStore}</span>
        {/if}

        {#if disk.logicalSectorSize !== null}
          <span class="text-muted-foreground/80 font-medium">Sector size</span>
          <span class="font-mono text-foreground/80">{disk.logicalSectorSize} bytes</span>
        {/if}

        {#if disk.removable !== null}
          <span class="text-muted-foreground/80 font-medium">Removable</span>
          <span class="font-mono text-foreground/80">{disk.removable ? 'Yes' : 'No'}</span>
        {/if}
      </div>

      {#if partitions.length > 0}
        <div class="pt-1">
          <div class="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Partitions ({partitions.length})
          </div>
          <div class="mt-2 space-y-1">
            {#each partitions as p, idx (p.systemName ?? p.name + ':' + idx)}
              <div class="flex items-center gap-2 rounded-md border border-border/50 bg-background px-3 py-2">
                <span class="min-w-0 flex-1">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="font-mono text-[11px] text-muted-foreground">
                      {p.systemName ? p.systemName.split('/').pop() : '—'}
                    </span>
                    <span class="text-[12px] font-medium text-foreground">{p.name}</span>
                    {#if p.typeName}
                      <Badge variant="muted" class="text-[10px]">{p.typeName}</Badge>
                    {/if}
                  </div>
                  {#if p.gptType}
                    <div class="mt-0.5 font-mono text-[10px] text-muted-foreground break-all">{p.gptType}</div>
                  {/if}
                </span>

                <span class="ml-auto flex flex-col items-end gap-0.5">
                  <span class="font-mono text-[11px] text-foreground/80">{fmtBytes(p.sizeBytes)}</span>
                  {#if p.freeSizeBytes !== null && p.freeSizeBytes >= 0}
                    <span class="font-mono text-[10px] text-muted-foreground">{fmtBytes(p.freeSizeBytes)} free</span>
                  {/if}
                </span>
              </div>
            {/each}
          </div>
        </div>
      {:else}
        <div class="text-[12px] text-muted-foreground">No partition data.</div>
      {/if}
    </Collapsible.Content>
  </Collapsible.Root>
</div>
