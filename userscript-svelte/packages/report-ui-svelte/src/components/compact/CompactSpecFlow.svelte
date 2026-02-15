<script lang="ts">
	import type { SpecItem } from '@prv/report-core';

	let { title, specs }: { title: string; specs: SpecItem[][] } = $props();

	const statusIcons = {
		success: '✅',
		error: '❌',
		warning: '⚠️',
		disabled: '⬜',
		info: '🔵'
	};

	const statusColors = {
		success: 'text-[hsl(142,60%,50%)]',
		error: 'text-[hsl(0,72%,51%)]',
		warning: 'text-[hsl(38,92%,50%)]',
		disabled: 'text-[hsl(220,10%,70%)]',
		info: 'text-[hsl(217,91%,60%)]'
	};

	function getTooltipText(spec: SpecItem): string {
		let text = spec.tooltip.label;
		if (spec.tooltip.value) text += `: ${spec.tooltip.value}`;
		if (spec.tooltip.description) text += `\n\n${spec.tooltip.description}`;
		return text;
	}
</script>

<section class="compact-section">
	<h3 class="mb-3 text-xs font-bold text-foreground">
		{title}
	</h3>
	<div class="space-y-2">
		{#each specs as row}
			<div class="spec-flow flex flex-wrap items-center gap-x-3 gap-y-1">
				{#each row as spec, i}
					{#if i > 0}
						<span class="separator text-xs text-muted-foreground/40">•</span>
					{/if}
					<span
						class="spec-item inline-flex items-center gap-1 text-xs font-medium text-foreground transition-colors hover:text-foreground/80 cursor-default"
						title={getTooltipText(spec)}
					>
						<span class="spec-icon text-sm" role="img" aria-label={spec.tooltip.label}>
							{spec.icon}
						</span>
						<span>{spec.label}</span>
						{#if spec.value}
							<span class="font-semibold">{spec.value}</span>
						{/if}
						{#if spec.status}
							<span class="{statusColors[spec.status]} text-sm" role="status">
								{statusIcons[spec.status]}
							</span>
						{/if}
					</span>
				{/each}
			</div>
		{/each}
	</div>
</section>

<style>
	.spec-item {
		cursor: default;
		user-select: none;
	}

	.separator {
		pointer-events: none;
	}
</style>
