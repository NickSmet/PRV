<script lang="ts">
  import LogViewer from '$lib/lab/log-viewer/LogViewer.svelte';
  import type { LogViewerPageData } from '$lib/lab/log-viewer/types';

  let { data }: { data: LogViewerPageData } = $props();
</script>

<LogViewer {data} />
