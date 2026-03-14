<script lang="ts">
	import type { TimelineEvent } from '$lib/lab/timeline/types';
	import {
		FONTS,
		COLORS,
		BADGE,
		CATEGORY_BADGE_VARIANT,
		SEVERITY_COLORS,
		SUBSYSTEMS,
		subsystemForFile,
		categoryColors
	} from './types';
	import { formatTimeMs, formatDuration } from './svg-utils';

	let {
		event,
		onClose
	}: {
		event: TimelineEvent;
		onClose: () => void;
	} = $props();

	const sub = $derived(SUBSYSTEMS.find((s) => s.id === subsystemForFile(event.sourceFile)));
	const catCol = $derived(categoryColors(event.category));
	const badgeVariant = $derived(CATEGORY_BADGE_VARIANT[event.category] ?? 'default');
	const badge = $derived(BADGE[badgeVariant] ?? BADGE.default);
	const sevBadge = $derived(
		event.severity === 'warn'
			? BADGE.amber
			: event.severity === 'danger'
				? BADGE.red
				: null
	);
	const subBadge = $derived(sub ? BADGE[sub.id === 'vm' ? 'green' : 'purple'] ?? BADGE.default : BADGE.default);
</script>

<div
	style="border: 1px solid {COLORS.b1}; border-radius: 3px; overflow: hidden; flex-shrink: 0;"
>
	<!-- Header -->
	<div
		style="padding: 5px 10px; background: {COLORS.headerBg}; border-bottom: 1px solid {COLORS.b1}; display: flex; align-items: center; gap: 6px;"
	>
		<span style="font-size: 12px; font-weight: 700; font-family: {FONTS.sans};">
			{event.label}
		</span>
		<span
			style="display: inline-flex; align-items: center; padding: 0 5px; height: 16px; border-radius: 3px; font-size: 9px; font-weight: 600; font-family: {FONTS.mono}; white-space: nowrap; background: {badge.bg}; color: {badge.fg}; border: 1px solid {badge.bd};"
		>
			{event.category}
		</span>
		{#if sevBadge}
			<span
				style="display: inline-flex; align-items: center; padding: 0 5px; height: 16px; border-radius: 3px; font-size: 9px; font-weight: 600; font-family: {FONTS.mono}; white-space: nowrap; background: {sevBadge.bg}; color: {sevBadge.fg}; border: 1px solid {sevBadge.bd};"
			>
				{event.severity === 'warn' ? 'warn' : 'error'}
			</span>
		{/if}
		<div style="flex: 1;"></div>
		<span style="font-size: 9px; font-family: {FONTS.mono}; color: {COLORS.t4};">
			{event.sourceFile}
		</span>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<span
			onclick={onClose}
			style="cursor: pointer; font-size: 12px; color: {COLORS.t4}; margin-left: 4px; line-height: 1;"
		>
			&#x2715;
		</span>
	</div>

	<!-- Body -->
	<div
		style="padding: 5px 10px; background: {COLORS.panelBg}; display: flex; gap: 16px;"
	>
		<!-- Left: key-value grid -->
		<div
			style="display: grid; grid-template-columns: 55px 1fr; gap: 1px 6px; font-size: 10.5px; min-width: 200px;"
		>
			<span style="color: {COLORS.t3}; font-weight: 500;">Start</span>
			<span style="font-family: {FONTS.mono}; font-size: 10px; color: {COLORS.t2};">
				{formatTimeMs(event.start)}
			</span>

			{#if event.end}
				<span style="color: {COLORS.t3}; font-weight: 500;">End</span>
				<span style="font-family: {FONTS.mono}; font-size: 10px; color: {COLORS.t2};">
					{formatTimeMs(event.end)}
				</span>
				<span style="color: {COLORS.t3}; font-weight: 500;">Duration</span>
				<span style="font-family: {FONTS.mono}; font-size: 10px; color: {COLORS.t2};">
					{formatDuration(event.end.getTime() - event.start.getTime())}
				</span>
			{/if}

			<span style="color: {COLORS.t3}; font-weight: 500;">Lane</span>
			<span>
				{#if sub}
					<span
						style="display: inline-flex; align-items: center; padding: 0 5px; height: 15px; border-radius: 3px; font-size: 9px; font-weight: 600; font-family: {FONTS.mono}; white-space: nowrap; background: {subBadge.bg}; color: {subBadge.fg}; border: 1px solid {subBadge.bd};"
					>
						{sub.label}
					</span>
				{:else}
					&mdash;
				{/if}
			</span>
		</div>

		<!-- Right: detail text -->
		<div style="flex: 1; min-width: 0;">
			{#if event.detail}
				<pre
					style="font-family: {FONTS.mono}; font-size: 10px; color: {COLORS.t2}; margin: 0; white-space: pre-wrap; word-break: break-word; line-height: 1.35; padding: 3px 6px; background: #fff; border: 1px solid {COLORS.b0}; border-radius: 2px; max-height: 60px; overflow: auto;"
				>{event.detail}</pre>
			{/if}
		</div>
	</div>
</div>
