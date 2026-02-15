<script lang="ts">
  import { Badge } from '../ui/badge';
  import type { NetConfigSummary } from '@prv/report-core';
  import NetConfigCard from './net-config-card.svelte';

  let { summary }: { summary: NetConfigSummary } = $props();

  const networks = $derived(summary.networks ?? []);
  const kextlessMode = $derived(summary.kextlessMode ?? 'unknown');
</script>

<div class="space-y-4">
  <div>
    <div class="flex items-center gap-2">
      <div class="text-[13px] font-semibold text-foreground">Virtual Networks</div>
      <Badge variant="muted" class="text-[10px]">{networks.length}</Badge>
    </div>

    {#if kextlessMode !== 'unknown'}
      <div class="mt-1 text-[11px] text-muted-foreground font-mono">
        Kextless Mode: {kextlessMode}
      </div>
    {/if}
  </div>

  {#if networks.length === 0}
    <div class="rv-empty">No virtual networks parsed.</div>
  {:else}
    <div class="space-y-2">
      {#each networks as net, idx (net.name ?? `${net.networkType ?? 'net'}:${idx}`)}
        <NetConfigCard {net} index={idx} />
      {/each}
    </div>
  {/if}
</div>

