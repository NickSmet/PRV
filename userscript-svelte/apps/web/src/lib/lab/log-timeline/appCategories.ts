export const APP_SYSTEM_CATEGORY = 'Apps: System';
export const APP_MICROSOFT_CATEGORY = 'Apps: Microsoft';
export const APP_THIRD_PARTY_CATEGORY = 'Apps: Third-party';

export const APP_TIMELINE_CATEGORIES = [
	APP_SYSTEM_CATEGORY,
	APP_MICROSOFT_CATEGORY,
	APP_THIRD_PARTY_CATEGORY
] as const;

export const DEFAULT_APP_CATEGORY_VISIBILITY: Record<string, boolean> = {
	[APP_SYSTEM_CATEGORY]: false,
	[APP_MICROSOFT_CATEGORY]: false,
	[APP_THIRD_PARTY_CATEGORY]: true
};

export function isAppTimelineCategory(category: string): boolean {
	return APP_TIMELINE_CATEGORIES.includes(
		category as (typeof APP_TIMELINE_CATEGORIES)[number]
	);
}

