import fs from 'node:fs/promises';
import path from 'node:path';

import type { ReportusFileEntry } from '@prv/report-api';

import type { LogWorkspaceFile, LogWorkspacePageData } from '$lib/lab/log-workspace/types';
import { getFixtureReportDir } from '$lib/server/fixtures';
import { getReportusClient } from '$lib/server/reportus';

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

function filterScopedApiFiles(entries: ReportusFileEntry[]): LogWorkspaceFile[] {
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

async function loadFixtureFiles(reportId: string): Promise<{
	available: boolean;
	timezoneOffsetSeconds: number | null;
	yearHint: number | null;
	files: LogWorkspaceFile[];
}> {
	const fixtureDir = await getFixtureReportDir(reportId);
	if (!fixtureDir) {
		return { available: false, timezoneOffsetSeconds: null, yearHint: null, files: [] };
	}

	const dirEntries = await fs.readdir(fixtureDir, { withFileTypes: true }).catch(() => []);
	const wanted = new Set(['vm.log', 'parallels-system.log', 'tools.log']);
	const files: LogWorkspaceFile[] = [];

	for (const entry of dirEntries) {
		if (!entry.isFile() || !wanted.has(entry.name)) continue;
		const fullPath = path.join(fixtureDir, entry.name);
		const stat = await fs.stat(fullPath).catch(() => null);
		if (!stat) continue;
		files.push({ filename: entry.name, filePath: entry.name, size: stat.size });
	}

	const order = new Map([
		['vm.log', 0],
		['parallels-system.log', 1],
		['tools.log', 2]
	]);
	files.sort((a, b) => (order.get(a.filename) ?? 99) - (order.get(b.filename) ?? 99));

	const reportXml = await fs.readFile(path.join(fixtureDir, 'Report.xml'), 'utf8').catch(() => '');

	return {
		available: true,
		timezoneOffsetSeconds: reportXml ? parseTimezoneOffsetSeconds(reportXml) : null,
		yearHint: inferYearHint(files),
		files
	};
}

async function loadApiFiles(reportId: string): Promise<{
	timezoneOffsetSeconds: number | null;
	yearHint: number | null;
	files: LogWorkspaceFile[];
}> {
	const client = getReportusClient();
	const index = await client.getReportIndex(reportId);
	const files = filterScopedApiFiles(index.files);
	const reportXmlEntry = index.files.find((entry) => entry.filename === 'Report.xml');

	let timezoneOffsetSeconds: number | null = null;
	if (reportXmlEntry) {
		const { text } = await client.downloadFileText(reportId, reportXmlEntry.path, {
			maxBytes: 256 * 1024
		});
		timezoneOffsetSeconds = parseTimezoneOffsetSeconds(text);
	}

	return {
		timezoneOffsetSeconds,
		yearHint: inferYearHint(files),
		files
	};
}

export async function loadLogWorkspacePageData(reportId: string): Promise<LogWorkspacePageData> {
	try {
		const api = await loadApiFiles(reportId);
		return {
			reportId,
			sourceKind: 'api',
			reportOk: true,
			timezoneOffsetSeconds: api.timezoneOffsetSeconds,
			yearHint: api.yearHint,
			files: api.files,
			defaultFile: pickDefaultFile(api.files),
			defaultSelected: pickDefaultSelected(api.files)
		};
	} catch {
		const fixture = await loadFixtureFiles(reportId);
		return {
			reportId,
			sourceKind: 'fixture',
			reportOk: fixture.available,
			timezoneOffsetSeconds: fixture.timezoneOffsetSeconds,
			yearHint: fixture.yearHint,
			files: fixture.files,
			defaultFile: pickDefaultFile(fixture.files),
			defaultSelected: pickDefaultSelected(fixture.files)
		};
	}
}
