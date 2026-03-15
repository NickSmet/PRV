import {
	APP_MICROSOFT_CATEGORY,
	APP_SYSTEM_CATEGORY,
	APP_THIRD_PARTY_CATEGORY
} from './appCategories';

type TimelineAppCategory =
	| typeof APP_SYSTEM_CATEGORY
	| typeof APP_MICROSOFT_CATEGORY
	| typeof APP_THIRD_PARTY_CATEGORY;

const OVERRIDE_BY_EXE: Record<string, TimelineAppCategory> = {
	'consent.exe': APP_SYSTEM_CATEGORY,
	'explorer.exe': APP_SYSTEM_CATEGORY,
	'icloudhome.exe': APP_THIRD_PARTY_CATEGORY,
	'logonui.exe': APP_SYSTEM_CATEGORY,
	'ms-teams.exe': APP_MICROSOFT_CATEGORY,
	'onedrive.exe': APP_MICROSOFT_CATEGORY,
	'phoneexperiencehost.exe': APP_SYSTEM_CATEGORY,
	'searchhost.exe': APP_SYSTEM_CATEGORY,
	'shellexperiencehost.exe': APP_SYSTEM_CATEGORY,
	'startmenuexperiencehost.exe': APP_SYSTEM_CATEGORY,
	'textinputhost.exe': APP_SYSTEM_CATEGORY
};

function classifyWindowsGuestProcessType(path: string): 'system' | 'microsoft-component' | 'third-party-app' | 'other' {
	const normalized = path.toLowerCase();

	if (
		normalized.startsWith('c:\\windows\\') ||
		normalized.includes('\\windows\\system32\\') ||
		normalized.includes('\\windows\\syswow64\\')
	) {
		return 'system';
	}

	const programFilesMicrosoftFolder = /^c:\\program files(?: \(x86\))?\\[^\\]*microsoft[^\\]*\\/;
	if (
		programFilesMicrosoftFolder.test(normalized) ||
		normalized.startsWith('c:\\program files\\microsoft\\') ||
		normalized.startsWith('c:\\program files (x86)\\microsoft\\') ||
		normalized.startsWith('c:\\program files\\windowsapps\\microsoft.') ||
		normalized.startsWith('c:\\program files\\windowsapps\\microsoft\\') ||
		normalized.includes('\\windowsapps\\microsoft.') ||
		normalized.includes('\\microsoft\\edgewebview\\') ||
		normalized.includes('\\microsoft visual studio\\') ||
		normalized.includes('\\programdata\\microsoft\\') ||
		normalized.includes('\\common files\\microsoft shared\\')
	) {
		return 'microsoft-component';
	}

	if (
		normalized.startsWith('c:\\program files\\') ||
		normalized.startsWith('c:\\program files (x86)\\') ||
		normalized.startsWith('c:\\users\\') ||
		normalized.startsWith('c:\\programdata\\')
	) {
		return 'third-party-app';
	}

	return 'other';
}

export function exeNameFromWindowsPath(path: string): string | null {
	const match = path.match(/([^\\\/]+\.exe)\b/gi);
	return match?.[match.length - 1]?.toLowerCase() ?? null;
}

export function classifyWindowsTimelineApp(path: string): TimelineAppCategory {
	const exeName = exeNameFromWindowsPath(path);
	if (exeName && OVERRIDE_BY_EXE[exeName]) {
		return OVERRIDE_BY_EXE[exeName];
	}

	switch (classifyWindowsGuestProcessType(path)) {
		case 'system':
			return APP_SYSTEM_CATEGORY;
		case 'microsoft-component':
			return APP_MICROSOFT_CATEGORY;
		default:
			return APP_THIRD_PARTY_CATEGORY;
	}
}
