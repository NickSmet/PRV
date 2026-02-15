# GuestOs

## Purpose

Parse Guest OS information from `GuestOsInformation` XML:
- OS type (Windows/Linux/macvm/etc.)
- OS version string (with cleanup)
- kernel version
- for Windows-like versions, derive a friendly name from `windowsVersions.json` when possible

## Input

- **Payload type:** XML fragment
- **Primary source:** `window.__prv_guestOsXml`

## Output

`parseGuestOs(xmlData: string) => GuestOsSummary | null`

Key fields:
- `type?`, `version?`, `kernel?`
- `name?` (friendly name when mapped)

## Notes / heuristics

- Removes a trailing comma in version strings (legacy quirk).

