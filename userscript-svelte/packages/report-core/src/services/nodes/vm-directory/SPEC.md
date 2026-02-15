# VmDirectory

## Purpose

Parse the VM directory inventory to expose:
- a list of known VMs and basic metadata
- counts and status flags used by UI

## Input

- **Payload type:** XML fragment
- **Primary source:** `window.__prv_vmDirectoryXml`

## Output

`parseVmDirectory(xmlData: string) => VmDirectorySummary | null`

## Notes / heuristics

- Be tolerant to partial/missing fields across versions of the report.

