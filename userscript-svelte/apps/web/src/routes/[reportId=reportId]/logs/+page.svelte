<script lang="ts">
	import LogTimelineWorkspace from '$lib/logs/timeline/LogTimelineWorkspace.svelte';
	import type { LogWorkspacePageData } from '$lib/logs/workspace/types';

	let { data }: { data: LogWorkspacePageData } = $props();
</script>

<LogTimelineWorkspace {data} />
