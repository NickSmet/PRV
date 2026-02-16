# Reportus API Client Specification

## Overview

`packages/report-api/` provides a single typed client for the Reportus API:
- `GET /api/reports/{reportId}` (report index; includes `files[]`)
- `GET /api/reports/{reportId}/files/{filePath}/download` (raw attachment contents)

**Key principle:** all backend surfaces call Reportus through this client so URL encoding, auth normalization, and truncation rules are consistent.

## Interfaces

Types (public):

```ts
export type ReportId = string;

export interface ReportusFileEntry {
  filename: string;
  path: string;
  size: number;
  offset: number;
}

export interface ReportusReportIndex {
  _id: string;
  filename: string;
  ap_info?: Record<string, unknown>;
  files: ReportusFileEntry[];
  // Optional metadata fields returned by Reportus (may vary by environment/version).
  md5?: string;
  parsed?: string;
  received?: string;
  problem_code?: number;
  problem_description?: string;
  product?: string;
  product_version?: string;
  report_id?: number;
  report_reason?: string;
  report_type?: string;
  server_uuid?: string;
  computer_model?: string;
}
```

Client:

```ts
createReportusClient({
  baseUrl,
  basicAuth
}: {
  baseUrl: string;
  basicAuth: string; // "Basic <base64>" OR "<base64>"
})
```

Methods:
- `getReportIndex(reportId)`
- `downloadFileText(reportId, filePath, { maxBytes? })`
- `downloadFileBytes(reportId, filePath, { maxBytes? })`

## URL encoding rule

`filePath` is a slash-separated path from the index (e.g. `PrlProblemReport-.../tools.log`).
To build the download URL we encode **each segment** and preserve `/`:

```ts
filePath.split('/').map(encodeURIComponent).join('/')
```

## Truncation rule

Downloads support `maxBytes` (default 2 MiB) and return `{ truncated: true }` if content was cut early.

## Status

**Complete** — used by `apps/web` and `servers/mcp`.
