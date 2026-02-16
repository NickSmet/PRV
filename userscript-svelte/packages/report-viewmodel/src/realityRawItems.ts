import type { NodeKey } from '@prv/report-core';

export type RealityRawItem =
	| { kind: 'node'; nodeKey: NodeKey; title: string }
	| { kind: 'file'; filePath: string; filename: string; size: number; group: string; vmUuid?: string };

