<script lang="ts">
  import { Badge } from '../ui/badge';
  import type { VmDirectorySummary } from '@prv/report-core';
  import VmDirectoryCard from './vm-directory-card.svelte';

  let { summary }: { summary: VmDirectorySummary } = $props();

  const vms = $derived(summary.vms ?? []);
  const now = $derived(new Date());
</script>

<div class="space-y-3">
  <div class="flex items-center gap-2">
    <div class="text-[13px] font-semibold text-foreground">Virtual Machines</div>
    <Badge variant="muted" class="text-[10px]">{vms.length}</Badge>
  </div>

  {#if vms.length === 0}
    <div class="rv-empty">No VMs found.</div>
  {:else}
    <div class="space-y-2">
      {#each vms as vm, idx (vm.uuid ?? `${vm.location ?? 'vm'}:${idx}`)}
        <VmDirectoryCard {vm} {now} />
      {/each}
    </div>
  {/if}
</div>

