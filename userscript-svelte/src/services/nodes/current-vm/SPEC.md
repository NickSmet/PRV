# CurrentVm

## Purpose

Parses the `CurrentVm` XML node (`<ParallelsVirtualMachine>...</ParallelsVirtualMachine>`) and exposes the VM’s primary configuration.

## Input

- **Payload type**: XML fragment (often CDATA-wrapped).
- **Source**: `window.__prv_currentVmXml` (via `src/lib/reportLoader.ts`)

## Output

`parseCurrentVm(xml: string) => CurrentVmSummary | null`

### Disk fields (HDDs)

`CurrentVmSummary.hdds: VmDisk[]`

Each `VmDisk` contains:
- **location**: absolute host path to the disk (e.g. `/Users/.../VM.pvm/harddisk.hdd`)
- **virtualSize**: commonly a **numeric string in MB** (e.g. `"262144"`), but may be a human string in some reports
- **actualSize**: commonly a **numeric string in MB** (e.g. `"116376"`), but may be a human string in some reports
- **interfaceType**: either a numeric code (`"0".."3"`) or a string (e.g. `"NVMe"`)
- **trim**, **expanding**, **splitted**: `"0"` / `"1"` flags

### Display normalization (builder/UI layer)

Parsers intentionally preserve values as strings. The UI is responsible for human-friendly conversion:

- **Interface type mapping** (legacy parity):
  - `0` → `IDE`
  - `1` → `SCSI`
  - `2` → `SATA`
  - `3` → `NVMe`
- **Disk sizes**: when `virtualSize`/`actualSize` are numeric, treat them as **MB** and convert to human readable units (GiB/TiB).

Implementation: `src/lib/utils/units.ts` and `buildCurrentVmNode()` in `src/lib/nodeBuilder.ts`.

