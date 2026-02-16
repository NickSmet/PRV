<script lang="ts">
  import { Badge } from '../ui/badge';
  import Keyboard from '@lucide/svelte/icons/keyboard';
  import Mouse from '@lucide/svelte/icons/mouse';
  import SlidersHorizontal from '@lucide/svelte/icons/sliders-horizontal';
  import Gamepad2 from '@lucide/svelte/icons/gamepad-2';

  import type { HostInfoSummary } from '@prv/report-core';
  import { roleLabel, transportVariant } from './host-info-utils';

  let { device }: { device: HostInfoSummary['inputDevices'][number] } = $props();

  function iconFor(role: HostInfoSummary['inputDevices'][number]['role']) {
    switch (role) {
      case 'keyboard':
        return Keyboard;
      case 'mouse':
        return Mouse;
      case 'combo':
        return SlidersHorizontal;
      case 'gamepad':
        return Gamepad2;
      default:
        return SlidersHorizontal;
    }
  }

  const RoleIcon = $derived(iconFor(device.role));
</script>

<div class="flex items-center gap-1.5 py-[3px] border-b border-slate-50 last:border-b-0">
  <RoleIcon class="size-3 text-muted-foreground shrink-0 opacity-60" />
  <span class="truncate text-[11px] font-medium text-foreground">{device.name}</span>
  <Badge variant="dim" class="text-[9px]">{roleLabel(device.role)}</Badge>
  <Badge variant={transportVariant(device.transport)} class="text-[9px]">{device.transport}</Badge>
  <div class="flex-1"></div>
  <span class="font-mono text-[9px] text-muted-foreground shrink-0">
    {#if device.vendorId !== null}VID {device.vendorId}{/if}
    {#if device.productId !== null} PID {device.productId}{/if}
  </span>
</div>
