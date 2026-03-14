export type LogWorkspaceFile = {
	filename: string;
	filePath: string;
	size: number;
};

export type LogWorkspacePageData = {
	reportId: string;
	sourceKind: 'api' | 'fixture';
	reportOk: boolean;
	timezoneOffsetSeconds: number | null;
	yearHint: number | null;
	files: LogWorkspaceFile[];
	defaultFile: string | null;
	defaultSelected: string[];
};
