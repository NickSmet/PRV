# Services (Parsers) Specification

## Overview

`src/services/` contains **pure parsers** that convert raw report node payloads (XML / JSON / plain text) into typed summaries consumed by `src/lib/nodeBuilder.ts`.

**Key principle:** Parsers must be **resilient and deterministic** — never throw, tolerate partial/missing fields, and return `null` (or an explicit “empty” summary where relevant) when input is absent or invalid.

This spec also defines the **XML parsing contract** and the intended migration from browser `DOMParser` to `fast-xml-parser` without changing parser public APIs.

Current project priority is **parsing + model stability** (build a reliable `ReportModel`), and only then iterate on UI rendering.
See: `src/lib/types/SPEC.md`.

## Architecture

```
Full Report XML (ParallelsProblemReport)
  └─ src/lib/reportLoader.ts
      └─ extracts node payload strings into window.__prv_* globals

Node payload (XML/JSON/text)
  └─ src/services/nodes/*/parse*.ts (per-node implementations)
      └─ returns *Summary | null
  └─ src/services/parse*.ts (stable entrypoints; re-export from nodes/)
      └─ preserves existing import paths

Summary
  └─ src/lib/nodeBuilder.ts
      └─ builds NodeModel (badges/sections/rows)
```

## Interfaces

### Parser shape

Each parser file exports:
- `export interface <Node>Summary { ... }` (typed, mostly strings)
- `export function parse<Node>(raw: string, ...context?): <Node>Summary | null`

**Conventions**
- Parsers treat inputs as **untrusted in shape** (may be empty, truncated, or in a different format than expected), but **trusted in access control** (the user already has access to the report in the host page).
- Parsers should **not** read from `window.__prv_*` directly — they accept their input as an argument. (Loading/extraction is owned by `src/lib/reportLoader.ts`.)

### XML access helpers (current + target)

Today, XML parsing is implemented as a mix of:
- direct `DOMParser` usage in some parsers, and
- shared helpers in `src/services/xmlUtils.ts` in a few parsers.

**Target contract:** XML parsing should be routed through a shared abstraction so the underlying engine can change.

Proposed helper surface (owned by `src/services/xmlUtils.ts`):

```ts
export type XmlEngine = 'domparser' | 'fast-xml-parser';

export interface XmlDoc {
  engine: XmlEngine;
  // Implementation-specific handle (Document or JS object)
  raw: unknown;
}

/** Parse XML; return null on parse failure. */
export function parseXml(xml: string): XmlDoc | null;

/**
 * Read a value using a restricted "tag path" syntax.
 * - Syntax: `A > B > C` (exact nesting, no attributes, no predicates)
 * - Returns: trimmed string, or undefined if missing/empty.
 */
export function getText(doc: XmlDoc | Document | Element, path: string): string | undefined;

/** Return all child elements/objects for a given tag path (used for list nodes). */
export function getAll(doc: XmlDoc | Document | Element, path: string): unknown[];
```

Notes:
- The **path syntax is intentionally limited** so it can be implemented consistently for both `DOMParser` and `fast-xml-parser`.
- While some existing parsers use CSS selectors (`querySelector`, descendant selectors), new/updated parsers should prefer **exact tag paths** (`A > B > C`) to keep migration low-risk.

## Behavior

### Input formats

The **report file itself is XML**: `<ParallelsProblemReport ...>...</ParallelsProblemReport>`.

Each “node” inside the report is represented as an XML element (e.g. `<CurrentVm>...</CurrentVm>`).
The **node payload** may be delivered in one of two high-level ways:

1) **Embedded payload** (in the report XML):
- **CDATA text** (often used even when the payload is not XML)
- **Inline XML** (child elements under the node element)

2) **Referenced payload** (not embedded):
- the node element text/CDATA contains a **filename** like `CurrentVm.xml` / `AllProcesses.txt`
- the actual content must be fetched via report endpoints (attachments/logs/etc.)

When embedded, the payload content itself can be:
- **XML fragments** (often CDATA-wrapped; e.g. `CurrentVm`, `GuestOs`, `NetConfig`, `HostInfo` in some reports)
- **Inline XML** (embedded XML node; e.g. `AdvancedVmInfo`, `AutoStatisticInfo`)
- **JSON strings** (e.g. `LicenseData` in some reports; `GuestCommands` may be JSON in some reports)
- **Plain text** (command outputs / logs; e.g. `LoadedDrivers`, `AllProcesses`, etc.)

