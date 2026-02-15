# ViewModel (NodeModel builders) Specification

## Overview

`packages/report-viewmodel/` builds UI-ready `NodeModel[]` from a parsed `ReportModel` and evaluated markers.

**Hard rule:** viewmodels do **not** parse raw XML/JSON/text. Parsing lives in `packages/report-core`.

## Interfaces

- `buildNodesFromReport(report: ReportModel, markers: Marker[]): NodeModel[]`
- `NodeModel`, `NodeSection`, `NodeRow`, `NodeBadge`

## Status

**Outline** — migrated from the userscript; continue refactoring to keep this package UI-framework-agnostic.
