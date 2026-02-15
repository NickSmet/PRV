# Shared Svelte UI Specification

## Overview

`packages/report-ui-svelte/` contains shared Svelte 5 (runes mode) components used by:
- `apps/userscript`
- `apps/web`

**Key principle:** this package renders `NodeModel[]` + markers; it does not fetch or parse.

## Styling (Tailwind v4)

Base styles live in `packages/report-ui-svelte/src/styles.css` and are imported by consuming apps.

## Interfaces

- `<ReportViewer nodes markers context />` (exported from `packages/report-ui-svelte/src/index.ts`)

## Status

**Outline** — shared UI is functional; keep exports stable as consumers grow.
