<script lang="ts">
	/**
	 * RowValue - Reusable component for rendering NodeRow values
	 * 
	 * Handles all value types consistently:
	 * - badge: Renders as a Badge component
	 * - path: Renders with CopyButton for easy copying
	 * - uuid: Renders with CopyButton for easy copying
	 * - datetime: Renders in monospace font
	 * - text (default): Plain text
	 * 
	 * Usage:
	 *   <RowValue {row} />
	 *   <RowValue {row} size="sm" />
	 */
	import { Badge } from '../ui/badge';
	import { CopyButton } from '../../ui/copy-button';
	import type { NodeRow } from '@prv/report-viewmodel';

	interface Props {
		row: NodeRow;
		/** Size variant for badges and copy buttons */
		size?: 'sm' | 'md';
		/** Additional CSS classes */
		class?: string;
	}

	let { row, size = 'sm', class: className = '' }: Props = $props();

	// Map row badge variant to actual Badge variant
	function getBadgeVariant(row: NodeRow) {
		if (!row.badge) return 'outline';
		const variant = row.badge.variant;
		// Pass through - Badge component now has all needed variants
		if (variant === 'muted') return 'muted';
		if (variant === 'success') return 'success';
		return variant;
	}

	// Check if this is a status badge (Enabled/Disabled, Yes/No, On/Off)
	const isStatusBadge = $derived(
		row.badge?.label && ['Enabled', 'Disabled', 'Yes', 'No', 'On', 'Off'].includes(row.badge.label)
	);

	// Size-based classes
	const sizeClasses = $derived({
		// Status badges get min-width for alignment, regular badges don't
		badge: size === 'sm' 
			? `h-4 text-[9px] ${isStatusBadge ? 'min-w-14 text-center' : ''}`
			: `h-5 text-[10px] ${isStatusBadge ? 'min-w-16 text-center' : ''}`,
		copyButton: size === 'sm' 
			? 'h-auto min-h-6 px-1 font-mono text-[10px] text-muted-foreground hover:text-foreground whitespace-normal break-all text-left'
			: 'h-auto min-h-6 px-2 font-mono text-[11px] text-muted-foreground hover:text-foreground whitespace-normal break-all text-left',
		datetime: size === 'sm' ? 'font-mono text-[10px] text-muted-foreground' : 'font-mono text-[11px] text-muted-foreground',
		text: size === 'sm' ? 'font-medium' : 'font-medium'
	});
</script>

{#if row.badge}
	<Badge variant={getBadgeVariant(row)} class="{sizeClasses.badge} {className}">
		{row.badge.label}
	</Badge>
{:else if row.type === 'path' || row.type === 'uuid'}
	<CopyButton
		text={row.value || ''}
		size="sm"
		variant="ghost"
		class="{sizeClasses.copyButton} {className}"
	>
		{row.value}
	</CopyButton>
{:else if row.type === 'datetime'}
	<span class="{sizeClasses.datetime} {className}">{row.value}</span>
{:else}
	<span class="{sizeClasses.text} {className}">{row.value}</span>
{/if}

