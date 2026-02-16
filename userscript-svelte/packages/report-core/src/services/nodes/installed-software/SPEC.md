# InstalledSoftware

## Purpose

Parse a macOS applications list dump to produce:
- de-duplicated list of apps and versions
- total count

## Input

- **Payload type:** plain text (may contain lightweight XML wrapper tags)
- **Primary source:** `window.__prv_installedSoftwareText`

## Output

`parseInstalledSoftware(textData: string) => InstalledSoftwareSummary | null`

Key fields:
- `apps[]` (`name`, `version?`)
- `appCount`

## Notes / heuristics

- Strips `<InstalledSoftware>` tags if present.
- Extracts from `/Applications/<App>.app ...: <version>` style lines.

