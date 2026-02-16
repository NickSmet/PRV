<script lang="ts">
  import { Badge } from '../ui/badge';
  import CopyButton from '../../ui/copy-button/copy-button.svelte';
  import Laptop from '@lucide/svelte/icons/laptop';
  import Monitor from '@lucide/svelte/icons/monitor';
  import ShieldAlert from '@lucide/svelte/icons/shield-alert';

  import type { HostInfoSummary, ParsedMountInfoDisk } from '@prv/report-core';
  import { fmtMb, fmtBytes } from './host-info-utils';

  let { system, systemDisk, mountInfoDisk }: {
    system: HostInfoSummary['system'];
    systemDisk?: { name: string; sizeBytes: number | null; freeBytes: number | null; partitionScheme: string };
    mountInfoDisk?: ParsedMountInfoDisk;
  } = $props();

  const osLabel = $derived(
    system.os.displayString ??
      (system.os.name && system.os.version ? `${system.os.name} ${system.os.version}` : null)
  );

  const memory = $derived(system.memory);
  const live = $derived(memory.live);
  const hostRamMb = $derived(memory.hostRamMb);

  const activeWiredRatio = $derived.by(() => {
    if (!live || !hostRamMb) return null;
    const active = live.activeMb ?? 0;
    const wired = live.wiredMb ?? 0;
    return (active + wired) / hostRamMb;
  });
  const isLowMemory = $derived((activeWiredRatio ?? 0) >= 0.85);

  const otherMb = $derived.by(() => {
    if (!live || !hostRamMb) return null;
    const active = live.activeMb ?? 0;
    const wired = live.wiredMb ?? 0;
    const inactive = live.inactiveMb ?? 0;
    const free = live.freeMb ?? 0;
    const other = hostRamMb - active - wired - inactive - free;
    return other > 0 ? other : 0;
  });

  const memSegments = $derived.by(() => {
    if (!live || !hostRamMb) return [];
    return [
      { label: 'Active', mb: live.activeMb, class: 'bg-sky-500' },
      { label: 'Wired', mb: live.wiredMb, class: 'bg-indigo-500' },
      { label: 'Inactive', mb: live.inactiveMb, class: 'bg-slate-300' },
      { label: 'Other', mb: otherMb ?? 0, class: 'bg-slate-200' }
    ];
  });

  // MountInfo disk segments (colored per volume, matching RAM bar style)
  type DiskSeg = { key: string; label: string; pct: number; color: string; gi: number };
  const diskSegments = $derived.by((): DiskSeg[] => {
    if (!mountInfoDisk) return [];
    const container = mountInfoDisk.containerSizeGi || 0;
    if (container <= 0) return [];
    const usedTotal = mountInfoDisk.volumes.reduce((s, v) => s + (v.usedGi || 0), 0);
    const overhead = Math.max(0, container - (mountInfoDisk.freeGi || 0) - usedTotal);
    const segs: DiskSeg[] = mountInfoDisk.volumes
      .filter((v) => (v.usedGi || 0) > 0)
      .map((v) => ({
        key: v.id,
        label: v.label,
        gi: v.usedGi,
        pct: (v.usedGi / container) * 100,
        color: v.color
      }));
    if (overhead > 0.5) {
      segs.push({ key: 'overhead', label: 'Overhead', gi: overhead, pct: (overhead / container) * 100, color: '#CBD5E1' });
    }
    return segs;
  });
  const diskIsHigh = $derived(mountInfoDisk ? mountInfoDisk.capacityPercent >= 80 : (diskUsagePercentFallback ?? 0) >= 80);

  function fmtGi(gi: number): string {
    if (gi >= 1024) return `${(gi / 1024).toFixed(1)} TB`;
    if (gi >= 1) return `${Math.round(gi)} GB`;
    return `${Math.round(gi * 1024)} MB`;
  }

  // Fallback disk usage (from HostInfo data when no MountInfo)
  const diskUsedBytesFallback = $derived.by(() => {
    if (!systemDisk?.sizeBytes || systemDisk.freeBytes === null) return null;
    return systemDisk.sizeBytes - (systemDisk.freeBytes ?? 0);
  });
  const diskUsagePercentFallback = $derived.by(() => {
    if (!systemDisk?.sizeBytes || systemDisk.freeBytes === null) return null;
    return Math.round(((systemDisk.sizeBytes - (systemDisk.freeBytes ?? 0)) / systemDisk.sizeBytes) * 100);
  });

  const privacyRestricted = $derived(system.privacy.cameraAllowed === false || system.privacy.microphoneAllowed === false);
</script>

