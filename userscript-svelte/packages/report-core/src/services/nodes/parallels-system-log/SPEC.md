# parallels-system.log

## Purpose

Parse the Parallels system log text to extract:
- lightweight markers and summaries used by UI
- best-effort “notable lines” rather than a full log index

## Input

- **Payload type:** plain text (attachment)
- **Primary source:** `window.__prv_parallelsSystemLogText`

## Output

`parseParallelsSystemLog(textData: string) => ParallelsSystemLogSummary | null`

## Notes / heuristics

- This parser is intentionally conservative: it should not throw on unexpected formats.

