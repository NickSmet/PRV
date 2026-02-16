# ViewModel Specification (`packages/report-viewmodel`)

## Overview

`packages/report-viewmodel/` builds **UI-ready view models** from parsed data:
- **Node-centered view models**: `NodeModel[]` built from `ReportModel` + `Marker[]`
- **Reality-centered view model**: `RealityModel` (Host → Parallels Desktop → VMs → Raw)

**Hard rule:** viewmodels do **not** parse raw XML/JSON/text. Parsing lives in `packages/report-core`.

## Interfaces

### Node-centered

- `buildNodesFromReport(report: ReportModel, markers?: Marker[]): NodeModel[]`
- `NodeModel`, `NodeSection`, `NodeSubSection`, `NodeRow`, `NodeBadge`

**Marker-to-badge merge contract:**
- Node-level `Marker[]` are converted to `NodeBadge[]` and merged into `node.badges`
- Deduplication is by **badge label** (stable labels are important for UX parity)

### Reality-centered (mental-model)

- `buildRealityModel({ reportId, report, index, perVm }): RealityModel`
- `RealityModel`, `RealityCardModel`, `RealityVmModel`, `RealitySourceRef`
- `RealityRawItem` (for the “Raw report nodes” escape hatch list)

Reality view models:
- are **grouping + layout**, not parsing
- reuse `NodeKey` as “source references” for provenance chips
- reuse `buildCurrentVmNode()` to render non-current VM configs from `vm-{uuid}-config.pvs.log`

## Related specs

- UX contract for the mental-model view: `docs/features/MENTAL-MODEL-VIEW.md`
- Canonical model + derived fields: `packages/report-core/src/types/SPEC.md`
- Rule engine + marker semantics: `packages/report-core/src/rules/README.md`
- Shared UI surface: `packages/report-ui-svelte/SPEC.md`

## Status

**Outline** — NodeModel building is stable and shared; RealityModel is evolving but should remain additive (avoid breaking consumers).

