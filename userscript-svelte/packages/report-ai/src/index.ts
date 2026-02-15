import type { NodeKey, ReportModel } from '@prv/report-core';

export function truncateText(
  text: string,
  opts?: { maxChars?: number }
): { text: string; truncated: boolean } {
  const maxChars = opts?.maxChars ?? 50_000;
  if (text.length <= maxChars) return { text, truncated: false };
  return { text: text.slice(0, maxChars), truncated: true };
}

export function toNodeSummary(nodeKey: NodeKey, summary: unknown): unknown {
  return {
    nodeKey,
    summary
  };
}

export function toAgentSummary(report: ReportModel): {
  identity: {
    vmName?: string;
    guestOs?: string;
    reportId?: string;
  };
  risks: string[];
  notes: string[];
} {
  const risks: string[] = [];
  const notes: string[] = [];

  if (report.currentVm?.isExternalVhdd) risks.push('VM disk located outside the PVM bundle (external vHDD).');
  if (report.currentVm?.isBootCamp) notes.push('Boot Camp VM detected.');
  if (report.drivers?.isHackintosh) risks.push('Hackintosh indicators detected (LoadedDrivers).');
  if (report.storage?.hddFull) risks.push('Host storage is full (MountInfo).');
  if (report.storage?.lowStorage) risks.push('Host storage is low (MountInfo).');
  if (report.hostDevices?.flags?.privacyRestricted) notes.push('macOS privacy restrictions present (camera/microphone).');

  const vmName = report.currentVm?.vmName;
  const guestOs = [report.guestOs?.type, report.guestOs?.version].filter(Boolean).join(' ');

  return {
    identity: {
      vmName,
      guestOs: guestOs || undefined,
      reportId: report.meta.reportId
    },
    risks,
    notes
  };
}

