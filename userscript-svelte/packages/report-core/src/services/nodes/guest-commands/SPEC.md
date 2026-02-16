# GuestCommands Specification

## Overview

`GuestCommands` contains command outputs captured from inside the guest OS (typically Windows) by Parallels Tools.

The parser extracts a structured subset used for diagnostics:
- system environment info (from `cmd /c set`)
- guest network adapter info (from `ipconfig /all`)
- mapped network drives (from `net use`)
- process resource usage rows + totals (from `prl_cpuusage`)
- active power requests (from `powercfg -requests`)

## Inputs

### Node payload forms

The report may encode `GuestCommands` in one of two ways:

1) **Inline XML**
```xml
<GuestCommands>
  <GuestCommand>
    <CommandName><![CDATA[ipconfig /all]]></CommandName>
    <CommandResult><![CDATA[...]]></CommandResult>
  </GuestCommand>
</GuestCommands>
```

2) **JSON text** (legacy/alternate encoding)
```json
{ "GuestCommand": [ { "CommandName": "...", "CommandResult": "..." } ] }
```

## Output (`GuestCommandsSummary`)

Defined in `packages/report-core/src/services/nodes/guest-commands/parseGuestCommands.ts` (and exported via `packages/report-core/src/services/index.ts` / `@prv/report-core`).

```ts
export interface GuestCommandsSummary {
  guestType?: string;
  isLinux?: boolean;
  isEmpty?: boolean;

  system?: {
    hostname?: string;
    processorCount?: number;
    architecture?: 'ARM64' | 'x86' | 'x64' | 'unknown';
  };

  network?: {
    adapters?: Array<{
      name?: string;
      description?: string;
      ip?: string;
      ipv6?: string;
      gateway?: string;
      dns?: string[];
      dhcpEnabled?: boolean;
    }>;

    drives?: Array<{
      letter?: string;
      remotePath?: string;
      status?: 'OK' | 'Disconnected' | 'Unavailable' | 'Reconnecting' | 'Other';
      statusRaw?: string;
      provider?: string;
    }>;
  };

  processes?: Array<{
    path?: string;
    pid?: number;
    cpuPercent?: number;
    memoryKb?: number;
    architecture?: 'ARM64' | 'x86' | 'x64' | 'unknown';
    user?: string;
  }>;

  totals?: {
    cpuPercent?: number;
    memoryKb?: number;
  };

  powerRequests?: Array<{
    type?: string;
    requestor?: string;
    path?: string;
  }>;
}
```

## Parsing rules

### Command selection

The parser looks for specific command names:
- `cmd /c set`
- `ipconfig /all`
- `net use`
- `prl_cpuusage --sort-cpu-desc --time 4000`
- `powercfg -requests`

Other commands may be present in the node payload; they are ignored unless explicitly added to this spec.

### Robustness contract

- No field is required; missing/partial outputs produce partial summaries.
- The parser must not throw on unexpected formats.

## Rule integration (important UX)

Some report types indicate a “running VM report” (e.g. `UserDefinedOnRunningVmReport`).
In that case, if `GuestCommands` is empty/missing, the UI should surface a warning because it often implies Parallels Tools or guest-side capture is not working.

Implementation note:
- The parser sets `GuestCommandsSummary.isEmpty`
- The rule engine uses `report.meta.reportType` + `guestCommands.isEmpty` to generate a node-level marker (shown as a header badge) in `packages/report-core/src/rules/currentVm.ts`

### System environment (`cmd /c set`)

Extract only:
- `COMPUTERNAME` → `system.hostname`
- `NUMBER_OF_PROCESSORS` → `system.processorCount`
- `PROCESSOR_ARCHITECTURE` → `system.architecture` (normalized)

### Network adapters (`ipconfig /all`)

Extract per adapter:
- `name` (section header)
- `description`
- `ip` (IPv4)
- `ipv6` (first non-link-local, non-temporary IPv6 if present)
- `gateway` (IPv4 gateway if present)
- `dns` (array)
- `dhcpEnabled` (boolean)

Skip: MAC address, lease times, DHCP server, NetBIOS settings, link-local addresses, temporary IPv6 addresses.

### Network drives (`net use`)

Expected format includes fixed-width columns, e.g.:

```
X:        \\Mac\iCloud              Parallels Shared Folders
```

Parsing strategy:
- split lines on **2+ spaces** to detect columns (`Status`, `Local`, `Remote`, `Network`)
- treat empty status as `OK`
- emit `statusRaw` only when status is not one of the known values

### Processes (`prl_cpuusage`)

Extract per process row:
- `path` (File name column; may be missing on some rows like `System`)
- `pid`
- `cpuPercent`
- `memoryKb`
- `architecture`
- `user` (optional)

Notes:
- Keep all rows (including `0.00%` CPU); filtering is a UI concern.
- Also extract totals from the `TOTAL:` line (`totals.cpuPercent`, `totals.memoryKb`).

### Power requests (`powercfg -requests`)

Extract all non-empty request entries across all sections.

Notes:
- Some reports include extra sections beyond `DISPLAY/SYSTEM/AWAYMODE/EXECUTION` (e.g. `PERFBOOST`, `ACTIVELOCKSCREEN`); treat `type` as a passthrough string.
- Prefer extracting a human requestor name from trailing parentheses when present, e.g. `(... Parallels Tools Service)`.

## Status

**Outline** — Implemented and evolving. UI currently shows only a small preview of processes; model preserves the full list.
