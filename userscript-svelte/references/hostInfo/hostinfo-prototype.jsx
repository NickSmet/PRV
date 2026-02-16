import { useState } from "react";

// ─── Shared primitives ───────────────────────────────────────────────────────

function Chevron({ open }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none"
      style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 150ms ease", flexShrink: 0 }}>
      <path d="M6 4l4 4-4 4" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Badge({ children, variant = "default" }) {
  const styles = {
    default: { background: "#F1F5F9", color: "#475569", border: "1px solid #E2E8F0" },
    green: { background: "#ECFDF5", color: "#059669", border: "1px solid #A7F3D0" },
    blue: { background: "#EFF6FF", color: "#2563EB", border: "1px solid #BFDBFE" },
    purple: { background: "#EDE9FE", color: "#6D28D9", border: "1px solid #DDD6FE" },
    amber: { background: "#FEF3C7", color: "#D97706", border: "1px solid #FDE68A" },
    red: { background: "#FEE2E2", color: "#DC2626", border: "1px solid #FECACA" },
    dim: { background: "#F8FAFC", color: "#94A3B8", border: "1px solid #E2E8F0" },
  };
  const s = styles[variant] || styles.default;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", padding: "1px 7px", borderRadius: "4px",
      fontSize: "10.5px", fontWeight: 600, fontFamily: "'SF Mono', Consolas, monospace",
      letterSpacing: "0.02em", whiteSpace: "nowrap", ...s,
    }}>{children}</span>
  );
}

function Mono({ children, dim = false, size = "12.5px" }) {
  return <span style={{ fontFamily: "'SF Mono', Consolas, monospace", fontSize: size, color: dim ? "#94A3B8" : "#334155", fontWeight: 500 }}>{children}</span>;
}

function SectionHeader({ icon, title, count, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "20px 0 10px 0" }}>
      {icon && <span style={{ fontSize: "14px" }}>{icon}</span>}
      <span style={{ fontSize: "10.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#94A3B8", whiteSpace: "nowrap" }}>{title}</span>
      {count != null && <Badge variant="dim">{count}</Badge>}
      {children}
      <div style={{ flex: 1, height: "1px", background: "#E2E8F0" }} />
    </div>
  );
}

function KV({ label, children, mono = true }) {
  return (
    <>
      <span style={{ color: "#94A3B8", fontWeight: 500, fontSize: "12px" }}>{label}</span>
      {mono ? <Mono size="11.5px">{children}</Mono> : <span style={{ fontSize: "12px", color: "#334155" }}>{children}</span>}
    </>
  );
}

