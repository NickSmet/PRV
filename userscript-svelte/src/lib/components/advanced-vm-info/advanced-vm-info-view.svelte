<script lang="ts">
	import { CopyButton } from '$ui/copy-button';
	import type { AdvancedVmInfoSummary, BundleFolderEntry } from '../../../services/parseAdvancedVmInfo';
	import AdvancedVmInfoBundleContents from './advanced-vm-info-bundle-contents.svelte';

	let { summary }: { summary: AdvancedVmInfoSummary } = $props();

	let tree = $derived(summary.pvmBundleTree as BundleFolderEntry | undefined);

	type Stats = { files: number; folders: number };
	function countNodes(root: BundleFolderEntry): Stats {
		let files = 0;
		let folders = 0;
		const stack = [root];
		while (stack.length) {
			const node = stack.pop()!;
			folders += 1;
			for (const child of node.children) {
				if (child.kind === 'file') files += 1;
				else stack.push(child);
			}
		}
		return { files, folders };
	}

	let stats = $derived(tree ? countNodes(tree) : null);
</script>

<div class="rv-section-block">
	<div class="rv-section-heading">PVM Bundle Location</div>
	{#if tree?.path}
		<div class="rv-row">
			<div class="rv-row-label">Path</div>
			<div class="rv-row-value">
				<CopyButton
					text={tree.path}
					size="sm"
					variant="ghost"
					class="h-auto min-h-6 px-2 font-mono text-[11px] text-muted-foreground hover:text-foreground whitespace-normal break-all text-left"
				>
					{tree.path}
				</CopyButton>
			</div>
		</div>
	{:else}
		<div class="rv-row">
			<div class="rv-row-label">Status</div>
			<div class="rv-row-value">No PVM bundle file list data</div>
		</div>
	{/if}
</div>

<div class="rv-section-block">
	<div class="rv-section-heading">Snapshots</div>
	{#if summary.snapshots.length === 0}
		<div class="rv-row">
			<div class="rv-row-label">Status</div>
			<div class="rv-row-value">No snapshots</div>
		</div>
	{:else}
		{#each summary.snapshots as snap, i (snap.name + snap.dateTime + i)}
			<div class="rv-row">
				<div class="rv-row-label">{snap.name || `Snapshot ${i + 1}`}</div>
				<div class="rv-row-value">
					<span class="font-mono text-[11px] text-muted-foreground">{snap.dateTime}</span>
				</div>
			</div>
		{/each}
	{/if}
</div>

<div class="rv-section-block">
	<div class="rv-section-heading">PVM Bundle Listing</div>
	{#if stats}
		<div class="mb-2 text-[11px] text-muted-foreground">{stats.folders} folders, {stats.files} files</div>
	{/if}

	<AdvancedVmInfoBundleContents contents={summary.pvmBundleContents} />
</div>
