<script lang="ts">
  import * as Collapsible from '../ui/collapsible';
  import DenseChevron from '../dense/DenseChevron.svelte';
  import type { IconComponent } from '../../icon';
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

<Collapsible.Root bind:open>
  <Collapsible.Trigger class="w-full">
    <div
      class={`flex items-center gap-1.5 py-[5px] px-1 pl-2 min-h-[28px] cursor-pointer select-none border-b border-slate-100
        ${open ? 'bg-slate-50/80' : 'bg-transparent'}
        hover:bg-slate-50/50`}
    >
      <DenseChevron {open} />
      {#if Icon}
        <Icon class="size-3.5 text-muted-foreground shrink-0 opacity-70" />
      {/if}
      <span class="text-[12px] font-semibold text-slate-700 shrink-0">{title}</span>
      <div class="flex items-center gap-1">
        {@render badges?.()}
      </div>
      <div class="flex-1"></div>
      {#if typeof count === 'number'}
        <span class="text-[11px] font-mono text-muted-foreground tabular-nums">{count}</span>
      {/if}
    </div>
  </Collapsible.Trigger>
  <Collapsible.Content>
    <div class="py-1 px-2 pl-6 border-b border-slate-100 bg-slate-50/30">
      {@render children()}
    </div>
  </Collapsible.Content>
</Collapsible.Root>
