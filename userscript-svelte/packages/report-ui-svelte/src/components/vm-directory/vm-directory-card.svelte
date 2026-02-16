<script lang="ts">
  import * as Collapsible from '../ui/collapsible';
  import ChevronRight from '@lucide/svelte/icons/chevron-right';
  import Monitor from '@lucide/svelte/icons/monitor';
  import { CopyButton } from '../../ui/copy-button';
  import type { VmDirectoryEntry } from '@prv/report-core';
  import { shortHomePath, timeAgo } from './vm-directory-utils';

  let { vm, now = new Date() }: { vm: VmDirectoryEntry; now?: Date } = $props();

  let open = $state(false);

  const ago = $derived(timeAgo(vm.registeredOn, now));
  const locationShort = $derived(shortHomePath(vm.location));
</script>

<div class="overflow-hidden rounded-xl border border-border bg-background">
  <Collapsible.Root bind:open>
    <Collapsible.Trigger class="flex w-full items-center gap-2 px-4 py-2.5 text-left select-none">
      <ChevronRight
        class={`size-4 text-muted-foreground transition-transform ${open ? 'rotate-90' : 'rotate-0'}`}
      />
      <Monitor class="size-4 text-muted-foreground" />
      <span class="text-[13px] font-semibold text-foreground">
        {vm.name ?? 'Virtual Machine'}
      </span>
      <span class="ml-auto flex items-center gap-2">
        {#if ago}
          <span class="font-mono text-[11px] text-muted-foreground">{ago}</span>
        {/if}
      </span>
    </Collapsible.Trigger>

    <Collapsible.Content class="border-t border-border/50 bg-muted/15 px-4 py-3">
      <div class="grid grid-cols-[80px_1fr] gap-x-3 gap-y-1 text-[12px]">
        <span class="text-muted-foreground/80 font-medium">Location</span>
        <CopyButton
          text={vm.location ?? ''}
          size="sm"
          variant="ghost"
          class="h-auto min-h-6 px-2 font-mono text-[11.5px] text-muted-foreground hover:text-foreground whitespace-normal break-all text-left"
        >
          {locationShort}
        </CopyButton>

        <span class="text-muted-foreground/80 font-medium">UUID</span>
        <CopyButton
          text={vm.uuid ?? ''}
          size="sm"
          variant="ghost"
          class="h-auto min-h-6 px-2 font-mono text-[11.5px] text-muted-foreground hover:text-foreground whitespace-normal break-all text-left"
        >
          {vm.uuid ?? '—'}
        </CopyButton>

        <span class="text-muted-foreground/80 font-medium">Registered</span>
        <span class="font-mono text-[11.5px] text-muted-foreground">
          {vm.registeredOn ?? '—'}
        </span>
      </div>
    </Collapsible.Content>
  </Collapsible.Root>
</div>

