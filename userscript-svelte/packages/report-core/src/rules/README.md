# Conditional Badging System

A declarative, type-safe system for applying conditional badges/markers to report nodes based on parsed data.

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Parse XML      │────▶│  Build Report    │────▶│  Evaluate Rules │
│  (parseCurrentVm)│     │  Model (typed)   │     │  (pure funcs)   │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                         │
                                                         ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Render UI with │◀────│  MarkerStore     │◀────│  Marker[]       │
│  Markers        │     │  (reactive)      │     │  results        │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

## Key Concepts

### ReportModel
A unified typed object representing the entire report state. Located in `packages/report-core/src/types/report.ts`.

```typescript
interface ReportModel {
  meta: ReportMeta;           // Product name, report ID
  host: HostInfo;             // OS version, RAM, CPU model
  currentVm: CurrentVmModel;  // Parsed VM config with derived fields
  // ... other nodes (advancedVm, guestOs, drivers, etc.)
}
```

### CurrentVmModel
Extends `CurrentVmSummary` with computed/derived fields for rule evaluation:

```typescript
interface CurrentVmModel extends CurrentVmSummary {
  isBootCamp?: boolean;           // Derived from HDD check
  isExternalVhdd?: boolean;       // vHDD outside PVM folder
  isCopied?: boolean;             // Source UUID != VM UUID
  isOnExternalVolume?: boolean;   // /Volumes prefix
  hasDisconnectedAdapter?: boolean;
  // ... more derived fields
}
```

### Markers
Typed objects that represent visual indicators. Located in `packages/report-core/src/types/markers.ts`.

```typescript
interface Marker {
  id: string;                    // Unique ID for click-to-scroll
  severity: 'info' | 'warn' | 'danger' | 'success';
  label: string;                 // Badge text
  tooltip?: string;              // Hover explanation
  iconKey?: string;              // Lucide icon name
  target: MarkerTarget;          // Where to display
}
```

### Marker Targets (Hierarchy)
Markers can target different levels of the UI:

```typescript
// Node level - badge appears on collapsible header
{ type: 'node', nodeId: 'current-vm' }

// Section level - badge appears on section header
{ type: 'section', nodeId: 'current-vm', sectionTitle: 'Hardware' }

// Sub-section level - badge appears on collapsible sub-section
{ type: 'subSection', nodeId: 'current-vm', sectionTitle: 'Hardware', subSectionId: 'hdds' }

// Row level - badge appears on specific row
{ type: 'row', nodeId: 'current-vm', path: 'General.Source UUID' }
```

### Rules
Pure functions that evaluate report data and return markers:

```typescript
type Rule = (report: ReportModel) => Marker[];
```

## Adding a New Rule

### 1. Define the Rule Function

```typescript
// packages/report-core/src/rules/currentVm.ts

const myNewRule: Rule = (report) => {
  // Check condition
  if (report.currentVm?.someField === 'problematic-value') {
    return [
      // Node-level marker
      createNodeMarker('my-rule-id', 'current-vm', 'warn', 'Warning Label', {
        tooltip: 'Detailed explanation of the issue',
        iconKey: 'alert-triangle'
      }),
      // Optional: sub-section marker
      createSubSectionMarker(
        'my-rule-subsection',
        'current-vm',
        'Hardware',
        'hdds',
        'warn',
        'HDD Issue',
        { tooltip: 'More details' }
      )
    ];
  }
  return [];
};
```

### 2. Register the Rule

Add the rule to the `currentVmRules` array in `packages/report-core/src/rules/currentVm.ts`:

```typescript
export const currentVmRules: Rule[] = [
  // ... existing rules
  myNewRule,
];
```

### 3. Add Derived Fields (if needed)

If your rule needs computed data, add it to `CurrentVmModel` and compute it in `deriveCurrentVmFields()`:

