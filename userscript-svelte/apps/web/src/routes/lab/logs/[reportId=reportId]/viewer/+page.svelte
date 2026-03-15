<script lang="ts">
  import LogViewer from '$lib/logs/viewer/LogViewer.svelte';
  import type { LogViewerPageData } from '$lib/logs/viewer/types';

  let { data }: { data: LogViewerPageData } = $props();
</script>

<LogViewer {data} />
