<script lang="ts">
	import type { CompactChip } from '@prv/report-core';

	let { title, chips }: { title: string; chips: CompactChip[] } = $props();

	const statusColors = {
		success: 'text-[hsl(142,60%,50%)]',
		error: 'text-[hsl(0,72%,51%)]',
		warning: 'text-[hsl(38,92%,50%)]',
		disabled: 'text-[hsl(220,10%,70%)]',
		info: 'text-[hsl(217,91%,60%)]'
	};

	function getTooltipText(chip: CompactChip): string {
		let text = chip.tooltip.label;
		if (chip.tooltip.value) text += `: ${chip.tooltip.value}`;
		if (chip.tooltip.description) text += `\n\n${chip.tooltip.description}`;
		return text;
	}
</script>

<section class="compact-section">
	<h3 class="mb-3 text-xs font-bold text-foreground">
		{title}
	</h3>
	<div class="chip-grid grid grid-cols-4 gap-x-2 gap-y-1.5">
		{#each chips as chip}
			<div
				class="chip flex items-center gap-1.5 rounded-md bg-muted/30 px-2 py-1 transition-colors hover:bg-muted/60 cursor-default"
				title={getTooltipText(chip)}
			>
				<span
					class="chip-icon text-sm {chip.status ? statusColors[chip.status] : ''}"
					role="img"
					aria-label={chip.tooltip.label}
				>
					{chip.icon}
				</span>
				<span class="chip-label truncate text-xs font-medium text-foreground">
					{chip.label}
				</span>
			</div>
		{/each}
	</div>
</section>

<style>
	.chip {
		min-height: 24px;
	}

	.chip-icon {
		flex-shrink: 0;
	}

	.chip-label {
		line-height: 1;
	}
</style>
