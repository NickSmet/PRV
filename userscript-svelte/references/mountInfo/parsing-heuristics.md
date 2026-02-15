# Mount/DF Output Parsing Heuristics

## Goal

Transform raw macOS `mount` + `df -h` output into a grouped, human-readable structure that separates **local APFS containers** from **network shares**, with intelligent volume grouping and health alerts.

---

## Input Format

The raw text is a concatenation of two commands:

1. **`mount`** — one line per mounted filesystem, provides: identifier, mount point, filesystem type, and mount flags
2. **`df -h`** — tabular output with: identifier, size, used, avail, capacity%, iused, ifree, %iused, mount point

Both reference the same volumes by identifier (e.g., `/dev/disk3s5`), but provide complementary information. The parsing must correlate data from both.

---

## Parsing Strategy: Four Passes

### Pass 1 — Extract filesystem metadata from `mount` lines

**Pattern:** `<identifier> on <mount_point> (<fstype>, <flag1>, <flag2>, ...)`

```
/dev/disk3s1s1 on / (apfs, sealed, local, read-only, journaled)
//GUEST:@.../%5BC%5D%20... on /Users/.../[C] Win... (smbfs, nodev, noexec, ...)
```

**Extract per line:**
- `identifier` — everything before ` on `
- `mountPoint` — between ` on ` and ` (`
- `filesystem` — first token inside parentheses (before first comma)
- `flags[]` — remaining comma-separated tokens inside parentheses

**Build a lookup map:** `Map<identifier, { filesystem, flags[], mountPoint }>`

**Classification signals at this stage:**
- `smbfs` / `nfs` / `cifs` → network share
- `apfs` / `hfs` / `msdos` / `ntfs` → local disk
- `devfs` / `autofs` → skip (pseudo-filesystems)
- `map` prefix in identifier → skip

### Pass 2 — Extract capacity data from `df -h` table

**Detect the header line:** match `/^\s*Filesystem\s+/i` AND `/Mounted\s+on/i`

**Parse each subsequent row by tokenizing on whitespace:**

The macOS `df -h` layout is:
```
Filesystem  Size  Used  Avail  Capacity  iused  ifree  %iused  Mounted on
```

**Key challenge:** The `Mounted on` column often contains spaces (especially for SMB paths). Strategy:
1. Find the first token matching `/^\d+%$/` — that's the `Capacity` column (index `capIdx`)
2. `Mounted on` starts at `capIdx + 4` (skipping `iused`, `ifree`, `%iused`)
3. `identifier = tokens[0]`, `size = tokens[1]`, `used = tokens[2]`, `avail = tokens[3]`

**Build a second lookup map:** `Map<identifier, { size, used, avail, capacity%, mountPoint }>`

### Pass 3 — Correlate and classify

Merge Pass 1 and Pass 2 results by `identifier`. Each volume now has:
- Filesystem type + flags (from mount)
- Size/usage data (from df)

**Classification rules:**

| Signal | Classification |
|--------|---------------|
| identifier starts with `//` or filesystem is `smbfs`/`nfs`/`cifs` | **Network Share** |
| identifier matches `/dev/disk\d+/` | **Local Disk Volume** |
| identifier is `devfs`, `map`, or `autofs` | **Skip** |
| Size is `0Bi` or capacity is `100%` on devfs/map | **Skip** |

### Pass 4 — Group local volumes into physical disks

**The core heuristic:** APFS uses container-based shared storage. Multiple volumes (slices) share a single pool. They all report the **same total size** and **same free space** in `df`, but different `used` amounts.

**Grouping algorithm:**

1. Extract the disk number from the identifier: `/dev/disk(\d+)s\d+` → disk group ID
   - Handle snapshot identifiers like `disk3s1s1` → still belongs to `disk3`
