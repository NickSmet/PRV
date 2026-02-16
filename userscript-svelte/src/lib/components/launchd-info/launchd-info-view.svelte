<script lang="ts">
  import { CopyButton } from '$ui/copy-button';
  import * as TreeView from '$lib/components/ui/tree-view';
  import type { LaunchdInfoSummary } from '../../../services/parseLaunchdInfo';
  import LaunchdInfoTreeNode from './launchd-info-tree-node.svelte';

  let { summary }: { summary: LaunchdInfoSummary } = $props();

  let tree = $derived(summary.tree);
  let stats = $derived(summary.stats);
</script>

<div class="rv-section-block">
  <div class="rv-section-heading">Overview</div>
  {#if stats}
    <div class="rv-row">
      <div class="rv-row-label">Entries</div>
      <div class="rv-row-value">
        <span class="font-mono text-[11px] text-muted-foreground">
          {stats.folders} folders, {stats.files} files
        </span>
      </div>
    </div>
    <div class="rv-row">
      <div class="rv-row-label">Root-owned files</div>
      <div class="rv-row-value">
        <span class="font-mono text-[11px] text-muted-foreground">{stats.rootOwnedFiles}</span>
      </div>
    </div>
  {:else}
    <div class="rv-row">
      <div class="rv-row-label">Status</div>
      <div class="rv-row-value">No parsed stats</div>
    </div>
  {/if}
</div>

<div class="rv-section-block">
  <div class="rv-section-heading">Tree</div>
  {#if tree}
    <div class="rounded-md border border-border bg-background p-2" style="--tv-meta-width: 18rem;">
      <TreeView.Root class="gap-1">
        <LaunchdInfoTreeNode node={tree} />
      </TreeView.Root>
    </div>
  {:else}
    <div class="rv-empty">No tree parsed (fallback listing only).</div>
  {/if}
</div>

<div class="rv-section-block">
  <div class="rv-section-heading">Raw listing (copy)</div>
  <div class="rv-row">
    <div class="rv-row-label">Text</div>
    <div class="rv-row-value">
      <CopyButton
        text={summary.formattedListing}
        size="sm"
        variant="ghost"
        class="h-auto min-h-6 px-2 font-mono text-[11px] text-muted-foreground hover:text-foreground whitespace-normal break-all text-left"
      >
        Copy formatted listing
      </CopyButton>
    </div>
  </div>
</div>

