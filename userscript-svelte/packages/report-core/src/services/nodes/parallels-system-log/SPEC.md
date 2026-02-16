# parallels-system.log

## Purpose

Parse the Parallels system log text to extract:
- lightweight markers and summaries used by UI
- best-effort “notable lines” rather than a full log index

## Input

- **Payload type:** plain text (attachment)
- **Primary source (userscript):** `window.__prv_parallelsSystemLogText` (when available)
- **Primary source (web/MCP):** Reportus attachment download via `fetchNodePayload(..., 'ParallelsSystemLog')`

**Truncation contract:** payloads may be truncated by `maxBytes`. The parser must tolerate incomplete logs.

## Output

`parseParallelsSystemLog(textData: string) => ParallelsSystemLogSummary | null`

## Notes / heuristics

- This parser is intentionally conservative: it should not throw on unexpected formats.
