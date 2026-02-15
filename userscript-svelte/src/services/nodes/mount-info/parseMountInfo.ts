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
  flags?: string[];
}

export interface ParsedMountInfoAlerts {
  lowStorage: boolean;
  hddFull: boolean;
  hasNtfs: boolean;
}

export interface ParsedMountInfoMeta {
  totalVolumes: number;
  skippedVolumes: number;
  parseWarnings: string[];
}

export interface ParsedMountInfoVolume {
  id: string; // e.g. "disk3s5"
  label: string;
  mount: string;
  usedGi: number;
  filesystem: string;
  flags: string[];
  color: string;
}

export interface ParsedMountInfoDisk {
  diskId: string; // "disk3"
  label: string;
  filesystem: string;
  containerSizeGi: number;
  freeGi: number;
  usedGi: number;
  capacityPercent: number;
  significant: boolean;
  volumes: ParsedMountInfoVolume[];
}

export interface ParsedMountInfoNetworkShare {
  shareId: string;
  label: string;
  protocol: string;
  source: string;
  mountPoint: string;
  sizeGi: number;
  freeGi: number;
  usedGi: number;
  capacityPercent: number;
}

export interface ParsedMountInfo {
  localDisks: ParsedMountInfoDisk[];
  networkShares: ParsedMountInfoNetworkShare[];
  alerts: ParsedMountInfoAlerts;
  meta: ParsedMountInfoMeta;
}

export interface MountInfoSummary {
  volumes: VolumeInfo[];
  lowStorage: boolean;      // >90% capacity on system volumes
  hddFull: boolean;          // >99% capacity on system volumes
  hasNtfsVolumes: boolean;
  /**
   * Grouped, visualization-friendly structure (local disks vs network shares).
   * Additive: `volumes[]` remains the backwards-compatible flat view.
   */
  parsed?: ParsedMountInfo;
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
  const parseWarnings: string[] = [];
  let skippedVolumes = 0;

