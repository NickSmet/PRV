# HostInfo: Parsing Gap Analysis & Ideal Data Shape

## What the XML has vs. what we're currently extracting

### Completely missing from current parsing

| XML Section | Data Available | Support Value |
|---|---|---|
| **`<Cpu>`** | Model (Apple M4 Pro), cores (14), speed (4319 MHz), type, HVT support | **Critical** — first thing support checks |
| **`<MemorySettings>`** | Host RAM (24 GB), max VM RAM, recommended max, plus live breakdown: free/wired/inactive/active/virtual/resident | **Critical** — memory pressure is top diagnostic |
| **`<OsVersion>`** | macOS 15.7.3 (24G419), architecture (64-bit) | **Critical** — compatibility depends on this |
| **`<SoundDevices>`** | 6 output devices (speakers, monitor, Bluetooth, Teams virtual), 7 input devices (webcam mic, built-in mic, iPhone, Bluetooth, Teams virtual) | **High** — audio issues are common support cases |
| **`<SerialPorts>`** | Bluetooth devices (Beats Fit Pro), debug console | **Medium** — reveals Bluetooth peripherals |
| **`<PrivacyRestrictions>`** | Camera access (1=granted), Microphone access (1=granted) | **High** — "why can't my VM see the camera?" is a frequent question |
| **`<HostNotebookFlag>`** | Is this a laptop? (1=yes) | **Medium** — affects power/thermal advice |
| **`HardwareUuid`** | Host hardware UUID | **Low** — but useful for correlation |

### Partially parsed (data exists but we're dropping fields)

| Current Field | What we're missing from XML |
|---|---|
| **`hardDisks`** | Partitions (names, sizes, types, free space), `LogicalSectorSize`, `Removable`, `External`, `IsVirtualDisk`, `IsVirtualDevice`, `ParentStoreName`, `PartitionScheme` |
| **`networkAdapters`** | **IPv4 address** (192.168.1.148/255.255.255.0) — there are TWO `<NetAddress>` nodes and we only grab one! Also: `Enabled`, `ConfigureWithDhcp`, `VLANTag`, adapter `Type` |
| **`usbDevices`** | `DeviceState`, `UsbType` (2=high-speed, 11=full-speed), `SupportedByVirtualizationFramework` — the UUID is a pipe-delimited string that should be decomposed |
| **`inputDevices` (HIDDevices)** | `Transport` (USB/Bluetooth LE/FIFO), `VendorID`, `ProductID`, `IsMouse`, `IsKeyboard`, `IsGameController` — currently just name+uuid |
| **`printers`** | `Default` flag |
| **`cameras`** | Currently parsing as `[{}]` — empty. The XML section exists but is empty in this sample; parser should handle it properly (empty array, not array of empty objects) |
| **`ccids` (SmartCardReaders)** | Same — `[{}]` should be `[]` |

### Key bugs in current parsing
1. **IPv4 address dropped** — the adapter has two `<NetAddress>` nodes (IPv6 and IPv4). Current code grabs only one and stuffs both into a single `ip` string field
2. **Cameras/CCIDs** — `[{}]` instead of `[]` when section is empty
3. **Nameless HID devices** — entries with uuid "0", "2", "5" are generic system HID endpoints with no name, no transport, no vendor — these are noise and should be filtered
4. **USB UUID not decomposed** — `"111000|046d|c52b|full|--|Empty"` contains: location, vendorID (hex), productID (hex), speed, and serial number — all useful, all buried in a string

---

## Ideal parsed data shape

