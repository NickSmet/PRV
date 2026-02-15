<script lang="ts">
  import * as Collapsible from '../ui/collapsible';
  import { Badge } from '../ui/badge';
  import CopyButton from '../../ui/copy-button/copy-button.svelte';
  import ChevronRight from '@lucide/svelte/icons/chevron-right';
  import Usb from '@lucide/svelte/icons/usb';

  import type { HostInfoSummary } from '@prv/report-core';
  import { usbSpeedLabel, usbSpeedVariant } from './host-info-utils';

  let { device }: { device: HostInfoSummary['usbDevices'][number] } = $props();

  let open = $state(false);

  const speedText = $derived(usbSpeedLabel(device.speed));
  const speedVariant = $derived(usbSpeedVariant(device.speed));
</script>

<div class="overflow-hidden rounded-xl border border-border bg-background">
  <Collapsible.Root bind:open>
    <Collapsible.Trigger class="flex w-full items-center gap-2 px-4 py-2.5 text-left select-none">
      <ChevronRight class={`size-4 text-muted-foreground transition-transform ${open ? 'rotate-90' : 'rotate-0'}`} />
      <Usb class="size-4 text-muted-foreground" />

      <span class="text-[13px] font-semibold text-foreground truncate">
        {device.name}
      </span>

      <Badge variant={speedVariant} class="text-[10px]">{speedText}</Badge>
      {#if device.vfSupported === true}
        <Badge
          variant="success"
          class="text-[10px]"
          title="Supported by macOS Virtualization Framework (SupportedByVirtualizationFramework=1)"
        >
          Apple VF
        </Badge>
      {:else if device.vfSupported === false}
        <Badge
          variant="muted"
          class="text-[10px]"
          title="Not supported by macOS Virtualization Framework (SupportedByVirtualizationFramework=0)"
        >
          No Apple VF
        </Badge>
      {/if}

      {#if device.state}
        <span class="ml-auto font-mono text-[12px] text-muted-foreground">{device.state}</span>
      {/if}
    </Collapsible.Trigger>

    <Collapsible.Content class="border-t border-border/50 bg-muted/15 px-4 py-3 space-y-2">
      <div class="grid grid-cols-[90px_1fr] gap-x-3 gap-y-1 text-[12px]">
        <span class="text-muted-foreground/80 font-medium">Vendor</span>
        <span class="font-mono text-foreground/80">{device.vendorId ?? '—'}</span>

        <span class="text-muted-foreground/80 font-medium">Product</span>
        <span class="font-mono text-foreground/80">{device.productId ?? '—'}</span>

        <span class="text-muted-foreground/80 font-medium">Location</span>
        <span class="font-mono text-foreground/80 break-all">{device.location ?? '—'}</span>

        <span class="text-muted-foreground/80 font-medium">Serial</span>
        <span class="font-mono text-foreground/80 break-all">{device.serial ?? '—'}</span>
      </div>

      {#if device.rawUuid}
        <div>
          <div class="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Raw UUID</div>
          <CopyButton
            text={device.rawUuid}
            size="sm"
            variant="ghost"
            class="mt-1 h-auto min-h-6 px-2 font-mono text-[11px] text-muted-foreground hover:text-foreground whitespace-normal break-all text-left"
          >
            {device.rawUuid}
          </CopyButton>
        </div>
      {/if}
    </Collapsible.Content>
  </Collapsible.Root>
</div>
