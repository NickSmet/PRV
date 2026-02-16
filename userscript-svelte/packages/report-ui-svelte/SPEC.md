# Shared Svelte UI Specification (`packages/report-ui-svelte`)

## Overview

`packages/report-ui-svelte/` contains shared Svelte 5 (runes mode) components used by:
- `apps/userscript`
- `apps/web`

**Key principle:** this package renders **view models** (`NodeModel[]`, `RealityModel`) plus markers; it does not fetch from Reportus and it does not parse raw payloads.

## Exports

Exported from `packages/report-ui-svelte/src/index.ts`:

- `<ReportViewer />` — node-centered viewer (renders `NodeModel[]`)
- `<RealityViewer />` — reality-centered (mental-model) viewer (web-only for now)

**Web-only caveat:** `<RealityViewer />` includes a Raw modal that fetches raw payloads via web routes:
- `/api/reports/:id/raw/node/:nodeKey`
- `/api/reports/:id/files-raw/[...filePath]`

If this component is ever reused outside `apps/web`, provide an adapter layer or alternate `RawModal` implementation.

## Styling (Tailwind v4)

Base styles live in `packages/report-ui-svelte/src/styles.css` and are imported by consuming apps.

If a consuming app uses Tailwind, ensure Tailwind scans this package’s Svelte sources (so classes in shared components are included in the build).

## UX Contracts (do not regress)

These are cross-cutting design choices that protect usability on large reports.

### Collapsed-by-default layout

The mental-model page defaults all cards/collapsibles to **collapsed** to avoid massive initial scroll.

### Header badges for scan-first diagnostics

Important indicators must remain visible when content is collapsed.
`<RealityViewer />` supports “header badges” on:
- cards (`RealityCard`), and
- VM headers (`VmEntry`)

These badges are derived from:
- node-level `NodeModel.badges`
- node-level markers (`Marker[]`) converted into badges (via `packages/report-viewmodel`)

### Raw modal (escape hatch)

The reality-centered UI includes a “Raw report nodes” escape hatch and a modal viewer:

- sources are always reachable (via provenance chips or raw list)
- raw fetches are size-limited (truncation is shown)
- text, images, and downloads are supported via web endpoints

## Component boundaries

To avoid duplicating node-specific UI:
- node rendering is centralized in a shared internal mapping component (`NodeBody`)
- both `<ReportViewer />` and `<RealityViewer />` reuse `NodeBody`

## Related specs

- Mental-model UX contract: `docs/features/MENTAL-MODEL-VIEW.md`
- View models: `packages/report-viewmodel/SPEC.md`

## Status

**Outline** — shared UI is functional; keep exported props stable and prefer additive changes.
