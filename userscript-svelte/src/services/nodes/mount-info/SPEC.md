# MountInfo

## Purpose

Parse macOS `mount` + `df -h` output and expose storage information for:
- Local disk containers (APFS shared pool)
- Network shares (SMB/NFS/CIFS)
- Alerts (low storage / full disk / NTFS)

## Input

- **Payload type**: plain text (often CDATA-wrapped)
- **Source**: `window.__prv_mountInfoText`

The payload is typically a concatenation of:
1. `mount` output (one line per filesystem)
2. `df -h` output (table with Size/Used/Avail/Capacity/etc.)

## Output

`parseMountInfo(textData: string) => MountInfoSummary | null`

### Backwards-compatible flat view

`MountInfoSummary.volumes: VolumeInfo[]` remains the stable flat representation used by older UI.

### Grouped view (for visualization)

`MountInfoSummary.parsed?: ParsedMountInfo` is an additive structure designed for the disk visualization UI:
- `localDisks[]`: grouped by physical disk (`disk3`, `disk2`, ...)
- `networkShares[]`: SMB/NFS mounts derived from identifiers and filesystem types
- `alerts`: `{ lowStorage, hddFull, hasNtfs }`
- `meta`: counts + parse warnings

Grouping and labeling heuristics follow `references/mountInfo/parsing-heuristics.md` and the UI reference in `references/mountInfo/disk-viz.jsx`.
