<script lang="ts">
	import type { TimelineEvent } from '$lib/lab/timeline/types';
	import { colorForSource, sourceLabel, VIEWER_COLORS, VIEWER_FONTS } from '$lib/lab/log-viewer/theme';

	let {
		events,
		filter,
		selectedId,
		flashId,
		onSelect,
		onFilterChange
	}: {
		events: TimelineEvent[];
		filter: string;
		selectedId: string | null;
		flashId: string | null;
		onSelect: (event: TimelineEvent) => void;
		onFilterChange: (value: string) => void;
	} = $props();

	function formatTime(value: Date): string {
		return value.toISOString().slice(11, 23);
	}
</script>

<div style="flex:1; min-height:180px; display:flex; flex-direction:column; overflow:hidden;">
	<div
		style={`display:flex; align-items:center; gap:6px; padding:4px 8px; background:${VIEWER_COLORS.headerBg}; border-bottom:1px solid ${VIEWER_COLORS.b1}; border-top:1px solid ${VIEWER_COLORS.b1}; flex-shrink:0;`}
	>
		<span
			style={`font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:${VIEWER_COLORS.t4};`}
		>
			Events
		</span>
		<span
			style={`display:inline-flex; align-items:center; padding:0 5px; height:16px; border-radius:3px; font-size:9px; font-weight:600; font-family:${VIEWER_FONTS.mono}; background:#fff; color:${VIEWER_COLORS.t2}; border:1px solid ${VIEWER_COLORS.b1};`}
		>
			{events.length}
		</span>
		<div style="flex:1;"></div>
		<input
			type="text"
			placeholder="Filter events…"
			value={filter}
			oninput={(event) => onFilterChange((event.currentTarget as HTMLInputElement).value)}
			style={`width:180px; padding:2px 6px; font-size:10px; font-family:${VIEWER_FONTS.mono}; border:1px solid ${VIEWER_COLORS.b1}; border-radius:3px; outline:none; background:#fff; color:${VIEWER_COLORS.t2};`}
		/>
	</div>

	<div
		style={`display:flex; align-items:center; padding:3px 8px; background:${VIEWER_COLORS.panelBg}; border-bottom:1px solid ${VIEWER_COLORS.b1}; flex-shrink:0; font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; color:${VIEWER_COLORS.t3};`}
	>
		<span style="width:96px; flex-shrink:0;">Time</span>
		<span style="width:92px; flex-shrink:0;">Source</span>
		<span style="width:92px; flex-shrink:0;">Category</span>
		<span style="flex:1;">Event</span>
	</div>

	<div style="flex:1; overflow:auto;">
		{#each events as event, index (event.id)}
			{@const isSelected = selectedId === event.id}
			{@const isFlash = flashId === event.id}
			{@const baseBg = index % 2 === 0 ? '#fff' : VIEWER_COLORS.panelBg}
			{@const background = isSelected ? VIEWER_COLORS.sel : isFlash ? '#DBEAFE' : baseBg}
			{@const leftBorder = isSelected
				? `3px solid ${VIEWER_COLORS.selBorder}`
				: '3px solid transparent'}
			{@const sourceColor = colorForSource(event.sourceFile)}
			<button
				type="button"
				onclick={() => onSelect(event)}
				style={`display:flex; align-items:center; gap:0; padding:0 8px; height:24px; min-height:24px; width:100%; border:none; border-left:${leftBorder}; border-bottom:1px solid ${VIEWER_COLORS.b0}; background:${background}; cursor:pointer; text-align:left;`}
			>
				<span
					style={`width:96px; flex-shrink:0; font-size:10px; font-family:${VIEWER_FONTS.mono}; color:${VIEWER_COLORS.t2};`}
				>
					{formatTime(event.start)}
				</span>
				<span
					style={`width:92px; flex-shrink:0; font-size:10px; font-family:${VIEWER_FONTS.mono}; color:${sourceColor.fg}; font-weight:600;`}
				>
					{sourceLabel(event.sourceFile)}
				</span>
				<span
					style={`width:92px; flex-shrink:0; font-size:10px; font-family:${VIEWER_FONTS.mono}; color:${VIEWER_COLORS.t2}; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;`}
				>
					{event.category}
				</span>
				<span
					style={`flex:1; font-size:11px; color:${VIEWER_COLORS.t1}; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-weight:${isSelected ? 600 : 400};`}
				>
					{event.label}
				</span>
			</button>
		{/each}
	</div>
</div>
