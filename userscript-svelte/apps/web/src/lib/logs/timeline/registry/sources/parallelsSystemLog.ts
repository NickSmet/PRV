import type { SourceRuleRegistry } from '../runtime';
import {
	createRowEvent,
	locatorForRow,
	type RowRule
} from '../runtime';
import {
	CONFIG_DIFFS_CATEGORY,
	ERRORS_CATEGORY,
	GUI_MESSAGES_CATEGORY,
	NETWORK_CATEGORY
} from '../categories';

const CONFIG_DIFF_SKIP_RE =
	/BlockSize|\.SizeOnDisk|PackingOptions|InternalVmInfo|\.Profile\.Custom|HibernateState|BootingOrder|UserFriendlyName|SystemName|AppVersion/;

function regexRowRule(opts: {
	ruleId: string;
	pattern: RegExp;
	category: string;
	label: string | ((match: RegExpExecArray) => string);
	severity?: 'info' | 'warn' | 'danger';
	cooldownMs?: number;
	dedupeKey?: string;
	detail?: (match: RegExpExecArray, text: string) => string;
}): RowRule {
	return {
		kind: 'row',
		ruleId: opts.ruleId,
		match: (ctx) => {
			if (!ctx.at) return false;
			return opts.pattern.exec(ctx.text);
		},
		cooldownMs: opts.cooldownMs,
		dedupeKey: () => opts.dedupeKey ?? opts.ruleId,
		buildEvents: (ctx, match) =>
			createRowEvent({
				ruleId: opts.ruleId,
				row: ctx.row,
				category: opts.category,
				severity: opts.severity ?? 'warn',
				label: typeof opts.label === 'function' ? opts.label(match as RegExpExecArray) : opts.label,
				detail: opts.detail?.(match as RegExpExecArray, ctx.text) ?? ctx.text
			})
	};
}

