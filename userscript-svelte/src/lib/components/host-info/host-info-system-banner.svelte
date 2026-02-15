<script lang="ts">
  import { Badge } from '$lib/components/ui/badge';
  import CopyButton from '$ui/copy-button/copy-button.svelte';
  import Laptop from '@lucide/svelte/icons/laptop';
  import Monitor from '@lucide/svelte/icons/monitor';
  import ShieldAlert from '@lucide/svelte/icons/shield-alert';

  import type { HostInfoSummary } from '../../../services/parseHostInfo';
  import { fmtMb } from './host-info-utils';

  let { system }: { system: HostInfoSummary['system'] } = $props();

  const osLabel = $derived(
    system.os.displayString ??
      (system.os.name && system.os.version ? `${system.os.name} ${system.os.version}` : null)
  );

  const memory = $derived(system.memory);
  const live = $derived(memory.live);
  const hostRamMb = $derived(memory.hostRamMb);

  const activeWiredRatio = $derived.by(() => {
    if (!live || !hostRamMb) return null;
    const active = live.activeMb ?? 0;
    const wired = live.wiredMb ?? 0;
    return (active + wired) / hostRamMb;
  });
  const isLowMemory = $derived((activeWiredRatio ?? 0) >= 0.85);

  const otherMb = $derived.by(() => {
    if (!live || !hostRamMb) return null;
    const active = live.activeMb ?? 0;
    const wired = live.wiredMb ?? 0;
    const inactive = live.inactiveMb ?? 0;
    const free = live.freeMb ?? 0;
    const other = hostRamMb - active - wired - inactive - free;
    return other > 0 ? other : 0;
  });

  const memSegments = $derived.by(() => {
    if (!live || !hostRamMb) return [];
    return [
      { label: 'Active', mb: live.activeMb, class: 'bg-sky-500' },
      { label: 'Wired', mb: live.wiredMb, class: 'bg-indigo-500' },
      { label: 'Inactive', mb: live.inactiveMb, class: 'bg-slate-300' },
      {
        label: 'Other',
        mb: otherMb ?? 0,
        class: 'bg-slate-200',
        title:
          'Other = Host RAM - (active + wired + inactive + free). This often includes cached/compressed/other categories not exposed directly here.'
      }
    ];
  });

  const privacyRestricted = $derived(system.privacy.cameraAllowed === false || system.privacy.microphoneAllowed === false);
  const privacyText = $derived(() => {
    const parts: string[] = [];
    if (system.privacy.cameraAllowed === false) parts.push('Camera blocked');
    if (system.privacy.microphoneAllowed === false) parts.push('Microphone blocked');
    return parts.join(' · ');
  });
</script>

<div class="overflow-hidden rounded-xl border border-border bg-background">
  <div class="flex flex-wrap items-center gap-2 px-4 py-3">
    <span class="text-muted-foreground">
      {#if system.isNotebook}
        <Laptop class="size-4" />
      {:else}
        <Monitor class="size-4" />
      {/if}
    </span>

    <div class="flex flex-wrap items-center gap-2">
      <span class="text-[13px] font-semibold text-foreground">
        {system.cpu.model ?? 'Host CPU'}
      </span>

      {#if system.cpu.cores !== null}
        <Badge variant="outline" class="text-[10px]">{system.cpu.cores} cores</Badge>
      {/if}

      {#if memory.hostRamMb !== null}
        <Badge variant="outline" class="text-[10px]">{fmtMb(memory.hostRamMb)} RAM</Badge>
      {/if}

      {#if osLabel}
        <Badge variant="secondary" class="text-[10px]">{osLabel}</Badge>
      {/if}

      {#if system.cpu.hvtSupported === false}
        <Badge
          variant="destructive"
          class="text-[10px]"
          title="Hardware virtualization flags from HostInfo.xml (HvtNptAvail/HvtUnrestrictedAvail)"
        >
          No HW Virt
        </Badge>
      {/if}
    </div>
  </div>

  {#if live && hostRamMb}
    <div class="px-4 pb-3">
      <div class="h-2 w-full overflow-hidden rounded-full border border-border bg-muted/30">
        <div class="flex h-full w-full">
          {#each memSegments as seg (seg.label)}
            <div
              class={seg.class}
              style={`width: ${(seg.mb / hostRamMb) * 100}%;`}
              title={(seg as any).title ?? `${seg.label}: ${fmtMb(seg.mb)}`}
            ></div>
          {/each}
        </div>
      </div>

      <div class="mt-1.5 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
        <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
          {#each memSegments as seg (seg.label)}
            {#if seg.mb > 0}
              <span class="inline-flex items-center gap-1" title={(seg as any).title ?? undefined}>
                <span class={`size-2 rounded-sm ${seg.class}`}></span>
                <span class="font-mono">{seg.label} {fmtMb(seg.mb)}</span>
              </span>
            {/if}
          {/each}
        </div>
        <span class="font-mono">
          <span class={isLowMemory ? 'text-destructive font-semibold' : 'text-foreground/80'}>
            {fmtMb(live.freeMb)}
          </span>
          <span> free</span>
        </span>
      </div>
    </div>
  {/if}

  {#if system.hardwareUuid}
    <div class="border-t border-border/50 bg-muted/10 px-4 py-2">
      <div class="flex items-center justify-between gap-2">
        <div class="text-[11px] text-muted-foreground">Hardware UUID</div>
        <CopyButton
          text={system.hardwareUuid}
          size="sm"
          variant="ghost"
          class="h-auto min-h-6 px-2 font-mono text-[11px] text-muted-foreground hover:text-foreground whitespace-normal break-all text-right"
        >
          {system.hardwareUuid}
        </CopyButton>
      </div>
    </div>
  {/if}

  {#if privacyRestricted}
    <div class="border-t border-amber-200/60 bg-amber-50/60 px-4 py-2">
      <div class="flex items-center gap-2 text-[12px] text-amber-800">
        <ShieldAlert class="size-4" />
        <span class="font-medium">Privacy restricted</span>
        {#if privacyText}
          <span class="text-amber-800/80">{privacyText}</span>
        {/if}
      </div>
    </div>
  {/if}
</div>