```typescript
// packages/report-core/src/types/report.ts

interface CurrentVmModel extends CurrentVmSummary {
  // Add your derived field
  hasSomeIssue?: boolean;
}

function deriveCurrentVmFields(summary: CurrentVmSummary): CurrentVmModel {
  return {
    ...summary,
    // Compute your derived field
    hasSomeIssue: summary.someField === 'problematic-value'
  };
}
```

## File Structure

```
packages/
├── report-core/
│   └── src/
│       ├── types/
│       │   ├── report.ts       # ReportModel, CurrentVmModel, derived fields
│       │   └── markers.ts      # Marker types, targets, helper functions
│       └── rules/
│           ├── types.ts        # Rule type definitions
│           ├── currentVm.ts    # CurrentVm rules
│           └── index.ts        # Rule registry, evaluateRules()
├── report-viewmodel/
│   └── src/
│       └── nodeBuilder.ts      # buildNodesFromReport()
└── report-ui-svelte/
    └── src/
        ├── stores/
        │   └── markerStore.svelte.ts  # Reactive marker store
        └── components/
            └── compact/
                ├── RowValue.svelte         # Reusable row value renderer
                └── CompactCurrentVm.svelte # Compact CurrentVm layout
```

## RowValue Component

The `RowValue` component is the single source of truth for rendering row values.
It handles all `NodeRow.type` values consistently:

```svelte
Location: `packages/report-ui-svelte/src/components/compact/RowValue.svelte`

<!-- Usage -->
<RowValue {row} size="sm" />
<RowValue {row} size="md" />
```

### Supported Types

| `row.type` | Renders As | Description |
|------------|------------|-------------|
| `'path'` | `<CopyButton>` | File/folder paths with copy functionality |
| `'uuid'` | `<CopyButton>` | UUIDs with copy functionality |
| `'datetime'` | `<span>` | Monospace font for dates/times |
| `undefined` | `<span>` | Plain text (default) |

### Adding a New Type

To add a new type (e.g., `'mac-address'`):

1. **Update `NodeRow` interface** in `nodeBuilder.ts`:
   ```typescript
   type?: 'text' | 'path' | 'uuid' | 'datetime' | 'mac-address';
   ```

2. **Update `RowValue.svelte`** to handle the new type:
   ```svelte
   {:else if row.type === 'mac-address'}
     <span class="font-mono uppercase tracking-wider">{row.value}</span>
   ```

3. **Assign the type** in `nodeBuilder.ts` where the row is created:
   ```typescript
   { label: 'MAC', value: adapter.mac, type: 'mac-address' }
   ```

That's it! All sections automatically render MAC addresses consistently.

## Currently Implemented Rules

