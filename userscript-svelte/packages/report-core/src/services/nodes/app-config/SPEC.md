# AppConfig

## Purpose

Parse Parallels Desktop application configuration/preferences to surface:
- verbose logging state
- default VM folders (and whether they are on external volumes)
- USB permanent assignments (auto-connect rules)
- special “disconnected server” report shape detection

## Input

- **Payload type:** XML fragment
- **Primary source:** `window.__prv_appConfigXml`

## Output

`parseAppConfig(xmlData: string) => AppConfigSummary | null`

Key fields:
- `verboseLoggingEnabled`
- `defaultVmFolders[]` + `hasExternalVmFolder`
- `usbPermanentAssignments[]`
- `isUserDefinedOnDisconnectedServer` (special-case sentinel)

## Notes / heuristics

- Default VM folders are extracted via regex for robustness across multi-user dumps.

