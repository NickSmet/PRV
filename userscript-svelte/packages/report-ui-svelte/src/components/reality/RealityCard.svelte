<script lang="ts">
  import * as Collapsible from '../ui/collapsible';
  import DenseChevron from '../dense/DenseChevron.svelte';
  import PrvIcon from '../PrvIcon.svelte';
  import SourceChips from './SourceChips.svelte';
  import type { RealitySourceRef } from '@prv/report-viewmodel';
  import type { Snippet } from 'svelte';
  import Badge from '../ui/badge.svelte';

  type BadgeVariant = 'default' | 'destructive' | 'outline' | 'gold' | 'dim' | 'green' | 'blue' | 'purple' | 'amber';

  let {
    title,
    iconKey,
    iconUrlByKey,
    headerBadges = [],
    openByDefault = false,
    sources = [],
    onOpenSource,
    highlight = false,
    indent = 0,
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
    highlight?: boolean;
    indent?: number;
    meta?: Snippet;
    children: Snippet;
  } = $props();

  let open = $state(openByDefault);

  function badgeVariant(tone: string | undefined): BadgeVariant {
    if (tone === 'danger') return 'destructive';
    if (tone === 'warn') return 'amber';
    return 'dim';
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

<div style={indent ? `margin-left: ${indent}px` : ''}>
  <Collapsible.Root bind:open>
    <Collapsible.Trigger class="w-full">
      <div
        class={`flex items-center gap-1.5 py-[5px] px-1 pl-2 min-h-[30px] cursor-pointer select-none border-b border-slate-100
          ${highlight ? 'bg-amber-50' : open ? 'bg-slate-50/80' : 'bg-transparent'}
          hover:bg-slate-50/50`}
      >
        <DenseChevron {open} />
        {#if iconKey}
          <PrvIcon {iconKey} {iconUrlByKey} size={12} class="opacity-70 shrink-0" />
        {/if}
        <span class="text-[12.5px] font-semibold text-slate-800 shrink-0">{title}</span>

        {#if badgeItems.length}
          <div class="flex gap-0.5 flex-wrap items-center">
            {#each badgeItems as b (b.label)}
              <Badge variant={badgeVariant(b.tone)} class="gap-0.5">
                {#if b.iconKey}
                  <PrvIcon iconKey={b.iconKey} {iconUrlByKey} size={10} class={iconClass(b.tone)} />
                {/if}
                {b.label}
              </Badge>
            {/each}
            {#if badgeOverflow > 0}
              <Badge variant="dim">+{badgeOverflow}</Badge>
            {/if}
          </div>
        {/if}

        <div class="flex-1"></div>

        <SourceChips {sources} onOpen={onOpenSource} />
      </div>
    </Collapsible.Trigger>

    <Collapsible.Content>
      <div class="py-1.5 px-2 pl-7 border-b border-slate-100 bg-slate-50/50">
        {@render meta?.()}
        {@render children()}
      </div>
    </Collapsible.Content>
  </Collapsible.Root>
</div>
