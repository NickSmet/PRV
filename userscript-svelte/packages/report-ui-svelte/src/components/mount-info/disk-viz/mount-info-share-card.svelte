<script lang="ts">
  import * as Collapsible from '../../ui/collapsible';
  import { Badge } from '../../ui/badge';
  import ChevronRight from '@lucide/svelte/icons/chevron-right';
  import type { ParsedMountInfoNetworkShare } from '@prv/report-core';
  import { fmtGi, statusColor } from './mount-info-viz-utils';

  let { share }: { share: ParsedMountInfoNetworkShare } = $props();
  let open = $state(false);
  let st = $derived(statusColor(share.capacityPercent));
</script>

<div class="overflow-hidden rounded-xl border border-border bg-background">
  <Collapsible.Root bind:open>
    <Collapsible.Trigger class="flex w-full items-center gap-2 px-4 pt-3 text-left">
      <ChevronRight
        class={`size-4 text-muted-foreground transition-transform ${open ? 'rotate-90' : 'rotate-0'}`}
      />
      <span class={`size-2 rounded-full ${st.dot}`}></span>
      <span class="text-[13px] font-semibold text-foreground">{share.label}</span>
      <Badge variant="secondary" class="text-[10px]">{share.protocol}</Badge>
      <span class={`ml-auto rounded px-2 py-0.5 font-mono text-[12px] font-semibold ${st.bg} ${st.text}`}>
        {share.capacityPercent}%
      </span>
    </Collapsible.Trigger>

    <div class="px-4 pb-3 pt-2">
      <div class="h-6 w-full overflow-hidden rounded-md border border-border bg-muted/40">
        <div
          class={`h-full ${st.bar}`}
          style:width={`${Math.max(0, Math.min(100, share.capacityPercent))}%`}
        ></div>
      </div>
      <div class="mt-1 flex justify-between font-mono text-[11px] text-muted-foreground">
        <span><span class="font-semibold text-foreground/80">{fmtGi(share.usedGi)}</span> used</span>
        <span>
          <span class="font-semibold text-foreground/80">{fmtGi(share.freeGi)}</span> free of{' '}
          <span class="font-semibold text-foreground/80">{fmtGi(share.sizeGi)}</span>
        </span>
      </div>
    </div>

    <Collapsible.Content class="border-t border-border/50 bg-muted/15 px-4 py-3">
      <div class="space-y-1 font-mono text-[11px] text-muted-foreground">
        <div><span class="text-muted-foreground/70">Source:</span> <span class="text-foreground/80 break-all">{share.source}</span></div>
        <div><span class="text-muted-foreground/70">Mount:</span> <span class="text-foreground/80 break-all">{share.mountPoint}</span></div>
      </div>
    </Collapsible.Content>
  </Collapsible.Root>
</div>
