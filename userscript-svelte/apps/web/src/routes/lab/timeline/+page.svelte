<script lang="ts">
  let { data }: { data: { fixtureReportIds: string[] } } = $props();

  let filter = $state('');
  const filtered = $derived.by(() => {
    const q = filter.trim();
    if (!q) return data.fixtureReportIds;
    return data.fixtureReportIds.filter((id) => id.includes(q));
  });
</script>

<main class="p-4 max-w-5xl">
  <div class="mb-4 flex items-center justify-between gap-2 flex-wrap">
    <div class="text-[14px] font-bold">Timeline (lab fixtures)</div>
    <a class="text-[12px] underline underline-offset-2 text-muted-foreground" href="/">Back</a>
  </div>

  {#if data.fixtureReportIds.length === 0}
    <div class="rounded-lg border border-border bg-background p-4 text-[12px] text-muted-foreground">
      No fixtures found in <code class="font-mono">fixtures/reports/report-*</code>.
    </div>
  {:else}
    <div class="mb-3 flex items-center gap-2 flex-wrap">
      <input class="rv-search max-w-sm" placeholder="Filter report id…" bind:value={filter} />
      <div class="text-[12px] text-muted-foreground">{filtered.length} fixtures</div>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      {#each filtered as id (id)}
        <a
          class="rounded-lg border border-border bg-background p-3 hover:bg-muted/20 transition-colors"
          href={`/lab/timeline/${encodeURIComponent(id)}`}
        >
          <div class="text-[12px] font-semibold">Report {id}</div>
          <div class="text-[11px] text-muted-foreground">Open timeline</div>
        </a>
      {/each}
    </div>
  {/if}
</main>
