<script lang="ts">
  import * as Collapsible from '../ui/collapsible';
  import { Badge } from '../ui/badge';
  import DenseChevron from '../dense/DenseChevron.svelte';
  import Wifi from '@lucide/svelte/icons/wifi';
  import Cable from '@lucide/svelte/icons/cable';

  import type { HostInfoSummary } from '@prv/report-core';

  let { adapter }: { adapter: HostInfoSummary['networkAdapters'][number] } = $props();

  let open = $state(false);

  const isUp = $derived(adapter.enabled === true);
  const ipv4 = $derived(adapter.addresses.ipv4);
  const ipv4Subnet = $derived(adapter.addresses.ipv4Subnet);
  const ipv6 = $derived(adapter.addresses.ipv6);
  const ipv6Prefix = $derived(adapter.addresses.ipv6Prefix);

  const statusVariant = $derived(isUp ? 'green' : 'destructive');
  const statusText = $derived(isUp ? 'Active' : 'Down');

</script>

<Collapsible.Root bind:open>
  <Collapsible.Trigger class="w-full">
    <div
      class={`flex items-center gap-1.5 py-[4px] px-1 pl-1 min-h-[26px] cursor-pointer select-none border-b border-slate-100
        ${open ? 'bg-slate-50/80' : 'bg-transparent'}
        hover:bg-slate-50/50`}
    >
      <DenseChevron {open} />
      {#if adapter.type === 'wifi'}
        <Wifi class="size-3 text-muted-foreground shrink-0 opacity-60" />
      {:else}
        <Cable class="size-3 text-muted-foreground shrink-0 opacity-60" />
      {/if}
      <span class="text-[11.5px] font-medium text-foreground truncate">{adapter.name}</span>
      <Badge variant={statusVariant} class="text-[9px]">{statusText}</Badge>
      <div class="flex-1"></div>
      <span class="font-mono text-[11px] shrink-0">
        {#if ipv4}
          <span class="text-foreground/70">{ipv4}</span>
        {:else}
          <span class="text-muted-foreground">No IPv4</span>
        {/if}
      </span>
    </div>
  </Collapsible.Trigger>

  <Collapsible.Content>
    <div class="py-1 px-2 pl-6 border-b border-slate-100 bg-slate-50/30">
      <div class="grid grid-cols-[80px_1fr] gap-x-2 gap-y-0.5 text-[11px]">
        <span class="text-muted-foreground font-medium">MAC</span>
        <span class="font-mono text-foreground/80">{adapter.mac ?? '—'}</span>

        {#if ipv4}
          <span class="text-muted-foreground font-medium">IPv4</span>
          <span class="font-mono text-foreground/80">{ipv4}{ipv4Subnet ? `/${ipv4Subnet}` : ''}</span>
        {/if}

        {#if ipv6}
          <span class="text-muted-foreground font-medium">IPv6</span>
          <span class="font-mono text-foreground/80 break-all">{ipv6}{ipv6Prefix ? `/${ipv6Prefix}` : ''}</span>
        {/if}

        <span class="text-muted-foreground font-medium">DHCP</span>
        <span class="font-mono text-foreground/80">
          {adapter.dhcp === null ? 'Unknown' : adapter.dhcp ? 'Enabled' : 'Static'}
        </span>

        <span class="text-muted-foreground font-medium">Interface</span>
        <span class="font-mono text-foreground/80">{adapter.identifier || '—'}</span>

        {#if adapter.vlanTag !== null}
          <span class="text-muted-foreground font-medium">VLAN</span>
          <span class="font-mono text-foreground/80">{adapter.vlanTag}</span>
        {/if}
      </div>
    </div>
  </Collapsible.Content>
</Collapsible.Root>
