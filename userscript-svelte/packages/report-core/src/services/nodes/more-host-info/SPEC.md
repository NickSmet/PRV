# MoreHostInfo

## Purpose

Parse GPU + display information collected via `system_profiler -xml` to provide:
- GPUs list
- connected displays with logical/physical resolutions and refresh rate

## Input

- **Payload type:** XML (plist-like; may be malformed and require cleanup)
- **Primary source:** `window.__prv_moreHostInfoXml`

## Output

`parseMoreHostInfo(xmlData: string) => MoreHostInfoSummary | null`

Key fields:
- `gpus[]` with `displays[]`
- `displayCount`
- `hasNoDisplays`

## Notes / heuristics

- The parser performs normalization to strip broken headers/footers.
- Skips Windows reports (payload may contain “Windows”).
- Plist parsing is best-effort: only direct child key/value pairs inside dicts are considered.

