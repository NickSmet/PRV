<script lang="ts">
  import type { ProcessItem, ProcessType } from '../../../services/parseAllProcesses';
  import { Badge } from '$lib/components/ui/badge';
  import { CopyButton } from '$ui/copy-button';
  import {
    cpuColor,
    memColor,
    sortItems,
    typeBadgeClasses,
    typeCounts,
    typeLabel
  } from './all-processes-utils';

  let {
    summary,
    title = 'Processes'
  }: {
    summary: { items: ProcessItem[] | undefined | null };
    title?: string;
  } = $props();

  type SortKey = 'name' | 'cpu' | 'mem' | 'user';
  type SortDir = 'asc' | 'desc';
  type TypeFilter = 'all' | ProcessType;

  let sortKey = $state<SortKey>('cpu');
  let sortDir = $state<SortDir>('desc');
  let filter = $state<TypeFilter>('all');
  let expandedPid = $state<string | null>(null);
  let showAll = $state(false);

  const items = $derived((summary.items ?? []) as ProcessItem[]);
  const maxCpu = $derived(Math.max(...items.map((p) => p.cpu), 1));
  const maxMem = $derived(Math.max(...items.map((p) => p.mem), 1));
  const counts = $derived(typeCounts(items));
  const filterOrder = $derived<ProcessType[]>([
    'parallels-tools',
    'windows-store-app',
    'microsoft-component',
    'third-party-app',
    'macos-app',
    'system',
    'service',
    'other'
  ]);
  const visibleFilters = $derived(
    (['all', ...filterOrder.filter((t) => (counts[t] ?? 0) > 0)] as TypeFilter[]).map((key) => ({
      key,
      label:
        key === 'all'
          ? 'All'
          : key === 'parallels-tools'
            ? 'Parallels Tools'
            : key === 'windows-store-app'
              ? 'Windows Apps'
              : key === 'microsoft-component'
                ? 'Microsoft'
          : key === 'third-party-app'
            ? 'Third‑party Apps'
            : key === 'macos-app'
              ? 'macOS Apps'
              : key === 'system'
                ? 'System'
                : key === 'service'
                  ? 'Services'
                  : 'Other'
    }))
  );

  const filtered = $derived(
    sortItems(
      filter === 'all' ? items : items.filter((p) => p.type === filter),
      sortKey,
      sortDir
    )
  );
  const displayed = $derived(showAll ? filtered : filtered.slice(0, 10));

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      sortDir = sortDir === 'desc' ? 'asc' : 'desc';
    } else {
      sortKey = key;
      sortDir = 'desc';
    }
  }

  function sortGlyph(active: boolean, dir: SortDir): string {
    if (!active) return '⇅';
    return dir === 'desc' ? '↓' : '↑';
  }

  function microPct(value: number, max: number): number {
    if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) return 0;
    return Math.max(0, Math.min(100, (value / max) * 100));
  }

  function isDimUser(u: string): boolean {
    return u === 'root' || u.startsWith('_');
  }
</script>