Parsers must:
- handle leading/trailing whitespace
- accept “wrong” but plausible content (e.g. `CurrentVm` containing surrounding text, or a node containing only a filename) and attempt to extract the expected fragment where possible
- preserve values as **strings** unless there is a strong reason to coerce

### Observed structure notes (real reports vary)

Reports can differ in whether they embed node payloads or only reference them by filename.
For example, in some reports many top-level nodes contain filenames (e.g. `CurrentVm.xml`, `HostInfo.xml`, `AllProcesses.txt`), while `SystemLogs` and `UserDefined` are inline lists whose `<Data/>` elements are empty and require separate fetching.

External reference: `docs/pd-reports-knowledge/REPORT_XML_STRUCTURE.md`

### Node inventory (payload → parser → type)

This is the canonical mapping used by the loader/builder pipeline:

| Node | Parser | Typical payload type | Primary source today |
|---|---|---|---|
| `TimeZone` | `parseTimeZone` | XML (constructed wrapper) | `window.__prv_timezoneXml` |
| `CurrentVm` | `parseCurrentVm` | XML fragment | `window.__prv_currentVmXml` |
| `GuestOs` | `parseGuestOs` | XML fragment | `window.__prv_guestOsXml` |
| `LicenseData` | `parseLicenseData` | JSON string | `window.__prv_licenseDataJson` |
| `NetConfig` | `parseNetConfig` | XML fragment | `window.__prv_netConfigXml` |
| `AdvancedVmInfo` | `parseAdvancedVmInfo` | Inline XML (serialized) + embedded `ls -lR` text | `window.__prv_advancedVmInfoXml` |
| `HostInfo` | `parseHostInfo` | XML fragment | `window.__prv_hostInfoXml` |
| `LoadedDrivers` | `parseLoadedDrivers` | Text | `window.__prv_loadedDriversText` |
| `MountInfo` | `parseMountInfo` | Text | `window.__prv_mountInfoText` |
| `AllProcesses` | `parseAllProcesses` | Text | `window.__prv_allProcessesText` |
| `MoreHostInfo` | `parseMoreHostInfo` | XML (plist-like, often malformed/needs normalization) | `window.__prv_moreHostInfoXml` |
| `VmDirectory` | `parseVmDirectory` | XML fragment | `window.__prv_vmDirectoryXml` |
| `GuestCommands` | `parseGuestCommands` | JSON string **or** inline XML | `window.__prv_guestCommandsJson` (historical name; may contain XML) |
| `AppConfig` | `parseAppConfig` | XML fragment | `window.__prv_appConfigXml` |
| `ClientInfo` | `parseClientInfo` | Text | `window.__prv_clientInfoText` |
| `ClientProxyInfo` | `parseClientProxyInfo` | Text | `window.__prv_clientProxyInfoText` |
| `InstalledSoftware` | `parseInstalledSoftware` | Text | `window.__prv_installedSoftwareText` |
| `LaunchdInfo` | `parseLaunchdInfo` | Text | `window.__prv_launchdInfoText` |
| `AutoStatisticInfo` | `parseAutoStatisticInfo` | Inline XML (serialized) | `window.__prv_autoStatisticInfoXml` |
| `tools.log` | `parseToolsLog` | Text (attachment) | `window.__prv_toolsLogText` (planned) |
| `parallels-system.log` | `parseParallelsSystemLog` | Text (attachment) | `window.__prv_parallelsSystemLogText` (planned) |

Reference (meaning of nodes): `docs/pd-reports-knowledge/pd-reports-overview.md`

Per-node specs live next to implementations under `src/services/nodes/*/SPEC.md`.

**Convention:** every node parser should have a sibling `SPEC.md` describing:
- inputs (payload type + primary source global)
- output shape + key fields
- heuristics/normalization + known edge cases

### XML normalization rules

Some nodes require normalization before parsing:
- `CurrentVm`: may contain extra wrapping text; extract `<ParallelsVirtualMachine>...</ParallelsVirtualMachine>` fragment before parsing.
- `MoreHostInfo`: is “plist-like” XML; may need cleanup before parsing (implementation-dependent).

Normalization should happen **inside** the parser that needs it (so the parser remains usable outside of `reportLoader`).

## Parser Iteration Workflow (CLI Harness)

For fast parser iteration without running the userscript UI, use the `parse:node` harness.

