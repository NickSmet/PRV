<script lang="ts">
  import { Badge } from '../ui/badge';
  import Bluetooth from '@lucide/svelte/icons/bluetooth';
  import Camera from '@lucide/svelte/icons/camera';
  import CreditCard from '@lucide/svelte/icons/credit-card';
  import HardDrive from '@lucide/svelte/icons/hard-drive';
  import Network from '@lucide/svelte/icons/network';
  import Printer from '@lucide/svelte/icons/printer';
  import Usb from '@lucide/svelte/icons/usb';

  import type { HostInfoSummary } from '@prv/report-core';

  import HostInfoAudioSection from './host-info-audio-section.svelte';
  import HostInfoDiskCard from './host-info-disk-card.svelte';
  import HostInfoCollapsibleSection from './host-info-collapsible-section.svelte';
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

  <HostInfoCollapsibleSection title="Storage devices" count={disks.length} Icon={HardDrive} openByDefault={false}>
    {#if disks.length === 0}
      <div class="rv-empty">No disks reported.</div>
    {:else}
      <div class="space-y-2">
        {#each disks as disk (disk.identifier || disk.name)}
          <HostInfoDiskCard {disk} />
        {/each}
      </div>
    {/if}
  </HostInfoCollapsibleSection>

  <HostInfoCollapsibleSection title="Network adapters" count={adapters.length} Icon={Network} openByDefault={false}>
    {#if adapters.length === 0}
      <div class="rv-empty">No adapters reported.</div>
    {:else}
      <div class="space-y-2">
        {#each adapters as adapter, idx (adapter.identifier || adapter.name + ':' + idx)}
          <HostInfoNetworkCard {adapter} />
        {/each}
      </div>
    {/if}
  </HostInfoCollapsibleSection>

  <HostInfoCollapsibleSection title="USB devices" count={usbDevices.length} Icon={Usb} openByDefault={false}>
    {#if usbDevices.length === 0}
      <div class="rv-empty">No USB devices reported.</div>
    {:else}
      <div class="space-y-2">
        {#each usbDevices as device, idx (device.rawUuid ?? device.name + ':' + idx)}
          <HostInfoUsbCard {device} />
        {/each}
      </div>
    {/if}
  </HostInfoCollapsibleSection>

  <HostInfoCollapsibleSection title="Audio" openByDefault={false}>
    {#snippet badges()}
      <Badge variant="muted" class="text-[10px]">{summary.audio.outputs.length} out</Badge>
      <Badge variant="muted" class="text-[10px]">{summary.audio.inputs.length} in</Badge>
    {/snippet}
    <HostInfoAudioSection audio={summary.audio} withHeader={false} />
  </HostInfoCollapsibleSection>

  <HostInfoCollapsibleSection title="Input devices" count={inputDevices.length} openByDefault={false}>
    {#if inputDevices.length === 0}
      <div class="text-[12px] text-muted-foreground">No HID devices reported.</div>
    {:else}
      {#each inputDevices as device, idx (device.identifier || device.name + ':' + idx)}
        <HostInfoInputDeviceRow {device} />
      {/each}
    {/if}
  </HostInfoCollapsibleSection>

  {#if bluetoothDevices.length > 0}
    <HostInfoCollapsibleSection title="Bluetooth (Serial)" count={bluetoothDevices.length} Icon={Bluetooth} openByDefault={false}>
      {#each bluetoothDevices as d (d.port)}
        <div class="flex items-center gap-2 border-b border-border/50 py-2 last:border-b-0">
          <Bluetooth class="size-4 text-muted-foreground" />
          <span class="text-[12px] font-medium text-foreground">{d.name}</span>
          <span class="ml-auto font-mono text-[11px] text-muted-foreground">{d.port}</span>
        </div>
      {/each}
    </HostInfoCollapsibleSection>
  {/if}

  <HostInfoCollapsibleSection title="Printers" count={printers.length} Icon={Printer} openByDefault={false}>
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
  </HostInfoCollapsibleSection>

  <HostInfoCollapsibleSection title="Cameras" count={cameras.length} Icon={Camera} openByDefault={false}>
    {#if cameras.length === 0}
      <div class="text-[12px] text-muted-foreground">No dedicated cameras reported.</div>
    {:else}
      {#each cameras as c, idx (c.name + ':' + idx)}
        <div class="flex items-center gap-2 border-b border-border/50 py-2 last:border-b-0">
          <Camera class="size-4 text-muted-foreground" />
          <span class="text-[12px] font-medium text-foreground">{c.name}</span>
        </div>
      {/each}
    {/if}
  </HostInfoCollapsibleSection>

  <HostInfoCollapsibleSection title="Smart Card Readers" count={smartCardReaders.length} Icon={CreditCard} openByDefault={false}>
    {#if smartCardReaders.length === 0}
      <div class="text-[12px] text-muted-foreground">None detected.</div>
    {:else}
      {#each smartCardReaders as r, idx (r.name + ':' + idx)}
        <div class="flex items-center gap-2 border-b border-border/50 py-2 last:border-b-0">
          <CreditCard class="size-4 text-muted-foreground" />
          <span class="text-[12px] font-medium text-foreground">{r.name}</span>
        </div>
      {/each}
    {/if}
  </HostInfoCollapsibleSection>
</div>
