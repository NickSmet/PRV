/**
 * Parse MountInfo (df -h and mount command output)
 *
 * Extracts mounted volumes with capacity, filesystem type, and detects storage issues.
 */

export interface VolumeInfo {
  identifier: string;
  mountedOn: string;
  size: string;
  free: string;
  used: string;
  capacity: number; // percentage as number
  capacityStr: string; // formatted string like "85%"
  filesystem?: string;
  isNtfs?: boolean;
}

export interface MountInfoSummary {
  volumes: VolumeInfo[];
  lowStorage: boolean;      // >90% capacity on system volumes
  hddFull: boolean;          // >99% capacity on system volumes
  hasNtfsVolumes: boolean;
}

/**
 * Parse mount info from combined df -h and mount command output
 */
export function parseMountInfo(textData: string): MountInfoSummary | null {
  if (!textData || textData.trim().length === 0) {
    return null;
  }

  const volumes: VolumeInfo[] = [];
  let lowStorage = false;
  let hddFull = false;
  let hasNtfsVolumes = false;

  // Regex for filesystem type from mount command
  const fileSystemRegex = /^(?<id>[\w\/\-:]*) on [^\(]* \((?<filesystem>[^,]+)/;

  // Regex for mount info from df -h
  const mountInfoRegex = /(?<id>(map |\/dev|\/\/|devfs)[\w\/\-@\.]*)  +(?<Size>[\d\.]*(Gi|Ti|Bi|Ki|Mi)) +(?<Used>[\d\.]*(Gi|Ti|Bi|Ki|Mi)) +(?<Avail>[\d\.]*(Gi|Ti|Bi|Ki|Mi) +)(?<Capacity>\d+\%) +(?<iused>\d+) +(?<ifree>\d+) +(?<iused2>\d+\%) +(?<MountedOn>\/.*)(\n|$)/;

  // Build filesystem map from mount command output
  const filesystems: Record<string, string> = {};
  const lines = textData.split('\n');

  for (const line of lines) {
    const fsMatch = line.match(fileSystemRegex);
    if (fsMatch && fsMatch.groups) {
      const { id, filesystem } = fsMatch.groups;
      filesystems[id] = filesystem;
      if (filesystem.toLowerCase().includes('ntfs')) {
        hasNtfsVolumes = true;
      }
    }
  }

  // Parse df -h output
  for (const line of lines) {
    const mountMatch = line.match(mountInfoRegex);
    if (!mountMatch || !mountMatch.groups) {
      continue;
    }

    const props = mountMatch.groups;
    const identifier = props.id;

    // Skip map and devfs entries
    if (identifier.match(/(map|devfs)/)) {
      continue;
    }

    const capacity = parseInt(props.Capacity.match(/^(\d+)\%/)?.[1] || '0');
    const filesystem = filesystems[identifier];
    const isNtfs = filesystem?.toLowerCase().includes('ntfs') ?? false;
    const isSystemVolume = props.MountedOn.includes('/System/Volumes/');

    // Check for storage warnings on system volumes
    if (isSystemVolume) {
      if (capacity > 99) {
        hddFull = true;
      } else if (capacity > 90) {
        lowStorage = true;
      }
    }

    volumes.push({
      identifier,
      mountedOn: props.MountedOn,
      size: props.Size,
      used: props.Used,
      free: props.Avail.trim(),
      capacity,
      capacityStr: props.Capacity,
      filesystem,
      isNtfs
    });
  }

  // Sort volumes by identifier
  volumes.sort((a, b) => a.identifier.localeCompare(b.identifier));

  return {
    volumes,
    lowStorage,
    hddFull,
    hasNtfsVolumes
  };
}