- Spec: `scripts/SPEC.md`
- Entrypoint: `scripts/parse-node.ts`

### Example (GuestCommands)

```bash
npm run parse:node -- --node GuestCommands --fixture fixtures/reports/<report-id>
```

### Example (HostInfo)

Some nodes are referenced by filename in `Report.xml` (e.g. `<HostInfo><![CDATA[HostInfo.xml]]></HostInfo>`). When a fixture directory is provided, the harness loads the referenced file.

```bash
npm run parse:node -- --node HostInfo --fixture fixtures/reports/<report-id>
```

What happens:
1. Resolves a report XML path from `--fixture` (`Report.xml`, `report.xml`, or `Report (1).xml`) or `--report-xml`.
2. Reads the report XML file as a string.
3. Resolves the node payload:
   - if the node is embedded inline: pass the raw content/element XML to the parser
   - if the node contains a referenced filename: load that file from the fixture directory (relative path if safe, otherwise by basename)
4. Calls the parser (e.g. `parseGuestCommands(...)`) and prints the parsed summary as stable JSON.

Notes:
- `fixtures/` is gitignored; not all developers will have the same fixture reports locally.
- Not all nodes are embedded inline in `Report.xml`. Many nodes reference attachments by filename; the harness will be extended node-by-node to load the right payload source.

### Recommended iteration loop

1. Update the node spec in `src/services/nodes/<node>/SPEC.md`
2. Update the parser implementation in `src/services/nodes/<node>/parse*.ts`
3. Validate with `npm run parse:node` (and optionally snapshot with `--out`)
4. Wire/normalize into `ReportModel` (`src/lib/types/report.ts`) as needed
5. Update UI rendering only after the model is stable

## Configuration

No external configuration is required for parsers.

**Runtime constraints**
- Must run in browser/userscript context (no Node-only XML libs unless bundled for browser).
- Keep parsing synchronous and side-effect free (except logging).

## Error Handling

| Condition | Required behavior |
|---|---|
| Empty input | Return `null` (or an explicit “empty” summary where the UI benefits) |
| XML parse error | Return `null`; log a warning/error with parser name prefix |
| Partial/missing fields | Return a partial summary with missing fields as `undefined` |
| Unexpected format (wrong root tag) | Return `null` unless safe fallback exists |

Logging guidelines:
- Use a stable prefix (`[PRV]` or `[parseX]`) and avoid logging full payloads (they can be large).

## fast-xml-parser Migration (Planned)

Goal: switch from browser `DOMParser` to `fast-xml-parser` for node XML parsing **without changing** parser public APIs or the `nodeBuilder` contract.

Constraints/requirements (to confirm):
- Preserve current behavior where most extracted values are **strings**.
- Support repeated tags as arrays for list-like nodes (`Hdd`, `NetworkAdapter`, `VirtualNetwork`, etc.).
- Ignore attributes unless a future parser needs them.

Approach:
1. Expand `src/services/xmlUtils.ts` into the single entrypoint for XML parsing and selection (tag-path based).
2. Incrementally refactor parsers that call `new DOMParser()` directly to use `xmlUtils` helpers.
3. Replace the `xmlUtils` implementation to use `fast-xml-parser` (or support both engines behind the same surface).
4. Keep `src/lib/reportLoader.ts` parsing strategy independent (it can remain `DOMParser` initially, since it benefits from `querySelector` over the full report document).

## Examples

### Reading a single value (tag-path)

```ts
const doc = parseXml(xmlData);
const vmName = doc ? getText(doc, 'ParallelsVirtualMachine > Identification > VmName') : undefined;
```

### Iterating list nodes

```ts
const disks = getAll(doc, 'ParallelsVirtualMachine > Hardware > Hdd');
```

## Dependencies

- Loader/extraction: `src/lib/reportLoader.ts`
- Builder/render model: `src/lib/nodeBuilder.ts`
- Node meaning reference: `docs/pd-reports-knowledge/pd-reports-overview.md`

## Status

**Outline** — Parsers exist and are functional; XML parsing is currently mixed (`DOMParser` direct + `xmlUtils`). Consolidation + `fast-xml-parser` migration is planned.

## Related Specifications

- (Planned) `src/lib/SPEC.md` — report loading and node building pipeline
- (Planned) `src/lib/types/SPEC.md` — report model + marker types
- (Planned) `src/lib/rules/SPEC.md` — rule engine (badges/markers)
