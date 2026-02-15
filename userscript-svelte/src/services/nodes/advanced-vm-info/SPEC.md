# AdvancedVmInfo Specification

## Overview

`AdvancedVmInfo` contains:
- VM snapshot metadata (from the embedded `Snapshots` XML)
- a VM bundle file listing captured via `ls -lR` (from `VmBundleFileList`)

This node is primarily used to diagnose snapshot/bundle integrity issues (missing snapshot files, permissions/ACL problems, suspicious owners, etc.).

**Key principle:** Keep output **robust and flexible**:
- preserve a human-friendly bundle listing string (great for scanning and diffing)
- also provide a structured tree with metadata for future rendering/rules

## Inputs

### Node payload forms

In most reports `AdvancedVmInfo` is stored as a separate `AdvancedVmInfo.xml` in the report archive and referenced from `Report.xml`.

Within `AdvancedVmInfo.xml`:
- `Snapshots` is typically a CDATA-wrapped XML document (e.g. `<ParallelsSavedStates>...</ParallelsSavedStates>`)
- `VmBundleFileList` is typically CDATA-wrapped `ls -lR` output captured from the `.pvm` bundle folder

## Output (`AdvancedVmInfoSummary`)

Defined in `src/services/nodes/advanced-vm-info/parseAdvancedVmInfo.ts` (and re-exported from `src/services/parseAdvancedVmInfo.ts`).

```ts
export type BundleEntryKind = 'file' | 'folder';

export interface BundleEntryMeta {
  permissions?: string; // e.g. "-rw-r--r--@" / "drwx------@"
  hardLinks?: number;
  owner?: string;       // e.g. "fullphase"
  group?: string;       // e.g. "staff"
  flags?: string;       // e.g. "-" (BSD ls)
  sizeBytes?: number;   // from ls output (bytes)
  sizeHuman?: string;   // derived from sizeBytes (best-effort)
  modified?: {
    raw?: string;        // e.g. "Jan  8 13:46:50 2026"
    year?: number;
    month?: number;      // 1-12
    day?: number;        // 1-31
    time?: string;       // "HH:MM:SS" (when present)
  };
}

export interface BundleEntryBase {
  kind: BundleEntryKind;
  name: string;      // display name (no path)
  path?: string;     // absolute-ish when derivable from ls section headers
  meta?: BundleEntryMeta;
}

export interface BundleFolderEntry extends BundleEntryBase {
  kind: 'folder';
  children: BundleEntry[];
}

export interface BundleFileEntry extends BundleEntryBase {
  kind: 'file';
}

export type BundleEntry = BundleFolderEntry | BundleFileEntry;

export interface AdvancedVmInfoSummary {
  snapshots: Array<{ name: string; dateTime: string }>;
  snapshotCount: number;

  /**
   * Parsed representation of `VmBundleFileList` (`ls -lR` output).
   * This is useful for deriving flags/rules and for future rendering options.
   */
  pvmBundleTree?: BundleFolderEntry;

  /**
   * Human-friendly representation of `VmBundleFileList`.
   * Kept intentionally: it’s easy to scan, easy to diff, and robust against partial parsing.
   */
  pvmBundleContents?: string;

  hasAclIssues?: boolean;        // "writeattr" present
  hasRootOwner?: boolean;        // "root" or "_unknown" owner present
  hasDeleteSnapshotOp?: boolean; // Operation="DeleteSnaphot" present
  mainSnapshotMissing?: boolean; // bundle listing missing the expected main snapshot file
}
```

## Parsing rules

### Snapshots

- Parse snapshot `Name` + `DateTime` pairs from the embedded snapshots XML.
- Missing/empty snapshots should yield `snapshots=[]` and `snapshotCount=0`.

### Bundle file list (`VmBundleFileList`)

`VmBundleFileList` is `ls -lR` output with:
- directory header lines like `/Users/.../Windows 11.pvm/Snapshots:`
- file entry lines (permissions, hardlinks, owner, group, size, modified, name)
- xattr/extended attribute detail lines (indented; should be ignored)

Rules:
- Build a tree rooted at the `.pvm` folder.
- Treat `drwx...` entries as folders.
- Ignore `.` and `..`.
- Ignore indented xattr lines (e.g. `\tcom.apple.provenance 11`).
- Parse metadata best-effort (permissions, owner/group, size bytes, modified time parts, etc.).

### Robustness contract

- No field is required.
- The parser must tolerate malformed or partial `ls -lR` output.
- If the listing can’t be parsed, return `pvmBundleTree=undefined` and keep other fields.

## UI Rendering (TreeView)

### Current UI rendering

The UI currently renders the bundle listing in a “`ls`-style” table:
- shows **root files** first, then folder sections in a fixed order (e.g. `harddisk.hdd`, `Snapshots`, then others)
- **directory entries are omitted** inside each section to reduce noise
- permissions are shown subtly inline, with an educational tooltip on hover

Implementation: `src/lib/components/advanced-vm-info/advanced-vm-info-bundle-contents.svelte`

### Future options

`pvmBundleTree` can be rendered via nested folder/file components (or any custom UI) once we decide it’s worth the alignment/UX complexity.

## Status

**Outline** — `pvmBundleContents` + `pvmBundleTree` are both produced. UI currently favors the listing; the tree is there for future rendering/rules.
