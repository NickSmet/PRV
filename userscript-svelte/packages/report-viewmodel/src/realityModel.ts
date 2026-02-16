import type { NodeKey } from '@prv/report-core';

export type RealityTopSectionId = 'header' | 'host' | 'parallels' | 'vms' | 'raw';

export type RealitySourceRef =
  | { kind: 'node'; nodeKey: NodeKey; label?: string }
  | { kind: 'file'; filePath: string; filename: string; label?: string; vmUuid?: string };

export interface RealityCardModel {
  id: string;
  title: string;
  iconKey?: string;
  openByDefault: boolean;
  sources: RealitySourceRef[];
  render:
    | { kind: 'nodeKey'; nodeKey: NodeKey }
    | { kind: 'vmSettings'; vmUuid: string }
    | { kind: 'vmLogs'; vmUuid: string }
    | { kind: 'rawIndex' };
}

export interface RealityVmModel {
  uuid: string;
  name: string;
  isCurrent: boolean;
  cards: RealityCardModel[];
}

export interface RealityModel {
  reportId: string;
  sections: Array<{
    id: RealityTopSectionId;
    title: string;
    subtitle?: string;
    openByDefault: boolean;
    cards: RealityCardModel[];
    vms?: RealityVmModel[];
  }>;
}

