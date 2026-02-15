import { useState } from "react";

// ─── Shared components ────────────────────────────────────────────────────────

function Chevron({ open }) {
  return (
    <svg
      width="14" height="14" viewBox="0 0 16 16" fill="none"
      style={{
        transform: open ? "rotate(90deg)" : "rotate(0deg)",
        transition: "transform 150ms ease",
        flexShrink: 0,
      }}
    >
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
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "1px 7px",
        borderRadius: "4px",
        fontSize: "10.5px",
        fontWeight: 600,
        fontFamily: "'SF Mono', 'Fira Code', Consolas, monospace",
        letterSpacing: "0.02em",
        whiteSpace: "nowrap",
        ...s,
      }}
    >
      {children}
    </span>
  );
}

function StatusDot({ color = "#10B981", size = 7 }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        flexShrink: 0,
      }}
    />
  );
}

function Mono({ children, dim = false }) {
  return (
    <span
      style={{
        fontFamily: "'SF Mono', 'Fira Code', Consolas, monospace",
        fontSize: "12.5px",
        color: dim ? "#94A3B8" : "#334155",
        fontWeight: 500,
      }}
    >
      {children}
    </span>
  );
}

function SectionDivider({ children }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        margin: "18px 0 10px 0",
      }}
    >
      <span
        style={{
          fontSize: "10.5px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "#94A3B8",
          whiteSpace: "nowrap",
        }}
      >
        {children}
      </span>
      <div style={{ flex: 1, height: "1px", background: "#E2E8F0" }} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PART 1: Virtual Network Configuration
// ═══════════════════════════════════════════════════════════════════════════════

const networkData = {
  kextlessMode: "unknown",
  networks: [
    {
      id: "network-1",
      name: "Network 1",
      type: "Shared Networking",
      typeShort: "Shared",
      dhcpIp: "10.211.55.1",
      netMask: "255.255.255.0",
      hostIp: "10.211.55.2",
      dhcpEnabled: true,
      ipv6DhcpEnabled: true,
    },
    {
      id: "network-2",
      name: "Network 2",
      type: "Host Only Networking",
      typeShort: "Host-Only",
      dhcpIp: "10.37.129.1",
      netMask: "255.255.255.0",
      hostIp: "10.37.129.2",
      dhcpEnabled: true,
      ipv6DhcpEnabled: true,
    },
  ],
};

function NetworkBadge({ type }) {
  const variant = type === "Shared" ? "blue" : "purple";
  return <Badge variant={variant}>{type}</Badge>;
}

function NetCard({ net }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        border: "1px solid #E2E8F0",
        borderRadius: "8px",
        background: "#fff",
        marginBottom: "8px",
        overflow: "hidden",
      }}
    >
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "10px 14px",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <Chevron open={open} />
        <StatusDot color="#10B981" />
        <span style={{ fontWeight: 600, fontSize: "13px", color: "#0F172A" }}>
          {net.name}
        </span>
        <NetworkBadge type={net.typeShort} />
        <span style={{ marginLeft: "auto" }}>
          <Mono>{net.dhcpIp}</Mono>
          <Mono dim> / {net.netMask.split(".").pop()}</Mono>
        </span>
      </div>

      {open && (
        <div
          style={{
            borderTop: "1px solid #F1F5F9",
            padding: "10px 14px 12px 14px",
            background: "#FAFBFC",
            display: "grid",
            gridTemplateColumns: "100px 1fr",
            gap: "4px 12px",
            fontSize: "12px",
          }}
        >
          {[
            ["Type", net.type],
            ["DHCP IP", net.dhcpIp],
            ["Net Mask", net.netMask],
            ["Host IP", net.hostIp],
            ["DHCP", net.dhcpEnabled ? "✓ Enabled" : "✗ Disabled"],
            ["IPv6 DHCP", net.ipv6DhcpEnabled ? "✓ Enabled" : "✗ Disabled"],
          ].map(([label, value]) => (
            <>
              <span key={label + "-l"} style={{ color: "#94A3B8", fontWeight: 500 }}>{label}</span>
              <Mono key={label + "-v"}>{value}</Mono>
            </>
          ))}
        </div>
      )}
    </div>
  );
}

