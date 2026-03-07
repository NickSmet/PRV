<script lang="ts">
  import { untrack } from 'svelte';
  import { Timeline } from '@prv/report-ui-svelte';
  import { Copy, RefreshCw } from '@lucide/svelte';

  import type { TimelineEvent } from '$lib/lab/timeline/types';
  import { inferBaseYear, parseParallelsSystemLog, parseVmLog } from '$lib/lab/timeline/parsers';
  import { buildVisTimeline, type BuiltTimeline } from '$lib/lab/timeline/buildVisPayload';

  type PageData = {
    reportId: string;
    fixtureOk: boolean;
    timezoneOffsetSeconds: number | null;
    yearHint?: number | null;
    files: Array<{ filename: string; size: number }>;
    defaultSelected: string[];
  };

  let { data }: { data: PageData } = $props();

  let filter = $state('');
  const initialSelected = $derived.by(() => data.defaultSelected ?? []);
  let selectedFiles = $state<string[]>([]);

  let loading = $state(false);
  let error = $state<string | null>(null);
  let fileTextByName = $state<Record<string, { text: string; truncated: boolean }>>({});

  let built = $state<BuiltTimeline | null>(null);
  let eventById = $state<Record<string, TimelineEvent>>({});
  let selectedEvent = $state<TimelineEvent | null>(null);
  let debug = $state<{ year: number; events: number } | null>(null);

  $effect.pre(() => {
    // Reset defaults when route data changes (e.g. navigation between fixture reportIds).
    selectedFiles = initialSelected;
    selectedEvent = null;
  });

  function fmtBytes(bytes: number): string {
    if (!Number.isFinite(bytes)) return '';
    const kb = 1024;
    const mb = kb * 1024;
    if (bytes >= mb) return `${(bytes / mb).toFixed(1)} MiB`;
    if (bytes >= kb) return `${Math.round(bytes / kb)} KiB`;
    return `${bytes} B`;
  }

  function groupName(filename: string): 'System' | 'VM' | 'Other' {
    const f = filename.toLowerCase();
    if (f === 'vm.log' || f.startsWith('vm-') || f.startsWith('vm.')) return 'VM';
    if (f === 'tools.log' || f.startsWith('tools-') || f.includes('config.pvs')) return 'VM';
    if (f.includes('parallels') || f.includes('system') || f.includes('dmesg') || f.includes('install') || f.includes('unified')) return 'System';
    return 'Other';
  }

  function toggleFile(filename: string) {
    if (selectedFiles.includes(filename)) {
      selectedFiles = selectedFiles.filter((f) => f !== filename);
    } else {
      selectedFiles = [...selectedFiles, filename];
    }
    selectedEvent = null;
  }

  const visibleFiles = $derived.by(() => {
    const q = filter.trim().toLowerCase();
    const base = q
      ? data.files.filter((f) => f.filename.toLowerCase().includes(q))
      : data.files;

    const byGroup = new Map<'System' | 'VM' | 'Other', Array<{ filename: string; size: number }>>();
    for (const f of base) {
      const g = groupName(f.filename);
      const arr = byGroup.get(g) ?? [];
      arr.push(f);
      byGroup.set(g, arr);
    }

    const order: Array<'System' | 'VM' | 'Other'> = ['System', 'VM', 'Other'];
    return order
      .map((g) => ({ group: g, files: (byGroup.get(g) ?? []).sort((a, b) => a.filename.localeCompare(b.filename)) }))
      .filter((x) => x.files.length > 0);
  });

  let loadSeq = 0;
  async function loadAndParse(forceReload = false, selected: string[] = selectedFiles) {
    if (!data.fixtureOk) return;

    const seq = ++loadSeq;
    loading = true;
    error = null;

    try {
      const next = { ...$state.snapshot(fileTextByName) };

      for (const f of selected) {
        if (!forceReload && next[f]) continue;

        const res = await fetch(
          `/lab/fixtures/${encodeURIComponent(data.reportId)}/files/${encodeURIComponent(f)}?mode=head&maxBytes=2097152`
        );
        if (!res.ok) {
          const msg = await res.text().catch(() => '');
          throw new Error(msg || `HTTP ${res.status}`);
        }
        const truncated = res.headers.get('x-prv-truncated') === 'true';
        const text = await res.text();
        next[f] = { text, truncated };
      }

      if (seq !== loadSeq) return;
      fileTextByName = next;

      const selectedTexts = selected
        .map((filename) => ({ filename, text: next[filename]?.text ?? '' }))
        .filter((x) => x.text);

      const nowYear = new Date().getUTCFullYear();
      const inferredYear = data.yearHint ?? inferBaseYear(selectedTexts) ?? nowYear;
      const safeYear =
        inferredYear >= 2000 && inferredYear <= nowYear + 2 ? inferredYear : nowYear;
      const tz = data.timezoneOffsetSeconds ?? null;

      const events: TimelineEvent[] = [];
      for (const { filename, text } of selectedTexts) {
        if (filename === 'parallels-system.log') {
          events.push(
            ...parseParallelsSystemLog(text, {
              sourceFile: filename,
              year: safeYear,
              timezoneOffsetSeconds: tz
            })
          );
        } else if (filename === 'vm.log') {
          events.push(
            ...parseVmLog(text, { sourceFile: filename, year: safeYear, timezoneOffsetSeconds: tz })
          );
        }
      }

      const map: Record<string, TimelineEvent> = {};
      for (const e of events) map[e.id] = e;
      eventById = map;
      built = events.length ? buildVisTimeline(events) : null;
      debug = { year: safeYear, events: events.length };
    } catch (e) {
      if (seq !== loadSeq) return;
      error = e instanceof Error ? e.message : String(e);
      built = null;
      eventById = {};
      debug = null;
    } finally {
      if (seq === loadSeq) loading = false;
    }
  }

  $effect(() => {
    const selected = selectedFiles;
    untrack(() => {
      void loadAndParse(false, selected);
    });
  });

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
  }

  function onItemClick(item: unknown) {
    const id = (item as any)?.id as string | undefined;
    selectedEvent = (id && eventById[id]) ? eventById[id] : null;
  }

  function fmtIso(d: Date): string {
    return d.toISOString().replace('T', ' ').replace('Z', 'Z');
  }
