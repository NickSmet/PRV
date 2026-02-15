import { useState } from "react";

// ─── Target data shape (what the parser should output) ───────────────────────
const sampleData = {
  localDisks: [
    {
      diskId: "disk3",
      label: "System Disk",
      filesystem: "apfs",
      containerSizeGi: 926,
      freeGi: 497,
      usedGi: 429,
      capacityPercent: 46,
      significant: true,
      volumes: [
        { id: "disk3s5", label: "User Data", mount: "/System/Volumes/Data", usedGi: 393, filesystem: "apfs", flags: ["local", "journaled", "root data"], color: "#3B82F6" },
        { id: "disk3s1s1", label: "macOS", mount: "/", usedGi: 17, filesystem: "apfs", flags: ["sealed", "local", "read-only"], color: "#6366F1" },
        { id: "disk3s1", label: "System Snapshot", mount: "/System/Volumes/Update/mnt1", usedGi: 17, filesystem: "apfs", flags: ["sealed", "local", "journaled"], color: "#8B5CF6" },
        { id: "disk3s2", label: "Preboot", mount: "/System/Volumes/Preboot", usedGi: 14, filesystem: "apfs", flags: ["local", "journaled"], color: "#A855F7" },
        { id: "disk3s6", label: "VM Swap", mount: "/System/Volumes/VM", usedGi: 3, filesystem: "apfs", flags: ["local", "noexec", "journaled"], color: "#F59E0B" },
        { id: "disk3s4", label: "Update", mount: "/System/Volumes/Update", usedGi: 0.36, filesystem: "apfs", flags: ["local", "journaled"], color: "#10B981" },
      ],
    },
    {
      diskId: "disk2",
      label: "Recovery",
      filesystem: "apfs",
      containerSizeGi: 5,
      freeGi: 3,
      usedGi: 2,
      capacityPercent: 40,
      significant: false,
      volumes: [
        { id: "disk2s1", label: "SFR Recovery", mount: "/System/Volumes/Update/SFR/mnt1", usedGi: 2, filesystem: "apfs", flags: ["local", "journaled"], color: "#6366F1" },
      ],
    },
    {
      diskId: "disk1",
      label: "System Firmware",
      filesystem: "apfs",
      containerSizeGi: 0.49,
      freeGi: 0.47,
      usedGi: 0.014,
      capacityPercent: 3,
      significant: false,
      volumes: [
        { id: "disk1s2", label: "xarts", mount: "/System/Volumes/xarts", usedGi: 0.006, filesystem: "apfs", flags: [], color: "#3B82F6" },
        { id: "disk1s1", label: "iSCPreboot", mount: "/System/Volumes/iSCPreboot", usedGi: 0.0055, filesystem: "apfs", flags: [], color: "#6366F1" },
        { id: "disk1s3", label: "Hardware", mount: "/System/Volumes/Hardware", usedGi: 0.0025, filesystem: "apfs", flags: [], color: "#8B5CF6" },
      ],
    },
  ],
  networkShares: [
    {
      shareId: "smb-c",
      label: "Windows 11 VM — C:",
      protocol: "smbfs",
      source: "GUEST:@Windows 2011 Work._smb._tcp.local",
      mountPoint: "[C] Windows 11 Work.hidden",
      sizeGi: 255,
      freeGi: 136,
      usedGi: 119,
      capacityPercent: 47,
    },
    {
      shareId: "smb-w",
      label: "Windows 11 VM — W:",
      protocol: "smbfs",
      source: "GUEST:@Windows 2011 Work._smb._tcp.local",
      mountPoint: "[W] Windows 11 Work.hidden",
      sizeGi: 256,
      freeGi: 250,
      usedGi: 6,
      capacityPercent: 3,
    },
  ],
  alerts: { lowStorage: false, hddFull: false, hasNtfs: false },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(gi) {
  if (gi >= 1024) return `${(gi / 1024).toFixed(1)} TB`;
  if (gi >= 1) return `${Math.round(gi)} GB`;
  if (gi >= 0.001) return `${Math.round(gi * 1024)} MB`;
  return `${Math.round(gi * 1024 * 1024)} KB`;
}

function statusColor(pct) {
  if (pct >= 90) return { bg: "#FEE2E2", text: "#DC2626", dot: "#EF4444", bar: "#EF4444" };
  if (pct >= 70) return { bg: "#FEF3C7", text: "#D97706", dot: "#F59E0B", bar: "#F59E0B" };
  return { bg: "#ECFDF5", text: "#059669", dot: "#10B981", bar: "#3B82F6" };
}

// ─── Chevron icon ─────────────────────────────────────────────────────────────

function Chevron({ open }) {
  return (
    <svg
      width="16" height="16" viewBox="0 0 16 16" fill="none"
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

// ─── Stacked bar for local disks ──────────────────────────────────────────────

function StackedBar({ volumes, containerSizeGi, freeGi, hovered, onHover }) {
  const usedTotal = volumes.reduce((s, v) => s + v.usedGi, 0);
  const overhead = Math.max(0, containerSizeGi - freeGi - usedTotal);

  const segments = volumes
    .filter((v) => v.usedGi > 0)
    .map((v) => ({
      key: v.id,
      label: v.label,
      value: v.usedGi,
      pct: (v.usedGi / containerSizeGi) * 100,
      color: v.color,
    }));

  if (overhead > 0.5) {
    segments.push({
      key: "overhead",
      label: "Overhead / Snapshots",
      value: overhead,
      pct: (overhead / containerSizeGi) * 100,
      color: "#CBD5E1",
    });
  }

  const freePct = (freeGi / containerSizeGi) * 100;

  return (
    <div
      style={{
        display: "flex",
        height: "24px",
        borderRadius: "6px",
        overflow: "hidden",
        background: "#F1F5F9",
        border: "1px solid #E2E8F0",
        width: "100%",
        position: "relative",
      }}
    >
      {segments.map((seg) => (
        <div
          key={seg.key}
          onMouseEnter={() => onHover?.(seg.key)}
          onMouseLeave={() => onHover?.(null)}
          style={{
            width: `${Math.max(seg.pct, 0.3)}%`,
            background: seg.color,
            opacity: hovered && hovered !== seg.key ? 0.4 : 1,
            transition: "opacity 150ms ease",
            position: "relative",
            cursor: "default",
          }}
          title={`${seg.label}: ${fmt(seg.value)} (${seg.pct.toFixed(1)}%)`}
        />
      ))}
      {/* Free space is the remaining background */}
    </div>
  );
}

// ─── Simple usage bar for network shares ──────────────────────────────────────

function UsageBar({ usedGi, sizeGi, capacityPercent }) {
  const st = statusColor(capacityPercent);
  return (
    <div
      style={{
        height: "24px",
        borderRadius: "6px",
        overflow: "hidden",
        background: "#F1F5F9",
        border: "1px solid #E2E8F0",
        width: "100%",
      }}
    >
      <div
        style={{
          width: `${capacityPercent}%`,
          height: "100%",
          background: st.bar,
          borderRadius: capacityPercent >= 99 ? "6px" : "6px 0 0 6px",
          transition: "width 300ms ease",
        }}
      />
    </div>
  );
}

// ─── Badge component ──────────────────────────────────────────────────────────

function Badge({ children, variant = "default" }) {
  const styles = {
    default: { background: "#F1F5F9", color: "#475569", border: "1px solid #E2E8F0" },
    network: { background: "#EDE9FE", color: "#6D28D9", border: "1px solid #DDD6FE" },
    alert: { background: "#FEE2E2", color: "#DC2626", border: "1px solid #FECACA" },
    warn: { background: "#FEF3C7", color: "#D97706", border: "1px solid #FDE68A" },
  };
  const s = styles[variant] || styles.default;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "1px 8px",
        borderRadius: "4px",
        fontSize: "11px",
        fontWeight: 600,
        fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace",
        letterSpacing: "0.02em",
        textTransform: "uppercase",
        ...s,
      }}
    >
      {children}
    </span>
  );
}

