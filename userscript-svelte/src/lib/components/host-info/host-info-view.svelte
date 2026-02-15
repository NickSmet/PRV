<script lang="ts">
  import { Badge } from '$lib/components/ui/badge';
  import Bluetooth from '@lucide/svelte/icons/bluetooth';
  import Camera from '@lucide/svelte/icons/camera';
  import CreditCard from '@lucide/svelte/icons/credit-card';
  import HardDrive from '@lucide/svelte/icons/hard-drive';
  import Network from '@lucide/svelte/icons/network';
  import Printer from '@lucide/svelte/icons/printer';
  import Usb from '@lucide/svelte/icons/usb';

  import type { HostInfoSummary } from '../../../services/parseHostInfo';

  import HostInfoAudioSection from './host-info-audio-section.svelte';
  import HostInfoDiskCard from './host-info-disk-card.svelte';
  import HostInfoFlagsSummary from './host-info-flags-summary.svelte';
  import HostInfoInputDeviceRow from './host-info-input-device-row.svelte';
  import HostInfoNetworkCard from './host-info-network-card.svelte';
  import HostInfoSectionHeader from './host-info-section-header.svelte';
  import HostInfoSystemBanner from './host-info-system-banner.svelte';
  import HostInfoUsbCard from './host-info-usb-card.svelte';

  let { summary }: { summary: HostInfoSummary } = $props();

  const disks = $derived(summary.hardDisks ?? []);
  const adapters = $derived(summary.networkAdapters ?? []);
  const usbDevices = $derived(summary.usbDevices ?? []);
  const inputDevices = $derived(summary.inputDevices ?? []);
  const bluetoothDevices = $derived(summary.bluetoothDevices ?? []);
  const printers = $derived(summary.printers ?? []);
  const cameras = $derived(summary.cameras ?? []);
  const smartCardReaders = $derived(summary.smartCardReaders ?? []);
</script>

<div class="space-y-4">
  <HostInfoFlagsSummary flags={summary.flags} hasDisplayLink={summary.hasDisplayLink} />

  <HostInfoSystemBanner system={summary.system} />

  <div class="space-y-2">
    <HostInfoSectionHeader title="Storage" count={disks.length} Icon={HardDrive} />
    {#if disks.length === 0}
      <div class="rv-empty">No disks reported.</div>
    {:else}
      <div class="space-y-2">
        {#each disks as disk (disk.identifier || disk.name)}
          <HostInfoDiskCard {disk} />
        {/each}
      </div>
    {/if}
  </div>

  <div class="space-y-2">
    <HostInfoSectionHeader title="Network Adapters" count={adapters.length} Icon={Network} />
    {#if adapters.length === 0}
      <div class="rv-empty">No adapters reported.</div>
    {:else}
      <div class="space-y-2">
        {#each adapters as adapter, idx (adapter.identifier || adapter.name + ':' + idx)}
          <HostInfoNetworkCard {adapter} />
        {/each}
      </div>
    {/if}
  </div>

  <div class="space-y-2">
    <HostInfoSectionHeader title="USB Devices" count={usbDevices.length} Icon={Usb} />
    {#if usbDevices.length === 0}
      <div class="rv-empty">No USB devices reported.</div>
    {:else}
      <div class="space-y-2">
        {#each usbDevices as device, idx (device.rawUuid ?? device.name + ':' + idx)}
          <HostInfoUsbCard {device} />
        {/each}
      </div>
    {/if}
  </div>

  <HostInfoAudioSection audio={summary.audio} />

  <div class="space-y-2">
    <HostInfoSectionHeader title="Input Devices" count={inputDevices.length} />
    <div class="overflow-hidden rounded-xl border border-border bg-background">
      <div class="px-4 py-2.5">
        {#if inputDevices.length === 0}
          <div class="text-[12px] text-muted-foreground">No HID devices reported.</div>
        {:else}
          {#each inputDevices as device, idx (device.identifier || device.name + ':' + idx)}
            <HostInfoInputDeviceRow {device} />
          {/each}
        {/if}
      </div>
    </div>
  </div>

  {#if bluetoothDevices.length > 0}
    <div class="space-y-2">
      <HostInfoSectionHeader title="Bluetooth (Serial)" count={bluetoothDevices.length} Icon={Bluetooth} />
      <div class="overflow-hidden rounded-xl border border-border bg-background">
        <div class="px-4 py-2.5">
          {#each bluetoothDevices as d (d.port)}
            <div class="flex items-center gap-2 border-b border-border/50 py-2 last:border-b-0">
              <Bluetooth class="size-4 text-muted-foreground" />
              <span class="text-[12px] font-medium text-foreground">{d.name}</span>
              <span class="ml-auto font-mono text-[11px] text-muted-foreground">{d.port}</span>
            </div>
          {/each}
        </div>
      </div>
    </div>
  {/if}

  <div class="space-y-2">
    <HostInfoSectionHeader title="Printers" count={printers.length} Icon={Printer} />
    <div class="overflow-hidden rounded-xl border border-border bg-background">
      <div class="px-4 py-2.5">
        {#if printers.length === 0}
          <div class="text-[12px] text-muted-foreground">None detected.</div>
        {:else}
          {#each printers as p, idx (p.name + ':' + idx)}
            <div class="flex items-center gap-2 border-b border-border/50 py-2 last:border-b-0">
              <Printer class="size-4 text-muted-foreground" />
              <span class="text-[12px] font-medium text-foreground">{p.name}</span>
              {#if p.isDefault === true}
                <Badge variant="success" class="text-[10px] ml-auto">Default</Badge>
              {:else}
                <span class="ml-auto"></span>
              {/if}
            </div>
          {/each}
        {/if}
      </div>
    </div>
  </div>

  <div class="space-y-2">
    <HostInfoSectionHeader title="Cameras" count={cameras.length} Icon={Camera} />
    {#if cameras.length === 0}
      <div class="text-[12px] text-muted-foreground">No dedicated cameras reported.</div>
    {:else}
      <div class="overflow-hidden rounded-xl border border-border bg-background">
        <div class="px-4 py-2.5">
          {#each cameras as c, idx (c.name + ':' + idx)}
            <div class="flex items-center gap-2 border-b border-border/50 py-2 last:border-b-0">
              <Camera class="size-4 text-muted-foreground" />
              <span class="text-[12px] font-medium text-foreground">{c.name}</span>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>

  <div class="space-y-2">
    <HostInfoSectionHeader title="Smart Card Readers" count={smartCardReaders.length} Icon={CreditCard} />
    {#if smartCardReaders.length === 0}
      <div class="text-[12px] text-muted-foreground">None detected.</div>
    {:else}
      <div class="overflow-hidden rounded-xl border border-border bg-background">
        <div class="px-4 py-2.5">
          {#each smartCardReaders as r, idx (r.name + ':' + idx)}
            <div class="flex items-center gap-2 border-b border-border/50 py-2 last:border-b-0">
              <CreditCard class="size-4 text-muted-foreground" />
              <span class="text-[12px] font-medium text-foreground">{r.name}</span>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</div>