```typescript
interface HostInfo {
  // ── System identity (NEW) ──────────────────────────────────────
  system: {
    hardwareUuid: string;
    isNotebook: boolean;
    os: {
      name: string;            // "macOS"
      version: string;         // "15.7.3"
      build: string;           // "24G419"
      displayString: string;   // "macOS 15.7.3 (24G419)"
      architecture: number;    // 64
    };
    cpu: {
      model: string;           // "Apple M4 Pro"
      cores: number;           // 14
      speedMhz: number;        // 4319
      hvtSupported: boolean;   // hypervisor support
    };
    memory: {
      hostRamMb: number;       // 24576
      hostRamGb: number;       // 24 (convenience)
      maxVmMemoryMb: number;   // 24576
      recommendedMaxMb: number;// 20388
      live: {                  // from AdvancedMemoryInfo
        freeMb: number;        // 137
        wiredMb: number;       // 3452
        inactiveMb: number;    // 4560
        activeMb: number;      // 4521
      } | null;
    };
    privacy: {
      cameraAllowed: boolean;
      microphoneAllowed: boolean;
    };
  };

  // ── Storage ────────────────────────────────────────────────────
  hardDisks: Array<{
    name: string;              // "APPLE SSD AP1024Z Media (disk0)"
    identifier: string;        // "disk0"
    sizeBytes: number;
    sizeFormatted: string;     // "931.84 GB"
    logicalSectorSize: number; // 4096
    removable: boolean;
    external: boolean;
    isVirtualDisk: boolean;
    parentStore: string | null;// "disk0s2" for synthesized APFS containers
    partitionScheme: "GPT" | "APFS" | "MBR" | "unknown";
    partitions: Array<{
      name: string;            // "Macintosh HD", "Data", "VM"
      systemName: string;      // "/dev/disk3s1"
      sizeBytes: number;
      freeSizeBytes: number;   // -1 means unavailable
      typeName: string;        // "APFS Internal", "Apple APFS"
      gptType: string;
    }>;
  }>;

  // ── Network ────────────────────────────────────────────────────
  networkAdapters: Array<{
    name: string;              // "Wi-Fi"
    identifier: string;        // "en0"
    type: "ethernet" | "wifi" | "other";
    enabled: boolean;
    mac: string;
    addresses: {
      ipv4: string | null;     // "192.168.1.148"
      ipv4Subnet: string | null;// "255.255.255.0"
      ipv6: string | null;     // "fe80::14aa:..."
      ipv6Prefix: string | null;
    };
    dhcp: boolean;
    dhcpv6: boolean;
    vlanTag: number | null;    // 65535 = none
  }>;

  // ── USB ────────────────────────────────────────────────────────
  usbDevices: Array<{
    name: string;              // "C922 Pro Stream Webcam"
    location: string;          // "114000"
    vendorId: string;          // "046d" (hex)
    productId: string;         // "085c" (hex)
    speed: "low" | "full" | "high" | "super" | "unknown";
    serial: string | null;     // "5D9DE8BF" or null if "Empty"
    state: "connected" | "disconnected" | "in-use";
    vfSupported: boolean;      // SupportedByVirtualizationFramework
  }>;

  // ── Audio (NEW) ────────────────────────────────────────────────
  audio: {
    outputs: Array<{
      name: string;            // "MacBook Pro Speakers"
      id: string;              // raw UUID
      type: "builtin" | "monitor" | "bluetooth" | "virtual" | "mute" | "other";
    }>;
    inputs: Array<{
      name: string;            // "MacBook Pro Microphone"
      id: string;
      type: "builtin" | "usb" | "bluetooth" | "virtual" | "continuity" | "mute" | "other";
    }>;
  };

  // ── Input devices (HID) ────────────────────────────────────────
  inputDevices: Array<{
    name: string;              // "MX Master 3"
    identifier: string;
    transport: "USB" | "Bluetooth" | "Bluetooth Low Energy" | "FIFO" | "unknown";
    vendorId: number;
    productId: number;
    isMouse: boolean;
    isKeyboard: boolean;
    isGameController: boolean;
    role: "keyboard" | "mouse" | "combo" | "gamepad" | "unknown";
  }>;
  // NOTE: filter out entries with no name AND vendorId=0 (generic system HID endpoints)

  // ── Bluetooth (extracted from SerialPorts) (NEW) ────────────────
  bluetoothDevices: Array<{
    name: string;              // "BeatsFitPro"
    port: string;              // "/dev/cu.BeatsFitPro"
  }>;

  // ── Printers ───────────────────────────────────────────────────
  printers: Array<{
    name: string;
    isDefault: boolean;
  }>;

  // ── Cameras ────────────────────────────────────────────────────
  cameras: Array<{
    name: string;
  }>;
  // Empty array when none — NOT [{}]

  // ── Smart Card Readers ─────────────────────────────────────────
  smartCardReaders: Array<{
    name: string;
  }>;
  // Empty array when none — NOT [{}]

  // ── Flags for quick-scan ───────────────────────────────────────
  flags: {
    hasExternalDisks: boolean;
    hasBluetoothAudio: boolean;
    hasUsbCamera: boolean;
    privacyRestricted: boolean; // camera OR mic blocked
    lowMemory: boolean;         // free < 500MB
    isNotebook: boolean;
  };
}
```

