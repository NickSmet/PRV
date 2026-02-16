<script lang="ts">
  import { ReportViewer } from '@prv/report-ui-svelte';
  import type { NodeModel } from '@prv/report-viewmodel';
  import type { Marker } from '@prv/report-core';

  let { data }: {
    data: { nodes: NodeModel[]; markers: Marker[] };
  } = $props();
</script>

<main class="p-4">
  <div class="max-w-5xl">
    <ReportViewer context="web" nodes={data.nodes} markers={data.markers} />
  </div>
</main>

