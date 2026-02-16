<script lang="ts">
  import * as Collapsible from '../../ui/collapsible';
  import { Badge } from '../../ui/badge';
  import ChevronRight from '@lucide/svelte/icons/chevron-right';
  import type { ParsedMountInfoDisk } from '@prv/report-core';
  import { fmtGi, statusColor } from './mount-info-viz-utils';
  import MountInfoVolumeRow from './mount-info-volume-row.svelte';

  let { disk }: { disk: ParsedMountInfoDisk } = $props();

  // Always start collapsed on load (per UX request).
  let open = $state(false);

  let st = $derived(statusColor(disk.capacityPercent));

  type Segment = { key: string; label: string; pct: number; color: string; valueGi: number };
  function segmentsFor(d: ParsedMountInfoDisk): Segment[] {
    const container = d.containerSizeGi || 0;
    if (container <= 0) return [];

    const usedTotal = d.volumes.reduce((s, v) => s + (v.usedGi || 0), 0);
    const overhead = Math.max(0, container - (d.freeGi || 0) - usedTotal);

    const segs: Segment[] = d.volumes
      .filter((v) => (v.usedGi || 0) > 0)
      .map((v) => ({
        key: v.id,
        label: v.label,
        valueGi: v.usedGi,
        pct: (v.usedGi / container) * 100,
        color: v.color
      }));

    if (overhead > 0.5) {
      segs.push({
        key: 'overhead',
        label: 'Overhead / Snapshots',
        valueGi: overhead,
        pct: (overhead / container) * 100,
        color: '#CBD5E1'
      });
    }

    return segs;
  }

  let segs = $derived(segmentsFor(disk));
</script>

<div class="overflow-hidden rounded-xl border border-border bg-background">
  <Collapsible.Root bind:open>
    <Collapsible.Trigger class="flex w-full items-center gap-2 px-4 pt-3 text-left">
      <ChevronRight
        class={`size-4 text-muted-foreground transition-transform ${open ? 'rotate-90' : 'rotate-0'}`}
      />
      <span class={`size-2 rounded-full ${st.dot}`}></span>
      <span class="text-[13px] font-semibold text-foreground">{disk.label}</span>
      <Badge variant="outline" class="text-[10px]">{disk.filesystem}</Badge>
      <span class={`ml-auto rounded px-2 py-0.5 font-mono text-[12px] font-semibold ${st.bg} ${st.text}`}>
        {disk.capacityPercent}%
      </span>
    </Collapsible.Trigger>

    <div class="px-4 pb-3 pt-2">
      <!-- Stacked bar -->
      <div class="h-6 w-full overflow-hidden rounded-md border border-border bg-muted/40">
        <div class="flex h-full w-full">
          {#each segs as seg (seg.key)}
            <div
              class="h-full"
              style:width={`${Math.max(seg.pct, 0.3)}%`}
              style:background={seg.color}
              title={`${seg.label}: ${fmtGi(seg.valueGi)} (${seg.pct.toFixed(1)}%)`}
            ></div>
          {/each}
          <!-- free space is implicit -->
        </div>
      </div>

      <div class="mt-1 flex justify-between font-mono text-[11px] text-muted-foreground">
        <span><span class="font-semibold text-foreground/80">{fmtGi(disk.usedGi)}</span> used</span>
        <span>
          <span class="font-semibold text-foreground/80">{fmtGi(disk.freeGi)}</span> free of{' '}
          <span class="font-semibold text-foreground/80">{fmtGi(disk.containerSizeGi)}</span>
        </span>
      </div>
    </div>

    <Collapsible.Content class="border-t border-border/50 bg-muted/15 px-4 py-3">
      <div class="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Volumes ({disk.volumes.length})
      </div>
      <div class="space-y-0">
        {#each disk.volumes as vol (vol.id)}
          <MountInfoVolumeRow {vol} />
        {/each}
      </div>
      <div class="mt-2 font-mono text-[10px] text-muted-foreground">
        Container: /dev/{disk.diskId} · APFS shared pool · {disk.volumes.length} volumes
      </div>
    </Collapsible.Content>
  </Collapsible.Root>
</div>
