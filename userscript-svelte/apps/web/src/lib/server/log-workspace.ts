import type { ReportusFileEntry } from '@prv/report-api';

import type { LogWorkspaceFile, LogWorkspacePageData } from '$lib/logs/workspace/types';
import type { ReportSourceMode } from '$lib/server/report-source';
import { resolveReportSource } from '$lib/server/report-source';

function parseTimezoneOffsetSeconds(reportXml: string): number | null {
	const match = reportXml.match(/<TimeZone>(-?\d+)<\/TimeZone>/);
	if (!match) return null;
	const value = Number(match[1]);
	return Number.isFinite(value) ? value : null;
}

function inferYearHint(files: Array<{ filename: string; filePath?: string }>): number | null {
	for (const file of files) {
		const haystacks = [file.filename, file.filePath ?? ''];
		for (const value of haystacks) {
			const ymd = value.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/);
			if (ymd) return Number(ymd[1]);
			const ymdDot = value.match(/\b(20\d{2})\.(\d{2})\.(\d{2})\b/);
			if (ymdDot) return Number(ymdDot[1]);
		}
	}

	return null;
}

function pickDefaultFile(files: Array<{ filename: string }>): string | null {
	const available = new Set(files.map((file) => file.filename));
	if (available.has('vm.log')) return 'vm.log';
	if (available.has('parallels-system.log')) return 'parallels-system.log';
	if (available.has('tools.log')) return 'tools.log';
	return files[0]?.filename ?? null;
}

function pickDefaultSelected(files: Array<{ filename: string }>): string[] {
	const wanted = ['vm.log', 'parallels-system.log', 'tools.log'];
	const available = new Set(files.map((file) => file.filename));
	return wanted.filter((filename) => available.has(filename));
}

function filterScopedLogFiles(entries: ReportusFileEntry[]): LogWorkspaceFile[] {
	const wanted = ['vm.log', 'parallels-system.log', 'tools.log'];
	const byFilename = new Map<string, ReportusFileEntry>();

	for (const entry of entries) {
		if (!wanted.includes(entry.filename)) continue;
		const current = byFilename.get(entry.filename);
		if (!current || entry.path.length < current.path.length) {
			byFilename.set(entry.filename, entry);
		}
	}

	return wanted
		.map((filename) => byFilename.get(filename))
		.filter((entry): entry is ReportusFileEntry => !!entry)
		.map((entry) => ({
			filename: entry.filename,
			filePath: entry.path,
			size: entry.size
		}));
}

export async function loadLogWorkspacePageData(
	reportId: string,
	options?: { forceReparse?: boolean; sourceModeOverride?: ReportSourceMode }
): Promise<LogWorkspacePageData> {
	const forceReparse = options?.forceReparse ?? false;
	const source = await resolveReportSource(reportId, { modeOverride: options?.sourceModeOverride });
	const files = filterScopedLogFiles(source.index.files);
	const reportXmlEntry = source.index.files.find((entry) => entry.filename === 'Report.xml');

	let timezoneOffsetSeconds: number | null = null;
	if (reportXmlEntry) {
		const { text } = await source.client.downloadFileText(reportId, reportXmlEntry.path, {
			maxBytes: 256 * 1024
		});
		timezoneOffsetSeconds = parseTimezoneOffsetSeconds(text);
	}

	return {
		reportId,
		sourceKind: source.sourceKind,
		reportOk: true,
		forceReparse,
		reportReceivedAt: source.index.received ?? null,
		timezoneOffsetSeconds,
		yearHint: inferYearHint(files),
		files,
		defaultFile: pickDefaultFile(files),
		defaultSelected: pickDefaultSelected(files)
	};
}