function NetConfigPanel() {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
        <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#0F172A" }}>
          Virtual Networks
        </h3>
        <Badge variant="dim">{networkData.networks.length}</Badge>
      </div>

      {networkData.networks.map((net) => (
        <NetCard key={net.id} net={net} />
      ))}

      {networkData.kextlessMode !== "unknown" && (
        <div style={{ fontSize: "11px", color: "#94A3B8", marginTop: "4px", fontFamily: "monospace" }}>
          Kextless Mode: {networkData.kextlessMode}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PART 2: VM System / Adapters / Network Volumes
// ═══════════════════════════════════════════════════════════════════════════════

const vmData = {
  system: {
    hostname: "BRENO-WINDOWS",
    processorCount: 4,
    architecture: "ARM64",
  },
  adapters: [
    {
      id: "eth2",
      name: "Ethernet 2",
      description: "Fortinet Virtual Ethernet Adapter",
      ipv4: "172.30.20.9",
      ipv6: null,
      gateway: null,
      dhcp: "Enabled",
      dns: ["172.30.40.31", "172.30.40.32"],
      role: "vpn",
    },
    {
      id: "eth3",
      name: "Ethernet 3",
      description: "Fortinet SSL VPN Virtual Ethernet Adapter",
      ipv4: null,
      ipv6: null,
      gateway: null,
      dhcp: "Enabled",
      dns: [],
      role: "vpn",
    },
    {
      id: "eth",
      name: "Ethernet",
      description: "Parallels VirtIO Ethernet Adapter",
      ipv4: "10.211.55.3",
      ipv6: "fdb2:2c26:f4e4:0:1b4a:e207:3665:f70f",
      gateway: "10.211.55.1",
      dhcp: "Enabled",
      dns: ["fe80::21c:42ff:fe00:18", "172.30.40.31", "172.30.40.32", "10.211.55.1"],
      role: "primary",
    },
  ],
  volumes: [
    { drive: "X:", remote: "\\\\Mac\\iCloud", provider: "Parallels Shared Folders", status: "OK" },
    { drive: "Y:", remote: "\\\\Mac\\Home", provider: "Parallels Shared Folders", status: "OK" },
    { drive: "Z:", remote: "\\\\Mac\\AllFiles", provider: "Parallels Shared Folders", status: "OK" },
  ],
};

function roleIcon(role) {
  if (role === "vpn") return "🛡";
  if (role === "primary") return "🌐";
  return "📡";
}

function roleBadge(role) {
  if (role === "vpn") return <Badge variant="amber">VPN</Badge>;
  if (role === "primary") return <Badge variant="green">PRIMARY</Badge>;
  return <Badge>ADAPTER</Badge>;
}

function AdapterCard({ adapter }) {
  const [open, setOpen] = useState(false);
  const hasIp = !!adapter.ipv4;

  return (
    <div
      style={{
        border: "1px solid #E2E8F0",
        borderRadius: "8px",
        background: "#fff",
        marginBottom: "8px",
        overflow: "hidden",
      }}
    >
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "10px 14px",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <Chevron open={open} />
        <StatusDot color={hasIp ? "#10B981" : "#CBD5E1"} />
        <span style={{ fontWeight: 600, fontSize: "13px", color: hasIp ? "#0F172A" : "#94A3B8" }}>
          {adapter.name}
        </span>
        {roleBadge(adapter.role)}
        <span style={{ marginLeft: "auto" }}>
          {adapter.ipv4 ? (
            <Mono>{adapter.ipv4}</Mono>
          ) : (
            <Mono dim>No IP</Mono>
          )}
        </span>
      </div>

      {open && (
        <div
          style={{
            borderTop: "1px solid #F1F5F9",
            padding: "10px 14px 12px 14px",
            background: "#FAFBFC",
            display: "grid",
            gridTemplateColumns: "80px 1fr",
            gap: "4px 12px",
            fontSize: "12px",
          }}
        >
          <span style={{ color: "#94A3B8", fontWeight: 500 }}>Driver</span>
          <Mono>{adapter.description}</Mono>

          {adapter.ipv4 && (
            <>
              <span style={{ color: "#94A3B8", fontWeight: 500 }}>IPv4</span>
              <Mono>{adapter.ipv4}</Mono>
            </>
          )}
          {adapter.ipv6 && (
            <>
              <span style={{ color: "#94A3B8", fontWeight: 500 }}>IPv6</span>
              <span style={{ fontFamily: "monospace", fontSize: "11px", color: "#64748B", wordBreak: "break-all" }}>
                {adapter.ipv6}
              </span>
            </>
          )}
          {adapter.gateway && (
            <>
              <span style={{ color: "#94A3B8", fontWeight: 500 }}>Gateway</span>
              <Mono>{adapter.gateway}</Mono>
            </>
          )}
          <span style={{ color: "#94A3B8", fontWeight: 500 }}>DHCP</span>
          <Mono>{adapter.dhcp}</Mono>

          {adapter.dns.length > 0 && (
            <>
              <span style={{ color: "#94A3B8", fontWeight: 500 }}>DNS</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                {adapter.dns.map((d, i) => (
                  <span
                    key={i}
                    style={{
                      fontFamily: "monospace",
                      fontSize: "11px",
                      color: "#475569",
                      background: "#F1F5F9",
                      padding: "1px 6px",
                      borderRadius: "3px",
                      border: "1px solid #E2E8F0",
                    }}
                  >
                    {d}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function VolumeRow({ vol }) {
  const isOk = vol.status === "OK";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "7px 0",
        borderBottom: "1px solid #F1F5F9",
        fontSize: "13px",
      }}
    >
      <StatusDot color={isOk ? "#10B981" : "#EF4444"} />
      <span
        style={{
          fontWeight: 700,
          fontFamily: "monospace",
          fontSize: "13px",
          color: "#0F172A",
          width: "28px",
        }}
      >
        {vol.drive}
      </span>
      <span style={{ color: "#475569", fontSize: "13px" }}>→</span>
      <Mono>{vol.remote}</Mono>
      <span style={{ marginLeft: "auto" }}>
        <Badge variant={isOk ? "green" : "red"}>{vol.status}</Badge>
      </span>
    </div>
  );
}

function VMInfoPanel() {
  const { system, adapters, volumes } = vmData;
  const activeAdapters = adapters.filter((a) => !!a.ipv4).length;
  const allVolumesOk = volumes.every((v) => v.status === "OK");

  return (
    <div>
      {/* System header — very compact, one line */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "12px 14px",
          background: "#fff",
          border: "1px solid #E2E8F0",
          borderRadius: "8px",
          marginBottom: "8px",
        }}
      >
        <span style={{ fontSize: "18px" }}>💻</span>
        <span style={{ fontWeight: 700, fontSize: "14px", color: "#0F172A" }}>
          {system.hostname}
        </span>
        <Badge>{system.architecture}</Badge>
        <Badge>{system.processorCount} vCPU</Badge>
      </div>

      {/* Network Adapters */}
      <SectionDivider>
        Network Adapters · {activeAdapters}/{adapters.length} active
      </SectionDivider>

      {adapters.map((a) => (
        <AdapterCard key={a.id} adapter={a} />
      ))}

      {/* Mapped Drives */}
      <SectionDivider>
        Mapped Drives · {allVolumesOk ? "All OK" : "Issues detected"}
      </SectionDivider>

      <div
        style={{
          border: "1px solid #E2E8F0",
          borderRadius: "8px",
          background: "#fff",
          padding: "6px 14px",
        }}
      >
        {volumes.map((v) => (
          <VolumeRow key={v.drive} vol={v} />
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN: Both panels together for preview
// ═══════════════════════════════════════════════════════════════════════════════

export default function AllPanels() {
  return (
    <div
      style={{
        maxWidth: "640px",
        margin: "0 auto",
        padding: "24px",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
        color: "#0F172A",
        background: "#F8FAFC",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        gap: "32px",
      }}
    >
      <div>
        <div
          style={{
            fontSize: "11px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "#CBD5E1",
            marginBottom: "10px",
          }}
        >
          Parallels Host — Network Configuration
        </div>
        <NetConfigPanel />
      </div>

      <div>
        <div
          style={{
            fontSize: "11px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "#CBD5E1",
            marginBottom: "10px",
          }}
        >
          Guest VM — Windows 11
        </div>
        <VMInfoPanel />
      </div>

      <div
        style={{
          padding: "12px",
          background: "#F1F5F9",
          borderRadius: "8px",
          fontSize: "11px",
          fontFamily: "monospace",
          color: "#94A3B8",
          lineHeight: 1.5,
        }}
      >
        💡 Prototype — click any card row to expand details. Collapsed view shows
        the minimum info a support agent needs at a glance.
      </div>
    </div>
  );
}
