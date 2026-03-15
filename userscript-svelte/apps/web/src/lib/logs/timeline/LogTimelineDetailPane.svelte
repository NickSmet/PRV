<script lang="ts">
	import { X } from '@lucide/svelte';
	import type { TimelineEvent } from '$lib/lab/timeline/types';
	import { colorForSource, sourceLabel, VIEWER_COLORS, VIEWER_FONTS } from '$lib/logs/viewer/theme';

	let {
		event,
		onClose
	}: {
		event: TimelineEvent;
		onClose: () => void;
	} = $props();

	function formatDate(value: Date): string {
		return value.toISOString().replace('T', ' ').replace('Z', 'Z');
	}

	function formatDuration(start: Date, end?: Date): string | null {
		if (!end) return null;
		const deltaMs = end.getTime() - start.getTime();
		if (!Number.isFinite(deltaMs) || deltaMs < 0) return null;
		if (deltaMs < 1000) return `${deltaMs} ms`;
		const seconds = deltaMs / 1000;
		if (seconds < 60) return `${seconds.toFixed(1)} s`;
		const minutes = Math.floor(seconds / 60);
		const remainder = seconds - minutes * 60;
		return `${minutes}m ${remainder.toFixed(1)}s`;
	}

	const sourceColor = $derived(colorForSource(event.sourceFile));
	const duration = $derived(formatDuration(event.start, event.end));
</script>

<div
	style={`height:100%; border-left:1px solid ${VIEWER_COLORS.b1}; background:${VIEWER_COLORS.panelBg}; display:flex; flex-direction:column; min-width:0;`}
>
	<div
		style={`padding:6px 10px; background:${VIEWER_COLORS.headerBg}; border-bottom:1px solid ${VIEWER_COLORS.b1}; display:flex; align-items:center; gap:8px; flex-shrink:0;`}
	>
		<div style={`font-size:12px; font-weight:700; color:${VIEWER_COLORS.t1};`}>
			{event.label}
		</div>
		<div style="flex:1;"></div>
		<div
			style={`font-size:10px; font-family:${VIEWER_FONTS.mono}; color:${sourceColor.fg}; font-weight:600;`}
		>
			{sourceLabel(event.sourceFile)}
		</div>
		<button
			type="button"
			onclick={onClose}
			style={`border:none; background:transparent; color:${VIEWER_COLORS.t4}; cursor:pointer; padding:2px; display:inline-flex; align-items:center; justify-content:center;`}
			aria-label="Close event details"
		>
			<X class="h-4 w-4" />
		</button>
	</div>

	<div style="padding:8px 10px; display:flex; gap:20px; overflow:auto; min-height:0;">
		<div style="display:flex; flex-direction:column; gap:10px; width:100%; min-width:0;">
			<div
				style={`display:grid; grid-template-columns:72px minmax(0, 1fr); gap:4px 10px; font-size:10.5px; align-items:start;`}
			>
				<span style={`color:${VIEWER_COLORS.t3}; font-weight:500;`}>start</span>
				<span style={`font-family:${VIEWER_FONTS.mono}; color:${VIEWER_COLORS.t2}; word-break:break-word;`}>
					{formatDate(event.start)}
				</span>
				{#if event.end}
					<span style={`color:${VIEWER_COLORS.t3}; font-weight:500;`}>end</span>
					<span style={`font-family:${VIEWER_FONTS.mono}; color:${VIEWER_COLORS.t2}; word-break:break-word;`}>
						{formatDate(event.end)}
					</span>
				{/if}
				{#if duration}
					<span style={`color:${VIEWER_COLORS.t3}; font-weight:500;`}>duration</span>
					<span style={`font-family:${VIEWER_FONTS.mono}; color:${VIEWER_COLORS.t2};`}>
						{duration}
					</span>
				{/if}
				<span style={`color:${VIEWER_COLORS.t3}; font-weight:500;`}>category</span>
				<span style={`font-family:${VIEWER_FONTS.mono}; color:${VIEWER_COLORS.t2};`}>
					{event.category}
				</span>
				<span style={`color:${VIEWER_COLORS.t3}; font-weight:500;`}>severity</span>
				<span style={`font-family:${VIEWER_FONTS.mono}; color:${VIEWER_COLORS.t2};`}>
					{event.severity}
				</span>
				{#if event.startRef?.lineNo != null}
					<span style={`color:${VIEWER_COLORS.t3}; font-weight:500;`}>jump line</span>
					<span style={`font-family:${VIEWER_FONTS.mono}; color:${VIEWER_COLORS.t2};`}>
						{event.startRef.lineNo}
					</span>
				{/if}
			</div>

			<div>
				<div style={`font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:${VIEWER_COLORS.t4}; margin-bottom:4px;`}>
					Detail
				</div>
				{#if event.detail}
					<pre
						style={`margin:0; padding:6px 8px; background:#fff; border:1px solid ${VIEWER_COLORS.b0}; border-radius:4px; font-size:10px; font-family:${VIEWER_FONTS.mono}; color:${VIEWER_COLORS.t2}; white-space:pre-wrap; word-break:break-word; max-height:160px; overflow:auto;`}
					>{event.detail}</pre>
				{:else}
					<div style={`font-size:11px; color:${VIEWER_COLORS.t3};`}>No event detail.</div>
				{/if}
			</div>
		</div>
	</div>
</div>
