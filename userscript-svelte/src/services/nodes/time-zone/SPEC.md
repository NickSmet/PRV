# TimeZone

## Purpose

Parse timezone and time offset information, typically emitted as a small XML wrapper.

## Input

- **Payload type:** XML (constructed wrapper)
- **Primary source:** `window.__prv_timezoneXml`

## Output

`parseTimeZone(xmlData: string) => TimeZoneSummary | null`

