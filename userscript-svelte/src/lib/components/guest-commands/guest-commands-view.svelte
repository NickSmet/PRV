<script lang="ts">
  import { Badge } from '$lib/components/ui/badge';
  import type { GuestCommandsSummary } from '../../../services/parseGuestCommands';
  import type { ProcessItem, ProcessType } from '../../../services/parseAllProcesses';
  import AllProcessesView from '$lib/components/all-processes/all-processes-view.svelte';
  import GuestAdapterCard from './guest-adapter-card.svelte';
  import GuestDriveRow from './guest-drive-row.svelte';
  import { classifyWindowsGuestProcessType, windowsProcessShortName } from './guest-process-classification';

  let { summary }: { summary: GuestCommandsSummary } = $props();

  const system = $derived(summary.system);
  const adapters = $derived(summary.network?.adapters ?? []);
  const drives = $derived(summary.network?.drives ?? []);

  // Use $derived.by for function-based derived values.
  let guestProcessItems = $derived.by<ProcessItem[]>(() => {
    const procs = summary.processes ?? [];
    const totalsMem = summary.totals?.memoryKb;
    const maxMemKb = Math.max(...procs.map((p) => p.memoryKb ?? 0), 1);

    return procs
      .filter((p) => p.pid !== undefined)
      .map((p) => {
        const command = p.path ?? '(unknown)';
        const type = p.path ? classifyWindowsGuestProcessType(p.path) : 'other';
        const shortName = p.path ? windowsProcessShortName(p.path) : `pid ${p.pid}`;
        const cpu = p.cpuPercent ?? 0;

        // Normalize memory to a % so the shared table UI stays consistent.
        const memKb = p.memoryKb ?? 0;
        const mem = totalsMem && totalsMem > 0 ? (memKb / totalsMem) * 100 : (memKb / maxMemKb) * 100;

        return {
          user: p.user ?? 'unknown',
          pid: String(p.pid),
          cpu,
          mem,
          command,
          type,
          appName: undefined,
          isHelper: false,
          shortName,
          displayName: shortName
        };
      });
  });
</script>

<div class="space-y-5">
  <!-- System header -->
  <div class="rounded-xl border border-border bg-background px-4 py-3">
    <div class="flex items-center gap-2">
      <div class="text-[13px] font-semibold text-foreground">
        {system?.hostname ?? 'Guest VM'}
      </div>
      {#if system?.architecture}
        <Badge variant="outline" class="text-[10px]">{system.architecture}</Badge>
      {/if}
      {#if system?.processorCount}
        <Badge variant="outline" class="text-[10px]">{system.processorCount} vCPU</Badge>
      {/if}
    </div>
    {#if summary.isEmpty}
      <div class="mt-1 text-[11px] font-mono text-muted-foreground">GuestCommands: empty</div>
    {/if}
  </div>

  <!-- Network adapters -->
  <div>
    <div class="mb-2 flex items-center gap-2">
      <div class="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        Network Adapters
      </div>
      <Badge variant="outline" class="text-[10px]">{adapters.length}</Badge>
      <div class="h-px flex-1 bg-border/70"></div>
    </div>

    {#if adapters.length === 0}
      <div class="rv-empty">No adapters parsed.</div>
    {:else}
      <div class="space-y-2">
        {#each adapters as adapter, idx (adapter.name ?? `${adapter.description ?? 'adapter'}:${idx}`)}
          <GuestAdapterCard {adapter} />
        {/each}
      </div>
    {/if}
  </div>

  <!-- Mapped drives -->
  <div>
    <div class="mb-2 flex items-center gap-2">
      <div class="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        Mapped Drives
      </div>
      <Badge variant="outline" class="text-[10px]">{drives.length}</Badge>
      <div class="h-px flex-1 bg-border/70"></div>
    </div>

    <div class="rounded-xl border border-border bg-background px-4 py-1">
      {#if drives.length === 0}
        <div class="py-3 text-[12px] text-muted-foreground">No network drives.</div>
      {:else}
        {#each drives as drive, idx (drive.letter ?? `${drive.remotePath ?? 'drive'}:${idx}`)}
          <GuestDriveRow {drive} />
        {/each}
      {/if}
    </div>
  </div>

  <!-- Guest processes -->
  <div>
    <div class="mb-2 flex items-center gap-2">
      <div class="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        Guest Processes
      </div>
      <Badge variant="outline" class="text-[10px]">{guestProcessItems.length}</Badge>
      <div class="h-px flex-1 bg-border/70"></div>
    </div>

    {#if guestProcessItems.length === 0}
      <div class="rv-empty">No guest processes parsed.</div>
    {:else}
      <AllProcessesView summary={{ items: guestProcessItems }} title="Guest Processes" />
      {#if summary.totals?.cpuPercent !== undefined || summary.totals?.memoryKb !== undefined}
        <div class="mt-2 text-[11px] font-mono text-muted-foreground">
          TOTAL: {summary.totals?.cpuPercent ?? '?'}% CPU · {summary.totals?.memoryKb ?? '?'} KB (for mem normalization)
        </div>
      {/if}
    {/if}
  </div>
</div>

