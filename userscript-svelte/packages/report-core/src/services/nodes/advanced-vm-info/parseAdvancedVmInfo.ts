/**
 * Advanced VM Info Parser
 *
 * Parses the AdvancedVmInfo XML/text to extract:
 * - Snapshots list with names and creation dates
 * - PVM bundle file listing (from ls -lR output)
 * - ACL/permissions issues
 * - Missing snapshot warnings
 */

import {
  parseLsLr,
  parseLsLrTree,
  treeContainsFileName,
  type LsEntry as BundleEntry,
  type LsEntryBase as BundleEntryBase,
  type LsEntryKind as BundleEntryKind,
  type LsEntryMeta as BundleEntryMeta,
  type LsFileEntry as BundleFileEntry,
  type LsFolderEntry as BundleFolderEntry
} from '../../utils/lsLr';

// Preserve the historical exported names used across the codebase/UI.
export type {
  BundleEntry,
  BundleEntryBase,
  BundleEntryKind,
  BundleEntryMeta,
  BundleFileEntry,
  BundleFolderEntry
};

// Preserve the historical helper export (used by older code and docs).
export { parseLsLr };

export interface Snapshot {
  name: string;
  dateTime: string;
}

export interface AdvancedVmInfoSummary {
  snapshots: Snapshot[];
  snapshotCount: number;
  pvmBundleContents?: string;      // Formatted file listing
  pvmBundleTree?: BundleFolderEntry;
  hasAclIssues?: boolean;          // writeattr present
  hasRootOwner?: boolean;          // root or _unknown owner
  hasDeleteSnapshotOp?: boolean;   // Operation="DeleteSnaphot" (note: typo in legacy)
  mainSnapshotMissing?: boolean;   // '860e329aab41}.hds' missing
}

function extractCdata(xml: string, tagName: string): string | undefined {
  const re = new RegExp(`<${tagName}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${tagName}>`, 'i');
  const match = re.exec(xml);
  return match?.[1];
}

/**
 * Parse AdvancedVmInfo XML/text
 */
export function parseAdvancedVmInfo(
  data: string,
  isBootCamp?: boolean,
  guestOsType?: string,
  productName?: string
): AdvancedVmInfoSummary | null {
  if (!data) {
    console.warn('[parseAdvancedVmInfo] No data provided');
    return null;
  }

  // Ensure data starts with XML tag
  let xmlData = data;
  if (!data.includes('<AdvancedVmInfo')) {
    xmlData = '<AdvancedVmInfo>' + data;
  }

  const snapshotsXml = extractCdata(xmlData, 'Snapshots') ?? xmlData;

  // Parse snapshots using regex (more reliable than XML parsing for this node)
  const snapshotRegex = /<Name>(?<name>[^<]*)<\/Name>\s*<DateTime>(?<dateTimeString>[^<]*)<\/DateTime>/g;
  const snapshots: Snapshot[] = [];

  for (const match of snapshotsXml.matchAll(snapshotRegex)) {
    // Skip empty entries (the first one is typically empty)
    if (!match.groups?.dateTimeString) continue;

    snapshots.push({
      name: match.groups.name || '',
      dateTime: match.groups.dateTimeString
    });
  }

  const bundleList = extractCdata(xmlData, 'VmBundleFileList') ?? data;

  // Parse PVM bundle contents (ls -lR output)
  const pvmBundleContents = parseLsLr(bundleList);
  const pvmBundleTree = parseLsLrTree(bundleList);

  // Check for issues
  const hasAclIssues = data.includes('writeattr');
  const hasRootOwner = data.match(/ root |\_unknown/) !== null;
  const hasDeleteSnapshotOp = data.includes('Operation="DeleteSnaphot"'); // Note: typo is intentional (matches legacy)

  // Check if main snapshot is missing
  let mainSnapshotMissing = false;
  const hasSnapshotData = !!pvmBundleTree || pvmBundleContents.length > 1;
  const hasMissingMainSnapshot = !treeContainsFileName(pvmBundleTree, '860e329aab41}.hds');
  const isNotChromeOS = !productName?.match('Chrome OS');
  const isNotMacvm = guestOsType !== 'macvm';

  if (hasSnapshotData && hasMissingMainSnapshot && isNotChromeOS && !isBootCamp && isNotMacvm) {
    mainSnapshotMissing = true;
  }

  return {
    snapshots,
    snapshotCount: snapshots.length,
    pvmBundleContents,
    pvmBundleTree,
    hasAclIssues,
    hasRootOwner,
    hasDeleteSnapshotOp,
    mainSnapshotMissing
  };
}
