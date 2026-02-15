# NetConfig

## Purpose

Parse Parallels network configuration to surface:
- virtual networks (shared/host-only/etc.)
- DHCP/DNS settings where available
- summary flags used by UI visualization

## Input

- **Payload type:** XML fragment
- **Primary source:** `window.__prv_netConfigXml`

## Output

`parseNetConfig(xmlData: string) => NetConfigSummary | null`

## Notes / heuristics

- Input may contain surrounding text; parser should be tolerant and extract the expected fragment where possible.

