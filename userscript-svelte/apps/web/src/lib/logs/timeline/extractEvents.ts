import type { LogRow } from '$lib/logs/index/types';
import type { LogRowLocator, TimelineEvent } from '$lib/lab/timeline/types';

import { classifyWindowsTimelineApp } from './classifyWindowsTimelineApp';

const TOOLS_INSTALL_CATEGORY = 'Tools Install';
const TOOLS_ISSUES_CATEGORY = 'Tools Issues';

type ToolsRule = {
	pattern: RegExp;
	label: string | ((match: RegExpExecArray) => string);
	severity: 'info' | 'warn' | 'danger';
};

const TOOLS_RULES: ToolsRule[] = [
	{
		pattern: /Installation type ([A-Z]+) detected/i,
		label: (match) => `Installation type: ${match[1]}`,
		severity: 'info'
	},
	{
		pattern: /Installer exited with error code 3010: The requested operation is successful.*/i,
		label: 'Installation successful!',
		severity: 'info'
	},
	{
		pattern: /Setup finished with code 3010 \(0xbc2\)/i,
		label: 'Installation successful!',
		severity: 'info'
	},
	{
		pattern: /The requested operation is successful/i,
		label: 'Installation successful!',
		severity: 'info'
	},
	{
		pattern: /Setup finished with code 0 \(0x0\)/i,
		label: 'Installation successful!',
		severity: 'info'
	},
	{
		pattern: /Setup finished with code 1641 \(0x669\)/i,
		label: 'Installation successful!',
		severity: 'info'
	},
	{
		pattern: /\*{14} Setup mode: UPDATE from version (\d\d\.\d\.\d\.\d{5})/i,
		label: (match) => `Updating from ${match[1]}`,
		severity: 'info'
	},
	{
		pattern: /\*{14} Setup mode: EXPRESS INSTALL\./i,
		label: 'Original installation.',
		severity: 'info'
	},
	{
		pattern: /\*{14} Setup mode: INSTALL\./i,
		label: 'Manual installation.',
		severity: 'info'
	},
	{
		pattern: /\*{14} Setup mode: REINSTALL/i,
		label: 'Reinstalling.',
		severity: 'info'
	},
	{
		pattern: /Setup completed with code 1603/i,
		label: 'Installation failed.',
		severity: 'danger'
	}
];

const TOOLS_SUCCESS_PATTERNS = [
	/\bsuccessful\b/i,
	/Setup finished with code 3010 \(0xbc2\)/i,
	/Setup finished with code 0 \(0x0\)/i,
	/Setup finished with code 1641 \(0x669\)/i,
	/The requested operation is successful/i
];

function locatorForRow(row: LogRow): LogRowLocator {
	return {
		sourceFile: row.sourceFile,
		rowId: row.id,
		lineNo: row.lineNo,
		tsWallMs: row.tsWallMs ?? undefined
	};
}

function dateForRow(row: LogRow): Date | null {
	if (row.tsWallMs == null) return null;
	return new Date(row.tsWallMs);
}

