<script lang="ts">
  import * as Collapsible from '../ui/collapsible';
  import { ChevronRight } from '@lucide/svelte';
  import PrvIcon from '../PrvIcon.svelte';
  import SourceChips from './SourceChips.svelte';
  import type { RealitySourceRef } from '@prv/report-viewmodel';
  import type { Snippet } from 'svelte';
  import Badge from '../ui/badge.svelte';

  let {
    title,
    iconKey,
    iconUrlByKey,
    headerBadges = [],
    openByDefault = false,
    sources = [],
    onOpenSource,
    meta,
    children
  }: {
    title: string;
    iconKey?: string;
    iconUrlByKey?: Record<string, string>;
    headerBadges?: Array<{ label: string; tone?: 'info' | 'warn' | 'danger'; iconKey?: string }>;
    openByDefault?: boolean;
    sources?: RealitySourceRef[];
    onOpenSource: (src: RealitySourceRef) => void;
    meta?: Snippet;
    children: Snippet;
  } = $props();

  let open = $state(openByDefault);

  function badgeVariant(tone: string | undefined): 'destructive' | 'default' | 'outline' {
    if (tone === 'danger') return 'destructive';
    if (tone === 'warn') return 'default';
    return 'outline';
  }

  function iconClass(tone: string | undefined): string {
    if (tone === 'danger') return 'text-red-700';
    if (tone === 'warn') return 'text-amber-700';
    return 'text-muted-foreground';
  }

  const maxBadges = 6;
  const badgeItems = $derived(headerBadges.slice(0, maxBadges));
  const badgeOverflow = $derived(Math.max(0, headerBadges.length - badgeItems.length));
</script>

<div class="border border-border rounded-lg bg-background overflow-hidden">
  <Collapsible.Root bind:open>
    <Collapsible.Trigger class="w-full">
      <div class="flex items-start gap-2 px-3 py-2 hover:bg-muted/20">
        <ChevronRight class={`mt-0.5 h-4 w-4 text-muted-foreground transition-transform ${open ? 'rotate-90' : ''}`} />
        <PrvIcon {iconKey} {iconUrlByKey} size={16} class="mt-0.5 text-muted-foreground" />
        <div class="min-w-0 flex-1">
          <div class="flex items-center justify-between gap-2">
            <div class="text-[13px] font-semibold">{title}</div>
            <div class="shrink-0">
              <SourceChips sources={sources} onOpen={onOpenSource} />
            </div>
          </div>
          {#if badgeItems.length}
            <div class="mt-1 flex items-center gap-1 flex-wrap">
              {#each badgeItems as b (b.label)}
                <Badge variant={badgeVariant(b.tone)} class="text-[10px] gap-1">
                  {#if b.iconKey}
                    <PrvIcon iconKey={b.iconKey} {iconUrlByKey} size={12} class={iconClass(b.tone)} />
                  {/if}
                  {b.label}
                </Badge>
              {/each}
              {#if badgeOverflow > 0}
                <Badge variant="outline" class="text-[10px]">+{badgeOverflow} more</Badge>
              {/if}
            </div>
          {/if}
          {@render meta?.()}
        </div>
      </div>
    </Collapsible.Trigger>
    <Collapsible.Content>
      <div class="border-t border-border bg-muted/10 px-3 py-3">
        {@render children()}
      </div>
    </Collapsible.Content>
  </Collapsible.Root>
</div>
