import type { LogRow } from '$lib/logs/index/types';
import type { LogRowLocator, TimelineEvent, TimelineSeverity } from '$lib/lab/timeline/types';

export type RuleMatch = RegExpExecArray | true;

export type BaseRuleRowContext = {
	sourceFile: string;
	rows: LogRow[];
	index: number;
	row: LogRow;
	prevRow: LogRow | null;
	nextRow: LogRow | null;
	at: Date | null;
	text: string;
};

export type RuleRowContext = BaseRuleRowContext & {
	ruleId: string;
	runtime: RuleRuntime;
};

export type RowRule = {
	kind: 'row';
	ruleId: string;
	match: (ctx: RuleRowContext) => RuleMatch | null | false;
	buildEvents: (ctx: RuleRowContext, match: RuleMatch) => TimelineEvent | TimelineEvent[] | null;
	cooldownMs?: number;
	dedupeKey?: (ctx: RuleRowContext, match: RuleMatch) => string | null;
};

export type StatefulRuleContext = BaseRuleRowContext & {
	runtime: RuleRuntime;
	emit: (event: TimelineEvent | TimelineEvent[] | null | undefined) => void;
};

export type StatefulRuleRunner = {
	ruleId: string;
	consumeRow: (ctx: StatefulRuleContext) => void;
	finalize?: () => TimelineEvent[];
};

export type StatefulRuleFactory = {
	kind: 'stateful';
	ruleId: string;
	create: (runtime: RuleRuntime) => StatefulRuleRunner;
};

export type TimelineRule = RowRule | StatefulRuleFactory;

export type SourceRuleRegistry = {
	sourceFile: string;
	rules: TimelineRule[];
};

export class RuleRuntime {
	readonly #cooldowns = new Map<string, number>();

	checkCooldown(key: string, atMs: number, cooldownMs: number): boolean {
		const lastSeen = this.#cooldowns.get(key);
		if (lastSeen != null && atMs - lastSeen <= cooldownMs) return false;
		this.#cooldowns.set(key, atMs);
		return true;
	}
}

export function locatorForRow(row: LogRow): LogRowLocator {
	return {
		sourceFile: row.sourceFile,
		rowId: row.id,
		lineNo: row.lineNo,
		tsWallMs: row.tsWallMs ?? undefined
	};
}

export function dateForRow(row: LogRow): Date | null {
	if (row.tsWallMs == null) return null;
	return new Date(row.tsWallMs);
}

export function textForRow(row: LogRow): string {
	return row.message || row.raw;
}

export function slugify(value: string): string {
	return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function createRowEvent(opts: {
	ruleId: string;
	row: LogRow;
	category: string;
	label: string;
	severity?: TimelineSeverity;
	detail?: string;
	start?: Date;
	end?: Date;
	endRow?: LogRow | null;
	idSuffix?: string;
}): TimelineEvent {
	const start = opts.start ?? dateForRow(opts.row) ?? new Date(0);
	const idSuffix = opts.idSuffix ? `:${opts.idSuffix}` : '';
	return {
		id: `${opts.row.sourceFile}:${opts.ruleId}:${opts.row.id}${idSuffix}`,
		ruleId: opts.ruleId,
		sourceFile: opts.row.sourceFile,
		category: opts.category,
		severity: opts.severity ?? 'info',
		start,
		end: opts.end,
		label: opts.label,
		detail: opts.detail,
		startRef: locatorForRow(opts.row),
		endRef: opts.endRow ? locatorForRow(opts.endRow) : undefined
	};
}

function pushEvent(out: TimelineEvent[], event: TimelineEvent | TimelineEvent[] | null | undefined) {
	if (!event) return;
	if (Array.isArray(event)) {
		for (const item of event) pushEvent(out, item);
		return;
	}
	out.push(event);
}

export function executeSourceRegistry(
	registry: SourceRuleRegistry,
	rows: LogRow[]
): TimelineEvent[] {
	const orderedRows = [...rows].sort((left, right) => left.lineNo - right.lineNo);
	const runtime = new RuleRuntime();
	const events: TimelineEvent[] = [];
	const rowRules = registry.rules.filter((rule): rule is RowRule => rule.kind === 'row');
	const statefulRunners = registry.rules
		.filter((rule): rule is StatefulRuleFactory => rule.kind === 'stateful')
		.map((rule) => rule.create(runtime));

	for (let index = 0; index < orderedRows.length; index += 1) {
		const row = orderedRows[index]!;
		const prevRow = index > 0 ? orderedRows[index - 1]! : null;
		const nextRow = index + 1 < orderedRows.length ? orderedRows[index + 1]! : null;
		const at = dateForRow(row);
		const baseCtx: BaseRuleRowContext = {
			sourceFile: registry.sourceFile,
			rows: orderedRows,
			index,
			row,
			prevRow,
			nextRow,
			at,
			text: textForRow(row)
		};

		for (const runner of statefulRunners) {
			runner.consumeRow({
				...baseCtx,
				runtime,
				emit: (event) => pushEvent(events, event)
			});
		}

		for (const rule of rowRules) {
			const ctx: RuleRowContext = { ...baseCtx, ruleId: rule.ruleId, runtime };
			const match = rule.match(ctx);
			if (!match || !at) continue;
			if (rule.cooldownMs != null) {
				const key = rule.dedupeKey?.(ctx, match) ?? `${rule.ruleId}:${registry.sourceFile}`;
				if (!runtime.checkCooldown(key, at.getTime(), rule.cooldownMs)) continue;
			}
			pushEvent(events, rule.buildEvents(ctx, match));
		}
	}

	for (const runner of statefulRunners) {
		pushEvent(events, runner.finalize?.() ?? []);
	}

	const deduped = new Map<string, TimelineEvent>();
	for (const event of events) {
		if (!deduped.has(event.id)) deduped.set(event.id, event);
	}

	return [...deduped.values()].sort((left, right) => left.start.getTime() - right.start.getTime());
}
