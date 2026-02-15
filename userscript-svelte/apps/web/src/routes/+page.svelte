<script lang="ts">
  import { ReportViewer } from '@prv/report-ui-svelte';
  import type { NodeModel } from '@prv/report-viewmodel';
  import type { Marker } from '@prv/report-core';

  let reportId = $state('');
  let loading = $state(false);
  let error = $state<string | null>(null);

  let nodes = $state<NodeModel[]>([]);
  let markers = $state<Marker[]>([]);

  async function load() {
    error = null;
    nodes = [];
    markers = [];
    const id = reportId.trim();
    if (!id) return;

    loading = true;
    try {
      const res = await fetch(`/api/reports/${encodeURIComponent(id)}/model`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = (await res.json()) as { nodes: NodeModel[]; markers: Marker[] };
      nodes = data.nodes;
      markers = data.markers;
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    } finally {
      loading = false;
    }
  }
</script>

<main class="p-4">
  <div class="mb-3 flex items-center gap-2">
    <input
      class="rv-search max-w-xs"
      placeholder="Report ID (e.g. 512022712)"
      bind:value={reportId}
      onkeydown={(e) => e.key === 'Enter' && load()}
    />
    <button class="px-3 py-2 rounded-lg border border-border bg-background text-[13px]" onclick={load}>
      {loading ? 'Loading…' : 'Load'}
    </button>
    {#if error}
      <div class="text-[12px] text-red-600">{error}</div>
    {/if}
  </div>

  {#if nodes.length}
    <div class="max-w-5xl">
      <ReportViewer context="web" {nodes} {markers} />
    </div>
  {/if}
</main>

