import { useState } from "react";

const mono = { fontFamily: "'SF Mono', Consolas, monospace" };
const sans = { fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" };

// ─── Tiny shared components ──────────────────────────────────────────────────

function Badge({ children, variant = "default" }) {
  const s = {
    default: { background: "#F1F5F9", color: "#475569", border: "1px solid #E2E8F0" },
    green: { background: "#ECFDF5", color: "#059669", border: "1px solid #A7F3D0" },
    blue: { background: "#EFF6FF", color: "#2563EB", border: "1px solid #BFDBFE" },
    purple: { background: "#F3E8FF", color: "#7C3AED", border: "1px solid #DDD6FE" },
    amber: { background: "#FEF3C7", color: "#D97706", border: "1px solid #FDE68A" },
    red: { background: "#FEE2E2", color: "#DC2626", border: "1px solid #FECACA" },
    dim: { background: "#F8FAFC", color: "#94A3B8", border: "1px solid #E2E8F0" },
    gold: { background: "#FEF9C3", color: "#A16207", border: "1px solid #FDE047" },
  }[variant] || { background: "#F1F5F9", color: "#475569", border: "1px solid #E2E8F0" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", padding: "0px 5px", height: "18px",
      borderRadius: "3px", fontSize: "10px", fontWeight: 600, ...mono,
      letterSpacing: "0.01em", whiteSpace: "nowrap", lineHeight: 1, ...s,
    }}>{children}</span>
  );
}

function Src({ children }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", padding: "0 4px", height: "16px",
      borderRadius: "2px", fontSize: "9px", ...mono, fontWeight: 500,
      color: "#A1A1AA", background: "transparent",
    }}>{children}</span>
  );
}

function Chev({ open }) {
  return (
    <svg width="10" height="10" viewBox="0 0 16 16" fill="none"
      style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 100ms", flexShrink: 0, opacity: 0.4 }}>
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Section group header (Host / PD / VMs) ──────────────────────────────────

function GroupHeader({ icon, title, badges, right, open, onClick }) {
  return (
    <div onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: "6px", padding: "7px 0",
      cursor: "pointer", userSelect: "none", borderBottom: "2px solid #E2E8F0",
      marginBottom: open ? "0" : "8px",
    }}>
      <Chev open={open} />
      <span style={{ fontSize: "14px", lineHeight: 1 }}>{icon}</span>
      <span style={{ fontSize: "14px", fontWeight: 700, color: "#0F172A", ...sans }}>{title}</span>
      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>{badges}</div>
      <div style={{ flex: 1 }} />
      {right && <span style={{ fontSize: "11px", color: "#94A3B8", ...mono }}>{right}</span>}
    </div>
  );
}

function Group({ icon, title, badges, right, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ marginBottom: "8px" }}>
      <GroupHeader icon={icon} title={title} badges={badges} right={right} open={open} onClick={() => setOpen(!open)} />
      {open && <div>{children}</div>}
    </div>
  );
}

// ─── Row: a single collapsible sub-section ───────────────────────────────────

