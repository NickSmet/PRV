<script lang="ts">
  import * as Collapsible from '../ui/collapsible';
  import { ChevronRight } from '@lucide/svelte';
  import { iconComponentForKey } from '../../icon';
  import type { Snippet } from 'svelte';

  let {
    title,
    subtitle,
    iconKey,
    openByDefault = true,
    badges,
    children
  }: {
    title: string;
    subtitle?: string;
    iconKey?: string;
    openByDefault?: boolean;
    badges?: Snippet;
    children: Snippet;
  } = $props();

  let open = $state(openByDefault);
</script>

<div class="border border-border rounded-xl bg-background overflow-hidden">
  <Collapsible.Root bind:open>
    <Collapsible.Trigger class="w-full">
      {@const IconComponent = iconComponentForKey(iconKey)}
      <div class="flex items-start gap-3 px-4 py-3 bg-muted/20 hover:bg-muted/30">
        <ChevronRight class={`mt-0.5 h-4 w-4 text-muted-foreground transition-transform ${open ? 'rotate-90' : ''}`} />
        {#if IconComponent}
          <IconComponent class="mt-0.5 h-4 w-4 text-muted-foreground" />
        {/if}
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2 flex-wrap">
            <h2 class="text-[15px] font-bold leading-tight">{title}</h2>
            {@render badges?.()}
          </div>
          {#if subtitle}
            <div class="text-[11px] text-muted-foreground mt-0.5 truncate">{subtitle}</div>
          {/if}
        </div>
      </div>
    </Collapsible.Trigger>
    <Collapsible.Content>
      <div class="p-4 space-y-2">
        {@render children()}
      </div>
    </Collapsible.Content>
  </Collapsible.Root>
</div>
