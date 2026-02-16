# tools.log

## Purpose

Parse Parallels Tools installation log text to extract:
- installation status
- notable warnings/errors
- best-effort version hints

## Input

- **Payload type:** plain text (attachment)
- **Primary source (userscript):** `window.__prv_toolsLogText` (when available)
- **Primary source (web/MCP):** Reportus attachment download via `fetchNodePayload(..., 'ToolsLog')` and/or per-VM file downloads

File naming notes:
- Current VM tools log is typically `tools.log`
- Non-current VM tools logs may appear as `tools-{uuid}.log` (discovered from the Reportus index `files[]` list)

**Truncation contract:** payloads may be truncated by `maxBytes`. The parser must tolerate incomplete logs and still return best-effort highlights.

## Output

`parseToolsLog(textData: string) => ToolsLogSummary | null`

## Notes / heuristics

- Focus on actionable highlights; avoid heavy indexing for large logs.