<div class="space-y-3">
  <!-- Header -->
  <div>
    <div class="text-[13px] font-semibold text-foreground">{title}</div>
    <div class="mt-0.5 text-[12px] text-muted-foreground">
      {items.length} processes · sorted by {sortKey.toUpperCase()} {sortDir === 'desc' ? '↓' : '↑'}
    </div>
  </div>

  <!-- Filters -->
  <div class="flex flex-wrap gap-2">
    {#each visibleFilters as f (f.key)}
      <button
        type="button"
        class={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors ${
          filter === (f.key as any)
            ? 'border border-blue-400 bg-blue-50 text-blue-700'
            : 'border border-border bg-background text-muted-foreground hover:bg-muted/30'
        }`}
        onclick={() => {
          filter = f.key as any;
          expandedPid = null;
          showAll = false;
        }}
      >
        {f.label}
        <span
          class={`ml-0.5 rounded-full px-1.5 text-[10px] font-semibold ${
            filter === (f.key as any) ? 'bg-blue-100 text-blue-700' : 'bg-muted/40 text-muted-foreground'
          }`}
        >
          {counts[f.key as TypeFilter] ?? 0}
        </span>
      </button>
    {/each}
  </div>

  <!-- Table -->
  <div class="overflow-hidden rounded-xl border border-border bg-background">
    <!-- Header row -->
    <div class="grid grid-cols-[1fr_120px_120px_90px] border-b border-border bg-muted/20">
      <button
        type="button"
        class={`flex items-center px-3 py-2 text-[10.5px] font-bold uppercase tracking-wider ${
          sortKey === 'name' ? 'text-blue-600' : 'text-muted-foreground'
        }`}
        onclick={() => toggleSort('name')}
      >
        Process <span class="ml-1 text-[10px]">{sortGlyph(sortKey === 'name', sortDir)}</span>
      </button>
      <button
        type="button"
        class={`flex items-center px-2 py-2 text-[10.5px] font-bold uppercase tracking-wider ${
          sortKey === 'cpu' ? 'text-blue-600' : 'text-muted-foreground'
        }`}
        onclick={() => toggleSort('cpu')}
      >
        CPU <span class="ml-1 text-[10px]">{sortGlyph(sortKey === 'cpu', sortDir)}</span>
      </button>
      <button
        type="button"
        class={`flex items-center px-2 py-2 text-[10.5px] font-bold uppercase tracking-wider ${
          sortKey === 'mem' ? 'text-blue-600' : 'text-muted-foreground'
        }`}
        onclick={() => toggleSort('mem')}
      >
        Memory <span class="ml-1 text-[10px]">{sortGlyph(sortKey === 'mem', sortDir)}</span>
      </button>
      <button
        type="button"
        class={`flex items-center px-2 py-2 text-[10.5px] font-bold uppercase tracking-wider ${
          sortKey === 'user' ? 'text-blue-600' : 'text-muted-foreground'
        }`}
        onclick={() => toggleSort('user')}
      >
        User <span class="ml-1 text-[10px]">{sortGlyph(sortKey === 'user', sortDir)}</span>
      </button>
    </div>

    {#if displayed.length === 0}
      <div class="p-4 text-[12px] text-muted-foreground">No processes match the current filter.</div>
    {:else}
      {#each displayed as proc (proc.pid)}
        {@const expanded = expandedPid === proc.pid}
        <div class="border-b border-border/40 last:border-b-0">
          <div
            class={`grid grid-cols-[1fr_120px_120px_90px] cursor-pointer transition-colors ${
              expanded ? 'bg-muted/20' : 'hover:bg-muted/10'
            }`}
            role="button"
            tabindex="0"
            onclick={() => (expandedPid = expanded ? null : proc.pid)}
            onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && (expandedPid = expanded ? null : proc.pid)}
          >
            <!-- Name cell -->
            <div class="flex items-center gap-2 px-3 py-2 min-w-0">
              <Badge variant="outline" class={`text-[10px] uppercase tracking-wide ${typeBadgeClasses(proc.type)}`}>
                {typeLabel(proc.type)}
              </Badge>
              <span
                class={`min-w-0 truncate text-[13px] ${proc.isHelper ? 'font-normal text-muted-foreground' : 'font-semibold text-foreground'}`}
                title={proc.command}
              >
                {proc.isHelper ? `↳ ${proc.shortName}` : proc.shortName}
              </span>
            </div>

            <!-- CPU cell -->
            <div class="flex items-center gap-2 px-2 py-2">
              <div class="h-1.5 w-[60px] overflow-hidden rounded bg-muted/50">
                <div
                  class="h-full rounded"
                  style:width={`${microPct(proc.cpu, maxCpu)}%`}
                  style:background={cpuColor(proc.cpu)}
                ></div>
              </div>
              <span
                class="min-w-[42px] text-right font-mono text-[12px] font-semibold"
                style:color={cpuColor(proc.cpu)}
              >
                {proc.cpu.toFixed(1)}%
              </span>
            </div>

            <!-- MEM cell -->
            <div class="flex items-center gap-2 px-2 py-2">
              <div class="h-1.5 w-[60px] overflow-hidden rounded bg-muted/50">
                <div
                  class="h-full rounded"
                  style:width={`${microPct(proc.mem, maxMem)}%`}
                  style:background={memColor(proc.mem)}
                ></div>
              </div>
              <span
                class="min-w-[42px] text-right font-mono text-[12px] font-semibold"
                style:color={memColor(proc.mem)}
              >
                {proc.mem.toFixed(1)}%
              </span>
            </div>

            <!-- USER cell -->
            <div class="px-2 py-2">
              <span
                class={`font-mono text-[11px] font-medium ${isDimUser(proc.user) ? 'text-muted-foreground' : 'text-slate-700'}`}
              >
                {proc.user}
              </span>
            </div>
          </div>

          {#if expanded}
            <div class="bg-muted/10 px-3 py-3 text-[11.5px] font-mono text-muted-foreground">
              <div class="grid grid-cols-[60px_1fr] gap-x-3 gap-y-1">
                <span class="text-muted-foreground/70">PID</span>
                <span class="text-foreground/80">{proc.pid}</span>

                <span class="text-muted-foreground/70">Type</span>
                <span class="text-foreground/80">{typeLabel(proc.type)}</span>

                <span class="text-muted-foreground/70">User</span>
                <span class="text-foreground/80">{proc.user}</span>

                <span class="text-muted-foreground/70">Path</span>
                <div class="min-w-0">
                  <CopyButton
                    text={proc.command}
                    size="sm"
                    variant="ghost"
                    class="h-auto min-h-6 px-2 font-mono text-[11px] text-muted-foreground hover:text-foreground whitespace-normal break-all text-left"
                  >
                    {proc.command}
                  </CopyButton>
                </div>
              </div>
            </div>
          {/if}
        </div>
      {/each}

      {#if filtered.length > 10}
        <div class="border-t border-border/40 p-3 text-center">
          <button
            type="button"
            class="rounded-md border border-border px-4 py-1.5 text-[12px] text-muted-foreground hover:bg-muted/30"
            onclick={() => (showAll = !showAll)}
          >
            {showAll ? 'Show top 10' : `Show all ${filtered.length} processes`}
          </button>
        </div>
      {/if}
    {/if}
  </div>
</div>

