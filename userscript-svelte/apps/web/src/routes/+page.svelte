<script lang="ts">
  let reportId = $state('');

  function goMental() {
    const id = reportId.trim();
    if (!id) return;
    window.location.assign(`/${encodeURIComponent(id)}`);
  }

  function goNodes() {
    const id = reportId.trim();
    if (!id) return;
    window.location.assign(`/nodes/${encodeURIComponent(id)}`);
  }

  function goLab() {
    const id = reportId.trim();
    if (!id) return;
    window.location.assign(`/lab/${encodeURIComponent(id)}`);
  }
</script>

<main class="p-4">
  <div class="mb-3 flex items-center gap-2">
    <input
      class="rv-search max-w-xs"
      placeholder="Report ID (e.g. 512022712)"
      bind:value={reportId}
      onkeydown={(e) => e.key === 'Enter' && goMental()}
    />
    <button class="px-3 py-2 rounded-lg border border-border bg-background text-[13px]" onclick={goMental}>
      Mental view
    </button>
    <button class="px-3 py-2 rounded-lg border border-border bg-background text-[13px]" onclick={goLab}>
      Mental view (lab icons)
    </button>
    <button class="px-3 py-2 rounded-lg border border-border bg-background text-[13px]" onclick={goNodes}>
      Node view
    </button>
    <a class="px-3 py-2 rounded-lg border border-border bg-background text-[13px]" href="/lab/icons">
      Icon gallery
    </a>
  </div>
</main>
