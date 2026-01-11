<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import type { TooltipData } from '$lib/types/compact';

	let {
		icon,
		title,
		badge,
		details,
		tooltip
	}: {
		icon: string;
		title: string;
		badge?: { label: string; variant: 'success' | 'muted' | 'destructive' };
		details: string;
		tooltip?: TooltipData;
	} = $props();

	function getTooltipText(): string | undefined {
		if (!tooltip) return undefined;
		let text = tooltip.label;
		if (tooltip.value) text += `: ${tooltip.value}`;
		if (tooltip.description) text += `\n\n${tooltip.description}`;
		return text;
	}
</script>

<section
	class="compact-card rounded-lg border border-border bg-card p-3"
	title={getTooltipText()}
>
	<div class="mb-2 flex items-center justify-between">
		<h3 class="flex items-center gap-1.5 text-xs font-bold text-card-foreground">
			<span class="text-sm" role="img">{icon}</span>
			<span>{title}</span>
		</h3>
		{#if badge}
			<Badge variant={badge.variant} class="text-[10px]">{badge.label}</Badge>
		{/if}
	</div>

	<div class="text-[11px] leading-relaxed text-muted-foreground">
		{details}
	</div>
</section>

<style>
	.compact-card {
		min-height: 60px;
	}
</style>
