<script lang="ts">
  import type { LogRow } from '$lib/lab/log-index/types';

  import type { LogViewerFile, ViewerPlaceholderState, ViewerVirtualState } from './types';
  import { messageSegments, rowHasVisibleMatch } from './search';
  import { colorForSource, levelMeta, sourceLabel, VIEWER_COLORS, VIEWER_FONTS } from './theme';

  let {
    renderReady,
    loading,
    selectedFileMetas,
    progressByFile,
    totalRows,
    virtual,
    placeholder,
    rowHeight,
    selectedRowId,
    searchQuery,
    matchRowIdSet,
    activeMatchRowId,
    onTableElementChange,
    onViewportHeightChange,
    onScroll,
    onOpenRow
  }: {
    renderReady: boolean;
    loading: boolean;
    selectedFileMetas: LogViewerFile[];
    progressByFile: Record<string, string>;
    totalRows: number;
    virtual: ViewerVirtualState;
    placeholder: ViewerPlaceholderState;
    rowHeight: number;
    selectedRowId: string | null;
    searchQuery: string;
    matchRowIdSet: Set<string>;
    activeMatchRowId: string | null;
    onTableElementChange: (element: HTMLDivElement | null) => void;
    onViewportHeightChange: (value: number) => void;
    onScroll: (event: Event) => void;
    onOpenRow: (row: LogRow) => void;
  } = $props();

  let localTableElement = $state<HTMLDivElement | null>(null);
  let localViewportHeight = $state(0);

  $effect(() => {
    onTableElementChange(localTableElement);
  });

  $effect(() => {
    onViewportHeightChange(localViewportHeight);
  });
</script>

