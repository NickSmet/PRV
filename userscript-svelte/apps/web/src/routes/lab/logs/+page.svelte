<script lang="ts">
  let { data }: { data: { fixtureReportIds: string[] } } = $props();

  let filter = $state('');
  let reportId = $state('');
  const filtered = $derived.by(() => {
    const q = filter.trim();
    if (!q) return data.fixtureReportIds;
    return data.fixtureReportIds.filter((id) => id.includes(q));
  });

  function openReport() {
    const id = reportId.trim();
    if (!id) return;
    window.location.assign(`/lab/logs/${encodeURIComponent(id)}`);
  }
</script>

<main class="p-4 max-w-5xl">
  <div class="mb-4 flex items-center justify-between gap-2 flex-wrap">
    <div class="text-[14px] font-bold">Logs</div>
    <a class="text-[12px] underline underline-offset-2 text-muted-foreground" href="/">Back</a>
  </div>

  <div class="mb-4 rounded-lg border border-border bg-background p-3">
    <div class="mb-2 text-[12px] font-semibold">Open report</div>
    <div class="flex items-center gap-2 flex-wrap">
      <input
        class="rv-search max-w-sm"
        placeholder="Report ID (e.g. 512022712)"
        bind:value={reportId}
        onkeydown={(event) => event.key === 'Enter' && openReport()}
      />
      <button class="px-3 py-2 rounded-lg border border-border bg-background text-[12px]" onclick={openReport}>
        Open log parser
      </button>
      <a
        class="px-3 py-2 rounded-lg border border-border bg-background text-[12px]"
        href={reportId.trim() ? `/lab/logs/${encodeURIComponent(reportId.trim())}/viewer` : '/lab/logs'}
      >
        Open viewer
      </a>
    </div>
    <div class="mt-2 text-[11px] text-muted-foreground">
      Uses Reportus when available. Local fixtures remain available as fallback/testing input.
    </div>
  </div>

  {#if data.fixtureReportIds.length === 0}
    <div class="rounded-lg border border-border bg-background p-4 text-[12px] text-muted-foreground">
      No local fixtures found in <code class="font-mono">fixtures/reports/report-*</code>.
    </div>
  {:else}
    <div class="mb-3 flex items-center gap-2 flex-wrap">
      <input class="rv-search max-w-sm" placeholder="Filter fixture ids…" bind:value={filter} />
      <div class="text-[12px] text-muted-foreground">{filtered.length} fixture fallbacks</div>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      {#each filtered as id (id)}
        <a
          class="rounded-lg border border-border bg-background p-3 hover:bg-muted/20 transition-colors"
          href={`/lab/logs/${encodeURIComponent(id)}`}
        >
          <div class="text-[12px] font-semibold">Report {id}</div>
          <div class="text-[11px] text-muted-foreground">Open fixture fallback</div>
        </a>
      {/each}
    </div>
  {/if}
</main>
