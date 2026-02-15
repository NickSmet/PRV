# Report Model Specification

## Overview

This directory defines the **canonical parsed report object shape** used by:
- the rule engine (`packages/report-core/src/rules/`)
- future “backend-first” workflows (parse → normalize → render)

**Key principle:** The report model is a **stable contract** for downstream logic. Parsers may change implementation details, but the model shape should evolve deliberately and be tracked here.

## Architecture

```
ParallelsProblemReport XML (+ attachments/logs)
  ├─ apps/userscript/src/lib/reportLoader.ts      (userscript-only: extract node payload strings into window globals)
  ├─ packages/report-api                          (web/MCP: download raw file contents from Reportus)
  └─ packages/report-core/src/services/nodes/*/parse*.ts (node summaries; resilient parsing)
      └─ packages/report-core/src/types/report.ts (normalize + derived fields)
          └─ packages/report-core/src/rules/*     (pure evaluation over ReportModel)
              └─ packages/report-viewmodel        (NodeModel builders)
                  └─ packages/report-ui-svelte    (Svelte rendering)
```

## Interfaces

The canonical TypeScript source is `packages/report-core/src/types/report.ts`.

### `ReportModel` (high-level)

`ReportModel` is a structured object with two categories of data:
1) **parsed node summaries** (direct outputs of `packages/report-core/src/services/index.ts`)
2) **normalized/derived fields** that make cross-node rules possible

Note: parser implementations live under `packages/report-core/src/services/nodes/`, and `packages/report-core/src/services/index.ts` (and `@prv/report-core`) are the stable export surface.

At the moment, the model still includes several “raw parser summary” types directly (e.g. `GuestCommandsSummary`). That is acceptable while the model is still evolving, but the goal is to gradually move toward normalized types in `packages/report-core/src/types/` that are not coupled to individual parser implementations.

### Model sections

| Section | Purpose | Primary sources |
|---|---|---|
| `meta` | report metadata and host product info | report root nodes, `VendorInfo` |
| `host` | host-level derived info (RAM, CPU, display flags) | HostInfo / MoreHostInfo / rules |
| `hostDevices` | host hardware/peripherals inventory | `HostInfo` |
| `license` | license details | `LicenseData` |
| `currentVm` | VM configuration (plus derived fields for rules) | `CurrentVm` |
| `guestOs` | guest OS version/type | `GuestOs` |
| `drivers` | kext/driver diagnostics | `LoadedDrivers` |
| `processes` | host process diagnostics | `AllProcesses` |
| `storage` | storage/volume diagnostics | `MountInfo` |
| `network` | PD network configuration | `NetConfig` |
| `advancedVm` | snapshots + bundle listing diagnostics | `AdvancedVmInfo` |
| `moreHostInfo` | deeper host hardware (system_profiler) | `MoreHostInfo` |
| `vmDirectory` | list of all VMs | `VmDirectory` |
| `guestCommands` | guest-side command outputs (parsed/normalized) | `GuestCommands` |
| `appConfig` | PD preferences + USB assignments | `AppConfig` |
| `clientInfo` | user prefs and account markers | `ClientInfo` |
| `proxy` | proxy settings | `ClientProxyInfo` |
| `installedSoftware` | installed apps list | `InstalledSoftware` |
| `timezone` | timezone offset wrapper | `TimeZone` |
| `toolsLog` | Tools installation diagnostics | `SystemLogs` attachment `tools.log` |
| `systemLog` | system log diagnostics | `SystemLogs` attachment `parallels-system.log` |
| `launchdInfo` | startup services | `LaunchdInfo` |
| `autoStatisticInfo` | PD update/install history | `AutoStatisticInfo` |

## Behavior

### Model evolution policy

When we change the intended model shape:
1. Update this spec (`packages/report-core/src/types/SPEC.md`) with the new contract
2. Update the code implementation in `packages/report-core/src/types/report.ts`
3. Update the relevant node spec under `packages/report-core/src/services/nodes/*/SPEC.md`

### Recommended workflow (ReportModel-first)

When returning to this repo or starting work on a node:

1. Pick a node and read its spec: `packages/report-core/src/services/nodes/<node>/SPEC.md`
2. Iterate on parser output using the harness:
   - `npm run parse:node -- --node <NodeKey> --fixture fixtures/reports/<report-id>`
   - (Optional) write a stable JSON snapshot with `--out` for local diffing
3. Wire/normalize into `ReportModel` in `packages/report-core/src/types/report.ts`
4. Only then update UI rendering (`packages/report-viewmodel` + `packages/report-ui-svelte`)

The intent is to stabilize data first (parsing + normalization), then spend UI effort once the model is reliable.

### Roadmap (high-level)

1) **Stabilize per-node summaries** (robust parsing, good typing, real fixture coverage via `parse:node`)
2) **Normalize into `ReportModel`** (decouple UI/rules from raw parser shapes over time)
3) **Improve rule coverage** (badges/markers based on normalized fields)
4) **Revisit UI** (render from stable model; add component-level polish as needed)

## Related Specifications

- Node parsing contracts: `packages/report-core/src/services/SPEC.md`
- Node-specific parsing: `packages/report-core/src/services/nodes/`
- Rules: `packages/report-core/src/rules/README.md`

## Status

**Outline** — ReportModel exists and is partially used (notably for rules). Model stabilization and decoupling from raw parser summary types is ongoing.
