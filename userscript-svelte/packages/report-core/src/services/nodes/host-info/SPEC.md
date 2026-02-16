# HostInfo

## Purpose

Parse `HostInfo.xml` (`<ParallelsHostInfo/>`) to expose host hardware + peripherals in a shape that’s easy to render and reason about in UI:
- System identity (OS/CPU/RAM) and quick diagnostics flags
- Storage inventory with partitions
- Network adapters with IPv4/IPv6 addresses
- USB inventory (including VF support)
- Audio I/O devices with lightweight classification
- HID input devices (filtered to reduce noise)
- Printers, cameras, smart card readers, bluetooth serial ports

This node is used for **host-side** troubleshooting context (not VM config).

## Input

- **Payload type**: XML fragment (often CDATA-wrapped)
- **Primary source (userscript)**: `window.__prv_hostInfoXml`
- **Primary source (web/MCP)**: resolved via `fetchNodePayload(..., 'HostInfo')` (Reportus attachment download)

## Output

`parseHostInfo(xmlData: string) => HostInfoSummary | null`

### `HostInfoSummary`

High-level structure:
- `system`: host identity + memory + privacy restrictions
- `hardDisks[]`: disks with partitions and flags (external/virtual/etc.)
- `networkAdapters[]`: adapters with multiple addresses (IPv4 + IPv6)
- `usbDevices[]`: devices with UUID decomposition + VF support
- `audio`: output + input devices, typed via heuristics
- `inputDevices[]`: HID devices with transport/vendor/product + role
- `bluetoothDevices[]`: extracted from `SerialPorts`
- `printers[]`, `cameras[]`, `smartCardReaders[]`
- `flags`: derived quick-scan booleans
- `hasDisplayLink`: best-effort (string scan)

## Heuristics & edge cases

### 0) CPU virtualization flags (HW Virt)

`<Cpu>` includes flags like:
- `HvtNptAvail`
- `HvtUnrestrictedAvail`

In the UI we surface this as a “hardware virtualization” indicator:
- **No HW Virt**: both flags are `0` (shown as a warning badge)
- When supported (`1`), we intentionally **don’t** badge it because it is typically the common case and adds noise.

Note: the exact meaning is implementation-specific to the report generator, but in practice it indicates whether the host reports the necessary hardware virtualization capabilities.

### 1) `Camera` tag collision

The XML contains both:
- `<Cameras><Camera .../></Cameras>` (device list)
- `<PrivacyRestrictions><Camera>1</Camera></PrivacyRestrictions>` (privacy flag)

Parsers must **scope selectors** to the correct container (`Cameras > Camera`) to avoid producing fake devices.

### 2) Network addresses

Adapters can have multiple `<NetAddress>` elements (e.g. link-local IPv6 + global IPv6 + IPv4).
Parse and store **separately**:
- `addresses.ipv4` + `addresses.ipv4Subnet`
- `addresses.ipv6` + `addresses.ipv6Prefix`

### 3) USB UUID parsing

USB `<Uuid>` is frequently a pipe-delimited string:
`location|vendorId|productId|speed|--|serial`

`speed` is already human-readable (`low|full|high|super|unknown`). Prefer it over the numeric `UsbType` enum (they don’t consistently match).

### 4) HID noise filtering

macOS often reports internal/noise HID endpoints with:
- empty name
- vendorId = 0 and productId = 0

Filter these out unless the record has a meaningful `name` or `vendorId > 0`.

### 5) Smart card readers container

`<SmartCardReaders dyn_lists="SmartCardReader 0"/>` can be present without children.
Emit `smartCardReaders: []` (not `[{}]`).

### 6) Memory accounting / “Other”

`<MemorySettings><AdvancedMemoryInfo>` provides (in MB):
- `FreeMemSize`
- `ActiveMemSize`
- `WireMemSize`
- `InactiveMemSize`

These do **not** necessarily sum to `HostRamSize`. The remaining portion is shown as **Other** in UI:

`Other = HostRamSize - (Active + Wired + Inactive + Free)`

This often represents cached/compressed/other categories not exposed explicitly in HostInfo.

### 7) “Low memory” indicator meaning

The UI “low memory” / “high memory usage” indicator is intentionally **not** based on `FreeMemSize` alone.

Instead it triggers when:

`(ActiveMemSize + WireMemSize) / HostRamSize >= 0.85`

Rationale: `Inactive` and the computed `Other` portion are often reclaimable quickly; very low “free” alone is common on macOS and not always actionable.
