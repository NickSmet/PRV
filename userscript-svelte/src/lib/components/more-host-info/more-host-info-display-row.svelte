<script lang="ts">
  import type { DisplayInfo } from '../../../services/parseMoreHostInfo';
  import Monitor from '@lucide/svelte/icons/monitor';
  import Laptop from '@lucide/svelte/icons/laptop';
  import { Badge } from '$lib/components/ui/badge';
  import { aspectRatio, resLabel, scaleFactor } from './more-host-info-utils';

  let { display }: { display: DisplayInfo } = $props();

  const ratio = $derived(aspectRatio(display.logicalWidth, display.logicalHeight));
  const scale = $derived(scaleFactor(display.physicalWidth, display.logicalWidth));
  const isHiDpi = $derived(display.physicalWidth !== display.logicalWidth || display.physicalHeight !== display.logicalHeight);
</script>

<div class="flex items-center gap-3 py-2 border-b border-border/40 last:border-b-0">
  <div class="shrink-0 text-muted-foreground">
    {#if display.builtin}
      <Laptop class="size-4" />
    {:else}
      <Monitor class="size-4" />
    {/if}
  </div>

  <div class="min-w-0 flex-1">
    <div class="flex items-center gap-1.5 flex-wrap">
      <span class="text-[13px] font-semibold text-foreground">{display.name}</span>
      {#if display.builtin}
        <Badge variant="outline" class="text-[10px] border-blue-200 bg-blue-50 text-blue-700">Built-in</Badge>
      {/if}
      <Badge variant="outline" class="text-[10px]">{ratio}</Badge>
      {#if display.refreshRate}
        <Badge variant="outline" class="text-[10px] border-emerald-200 bg-emerald-50 text-emerald-700">
          {display.refreshRate} Hz
        </Badge>
      {/if}
      {#if scale}
        <Badge variant="outline" class="text-[10px] border-violet-200 bg-violet-50 text-violet-700">
          {scale} HiDPI
        </Badge>
      {/if}
    </div>
  </div>

  <div class="shrink-0 text-right">
    <div class="font-mono text-[12px] font-semibold text-slate-700">
      {resLabel(display.logicalWidth, display.logicalHeight)}
    </div>
    {#if isHiDpi}
      <div class="font-mono text-[10.5px] text-muted-foreground">
        {resLabel(display.physicalWidth, display.physicalHeight)} native
      </div>
    {/if}
  </div>
</div>