// ─── Status dot ───────────────────────────────────────────────────────────────

function StatusDot({ pct }) {
  const st = statusColor(pct);
  return (
    <span
      style={{
        display: "inline-block",
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        background: st.dot,
        flexShrink: 0,
      }}
    />
  );
}

// ─── Volume detail row ────────────────────────────────────────────────────────

function VolumeRow({ vol }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "10px 1fr 80px 1fr",
        gap: "8px",
        alignItems: "center",
        padding: "6px 0",
        borderBottom: "1px solid #F1F5F9",
        fontSize: "13px",
      }}
    >
      <div
        style={{
          width: "10px",
          height: "10px",
          borderRadius: "2px",
          background: vol.color,
          flexShrink: 0,
        }}
      />
      <div>
        <span style={{ fontWeight: 500, color: "#1E293B" }}>{vol.label}</span>
        <span style={{ color: "#94A3B8", marginLeft: "6px", fontSize: "11px", fontFamily: "monospace" }}>
          {vol.id}
        </span>
      </div>
      <div style={{ fontFamily: "monospace", fontWeight: 600, color: "#334155", textAlign: "right" }}>
        {fmt(vol.usedGi)}
      </div>
      <div
        style={{
          color: "#94A3B8",
          fontSize: "12px",
          fontFamily: "monospace",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
        title={vol.mount}
      >
        {vol.mount}
      </div>
    </div>
  );
}

