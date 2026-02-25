# MCP Server (stdio) Specification

## Overview

`servers/mcp/` is an MCP server (stdio transport) that exposes Parallels Desktop technical report analysis through a **single code-execution tool** for AI agents.

**Key principle:** The MCP server pre-loads all parsed report data into a hierarchical `ReportView` object and lets the AI traverse it programmatically in a JavaScript sandbox. This gives maximum flexibility with minimal API surface.

**Architecture:**
- HTTP calls: `packages/report-api` — Reportus client
- Parsing/model/rules: `packages/report-core` — 22+ node parsers, ReportModel, rule engine
- AI layer: `packages/report-ai` — ReportView adapter (hierarchical, primitives-focused)
- Sandbox: `servers/mcp/src/sandbox.ts` — Node.js `vm` module with console capture
- Tool: `servers/mcp/src/executeReportCode.ts` — Tool definition + handler

## Configuration

### Environment variables

| Variable | Purpose | Example |
|---|---|---|
| `REPORTUS_BASE_URL` | Reportus origin | `https://reportus.prls.net` |
| `REPORTUS_BASIC_AUTH` | Basic auth for Reportus API (full header or base64 payload) | `Basic <base64>` |

Sample file: `servers/mcp/.env.example`

Runtime note: `servers/mcp/src/index.ts` loads `servers/mcp/.env` automatically via `dotenv` when started with `npm run mcp:dev`.

## Tool

### `execute_report_code`

**Single code-execution tool** — the AI writes JavaScript defining `main(data, report, ctx)` which runs in a sandbox with the full pre-loaded report data.

**Input:**
- `reportId: string` — The numeric report ID
- `code: string` — JavaScript code defining `main(data, report, ctx)`
- `timeoutMs?: number` — Execution timeout in ms (default 30000, max 60000)
- `maxOutputChars?: number` — Max characters in returned JSON (default 50000, max 200000)

**Output:**
```json
{
  "result": <return value from main()>,
  "logs": ["console.log captured output", "..."]
}
```

**Sandbox signature:**
```js
async function main(data, report, ctx) {
  // data: ReportView — pre-loaded hierarchical report data (synchronous)
  // report: { file(path, opts?), files[] } — raw file access API (async)
  // ctx: { preview(value, maxLen) } — helpers
  // console.log/warn/error — captured and returned

  return { /* your result */ };
}
```

**ReportView structure:**
```
ReportView
├── meta        (reportId, product, version, reportType, reportReason, timezone)
├── markers[]   ({ id, severity, label, tooltip, target: string })
├── host
│   ├── hardware   → HostInfoSummary (system, hardDisks[], networkAdapters[], usbDevices[], flags, etc.)
│   ├── gpu        → MoreHostInfoSummary (gpus[], displayCount)
│   ├── storage    → MountInfoSummary (volumes[], lowStorage, hddFull)
│   ├── kexts      → LoadedDriversSummary (kexts[], isHackintosh, etc.)
│   ├── processes  → AllProcessesSummary (items[], top snapshot) — RAW arrays, agent sorts by .cpu/.mem
│   ├── services   → LaunchdInfoSummary (tree, stats)
│   └── software   → InstalledSoftwareSummary (apps[], appCount)
├── parallels
│   ├── license          → LicenseDataSummary (editionName, expirationDate, isPirated, etc.)
│   ├── virtualNetworks  → NetConfigSummary (networks[], kextlessMode)
│   ├── appConfig        → AppConfigSummary (verboseLoggingEnabled, usbPermanentAssignments[], etc.)
│   ├── client           → ClientInfoSummary (accountEmail, pdPreferences[])
│   ├── proxy            → ClientProxyInfoSummary (httpProxyEnabled)
│   └── installHistory   → AutoStatisticInfoSummary (installations[], installationCount)
└── vms[]  (ALL VMs from VmDirectory, including non-current)
    ├── uuid, name, isCurrent
    ├── settings     → CurrentVmModel | CurrentVmSummary (current + non-current VMs via per-UUID config.pvs)
    ├── guestOs      → GuestOsSummary (current VM only)
    ├── guestCommands → GuestCommandsSummary (current VM only)
    ├── storageAndSnapshots → AdvancedVmInfoSummary (snapshots[], hasAclIssues, etc.)
    ├── toolsLog     → ToolsLogSummary (status, entries[{timestamp, message}]) — both current & non-current
    ├── systemLog    → ParallelsSystemLogSummary (hasCoherenceDump, coherenceDumpCount)
    └── files        → { configPvs?: string, vmLog?: string, toolsLog?: string } — raw paths for report.file()
```

**Design philosophy:** Stay close to raw primitives. Parser summaries are passed through with minimal reshaping — the coding agent is excellent at sorting/filtering/mapping arrays in JavaScript. Only pre-computed fields are those requiring domain-specific knowledge (e.g., `isBootCamp`, `isHackintosh`, `lowStorage`).

**Examples:**

```js
// Quick summary
function main(data) {
  const vm = data.vms.find(v => v.isCurrent);
  return {
    product: data.meta.productVersion,
    guestOs: vm?.guestOs?.name,
    dangers: data.markers.filter(m => m.severity === 'danger').map(m => m.label),
  };
}
```

```js
// Sort processes by CPU (agent does the sorting, not pre-computed)
function main(data) {
  const procs = data.host.processes?.items ?? [];
  return [...procs].sort((a, b) => b.cpu - a.cpu).slice(0, 10)
    .map(p => ({ name: p.shortName, cpu: p.cpu, mem: p.mem }));
}
```

```js
// Read raw log file for a non-current VM
async function main(data, report) {
  const vm = data.vms.find(v => !v.isCurrent && v.files.vmLog);
  if (!vm) return 'no non-current VM with log';
  const log = await report.file(vm.files.vmLog, { maxChars: 10000 });
  return { vm: vm.name, totalLines: log?.split('\n').length };
}
```

## Constraints

- **Timeout:** Sandbox execution is limited by `timeoutMs` (default 30s, max 60s)
- **Output size:** Result JSON is truncated at `maxOutputChars` (default 50KB, max 200KB)
- **File downloads:** Raw file access via `report.file()` is capped at 2MB per file
- **Safety:** Sandbox uses Node.js `vm` module with no access to `require`, `process`, `fs`, or other Node builtins
- **Console capture:** `console.log/warn/error` are captured and returned in `logs[]`

## Data Flow

1. Agent calls `execute_report_code` with `reportId` + JavaScript code
2. Server fetches report index + all node payloads from Reportus
3. Server parses all nodes → builds `ReportModel` → evaluates rules → generates `markers[]`
4. Server discovers per-VM files (`vm-{uuid}-config.pvs.log`, `tools-{uuid}.log`, `vm-{uuid}.log`)
5. Server parses non-current VM config.pvs and tools.log files
6. Server builds `ReportView` via `buildReportView(report, markers, { perVm, parsedPerVm })`
7. Server constructs `report` API object with `file(path, opts?)` for raw file access
8. Server runs agent's code in sandbox with `data`, `report`, `ctx`
9. Server returns `{ result, logs }` with truncation applied

## Status

**Production-ready** — Single-tool, code-sandbox pattern proven by Jira MCP Reader. Enables programmatic traversal, filtering, and composition in a single call. Parser summaries are stable and well-typed via `@prv/report-core`.
