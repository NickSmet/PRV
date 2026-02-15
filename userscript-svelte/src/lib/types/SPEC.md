# Report Model Specification

## Overview

This directory defines the **canonical parsed report object shape** used by:
- the rule engine (`src/lib/rules/`)
- future “backend-first” workflows (parse → normalize → render)

**Key principle:** The report model is a **stable contract** for downstream logic. Parsers may change implementation details, but the model shape should evolve deliberately and be tracked here.

## Architecture

```
ParallelsProblemReport XML (+ attachments/logs)
  └─ src/lib/reportLoader.ts         (fetch + extract node payload strings)
      └─ src/services/nodes/*/parse*.ts (node summaries; resilient parsing)
          └─ src/lib/types/report.ts (normalize + derived fields)
              └─ src/lib/rules/*     (pure evaluation over ReportModel)
                  └─ UI              (node builder + Svelte rendering)
```

## Interfaces

The canonical TypeScript source is `src/lib/types/report.ts`.

### `ReportModel` (high-level)

`ReportModel` is a structured object with two categories of data:
1) **parsed node summaries** (direct outputs of `src/services/parse*.ts`)
2) **normalized/derived fields** that make cross-node rules possible

Note: parser implementations live under `src/services/nodes/`, but `src/services/parse*.ts` remains a stable import surface (re-export wrappers).

At the moment, the model still includes several “raw parser summary” types directly (e.g. `GuestCommandsSummary`). That is acceptable while the model is still evolving, but the goal is to gradually move toward normalized types in `src/lib/types/` that are not coupled to individual parser implementations.

### Model sections

| Section | Purpose | Primary sources |
|---|---|---|
| `meta` | report metadata and host product info | report root nodes, `VendorInfo` |
| `host` | host-level derived info (RAM, CPU, display flags) | HostInfo / MoreHostInfo / rules |
| `currentVm` | VM configuration (plus derived fields for rules) | `CurrentVm` |
| `guestOs` | guest OS version/type | `GuestOs` |
| `license` | license details | `LicenseData` |
| `network` | PD network configuration | `NetConfig` |
| `advancedVm` | snapshots + bundle listing diagnostics | `AdvancedVmInfo` |
| `hostDevices` | host hardware/peripherals inventory | `HostInfo` |
| `loadedDrivers` | kext/driver diagnostics | `LoadedDrivers` |
| `mountInfo` | storage/volume diagnostics | `MountInfo` |
| `allProcesses` | host process diagnostics | `AllProcesses` |
| `moreHostInfo` | deeper host hardware (system_profiler) | `MoreHostInfo` |
| `vmDirectory` | list of all VMs | `VmDirectory` |
| `guestCommands` | guest-side command outputs (parsed/normalized) | `GuestCommands` |
| `appConfig` | PD preferences + USB assignments | `AppConfig` |
| `clientInfo` | user prefs and account markers | `ClientInfo` |
| `clientProxyInfo` | proxy settings | `ClientProxyInfo` |
| `installedSoftware` | installed apps list | `InstalledSoftware` |
| `timezone` | timezone offset wrapper | `TimeZone` |
| `toolsLog` | Tools installation diagnostics | `SystemLogs` attachment `tools.log` |
| `parallelsSystemLog` | system log diagnostics | `SystemLogs` attachment `parallels-system.log` |
| `launchdInfo` | startup services | `LaunchdInfo` |
| `autoStatisticInfo` | PD update/install history | `AutoStatisticInfo` |

## Behavior

### Model evolution policy

When we change the intended model shape:
1. Update this spec (`src/lib/types/SPEC.md`) with the new contract
2. Update the code implementation in `src/lib/types/report.ts`
3. Update the relevant node spec under `src/services/nodes/*/SPEC.md`

### Recommended workflow (ReportModel-first)

When returning to this repo or starting work on a node:

1. Pick a node and read its spec: `src/services/nodes/<node>/SPEC.md`
2. Iterate on parser output using the harness:
   - `npm run parse:node -- --node <NodeKey> --fixture fixtures/reports/<report-id>`
   - (Optional) write a stable JSON snapshot with `--out` for local diffing
3. Wire/normalize into `ReportModel` in `src/lib/types/report.ts`
4. Only then update UI rendering (`src/lib/nodeBuilder.ts` + components)

The intent is to stabilize data first (parsing + normalization), then spend UI effort once the model is reliable.

### Roadmap (high-level)

1) **Stabilize per-node summaries** (robust parsing, good typing, real fixture coverage via `parse:node`)
2) **Normalize into `ReportModel`** (decouple UI/rules from raw parser shapes over time)
3) **Improve rule coverage** (badges/markers based on normalized fields)
4) **Revisit UI** (render from stable model; add component-level polish as needed)

## Related Specifications

- Node parsing contracts: `src/services/SPEC.md`
- Node-specific parsing: `src/services/nodes/`
- Rules: `src/lib/rules/SPEC.md` (planned)

## Status

**Outline** — ReportModel exists and is partially used (notably for rules). Model stabilization and decoupling from raw parser summary types is ongoing.
