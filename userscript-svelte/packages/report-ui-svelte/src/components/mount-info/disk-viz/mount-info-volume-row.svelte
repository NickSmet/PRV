<script lang="ts">
  import type { ParsedMountInfoVolume } from '@prv/report-core';
  import { fmtGi } from './mount-info-viz-utils';

  let { vol }: { vol: ParsedMountInfoVolume } = $props();
</script>

<div class="grid grid-cols-[10px_minmax(0,1fr)_90px_minmax(0,1fr)] items-center gap-2 border-b border-border/40 py-1.5 text-[12px]">
  <div class="size-2.5 rounded-sm" style:background={vol.color}></div>
  <div class="min-w-0">
    <span class="font-medium text-foreground">{vol.label}</span>
    <span class="ml-1 font-mono text-[11px] text-muted-foreground">{vol.id}</span>
  </div>
  <div class="text-right font-mono text-[12px] font-semibold text-foreground/80">{fmtGi(vol.usedGi)}</div>
  <div class="min-w-0 truncate font-mono text-[11px] text-muted-foreground" title={vol.mount}>{vol.mount}</div>
</div>

