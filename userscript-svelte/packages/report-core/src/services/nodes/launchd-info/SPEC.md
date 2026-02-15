# LaunchdInfo

## Purpose

Parse `ls -lR` output of launchd folders into:
- a structured tree for visualization
- a formatted listing for copy/debug
- basic stats (files/folders/root-owned files)

Common folders included in the dump:
- `/Library/LaunchAgents`
- `/Library/LaunchDaemons`
- `/Users/<user>/Library/LaunchAgents`

## Input

- **Payload type:** plain text (`ls -lR` output)
- **Primary source:** `window.__prv_launchdInfoText`

## Output

`parseLaunchdInfo(textData: string) => LaunchdInfoSummary | null`

Key fields:
- `formattedListing`
- `tree?`
- `stats?`

## Notes / heuristics

- Parsing is delegated to `packages/report-core/src/services/utils/lsLr` helpers.