function Row({ icon, title, badges, sources, defaultOpen = false, indent = 0, highlight, children }) {
  const [open, setOpen] = useState(defaultOpen);
  const hasContent = !!children;
  return (
    <div style={{ marginLeft: indent }}>
      <div
        onClick={hasContent ? () => setOpen(!open) : undefined}
        style={{
          display: "flex", alignItems: "center", gap: "6px",
          padding: "5px 4px 5px 8px", minHeight: "30px",
          cursor: hasContent ? "pointer" : "default", userSelect: "none",
          borderBottom: "1px solid #F1F5F9",
          background: highlight ? "#FFFBEB" : (open && hasContent ? "#FAFBFC" : "transparent"),
        }}
      >
        {hasContent ? <Chev open={open} /> : <span style={{ width: "10px" }} />}
        {icon && <span style={{ fontSize: "12px", lineHeight: 1, opacity: 0.7 }}>{icon}</span>}
        <span style={{ fontSize: "12.5px", fontWeight: 600, color: "#1E293B", ...sans }}>{title}</span>
        <div style={{ display: "flex", gap: "3px", flexWrap: "wrap", alignItems: "center" }}>{badges}</div>
        <div style={{ flex: 1 }} />
        {sources && (
          <div style={{ display: "flex", gap: "1px" }}>
            {sources.map((s, i) => <Src key={i}>{s}</Src>)}
          </div>
        )}
      </div>
      {open && hasContent && (
        <div style={{ padding: "6px 8px 8px 28px", borderBottom: "1px solid #F1F5F9", background: "#FAFBFC" }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ─── VM entry row ────────────────────────────────────────────────────────────

function VmRow({ name, isCurrent, badges, uuid, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{
      borderLeft: isCurrent ? "3px solid #3B82F6" : "3px solid transparent",
      marginBottom: "1px",
    }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: "flex", alignItems: "center", gap: "6px",
          padding: "6px 4px 6px 8px", minHeight: "32px",
          cursor: "pointer", userSelect: "none",
          borderBottom: "1px solid #E2E8F0",
          background: isCurrent ? "#F8FAFF" : "#fff",
        }}
      >
        <Chev open={open} />
        <span style={{ fontSize: "13px" }}>💻</span>
        <span style={{ fontSize: "13px", fontWeight: 700, color: "#0F172A", ...sans }}>{name}</span>
        {isCurrent && <Badge variant="gold">★ CURRENT</Badge>}
        <div style={{ display: "flex", gap: "3px", flexWrap: "wrap" }}>{badges}</div>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: "9.5px", color: "#B0B0B8", ...mono }}>{uuid}</span>
      </div>
      {open && (
        <div style={{ borderBottom: "1px solid #E2E8F0" }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Inline divider ──────────────────────────────────────────────────────────

function Divider({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px 8px 2px 18px" }}>
      <span style={{ fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#A1A1AA", whiteSpace: "nowrap" }}>{label}</span>
      <div style={{ flex: 1, height: "1px", background: "#E4E4E7" }} />
    </div>
  );
}

// ─── Placeholder for expanded content ────────────────────────────────────────

function Slot({ label, h = 36 }) {
  return (
    <div style={{
      border: "1px dashed #D4D4D8", borderRadius: "4px", background: "#FAFAFA",
      display: "flex", alignItems: "center", justifyContent: "center",
      height: h, color: "#A1A1AA", fontSize: "10px", ...mono, padding: "2px 8px", textAlign: "center",
    }}>{label}</div>
  );
}

// ─── Alert ───────────────────────────────────────────────────────────────────

function Alert({ children, variant = "amber" }) {
  const c = { amber: { bg: "#FFFBEB", border: "#FDE68A", color: "#92400E" }, red: { bg: "#FEF2F2", border: "#FECACA", color: "#991B1B" } }[variant];
  return (
    <div style={{ padding: "3px 8px", borderRadius: "3px", fontSize: "11px", fontWeight: 500, background: c.bg, border: `1px solid ${c.border}`, color: c.color }}>
      {children}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN
// ═════════════════════════════════════════════════════════════════════════════

export default function ReportDense() {
  return (
    <div style={{
      maxWidth: "860px", margin: "0 auto", padding: "12px 16px",
      ...sans, color: "#0F172A", background: "#fff", fontSize: "12.5px",
      lineHeight: 1.35,
    }}>

      {/* ── Report header ─────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "baseline", gap: "6px", flexWrap: "wrap", marginBottom: "2px" }}>
        <span style={{ fontSize: "15px", fontWeight: 800 }}>Report #512022712</span>
        <Badge variant="blue">UserDefinedOnRunningVmReport</Badge>
        <Badge>26.2.1-57371</Badge>
        <span style={{ fontSize: "11px", color: "#94A3B8", ...mono }}>2026-02-03 18:30:44</span>
        <span style={{ fontSize: "11px", color: "#94A3B8", ...mono }}>179.130.39.30</span>
      </div>
      <div style={{
        padding: "4px 8px", marginBottom: "12px", background: "#F8FAFC", borderRadius: "4px",
        border: "1px solid #F1F5F9", fontSize: "12px",
      }}>
        <span style={{ color: "#94A3B8", fontSize: "10px", fontWeight: 600, textTransform: "uppercase", marginRight: "6px" }}>User description</span>
        <a href="https://youtu.be/hY5VR0C8PM4" style={{ color: "#2563EB", ...mono, fontSize: "11.5px" }}>https://youtu.be/hY5VR0C8PM4</a>
      </div>

      {/* ══════════════════════════════════════════════════════════
          HOST
          ══════════════════════════════════════════════════════════ */}
      <Group
        icon="🍎"
        title="Host"
        badges={<>
          <Badge>macOS 15.7.3(24G419)</Badge>
          <Badge>24 GB RAM</Badge>
        </>}
        right="/ 4%"
      >
        {/* CPU bar — always visible, not collapsible */}
        <div style={{ padding: "4px 8px 6px 28px", borderBottom: "1px solid #F1F5F9" }}>
          <span style={{ fontSize: "10px", color: "#94A3B8", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.03em" }}>CPU</span>
          <div style={{ fontSize: "14px", fontWeight: 700, ...mono, color: "#0F172A" }}>Apple M4 Pro</div>
        </div>

        <Row icon="⚙" title="Hardware & OS" sources={["HostInfo", "MoreHostInfo"]}
          badges={<><Badge variant="dim">macOS 15.7.3</Badge><Badge variant="dim">24GB RAM</Badge></>}
        >
          <Slot label="CPU cores · RAM pressure bar · OS version · boot mode · privacy restrictions" h={48} />
          <Alert variant="red">⚠ Low free memory: 137 MB of 24 GB</Alert>
        </Row>

        <Row icon="🖥" title="GPU & Displays" sources={["MoreHostInfo"]}
          badges={<Badge variant="dim">2 displays</Badge>}
        >
          <Slot label="gpu-display-v2: GPU card + proportional display rectangles" h={48} />
        </Row>

        <Row icon="💾" title="Storage" sources={["MountInfo", "HostInfo"]}
          badges={<><Badge variant="dim">1 disk</Badge><Badge variant="green">497 GB free</Badge></>}
        >
          <Slot label="disk-viz: APFS containers, usage bars, network shares" h={48} />
        </Row>

        <Row icon="📶" title="Network Adapters" sources={["HostInfo"]}
          badges={<Badge variant="green">Wi-Fi · 192.168.1.148</Badge>}
        >
          <Slot label="Physical adapters: en0 Wi-Fi, IPv4/6, MAC, DHCP" h={40} />
        </Row>

        <Row icon="🔌" title="Peripherals" sources={["HostInfo"]}
          badges={<><Badge variant="dim">5 USB</Badge><Badge variant="dim">6 HID</Badge><Badge variant="dim">4+5 audio</Badge></>}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            <Slot label="USB · Audio · HID · Printers · Cameras · Bluetooth · SmartCard" h={32} />
          </div>
        </Row>

        <Row icon="🧩" title="Kernel Extensions" sources={["LoadedDrivers"]}
          badges={<Badge variant="green">Only Apple</Badge>}
        >
          <Slot label="Kext list, non-Apple, bad kexts, hackintosh, PRL kexts" h={36} />
        </Row>

        <Row icon="⚙" title="Running Processes" sources={["AllProcesses"]}
          badges={<><Badge variant="dim">287 procs</Badge><Badge variant="amber">3 heavy</Badge></>}
        >
          <Slot label="process-table: CPU/mem bars, classification, sort, filter" h={48} />
        </Row>

        <Row icon="🔄" title="Services (launchd)" sources={["LaunchdInfo"]}
          badges={<><Badge variant="dim">6 root-owned</Badge><Badge variant="dim">7 files</Badge></>}
        >
          <Slot label="launchd service tree, root-owned flags" h={40} />
        </Row>

        <Row icon="📦" title="Installed Software" sources={["InstalledSoftware"]}
          badges={<Badge variant="dim">31 apps</Badge>}
        >
          <Slot label="Searchable app list + versions" h={36} />
        </Row>

        <Row icon="📜" title="macOS Logs"
          badges={<Badge variant="dim">4 files</Badge>}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "2px", fontSize: "11px", ...mono, color: "#64748B" }}>
            <div>system.log <span style={{ color: "#A1A1AA" }}>· 7.6 KB</span></div>
            <div>dmesg.log <span style={{ color: "#A1A1AA" }}>· 128 KB</span></div>
            <div>install.log <span style={{ color: "#A1A1AA" }}>· 13.9 MB</span></div>
            <div>unified-system-lite.log <span style={{ color: "#A1A1AA" }}>· 16 MB</span></div>
          </div>
        </Row>
      </Group>

      {/* ══════════════════════════════════════════════════════════
          PARALLELS DESKTOP
          ══════════════════════════════════════════════════════════ */}
      <Group
        icon="▶️"
        title="Parallels Desktop"
        badges={<Badge variant="blue">26.2.1-57371</Badge>}
      >
        <Row icon="🔑" title="License" sources={["LicenseData"]}
          badges={<><Badge variant="green">Pro</Badge><Badge variant="dim">Auto-renew</Badge></>}
        >
          <Slot label="Edition, expiration, trial/NFR/suspended, piracy flags" h={36} />
        </Row>

        <Row icon="🌐" title="Virtual Networking" sources={["NetConfig"]}
          badges={<><Badge variant="blue">Kextless</Badge><Badge variant="dim">2 networks</Badge></>}
        >
          <Slot label="Shared / Host-Only bridges, DHCP, kextless mode" h={36} />
        </Row>

        <Row icon="⚙" title="App Configuration" sources={["AppConfig"]}
          badges={<Badge variant="amber">Disconnected</Badge>}
        >
          <Slot label="Default VM folders, USB assignments, verbose logging" h={36} />
        </Row>

        <Row icon="📋" title="Client & Proxy" sources={["ClientInfo", "ClientProxyInfo"]}
        >
          <Slot label="Client ID, server UUID, proxy settings" h={28} />
        </Row>

        <Row icon="📅" title="Installation History" sources={["AutoStatisticInfo"]}
          badges={<Badge variant="dim">4 installations</Badge>}
        >
          <Slot label="Timeline: version + date pairs" h={36} />
        </Row>

        <Row icon="📜" title="Parallels Logs"
          badges={<Badge variant="dim">3 files</Badge>}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "2px", fontSize: "11px", ...mono, color: "#64748B" }}>
            <div>parallels-system.log <span style={{ color: "#A1A1AA" }}>· 14.5 MB + rotated</span></div>
            <div>parallels-client.log <span style={{ color: "#A1A1AA" }}>· 730 KB</span></div>
            <div>tools.log <span style={{ color: "#A1A1AA" }}>· 1 MB</span></div>
          </div>
        </Row>
      </Group>

      {/* ══════════════════════════════════════════════════════════
          VIRTUAL MACHINES
          ══════════════════════════════════════════════════════════ */}
      <Group
        icon="🗂"
        title="Virtual Machines"
        right="2 VMs"
      >
        {/* ── Current VM ─────────────────────────────────────── */}
        <VmRow
          name="Windows 11 W..."
          isCurrent
          defaultOpen
          uuid="{56dfbb15-0ed0-4983-9e4b-96a6645b42...}"
          badges={<>
            <Badge variant="purple">Windows 11, Version 25H2</Badge>
            <Badge variant="amber">External vHDD</Badge>
            <Badge variant="dim">TRIM</Badge>
            <Badge variant="dim">Apple HV</Badge>
          </>}
        >
          <Row icon="🪪" title="Identity" sources={["CurrentVm"]} indent={12}
            badges={<Badge variant="dim">Registered 2025-10-03</Badge>}
          >
            <div style={{ display: "grid", gridTemplateColumns: "70px 1fr", gap: "1px 8px", fontSize: "11.5px" }}>
              <span style={{ color: "#94A3B8" }}>Home</span>
              <span style={{ ...mono, fontSize: "10.5px", color: "#64748B" }}>~/Parallels/Windows 11 Work.pvm</span>
              <span style={{ color: "#94A3B8" }}>Location</span>
              <span>Macintosh HD</span>
            </div>
          </Row>

          <Row icon="🔧" title="Hardware" sources={["CurrentVm"]} indent={12}
            badges={<><Badge>4 vCPU</Badge><Badge>8192 MB</Badge><Badge variant="dim">Apple HVF</Badge></>}
          >
            <Slot label="vCPU, RAM, VRAM, hypervisor, nested virt, video mode" h={32} />
          </Row>

          <Row icon="💾" title="Storage & Snapshots" sources={["CurrentVm", "AdvancedVmInfo"]} indent={12}
            badges={<><Badge variant="dim">1 HDD</Badge><Badge variant="dim">2 snapshots</Badge><Badge variant="amber">External vHDD</Badge></>}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
              <Slot label="Virtual disks: size, expanding, TRIM, interface" h={32} />
              <Slot label="Snapshot timeline + PVM bundle tree" h={28} />
            </div>
          </Row>

          <Row icon="📶" title="Networking" sources={["CurrentVm"]} indent={12}
            badges={<><Badge variant="blue">Shared</Badge><Badge variant="green">Connected</Badge></>}
          >
            <Slot label="VM NICs: mode, MAC, conditioner" h={28} />
          </Row>

          <Row icon="🔗" title="Sharing & Integration" sources={["CurrentVm"]} indent={12}
            badges={<Badge variant="dim">Profile shared</Badge>}
          >
            <Slot label="Shared folders, clipboard, camera, bluetooth, apps" h={28} />
          </Row>

          <Row icon="📎" title="Misc Settings" sources={["CurrentVm"]} indent={12}>
            <Slot label="Travel mode, TPM, rollback, startup/shutdown, USB3" h={28} />
          </Row>

          {/* ── Inside the VM ──────────────────────────────── */}
          <Divider label="Inside the VM" />

          <Row icon="🪟" title="Guest OS" sources={["GuestOs", "GuestCommands"]} indent={24}
            badges={<><Badge variant="purple">Windows 10.0.26200</Badge><Badge variant="dim">ARM64</Badge><Badge variant="dim">4 vCPU</Badge></>}
          >
            <Slot label="OS type, version, friendly name, kernel, hostname" h={28} />
          </Row>

          <Row icon="📶" title="Guest Networking" sources={["GuestCommands"]} indent={24}
            badges={<Badge variant="green">3 adapters</Badge>}
          >
            <Slot label="Guest adapters (IP, DNS, gateway), mapped drives" h={32} />
          </Row>

          <Row icon="⚙" title="Guest Processes" sources={["GuestCommands"]} indent={24}
            badges={<><Badge variant="dim">84 procs</Badge><Badge variant="amber">2 heavy</Badge></>}
          >
            <Slot label="Guest process table: CPU/mem, path, PID, arch" h={36} />
          </Row>

          <Row icon="🔋" title="Power Requests" sources={["GuestCommands"]} indent={24}>
            <Slot label="Active power requests blocking sleep/shutdown" h={24} />
          </Row>

          {/* ── Per-VM logs ────────────────────────────────── */}
          <Divider label="VM Logs" />

          <Row icon="📜" title="VM Logs" indent={12}
            badges={<Badge variant="dim">2 files</Badge>}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "2px", fontSize: "11px", ...mono, color: "#64748B" }}>
              <div>vm.log <span style={{ color: "#A1A1AA" }}>· 2.6 MB + rotated</span></div>
              <div>prl_vm_app crash .diag <span style={{ color: "#A1A1AA" }}>· 6.9 KB</span></div>
            </div>
          </Row>
        </VmRow>

        {/* ── Other VM ───────────────────────────────────── */}
        <VmRow
          name="Windows Play"
          isCurrent={false}
          uuid="{5e2da0f9-3bc0-469a-a36d-474948ca2d00}"
          badges={<Badge variant="dim">Registered 2026-02-01</Badge>}
        >
          <Row icon="🪪" title="Identity" sources={["vm-{uuid}.pvs"]} indent={12} defaultOpen
          >
            <div style={{ display: "grid", gridTemplateColumns: "70px 1fr", gap: "1px 8px", fontSize: "11.5px" }}>
              <span style={{ color: "#94A3B8" }}>Home</span>
              <span style={{ ...mono, fontSize: "10.5px", color: "#64748B" }}>~/Parallels/Windows Play.pvm</span>
              <span style={{ color: "#94A3B8" }}>Location</span>
              <span>Macintosh HD</span>
              <span style={{ color: "#94A3B8" }}>Changed</span>
              <span style={{ ...mono, fontSize: "10.5px", color: "#64748B" }}>2026-02-02 12:33</span>
            </div>
          </Row>

          <Row icon="🔧" title="Hardware" sources={["vm-{uuid}.pvs"]} indent={12}>
            <Slot label="vCPU, RAM, VRAM, hypervisor — from .pvs.log" h={28} />
          </Row>

          <Row icon="💾" title="Storage" sources={["vm-{uuid}.pvs"]} indent={12}>
            <Slot label="Virtual disks from .pvs.log (no snapshots — AdvancedVmInfo is current-VM only)" h={28} />
          </Row>

          <Row icon="📶" title="Networking" sources={["vm-{uuid}.pvs"]} indent={12}>
            <Slot label="VM NICs from .pvs.log" h={28} />
          </Row>

          <Row icon="🔗" title="Sharing" sources={["vm-{uuid}.pvs"]} indent={12}>
            <Slot label="Sharing config from .pvs.log" h={28} />
          </Row>

          <div style={{ padding: "4px 12px 4px 20px", fontSize: "10.5px", color: "#A1A1AA", fontStyle: "italic", borderBottom: "1px solid #F1F5F9" }}>
            No guest diagnostics — not the reported VM
          </div>

          <Divider label="VM Logs" />
          <Row icon="📜" title="VM Logs" indent={12} badges={<Badge variant="dim">2 files</Badge>}>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px", fontSize: "11px", ...mono, color: "#64748B" }}>
              <div>vm-{"{5e2da0f9}"}.log <span style={{ color: "#A1A1AA" }}>· 690 KB</span></div>
              <div>tools-{"{5e2da0f9}"}.log <span style={{ color: "#A1A1AA" }}>· 195 KB</span></div>
            </div>
          </Row>
        </VmRow>
      </Group>

      {/* ── Escape hatch ──────────────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "center", gap: "6px", padding: "6px 0",
        fontSize: "11.5px", color: "#94A3B8", cursor: "pointer", borderTop: "1px solid #F1F5F9",
      }}>
        <span>📋</span>
        <span>Raw Report Nodes</span>
        <span style={{ ...mono, fontSize: "10px" }}>· 21 nodes · 42 files</span>
      </div>
    </div>
  );
}