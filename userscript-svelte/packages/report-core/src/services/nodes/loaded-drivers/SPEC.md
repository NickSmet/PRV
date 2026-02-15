# LoadedDrivers

## Purpose

Parse loaded kernel extensions / drivers output (e.g. `kextstat`) to detect:
- non-Apple kexts
- known “bad” hackintosh / legacy patcher kext signatures
- presence/absence of Parallels kexts (where applicable)

## Input

- **Payload type:** plain text
- **Primary source:** `window.__prv_loadedDriversText`

## Output

`parseLoadedDrivers(textData: string, cpuModel?: string, hostOsMajor?: number) => LoadedDriversSummary | null`

Key fields:
- `kexts[]`, `nonAppleKexts[]`, `badKexts[]`
- `hasPrlKexts`, `hasNonAppleKexts`, `hasBadKexts`, `onlyApple`, `isHackintosh`

## Notes / heuristics

- On Apple Silicon and/or “kextless” macOS, the meaning of “missing Parallels kexts” differs; the parser accepts host context to avoid false alarms.

