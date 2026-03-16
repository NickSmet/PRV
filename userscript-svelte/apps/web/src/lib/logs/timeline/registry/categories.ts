import {
	APP_MICROSOFT_CATEGORY,
	APP_SYSTEM_CATEGORY,
	APP_THIRD_PARTY_CATEGORY
} from '../appCategories';

export const TOOLS_CATEGORY = 'Tools';
export const VM_LIFECYCLE_CATEGORY = 'VM Lifecycle';
export const DEVICES_CATEGORY = 'Devices';
export const NETWORK_CATEGORY = 'Network';
export const ERRORS_CATEGORY = 'Errors';
export const HOST_ISSUES_CATEGORY = 'Host Issues';
export const GUI_MESSAGES_CATEGORY = 'GUI Messages';
export const CONFIG_DIFFS_CATEGORY = 'Config Diffs';

export type TimelineCategoryMetadata = {
	order: number;
	styleKey: string;
	slug?: string;
};

export const TIMELINE_CATEGORY_METADATA: Record<string, TimelineCategoryMetadata> = {
	[APP_SYSTEM_CATEGORY]: { order: 0, styleKey: 'apps', slug: 'apps-system' },
	[APP_MICROSOFT_CATEGORY]: { order: 1, styleKey: 'apps', slug: 'apps-microsoft' },
	[APP_THIRD_PARTY_CATEGORY]: { order: 2, styleKey: 'apps', slug: 'apps-third-party' },
	[TOOLS_CATEGORY]: { order: 3, styleKey: 'tools' },
	[VM_LIFECYCLE_CATEGORY]: { order: 4, styleKey: 'lifecycle' },
	[DEVICES_CATEGORY]: { order: 5, styleKey: 'devices' },
	[NETWORK_CATEGORY]: { order: 6, styleKey: 'network' },
	[ERRORS_CATEGORY]: { order: 7, styleKey: 'errors' },
	[HOST_ISSUES_CATEGORY]: { order: 8, styleKey: 'host' },
	[GUI_MESSAGES_CATEGORY]: { order: 9, styleKey: 'gui' },
	[CONFIG_DIFFS_CATEGORY]: { order: 10, styleKey: 'config' }
};

function defaultSlug(category: string): string {
	return category.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function categoryOrder(category: string): number {
	return TIMELINE_CATEGORY_METADATA[category]?.order ?? 99;
}

export function categoryStyleKey(category: string): string {
	return TIMELINE_CATEGORY_METADATA[category]?.styleKey ?? defaultSlug(category);
}

export function categorySlug(category: string): string {
	return TIMELINE_CATEGORY_METADATA[category]?.slug ?? defaultSlug(category);
}
