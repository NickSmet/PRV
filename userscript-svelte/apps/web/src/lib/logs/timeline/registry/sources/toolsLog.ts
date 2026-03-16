import type { LogRow } from '$lib/logs/index/types';
import type { SourceRuleRegistry } from '../runtime';
import {
	createRowEvent,
	type RowRule
} from '../runtime';
import { TOOLS_CATEGORY } from '../categories';

type ToolsRule = {
	ruleId: string;
	pattern: RegExp;
	label: string | ((match: RegExpExecArray) => string);
	severity: 'info' | 'warn' | 'danger';
};

const TOOLS_RULES: ToolsRule[] = [
	{
		ruleId: 'tools.install_type',
		pattern: /Installation type ([A-Z]+) detected/i,
		label: (match) => `Installation type: ${match[1]}`,
		severity: 'info'
	},
	{
		ruleId: 'tools.install_success_3010',
		pattern: /Installer exited with error code 3010: The requested operation is successful.*/i,
		label: 'Installation successful!',
		severity: 'info'
	},
	{
		ruleId: 'tools.setup_finished_3010',
		pattern: /Setup finished with code 3010 \(0xbc2\)/i,
		label: 'Installation successful!',
		severity: 'info'
	},
	{
		ruleId: 'tools.requested_operation_successful',
		pattern: /The requested operation is successful/i,
		label: 'Installation successful!',
		severity: 'info'
	},
	{
		ruleId: 'tools.setup_finished_0',
		pattern: /Setup finished with code 0 \(0x0\)/i,
		label: 'Installation successful!',
		severity: 'info'
	},
	{
		ruleId: 'tools.setup_finished_1641',
		pattern: /Setup finished with code 1641 \(0x669\)/i,
		label: 'Installation successful!',
		severity: 'info'
	},
	{
		ruleId: 'tools.setup_mode_update',
		pattern: /\*{14} Setup mode: UPDATE from version (\d\d\.\d\.\d\.\d{5})/i,
		label: (match) => `Updating from ${match[1]}`,
		severity: 'info'
	},
	{
		ruleId: 'tools.setup_mode_express',
		pattern: /\*{14} Setup mode: EXPRESS INSTALL\./i,
		label: 'Original installation.',
		severity: 'info'
	},
	{
		ruleId: 'tools.setup_mode_install',
		pattern: /\*{14} Setup mode: INSTALL\./i,
		label: 'Manual installation.',
		severity: 'info'
	},
	{
		ruleId: 'tools.setup_mode_reinstall',
		pattern: /\*{14} Setup mode: REINSTALL/i,
		label: 'Reinstalling.',
		severity: 'info'
	},
	{
		ruleId: 'tools.install_failed_1603',
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

function isToolsSetupRow(raw: string, tags: string[]) {
	return tags.includes('WIN_TOOLS_SETUP') || /WIN_TOOLS_SETUP\]/.test(raw);
}

const toolsInstallRowRules: RowRule[] = TOOLS_RULES.map((rule) => ({
	kind: 'row',
	ruleId: rule.ruleId,
	match: (ctx) => {
		if (!ctx.at) return false;
		if (!isToolsSetupRow(ctx.row.raw, ctx.row.tags ?? [])) return false;
		return rule.pattern.exec(ctx.text);
	},
	buildEvents: (ctx, match) =>
		createRowEvent({
			ruleId: rule.ruleId,
			row: ctx.row,
			category: TOOLS_CATEGORY,
			severity: rule.severity,
			label: typeof rule.label === 'function' ? rule.label(match as RegExpExecArray) : rule.label,
			detail: ctx.text,
			idSuffix: typeof rule.label === 'function' ? 'dynamic' : undefined
		})
}));

export const toolsLogRegistry: SourceRuleRegistry = {
	sourceFile: 'tools.log',
	rules: [
		...toolsInstallRowRules,
		{
			kind: 'stateful',
			ruleId: 'tools.tail_issues',
			create: () => {
				const rows: Array<{ at: Date; text: string; row: LogRow }> = [];
				return {
					ruleId: 'tools.tail_issues',
					consumeRow(ctx) {
						if (!ctx.at) return;
						rows.push({ at: ctx.at, text: ctx.text, row: ctx.row });
					},
					finalize() {
						if (rows.length === 0) return [];

						const joinedTail = rows.map((row) => row.text).join('\n').slice(-1000);
						const toolsSuccess = TOOLS_SUCCESS_PATTERNS.some((pattern) => pattern.test(joinedTail));
						const out = [];

						const last300Rows = rows.slice(-300);
						const corruptRegistryRow = [...last300Rows]
							.reverse()
							.find((row) => /configuration registry database is corrupt/i.test(row.text));
						if (corruptRegistryRow) {
							out.push(
								createRowEvent({
									ruleId: 'tools.registry_corruption',
									row: corruptRegistryRow.row,
									category: TOOLS_CATEGORY,
									severity: 'danger',
									label: 'Registry database is corrupt',
									detail: `${corruptRegistryRow.text}\nReference: Windows registry corruption during Tools install.`,
									idSuffix: 'corrupt-registry'
								})
							);
						}

						if (!toolsSuccess) {
							const prlDdRow = [...rows.slice(-30)]
								.reverse()
								.find((row) => /prl_dd\.inf/i.test(row.text));
							if (prlDdRow) {
								out.push(
									createRowEvent({
										ruleId: 'tools.prl_dd_kb125243',
										row: prlDdRow.row,
										category: TOOLS_CATEGORY,
										severity: 'danger',
										label: 'prl_dd.inf issue (KB125243)',
										detail: `${prlDdRow.text}\nReference: KB125243`,
										idSuffix: 'kb125243'
									})
								);
							}
						}

						return out;
					}
				};
			}
		}
	]
};
