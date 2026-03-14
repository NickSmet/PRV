<script lang="ts">
  import { RefreshCw } from '@lucide/svelte';

  import { VIEWER_COLORS, VIEWER_FONTS } from './theme';

  let {
    reportId,
    canReload,
    onReload
  }: {
    reportId: string;
    canReload: boolean;
    onReload: () => void;
  } = $props();
</script>

<div style="display:flex; align-items:center; justify-content:space-between; gap:12px; padding:8px 12px;">
  <div class="flex items-center gap-2 flex-wrap">
    <a
      style={`font-size:12px; color:${VIEWER_COLORS.t2}; text-decoration:underline; text-underline-offset:2px;`}
      href="/lab/logs"
    >
      Logs
    </a>
    <span style={`color:${VIEWER_COLORS.t3}; font-size:12px;`}>/</span>
    <a
      style={`font-size:12px; color:${VIEWER_COLORS.t2}; text-decoration:underline; text-underline-offset:2px;`}
      href={`/lab/logs/${encodeURIComponent(reportId)}`}
    >
      Debug
    </a>
    <span style={`color:${VIEWER_COLORS.t3}; font-size:12px;`}>/</span>
    <span style={`font-size:14px; font-weight:700; color:${VIEWER_COLORS.t1};`}>Viewer</span>
    <span style={`font-size:12px; color:${VIEWER_COLORS.t2};`}>Report {reportId}</span>
  </div>

  <button
    type="button"
    style={`display:inline-flex; align-items:center; gap:8px; padding:6px 10px; border-radius:6px; border:1px solid ${VIEWER_COLORS.b1}; background:#fff; font-size:12px; cursor:pointer;`}
    onclick={onReload}
    disabled={!canReload}
  >
    <RefreshCw class="h-4 w-4" />
    Reload
  </button>
</div>
