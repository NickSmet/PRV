<script lang="ts">
  import * as Collapsible from '../ui/collapsible';
  import Badge from '../ui/badge.svelte';
  import { ChevronRight } from '@lucide/svelte';
  import PrvIcon from '../PrvIcon.svelte';

  let {
    name,
    uuid,
    isCurrent,
    openByDefault = false,
    iconUrl,
    headerBadges = [],
    iconUrlByKey,
    children
  }: {
    name: string;
    uuid: string;
    isCurrent: boolean;
    openByDefault?: boolean;
    iconUrl?: string;
    headerBadges?: Array<{ label: string; tone?: 'info' | 'warn' | 'danger'; iconKey?: string }>;
    iconUrlByKey?: Record<string, string>;
    children: import('svelte').Snippet;
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

  const badgeItems = $derived(headerBadges.slice(0, 4));
  const badgeOverflow = $derived(Math.max(0, headerBadges.length - badgeItems.length));
</script>

<div class={`border rounded-xl bg-background overflow-hidden ${isCurrent ? 'border-blue-400' : 'border-border'}`}>
  <Collapsible.Root bind:open>
    <Collapsible.Trigger class="w-full">
      <div class="flex items-center gap-2 px-4 py-3 hover:bg-muted/20">
        <ChevronRight class={`h-4 w-4 text-muted-foreground transition-transform ${open ? 'rotate-90' : ''}`} />
        {#if iconUrl}
          <img src={iconUrl} alt="" class="w-4 h-4" />
        {/if}
        <div class="text-[13px] font-bold truncate">{name}</div>
        {#if isCurrent}
          <Badge variant="outline" class="text-[10px]">CURRENT</Badge>
        {/if}
        {#if badgeItems.length}
          <div class="flex items-center gap-1 flex-wrap">
            {#each badgeItems as b (b.label)}
              <Badge variant={badgeVariant(b.tone)} class="text-[10px] gap-1">
                {#if b.iconKey}
                  <PrvIcon iconKey={b.iconKey} {iconUrlByKey} size={12} class={iconClass(b.tone)} />
                {/if}
                {b.label}
              </Badge>
            {/each}
            {#if badgeOverflow > 0}
              <Badge variant="outline" class="text-[10px]">+{badgeOverflow}</Badge>
            {/if}
          </div>
        {/if}
        <div class="ml-auto text-[11px] text-muted-foreground font-mono truncate">{uuid}</div>
      </div>
    </Collapsible.Trigger>
    <Collapsible.Content>
      <div class="p-4 space-y-2 border-t border-border bg-muted/10">
        {@render children()}
      </div>
    </Collapsible.Content>
  </Collapsible.Root>
</div>
