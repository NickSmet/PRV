# LicenseData

## Purpose

Parse the license JSON payload to expose:
- edition (STD/PDB/Pro)
- expiration
- trial/NFR/suspended/grace-period flags
- a “pirated” heuristic (expiration far in the future)

## Input

- **Payload type:** JSON string
- **Primary source:** `window.__prv_licenseDataJson`

## Output

`parseLicenseData(jsonData: string) => LicenseDataSummary | null`

Key fields:
- `edition`, `editionName`
- `expirationDate`, `expirationTimestamp`
- `isPirated`
- boolean license properties (trial/NFR/etc.)

## Notes / heuristics

- “Pirated” is detected as expiration more than ~12 years in the future (best-effort heuristic).

