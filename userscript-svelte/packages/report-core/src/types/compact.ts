/**
 * Tooltip data structure for compact layout
 */
export interface TooltipData {
	/** Full descriptive label */
	label: string;
	/** Full value if truncated or needs explanation */
	value?: string;
	/** Explanation of what this means */
	description?: string;
	/** Additional search keywords */
	keywords?: string[];
}

/**
 * Chip for inline grid layout
 */
export interface CompactChip {
	icon: string;
	label: string;
	status?: 'success' | 'error' | 'warning' | 'disabled' | 'info';
	tooltip: TooltipData;
}

/**
 * Spec item for horizontal flow layout
 */
export interface SpecItem {
	icon: string;
	label: string;
	value?: string;
	status?: 'success' | 'error' | 'warning' | 'disabled' | 'info';
	tooltip: TooltipData;
}