---

## Audio device type classification heuristics

| Signal in UUID/name | Type |
|---|---|
| `BuiltInSpeakerDevice` or `BuiltInMicrophoneDevice` | `builtin` |
| UUID contains Bluetooth MAC pattern (`XX-XX-XX-XX-XX-XX`) | `bluetooth` |
| Name contains "Teams", "Zoom", "Loopback" or UUID contains `Loopback` | `virtual` |
| UUID contains `AppleUSBAudioEngine` | `usb` |
| UUID ends with `_out` and matches a known display name | `monitor` |
| Name is "Mute" or UUID contains `Null` | `mute` |
| UUID contains iPhone/iPad identifiers | `continuity` |
| Everything else | `other` |

## USB speed mapping

The `UsbType` field in XML maps to:
| UsbType | Speed |
|---|---|
| 1 | low (1.5 Mbps) |
| 2 | full (12 Mbps) — NOTE: confusing name, this is USB 1.1 |
| 11 | high (480 Mbps) — USB 2.0 |
| 12 | super (5 Gbps) — USB 3.0 |

Wait — looking again at the data, the USB Receiver has `UsbType=11` and UUID says `full`, while the webcam has `UsbType=2` and UUID says `high`. The UUID pipe string and the XML `UsbType` field use **different numbering**. The UUID string is human-readable (`full`/`high`/`low`/`super`), the XML field is an enum. **Use the UUID string for speed** — it's clearer and already parsed as text.

## USB UUID decomposition

`"111000|046d|c52b|full|--|Empty"` breaks down as:

| Position | Field | Value | Notes |
|---|---|---|---|
| 0 | Location ID | `111000` | USB bus tree location |
| 1 | Vendor ID | `046d` | Hex — Logitech in this case |
| 2 | Product ID | `c52b` | Hex — Unifying Receiver |
| 3 | Speed | `full` | USB speed class |
| 4 | (reserved) | `--` | Always `--` |
| 5 | Serial | `Empty` | Serial number or "Empty" |

## HID device filtering

Current parsing includes entries with UUID "0", "2", "5" that have:
- No name
- VendorID = 0, ProductID = 0
- No transport
- All capability flags false

These are macOS internal HID system endpoints. **Filter them out** — only include devices where `name` is non-empty OR `vendorId > 0`.

## Network adapter address parsing

The XML has:
```xml
<NetAddress>fe80::14aa:7567:874d:ad03%en0/ffff:ffff:ffff:ffff::</NetAddress>
<NetAddress>192.168.1.148/255.255.255.0</NetAddress>
```

Current code grabs only one and concatenates. Parse each `<NetAddress>`:
- If contains `:` → IPv6: split on `/` for address and prefix
- If matches `\d+\.\d+\.\d+\.\d+` → IPv4: split on `/` for address and subnet mask

## Partition scheme mapping

| XML value | Meaning |
|---|---|
| 1 | GPT |
| 2 | MBR |
| 3 | APFS Container (synthesized disk) |