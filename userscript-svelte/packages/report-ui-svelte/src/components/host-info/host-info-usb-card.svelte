<script lang="ts">
  import * as Collapsible from '../ui/collapsible';
  import { Badge } from '../ui/badge';
  import CopyButton from '../../ui/copy-button/copy-button.svelte';
  import DenseChevron from '../dense/DenseChevron.svelte';
  import Usb from '@lucide/svelte/icons/usb';

  import type { HostInfoSummary } from '@prv/report-core';
  import { usbSpeedLabel, usbSpeedVariant } from './host-info-utils';

  let { device }: { device: HostInfoSummary['usbDevices'][number] } = $props();

  let open = $state(false);

  const speedText = $derived(usbSpeedLabel(device.speed));
  const speedVariant = $derived(usbSpeedVariant(device.speed));
</script>

<Collapsible.Root bind:open>
  <Collapsible.Trigger class="w-full">
    <div
      class={`flex items-center gap-1.5 py-[4px] px-1 pl-1 min-h-[26px] cursor-pointer select-none border-b border-slate-100
        ${open ? 'bg-slate-50/80' : 'bg-transparent'}
        hover:bg-slate-50/50`}
    >
      <DenseChevron {open} />
      <Usb class="size-3 text-muted-foreground shrink-0 opacity-60" />
      <span class="text-[11.5px] font-medium text-foreground truncate">{device.name}</span>
      <Badge variant={speedVariant} class="text-[9px]">{speedText}</Badge>
      {#if device.vfSupported === true}
        <Badge variant="green" class="text-[9px]" title="Supported by macOS Virtualization Framework">Apple VF</Badge>
      {:else if device.vfSupported === false}
        <Badge variant="dim" class="text-[9px]" title="Not supported by macOS Virtualization Framework">No VF</Badge>
      {/if}
      <div class="flex-1"></div>
      {#if device.state}
        <span class="font-mono text-[10px] text-muted-foreground shrink-0">{device.state}</span>
      {/if}
    </div>
  </Collapsible.Trigger>

  <Collapsible.Content>
    <div class="py-1 px-2 pl-6 border-b border-slate-100 bg-slate-50/30 space-y-1">
      <div class="grid grid-cols-[70px_1fr] gap-x-2 gap-y-0.5 text-[11px]">
        <span class="text-muted-foreground font-medium">Vendor</span>
        <span class="font-mono text-foreground/80">{device.vendorId ?? '—'}</span>

        <span class="text-muted-foreground font-medium">Product</span>
        <span class="font-mono text-foreground/80">{device.productId ?? '—'}</span>

        <span class="text-muted-foreground font-medium">Location</span>
        <span class="font-mono text-foreground/80 break-all">{device.location ?? '—'}</span>

        <span class="text-muted-foreground font-medium">Serial</span>
        <span class="font-mono text-foreground/80 break-all">{device.serial ?? '—'}</span>
      </div>

      {#if device.rawUuid}
        <div class="flex items-center gap-1 text-[10px]">
          <span class="text-muted-foreground font-medium shrink-0">UUID</span>
          <CopyButton
            text={device.rawUuid}
            size="sm"
            variant="ghost"
            class="h-auto min-h-5 px-1 font-mono text-[10px] text-muted-foreground hover:text-foreground break-all text-left"
          >
            {device.rawUuid}
          </CopyButton>
        </div>
      {/if}
    </div>
  </Collapsible.Content>
</Collapsible.Root>
