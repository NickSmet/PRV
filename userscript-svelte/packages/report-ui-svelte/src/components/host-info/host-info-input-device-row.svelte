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
  const roleTitle = $derived.by(() => {
    switch (device.role) {
      case 'combo':
        return 'Reports both keyboard and mouse functions';
      case 'keyboard':
        return 'Keyboard-like HID device';
      case 'mouse':
        return 'Mouse/pointing HID device';
      case 'gamepad':
        return 'Game controller HID device';
      default:
        return 'HID device role';
    }
  });

  const transportTitle = $derived.by(() => {
    switch (device.transport) {
      case 'FIFO':
        return 'FIFO: internal macOS transport (built-in device path)';
      case 'SPI':
        return 'SPI: internal bus (often built-in keyboards/trackpads)';
      case 'USB':
        return 'USB: physical USB device';
      case 'Bluetooth':
        return 'Bluetooth: wireless device';
      case 'Bluetooth Low Energy':
        return 'Bluetooth Low Energy: wireless device (BLE)';
      default:
        return 'Transport (from HostInfo.xml)';
    }
  });
</script>

<div class="flex items-center gap-2 border-b border-border/50 py-2 last:border-b-0">
  <RoleIcon class="size-4 text-muted-foreground" />
  <div class="min-w-0 flex-1">
    <div class="flex flex-wrap items-center gap-2">
      <span class="truncate text-[12px] font-medium text-foreground">{device.name}</span>
      <Badge variant="muted" class="text-[10px]" title={roleTitle}>{roleLabel(device.role)}</Badge>
      <Badge variant={transportVariant(device.transport)} class="text-[10px]" title={transportTitle}>
        {device.transport}
      </Badge>
    </div>
    <div class="mt-0.5 flex flex-wrap items-center gap-2 font-mono text-[10px] text-muted-foreground">
      {#if device.vendorId !== null}
        <span>VID {device.vendorId}</span>
      {/if}
      {#if device.productId !== null}
        <span>PID {device.productId}</span>
      {/if}
      {#if device.identifier}
        <span class="truncate">ID {device.identifier}</span>
      {/if}
    </div>
  </div>
</div>
