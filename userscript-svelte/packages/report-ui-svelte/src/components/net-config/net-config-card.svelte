<script lang="ts">
  import * as Collapsible from '../ui/collapsible';
  import { Badge } from '../ui/badge';
  import ChevronRight from '@lucide/svelte/icons/chevron-right';
  import type { VirtualNetwork } from '@prv/report-core';
  import { isEnabled, maskSuffix, netTypeLong, netTypeShort } from './net-config-utils';

  let { net, index }: { net: VirtualNetwork; index: number } = $props();

  let open = $state(false);

  const typeShort = $derived(netTypeShort(net));
  const typeLong = $derived(netTypeLong(typeShort));

  const hasDhcpIp = $derived(Boolean(net.dhcpIp));
  const dotClass = $derived(hasDhcpIp ? 'bg-emerald-500' : 'bg-slate-300');

  const netMaskSuffix = $derived(maskSuffix(net.netMask));

  const dhcpEnabled = $derived(isEnabled(net.dhcpEnabled));
  const dhcpV6Enabled = $derived(isEnabled(net.dhcpV6Enabled));

  function typeBadgeClass(t: string): string {
    if (t === 'Shared') return 'border-blue-200 bg-blue-50 text-blue-700';
    if (t === 'Host-Only') return 'border-violet-200 bg-violet-50 text-violet-700';
    if (t === 'Bridged') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    return 'border-border bg-muted/20 text-muted-foreground';
  }

  function enabledText(v: boolean | null): string {
    if (v === true) return '✓ Enabled';
    if (v === false) return '✗ Disabled';
    return 'Unknown';
  }

  function enabledClass(v: boolean | null): string {
    if (v === true) return 'text-emerald-700';
    if (v === false) return 'text-rose-700';
    return 'text-muted-foreground';
  }
</script>

<div class="overflow-hidden rounded-xl border border-border bg-background">
  <Collapsible.Root bind:open>
    <Collapsible.Trigger class="flex w-full items-center gap-2 px-4 py-2.5 text-left select-none">
      <ChevronRight
        class={`size-4 text-muted-foreground transition-transform ${open ? 'rotate-90' : 'rotate-0'}`}
      />
      <span class={`size-2 rounded-full ${dotClass}`}></span>

      <span class="text-[13px] font-semibold text-foreground">
        {net.name ?? `Network ${index + 1}`}
      </span>

      <Badge variant="outline" class={`text-[10px] ${typeBadgeClass(typeShort)}`}>
        {typeShort}
      </Badge>

      <span class="ml-auto font-mono text-[12px]">
        {#if net.dhcpIp}
          <span class="text-slate-700">{net.dhcpIp}</span>
        {:else}
          <span class="text-muted-foreground">No IP</span>
        {/if}
        {#if netMaskSuffix}
          <span class="text-muted-foreground"> / {netMaskSuffix}</span>
        {/if}
      </span>
    </Collapsible.Trigger>

    <Collapsible.Content class="border-t border-border/50 bg-muted/15 px-4 py-3">
      <div class="grid grid-cols-[110px_1fr] gap-x-3 gap-y-1 text-[12px]">
        <span class="text-muted-foreground/80 font-medium">Type</span>
        <span class="font-mono text-foreground/80">{typeLong}</span>

        <span class="text-muted-foreground/80 font-medium">DHCP IP</span>
        <span class="font-mono text-foreground/80">{net.dhcpIp ?? '—'}</span>

        <span class="text-muted-foreground/80 font-medium">Net Mask</span>
        <span class="font-mono text-foreground/80">{net.netMask ?? '—'}</span>

        <span class="text-muted-foreground/80 font-medium">Host IP</span>
        <span class="font-mono text-foreground/80">{net.hostIp ?? '—'}</span>

        <span class="text-muted-foreground/80 font-medium">DHCP</span>
        <span class={`font-mono ${enabledClass(dhcpEnabled)}`}>{enabledText(dhcpEnabled)}</span>

        <span class="text-muted-foreground/80 font-medium">IPv6 DHCP</span>
        <span class={`font-mono ${enabledClass(dhcpV6Enabled)}`}>{enabledText(dhcpV6Enabled)}</span>
      </div>
    </Collapsible.Content>
  </Collapsible.Root>
</div>

