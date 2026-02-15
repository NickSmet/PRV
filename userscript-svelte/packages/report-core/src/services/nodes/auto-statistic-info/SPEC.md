# AutoStatisticInfo

## Purpose

Parse Parallels Desktop installation history to show:
- list of installations (version + date)
- total count

## Input

- **Payload type:** inline XML (serialized)
- **Primary source:** `window.__prv_autoStatisticInfoXml`

## Output

`parseAutoStatisticInfo(xmlData: string) => AutoStatisticInfoSummary | null`

Key fields:
- `installations[]` (version/date)
- `installationCount`

