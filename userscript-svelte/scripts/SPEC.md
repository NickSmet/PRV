# Parser Harness Specification

## Overview

This project needs a fast iteration loop for **backend parsing logic** (parsers in `packages/report-core/src/services/`) that does not require running any UI surface.

Parser implementations are organized per node under `packages/report-core/src/services/nodes/`, while `packages/report-core/src/services/index.ts` (and `@prv/report-core`) remain the stable export surface.

The harness:
- reads a local report XML fixture (`Report.xml` / `report.xml`)
- extracts a single node payload (e.g. `<GuestCommands>...</GuestCommands>`)
- runs the corresponding parser
- prints/writes the parsed summary object

## Key principle

Keep the harness **string-in, object-out**:
- Inputs are raw report XML (or raw node XML/text) as strings.
- Parsers produce typed summary objects.

This mirrors the runtime pipeline (payload resolution → parsers → `ReportModel` → viewmodels), but is optimized for rapid parser development.

## CLI

`scripts/parse-node.ts` is the current entrypoint.

Supported nodes (current):
- `GuestCommands`
- `HostInfo`
- `GuestOs`
- `CurrentVm`
- `NetConfig`
- `MoreHostInfo`
- `VmDirectory`
- `AppConfig`
- `ClientInfo`
- `ClientProxyInfo`
- `AdvancedVmInfo`
- `AutoStatisticInfo` *(requires fixture payload to exist)*
- `LicenseData`
- `LoadedDrivers` *(requires fixture payload to exist)*
- `MountInfo` *(requires fixture payload to exist)*
- `AllProcesses` *(requires fixture payload to exist)*
- `InstalledSoftware` *(requires fixture payload to exist)*
- `ToolsLog` *(requires fixture payload to exist)*
- `ParallelsSystemLog` *(requires fixture payload to exist)*
- `LaunchdInfo` *(requires fixture payload to exist)*
- `TimeZone`

Planned:
- expand payload resolution for more attachment-backed nodes as fixture data becomes available

### Usage

```bash
# Parse an inline node payload from a fixture folder containing Report.xml
npm run parse:node -- --node GuestCommands --fixture fixtures/reports/<report-id>

# Parse a node whose payload is referenced by filename in Report.xml (e.g. HostInfo.xml)
npm run parse:node -- --node HostInfo --fixture fixtures/reports/<report-id>

# Same, but write the parsed result to a stable JSON file for diffing
npm run parse:node -- --node GuestCommands --fixture fixtures/reports/<report-id> --out fixtures/reports/<report-id>/_out/GuestCommands.json
```

### Options

- `--node <NodeKey>`: which node parser to run (see supported nodes in `scripts/parse-node.ts`)
- `--fixture <dir>`: a directory containing `Report.xml` (or `report.xml` / `Report (1).xml`)
- `--report-xml <path>` / `--report <path>`: explicit path to the report XML file
- `--out <path>`: write output to a file (still prints to stdout)
- `--watch`: re-run when the report XML file changes

### What It Actually Does (Today)

1. Reads the report XML file into a string.
2. Extracts the full element XML for the requested node (e.g. `<GuestCommands ...>...</GuestCommands>`).
3. Invokes the corresponding parser with that raw payload.
4. Pretty-prints a stable JSON object (sorted keys) to stdout and optionally writes it to `--out`.

Limitations (expected):
- Many nodes in the report XML contain only filenames (e.g. `HostInfo.xml`) rather than embedded payloads; the harness resolves those by loading the referenced file from the fixture folder.
- Fixture lookup is permissive: it tries the referenced relative path (if safe) and then falls back to searching the fixture folder recursively by basename.
- If a referenced payload file is missing from the fixture folder, the harness passes an empty string to the parser (most parsers return `null` in that case).

## Watch model

Two watch layers are supported:
1. **Data watch** (`--watch`): re-run parsing when the report XML file changes.
2. **Code watch** (`tsx watch ...`): restart the process when parser code changes.

This keeps implementation simple (no custom module cache busting) while still feeling like “hot reload”.

## Fixture contract

Local fixtures live under `fixtures/` and are ignored by git.

Recommended structure:

```
fixtures/reports/<report-id>/
  Report.xml
  # optional: referenced payload files (HostInfo.xml, CurrentVm.xml, ...)
  logs/...
  _out/...
```

## Dependencies

- `tsx` (devDependency) for running TypeScript scripts and restarting on code changes
- `chokidar` for watching the report XML file

## Status

**Outline** — Implemented for `GuestCommands`, designed to expand node-by-node as parser work continues.
