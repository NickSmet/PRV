# Report Snapshot Cache (Azure Blob) — Specification (WIP)

## Overview

Reduce (ideally eliminate) repeated calls from `apps/web` backend routes to the Reportus API by **materializing** a report into a compact “snapshot” object once, storing it in **Azure Blob Storage**, and serving subsequent requests from the snapshot.

This is designed for deployment on **Azure Static Web Apps + Azure Functions**, where **in-memory caching is not reliable** (cold starts, scale-out, per-instance memory).

This spec is about **derived snapshot blobs**, not raw log mirroring.
Raw log Blob storage is a separate planned subsystem described in `docs/work-in-progress/log-workspace/LOG-INGEST-AND-STORAGE-SPEC.md`.

## Non-Goals

- Do **not** expose `REPORTUS_BASIC_AUTH` to the browser.
- Do **not** require the browser to talk directly to `https://reportus.prls.net`.
- Do **not** implement client-side execution of `execute_report_code` (sandbox stays server-side).
- Do **not** guarantee “fetch from Reportus only once ever” (Reportus content may change; snapshots are invalidated).

## Terms

- **Reportus index**: response from `GET /api/reports/:id` via `packages/report-api`.
- **Snapshot**: JSON document containing precomputed view payloads (nodes/markers/reality/reportView/etc.).
- **Cache key**: deterministic ID used to find a snapshot for a report version.

## Why Blob Storage (vs Redis / Cosmos)

- Blob is cost-effective for **large payloads** and simple key→value reads.
- Built-in primitives for concurrency and lifecycle management:
  - `ETag` optimistic concurrency
  - blob leases (optional)
  - lifecycle/retention policies (delete old snapshots)

## Snapshot Contents (proposed)

The snapshot is a JSON object with a **versioned schema**:

```ts
type ReportSnapshotV1 = {
  schemaVersion: 1;
  reportId: string;
  reportus: {
    md5: string | null;
    received: string | null;
    product: string | null;
    product_version: string | null;
  };
  createdAtIso: string;
  expiresAtIso: string; // TTL boundary (soft)

  // UI payloads
  markers: unknown;
  nodes: unknown;
  reality: unknown;
  rawItems: unknown;
  vmConfigByUuid: unknown;
  toolsLogMetaByUuid: unknown;

  // Optional: AI payload
  reportView?: unknown;

  // Optional: diagnostics
  buildMeta?: {
    nodeBytesCap: number;
    fetchedNodes: string[];
    truncatedNodes: string[];
  };
};
```

Notes:
- Prefer storing **derived UI payloads** (what routes already return) instead of raw node payload strings.
- `reportView` is optional; enable only if MCP/AI features are deployed.
- Consider compressing the stored blob (gzip) to reduce bandwidth/cost.

## Cache Key & Invalidation

### Cache key

Use a key that changes when the underlying report changes. Prefer:

1. `index.md5` (if present), else
2. `index.received` (if stable), else
3. fallback to reportId only (worst-case).

Example:

```
reports/{reportId}/snapshots/v1/{md5OrReceived}.json.gz
```

### Invalidation rule

When serving a request:
1. Fetch Reportus index (cheap relative to bulk downloads)
2. Compute expected snapshot key
3. Attempt to read snapshot from Blob
4. If missing (404) or expired, rebuild and upload

This still calls Reportus for the index each time, but avoids the expensive “download many nodes/files” path.

## Concurrency & Thundering Herd

Multiple function instances may rebuild the same snapshot concurrently.

Acceptable WIP strategy:
- “Best effort” rebuild: if blob missing, rebuild and upload; last write wins.

More robust strategy (future):
- Use a **blob lease** during rebuild:
  - acquire lease for `{key}.lock` blob (or lease the target blob if it exists)
  - only one builder proceeds; others poll/read existing snapshot.

## Security

- Snapshot must contain **no secrets** (never include auth headers, env, etc.).
- Snapshot should not include raw file contents that might be sensitive unless explicitly required.
- If stored snapshot can contain sensitive customer data, use:
  - private container
  - SSE (default) or customer-managed key if required
  - short TTL and lifecycle deletion

## Routes Integration (planned)

Candidate integration points:

- `apps/web/src/routes/api/reports/[id]/mental-model/+server.ts`
  - Primary consumer: it currently does the heaviest work (index + many nodes + per-VM files).
  - Replace build path with `getOrBuildSnapshot(reportId)` and return snapshot fields.

- `apps/web/src/routes/api/reports/[id]/model/+server.ts`
  - Could be served from snapshot (or share the same build primitive).

- `apps/web/src/routes/mcp/+server.ts` + `servers/mcp/src/executeReportCode.ts`
  - Option A: MCP handler reads `reportView` from snapshot when available.
  - Option B: MCP handler triggers snapshot build on demand.

## Configuration (planned)

Server-only env in `apps/web/.env`:

| Variable | Purpose |
|---|---|
| `SNAPSHOT_BLOB_CONNECTION_STRING` | Storage account connection string (or prefer managed identity later) |
| `SNAPSHOT_BLOB_CONTAINER` | Container name, e.g. `prv-report-snapshots` |
| `SNAPSHOT_TTL_MS` | TTL for snapshots (default: 10 minutes; tune for cost vs freshness) |
| `SNAPSHOT_ENABLE_REPORT_VIEW` | `true/false` to include `reportView` for MCP |
| `SNAPSHOT_GZIP` | `true/false` to gzip blobs (recommended) |

Auth:
- Prefer **Managed Identity** for production; connection strings are acceptable for initial WIP.

## Observability (planned)

Emit structured logs with:
- `reportId`, `snapshotKey`, `hit/miss`, `buildMs`, `uploadMs`, `sizeBytes`, `schemaVersion`
- include a header on responses: `X-PRV-Snapshot: hit|miss|rebuild`

## Testing Plan (planned)

- Local dev: keep current in-memory caches as fallback; snapshot layer can be disabled.
- Unit tests:
  - key derivation from index
  - (de)compression roundtrip
  - schemaVersion guards

## Rollout Plan (planned)

1. Implement snapshot module behind a feature flag.
2. Enable for `/mental-model` first (largest savings).
3. Expand to `/model`, `/nodes/:nodeKey` (if beneficial).
4. Wire MCP to snapshot `reportView` if needed.

## Dependencies

- Web surface: `apps/web` (server routes under `apps/web/src/routes/api/reports/*`)
- Storage: Azure Blob Storage (planned)
- Reportus client + parsing/model: `packages/report-api`, `packages/report-core`
- Viewmodel/UI payload builders: `packages/report-viewmodel`, `packages/report-ui-svelte`

## Related Specifications

- Web app surface: `apps/web/SPEC.md`
- Raw log storage architecture (separate subsystem): `docs/work-in-progress/log-workspace/LOG-INGEST-AND-STORAGE-SPEC.md`
- Embedded MCP server (optional consumer of `reportView`): `apps/web/src/routes/mcp/SPEC.md`

## Status

**🔶 Outline** — Design is documented; implementation is planned behind feature flags (Blob integration not yet shipped).