</script>

<main class="p-4">
  <div class="mb-3 flex items-center justify-between gap-2 flex-wrap">
    <div class="flex items-center gap-2 flex-wrap">
      <a class="text-[12px] underline underline-offset-2 text-muted-foreground" href="/lab/timeline">Fixtures</a>
      <div class="text-[12px] text-muted-foreground">/</div>
      <div class="text-[14px] font-bold">Timeline</div>
      <div class="text-[12px] text-muted-foreground">Report {data.reportId}</div>
    </div>

    <button
      type="button"
      class="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background text-[12px] hover:bg-muted/20"
      onclick={() => loadAndParse(true)}
      title="Reload selected logs"
    >
      <RefreshCw class="h-4 w-4" />
      Reload
    </button>
  </div>

  {#if !data.fixtureOk}
    <div class="rounded-lg border border-border bg-background p-4 text-[12px] text-muted-foreground">
      Fixture folder not found for <code class="font-mono">report-{data.reportId}</code>.
    </div>
  {:else}
    <div class="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4">
      <section class="rounded-xl border border-border bg-background p-3">
        <div class="mb-2 flex items-center justify-between gap-2">
          <div class="text-[12px] font-semibold">Logs</div>
          <div class="text-[11px] text-muted-foreground">{selectedFiles.length} selected</div>
        </div>

        <input class="rv-search mb-2" placeholder="Filter logs…" bind:value={filter} />

        <div class="space-y-3">
          {#each visibleFiles as g (g.group)}
            <div>
              <div class="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground font-bold">
                {g.group}
              </div>
              <div class="space-y-1">
                {#each g.files as f (f.filename)}
                  <label class="flex items-center justify-between gap-2 rounded-md px-2 py-1 hover:bg-muted/20 cursor-pointer">
                    <div class="flex items-center gap-2 min-w-0">
                      <input
                        type="checkbox"
                        class="h-4 w-4"
                        checked={selectedFiles.includes(f.filename)}
                        onchange={() => toggleFile(f.filename)}
                      />
                      <div class="min-w-0">
                        <div class="text-[12px] font-medium truncate">{f.filename}</div>
                        <div class="text-[11px] text-muted-foreground">
                          {fmtBytes(f.size)}{fileTextByName[f.filename]?.truncated ? ' · truncated' : ''}
                        </div>
                      </div>
                    </div>
                  </label>
                {/each}
              </div>
            </div>
          {/each}
        </div>

        <div class="mt-3 rounded-lg border border-border bg-muted/10 p-2 text-[11px] text-muted-foreground">
          Parsers (v1): <code class="font-mono">vm.log</code>, <code class="font-mono">parallels-system.log</code>
        </div>
      </section>

      <section class="space-y-3">
        <div class="rounded-xl border border-border bg-background p-3">
          <div class="mb-2 flex items-center justify-between gap-2 flex-wrap">
            <div class="text-[12px] font-semibold">Timeline</div>
            <div class="flex items-center gap-2 flex-wrap">
              <span class="prv-pill prv-pill--apps">Apps</span>
              <span class="prv-pill prv-pill--gui">GUI</span>
              <span class="prv-pill prv-pill--config">Config</span>
              {#if loading}
                <span class="text-[11px] text-muted-foreground">Loading…</span>
              {/if}
            </div>
          </div>
          {#if debug}
            <div class="mb-2 text-[11px] text-muted-foreground">
              Parsed year: <span class="font-mono">{debug.year}</span> · events: {debug.events}
            </div>
          {/if}

          {#if error}
            <div class="rounded-lg border border-border bg-background p-3 text-[12px] text-destructive">
              {error}
            </div>
          {:else if selectedFiles.length === 0}
            <div class="rounded-lg border border-border bg-background p-3 text-[12px] text-muted-foreground">
              Select at least one log.
            </div>
          {:else if !built}
            <div class="rounded-lg border border-border bg-background p-3 text-[12px] text-muted-foreground">
              No timeline items yet (either no parser for the selected logs, or no matches).
            </div>
          {:else}
            <Timeline
              payload={{
                groups: built.groups,
                items: built.items,
                options: built.options,
                initialWindow: built.initialWindow
              }}
              {onItemClick}
            />
          {/if}
        </div>

        <div class="rounded-xl border border-border bg-background p-3">
          <div class="mb-2 flex items-center justify-between gap-2">
            <div class="text-[12px] font-semibold">Details</div>
            {#if selectedEvent?.detail}
              <button
                type="button"
                class="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background text-[12px] hover:bg-muted/20"
                onclick={() => copy(selectedEvent?.detail ?? '')}
                title="Copy details"
              >
                <Copy class="h-4 w-4" />
                Copy
              </button>
            {/if}
          </div>

          {#if !selectedEvent}
            <div class="text-[12px] text-muted-foreground">Click an item in the timeline.</div>
          {:else}
            <div class="space-y-2">
              <div class="text-[13px] font-semibold">{selectedEvent.label}</div>
              <div class="text-[11px] text-muted-foreground">
                <span class="font-mono">{selectedEvent.sourceFile}</span> · {selectedEvent.category}
              </div>
              <div class="text-[11px] text-muted-foreground">
                {fmtIso(selectedEvent.start)}
                {#if selectedEvent.end}
                  → {fmtIso(selectedEvent.end)}
                {/if}
              </div>
              {#if selectedEvent.detail}
                <pre class="mt-2 text-[11px] leading-[1.35] whitespace-pre-wrap break-words rounded-lg border border-border bg-muted/10 p-2 max-h-[260px] overflow-auto">{selectedEvent.detail}</pre>
              {/if}
            </div>
          {/if}
        </div>
      </section>
    </div>
  {/if}
</main>

<style>
  .prv-pill {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: 999px;
    border: 1px solid hsl(var(--border));
    font-size: 10px;
    line-height: 1.4;
    color: hsl(var(--muted-foreground));
    background: hsl(var(--background));
  }

  .prv-pill--apps {
    border-color: rgba(59, 130, 246, 0.35);
    color: rgba(37, 99, 235, 0.95);
  }
  .prv-pill--gui {
    border-color: rgba(100, 116, 139, 0.35);
    color: rgba(51, 65, 85, 0.95);
  }
  .prv-pill--config {
    border-color: rgba(34, 197, 94, 0.35);
    color: rgba(21, 128, 61, 0.95);
  }

  :global(.vis-item.prv-tl-item) {
    border-radius: 8px;
    border-width: 1px;
    font-size: 12px;
  }

  :global(.vis-item.prv-tl-item--apps) {
    background: rgba(59, 130, 246, 0.18);
    border-color: rgba(59, 130, 246, 0.35);
    color: rgb(30, 64, 175);
  }
  :global(.vis-item.prv-tl-item--gui) {
    background: rgba(100, 116, 139, 0.16);
    border-color: rgba(100, 116, 139, 0.35);
    color: rgb(15, 23, 42);
  }
  :global(.vis-item.prv-tl-item--config) {
    background: rgba(34, 197, 94, 0.16);
    border-color: rgba(34, 197, 94, 0.35);
    color: rgb(20, 83, 45);
  }

  :global(.vis-item.prv-tl-item--warn) {
    border-color: rgba(234, 179, 8, 0.45);
    background: rgba(234, 179, 8, 0.16);
    color: rgb(113, 63, 18);
  }
  :global(.vis-item.prv-tl-item--danger) {
    border-color: rgba(239, 68, 68, 0.45);
    background: rgba(239, 68, 68, 0.14);
    color: rgb(127, 29, 29);
  }
 </style>
