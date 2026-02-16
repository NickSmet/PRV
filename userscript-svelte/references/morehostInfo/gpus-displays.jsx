import { useState } from "react";

// ─── Shared primitives ───────────────────────────────────────────────────────

function Chevron({ open }) {
  return (
    <svg
      width="14" height="14" viewBox="0 0 16 16" fill="none"
      style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 150ms ease", flexShrink: 0 }}
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
    dim: { background: "#F8FAFC", color: "#94A3B8", border: "1px solid #E2E8F0" },
  };
  const s = styles[variant] || styles.default;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", padding: "1px 7px", borderRadius: "4px",
      fontSize: "10.5px", fontWeight: 600, fontFamily: "'SF Mono', Consolas, monospace",
      letterSpacing: "0.02em", whiteSpace: "nowrap", ...s,
    }}>
      {children}
    </span>
  );
}

function Mono({ children, dim = false, size = "12.5px" }) {
  return (
    <span style={{
      fontFamily: "'SF Mono', Consolas, monospace", fontSize: size,
      color: dim ? "#94A3B8" : "#334155", fontWeight: 500,
    }}>
      {children}
    </span>
  );
}

// ─── Sample data (suggested clean shape) ──────────────────────────────────────

const gpuData = [
  {
    id: "gpu1",
    name: "Apple M4 Pro",
    type: "integrated",
    displays: [
      {
        id: "d1",
        name: "34GL750",
        builtin: false,
        physicalWidth: 2560, physicalHeight: 1080,
        logicalWidth: 2560, logicalHeight: 1080,
        refreshRate: 144,
      },
      {
        id: "d2",
        name: "MacBook Built-In Display",
        builtin: true,
        physicalWidth: 3024, physicalHeight: 1964,
        logicalWidth: 1512, logicalHeight: 982,
        refreshRate: 120,
      },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resLabel(w, h) { return `${w}×${h}`; }

function aspectRatio(w, h) {
  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
  const d = gcd(w, h);
  const aw = w / d, ah = h / d;
  // Simplify common ones
  if (aw === 64 && ah === 27) return "21:9";
  if (aw === 32 && ah === 9) return "32:9";
  if (aw === 756 && ah === 491) return "~3:2";
  if (aw === 16 && ah === 9) return "16:9";
  if (aw === 16 && ah === 10) return "16:10";
  if (aw > 20) return `~${(aw / ah).toFixed(1)}:1`;
  return `${aw}:${ah}`;
}

function scaleFactor(phys, log) {
  const factor = phys / log;
  if (Math.abs(factor - 2) < 0.1) return "2×";
  if (Math.abs(factor - 3) < 0.1) return "3×";
  if (Math.abs(factor - 1) < 0.05) return null; // no scaling
  return `${factor.toFixed(1)}×`;
}

// ─── Display miniatures — sized by LOGICAL resolution, relative to each other ─

function DisplayLayout({ displays }) {
  // Find the max logical pixel dimension across all displays to normalize
  const allLogicalPixels = displays.map(d => d.logicalWidth * d.logicalHeight);
  const maxPixels = Math.max(...allLogicalPixels);

  // We'll use a reference width for the largest display
  const refWidth = 160;

  const miniatures = displays.map(d => {
    const ratio = d.logicalWidth / d.logicalHeight;
    // Scale area proportionally, then derive width/height from aspect ratio
    const areaRatio = (d.logicalWidth * d.logicalHeight) / maxPixels;
    const scale = Math.sqrt(areaRatio); // square root to scale linearly by area
    const w = refWidth * scale * (ratio > 1 ? 1 : ratio);
    const h = w / ratio;
    return { ...d, renderW: Math.max(w, 40), renderH: Math.max(h, 25) };
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        gap: "14px",
        padding: "20px 14px 14px 14px",
        background: "#FAFBFC",
      }}
    >
      {miniatures.map(d => (
        <div key={d.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "5px" }}>
          {/* The display rectangle */}
          <div
            style={{
              width: d.renderW,
              height: d.renderH,
              borderRadius: "4px",
              border: d.builtin ? "2.5px solid #3B82F6" : "2.5px solid #94A3B8",
              background: d.builtin ? "#EFF6FF" : "#F8FAFC",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "1px",
              position: "relative",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            <span style={{
              fontSize: d.renderW > 80 ? "10px" : "8px",
              fontWeight: 700,
              color: d.builtin ? "#3B82F6" : "#64748B",
              fontFamily: "monospace",
            }}>
              {resLabel(d.logicalWidth, d.logicalHeight)}
            </span>
            {d.refreshRate && d.renderW > 80 && (
              <span style={{
                fontSize: "8px", fontWeight: 600, color: "#10B981",
                fontFamily: "monospace",
              }}>
                {d.refreshRate}Hz
              </span>
            )}

            {/* Notch hint for built-in */}
            {d.builtin && (
              <div style={{
                position: "absolute", top: "-1px", left: "50%", transform: "translateX(-50%)",
                width: "16px", height: "4px", background: "#3B82F6", borderRadius: "0 0 3px 3px",
              }} />
            )}
          </div>

          {/* Stand / label */}
          {!d.builtin && (
            <div style={{
              width: "12px", height: "6px", background: "#CBD5E1", borderRadius: "0 0 2px 2px",
            }} />
          )}
          <span style={{
            fontSize: "10px", color: "#64748B", textAlign: "center",
            maxWidth: d.renderW + 30, lineHeight: 1.2, fontWeight: 500,
          }}>
            {d.builtin ? "Built-in" : d.name}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Display detail row ───────────────────────────────────────────────────────

function DisplayRow({ display }) {
  const scale = scaleFactor(display.physicalWidth, display.logicalWidth);
  const ratio = aspectRatio(display.logicalWidth, display.logicalHeight);
  const isRetina = display.physicalWidth !== display.logicalWidth;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "8px 0",
        borderBottom: "1px solid #F1F5F9",
      }}
    >
      <span style={{ fontSize: "15px", flexShrink: 0 }}>
        {display.builtin ? "💻" : "🖥"}
      </span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "5px", flexWrap: "wrap" }}>
          <span style={{ fontWeight: 600, fontSize: "13px", color: "#0F172A" }}>
            {display.name}
          </span>
          {display.builtin && <Badge variant="blue">Built-in</Badge>}
          <Badge>{ratio}</Badge>
          <Badge variant="green">{display.refreshRate} Hz</Badge>
          {scale && <Badge variant="purple">{scale} HiDPI</Badge>}
        </div>
      </div>

      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontFamily: "monospace", fontSize: "12px", fontWeight: 600, color: "#334155" }}>
          {resLabel(display.logicalWidth, display.logicalHeight)}
        </div>
        {isRetina && (
          <div style={{ fontFamily: "monospace", fontSize: "10.5px", color: "#94A3B8" }}>
            {resLabel(display.physicalWidth, display.physicalHeight)} native
          </div>
        )}
      </div>
    </div>
  );
}

// ─── GPU Card ─────────────────────────────────────────────────────────────────

function GPUCard({ gpu }) {
  const [open, setOpen] = useState(true);

  return (
    <div style={{
      border: "1px solid #E2E8F0", borderRadius: "10px",
      background: "#fff", marginBottom: "8px", overflow: "hidden",
    }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: "flex", alignItems: "center", gap: "8px",
          padding: "12px 14px", cursor: "pointer", userSelect: "none",
        }}
      >
        <Chevron open={open} />
        <span style={{ fontSize: "15px", lineHeight: 1 }}>⚡</span>
        <span style={{ fontWeight: 700, fontSize: "14px", color: "#0F172A" }}>{gpu.name}</span>
        <Badge variant={gpu.type === "integrated" ? "default" : "amber"}>
          {gpu.type === "integrated" ? "Integrated" : "Discrete"}
        </Badge>
        <span style={{ marginLeft: "auto" }}>
          <Badge variant="dim">
            {gpu.displays.length} display{gpu.displays.length !== 1 ? "s" : ""}
          </Badge>
        </span>
      </div>

      {open && (
        <div style={{ borderTop: "1px solid #F1F5F9" }}>
          <DisplayLayout displays={gpu.displays} />
          <div style={{ padding: "4px 14px 10px 14px" }}>
            {gpu.displays.map(d => <DisplayRow key={d.id} display={d} />)}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function GPUDisplayPanel() {
  const totalDisplays = gpuData.reduce((s, g) => s + g.displays.length, 0);

  return (
    <div style={{
      maxWidth: "640px", margin: "0 auto", padding: "24px",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
      color: "#0F172A", background: "#F8FAFC", minHeight: "100vh",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
        <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#0F172A" }}>
          GPUs & Displays
        </h3>
        <Badge variant="dim">{gpuData.length} GPU{gpuData.length !== 1 ? "s" : ""}</Badge>
        <Badge variant="dim">{totalDisplays} display{totalDisplays !== 1 ? "s" : ""}</Badge>
      </div>

      {gpuData.map(gpu => <GPUCard key={gpu.id} gpu={gpu} />)}

      <div style={{
        marginTop: "20px", padding: "12px", background: "#F1F5F9", borderRadius: "8px",
        fontSize: "11.5px", color: "#64748B", lineHeight: 1.6,
      }}>
        <strong>Sizing logic:</strong> Display rectangles are proportional to <em>logical</em> resolution
        area. The ultrawide (2560×1080 logical) appears larger than the MacBook (1512×982 logical)
        because it drives more logical pixels. Aspect ratio is preserved — the ultrawide is
        visibly wider and shorter. A 2× HiDPI badge appears when physical ≠ logical.
      </div>
    </div>
  );
}