# Web App (SvelteKit) Specification

## Overview

`apps/web/` is a SvelteKit (adapter-node) web surface that:
- proxies the Reportus API server-side (so Basic Auth is never exposed to the browser)
- reuses shared parsing/model/rules from `packages/report-core`
- reuses shared NodeModel building from `packages/report-viewmodel`
- renders shared UI from `packages/report-ui-svelte`

**Key principle:** the browser never talks to `https://reportus.prls.net` directly — all calls go through SvelteKit routes.

This surface ships two UI modes:
- **Reality-centered (mental-model) view**: `/{reportId}` (digits-only)
- **Node-centered view**: `/nodes/{reportId}` (digits-only)

## Architecture

```
Browser UI (Svelte 5)
  └─ calls /api/reports/:id/*
      └─ SvelteKit server routes
          └─ packages/report-api      (Reportus HTTP client)
              └─ packages/report-core (node payload resolution + parsing + rules)
                  └─ packages/report-viewmodel (NodeModel builders)
                      └─ packages/report-ui-svelte (render)
```

## Configuration

### Environment variables

These are **server-only** (do not prefix with `VITE_`).

| Variable | Purpose | Example |
|---|---|---|
| `REPORTUS_BASE_URL` | Reportus origin | `https://reportus.prls.net` |
| `REPORTUS_BASIC_AUTH` | Basic auth for Reportus API (full header value or base64 payload) | `Basic <base64>` |

Sample file: `apps/web/.env.example`

Runtime note: SvelteKit loads `apps/web/.env` for server-only env via `$env/dynamic/private`.

**Auth normalization contract:** `REPORTUS_BASIC_AUTH` may be either:
- `Basic <base64>` (full header value), or
- `<base64>` (payload only; `packages/report-api` will prefix with `Basic `).

## Server routes

All routes are under `apps/web/src/routes/api/reports/`.

| Route | Purpose |
|---|---|
| `GET /api/reports/:id` | Fetch report index (`/api/reports/{id}`) |
| `GET /api/reports/:id/files/[...filePath]` | Download raw attachment/log content as **text** (truncated) |
| `GET /api/reports/:id/files-raw/[...filePath]` | Download raw attachment/log content as **bytes** (truncated; used for images/binaries) |
| `GET /api/reports/:id/nodes/:nodeKey` | Fetch a node payload via filename hints + parse to a summary |
| `GET /api/reports/:id/model` | Build a default `ReportModel`, evaluate markers, return `{ report, markers, nodes }` |
| `GET /api/reports/:id/mental-model` | Build the mental-model page payload (RealityModel + nodes + markers + raw list + per-VM discovery) |
| `GET /api/reports/:id/raw/node/:nodeKey` | Raw node payload for modal (text/plain; includes truncation headers) |

### Data source note (fixtures vs real API)

This web app always retrieves report content from the **Reportus API** via `packages/report-api`.
Local `fixtures/` are used only by the CLI parser harness (`npm run parse:node`) and are not consulted by the web surface.

### Caching and size limits

- Server-side TTL caches are used for node payloads and file downloads to reduce repeated Reportus calls.
- Default `maxBytes` is **2 MiB** for logs/payloads; callers may request larger sizes (the UI offers “Show more”) up to a hard cap.

### Error handling contract

- HTTP errors from Reportus are forwarded as SvelteKit endpoint errors (e.g. Reportus `404` → endpoint `404`).
- Auth values must never be returned to the browser or logged.

## Related docs

- Mental-model UX contract: `docs/features/MENTAL-MODEL-VIEW.md`

## Status

**Outline** — routes + shared rendering are implemented; caching policy can evolve without changing shared parser contracts.

