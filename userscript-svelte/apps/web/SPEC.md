# Web App (SvelteKit) Specification

## Overview

`apps/web/` is a SvelteKit (adapter-node) web surface that:
- proxies the Reportus API server-side (so Basic Auth is never exposed to the browser)
- reuses shared parsing/model/rules from `packages/report-core`
- reuses shared NodeModel building from `packages/report-viewmodel`
- renders shared UI from `packages/report-ui-svelte`

**Key principle:** the browser never talks to `https://reportus.prls.net` directly — all calls go through SvelteKit routes.

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
| `REPORTUS_BASIC_AUTH` | Basic auth for Reportus API (full header or base64 payload) | `Basic <base64>` |

Sample file: `apps/web/.env.example`
Runtime note: SvelteKit loads `apps/web/.env` for server-only env via `$env/dynamic/private`.

## Server routes

All routes are under `apps/web/src/routes/api/reports/`.

| Route | Purpose |
|---|---|
| `GET /api/reports/:id` | Fetch report index (`/api/reports/{id}`) |
| `GET /api/reports/:id/files/[...filePath]` | Download raw attachment/log content (truncated) |
| `GET /api/reports/:id/nodes/:nodeKey` | Fetch a node payload via filename hints + parse to a summary |
| `GET /api/reports/:id/model` | Build a default `ReportModel`, evaluate markers, return `{ nodes, markers }` |

## Status

**Outline** — routes + shared rendering are implemented; caching policy can evolve without changing shared parser contracts.
