# VmDirectory

## Purpose

Parse the VM directory inventory to expose:
- a list of known VMs and basic metadata
- counts and status flags used by UI

## Input

- **Payload type:** XML fragment
- **Primary source (userscript):** `window.__prv_vmDirectoryXml`
- **Primary source (web/MCP):** resolved via `fetchNodePayload(..., 'VmDirectory')` (Reportus attachment download)

## Output

`parseVmDirectory(xmlData: string) => VmDirectorySummary | null`

## Notes / heuristics

- Be tolerant to partial/missing fields across versions of the report.
- This node is the foundation for the **Virtual Machines** hierarchy in the mental-model view (`docs/features/MENTAL-MODEL-VIEW.md`).
