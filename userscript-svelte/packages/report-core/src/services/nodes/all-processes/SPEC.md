# AllProcesses

## Purpose

Parse `ps aux` output (and an optional `top` snapshot when present) to provide:
- a unified process list for table UIs
- derived “legacy” lists (running apps / top CPU / top memory) for compatibility

## Input

- **Payload type:** plain text
- **Primary source:** `window.__prv_allProcessesText`

## Output

`parseAllProcesses(textData: string) => AllProcessesSummary | null`

Key fields:
- `items[]`: unified list (typed/classified via heuristics)
- `snapshot?`: minimal parsed “top” summary when present
- legacy fields: `runningApps`, `topCpuProcesses`, `topMemProcesses`

## Notes / heuristics

- Best-effort classification into `ProcessType` (macOS apps, Parallels Tools, Windows components, services, etc.).
- Helper subprocesses are marked via `isHelper` for indentation/dimming in UI.

