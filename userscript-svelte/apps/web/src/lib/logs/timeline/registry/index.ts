import type { LogRow } from '$lib/logs/index/types';
import type { TimelineEvent } from '$lib/lab/timeline/types';

import { executeSourceRegistry } from './runtime';
import { parallelsSystemLogRegistry } from './sources/parallelsSystemLog';
import { toolsLogRegistry } from './sources/toolsLog';
import { vmLogRegistry } from './sources/vmLog';

const SOURCE_REGISTRIES = new Map([
	[parallelsSystemLogRegistry.sourceFile, parallelsSystemLogRegistry],
	[toolsLogRegistry.sourceFile, toolsLogRegistry],
	[vmLogRegistry.sourceFile, vmLogRegistry]
]);

export function extractTimelineEventsFromRows(rows: LogRow[]): TimelineEvent[] {
	const rowsByFile = new Map<string, LogRow[]>();
	for (const row of rows) {
		const bucket = rowsByFile.get(row.sourceFile) ?? [];
		bucket.push(row);
		rowsByFile.set(row.sourceFile, bucket);
	}

	const events: TimelineEvent[] = [];
	for (const [sourceFile, sourceRows] of rowsByFile.entries()) {
		const registry = SOURCE_REGISTRIES.get(sourceFile);
		if (!registry) continue;
		events.push(...executeSourceRegistry(registry, sourceRows));
	}

	events.sort((left, right) => left.start.getTime() - right.start.getTime());
	return events;
}
