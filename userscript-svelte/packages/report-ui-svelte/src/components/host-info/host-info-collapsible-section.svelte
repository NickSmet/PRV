<script lang="ts">
  import * as Collapsible from '../ui/collapsible';
  import type { IconComponent } from '../../icon';
  import { ChevronRight } from '@lucide/svelte';
  import type { Snippet } from 'svelte';

  let {
    title,
    count,
    Icon,
    openByDefault = false,
    badges,
    children
  }: {
    title: string;
    count?: number;
    Icon?: IconComponent;
    openByDefault?: boolean;
    badges?: Snippet;
    children: Snippet;
  } = $props();

  let open = $state(openByDefault);
</script>

<div class="overflow-hidden rounded-xl border border-border bg-background">
  <Collapsible.Root bind:open>
    <Collapsible.Trigger class="w-full">
      <div class="flex items-center gap-2 px-3 py-2.5 hover:bg-muted/20">
        <ChevronRight class={`h-4 w-4 text-muted-foreground transition-transform ${open ? 'rotate-90' : ''}`} />
        {#if Icon}
          <Icon class="h-4 w-4 text-muted-foreground" />
        {/if}
        <div class="text-[12px] font-semibold">{title}</div>
        <div class="ml-auto flex items-center gap-1.5">
          {@render badges?.()}
          {#if typeof count === 'number'}
            <div class="text-[11px] text-muted-foreground">{count}</div>
          {/if}
        </div>
      </div>
    </Collapsible.Trigger>
    <Collapsible.Content>
      <div class="border-t border-border bg-muted/10 px-4 py-3">
        {@render children()}
      </div>
    </Collapsible.Content>
  </Collapsible.Root>
</div>