// ─── Local disk card ──────────────────────────────────────────────────────────

function DiskCard({ disk, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const [hovered, setHovered] = useState(null);
  const st = statusColor(disk.capacityPercent);

  return (
    <div
      style={{
        border: "1px solid #E2E8F0",
        borderRadius: "10px",
        overflow: "hidden",
        background: "#fff",
        marginBottom: "10px",
      }}
    >
      {/* Header */}
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "14px 16px 0 16px",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <Chevron open={open} />
        <StatusDot pct={disk.capacityPercent} />
        <span style={{ fontWeight: 600, fontSize: "14px", color: "#0F172A" }}>{disk.label}</span>
        <Badge>{disk.filesystem}</Badge>
        <span
          style={{
            marginLeft: "auto",
            fontFamily: "monospace",
            fontSize: "13px",
            fontWeight: 600,
            color: st.text,
            background: st.bg,
            padding: "2px 8px",
            borderRadius: "4px",
          }}
        >
          {disk.capacityPercent}%
        </span>
      </div>

      {/* Bar + summary */}
      <div style={{ padding: "10px 16px 14px 16px" }}>
        <StackedBar
          volumes={disk.volumes}
          containerSizeGi={disk.containerSizeGi}
          freeGi={disk.freeGi}
          hovered={hovered}
          onHover={setHovered}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "6px",
            fontSize: "12px",
            color: "#64748B",
            fontFamily: "monospace",
          }}
        >
          <span>
            <strong style={{ color: "#334155" }}>{fmt(disk.usedGi)}</strong> used
          </span>
          <span>
            <strong style={{ color: "#334155" }}>{fmt(disk.freeGi)}</strong> free of{" "}
            <strong style={{ color: "#334155" }}>{fmt(disk.containerSizeGi)}</strong>
          </span>
        </div>

        {/* Legend (inline, compact) */}
        {disk.volumes.length > 1 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              marginTop: "8px",
              fontSize: "11px",
              color: "#64748B",
            }}
          >
            {disk.volumes
              .filter((v) => v.usedGi >= 0.5)
              .map((v) => (
                <span
                  key={v.id}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    opacity: hovered && hovered !== v.id ? 0.4 : 1,
                    transition: "opacity 150ms ease",
                    cursor: "default",
                  }}
                  onMouseEnter={() => setHovered(v.id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "2px",
                      background: v.color,
                      flexShrink: 0,
                    }}
                  />
                  {v.label} ({fmt(v.usedGi)})
                </span>
              ))}
          </div>
        )}
      </div>

      {/* Expanded detail */}
      {open && (
        <div
          style={{
            borderTop: "1px solid #F1F5F9",
            padding: "10px 16px 12px 16px",
            background: "#FAFBFC",
          }}
        >
          <div style={{ fontSize: "11px", fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
            Volumes ({disk.volumes.length})
          </div>
          {disk.volumes.map((vol) => (
            <VolumeRow key={vol.id} vol={vol} />
          ))}
          <div
            style={{
              marginTop: "8px",
              fontSize: "11px",
              color: "#94A3B8",
              fontFamily: "monospace",
            }}
          >
            Container: /dev/{disk.diskId} · APFS shared pool · {disk.volumes.length} volumes
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Network share card ───────────────────────────────────────────────────────

function ShareCard({ share }) {
  const [open, setOpen] = useState(false);
  const st = statusColor(share.capacityPercent);

  return (
    <div
      style={{
        border: "1px solid #E2E8F0",
        borderRadius: "10px",
        overflow: "hidden",
        background: "#fff",
        marginBottom: "10px",
      }}
    >
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "14px 16px 0 16px",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <Chevron open={open} />
        <StatusDot pct={share.capacityPercent} />
        <span style={{ fontWeight: 600, fontSize: "14px", color: "#0F172A" }}>{share.label}</span>
        <Badge variant="network">{share.protocol}</Badge>
        <span
          style={{
            marginLeft: "auto",
            fontFamily: "monospace",
            fontSize: "13px",
            fontWeight: 600,
            color: st.text,
            background: st.bg,
            padding: "2px 8px",
            borderRadius: "4px",
          }}
        >
          {share.capacityPercent}%
        </span>
      </div>

      <div style={{ padding: "10px 16px 14px 16px" }}>
        <UsageBar usedGi={share.usedGi} sizeGi={share.sizeGi} capacityPercent={share.capacityPercent} />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "6px",
            fontSize: "12px",
            color: "#64748B",
            fontFamily: "monospace",
          }}
        >
          <span>
            <strong style={{ color: "#334155" }}>{fmt(share.usedGi)}</strong> used
          </span>
          <span>
            <strong style={{ color: "#334155" }}>{fmt(share.freeGi)}</strong> free of{" "}
            <strong style={{ color: "#334155" }}>{fmt(share.sizeGi)}</strong>
          </span>
        </div>
      </div>

      {open && (
        <div
          style={{
            borderTop: "1px solid #F1F5F9",
            padding: "10px 16px 12px 16px",
            background: "#FAFBFC",
            fontSize: "12px",
            fontFamily: "monospace",
            color: "#64748B",
          }}
        >
          <div style={{ marginBottom: "4px" }}>
            <span style={{ color: "#94A3B8" }}>Source: </span>
            <span style={{ color: "#334155" }}>{share.source}</span>
          </div>
          <div>
            <span style={{ color: "#94A3B8" }}>Mount: </span>
            <span style={{ color: "#334155" }}>{share.mountPoint}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Minor volumes collapsed group ───────────────────────────────────────────

function MinorVolumes({ disks }) {
  const [open, setOpen] = useState(false);
  const totalSize = disks.reduce((s, d) => s + d.containerSizeGi, 0);
  const totalUsed = disks.reduce((s, d) => s + d.usedGi, 0);

  return (
    <div
      style={{
        border: "1px solid #E2E8F0",
        borderRadius: "10px",
        overflow: "hidden",
        background: "#fff",
        marginBottom: "10px",
      }}
    >
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "12px 16px",
          cursor: "pointer",
          userSelect: "none",
          fontSize: "13px",
          color: "#64748B",
        }}
      >
        <Chevron open={open} />
        <span>
          {disks.length} minor system volume{disks.length !== 1 ? "s" : ""}
        </span>
        <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#94A3B8" }}>
          ({fmt(totalUsed)} used of {fmt(totalSize)})
        </span>
      </div>
      {open && (
        <div style={{ padding: "0 8px 8px 8px" }}>
          {disks.map((d) => (
            <DiskCard key={d.diskId} disk={d} defaultOpen={false} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Alert banner ─────────────────────────────────────────────────────────────

function AlertBanner({ alerts }) {
  const items = [];
  if (alerts.hddFull)
    items.push({ text: "Disk full — system volume at 100% capacity", variant: "alert" });
  else if (alerts.lowStorage)
    items.push({ text: "Low storage — system volume above 90% capacity", variant: "warn" });
  if (alerts.hasNtfs) items.push({ text: "NTFS volume detected — may cause compatibility issues", variant: "warn" });

  if (items.length === 0) return null;

  return (
    <div style={{ marginBottom: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
      {items.map((item, i) => {
        const isAlert = item.variant === "alert";
        return (
          <div
            key={i}
            style={{
              padding: "10px 14px",
              borderRadius: "8px",
              background: isAlert ? "#FEF2F2" : "#FFFBEB",
              border: `1px solid ${isAlert ? "#FECACA" : "#FDE68A"}`,
              color: isAlert ? "#DC2626" : "#D97706",
              fontSize: "13px",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "16px" }}>{isAlert ? "⚠" : "⚡"}</span>
            {item.text}
          </div>
        );
      })}
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ children, count }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginBottom: "10px",
        marginTop: "20px",
      }}
    >
      <span
        style={{
          fontSize: "11px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "#94A3B8",
        }}
      >
        {children}
      </span>
      {count != null && (
        <span
          style={{
            fontSize: "11px",
            fontWeight: 600,
            color: "#CBD5E1",
            background: "#F8FAFC",
            border: "1px solid #E2E8F0",
            borderRadius: "10px",
            padding: "0 6px",
          }}
        >
          {count}
        </span>
      )}
      <div style={{ flex: 1, height: "1px", background: "#E2E8F0" }} />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function DiskVisualization() {
  const data = sampleData;
  const significantDisks = data.localDisks.filter((d) => d.significant);
  const minorDisks = data.localDisks.filter((d) => !d.significant);
  const totalLocal = data.localDisks.reduce((s, d) => s + d.containerSizeGi, 0);

  return (
    <div
      style={{
        maxWidth: "680px",
        margin: "0 auto",
        padding: "24px",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
        color: "#0F172A",
        background: "#F8FAFC",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "8px" }}>
        <h2 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#0F172A" }}>
          Storage Overview
        </h2>
        <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#94A3B8" }}>
          {data.localDisks.length} local disk{data.localDisks.length !== 1 ? "s" : ""} ·{" "}
          {data.networkShares.length} network share{data.networkShares.length !== 1 ? "s" : ""} ·{" "}
          {data.localDisks.reduce((s, d) => s + d.volumes.length, 0)} volumes total
        </p>
      </div>

      <AlertBanner alerts={data.alerts} />

      {/* Local disks */}
      <SectionHeader count={data.localDisks.length}>Local Disks</SectionHeader>
      {significantDisks.map((disk) => (
        <DiskCard key={disk.diskId} disk={disk} defaultOpen={true} />
      ))}
      {minorDisks.length > 0 && <MinorVolumes disks={minorDisks} />}

      {/* Network shares */}
      {data.networkShares.length > 0 && (
        <>
          <SectionHeader count={data.networkShares.length}>Network Shares</SectionHeader>
          {data.networkShares.map((share) => (
            <ShareCard key={share.shareId} share={share} />
          ))}
        </>
      )}

      {/* Footer: data shape hint for developers */}
      <div
        style={{
          marginTop: "32px",
          padding: "12px",
          background: "#F1F5F9",
          borderRadius: "8px",
          fontSize: "11px",
          fontFamily: "monospace",
          color: "#94A3B8",
          lineHeight: 1.5,
        }}
      >
        💡 Prototype — data is hardcoded from the sample mount/df output.
        <br />
        The parser should return: {"{ localDisks: PhysicalDisk[], networkShares: NetworkShare[], alerts }"}
      </div>
    </div>
  );
}