export const parallelsSystemLogRegistry: SourceRuleRegistry = {
	sourceFile: 'parallels-system.log',
	rules: [
		{
			kind: 'stateful',
			ruleId: 'prl.gui_message_lifecycle',
			create: () => {
				type OpenMessage = {
					row: Parameters<typeof createRowEvent>[0]['row'];
					at: Date;
					typeCode: string;
					detail?: string;
				};

				const openByKey = new Map<string, OpenMessage>();
				const msgDataByCode = new Map<string, { at: Date; detail: string }>();

				return {
					ruleId: 'prl.gui_message_lifecycle',
					consumeRow(ctx) {
						if (!ctx.at) return;

						const msgData =
							/Message data: .*?\bCode=(?<code>[A-Z0-9_]+);.*?\bShort="(?<short>[^"]*)";\s*Long="(?<long>[^"]*)";\s*Details="(?<details>[^"]*)";/.exec(
								ctx.text
							);
						if (msgData?.groups?.code) {
							const detailParts = [
								msgData.groups.short?.trim() ? `Short: ${msgData.groups.short.trim()}` : null,
								msgData.groups.long?.trim() ? `Long: ${msgData.groups.long.trim()}` : null,
								msgData.groups.details?.trim()
									? `Details: ${msgData.groups.details.trim()}`
									: null
							].filter(Boolean);
							msgDataByCode.set(msgData.groups.code, { at: ctx.at, detail: detailParts.join('\n') });
						}

						const show =
							/Showing message box\.\s+Type = \[(?<type>[^,]+),\s*(?<code>[^\]]+)\]\.\s+Id = \{(?<id>[0-9a-fA-F-]{36})\}/.exec(
								ctx.text
							);
						if (show?.groups?.id && show.groups.code) {
							const typeCode = show.groups.code.trim();
							const key = `${show.groups.id.toLowerCase()}|${typeCode}`;
							const meta = msgDataByCode.get(typeCode);
							const detail =
								meta && Math.abs(meta.at.getTime() - ctx.at.getTime()) <= 2000
									? meta.detail
									: undefined;
							openByKey.set(key, { row: ctx.row, at: ctx.at, typeCode, detail });
							return;
						}

						const close =
							/Closing message box\.\s+Type = \[(?<type>[^,]+),\s*(?<code>[^\]]+)\]\.\s+Id = \{(?<id>[0-9a-fA-F-]{36})\}/.exec(
								ctx.text
							);
						if (!close?.groups?.id || !close.groups.code) return;

						const typeCode = close.groups.code.trim();
						const key = `${close.groups.id.toLowerCase()}|${typeCode}`;
						const open = openByKey.get(key);
						if (!open) return;
						openByKey.delete(key);

						ctx.emit({
							id: `${ctx.row.sourceFile}:prl.gui_message_lifecycle:${open.row.id}:${ctx.row.id}`,
							ruleId: 'prl.gui_message_lifecycle',
							sourceFile: ctx.row.sourceFile,
							category: GUI_MESSAGES_CATEGORY,
							severity: 'info',
							start: open.at,
							end: ctx.at,
							label: `PD Message: ${typeCode}`,
							detail: open.detail,
							startRef: locatorForRow(open.row),
							endRef: locatorForRow(ctx.row)
						});
					},
					finalize() {
						const out = [];
						for (const open of openByKey.values()) {
							out.push({
								id: `${open.row.sourceFile}:prl.gui_message_lifecycle:${open.row.id}:open`,
								ruleId: 'prl.gui_message_lifecycle',
								sourceFile: open.row.sourceFile,
								category: GUI_MESSAGES_CATEGORY,
								severity: 'warn',
								start: open.at,
								label: `PD Message: ${open.typeCode}`,
								detail: open.detail,
								startRef: locatorForRow(open.row)
							});
						}
						return out;
					}
				};
			}
		},
		{
			kind: 'row',
			ruleId: 'prl.config_diff',
			match: (ctx) => {
				if (!ctx.at) return false;
				return /(VmCfgCommitDiff|VmCfgAtomicEditDiff|diff):\s+Key:\s+'(?<key>[^']+)',\s+New value:\s+'(?<new>[^']*)',\s+Old value:\s+'(?<old>[^']*)'/.exec(
					ctx.text
				);
			},
			buildEvents: (ctx, match) => {
				const groups = (match as RegExpExecArray).groups;
				const key = groups?.key?.trim();
				if (!key || CONFIG_DIFF_SKIP_RE.test(key)) return null;
				const rendered = `${key}: '${groups?.old ?? ''}' → '${groups?.new ?? ''}'`;
				return createRowEvent({
					ruleId: 'prl.config_diff',
					row: ctx.row,
					category: CONFIG_DIFFS_CATEGORY,
					severity: 'info',
					label: key,
					detail: rendered
				});
			}
		},
		regexRowRule({
			ruleId: 'prl.image_incorrectly_closed',
			pattern: /Image was incorrectly closed/i,
			category: ERRORS_CATEGORY,
			label: 'INCORRECTLY_CLOSED',
			severity: 'danger'
		}),
		regexRowRule({
			ruleId: 'prl.updater_lost_connection',
			pattern: /Updater lost connection timeout expired/i,
			category: ERRORS_CATEGORY,
			label: 'Bad internet',
			severity: 'warn'
		}),
		regexRowRule({
			ruleId: 'prl.font_missing',
			pattern: /not found, using Courier/i,
			category: ERRORS_CATEGORY,
			label: 'Font missing',
			severity: 'warn'
		}),
		regexRowRule({
			ruleId: 'prl.km_error_domain',
			pattern: /KMErrorDomain Code\=1/i,
			category: ERRORS_CATEGORY,
			label: 'PDFM-100983',
			severity: 'danger',
			cooldownMs: 200_000
		}),
		regexRowRule({
			ruleId: 'prl.net_open_failed',
			pattern: /PRL_NET_PRLNET_OPEN_FAILED/i,
			category: NETWORK_CATEGORY,
			label: '~PDFM-102106',
			severity: 'warn'
		}),
		regexRowRule({
			ruleId: 'prl.converter_message_null',
			pattern: /Converter message: \(null\)/i,
			category: ERRORS_CATEGORY,
			label: '~PDFM-102112',
			severity: 'warn'
		})
	]
};