function pushGuiAndConfigEvents(rows: LogRow[], events: TimelineEvent[]) {
	type OpenMessage = {
		row: LogRow;
		at: Date;
		typeCode: string;
		detail?: string;
	};

	const openByKey = new Map<string, OpenMessage>();
	const msgDataByCode = new Map<string, { at: Date; detail: string }>();

	for (const row of rows) {
		const at = dateForRow(row);
		if (!at) continue;
		const text = row.message || row.raw;

		const msgData =
			/Message data: .*?\bCode=(?<code>[A-Z0-9_]+);.*?\bShort="(?<short>[^"]*)";\s*Long="(?<long>[^"]*)";\s*Details="(?<details>[^"]*)";/.exec(
				text
			);
		if (msgData?.groups?.code) {
			const detailParts = [
				msgData.groups.short?.trim() ? `Short: ${msgData.groups.short.trim()}` : null,
				msgData.groups.long?.trim() ? `Long: ${msgData.groups.long.trim()}` : null,
				msgData.groups.details?.trim() ? `Details: ${msgData.groups.details.trim()}` : null
			].filter(Boolean);
			msgDataByCode.set(msgData.groups.code, { at, detail: detailParts.join('\n') });
		}

		const show =
			/Showing message box\.\s+Type = \[(?<type>[^,]+),\s*(?<code>[^\]]+)\]\.\s+Id = \{(?<id>[0-9a-fA-F-]{36})\}/.exec(
				text
			);
		if (show?.groups?.id && show.groups.code) {
			const typeCode = show.groups.code.trim();
			const key = `${show.groups.id.toLowerCase()}|${typeCode}`;
			const meta = msgDataByCode.get(typeCode);
			const detail =
				meta && Math.abs(meta.at.getTime() - at.getTime()) <= 2000 ? meta.detail : undefined;
			openByKey.set(key, { row, at, typeCode, detail });
			continue;
		}

		const close =
			/Closing message box\.\s+Type = \[(?<type>[^,]+),\s*(?<code>[^\]]+)\]\.\s+Id = \{(?<id>[0-9a-fA-F-]{36})\}/.exec(
				text
			);
		if (close?.groups?.id && close.groups.code) {
			const typeCode = close.groups.code.trim();
			const key = `${close.groups.id.toLowerCase()}|${typeCode}`;
			const open = openByKey.get(key);
			if (open) {
				openByKey.delete(key);
				events.push({
					id: `${row.sourceFile}:gui:${open.row.id}:${row.id}`,
					sourceFile: row.sourceFile,
					category: 'GUI Messages',
					severity: 'info',
					start: open.at,
					end: at,
					label: `PD Message: ${typeCode}`,
					detail: open.detail,
					startRef: locatorForRow(open.row),
					endRef: locatorForRow(row)
				});
			}
			continue;
		}

		const diff =
			/(VmCfgCommitDiff|VmCfgAtomicEditDiff|diff):\s+Key:\s+'(?<key>[^']+)',\s+New value:\s+'(?<new>[^']*)',\s+Old value:\s+'(?<old>[^']*)'/.exec(
				text
			);
		if (!diff?.groups?.key) continue;

		const rendered = `${diff.groups.key}: '${diff.groups.old ?? ''}' → '${diff.groups.new ?? ''}'`;

		events.push({
			id: `${row.sourceFile}:config:${row.id}`,
			sourceFile: row.sourceFile,
			category: 'Config Diffs',
			severity: 'info',
			start: at,
			label: diff.groups.key,
			detail: rendered,
			startRef: locatorForRow(row)
		});
	}

	for (const open of openByKey.values()) {
		events.push({
			id: `${open.row.sourceFile}:gui:${open.row.id}:open`,
			sourceFile: open.row.sourceFile,
			category: 'GUI Messages',
			severity: 'warn',
			start: open.at,
			label: `PD Message: ${open.typeCode}`,
			detail: open.detail,
			startRef: locatorForRow(open.row)
		});
	}
}

