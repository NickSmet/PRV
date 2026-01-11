/**
 * Advanced VM Info Parser
 *
 * Parses the AdvancedVmInfo XML/text to extract:
 * - Snapshots list with names and creation dates
 * - PVM bundle file listing (from ls -lR output)
 * - ACL/permissions issues
 * - Missing snapshot warnings
 */

export interface Snapshot {
  name: string;
  dateTime: string;
}

export interface AdvancedVmInfoSummary {
  snapshots: Snapshot[];
  snapshotCount: number;
  pvmBundleContents?: string;      // Formatted file listing
  hasAclIssues?: boolean;          // writeattr present
  hasRootOwner?: boolean;          // root or _unknown owner
  hasDeleteSnapshotOp?: boolean;   // Operation="DeleteSnaphot" (note: typo in legacy)
  mainSnapshotMissing?: boolean;   // '860e329aab41}.hds' missing
}

/**
 * Parse ls -lR output into formatted file listing
 * Based on parseLsLr from legacy script
 * Exported for reuse by parseLaunchdInfo
 */
export function parseLsLr(raw: string): string {
  const lsFileRegex =
    /(?<permissions>[\w\-\+]{9,11}@?) +(?<hardLinks>\d+) +(?<ownerName>[\(\)\_\{\}\-\w\.]+) +(?<owneGroup>[\w\\]+) +(?<type>[\w\-]+)? +(?<size>\d+) +(?<modified>(?<month>\w{3}) +(?<day>\d{1,2}) +(?<time>(\d\d\:){1,2}\d\d)? (?<year>\d{4} )?)(?<fileName>.+)/g;
  const lsFolderRegex = /(\/[\w ]+\.pvm)?\/(?<location>[^:\n]*):$/gm;

  let bundleContents = '';
  const bundleLines = raw.split('\n');

  for (let index = 0; index < bundleLines.length; index++) {
    const line = bundleLines[index];
    lsFolderRegex.lastIndex = 0; // Reset regex
    lsFileRegex.lastIndex = 0;   // Reset regex

    const folderMatch = lsFolderRegex.exec(line);
    const fileMatch = lsFileRegex.exec(line);

    if (fileMatch?.groups && fileMatch.groups.fileName !== '.' && fileMatch.groups.fileName !== '..') {
      const { size, fileName, permissions, ownerName, modified } = fileMatch.groups;
      let owner = ownerName;

      // Highlight problematic owners
      if (ownerName?.match(/root|\_unknown/)) {
        owner = `**${ownerName}** (!)`;
      }

      const humanSize = humanFileSize(parseInt(size, 10));
      bundleContents += `${humanSize} **${fileName}** _${permissions} ${owner} ${modified}_\n`;
    } else if (folderMatch?.groups) {
      let folderLocation = folderMatch.groups.location;

      // Make output look more like a folder structure
      if (folderLocation?.match(/\//g)) {
        const folderLocationArr = folderLocation.split('/');
        folderLocation = '';
        for (let i = 0; i < folderLocationArr.length; i++) {
          folderLocation += '\n' + ' '.repeat(i * 5) + '└──' + folderLocationArr[i];
        }
      }
      bundleContents += `\n**${folderLocation}**:\n`;
    }
  }

  return bundleContents;
}

/**
 * Convert bytes to human-readable size
 */
function humanFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
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
  if (!data.match(/^<AdvancedVmInfo>/)) {
    xmlData = '<AdvancedVmInfo>' + data;
  }

  // Parse snapshots using regex (more reliable than XML parsing for this node)
  const snapshotRegex = /<Name>(?<name>[^<]*)<\/Name>\n[ ]*<DateTime>(?<dateTimeString>[^<]*)<\/DateTime>/g;
  const snapshots: Snapshot[] = [];

  for (const match of xmlData.matchAll(snapshotRegex)) {
    // Skip empty entries (the first one is typically empty)
    if (!match.groups?.dateTimeString) continue;

    snapshots.push({
      name: match.groups.name || '',
      dateTime: match.groups.dateTimeString
    });
  }

  // Parse PVM bundle contents (ls -lR output)
  const pvmBundleContents = parseLsLr(data);

  // Check for issues
  const hasAclIssues = data.includes('writeattr');
  const hasRootOwner = data.match(/ root |\_unknown/) !== null;
  const hasDeleteSnapshotOp = data.includes('Operation="DeleteSnaphot"'); // Note: typo is intentional (matches legacy)

  // Check if main snapshot is missing
  let mainSnapshotMissing = false;
  const hasSnapshotData = pvmBundleContents.length > 1;
  const hasMissingMainSnapshot = !pvmBundleContents.match(/860e329aab41}\.hds/);
  const isNotChromeOS = !productName?.match('Chrome OS');
  const isNotMacvm = guestOsType !== 'macvm';

  if (hasSnapshotData && hasMissingMainSnapshot && isNotChromeOS && !isBootCamp && isNotMacvm) {
    mainSnapshotMissing = true;
  }

  return {
    snapshots,
    snapshotCount: snapshots.length,
    pvmBundleContents,
    hasAclIssues,
    hasRootOwner,
    hasDeleteSnapshotOp,
    mainSnapshotMissing
  };
}
