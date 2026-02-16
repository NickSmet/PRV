<script lang="ts">
  import * as Collapsible from '../ui/collapsible';
  import { Badge } from '../ui/badge';
  import ChevronRight from '@lucide/svelte/icons/chevron-right';
  import Zap from '@lucide/svelte/icons/zap';
  import type { GpuInfo } from '@prv/report-core';
  import { gpuTypeBadgeClass, gpuTypeLabel } from './more-host-info-utils';
  import MoreHostInfoDisplayLayout from './more-host-info-display-layout.svelte';
  import MoreHostInfoDisplayRow from './more-host-info-display-row.svelte';

  let { gpu }: { gpu: GpuInfo } = $props();

  // Default to expanded; user can collapse per-card.
  let open = $state(true);
</script>

<div class="overflow-hidden rounded-xl border border-border bg-background">
  <Collapsible.Root bind:open>
    <Collapsible.Trigger class="flex w-full items-center gap-2 px-4 py-3 text-left select-none">
      <ChevronRight
        class={`size-4 text-muted-foreground transition-transform ${open ? 'rotate-90' : 'rotate-0'}`}
      />
      <Zap class="size-4 text-muted-foreground" />
      <span class="text-[13px] font-bold text-foreground">{gpu.name}</span>

      <Badge variant="outline" class={`text-[10px] ${gpuTypeBadgeClass(gpu.type)}`}>
        {gpuTypeLabel(gpu.type)}
      </Badge>

      <span class="ml-auto">
        <Badge variant="muted" class="text-[10px]">
          {gpu.displays.length} display{gpu.displays.length === 1 ? '' : 's'}
        </Badge>
      </span>
    </Collapsible.Trigger>

    <Collapsible.Content class="border-t border-border/50">
      <MoreHostInfoDisplayLayout displays={gpu.displays} />
      <div class="px-4 pb-3 pt-1">
        {#each gpu.displays as d, idx (d.name + ':' + d.logicalWidth + 'x' + d.logicalHeight + ':' + (d.refreshRate ?? '') + ':' + idx)}
          <MoreHostInfoDisplayRow display={d} />
        {/each}
      </div>
    </Collapsible.Content>
  </Collapsible.Root>
</div>