function pushToolsEvents(rows: LogRow[], events: TimelineEvent[]) {
	if (rows.length === 0) return;

	const joinedTail = rows
		.map((row) => row.raw || row.message)
		.join('\n')
		.slice(-1000);
	const toolsSuccess = TOOLS_SUCCESS_PATTERNS.some((pattern) => pattern.test(joinedTail));

	for (const row of rows) {
		const at = dateForRow(row);
		if (!at) continue;
		const isToolsSetupRow =
			(row.tags ?? []).includes('WIN_TOOLS_SETUP') || /WIN_TOOLS_SETUP\]/.test(row.raw);
		if (!isToolsSetupRow) continue;

		const message = (row.message || row.raw).trim();
		for (const rule of TOOLS_RULES) {
			const match = rule.pattern.exec(message);
			if (!match) continue;
			const label = typeof rule.label === 'function' ? rule.label(match) : rule.label;
			events.push({
				id: `${row.sourceFile}:tools:${row.id}:${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
				sourceFile: row.sourceFile,
				category: TOOLS_INSTALL_CATEGORY,
				severity: rule.severity,
				start: at,
				label,
				detail: message,
				startRef: locatorForRow(row)
			});
			break;
		}
	}

	const last300Rows = rows.slice(-300);
	const corruptRegistryRow = [...last300Rows]
		.reverse()
		.find((row) => /configuration registry database is corrupt/i.test(row.message || row.raw));
	if (corruptRegistryRow) {
		const at = dateForRow(corruptRegistryRow);
		if (at) {
			events.push({
				id: `${corruptRegistryRow.sourceFile}:tools-issue:${corruptRegistryRow.id}:corrupt-registry`,
				sourceFile: corruptRegistryRow.sourceFile,
				category: TOOLS_ISSUES_CATEGORY,
				severity: 'danger',
				start: at,
				label: 'Registry database is corrupt',
				detail: `${corruptRegistryRow.message || corruptRegistryRow.raw}\nReference: Windows registry corruption during Tools install.`,
				startRef: locatorForRow(corruptRegistryRow)
			});
		}
	}

	const last30Rows = rows.slice(-30);
	const prlDdRow = !toolsSuccess
		? [...last30Rows].reverse().find((row) => /prl_dd\.inf/i.test(row.message || row.raw))
		: null;
	if (prlDdRow) {
		const at = dateForRow(prlDdRow);
		if (at) {
			events.push({
				id: `${prlDdRow.sourceFile}:tools-issue:${prlDdRow.id}:kb125243`,
				sourceFile: prlDdRow.sourceFile,
				category: TOOLS_ISSUES_CATEGORY,
				severity: 'danger',
				start: at,
				label: 'prl_dd.inf issue (KB125243)',
				detail: `${prlDdRow.message || prlDdRow.raw}\nReference: KB125243`,
				startRef: locatorForRow(prlDdRow)
			});
		}
	}
}

function pushVmAppEvents(rows: LogRow[], events: TimelineEvent[]) {
	const lastSeenByPath = new Map<string, number>();
	const APP_SIGHTING_DEDUPE_MS = 2000;

	for (const row of rows) {
		const at = dateForRow(row);
		if (!at) continue;
		const text = row.message || row.raw;
		const d3d = /\b(?<d3d>D3D\d+\.\d+):\s+(?<path>.+)$/.exec(text);
		if (!d3d?.groups?.d3d || !d3d.groups.path) continue;

		const exeMatch = d3d.groups.path.match(/([^\\\/]+\.exe)\b/gi);
		const exe = exeMatch?.[exeMatch.length - 1] ?? null;
		if (!exe) continue;

		const appPath = d3d.groups.path.trim();
		const exePathMatch = /(?<exePath>.*?\.exe)\b/i.exec(appPath);
		const exePath = (exePathMatch?.groups?.exePath ?? appPath).trim();
		const category = classifyWindowsTimelineApp(appPath);
		const d3dVersion = d3d.groups.d3d;
		const dedupeKey = `${category}|${exePath.toLowerCase()}`;
		const label = `${exe} (${d3dVersion})`;
		const seenAtMs = lastSeenByPath.get(dedupeKey);
		if (seenAtMs != null && at.getTime() - seenAtMs <= APP_SIGHTING_DEDUPE_MS) {
			continue;
		}
		lastSeenByPath.set(dedupeKey, at.getTime());

		events.push({
			id: `${row.sourceFile}:apps:${row.id}:${dedupeKey}`,
			sourceFile: row.sourceFile,
			category,
			severity: 'info',
			start: at,
			label,
			detail: exePath,
			startRef: locatorForRow(row)
		});
	}
}

export function extractTimelineEventsFromRows(rows: LogRow[]): TimelineEvent[] {
	const rowsByFile = new Map<string, LogRow[]>();
	for (const row of rows) {
		const bucket = rowsByFile.get(row.sourceFile) ?? [];
		bucket.push(row);
		rowsByFile.set(row.sourceFile, bucket);
	}

	const events: TimelineEvent[] = [];

	for (const [sourceFile, sourceRows] of rowsByFile.entries()) {
		const orderedRows = [...sourceRows].sort((left, right) => left.lineNo - right.lineNo);
		if (sourceFile === 'parallels-system.log') {
			pushGuiAndConfigEvents(orderedRows, events);
			continue;
		}
		if (sourceFile === 'vm.log') {
			pushVmAppEvents(orderedRows, events);
			continue;
		}
		if (sourceFile === 'tools.log') {
			pushToolsEvents(orderedRows, events);
		}
	}

	events.sort((left, right) => left.start.getTime() - right.start.getTime());
	return events;
}
