# AI Shaping Specification

## Overview

`packages/report-ai/` provides AI-friendly data structures and utilities for agent consumption. The primary export is `ReportView` — a hierarchical, primitive-focused projection of `ReportModel` designed for programmatic traversal in JavaScript sandboxes.

**Key principle:** **Readable-first**. `ReportView` aims to look like what a human would read in the UI:
- Prefer human-readable strings for enums (e.g., `"Auto"`, `"Shared"`, `"Virtio"`), not numeric codes.
- Prefer ISO 8601 timestamps (no epoch strings, no locale-specific dates).
- Avoid giant byte counts; use smaller units (e.g., MB) or formatted strings.
- Remove heavy tree structures (ls -lR trees, etc.) and keep the formatted listing instead.

**Raw access:** The original raw summaries are attached under non-enumerable `__raw` on many objects (for `ctx.raw(...)` in the MCP sandbox).

## Exports

### `buildReportView(report, markers, opts?): ReportView`

Converts `ReportModel` + `Marker[]` into a hierarchical `ReportView` organized by component:
- `meta` — report metadata (reportId, product, version, etc.)
- `markers[]` — flattened markers with serialized targets
- `host` — hardware, gpu, storage, kexts, processes, services, installedApps (trimmed + normalized for readability)
- `parallels` — license, virtualNetworks, appConfig, client, proxy, installHistory (trimmed + normalized)
- `vms[]` — ALL VMs from VmDirectory (current + non-current with per-UUID data)

**Design decisions:**
- Many parser summaries (`MountInfoSummary`, `LoadedDriversSummary`, etc.) are passed through directly
- Some summaries are reshaped to reduce ambiguity and output size:
  - Disk/partition sizes are emitted as MB (no raw bytes).
  - Input device type booleans are collapsed into a single `types: string[]`.
  - Long process `command` strings are truncated; a `commandTruncated?: true` flag is set.
  - File trees are removed (keep the formatted listing instead).
- Raw arrays like `processes.items[]` are NOT pre-sorted — agent sorts by `.cpu`, `.mem`, etc. in code
- Non-current VMs get parsed `settings` (from `vm-{uuid}-config.pvs.log`) and `toolsLog` (from `tools-{uuid}.log`)
- Each VM includes `files: { configPvs?, vmLog?, toolsLog? }` for raw file access via `report.file()`

**Options:**
- `reportId?: string` — override reportId in meta
- `perVm?: PerVmDiscoveredFiles` — discovered per-VM file paths
- `receivedIso?: string` — Reportus index.received (ISO 8601) when available
- `parsedPerVm?: Record<uuid, { settings?, toolsLog? }>` — pre-parsed non-current VM data

### `truncateText(text, { maxChars }): { text: string; truncated: boolean }`

Safe text truncation with truncation flag.

### `toAgentSummary(report: ReportModel): object` (legacy)

Minimal curated summary (kept for backwards compatibility). Returns identity + risks + notes.

## ReportView Structure

```typescript
interface ReportView {
  meta: { reportId?, productName?, productVersion?, reportType?, reportReason?, receivedIso?, timezone, timezoneOffsetIso };
  markers: Array<{ id, severity, label, tooltip?, target: string }>;
  host: {
    hardware: {
      system; networkAdapters; usbDevices; audio; bluetoothDevices; printers; cameras; smartCardReaders; flags; hasDisplayLink;
      hardDisks: Array<{
        name; identifier; sizeMb; sizeFormatted;
        partitions: Array<{ name; systemName?; sizeMb?; freeMb?; typeName? }>;
      }>;
      inputDevices: Array<{ name; identifier; transport; vendorId?; productId?; types: string[] }>;
    } | null;
    gpu: MoreHostInfoSummary | null;
    storage: {
      alerts: { lowStorage: boolean; hddFull: boolean; hasNtfs: boolean } | null;
      meta: { totalVolumes: number; skippedVolumes: number; parseWarnings: string[] } | null;
      localDisks: Array<{ id; label; fs; sizeGi; usedGi; freeGi; usedPct; significant; volumes: Array<{ id; label; mount; usedGi; flags }> }>;
      networkShares: Array<{ id; label; protocol; source; mount; sizeGi; usedGi; freeGi; usedPct }>;
      virtualMounts: Array<{ id; label; mount; usedPct; note }>;
    } | null;
    kexts: LoadedDriversSummary | null;
    processes: AllProcessesSummary | null;  // like report-core, but items[].command may be truncated
    services: { formattedListing: string | null; stats: { files; folders; rootOwnedFiles } | null } | null;
    installedApps: InstalledSoftwareSummary | null;
  };
  parallels: {
    license: { edition?; editionName?; expirationIso?; isPirated?; isExpired?; isTrial? } | null;
    virtualNetworks: { kextlessMode?; networks: Array<{ name?; dhcpEnabled?; dhcpV6Enabled?; dhcpIp?; netMask?; hostIp?; networkType? }> } | null;
    appConfig: AppConfigSummary | null;
    client: ClientInfoSummary | null;
    proxy: ClientProxyInfoSummary | null;
    installHistory: { installationCount: number | null; installations: Array<{ version: string; dateIso: string | null }> } | null;
  };
  vms: Array<{
    uuid: string; uuidKey: string; name: string; isCurrent: boolean;
    settings: { vmName?; creationDateIso?; cpuCount?; ramMb?; vramMb?; hypervisor?; videoMode?; scaleToFit?; mouse?; keyboard?; netAdapters?; usbDevices? } | null;
    guestOs: GuestOsSummary | null;
    guestCommands: GuestCommandsSummary | null;
    storageAndSnapshots: { snapshotCount: number; snapshots: Array<{ name: string; createdIso: string | null }>; pvmBundleContents? } | null;
    toolsLog: { status: string | null; entries: Array<{ timestampIso: string | null; message: string | null }> } | null;
    systemLog: ParallelsSystemLogSummary | null;
    files: { configPvs?: string; vmLog?: string; toolsLog?: string };
  }>;
}
```

All summary types (`HostInfoSummary`, etc.) are re-exported from `@prv/report-core`.

## Usage

**MCP Server:**
```typescript
import { buildReportView } from '@prv/report-ai';
const data = buildReportView(report, markers, { reportId, perVm, parsedPerVm });
// Pass to sandbox as pre-loaded data
```

**Agent Code:**
```javascript
function main(data) {
  // data.host.processes.items[] — sort/filter yourself
  const topCpu = [...data.host.processes.items]
    .sort((a, b) => b.cpu - a.cpu)
    .slice(0, 10);
  return topCpu.map(p => ({ name: p.appName ?? p.command, cpu: p.cpu }));
}
```

## Status

**Production-ready** — `ReportView` is the canonical AI-facing data model for the MCP server’s single-tool, code-sandbox pattern.

**Stability note:** The readable-first projection may evolve. If you need under-the-hood values, use `ctx.raw(obj)` and inspect `.__raw`.
