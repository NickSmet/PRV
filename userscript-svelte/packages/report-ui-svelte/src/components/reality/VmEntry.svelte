<script lang="ts">
  import * as Collapsible from '../ui/collapsible';
  import Badge from '../ui/badge.svelte';
  import DenseChevron from '../dense/DenseChevron.svelte';
  import PrvIcon from '../PrvIcon.svelte';

  type BadgeVariant = 'default' | 'destructive' | 'outline' | 'gold' | 'dim' | 'green' | 'blue' | 'purple' | 'amber';

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

  const badgeItems = $derived(headerBadges.slice(0, 4));
  const badgeOverflow = $derived(Math.max(0, headerBadges.length - badgeItems.length));
</script>

<div class={`mb-px ${isCurrent ? 'border-l-[3px] border-l-blue-500' : 'border-l-[3px] border-l-transparent'}`}>
  <Collapsible.Root bind:open>
    <Collapsible.Trigger class="w-full">
      <div
        class={`flex items-center gap-1.5 py-1.5 px-1 pl-2 min-h-[32px] cursor-pointer select-none border-b border-slate-200
          ${isCurrent ? 'bg-blue-50/30' : 'bg-white'}`}
      >
        <DenseChevron {open} />
        {#if iconUrl}
          <img src={iconUrl} alt="" class="w-[13px] h-[13px] shrink-0" />
        {:else}
          <span class="text-[13px]">💻</span>
        {/if}
        <span class="text-[13px] font-bold text-slate-900 truncate">{name}</span>

        {#if isCurrent}
          <Badge variant="gold">★ CURRENT</Badge>
        {/if}

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

        <span class="text-[9.5px] text-zinc-400 font-mono truncate max-w-[200px]">{uuid}</span>
      </div>
    </Collapsible.Trigger>

    <Collapsible.Content>
      <div class="border-b border-slate-200">
        {@render children()}
      </div>
    </Collapsible.Content>
  </Collapsible.Root>
</div>
