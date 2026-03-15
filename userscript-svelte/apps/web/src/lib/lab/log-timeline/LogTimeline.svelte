<script lang="ts">
	import { Timeline, type TimelinePayload, type TimelineWindowEvent } from '@prv/report-ui-svelte';
	import { VIEWER_COLORS, VIEWER_FONTS } from '$lib/lab/log-viewer/theme';

	let {
		payload,
		payloadRevision = 0,
		loading,
		error,
		hasSelection,
		onItemClick,
		onVisibleWindowChange,
		onUserWindowChange
	}: {
		payload: TimelinePayload | null;
		payloadRevision?: number;
		loading: boolean;
		error: string | null;
		hasSelection: boolean;
		onItemClick: (item: unknown) => void;
		onVisibleWindowChange?: (window: TimelineWindowEvent) => void;
		/** Fires only on user-driven window changes (wheel/drag). */
		onUserWindowChange?: (window: TimelineWindowEvent) => void;
	} = $props();
</script>

<div style="height:100%; display:flex; flex-direction:column;">
	{#if error}
		<div
			style={`border:1px solid ${VIEWER_COLORS.b1}; border-radius:8px; background:#fff; padding:10px; font-size:12px; color:#B91C1C;`}
		>
			{error}
		</div>
	{:else if !hasSelection}
		<div
			style={`border:1px solid ${VIEWER_COLORS.b1}; border-radius:8px; background:#fff; padding:10px; font-size:12px; color:${VIEWER_COLORS.t2}; font-family:${VIEWER_FONTS.mono};`}
		>
			Select at least one log file.
		</div>
	{:else if !payload}
		<div
			style={`border:1px solid ${VIEWER_COLORS.b1}; border-radius:8px; background:#fff; padding:10px; font-size:12px; color:${VIEWER_COLORS.t2}; font-family:${VIEWER_FONTS.mono};`}
		>
			{loading ? 'Loading timeline…' : 'No timeline events for the selected logs.'}
		</div>
	{:else}
		<div style="flex:1; min-height:0; overflow:hidden;">
			<Timeline {payload} {payloadRevision} {onItemClick} {onVisibleWindowChange} {onUserWindowChange} wheelMode="zoom" />
		</div>
	{/if}
</div>
