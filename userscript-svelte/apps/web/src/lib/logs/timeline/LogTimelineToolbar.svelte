<script lang="ts">
	import { RefreshCw } from '@lucide/svelte';

	import type { LogWorkspaceFile } from '$lib/logs/workspace/types';
	import { APP_TIMELINE_CATEGORIES } from '$lib/logs/timeline/appCategories';
	import { colorForSource, fmtSize, sourceLabel, VIEWER_COLORS, VIEWER_FONTS } from '$lib/logs/viewer/theme';

	let {
		files,
		selectedFiles,
		loading,
		eventCount,
		appCategoryVisibility,
		appCategoryCounts,
		onToggleFile,
		onToggleAppCategory,
		onReload
	}: {
		files: LogWorkspaceFile[];
		selectedFiles: string[];
		loading: boolean;
		eventCount: number;
		appCategoryVisibility: Record<string, boolean>;
		appCategoryCounts: Record<string, number>;
		onToggleFile: (filename: string) => void;
		onToggleAppCategory: (category: string) => void;
		onReload: () => void;
	} = $props();

	function categoryLabel(category: string) {
		return category.replace(/^Apps:\s*/, '');
	}

	const hasAppCategories = $derived(
		APP_TIMELINE_CATEGORIES.some((category) => (appCategoryCounts[category] ?? 0) > 0)
	);
</script>

<div
	style={`display:flex; align-items:center; gap:8px; padding:6px 12px; border-top:1px solid ${VIEWER_COLORS.b1}; border-bottom:1px solid ${VIEWER_COLORS.b1}; background:${VIEWER_COLORS.headerBg}; flex-wrap:wrap;`}
>
	{#each files as file (file.filename)}
		{@const palette = colorForSource(file.filename)}
		{@const active = selectedFiles.includes(file.filename)}
		<button
			type="button"
			onclick={() => onToggleFile(file.filename)}
			style={`display:flex; align-items:center; gap:5px; padding:3px 8px; border-radius:4px; cursor:pointer; border:1px solid ${active ? palette.border : VIEWER_COLORS.b1}; background:${active ? palette.bg : '#fff'}; opacity:${active ? 1 : 0.45};`}
		>
			<span
				style={`width:10px; height:10px; border-radius:2px; border:1.5px solid ${active ? palette.fg : VIEWER_COLORS.b1}; background:${active ? palette.fg : 'transparent'}; display:flex; align-items:center; justify-content:center; flex-shrink:0;`}
			>
				{#if active}
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
			<span
				style={`font-size:11px; font-weight:600; font-family:${VIEWER_FONTS.mono}; color:${active ? palette.fg : VIEWER_COLORS.t3};`}
			>
				{sourceLabel(file.filename)}
			</span>
			<span
				style={`font-size:9px; font-family:${VIEWER_FONTS.mono}; color:${active ? palette.fg : VIEWER_COLORS.t4}; opacity:0.6;`}
			>
				{fmtSize(file.size)}
			</span>
		</button>
	{/each}

	{#if hasAppCategories}
		<div
			style={`display:flex; align-items:center; gap:6px; flex-wrap:wrap; padding-left:4px; border-left:1px solid ${VIEWER_COLORS.b1}; margin-left:2px;`}
		>
			{#each APP_TIMELINE_CATEGORIES as category (category)}
				<label
					style={`display:inline-flex; align-items:center; gap:6px; padding:3px 8px; border-radius:6px; border:1px solid ${VIEWER_COLORS.b1}; background:#fff; color:${VIEWER_COLORS.t2}; cursor:pointer;`}
				>
					<input
						type="checkbox"
						checked={appCategoryVisibility[category] ?? false}
						onchange={() => onToggleAppCategory(category)}
					/>
					<span style={`font-size:11px; font-weight:600; color:${VIEWER_COLORS.t1};`}>
						{categoryLabel(category)}
					</span>
					<span
						style={`display:inline-flex; align-items:center; padding:0 5px; height:18px; border-radius:999px; font-size:9px; font-family:${VIEWER_FONTS.mono}; background:${VIEWER_COLORS.headerBg}; color:${VIEWER_COLORS.t2};`}
					>
						{appCategoryCounts[category] ?? 0}
					</span>
				</label>
			{/each}
		</div>
	{/if}

	{#if loading}
		<span style={`font-size:11px; color:${VIEWER_COLORS.t2};`}>Loading…</span>
	{/if}

	<div style="flex:1;"></div>

	<span
		style={`display:inline-flex; align-items:center; padding:0 5px; height:18px; border-radius:3px; font-size:9px; font-weight:600; font-family:${VIEWER_FONTS.mono}; background:#fff; color:${VIEWER_COLORS.t2}; border:1px solid ${VIEWER_COLORS.b1};`}
	>
		{eventCount} events
	</span>

	<button
		type="button"
		onclick={onReload}
		style={`display:inline-flex; align-items:center; gap:6px; padding:5px 9px; border-radius:6px; border:1px solid ${VIEWER_COLORS.b1}; background:#fff; font-size:11px; cursor:pointer;`}
	>
		<RefreshCw class="h-3.5 w-3.5" />
		Reload
	</button>
</div>
