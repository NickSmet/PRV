# ClientInfo

## Purpose

Parse `ClientInfo` text to extract:
- account email (best-effort)
- Parallels Desktop preferences
- Shared Applications preferences per VM UUID

## Input

- **Payload type:** plain text
- **Primary source:** `window.__prv_clientInfoText`

## Output

`parseClientInfo(textData: string) => ClientInfoSummary | null`

Key fields:
- `accountEmail?`
- `pdPreferences[]`
- `sharedAppsPreferences[]`

## Notes / heuristics

- Uses regex patterns over lines; expects the input to be a structured textual dump.

