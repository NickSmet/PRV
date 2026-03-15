<script lang="ts">
  import { Clipboard, X } from '@lucide/svelte';

  import type { LogRow } from '$lib/logs/index/types';

  import { colorForSource, sourceLabel, VIEWER_COLORS, VIEWER_FONTS } from './theme';

  let {
    selectedRow,
    detailOpen,
    onClose,
    onCopyRaw,
    fillContainer = false
  }: {
    selectedRow: LogRow | null;
    detailOpen: boolean;
    onClose: () => void;
    onCopyRaw: (row: LogRow) => void | Promise<void>;
    /**
     * When true the component fills its parent container (width 100 %, height 100 %).
     * Use this when the parent is a resizable pane that controls the width.
     * When false (default) the component controls its own width via animation,
     * which is the behaviour used by the standalone LogViewer route.
     */
    fillContainer?: boolean;
  } = $props();

  const showDetail = $derived(detailOpen && !!selectedRow);
</script>

{#if fillContainer}
  <!--
    Resizable-pane mode: the parent pane controls our width.
    We just fill the available space and show content when detail is open.
  -->
  <div
    style={`height:100%; background:${VIEWER_COLORS.panelBg}; overflow:hidden; border-left:1px solid ${VIEWER_COLORS.b1}; display:flex; flex-direction:column;`}
  >
    {#if showDetail && selectedRow}
    {@const lc = colorForSource(selectedRow.sourceFile)}
    <div style={`display:flex; align-items:center; justify-content:space-between; padding:8px 10px; border-bottom:1px solid ${VIEWER_COLORS.b1}; background:#fff;`}>
      <div style={`font-size:11px; font-family:${VIEWER_FONTS.mono}; color:${lc.fg}; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;`}>
        {sourceLabel(selectedRow.sourceFile)}:{selectedRow.lineNo}
      </div>
      <button
        type="button"
        onclick={onClose}
        style={`background:transparent; border:none; cursor:pointer; color:${VIEWER_COLORS.t3}; padding:2px;`}
        aria-label="Close details"
      >
        <X class="h-4 w-4" />
      </button>
    </div>

    <div style="padding:8px 10px; overflow:auto;">
      <div style={`display:grid; grid-template-columns:65px 1fr; gap:2px 6px; font-size:10.5px; margin-bottom:8px;`}>
        <span style={`color:${VIEWER_COLORS.t3}; font-weight:500;`}>source</span>
        <span style={`font-family:${VIEWER_FONTS.mono}; font-size:10px; color:${VIEWER_COLORS.t2};`}>{sourceLabel(selectedRow.sourceFile)}</span>

        <span style={`color:${VIEWER_COLORS.t3}; font-weight:500;`}>kind</span>
        <span style={`font-family:${VIEWER_FONTS.mono}; font-size:10px; color:${VIEWER_COLORS.t2};`}>{selectedRow.kind}</span>

        <span style={`color:${VIEWER_COLORS.t3}; font-weight:500;`}>level</span>
        <span style={`font-family:${VIEWER_FONTS.mono}; font-size:10px; color:${VIEWER_COLORS.t2};`}>{selectedRow.level ?? '—'}</span>

        <span style={`color:${VIEWER_COLORS.t3}; font-weight:500;`}>line</span>
        <span style={`font-family:${VIEWER_FONTS.mono}; font-size:10px; color:${VIEWER_COLORS.t2};`}>{selectedRow.lineNo}</span>

        <span style={`color:${VIEWER_COLORS.t3}; font-weight:500;`}>component</span>
        <span style={`font-family:${VIEWER_FONTS.mono}; font-size:10px; color:${VIEWER_COLORS.t2};`}>{selectedRow.component ?? '—'}</span>

        <span style={`color:${VIEWER_COLORS.t3}; font-weight:500;`}>pid</span>
        <span style={`font-family:${VIEWER_FONTS.mono}; font-size:10px; color:${VIEWER_COLORS.t2};`}>{selectedRow.pid ?? '—'}</span>

        <span style={`color:${VIEWER_COLORS.t3}; font-weight:500;`}>ctx</span>
        <span style={`font-family:${VIEWER_FONTS.mono}; font-size:10px; color:${VIEWER_COLORS.t2};`}>{selectedRow.ctx ?? '—'}</span>

        <span style={`color:${VIEWER_COLORS.t3}; font-weight:500;`}>time</span>
        <span style={`font-family:${VIEWER_FONTS.mono}; font-size:10px; color:${VIEWER_COLORS.t2};`}>{selectedRow.tsRaw ?? '—'}</span>
      </div>

      <div style="margin-bottom:8px;">
        <div style={`font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:${VIEWER_COLORS.t4}; margin-bottom:3px;`}>
          message
        </div>
        <div
          style={`padding:4px 6px; background:#fff; border:1px solid ${VIEWER_COLORS.b0}; border-radius:2px; font-size:11px; font-family:${VIEWER_FONTS.mono}; color:${VIEWER_COLORS.t1}; line-height:1.4; word-break:break-word; white-space:pre-wrap;`}
        >
          {selectedRow.message}
        </div>
      </div>

      <div>
        <div style="display:flex; align-items:center; gap:6px; margin-bottom:3px;">
          <div style={`font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:${VIEWER_COLORS.t4};`}>
            raw
          </div>
          <button
            type="button"
            onclick={() => onCopyRaw(selectedRow)}
            style={`margin-left:auto; display:inline-flex; align-items:center; gap:6px; background:transparent; border:none; cursor:pointer; color:${VIEWER_COLORS.selBorder}; font-size:9px; font-family:${VIEWER_FONTS.mono};`}
          >
            <Clipboard class="h-3.5 w-3.5" />
            Copy raw
          </button>
        </div>
        <pre
          style={`padding:4px 6px; background:#fff; border:1px solid ${VIEWER_COLORS.b0}; border-radius:2px; font-size:10px; font-family:${VIEWER_FONTS.mono}; color:${VIEWER_COLORS.t2}; line-height:1.4; margin:0; white-space:pre-wrap; word-break:break-word;`}
        >{selectedRow.raw}</pre>
      </div>
    </div>
    {/if}
  </div>
{:else}
  <!--
    Standalone mode: the component animates its own width open/closed.
    Used by the standalone /lab/logs/:reportId/viewer route.
  -->
  <div
    style={`width:${showDetail ? 300 : 0}px; border-left:${showDetail ? `1px solid ${VIEWER_COLORS.b1}` : '0'}; background:${VIEWER_COLORS.panelBg}; transition:width 120ms; overflow:hidden; flex-shrink:0;`}
  >
    {#if showDetail && selectedRow}
      {@const lc = colorForSource(selectedRow.sourceFile)}
      <div style={`display:flex; align-items:center; justify-content:space-between; padding:8px 10px; border-bottom:1px solid ${VIEWER_COLORS.b1}; background:#fff;`}>
        <div style={`font-size:11px; font-family:${VIEWER_FONTS.mono}; color:${lc.fg}; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;`}>
          {sourceLabel(selectedRow.sourceFile)}:{selectedRow.lineNo}
        </div>
        <button
          type="button"
          onclick={onClose}
          style={`background:transparent; border:none; cursor:pointer; color:${VIEWER_COLORS.t3}; padding:2px;`}
          aria-label="Close details"
        >
          <X class="h-4 w-4" />
        </button>
      </div>

      <div style="padding:8px 10px; overflow:auto;">
        <div style={`display:grid; grid-template-columns:65px 1fr; gap:2px 6px; font-size:10.5px; margin-bottom:8px;`}>
          <span style={`color:${VIEWER_COLORS.t3}; font-weight:500;`}>source</span>
          <span style={`font-family:${VIEWER_FONTS.mono}; font-size:10px; color:${VIEWER_COLORS.t2};`}>{sourceLabel(selectedRow.sourceFile)}</span>

          <span style={`color:${VIEWER_COLORS.t3}; font-weight:500;`}>kind</span>
          <span style={`font-family:${VIEWER_FONTS.mono}; font-size:10px; color:${VIEWER_COLORS.t2};`}>{selectedRow.kind}</span>

          <span style={`color:${VIEWER_COLORS.t3}; font-weight:500;`}>level</span>
          <span style={`font-family:${VIEWER_FONTS.mono}; font-size:10px; color:${VIEWER_COLORS.t2};`}>{selectedRow.level ?? '—'}</span>

          <span style={`color:${VIEWER_COLORS.t3}; font-weight:500;`}>line</span>
          <span style={`font-family:${VIEWER_FONTS.mono}; font-size:10px; color:${VIEWER_COLORS.t2};`}>{selectedRow.lineNo}</span>

          <span style={`color:${VIEWER_COLORS.t3}; font-weight:500;`}>component</span>
          <span style={`font-family:${VIEWER_FONTS.mono}; font-size:10px; color:${VIEWER_COLORS.t2};`}>{selectedRow.component ?? '—'}</span>

          <span style={`color:${VIEWER_COLORS.t3}; font-weight:500;`}>pid</span>
          <span style={`font-family:${VIEWER_FONTS.mono}; font-size:10px; color:${VIEWER_COLORS.t2};`}>{selectedRow.pid ?? '—'}</span>

          <span style={`color:${VIEWER_COLORS.t3}; font-weight:500;`}>ctx</span>
          <span style={`font-family:${VIEWER_FONTS.mono}; font-size:10px; color:${VIEWER_COLORS.t2};`}>{selectedRow.ctx ?? '—'}</span>

          <span style={`color:${VIEWER_COLORS.t3}; font-weight:500;`}>time</span>
          <span style={`font-family:${VIEWER_FONTS.mono}; font-size:10px; color:${VIEWER_COLORS.t2};`}>{selectedRow.tsRaw ?? '—'}</span>
        </div>

        <div style="margin-bottom:8px;">
          <div style={`font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:${VIEWER_COLORS.t4}; margin-bottom:3px;`}>
            message
          </div>
          <div
            style={`padding:4px 6px; background:#fff; border:1px solid ${VIEWER_COLORS.b0}; border-radius:2px; font-size:11px; font-family:${VIEWER_FONTS.mono}; color:${VIEWER_COLORS.t1}; line-height:1.4; word-break:break-word; white-space:pre-wrap;`}
          >
            {selectedRow.message}
          </div>
        </div>

        <div>
          <div style="display:flex; align-items:center; gap:6px; margin-bottom:3px;">
            <div style={`font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:${VIEWER_COLORS.t4};`}>
              raw
            </div>
            <button
              type="button"
              onclick={() => onCopyRaw(selectedRow)}
              style={`margin-left:auto; display:inline-flex; align-items:center; gap:6px; background:transparent; border:none; cursor:pointer; color:${VIEWER_COLORS.selBorder}; font-size:9px; font-family:${VIEWER_FONTS.mono};`}
            >
              <Clipboard class="h-3.5 w-3.5" />
              Copy raw
            </button>
          </div>
          <pre
            style={`padding:4px 6px; background:#fff; border:1px solid ${VIEWER_COLORS.b0}; border-radius:2px; font-size:10px; font-family:${VIEWER_FONTS.mono}; color:${VIEWER_COLORS.t2}; line-height:1.4; margin:0; white-space:pre-wrap; word-break:break-word;`}
          >{selectedRow.raw}</pre>
        </div>
      </div>
    {/if}
  </div>
{/if}
