<script lang="ts">
  import * as Collapsible from '$lib/components/ui/collapsible';
  import { Badge } from '$lib/components/ui/badge';
  import ChevronRight from '@lucide/svelte/icons/chevron-right';
  import Wifi from '@lucide/svelte/icons/wifi';
  import Cable from '@lucide/svelte/icons/cable';

  import type { HostInfoSummary } from '../../../services/parseHostInfo';

  let { adapter }: { adapter: HostInfoSummary['networkAdapters'][number] } = $props();

  let open = $state(false);

  const isUp = $derived(adapter.enabled === true);
  const ipv4 = $derived(adapter.addresses.ipv4);
  const ipv4Subnet = $derived(adapter.addresses.ipv4Subnet);
  const ipv6 = $derived(adapter.addresses.ipv6);
  const ipv6Prefix = $derived(adapter.addresses.ipv6Prefix);

  const statusVariant = $derived(isUp ? 'success' : 'destructive');
  const statusText = $derived(isUp ? 'Active' : 'Down');
  const typeIcon = $derived(adapter.type === 'wifi' ? Wifi : Cable);
</script>

<div class="overflow-hidden rounded-xl border border-border bg-background">
  <Collapsible.Root bind:open>
    <Collapsible.Trigger class="flex w-full items-center gap-2 px-4 py-2.5 text-left select-none">
      <ChevronRight class={`size-4 text-muted-foreground transition-transform ${open ? 'rotate-90' : 'rotate-0'}`} />

      {@const Icon = typeIcon}
      <Icon class="size-4 text-muted-foreground" />

      <span class="text-[13px] font-semibold text-foreground truncate">
        {adapter.name}
      </span>

      <Badge variant={statusVariant} class="text-[10px]">{statusText}</Badge>

      <span class="ml-auto font-mono text-[12px]">
        {#if ipv4}
          <span class="text-foreground/80">{ipv4}</span>
        {:else}
          <span class="text-muted-foreground">No IPv4</span>
        {/if}
      </span>
    </Collapsible.Trigger>

    <Collapsible.Content class="border-t border-border/50 bg-muted/15 px-4 py-3">
      <div class="grid grid-cols-[90px_1fr] gap-x-3 gap-y-1 text-[12px]">
        <span class="text-muted-foreground/80 font-medium">MAC</span>
        <span class="font-mono text-foreground/80">{adapter.mac ?? '—'}</span>

        {#if ipv4}
          <span class="text-muted-foreground/80 font-medium">IPv4</span>
          <span class="font-mono text-foreground/80">{ipv4}{ipv4Subnet ? `/${ipv4Subnet}` : ''}</span>
        {/if}

        {#if ipv6}
          <span class="text-muted-foreground/80 font-medium">IPv6</span>
          <span class="font-mono text-foreground/80 break-all">{ipv6}{ipv6Prefix ? `/${ipv6Prefix}` : ''}</span>
        {/if}

        <span class="text-muted-foreground/80 font-medium">DHCP</span>
        <span class="font-mono text-foreground/80">
          {adapter.dhcp === null ? 'Unknown' : adapter.dhcp ? 'Enabled' : 'Static'}
        </span>

        <span class="text-muted-foreground/80 font-medium">Interface</span>
        <span class="font-mono text-foreground/80">{adapter.identifier || '—'}</span>

        {#if adapter.vlanTag !== null}
          <span class="text-muted-foreground/80 font-medium">VLAN</span>
          <span class="font-mono text-foreground/80">{adapter.vlanTag}</span>
        {/if}
      </div>
    </Collapsible.Content>
  </Collapsible.Root>
</div>

