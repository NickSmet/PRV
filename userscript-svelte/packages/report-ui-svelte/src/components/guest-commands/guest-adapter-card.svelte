<script lang="ts">
  import * as Collapsible from '../ui/collapsible';
  import { Badge } from '../ui/badge';
  import ChevronRight from '@lucide/svelte/icons/chevron-right';
  import type { GuestNetworkAdapter } from '@prv/report-core';
  import { adapterRole, roleBadgeClasses, roleLabel } from './guest-commands-utils';

  let { adapter }: { adapter: GuestNetworkAdapter } = $props();

  let open = $state(false);

  const role = $derived(adapterRole(adapter));
  const hasIp = $derived(Boolean(adapter.ip));
  const dotClass = $derived(hasIp ? 'bg-emerald-500' : 'bg-slate-300');

  const dhcpText = $derived(
    adapter.dhcpEnabled === undefined ? 'Unknown' : adapter.dhcpEnabled ? '✓ Enabled' : '✗ Disabled'
  );

  const dnsList = $derived(adapter.dns ?? []);
</script>

<div class="overflow-hidden rounded-xl border border-border bg-background">
  <Collapsible.Root bind:open>
    <Collapsible.Trigger class="flex w-full items-center gap-2 px-4 py-2.5 text-left select-none">
      <ChevronRight
        class={`size-4 text-muted-foreground transition-transform ${open ? 'rotate-90' : 'rotate-0'}`}
      />
      <span class={`size-2 rounded-full ${dotClass}`}></span>

      <span class={`text-[13px] font-semibold ${hasIp ? 'text-foreground' : 'text-muted-foreground'}`}>
        {adapter.name ?? 'Adapter'}
      </span>

      <Badge variant="outline" class={`text-[10px] ${roleBadgeClasses(role)}`}>
        {roleLabel(role)}
      </Badge>

      <span class="ml-auto font-mono text-[12px]">
        {#if adapter.ip}
          <span class="text-slate-700">{adapter.ip}</span>
        {:else}
          <span class="text-muted-foreground">No IP</span>
        {/if}
      </span>
    </Collapsible.Trigger>

    <Collapsible.Content class="border-t border-border/50 bg-muted/15 px-4 py-3">
      <div class="grid grid-cols-[90px_1fr] gap-x-3 gap-y-1 text-[12px]">
        <span class="text-muted-foreground/80 font-medium">Driver</span>
        <span class="font-mono text-foreground/80">{adapter.description ?? '—'}</span>

        {#if adapter.ip}
          <span class="text-muted-foreground/80 font-medium">IPv4</span>
          <span class="font-mono text-foreground/80">{adapter.ip}</span>
        {/if}

        {#if adapter.ipv6}
          <span class="text-muted-foreground/80 font-medium">IPv6</span>
          <span class="font-mono text-foreground/80 break-all">{adapter.ipv6}</span>
        {/if}

        {#if adapter.gateway}
          <span class="text-muted-foreground/80 font-medium">Gateway</span>
          <span class="font-mono text-foreground/80">{adapter.gateway}</span>
        {/if}

        <span class="text-muted-foreground/80 font-medium">DHCP</span>
        <span class="font-mono text-foreground/80">{dhcpText}</span>

        {#if dnsList.length > 0}
          <span class="text-muted-foreground/80 font-medium">DNS</span>
          <div class="flex flex-wrap gap-1.5">
            {#each dnsList as d (d)}
              <span class="rounded border border-border bg-muted/20 px-1.5 py-0.5 font-mono text-[11px] text-slate-700">
                {d}
              </span>
            {/each}
          </div>
        {/if}
      </div>
    </Collapsible.Content>
  </Collapsible.Root>
</div>

