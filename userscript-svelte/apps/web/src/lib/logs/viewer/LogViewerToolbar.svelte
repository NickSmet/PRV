<script lang="ts">
  import { ChevronDown, ChevronUp, Loader, Search, X } from '@lucide/svelte';

  import type { LogViewerFile, ViewerStats } from './types';
  import { colorForSource, fmtSize, sourceLabel, VIEWER_COLORS, VIEWER_FONTS, LEVEL_META } from './theme';

  let {
    files,
    selectedFiles,
    stats,
    clipped,
    totalRows,
    totalMatches,
    searchInput,
    searchQuery,
    matchCount,
    activeMatchOrdinal,
    findLoading = false,
    showFileToggles = true,
    onToggleFile,
    onSearchInput,
    onClearSearch,
    onSearchKeydown,
    onMoveMatch,
    onJumpToMatch
  }: {
    files: LogViewerFile[];
    selectedFiles: string[];
    stats: ViewerStats;
    clipped: boolean;
    totalRows: number;
    totalMatches: number;
    searchInput: string;
    searchQuery: string;
    matchCount: number;
    activeMatchOrdinal: number;
    /** When true, shows a spinner and "Searching…" status instead of match navigation. */
    findLoading?: boolean;
    showFileToggles?: boolean;
    onToggleFile: (filename: string) => void;
    onSearchInput: (value: string) => void;
    onClearSearch: () => void;
    onSearchKeydown: (event: KeyboardEvent) => void;
    onMoveMatch: (delta: -1 | 1) => void;
    /** Jump to a specific match ordinal (0-based). Optional for backwards compatibility. */
    onJumpToMatch?: (ordinal: number) => void;
  } = $props();

  let jumpInput = $state('');

  function commitJump() {
    if (!onJumpToMatch) return;
    const raw = jumpInput.trim();
    if (!raw) return;
    const n = Number.parseInt(raw, 10);
    if (!Number.isFinite(n)) return;
    if (matchCount <= 0) return;
    const clamped = Math.max(1, Math.min(n, matchCount));
    onJumpToMatch(clamped - 1);
    jumpInput = '';
  }

  function handleJumpKeydown(event: KeyboardEvent) {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    commitJump();
  }
</script>

<div
  style={`display:flex; align-items:center; gap:8px; padding:6px 12px; border-top:1px solid ${VIEWER_COLORS.b1}; border-bottom:1px solid ${VIEWER_COLORS.b1}; background:${VIEWER_COLORS.headerBg}; flex-shrink:0;`}