| Rule ID | Severity | Condition | Legacy equivalent |
|---------|----------|-----------|-------------------|
| `macvm` | info | VM is macOS VM | `markBullet("CurrentVm", 'macvm')` |
| `no-hdd` | danger | No HDD attached (non-macvm) | `markBullet('CurrentVm','bad')` |
| `boot-camp` | info | Boot Camp partition | `markBullet('CurrentVm', 'Boot Camp')` |
| `trim-enabled` | info | TRIM on vHDD | `markBullet('CurrentVm', 'trim')` |
| `splitted-disk` | info | Splitted vHDD | `markBullet('CurrentVm', 'splitted')` |
| `plain-disk` | info | Non-expanding disk | `markBullet('CurrentVm', icons["plain vHDD"])` |
| `external-vhdd` | warn | vHDD outside PVM | `markBullet('CurrentVm', icons["external vHDD"])` |
| `rollback-mode` | warn | Rollback Mode on | `markBullet('CurrentVm', icons.rollbackMode)` |
| `shared-network` | info | Shared networking | `markBullet('CurrentVm', 'shared')` |
| `bridged-network` | info | Bridged networking | `markBullet('CurrentVm', 'bridged')` |
| `disconnected-adapter` | warn | NIC offline | `icons.adapterNotConnected` |
| `network-conditioner` | warn/info | Net conditioner on | `markBullet('CurrentVm', icons['network conditioner...'])` |
| `copied-vm` | warn | Source UUID != VM UUID | `markBullet("CurrentVm", 'copied vm')` |
| `external-drive` | warn | VM on /Volumes | `markBullet("CurrentVm", "external drive")` |
| `linked-clone` | info | Is linked clone | `markBullet('CurrentVm', icons["linked clone"])` |
| `apple-hv` | info | Apple Hypervisor | `markBullet("CurrentVm", "AppleHV")` |
| `nested-virt` | info | Nested virtualization | `markBullet("CurrentVm", "Nested")` |
| `headless` | info | Headless mode | `markBullet("CurrentVm", "headless")` |
| `travel-mode` | warn | Travel Mode on | `markBullet('CurrentVm', icons.travelMode)` |
| `isolated` | info | Isolated VM | `markBullet("CurrentVm", "isolated")` |
| `no-time-sync` | warn | Time sync disabled | `markBullet("CurrentVm", "noTimeSync")` |
| `boot-flags` | warn | Boot flags set | `markBullet("CurrentVm", "flags")` |
| `resource-quota` | warn | Quota < 100% | `markBullet("CurrentVm", "resource quota")` |
| `smart-guard` | info | Smart Guard on | `markBullet("CurrentVm", "smart guard")` |
| `tpm` | info | TPM enabled | `markBullet("CurrentVm", icons.TPM)` |
| `too-much-ram` | danger | VM RAM > host/2 | `markBullet("CurrentVm", 'bad')` |
| `uneven-ram` | warn | RAM not multiple of 256 | `markBullet("CurrentVm", 'warning')` |
| `not-pvmdefault` | warn | Chrome OS non-default VM | `markBullet('CurrentVm', 'not PvmDefault')` |

## UI Integration

### Displaying Node-Level Markers
Markers are converted to badges in `buildCurrentVmNodeWithMarkers()`:

```typescript
const nodeLevelMarkers = getNodeLevelMarkers(markers, 'current-vm');
const markerBadges: NodeBadge[] = nodeLevelMarkers.map((m) => ({
  label: m.label,
  tone: m.severity === 'danger' ? 'danger' : m.severity === 'warn' ? 'warn' : 'info',
  iconKey: m.iconKey
}));
```

### Displaying Sub-Section Markers
In `CompactCurrentVm.svelte`, sub-section markers are displayed on collapsible headers:

```svelte
{#each hddMarkers as marker}
  <Badge
    variant={severityToVariant(marker.severity)}
    onclick={(e) => { e.stopPropagation(); scrollToMarker(marker.id); }}
  >
    {marker.label}
  </Badge>
{/each}
```

### Click-to-Scroll
Each marker has a unique `id`. Elements can be tagged with `data-marker-id`:

```svelte
<div data-marker-id="no-hdd-subsection">
  <!-- content -->
</div>
```

Clicking a marker badge calls `scrollToMarker(marker.id)` which:
1. Finds the element with matching `data-marker-id`
2. Scrolls it into view
3. Applies a highlight animation

## Testing

To test rules, create a `ReportModel` with test data:

```typescript
import { evaluateCurrentVmRules } from './rules';
import { createEmptyReportModel, deriveCurrentVmFields } from './types/report';

const testReport = {
  ...createEmptyReportModel(),
  currentVm: deriveCurrentVmFields({
    vmName: 'Test VM',
    hdds: [], // No HDDs - should trigger no-hdd rule
    // ... other fields
  })
};

const markers = evaluateCurrentVmRules(testReport);
console.log(markers); // Should include 'no-hdd' marker
```

## Future Enhancements

1. **Cross-Node Rules**: Add rules that require multiple nodes (e.g., RAM comparison needs host info)
2. **Rule Categories**: Group rules by category for filtering/toggling
3. **Rule Priorities**: Allow rules to specify priority for badge ordering
4. **Async Rules**: Support async rules that fetch external data (e.g., kext database)
5. **Rule Explanations**: Expand tooltips with KB article links