2. Group all volumes with the same disk group ID
3. For each group:
   - `containerSize` = the `Size` reported by any member (they're all the same for APFS)
   - `freeSpace` = the `Avail` reported by any member (same for APFS)
   - `usedSpace` = `containerSize - freeSpace`  
   - Individual volume `used` values come from each volume's `Used` column

**Why not sum individual `used` values?** Because APFS volumes share space, and snapshots/metadata/overhead mean the sum of individual `used` often doesn't match `containerSize - freeSpace`. The container-level accounting is the source of truth.

---

## Target Data Structure

```typescript
interface ParsedMountInfo {
  localDisks: PhysicalDisk[];
  networkShares: NetworkShare[];
  alerts: {
    lowStorage: boolean;   // any local disk > 90%
    hddFull: boolean;      // any local disk > 99%
    hasNtfs: boolean;      // any volume with ntfs/msdos filesystem
  };
  meta: {
    totalVolumes: number;
    skippedVolumes: number;
    parseWarnings: string[];
  };
}

interface PhysicalDisk {
  diskId: string;              // "disk3"
  label: string;               // "System Disk" | "Recovery" | "System Firmware"
  filesystem: string;          // "apfs"
  containerSizeGi: number;     // from df, parsed to numeric GiB
  freeGi: number;
  usedGi: number;              // containerSize - free (container-level truth)
  capacityPercent: number;
  significant: boolean;        // see "Significance" heuristic below
  volumes: Volume[];
}

interface Volume {
  identifier: string;          // "disk3s5"
  label: string;               // human-friendly, see labeling heuristic
  mountPoint: string;
  filesystem: string;
  flags: string[];
  usedGi: number;              // individual volume used (from df)
  color: string;               // for visualization, assigned from palette
}

interface NetworkShare {
  shareId: string;             // generated, e.g., "smb-0"
  label: string;               // extracted from mount path
  protocol: string;            // "smbfs", "nfs", etc.
  source: string;              // the UNC/network path
  mountPoint: string;          // local mount point (cleaned)
  sizeGi: number;
  freeGi: number;
  usedGi: number;
  capacityPercent: number;
}
```

---

## Heuristic Details

### Size string parsing

Convert `df -h` size strings to numeric GiB:

| Pattern | Conversion |
|---------|-----------|
| `926Gi` | `926` |
| `500Mi` | `0.488` (÷ 1024) |
| `3.0Gi` | `3.0` |
| `369Mi` | `0.36` |
| `199Ki` | `0.000189` |
| `0Bi`   | `0` |

Regex: `/^([\d.]+)([KMGTP]?)i?$/i` — extract value and unit, convert to GiB.

### Disk labeling heuristic

Assign human-readable labels to disk groups based on mount points and sizes:

| Condition | Label |
|-----------|-------|
| Contains `/` as a direct mount (root volume) | **"System Disk"** |
| Contains `/System/Volumes/Data` | **"System Disk"** (same group as root) |
| Mount path contains `SFR` or `Recovery` | **"Recovery"** |
| All volumes are under `/System/Volumes/` with tiny sizes (< 1 GiB total) | **"System Firmware"** |
| Mount path contains `Parallels` or similar VM indicators | *(classified as network, not local)* |
| Otherwise | **"External Disk"** or just the disk identifier |

### Volume labeling heuristic

| Mount point pattern | Label |
|--------------------|-------|
| `/` (root) | "macOS" |
| `/System/Volumes/Data` | "User Data" |
| `/System/Volumes/VM` | "VM Swap" |
| `/System/Volumes/Preboot` | "Preboot" |
| `/System/Volumes/Update` (not SFR) | "Update" |
| `/System/Volumes/Update/mnt1` | "System Snapshot" |
| `/System/Volumes/Update/SFR/*` | "SFR Recovery" |
| `/System/Volumes/xarts` | "xarts" |
| `/System/Volumes/iSCPreboot` | "iSCPreboot" |
| `/System/Volumes/Hardware` | "Hardware" |
| Otherwise | Last path component |

### Significance heuristic

A disk group is **significant** (shown expanded, prominent) if:
- `containerSizeGi >= 10` — non-trivial size, OR
- `capacityPercent >= 80` — running low regardless of size, OR
- contains the root volume `/`

Otherwise it's **minor** (collapsed into "N minor system volumes" group).

### Network share label extraction

SMB mount identifiers are URL-encoded. Cleaning steps:
1. URL-decode: `%5BC%5D` → `[C]`, `%2011%20` → ` 11 `
2. Extract the share name from the path: last segment after `/`
3. If it contains Parallels-style `[C]` or `[W]` drive letters, format as: `"Windows 11 VM — C:"`
4. Otherwise use the cleaned share name

---

## Edge Cases & Warnings

| Case | Handling |
|------|----------|
| `df` output present but `mount` output missing | Volumes will lack filesystem/flags info. Set `filesystem: "unknown"`, flag as warning. |
| `mount` output present but `df` missing | Volumes will lack size info. Use the existing fallback that sets sizes to `"—"`. |
| NTFS/MSDOS filesystem detected | Set `alerts.hasNtfs = true`. These cause known macOS compatibility issues. |
| APFS snapshot identifiers (`disk3s1s1`) | Parse as belonging to `disk3` group. The double-slice notation is a firmlink/snapshot reference. |
| Network paths with special characters | URL-decode the identifier and mount path for display. Keep raw form for matching between mount/df. |
| Container size mismatch across volumes | All APFS volumes in a container should report the same total size. If they don't, use the maximum reported value and add a parse warning. |
| `map auto_home` entries | Skip entirely — these are autofs pseudo-mounts with 0 bytes. |

---

## Implementation Notes

### Adapting the existing parser

The current `parseMountInfo()` function already handles Pass 1 and Pass 2 correctly. The main changes needed:

1. **Add disk grouping logic** — new function `groupByPhysicalDisk(volumes[])` that extracts disk IDs and groups
2. **Add network share detection** — check identifier prefix and filesystem type  
3. **Restructure return type** — from flat `VolumeInfo[]` to the nested `ParsedMountInfo`
4. **Add label generation** — mount-path-based heuristics for human-readable names
5. **Add significance classification** — size/capacity thresholds
6. **Add size string parsing** — convert `"926Gi"` → `926` (numeric GiB)

### Color assignment

Assign colors from a fixed palette to volumes within each disk group, in order of descending usage. This ensures the biggest consumer always gets the most visually prominent color (first in palette = primary blue).

Palette: `["#3B82F6", "#6366F1", "#8B5CF6", "#A855F7", "#F59E0B", "#10B981", "#EC4899", "#06B6D4"]`
