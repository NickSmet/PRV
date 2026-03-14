<script lang="ts">
	import type { TimelineEvent } from '$lib/lab/timeline/types';
	import {
		FONTS,
		COLORS,
		BADGE,
		CATEGORY_BADGE_VARIANT,
		SEVERITY_COLORS,
		subsystemColor
	} from './types';
	import { formatTimeMs } from './svg-utils';

	let {
		events,
		filter,
		selectedId,
		hoveredId,
		flashId,
		onSelect,
		onHover,
		onFilterChange,
		rowRefs
	}: {
		events: TimelineEvent[];
		filter: string;
		selectedId: string | null;
		hoveredId: string | null;
		flashId: string | null;
		onSelect: (ev: TimelineEvent) => void;
		onHover: (ev: TimelineEvent | null) => void;
		onFilterChange: (val: string) => void;
		rowRefs: Map<string, HTMLElement>;
	} = $props();

	function badgeColors(category: string) {
		const variant = CATEGORY_BADGE_VARIANT[category] ?? 'default';
		return BADGE[variant] ?? BADGE.default;
	}

	let tableEl: HTMLDivElement | null = $state(null);

	function registerRow(el: HTMLElement, id: string) {
		rowRefs.set(id, el);
		return {
			destroy() {
				rowRefs.delete(id);
			}
		};
	}
</script>

<div style="flex: 1; min-height: 180px; display: flex; flex-direction: column; overflow: hidden;">
	<!-- Table header bar -->
	<div
		style="display: flex; align-items: center; gap: 6px; padding: 4px 8px; background: {COLORS.headerBg}; border-bottom: 1px solid {COLORS.b1}; border-top: 1px solid {COLORS.b1}; flex-shrink: 0;"
	>
		<span
			style="font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: {COLORS.t4};"
		>
			Joined Log
		</span>
		<span
			style="display: inline-flex; align-items: center; padding: 0 5px; height: 16px; border-radius: 3px; font-size: 9px; font-weight: 600; font-family: {FONTS.mono}; background: {BADGE.dim.bg}; color: {BADGE.dim.fg}; border: 1px solid {BADGE.dim.bd};"
		>
			{events.length} rows
		</span>
		<div style="flex: 1;"></div>
		<input
			type="text"
			placeholder="Filter events..."
			value={filter}
			oninput={(e) => onFilterChange(e.currentTarget.value)}
			style="width: 180px; padding: 2px 6px; font-size: 10px; font-family: {FONTS.mono}; border: 1px solid {COLORS.b1}; border-radius: 3px; outline: none; background: #fff; color: {COLORS.t2};"
		/>
	</div>

	<!-- Column headers -->
	<div
		style="display: flex; align-items: center; gap: 0; padding: 3px 8px; background: {COLORS.panelBg}; border-bottom: 1px solid {COLORS.b1}; flex-shrink: 0; font-size: 9.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: {COLORS.t3};"
	>
		<span style="width: 82px; flex-shrink: 0;">Time</span>
		<span style="width: 100px; flex-shrink: 0;">Source</span>
		<span style="width: 80px; flex-shrink: 0;">Category</span>
		<span style="width: 18px; flex-shrink: 0;"></span>
		<span style="flex: 1;">Event</span>
	</div>

	<!-- Scrollable rows -->
	<div bind:this={tableEl} style="flex: 1; overflow: auto;">
		{#each events as ev, i (ev.id)}
			{@const isSel = selectedId === ev.id}
			{@const isHov = hoveredId === ev.id}
			{@const isFlash = flashId === ev.id}
			{@const bg = isSel
				? COLORS.sel
				: isHov
					? COLORS.corBg
					: isFlash
						? COLORS.flash
						: i % 2 === 0
							? '#fff'
							: COLORS.panelBg}
			{@const borderLeft = isSel
				? `3px solid ${COLORS.selBorder}`
				: '3px solid transparent'}
			{@const bc = badgeColors(ev.category)}
			{@const sevColor = SEVERITY_COLORS[ev.severity] ?? '#D1D5DB'}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				use:registerRow={ev.id}
				onclick={() => onSelect(ev)}
				onmouseenter={() => onHover(ev)}
				onmouseleave={() => onHover(null)}
				style="display: flex; align-items: center; gap: 0; padding: 0 8px; height: 24px; min-height: 24px; border-bottom: 1px solid {COLORS.b0}; border-left: {borderLeft}; background: {bg}; cursor: pointer; user-select: none; transition: background {isFlash ? '300ms ease-out' : '60ms'};"
			>
				<!-- Time -->
				<span
					style="width: 82px; flex-shrink: 0; font-size: 10px; font-family: {FONTS.mono}; color: {COLORS.t2};"
				>
					{formatTimeMs(ev.start)}
				</span>

				<!-- Source -->
				<span
					title={ev.sourceFile}
					style="width: 100px; flex-shrink: 0; font-size: 9.5px; font-family: {FONTS.mono}; color: {subsystemColor(ev.sourceFile)}; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; opacity: 0.8;"
				>
					{ev.sourceFile}
				</span>

				<!-- Category badge -->
				<span style="width: 80px; flex-shrink: 0;">
					<span
						style="display: inline-flex; align-items: center; padding: 0 4px; height: 15px; border-radius: 3px; font-size: 8.5px; font-weight: 600; font-family: {FONTS.mono}; white-space: nowrap; background: {bc.bg}; color: {bc.fg}; border: 1px solid {bc.bd};"
					>
						{ev.category.length > 10 ? ev.category.slice(0, 9) + '...' : ev.category}
					</span>
				</span>

				<!-- Severity dot -->
				<span
					style="width: 18px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;"
				>
					<span
						style="width: 6px; height: 6px; border-radius: 50%; background: {sevColor}; display: inline-block;"
					></span>
				</span>

				<!-- Label -->
				<span
					style="flex: 1; font-size: 11px; font-family: {FONTS.sans}; font-weight: {isSel ? 600 : 400}; color: {isSel ? COLORS.t0 : COLORS.t1}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
				>
					{ev.label}
				</span>
			</div>
		{/each}
	</div>
</div>
