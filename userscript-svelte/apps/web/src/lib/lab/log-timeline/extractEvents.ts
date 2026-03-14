import type { LogRow } from '$lib/lab/log-index/types';
import type { LogRowLocator, TimelineEvent } from '$lib/lab/timeline/types';

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

	type DiffRow = {
		row: LogRow;
		at: Date;
		text: string;
	};

	const openByKey = new Map<string, OpenMessage>();
	const msgDataByCode = new Map<string, { at: Date; detail: string }>();
	let diffBurst: { start: Date; end: Date; rows: DiffRow[] } | null = null;

	function flushDiffBurst() {
		if (!diffBurst || diffBurst.rows.length === 0) {
			diffBurst = null;
			return;
		}

		const count = diffBurst.rows.length;
		const preview = diffBurst.rows
			.slice(0, 20)
			.map((item) => item.text)
			.join('\n');
		const detail = count > 20 ? `${preview}\n… +${count - 20} more` : preview;
		const firstRow = diffBurst.rows[0]!.row;
		const lastRow = diffBurst.rows[count - 1]!.row;

		events.push({
			id: `${firstRow.sourceFile}:config:${firstRow.id}:${lastRow.id}`,
			sourceFile: firstRow.sourceFile,
			category: 'Config Diffs',
			severity: 'info',
			start: diffBurst.start,
			end: diffBurst.end,
			label: count === 1 ? '1 config change' : `${count} config changes`,
			detail,
			startRef: locatorForRow(firstRow),
			endRef: locatorForRow(lastRow)
		});

		diffBurst = null;
	}

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
		if (!diffBurst) {
			diffBurst = { start: at, end: at, rows: [{ row, at, text: rendered }] };
			continue;
		}

		const gapMs = at.getTime() - diffBurst.end.getTime();
		if (gapMs > 250) {
			flushDiffBurst();
			diffBurst = { start: at, end: at, rows: [{ row, at, text: rendered }] };
			continue;
		}

		diffBurst.end = at;
		diffBurst.rows.push({ row, at, text: rendered });
	}

	flushDiffBurst();

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

function pushVmAppEvents(rows: LogRow[], events: TimelineEvent[]) {
	type AggregatedApp = {
		first: LogRow;
		last: LogRow;
		start: Date;
		end: Date;
		label: string;
		detail?: string;
	};

	const byKey = new Map<string, AggregatedApp>();

	for (const row of rows) {
		const at = dateForRow(row);
		if (!at) continue;
		const text = row.message || row.raw;
		const d3d = /\b(?<d3d>D3D\d+\.\d+):\s+(?<path>.+)$/.exec(text);
		if (!d3d?.groups?.d3d || !d3d.groups.path) continue;

		const exeMatch = d3d.groups.path.match(/([^\\\/]+\.exe)\b/gi);
		const exe = exeMatch?.[exeMatch.length - 1] ?? null;
		if (!exe) continue;

		const d3dVersion = d3d.groups.d3d;
		const key = `${exe.toLowerCase()}|${d3dVersion}`;
		const label = `${exe} (${d3dVersion})`;
		const existing = byKey.get(key);

		if (!existing) {
			byKey.set(key, {
				first: row,
				last: row,
				start: at,
				end: at,
				label,
				detail: d3d.groups.path.trim()
			});
			continue;
		}

		if (row.lineNo < existing.first.lineNo) {
			existing.first = row;
			existing.start = at;
		}
		if (row.lineNo > existing.last.lineNo) {
			existing.last = row;
			existing.end = at;
		}
	}

	for (const [key, value] of byKey.entries()) {
		events.push({
			id: `${value.first.sourceFile}:apps:${value.first.id}:${key}`,
			sourceFile: value.first.sourceFile,
			category: 'Apps',
			severity: 'info',
			start: value.start,
			end: value.end.getTime() === value.start.getTime() ? undefined : value.end,
			label: value.label,
			detail: value.detail,
			startRef: locatorForRow(value.first),
			endRef:
				value.end.getTime() === value.start.getTime() ? undefined : locatorForRow(value.last)
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
		}
	}

	events.sort((left, right) => left.start.getTime() - right.start.getTime());
	return events;
}
