<script lang="ts">
  import ReportPage from '$lib/report/ReportPage.svelte';

  let { data } = $props();
</script>

<ReportPage {data} />