<div class="border-b border-slate-100 pb-1">
  <!-- Row 1: CPU + badges -->
  <div class="flex flex-wrap items-center gap-1.5 py-1 px-1">
    <span class="text-muted-foreground shrink-0">
      {#if system.isNotebook}
        <Laptop class="size-3.5" />
      {:else}
        <Monitor class="size-3.5" />
      {/if}
    </span>
    <span class="text-[12px] font-semibold text-foreground">{system.cpu.model ?? 'Host CPU'}</span>
    {#if system.cpu.cores !== null}
      <Badge variant="outline" class="text-[9px]">{system.cpu.cores} cores</Badge>
    {/if}
    {#if memory.hostRamMb !== null}
      <Badge variant="outline" class="text-[9px]">{fmtMb(memory.hostRamMb)} RAM</Badge>
    {/if}
    {#if osLabel}
      <span class="text-[10px] text-muted-foreground font-mono">{osLabel}</span>
    {/if}
    {#if system.cpu.hvtSupported === false}
      <Badge variant="destructive" class="text-[9px]">No HW Virt</Badge>
    {/if}
    {#if privacyRestricted}
      <span class="inline-flex items-center gap-0.5 text-[10px] text-amber-700">
        <ShieldAlert class="size-2.5" />
        Privacy
      </span>
    {/if}
  </div>

  <!-- Row 2: RAM bar -->
  {#if live && hostRamMb}
    <div class="px-1 pb-0.5">
      <div class="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground mb-0.5">RAM</div>
      <div class="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div class="flex h-full w-full">
          {#each memSegments as seg (seg.label)}
            <div
              class={seg.class}
              style={`width: ${(seg.mb / hostRamMb) * 100}%;`}
              title={`${seg.label}: ${fmtMb(seg.mb)}`}
            ></div>
          {/each}
        </div>
      </div>
      <div class="flex items-center justify-between mt-0.5 text-[9px] text-muted-foreground">
        <div class="flex flex-wrap items-center gap-x-2">
          {#each memSegments as seg (seg.label)}
            {#if seg.mb > 0}
              <span class="inline-flex items-center gap-0.5">
                <span class={`size-1.5 rounded-sm ${seg.class}`}></span>
                <span class="font-mono">{seg.label} {fmtMb(seg.mb)}</span>
              </span>
            {/if}
          {/each}
        </div>
        <span class="font-mono shrink-0">
          <span class={isLowMemory ? 'text-destructive font-semibold' : 'text-foreground/70'}>
            {fmtMb(live.freeMb)}
          </span>
          free
        </span>
      </div>
    </div>
  {/if}

  <!-- Row 3: System Disk bar (compact, matching RAM style) -->
  {#if mountInfoDisk}
    <div class="px-1 pb-0.5">
      <div class="flex items-center gap-1 mb-0.5">
        <div class="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">System Disk</div>
        <Badge variant="dim" class="text-[8px]">{mountInfoDisk.filesystem}</Badge>
        <span class={`font-mono text-[9px] font-semibold ${diskIsHigh ? 'text-amber-600' : 'text-emerald-600'}`}>{mountInfoDisk.capacityPercent}%</span>
      </div>
      <div class="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div class="flex h-full w-full">
          {#each diskSegments as seg (seg.key)}
            <div
              style={`width: ${Math.max(seg.pct, 0.3)}%; background: ${seg.color};`}
              title={`${seg.label}: ${fmtGi(seg.gi)}`}
            ></div>
          {/each}
        </div>
      </div>
      <div class="flex items-center justify-between mt-0.5 text-[9px] text-muted-foreground">
        <div class="flex flex-wrap items-center gap-x-2">
          {#each diskSegments as seg (seg.key)}
            <span class="inline-flex items-center gap-0.5">
              <span class="size-1.5 rounded-sm" style={`background: ${seg.color};`}></span>
              <span class="font-mono">{seg.label} {fmtGi(seg.gi)}</span>
            </span>
          {/each}
        </div>
        <span class="font-mono shrink-0">
          <span class={diskIsHigh ? 'text-amber-600 font-semibold' : 'text-emerald-600'}>
            {fmtGi(mountInfoDisk.freeGi)}
          </span>
          free of {fmtGi(mountInfoDisk.containerSizeGi)}
        </span>
      </div>
    </div>
  {:else if systemDisk && systemDisk.sizeBytes}
    <div class="px-1 pb-0.5">
      <div class="flex items-center gap-1 mb-0.5">
        <div class="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">System Disk</div>
        <span class="text-[9px] font-mono text-muted-foreground">{systemDisk.name}</span>
        <Badge variant="dim" class="text-[8px]">{systemDisk.partitionScheme}</Badge>
      </div>
      <div class="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        {#if diskUsedBytesFallback !== null}
          <div
            class={diskIsHigh ? 'bg-amber-500' : 'bg-emerald-500'}
            style={`width: ${diskUsagePercentFallback}%;`}
          ></div>
        {/if}
      </div>
      <div class="flex items-center justify-between mt-0.5 text-[9px] text-muted-foreground">
        <span class="font-mono">{fmtBytes(diskUsedBytesFallback)} used</span>
        <span class="font-mono shrink-0">
          <span class={diskIsHigh ? 'text-amber-600 font-semibold' : 'text-emerald-600'}>
            {fmtBytes(systemDisk.freeBytes)}
          </span>
          free of {fmtBytes(systemDisk.sizeBytes)}
        </span>
      </div>
    </div>
  {/if}

  <!-- Hardware UUID -->
  {#if system.hardwareUuid}
    <div class="flex items-center justify-between gap-2 px-1 py-[2px] text-[10px]">
      <span class="text-muted-foreground">Hardware UUID</span>
      <CopyButton
        text={system.hardwareUuid}
        size="sm"
        variant="ghost"
        class="h-auto min-h-5 px-1 font-mono text-[10px] text-muted-foreground hover:text-foreground whitespace-normal break-all text-right"
      >
        {system.hardwareUuid}
      </CopyButton>
    </div>
  {/if}
</div>