function Card({ children, style: extraStyle }) {
  return (
    <div style={{ border: "1px solid #E2E8F0", borderRadius: "8px", background: "#fff", marginBottom: "8px", overflow: "hidden", ...extraStyle }}>
      {children}
    </div>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const data = {
  system: {
    hardwareUuid: "{cbe88f32-7dbe-5852-a3af-d089924c3ad9}",
    isNotebook: true,
    os: { name: "macOS", version: "15.7.3", build: "24G419", displayString: "macOS 15.7.3 (24G419)", architecture: 64 },
    cpu: { model: "Apple M4 Pro", cores: 14, speedMhz: 4319, hvtSupported: true },
    memory: {
      hostRamGb: 24,
      hostRamMb: 24576,
      maxVmMemoryMb: 24576,
      recommendedMaxMb: 20388,
      live: { freeMb: 137, wiredMb: 3452, inactiveMb: 4560, activeMb: 4521 },
    },
    privacy: { cameraAllowed: true, microphoneAllowed: true },
  },
  hardDisks: [
    { name: "APPLE SSD AP1024Z Media", identifier: "disk0", sizeFormatted: "931.84 GB", sizeBytes: 1000555581440, external: false, removable: false, isVirtualDisk: false, parentStore: null, partitionScheme: "GPT",
      partitions: [
        { name: "iBootSystemContainer", systemName: "/dev/disk0s1", sizeBytes: 524288000, typeName: "" },
        { name: "Container", systemName: "/dev/disk0s2", sizeBytes: 994662584320, typeName: "Apple APFS" },
        { name: "RecoveryOSContainer", systemName: "/dev/disk0s3", sizeBytes: 5368664064, typeName: "" },
      ],
    },
    { name: "AppleAPFSMedia", identifier: "disk3", sizeFormatted: "926.35 GB", sizeBytes: 994662584320, external: false, removable: false, isVirtualDisk: true, parentStore: "disk0s2", partitionScheme: "APFS",
      partitions: [
        { name: "Macintosh HD", systemName: "/dev/disk3s1", sizeBytes: 994662584320, freeSizeBytes: 533696765952, typeName: "APFS Internal" },
        { name: "Data", systemName: "/dev/disk3s5", sizeBytes: 994662584320, freeSizeBytes: 533696765952, typeName: "APFS Internal" },
        { name: "VM", systemName: "/dev/disk3s6", sizeBytes: 994662584320, freeSizeBytes: 533696765952, typeName: "APFS Internal" },
        { name: "Preboot", systemName: "/dev/disk3s2", sizeBytes: 994662584320, freeSizeBytes: 533696765952, typeName: "APFS Internal" },
        { name: "Update", systemName: "/dev/disk3s4", sizeBytes: 994662584320, freeSizeBytes: 533696765952, typeName: "APFS Internal" },
        { name: "Recovery", systemName: "/dev/disk3s3", sizeBytes: 994662584320, freeSizeBytes: -1, typeName: "APFS Internal" },
      ],
    },
  ],
  networkAdapters: [
    { name: "Wi-Fi", identifier: "en0", type: "wifi", enabled: true, mac: "C6:35:D9:C0:55:10",
      addresses: { ipv4: "192.168.1.148", ipv4Subnet: "255.255.255.0", ipv6: "fe80::14aa:7567:874d:ad03", ipv6Prefix: "ffff:ffff:ffff:ffff::" },
      dhcp: false, dhcpv6: false },
  ],
  usbDevices: [
    { name: "USB Receiver", location: "111000", vendorId: "046d", productId: "c52b", speed: "full", serial: null, vfSupported: true },
    { name: "C922 Pro Stream Webcam", location: "114000", vendorId: "046d", productId: "085c", speed: "high", serial: "5D9DE8BF", vfSupported: false },
    { name: "Razer BlackWidow Tournament Edition Chroma", location: "112000", vendorId: "1532", productId: "0209", speed: "full", serial: null, vfSupported: true },
    { name: "Razer Chroma Mouse Charging Dock", location: "113200", vendorId: "1532", productId: "007e", speed: "full", serial: null, vfSupported: true },
    { name: "Razer Viper Ultimate Dongle", location: "113100", vendorId: "1532", productId: "007b", speed: "full", serial: null, vfSupported: true },
  ],
  audio: {
    outputs: [
      { name: "34GL750", type: "monitor" },
      { name: "MacBook Pro Speakers", type: "builtin" },
      { name: "Beats Fit Pro", type: "bluetooth" },
      { name: "Microsoft Teams Audio", type: "virtual" },
    ],
    inputs: [
      { name: "C922 Pro Stream Webcam", type: "usb" },
      { name: "MacBook Pro Microphone", type: "builtin" },
      { name: "Breno's iPhone Microphone", type: "continuity" },
      { name: "Beats Fit Pro", type: "bluetooth" },
      { name: "Microsoft Teams Audio", type: "virtual" },
    ],
  },
  inputDevices: [
    { name: "Apple Internal Keyboard / Trackpad", identifier: "6a", transport: "FIFO", vendorId: 0, productId: 0, isMouse: true, isKeyboard: true, isGameController: false, role: "combo" },
    { name: "USB Receiver", identifier: "111000", transport: "USB", vendorId: 1133, productId: 50475, isMouse: true, isKeyboard: true, isGameController: false, role: "combo" },
    { name: "Razer BlackWidow Tournament Edition Chroma", identifier: "112000", transport: "USB", vendorId: 5426, productId: 521, isMouse: false, isKeyboard: true, isGameController: false, role: "keyboard" },
    { name: "Razer Viper Ultimate Dongle", identifier: "113100", transport: "USB", vendorId: 5426, productId: 123, isMouse: true, isKeyboard: false, isGameController: false, role: "mouse" },
    { name: "Razer Chroma Mouse Charging Dock", identifier: "113200", transport: "USB", vendorId: 5426, productId: 126, isMouse: true, isKeyboard: false, isGameController: false, role: "mouse" },
    { name: "MX Master 3", identifier: "114ed026", transport: "Bluetooth Low Energy", vendorId: 1133, productId: 45091, isMouse: true, isKeyboard: true, isGameController: false, role: "mouse" },
  ],
  bluetoothDevices: [
    { name: "Beats Fit Pro", port: "/dev/cu.BeatsFitPro" },
  ],
  printers: [{ name: "Default printer", isDefault: true }],
  cameras: [],
  smartCardReaders: [],
  flags: { hasExternalDisks: false, hasBluetoothAudio: true, hasUsbCamera: true, privacyRestricted: false, lowMemory: true, isNotebook: true },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtBytes(b) {
  if (b >= 1e12) return `${(b / 1e12).toFixed(1)} TB`;
  if (b >= 1e9) return `${(b / 1e9).toFixed(1)} GB`;
  if (b >= 1e6) return `${(b / 1e6).toFixed(0)} MB`;
  return `${b} B`;
}

function fmtMb(mb) {
  if (mb >= 1024) return `${(mb / 1024).toFixed(0)} GB`;
  return `${mb} MB`;
}

const roleIcon = { keyboard: "⌨️", mouse: "🖱", combo: "🎛", gamepad: "🎮", unknown: "📟" };
const transportBadge = { USB: "default", "Bluetooth Low Energy": "blue", Bluetooth: "blue", FIFO: "dim", unknown: "dim" };
const audioIcon = { builtin: "🔈", monitor: "🖥", bluetooth: "🎧", virtual: "💬", usb: "🎙", continuity: "📱", mute: "🔇", other: "🔊" };

function speedBadge(s) {
  const m = { low: { label: "1.5 Mbps", v: "dim" }, full: { label: "12 Mbps", v: "default" }, high: { label: "480 Mbps", v: "blue" }, super: { label: "5 Gbps", v: "purple" } };
  const info = m[s] || { label: s, v: "dim" };
  return <Badge variant={info.v}>{info.label}</Badge>;
}

// ─── System Identity Banner ───────────────────────────────────────────────────

function SystemBanner({ sys }) {
  const mem = sys.memory;
  const live = mem.live;
  const usedMb = live ? mem.hostRamMb - live.freeMb - live.inactiveMb : null;
  const usedPct = usedMb ? Math.round((usedMb / mem.hostRamMb) * 100) : null;

  const memSegments = live ? [
    { label: "Active", mb: live.activeMb, color: "#3B82F6" },
    { label: "Wired", mb: live.wiredMb, color: "#6366F1" },
    { label: "Inactive", mb: live.inactiveMb, color: "#CBD5E1" },
  ] : [];
  const freeMb = live ? live.freeMb : null;

  return (
    <Card>
      {/* Top bar: identity */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 14px", flexWrap: "wrap" }}>
        <span style={{ fontSize: "18px" }}>{sys.isNotebook ? "💻" : "🖥"}</span>
        <span style={{ fontWeight: 700, fontSize: "15px", color: "#0F172A" }}>{sys.cpu.model}</span>
        <Badge>{sys.cpu.cores} cores</Badge>
        <Badge>{fmtMb(mem.hostRamMb)} RAM</Badge>
        <Badge variant="green">{sys.os.displayString}</Badge>
      </div>

      {/* Memory bar */}
      {live && (
        <div style={{ padding: "0 14px 12px 14px" }}>
          <div style={{ display: "flex", height: "10px", borderRadius: "5px", overflow: "hidden", background: "#F1F5F9", border: "1px solid #E2E8F0" }}>
            {memSegments.map(seg => (
              <div key={seg.label} style={{ width: `${(seg.mb / mem.hostRamMb) * 100}%`, background: seg.color, transition: "width 300ms ease" }} title={`${seg.label}: ${fmtMb(seg.mb)}`} />
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", fontSize: "11px", color: "#64748B", fontFamily: "monospace" }}>
            <div style={{ display: "flex", gap: "10px" }}>
              {memSegments.filter(s => s.label !== "Inactive").map(s => (
                <span key={s.label} style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                  <span style={{ width: 7, height: 7, borderRadius: 2, background: s.color, display: "inline-block" }} />
                  {s.label} {fmtMb(s.mb)}
                </span>
              ))}
            </div>
            <span><strong style={{ color: live.freeMb < 500 ? "#EF4444" : "#334155" }}>{fmtMb(live.freeMb)}</strong> free</span>
          </div>
        </div>
      )}

      {/* Privacy alerts */}
      {(!sys.privacy.cameraAllowed || !sys.privacy.microphoneAllowed) && (
        <div style={{ borderTop: "1px solid #FDE68A", background: "#FFFBEB", padding: "8px 14px", fontSize: "12px", color: "#D97706", fontWeight: 500 }}>
          ⚠ Privacy restricted: {!sys.privacy.cameraAllowed && "Camera blocked"}{!sys.privacy.cameraAllowed && !sys.privacy.microphoneAllowed && " · "}{!sys.privacy.microphoneAllowed && "Microphone blocked"}
        </div>
      )}
    </Card>
  );
}

// ─── Disk Cards ───────────────────────────────────────────────────────────────

function DiskCard({ disk }) {
  const [open, setOpen] = useState(false);
  return (
    <Card>
      <div onClick={() => setOpen(!open)} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", cursor: "pointer", userSelect: "none" }}>
        <Chevron open={open} />
        <span style={{ fontSize: "14px" }}>💾</span>
        <span style={{ fontWeight: 600, fontSize: "13px", color: "#0F172A" }}>{disk.name}</span>
        <Badge>{disk.partitionScheme}</Badge>
        {disk.external && <Badge variant="amber">External</Badge>}
        {disk.isVirtualDisk && <Badge variant="purple">Container</Badge>}
        <span style={{ marginLeft: "auto" }}><Mono>{disk.sizeFormatted}</Mono></span>
      </div>
      {open && (
        <div style={{ borderTop: "1px solid #F1F5F9", background: "#FAFBFC" }}>
          {disk.parentStore && (
            <div style={{ padding: "6px 14px", fontSize: "11px", color: "#94A3B8", fontFamily: "monospace" }}>
              Backed by /dev/{disk.parentStore}
            </div>
          )}
          <div style={{ padding: "4px 14px 10px 14px" }}>
            {disk.partitions.map((p, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "5px 0", borderBottom: "1px solid #F1F5F9", fontSize: "12px" }}>
                <Mono size="11px" dim>{p.systemName.split("/").pop()}</Mono>
                <span style={{ fontWeight: 500, color: "#334155" }}>{p.name}</span>
                {p.typeName && <Badge variant="dim">{p.typeName}</Badge>}
                <span style={{ marginLeft: "auto" }}><Mono size="11px">{fmtBytes(p.sizeBytes)}</Mono></span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

// ─── Network Adapter Card ─────────────────────────────────────────────────────

function NetworkCard({ adapter }) {
  const [open, setOpen] = useState(false);
  const a = adapter.addresses;
  return (
    <Card>
      <div onClick={() => setOpen(!open)} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", cursor: "pointer", userSelect: "none" }}>
        <Chevron open={open} />
        <span style={{ fontSize: "14px" }}>{adapter.type === "wifi" ? "📶" : "🔌"}</span>
        <span style={{ fontWeight: 600, fontSize: "13px", color: "#0F172A" }}>{adapter.name}</span>
        <Badge variant={adapter.enabled ? "green" : "red"}>{adapter.enabled ? "Active" : "Down"}</Badge>
        <span style={{ marginLeft: "auto" }}><Mono>{a.ipv4 || "No IPv4"}</Mono></span>
      </div>
      {open && (
        <div style={{ borderTop: "1px solid #F1F5F9", padding: "10px 14px 12px", background: "#FAFBFC", display: "grid", gridTemplateColumns: "70px 1fr", gap: "4px 12px", fontSize: "12px" }}>
          <KV label="MAC">{adapter.mac}</KV>
          {a.ipv4 && <KV label="IPv4">{a.ipv4}/{a.ipv4Subnet}</KV>}
          {a.ipv6 && <KV label="IPv6"><span style={{ fontSize: "11px", wordBreak: "break-all" }}>{a.ipv6}</span></KV>}
          <KV label="DHCP">{adapter.dhcp ? "Enabled" : "Static"}</KV>
          <KV label="Interface">{adapter.identifier}</KV>
        </div>
      )}
    </Card>
  );
}

// ─── USB Device Card ──────────────────────────────────────────────────────────

function UsbCard({ device }) {
  const [open, setOpen] = useState(false);
  return (
    <Card>
      <div onClick={() => setOpen(!open)} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", cursor: "pointer", userSelect: "none" }}>
        <Chevron open={open} />
        <span style={{ fontSize: "13px" }}>🔌</span>
        <span style={{ fontWeight: 600, fontSize: "13px", color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{device.name}</span>
        {speedBadge(device.speed)}
        {device.vfSupported && <Badge variant="green">VF</Badge>}
      </div>
      {open && (
        <div style={{ borderTop: "1px solid #F1F5F9", padding: "10px 14px 12px", background: "#FAFBFC", display: "grid", gridTemplateColumns: "70px 1fr", gap: "4px 12px", fontSize: "12px" }}>
          <KV label="Vendor">{device.vendorId}</KV>
          <KV label="Product">{device.productId}</KV>
          <KV label="Location">{device.location}</KV>
          <KV label="Serial">{device.serial || "—"}</KV>
        </div>
      )}
    </Card>
  );
}

// ─── Audio Section ────────────────────────────────────────────────────────────

function AudioRow({ device, direction }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 0", borderBottom: "1px solid #F1F5F9", fontSize: "13px" }}>
      <span style={{ fontSize: "13px" }}>{audioIcon[device.type] || "🔊"}</span>
      <span style={{ fontWeight: 500, color: "#0F172A" }}>{device.name}</span>
      <Badge variant={device.type === "builtin" ? "default" : device.type === "bluetooth" ? "blue" : device.type === "virtual" ? "purple" : device.type === "continuity" ? "amber" : "default"}>
        {device.type}
      </Badge>
    </div>
  );
}

// ─── Input Device Card ────────────────────────────────────────────────────────

function InputDeviceRow({ device }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "7px 0", borderBottom: "1px solid #F1F5F9", fontSize: "13px" }}>
      <span style={{ fontSize: "13px" }}>{roleIcon[device.role] || "📟"}</span>
      <span style={{ fontWeight: 500, color: "#0F172A" }}>{device.name}</span>
      <Badge variant={transportBadge[device.transport] || "dim"}>{device.transport}</Badge>
      {device.isKeyboard && device.isMouse && device.role === "combo" ? null : (
        <>
          {device.isKeyboard && <Badge variant="dim">KB</Badge>}
          {device.isMouse && <Badge variant="dim">Mouse</Badge>}
        </>
      )}
    </div>
  );
}

// ─── Simple list cards for printers / bluetooth / cameras ─────────────────────

function SimpleListCard({ items, emptyText, renderItem }) {
  if (!items || items.length === 0) {
    return <div style={{ fontSize: "12px", color: "#94A3B8", padding: "0 2px" }}>{emptyText}</div>;
  }
  return (
    <Card>
      <div style={{ padding: "6px 14px" }}>
        {items.map((item, i) => renderItem(item, i))}
      </div>
    </Card>
  );
}

// ─── Flags Summary ────────────────────────────────────────────────────────────

function FlagsSummary({ flags }) {
  const items = [];
  if (flags.lowMemory) items.push({ text: "Low free memory (< 500 MB)", variant: "red" });
  if (flags.privacyRestricted) items.push({ text: "Privacy restrictions active", variant: "amber" });
  if (flags.hasExternalDisks) items.push({ text: "External disk connected", variant: "blue" });
  if (items.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "12px" }}>
      {items.map((item, i) => (
        <div key={i} style={{
          padding: "8px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 500, display: "flex", alignItems: "center", gap: "8px",
          background: item.variant === "red" ? "#FEF2F2" : item.variant === "amber" ? "#FFFBEB" : "#EFF6FF",
          border: `1px solid ${item.variant === "red" ? "#FECACA" : item.variant === "amber" ? "#FDE68A" : "#BFDBFE"}`,
          color: item.variant === "red" ? "#DC2626" : item.variant === "amber" ? "#D97706" : "#2563EB",
        }}>
          <span>⚠</span> {item.text}
        </div>
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function HostInfoPanel() {
  const { system: sys } = data;

  return (
    <div style={{
      maxWidth: "660px", margin: "0 auto", padding: "24px",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
      color: "#0F172A", background: "#F8FAFC", minHeight: "100vh",
    }}>
      <div style={{ marginBottom: "8px" }}>
        <h2 style={{ margin: 0, fontSize: "17px", fontWeight: 700 }}>Host Information</h2>
        <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#94A3B8" }}>
          Hardware, peripherals & system configuration
        </p>
      </div>

      <FlagsSummary flags={data.flags} />

      {/* System banner */}
      <SystemBanner sys={sys} />

      {/* Hard Disks */}
      <SectionHeader icon="💾" title="Storage" count={data.hardDisks.length} />
      {data.hardDisks.map((d, i) => <DiskCard key={i} disk={d} />)}

      {/* Network */}
      <SectionHeader icon="📶" title="Network Adapters" count={data.networkAdapters.length} />
      {data.networkAdapters.map((a, i) => <NetworkCard key={i} adapter={a} />)}

      {/* USB */}
      <SectionHeader icon="🔌" title="USB Devices" count={data.usbDevices.length} />
      {data.usbDevices.map((d, i) => <UsbCard key={i} device={d} />)}

      {/* Audio */}
      <SectionHeader icon="🔊" title="Audio" count={data.audio.outputs.length + data.audio.inputs.length}>
        <Badge variant="dim">{data.audio.outputs.length} out</Badge>
        <Badge variant="dim">{data.audio.inputs.length} in</Badge>
      </SectionHeader>
      <Card>
        <div style={{ padding: "6px 14px" }}>
          <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#94A3B8", margin: "4px 0" }}>Output</div>
          {data.audio.outputs.map((d, i) => <AudioRow key={`o${i}`} device={d} direction="out" />)}
          <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#94A3B8", margin: "10px 0 4px" }}>Input</div>
          {data.audio.inputs.map((d, i) => <AudioRow key={`i${i}`} device={d} direction="in" />)}
        </div>
      </Card>

      {/* Input Devices */}
      <SectionHeader icon="🎛" title="Input Devices" count={data.inputDevices.length} />
      <Card>
        <div style={{ padding: "6px 14px" }}>
          {data.inputDevices.map((d, i) => <InputDeviceRow key={i} device={d} />)}
        </div>
      </Card>

      {/* Bluetooth */}
      {data.bluetoothDevices.length > 0 && (
        <>
          <SectionHeader icon="🎧" title="Bluetooth" count={data.bluetoothDevices.length} />
          <SimpleListCard items={data.bluetoothDevices} emptyText="None" renderItem={(d, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 0", borderBottom: "1px solid #F1F5F9", fontSize: "13px" }}>
              <span>🎧</span>
              <span style={{ fontWeight: 500 }}>{d.name}</span>
              <Mono dim size="11px">{d.port}</Mono>
            </div>
          )} />
        </>
      )}

      {/* Printers */}
      <SectionHeader icon="🖨" title="Printers" count={data.printers.length} />
      <SimpleListCard items={data.printers} emptyText="None detected" renderItem={(p, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 0", fontSize: "13px" }}>
          <span>🖨</span>
          <span style={{ fontWeight: 500 }}>{p.name}</span>
          {p.isDefault && <Badge variant="green">Default</Badge>}
        </div>
      )} />

      {/* Cameras */}
      <SectionHeader icon="📷" title="Cameras" count={data.cameras.length} />
      {data.cameras.length === 0
        ? <div style={{ fontSize: "12px", color: "#94A3B8" }}>No dedicated cameras detected (webcam available via USB)</div>
        : <SimpleListCard items={data.cameras} emptyText="" renderItem={(c, i) => (
            <div key={i} style={{ padding: "6px 0", fontSize: "13px" }}>{c.name}</div>
          )} />
      }
    </div>
  );
}