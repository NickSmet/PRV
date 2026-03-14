<script lang="ts">
	import LogTimelineWorkspace from '$lib/lab/log-timeline/LogTimelineWorkspace.svelte';
	import type { LogWorkspacePageData } from '$lib/lab/log-workspace/types';

	let { data }: { data: LogWorkspacePageData } = $props();
</script>

<LogTimelineWorkspace {data} />