<div style="flex:1; display:flex; flex-direction:column; overflow:hidden; min-width:0;">
  <div
    style={`display:flex; align-items:center; padding:0 8px; height:22px; border-bottom:1px solid ${VIEWER_COLORS.b1}; background:${VIEWER_COLORS.panelBg}; flex-shrink:0; font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; color:${VIEWER_COLORS.t3}; user-select:none;`}
  >
    <span style="width:70px; flex-shrink:0;">Source</span>
    <span style="width:126px; flex-shrink:0;">Time</span>
    <span style="width:18px; flex-shrink:0; text-align:center;">Lv</span>
    <span style="width:90px; flex-shrink:0; padding-left:6px;">Comp</span>
    <span style="width:80px; flex-shrink:0; padding-left:4px;">Pid:ctx</span>
    <span style="flex:1; padding-left:4px;">Message</span>
  </div>

  <div
    bind:this={localTableElement}
    style="flex:1; overflow:auto; overflow-anchor:none;"
    bind:clientHeight={localViewportHeight}
    onscroll={onScroll}
  >
    {#if !renderReady}
      <div style={`padding:12px; font-family:${VIEWER_FONTS.mono}; font-size:11px; color:${VIEWER_COLORS.t2};`}>
        {#if loading}
          <div style="margin-bottom:6px;">Loading…</div>
          <div style={`display:flex; flex-direction:column; gap:2px;`}>
            {#each selectedFileMetas as file (file.filename)}
              {@const msg = progressByFile[file.filename]}
              {#if msg}
                {@const lc = colorForSource(file.filename)}
                <div style="display:flex; gap:6px; align-items:baseline;">
                  <span style={`width:80px; flex-shrink:0; color:${lc.fg}; font-weight:700;`}>
                    {sourceLabel(file.filename)}
                  </span>
                  <span style="flex:1; opacity:0.85;">{msg}</span>
                </div>
              {/if}
            {/each}
          </div>
        {:else}
          Waiting for indexed rows…
        {/if}
      </div>
    {:else if totalRows === 0}
      <div style={`padding:12px; font-family:${VIEWER_FONTS.mono}; font-size:11px; color:${VIEWER_COLORS.t2};`}>
        No rows.
      </div>
    {:else if virtual.rows.length > 0}
      {#if virtual.topPad > 0}
        <div style={`height:${virtual.topPad}px;`}></div>
      {/if}

      {#each virtual.rows as row, i (row.id)}
        {@const idx = virtual.start + i}
        {@const isSel = selectedRowId === row.id}
        {@const isMatch = matchRowIdSet.has(row.id)}
        {@const isActiveMatch = activeMatchRowId === row.id}
        {@const lc = colorForSource(row.sourceFile)}
        {@const lvl = levelMeta(row.level)}
        {@const isF = row.level === 'F'}
        {@const baseBg = idx % 2 === 0 ? '#fff' : '#FAFBFD'}
        {@const matchBg = isActiveMatch ? '#FEF3C7' : isMatch ? '#FFFBEB' : null}
        {@const bg = isSel ? VIEWER_COLORS.sel : matchBg ?? (isF ? (idx % 2 === 0 ? '#FFFBFB' : '#FFF5F5') : baseBg)}
        {@const leftBorder = isSel || isActiveMatch ? `2px solid ${VIEWER_COLORS.selBorder}` : '2px solid transparent'}
        {@const hasVisibleMatch = rowHasVisibleMatch(row, searchQuery)}

        <button
          type="button"
          class="tight-row"
          style={`display:flex; align-items:center; padding:0 8px; height:${rowHeight}px; min-height:${rowHeight}px; border:none; border-left:${leftBorder}; border-bottom:1px solid ${VIEWER_COLORS.b0}; background:${bg}; cursor:pointer; user-select:none; transition:background 40ms; width:100%; text-align:left; outline:none;`}
          onclick={() => onOpenRow(row)}
        >
          <span
            style={`width:70px; flex-shrink:0; font-size:10px; font-family:${VIEWER_FONTS.mono}; font-weight:600; color:${lc.fg}; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;`}
            title={row.sourceFile}
          >
            {sourceLabel(row.sourceFile)}
          </span>
          <span
            style={`width:126px; flex-shrink:0; font-size:10px; font-family:${VIEWER_FONTS.mono}; color:${VIEWER_COLORS.t2};`}
          >
            {row.tsRaw ?? ''}
          </span>
          <span style="width:18px; flex-shrink:0; display:flex; justify-content:center;">
            <span
              style={`display:inline-flex; align-items:center; justify-content:center; width:16px; height:16px; border-radius:2px; font-size:9px; font-weight:700; font-family:${VIEWER_FONTS.mono}; background:${lvl.bg}; color:${lvl.color}; line-height:1; flex-shrink:0;`}
            >
              {lvl.label}
            </span>
          </span>
          <span
            style={`width:90px; flex-shrink:0; padding-left:6px; font-size:10px; font-family:${VIEWER_FONTS.mono}; color:${VIEWER_COLORS.t2}; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;`}
            title={row.component ?? ''}
          >
            {row.component ?? ''}
          </span>
          <span
            style={`width:80px; flex-shrink:0; padding-left:4px; font-size:10px; font-family:${VIEWER_FONTS.mono}; color:${VIEWER_COLORS.t2}; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;`}
          >
            {row.pid != null || row.ctx ? `${row.pid ?? ''}:${row.ctx ?? ''}` : ''}
          </span>
          <span style="flex:1; padding-left:4px; min-width:0;">
            <span class="tight-msg" style={`font-family:${VIEWER_FONTS.mono}; font-size:11px; color:${VIEWER_COLORS.t1};`}>
              {#if hasVisibleMatch}
                {#each messageSegments(row.message, searchQuery) as segment, segmentIndex (`${row.id}:${segmentIndex}`)}
                  {#if segment.match}
                    <mark
                      style={`background:${isActiveMatch ? '#FDE68A' : '#FEF08A'}; color:${VIEWER_COLORS.t0}; padding:0 1px; border-radius:2px;`}
                    >
                      {segment.text}
                    </mark>
                  {:else}
                    {segment.text}
                  {/if}
                {/each}
              {:else}
                {row.message}
              {/if}
            </span>
          </span>
        </button>
      {/each}

      {#if virtual.bottomPad > 0}
        <div style={`height:${virtual.bottomPad}px;`}></div>
      {/if}
    {:else if placeholder}
      {#if placeholder.topPad > 0}
        <div style={`height:${placeholder.topPad}px;`}></div>
      {/if}

      {#each Array(placeholder.count) as _, i (i)}
        <div
          style={`display:flex; align-items:center; padding:0 8px; height:${rowHeight}px; min-height:${rowHeight}px; border-bottom:1px solid ${VIEWER_COLORS.b0}; background:${i % 2 === 0 ? '#fff' : '#FAFBFD'};`}
        >
          <span style={`width:70px; flex-shrink:0;`}></span>
          <span style={`width:126px; flex-shrink:0;`}></span>
          <span style={`width:18px; flex-shrink:0;`}></span>
          <span style={`width:90px; flex-shrink:0;`}></span>
          <span style={`width:80px; flex-shrink:0;`}></span>
          <span style="flex:1; padding-left:4px; min-width:0;">
            <span style={`font-family:${VIEWER_FONTS.mono}; font-size:10px; color:${VIEWER_COLORS.t4};`}>
              Loading…
            </span>
          </span>
        </div>
      {/each}

      {#if placeholder.bottomPad > 0}
        <div style={`height:${placeholder.bottomPad}px;`}></div>
      {/if}
    {/if}
  </div>
</div>

<style>
  .tight-msg {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    white-space: normal;
    word-break: break-word;
    line-height: 1.25;
  }

  .tight-row:hover {
    filter: saturate(1.02);
  }
</style>
