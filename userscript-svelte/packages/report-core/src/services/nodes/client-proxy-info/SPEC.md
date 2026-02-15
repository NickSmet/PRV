# ClientProxyInfo

## Purpose

Detect whether an HTTP proxy is enabled on the host and capture the raw proxy settings snippet.

## Input

- **Payload type:** plain text
- **Primary source:** `window.__prv_clientProxyInfoText`

## Output

`parseClientProxyInfo(textData: string) => ClientProxyInfoSummary | null`

Key fields:
- `httpProxyEnabled`
- `proxySettings?` (raw extracted dictionary snippet)