  // Regex for filesystem type from mount command
  // Example:
  // /dev/disk3s1s1 on / (apfs, sealed, local, read-only, journaled)
  const mountLineRegex = /^\s*(?<id>.+?)\s+on\s+(?<mountedOn>.+?)\s+\((?<filesystem>[^,]+)/;

  function parseDfTableLines(lines: string[]): Array<{
    identifier: string;
    size: string;
    used: string;
    free: string;
    capacityStr: string;
    mountedOn: string;
  }> {
    // Typical macOS `df -h` header:
    // Filesystem   Size   Used  Avail Capacity iused ifree %iused  Mounted on
    const headerIdx = lines.findIndex((l) => /^\s*Filesystem\s+/i.test(l) && /Mounted\s+on/i.test(l));
    if (headerIdx < 0) return [];

    const out: Array<{
      identifier: string;
      size: string;
      used: string;
      free: string;
      capacityStr: string;
      mountedOn: string;
    }> = [];

    for (let i = headerIdx + 1; i < lines.length; i++) {
      const line = lines[i].replace(/\r$/, '');
      if (!line.trim()) continue;

      const tokens = line.trim().split(/\s+/);
      if (tokens.length < 6) continue;

      // Layout: id size used avail capacity iused ifree %iused mountedOn...
      const capIdx = tokens.findIndex((t) => /^\d+%$/.test(t));
      if (capIdx < 4) continue;

      const identifier = tokens[0];
      const size = tokens[1];
      const used = tokens[2];
      const free = tokens[3];
      const capacityStr = tokens[capIdx];

      const mountedStart = tokens.length >= capIdx + 4 ? capIdx + 4 : capIdx + 1;
      const mountedOn = tokens.slice(mountedStart).join(' ');
      if (!mountedOn) continue;

      out.push({ identifier, size, used, free, capacityStr, mountedOn });
    }

    return out;
  }

  // Build filesystem map from mount command output
  const filesystems: Record<string, string> = {};
  const mountedOnById: Record<string, string> = {};
  const flagsById: Record<string, string[]> = {};
  const lines = textData.split('\n');

  for (const rawLine of lines) {
    const line = rawLine.replace(/\r$/, '');
    const fsMatch = line.match(mountLineRegex);
    if (!fsMatch?.groups) continue;

    const id = fsMatch.groups.id.trim();
    const filesystem = fsMatch.groups.filesystem.trim();
    const mountedOn = fsMatch.groups.mountedOn.trim();

    // Flags: everything inside parentheses after filesystem token.
    const parenStart = line.indexOf('(');
    const parenEnd = line.lastIndexOf(')');
    const flagsRaw = (parenStart >= 0 && parenEnd > parenStart)
      ? line.slice(parenStart + 1, parenEnd)
      : '';
    const flags = flagsRaw
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(1); // drop filesystem itself

    filesystems[id] = filesystem;
    mountedOnById[id] = mountedOn;
    flagsById[id] = flags;

    if (filesystem.toLowerCase().includes('ntfs')) {
      hasNtfsVolumes = true;
    }
  }

  // Parse df -h table if present (preferred: contains size/capacity)
  const dfRows = parseDfTableLines(lines);
  for (const row of dfRows) {
    const identifier = row.identifier;

    // Skip devfs entries (noise)
    if (identifier.match(/(devfs)/)) {
      skippedVolumes += 1;
      continue;
    }

    const capacity = parseInt(row.capacityStr.match(/^(\d+)\%/)?.[1] || '0', 10);
    const filesystem = filesystems[identifier];
    const isNtfs = filesystem?.toLowerCase().includes('ntfs') ?? false;
    const isSystemVolume = row.mountedOn.includes('/System/Volumes/');

    if (isSystemVolume) {
      if (capacity > 99) hddFull = true;
      else if (capacity > 90) lowStorage = true;
    }

    volumes.push({
      identifier,
      mountedOn: row.mountedOn,
      size: row.size,
      used: row.used,
      free: row.free,
      capacity,
      capacityStr: row.capacityStr,
      filesystem,
      isNtfs,
      flags: flagsById[identifier]
    });
  }

  // Fallback: some reports contain ONLY `mount` output (no df table).
  // In that case, still surface mounted volumes with filesystem type.
  if (volumes.length === 0) {
    for (const [identifier, filesystem] of Object.entries(filesystems)) {
      if (identifier.match(/(map|devfs)/)) continue;
      const mountedOn = mountedOnById[identifier];
      if (!mountedOn) continue;
      const isNtfs = filesystem.toLowerCase().includes('ntfs');
      volumes.push({
        identifier,
        mountedOn,
        size: '—',
        used: '—',
        free: '—',
        capacity: 0,
        capacityStr: '—',
        filesystem,
        isNtfs
      });
    }
  }

  // Last-resort fallback: if we still couldn't extract any volumes, parse mount lines without relying on RegExp named groups.
  // (Some runtimes/report variants have surprising formatting; this keeps the UI useful.)
  if (volumes.length === 0) {
    for (const rawLine of lines) {
      const line = rawLine.replace(/\r$/, '').trim();
      if (!line) continue;

      const onIdx = line.indexOf(' on ');
      const parenIdx = line.indexOf(' (');
      if (onIdx <= 0 || parenIdx <= onIdx) continue;

      const identifier = line.slice(0, onIdx).trim();
      const mountedOn = line.slice(onIdx + 4, parenIdx).trim();
      const fsChunk = line.slice(parenIdx + 2);
      const filesystem = fsChunk.split(',')[0]?.replace(/^\(/, '').trim();

      if (!identifier || !mountedOn || !filesystem) continue;
      if (identifier.match(/(map|devfs)/)) continue;

      const isNtfs = filesystem.toLowerCase().includes('ntfs');
      if (isNtfs) hasNtfsVolumes = true;

      volumes.push({
        identifier,
        mountedOn,
        size: '—',
        used: '—',
        free: '—',
        capacity: 0,
        capacityStr: '—',
        filesystem,
        isNtfs
      });
    }
  }

  // Sort volumes by identifier
  volumes.sort((a, b) => a.identifier.localeCompare(b.identifier));

  // ===========================================================================
  // Grouping pass (local disks vs network shares) — see references/mountInfo/*
  // ===========================================================================

  function parseSizeToGiB(input: string): number {
    const raw = input.trim();
    if (!raw || raw === '—') return 0;
    if (raw === '0Bi') return 0;
    const match = /^([\d.]+)([KMGTP])i?$/i.exec(raw);
    if (!match) return 0;
    const value = Number(match[1]);
    const unit = match[2].toUpperCase();
    if (!Number.isFinite(value)) return 0;
    const toGi = {
      K: 1 / (1024 * 1024),
      M: 1 / 1024,
      G: 1,
      T: 1024,
      P: 1024 * 1024
    } as const;
    return value * (toGi[unit as keyof typeof toGi] ?? 0);
  }

  function safeDecode(value: string): string {
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }

  function isNetworkVolume(vol: VolumeInfo): boolean {
    const fs = (vol.filesystem ?? '').toLowerCase();
    if (vol.identifier.startsWith('//')) return true;
    if (fs === 'smbfs' || fs === 'nfs' || fs === 'cifs') return true;
    return false;
  }

  function isSkippable(vol: VolumeInfo): boolean {
    const id = vol.identifier;
    const fs = (vol.filesystem ?? '').toLowerCase();
    if (fs === 'devfs' || fs === 'autofs') return true;
    if (id.startsWith('map ')) return true;
    if (id === 'map' || id === 'map-auto_home') return true;
    if (vol.size === '0Bi' || vol.capacityStr === '100%') {
      // Heuristic: df pseudo mounts often show 0Bi/100%.
      if (fs === 'autofs' || id.startsWith('map ')) return true;
    }
    return false;
  }

  const palette = ['#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#F59E0B', '#10B981', '#EC4899', '#06B6D4'];

  const localCandidates = volumes.filter((v) => !isSkippable(v) && !isNetworkVolume(v));
  const networkCandidates = volumes.filter((v) => !isSkippable(v) && isNetworkVolume(v));

  // Local disk grouping by /dev/diskN...
  const byDiskId = new Map<string, VolumeInfo[]>();
  for (const vol of localCandidates) {
    const m = /^\/dev\/(?<diskId>disk\d+)/.exec(vol.identifier);
    if (!m?.groups?.diskId) continue;
    const diskId = m.groups.diskId;
    const arr = byDiskId.get(diskId) ?? [];
    if (!byDiskId.has(diskId)) byDiskId.set(diskId, arr);
    arr.push(vol);
  }

  function labelVolumeByMount(mount: string): string {
    const m = mount.trim();
    if (m === '/') return 'macOS';
    if (m === '/System/Volumes/Data') return 'User Data';
    if (m === '/System/Volumes/VM') return 'VM Swap';
    if (m === '/System/Volumes/Preboot') return 'Preboot';
    if (m === '/System/Volumes/Update/mnt1') return 'System Snapshot';
    if (m.startsWith('/System/Volumes/Update/SFR/')) return 'SFR Recovery';
    if (m === '/System/Volumes/Update') return 'Update';
    if (m === '/System/Volumes/xarts') return 'xarts';
    if (m === '/System/Volumes/iSCPreboot') return 'iSCPreboot';
    if (m === '/System/Volumes/Hardware') return 'Hardware';
    const last = m.split('/').filter(Boolean).pop();
    return last ?? m;
  }

  const localDisks: ParsedMountInfoDisk[] = [];
  for (const [diskId, vols] of byDiskId.entries()) {
    const sizeGi = Math.max(...vols.map((v) => parseSizeToGiB(v.size)));
    const freeGi = Math.max(...vols.map((v) => parseSizeToGiB(v.free)));
    const cap = Math.max(...vols.map((v) => v.capacity ?? 0));
    const fs = (vols.find((v) => v.filesystem)?.filesystem ?? 'unknown');

    const hasRoot = vols.some((v) => v.mountedOn === '/');
    const hasData = vols.some((v) => v.mountedOn === '/System/Volumes/Data');
    const hasSfr = vols.some((v) => v.mountedOn.includes('/System/Volumes/Update/SFR'));
    const label =
      hasRoot || hasData ? 'System Disk'
      : hasSfr ? 'Recovery'
      : sizeGi > 0 && sizeGi < 1 ? 'System Firmware'
      : diskId;

    const usedGi = Math.max(0, sizeGi - freeGi);
    const significant = sizeGi >= 10 || cap >= 80 || hasRoot;

    // Assign colors by descending used size.
    const perVol = vols
      .map((v) => ({
        v,
        usedGi: parseSizeToGiB(v.used)
      }))
      .sort((a, b) => b.usedGi - a.usedGi);

    const colorById = new Map<string, string>();
    for (let i = 0; i < perVol.length; i++) {
      const id = perVol[i].v.identifier.replace(/^\/dev\//, '');
      colorById.set(id, palette[i % palette.length]);
    }

    const parsedVolumes: ParsedMountInfoVolume[] = vols.map((v) => {
      const id = v.identifier.replace(/^\/dev\//, '');
      return {
        id,
        label: labelVolumeByMount(v.mountedOn),
        mount: v.mountedOn,
        usedGi: parseSizeToGiB(v.used),
        filesystem: (v.filesystem ?? 'unknown'),
        flags: v.flags ?? [],
        color: colorById.get(id) ?? palette[0]
      };
    });

    localDisks.push({
      diskId,
      label,
      filesystem: fs,
      containerSizeGi: sizeGi,
      freeGi,
      usedGi,
      capacityPercent: cap,
      significant,
      volumes: parsedVolumes
    });
  }

  localDisks.sort((a, b) => b.containerSizeGi - a.containerSizeGi);

  // Network shares
  const networkShares: ParsedMountInfoNetworkShare[] = networkCandidates.map((v, idx) => {
    const decodedId = safeDecode(v.identifier);
    const decodedMount = safeDecode(v.mountedOn);
    const mountPoint = decodedMount.split('/').filter(Boolean).pop() ?? decodedMount;

    const source = decodedId.includes('/') ? decodedId.split('/').slice(0, -1).join('/') : decodedId;
    const share = decodedId.includes('/') ? decodedId.split('/').pop() ?? decodedId : decodedId;
    const shareClean = safeDecode(share);

    const driveLetter = /\[(?<letter>[A-Z])\]/.exec(mountPoint)?.groups?.letter;
    const label = driveLetter ? `Windows VM — ${driveLetter}:` : shareClean;

    const sizeGi = parseSizeToGiB(v.size);
    const freeGi = parseSizeToGiB(v.free);
    const usedGi = parseSizeToGiB(v.used);

    return {
      shareId: `net-${idx}`,
      label,
      protocol: (v.filesystem ?? 'unknown'),
      source,
      mountPoint,
      sizeGi,
      freeGi,
      usedGi,
      capacityPercent: v.capacity ?? 0
    };
  });

  // Alerts
  const alerts: ParsedMountInfoAlerts = {
    lowStorage: localDisks.some((d) => d.capacityPercent >= 90),
    hddFull: localDisks.some((d) => d.capacityPercent >= 99),
    hasNtfs: hasNtfsVolumes
  };

  const parsed: ParsedMountInfo = {
    localDisks,
    networkShares,
    alerts,
    meta: {
      totalVolumes: volumes.length,
      skippedVolumes,
      parseWarnings: parseWarnings
    }
  };

  return {
    volumes,
    lowStorage: alerts.lowStorage,
    hddFull: alerts.hddFull,
    hasNtfsVolumes,
    parsed
  };
}
