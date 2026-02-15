# tools.log

## Purpose

Parse Parallels Tools installation log text to extract:
- installation status
- notable warnings/errors
- best-effort version hints

## Input

- **Payload type:** plain text (attachment)
- **Primary source:** `window.__prv_toolsLogText`

## Output

`parseToolsLog(textData: string) => ToolsLogSummary | null`

## Notes / heuristics

- Focus on actionable highlights; avoid heavy indexing for large logs.