>
  {#if showFileToggles}
    {#each files as file (file.filename)}
      {@const lc = colorForSource(file.filename)}
      {@const on = selectedFiles.includes(file.filename)}
      <button
        type="button"
        onclick={() => onToggleFile(file.filename)}
        style={`display:flex; align-items:center; gap:5px; padding:3px 8px; border-radius:4px; cursor:pointer; border:1px solid ${on ? lc.border : VIEWER_COLORS.b1}; background:${on ? lc.bg : '#fff'}; opacity:${on ? 1 : 0.45}; transition:all 80ms; user-select:none;`}
      >
        <span
          style={`width:10px; height:10px; border-radius:2px; border:1.5px solid ${on ? lc.fg : VIEWER_COLORS.b1}; background:${on ? lc.fg : 'transparent'}; display:flex; align-items:center; justify-content:center; flex-shrink:0;`}
        >
          {#if on}
            <svg width="7" height="7" viewBox="0 0 12 12" aria-hidden="true">
              <path
                d="M2 6l3 3 5-5"
                stroke="#fff"
                stroke-width="2"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          {/if}
        </span>
        <span style={`font-size:11px; font-weight:600; font-family:${VIEWER_FONTS.mono}; color:${on ? lc.fg : VIEWER_COLORS.t3};`}>
          {sourceLabel(file.filename)}
        </span>
        <span style={`font-size:9px; font-family:${VIEWER_FONTS.mono}; color:${on ? lc.fg : VIEWER_COLORS.t4}; opacity:0.6;`}>
          {fmtSize(file.size)}
        </span>
      </button>
    {/each}
  {/if}

  <div style="flex:1"></div>

  <div style="display:flex; gap:3px; align-items:center;">
    {#if stats.F > 0}
      <span style={`font-size:9px; font-family:${VIEWER_FONTS.mono}; font-weight:700; color:${LEVEL_META.F.color}; background:${LEVEL_META.F.bg}; padding:1px 4px; border-radius:2px;`}>
        {stats.F} F
      </span>
    {/if}
    {#if stats.W > 0}
      <span style={`font-size:9px; font-family:${VIEWER_FONTS.mono}; font-weight:700; color:${LEVEL_META.W.color}; background:${LEVEL_META.W.bg}; padding:1px 4px; border-radius:2px;`}>
        {stats.W} W
      </span>
    {/if}
    <span style={`font-size:9px; font-family:${VIEWER_FONTS.mono}; color:${VIEWER_COLORS.t4};`}>
      {clipped ? totalMatches.toLocaleString() : totalRows.toLocaleString()} rows
    </span>
  </div>

  <div style={`width:1px; height:18px; background:${VIEWER_COLORS.b2};`}></div>

  <div style="display:flex; align-items:center; gap:8px;">
    <div style="position:relative;">
      <input
        type="text"
        placeholder="Find in logs…"
        value={searchInput}
        oninput={(event) => onSearchInput((event.currentTarget as HTMLInputElement).value)}
        onkeydown={onSearchKeydown}
        style={`width:220px; padding:4px 28px 4px 24px; font-size:11px; font-family:${VIEWER_FONTS.mono}; border:1px solid ${findLoading ? VIEWER_COLORS.b2 : VIEWER_COLORS.b1}; border-radius:3px; outline:none; background:#fff; color:${VIEWER_COLORS.t1};`}
      />
      <span style="position:absolute; left:7px; top:6px; opacity:0.35;">
        <Search class="h-3 w-3" />
      </span>
      {#if searchInput || findLoading}
        <button
          type="button"
          onclick={onClearSearch}
          style={`position:absolute; right:6px; top:4px; cursor:pointer; background:transparent; border:none; padding:0; color:${VIEWER_COLORS.t4};`}
          aria-label={findLoading ? 'Cancel search' : 'Clear search'}
          title={findLoading ? 'Cancel search' : 'Clear search'}
        >
          <X class="h-3.5 w-3.5" />
        </button>
      {/if}
    </div>

    {#if searchInput && (findLoading || searchQuery)}
      <div style={`display:flex; align-items:center; gap:8px; font-family:${VIEWER_FONTS.mono};`}>
        {#if findLoading}
          <!-- Searching... indicator -->
          <span
            style={`display:inline-flex; align-items:center; gap:5px; font-size:11px; color:${VIEWER_COLORS.t3};`}
          >
            <span class="prv-spin" style="display:inline-flex; color:#6366F1;">
              <Loader class="h-3.5 w-3.5" />
            </span>
            Searching…
          </span>
        {:else if searchQuery}
          <span style={`font-size:11px; color:${matchCount > 0 ? VIEWER_COLORS.t1 : VIEWER_COLORS.t4}; min-width:42px; text-align:right;`}>
            {#if matchCount > 0 && activeMatchOrdinal >= 0}
              {activeMatchOrdinal + 1} of {matchCount.toLocaleString()}
            {:else}
              0 of {matchCount.toLocaleString()}
            {/if}
          </span>

          {#if onJumpToMatch && matchCount > 0}
            <input
              type="text"
              inputmode="numeric"
              pattern="[0-9]*"
              value={jumpInput}
              oninput={(event) => (jumpInput = (event.currentTarget as HTMLInputElement).value)}
              onkeydown={handleJumpKeydown}
              placeholder={`Go (1–${matchCount})`}
              title={`Jump to match (1–${matchCount.toLocaleString()})`}
              style={`width:92px; padding:3px 6px; font-size:11px; font-family:${VIEWER_FONTS.mono}; border:1px solid ${VIEWER_COLORS.b1}; border-radius:3px; outline:none; background:#fff; color:${VIEWER_COLORS.t1};`}
            />
          {/if}

          <button
            type="button"
            onclick={() => onMoveMatch(-1)}
            disabled={matchCount === 0}
            style={`display:inline-flex; align-items:center; justify-content:center; width:20px; height:20px; border:1px solid ${VIEWER_COLORS.b1}; border-radius:3px; background:#fff; color:${matchCount === 0 ? VIEWER_COLORS.t4 : VIEWER_COLORS.t1}; cursor:${matchCount === 0 ? 'default' : 'pointer'}; opacity:${matchCount === 0 ? 0.45 : 1};`}
            aria-label="Previous match"
          >
            <ChevronUp class="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onclick={() => onMoveMatch(1)}
            disabled={matchCount === 0}
            style={`display:inline-flex; align-items:center; justify-content:center; width:20px; height:20px; border:1px solid ${VIEWER_COLORS.b1}; border-radius:3px; background:#fff; color:${matchCount === 0 ? VIEWER_COLORS.t4 : VIEWER_COLORS.t1}; cursor:${matchCount === 0 ? 'default' : 'pointer'}; opacity:${matchCount === 0 ? 0.45 : 1};`}
            aria-label="Next match"
          >
            <ChevronDown class="h-3.5 w-3.5" />
          </button>
        {/if}
      </div>
    {/if}
  </div>

<style>
  @keyframes prv-spin {
    to { transform: rotate(360deg); }
  }
  .prv-spin {
    animation: prv-spin 0.8s linear infinite;
  }
</style>
</div>
