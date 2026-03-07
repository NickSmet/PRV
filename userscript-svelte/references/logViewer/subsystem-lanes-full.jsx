import { useState, useRef, useCallback, useMemo, useEffect } from "react";

// ─── Tokens ──────────────────────────────────────────────────────────────
const F = {
  sans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  mono: "'SF Mono', Consolas, monospace",
};
const C = {
  bg: "#FFFFFF", panelBg: "#FAFBFC", headerBg: "#F8FAFC",
  b0: "#F1F5F9", b1: "#E2E8F0", b2: "#E4E4E7",
  t0: "#0F172A", t1: "#1E293B", t2: "#64748B", t3: "#94A3B8", t4: "#A1A1AA",
  sel: "#EFF6FF", selBorder: "#3B82F6", corBg: "#F8FAFF", corBorder: "#93C5FD",
  flash: "#DBEAFE",
};
const BADGE = {
  default: { bg: "#F1F5F9", fg: "#475569", bd: "#E2E8F0" },
  green: { bg: "#ECFDF5", fg: "#059669", bd: "#A7F3D0" },
  blue: { bg: "#EFF6FF", fg: "#2563EB", bd: "#BFDBFE" },
  purple: { bg: "#F3E8FF", fg: "#7C3AED", bd: "#DDD6FE" },
  amber: { bg: "#FEF3C7", fg: "#D97706", bd: "#FDE68A" },
  red: { bg: "#FEE2E2", fg: "#DC2626", bd: "#FECACA" },
  dim: { bg: "#F8FAFC", fg: "#94A3B8", bd: "#E2E8F0" },
};

// ─── Subsystem definitions ───────────────────────────────────────────────
const SUBSYSTEMS = [
  { id: "host", label: "Host", icon: "🍎", color: "#3B82F6", bv: "blue" },
  { id: "pd", label: "Parallels Desktop", icon: "▶️", color: "#8B5CF6", bv: "purple" },
  { id: "vm", label: "Virtual Machine", icon: "💻", color: "#059669", bv: "green" },
  { id: "tools", label: "Tools", icon: "🔧", color: "#64748B", bv: "default" },
  { id: "network", label: "Network", icon: "📶", color: "#D97706", bv: "amber" },
];

const F2S = {
  "parallels-system.log": "pd",
  "vm.log": "vm",
  "parallels-tools.log": "tools",
  "parallels-network.log": "network",
  "vm-client.log": "vm",
  "host-system.log": "host",
};

const CAT_C = {
  "GUI Messages": { bg: "#EFF6FF", fg: "#2563EB", bd: "#BFDBFE" },
  "Config Diffs": { bg: "#FEF3C7", fg: "#D97706", bd: "#FDE68A" },
  Apps: { bg: "#ECFDF5", fg: "#059669", bd: "#A7F3D0" },
  Network: { bg: "#F3E8FF", fg: "#7C3AED", bd: "#DDD6FE" },
  Errors: { bg: "#FEE2E2", fg: "#DC2626", bd: "#FECACA" },
  Tools: { bg: "#F1F5F9", fg: "#475569", bd: "#E2E8F0" },
  Boot: { bg: "#ECFDF5", fg: "#059669", bd: "#A7F3D0" },
  Storage: { bg: "#FEF3C7", fg: "#D97706", bd: "#FDE68A" },
};

const CAT_BV = {
  "GUI Messages": "blue", "Config Diffs": "amber", Apps: "green",
  Network: "purple", Errors: "red", Tools: "default", Boot: "green", Storage: "amber",
};

// ─── Data ────────────────────────────────────────────────────────────────
const BASE = new Date("2026-02-02T12:00:00Z").getTime();
const m = (min, sec = 0, ms = 0) => new Date(BASE + min * 60000 + sec * 1000 + ms).toISOString();

const EVENTS = [
  { id: "e01", sourceFile: "vm.log", category: "Boot", severity: "info", start: m(0, 0), end: m(0, 28), label: "VM boot sequence", humanLabel: "VM Boot (28s)", detail: "UEFI → Windows Boot Manager → kernel → services. 28s total.", correlates: ["e02"] },
  { id: "e02", sourceFile: "parallels-tools.log", category: "Tools", severity: "info", start: m(0, 30), end: m(1, 15), label: "Tools handshake", humanLabel: "Tools connect", detail: "prl_tools_service connected to hypervisor. Protocol v4.2.", correlates: ["e01"] },
  { id: "e03", sourceFile: "vm.log", category: "Apps", severity: "info", start: m(0, 30), end: m(45, 0), label: "WINWORD.EXE (D3D11.32)", humanLabel: "Word (GPU accel)", detail: "C:\\Program Files\\Microsoft Office\\Root\\Office16\\WINWORD.EXE\\d2d1.dll" },
  { id: "e04", sourceFile: "vm.log", category: "Apps", severity: "info", start: m(0, 32), end: m(44, 19), label: "ApplicationFrameHost.exe (D3D11.32)", humanLabel: "App Frame Host", detail: "Windows shell application frame host process using D3D11 acceleration." },
  { id: "e05", sourceFile: "vm.log", category: "Apps", severity: "info", start: m(5, 10), end: m(38, 0), label: "msedge.exe (D3D11.32)", humanLabel: "Edge (GPU accel)", detail: "Microsoft Edge browser with hardware acceleration enabled." },
  { id: "e06", sourceFile: "vm.log", category: "Network", severity: "info", start: m(1, 0), label: "Shared adapter connected", humanLabel: "Net up", detail: "vnic0 connected. DHCP lease: 10.211.55.5", correlates: ["e07"] },
  { id: "e07", sourceFile: "parallels-network.log", category: "Network", severity: "info", start: m(1, 2), label: "NAT engine initialized", humanLabel: "NAT ready", detail: "Shared networking NAT engine started. Gateway: 10.211.55.1", correlates: ["e06"] },
  { id: "e08", sourceFile: "parallels-system.log", category: "Network", severity: "warn", start: m(15, 22), label: "DNS resolution slow (>2s)", humanLabel: "Slow DNS", detail: "windowsupdate.com: 2340ms via 10.211.55.1. Possible network congestion." },
  { id: "e09", sourceFile: "parallels-system.log", category: "Network", severity: "info", start: m(20, 0), label: "NAT table flushed", humanLabel: "NAT flush", detail: "47 entries cleared." },
  { id: "e10", sourceFile: "parallels-tools.log", category: "Tools", severity: "info", start: m(2, 0), end: m(2, 45), label: "Tools update check", humanLabel: "Update check", detail: "Current: 19.4.1-54962. Server: update.parallels.com" },
  { id: "e11", sourceFile: "parallels-tools.log", category: "Tools", severity: "info", start: m(3, 0), label: "Coherence mode activated", humanLabel: "Coherence on", detail: "Coherence mode enabled. Window list synchronization started." },
  { id: "e12", sourceFile: "vm.log", category: "Errors", severity: "danger", start: m(10, 5), label: "Guest tools communication timeout", humanLabel: "Tools timeout", detail: "prl_tools_service: no response in 5000ms. Retry 2/3.", correlates: ["e13"] },
  { id: "e13", sourceFile: "parallels-system.log", category: "Errors", severity: "warn", start: m(10, 6), label: "Guest heartbeat missed", humanLabel: "Heartbeat miss", detail: "VM guest heartbeat missed. Last seen 5.2s ago.", correlates: ["e12"] },
  { id: "e14", sourceFile: "parallels-system.log", category: "GUI Messages", severity: "info", start: m(29, 45, 112), end: m(29, 47, 80), label: "GUI_QUESTION_SHARE_FROM_MAC_TO_WIN", humanLabel: "Share prompt: Mac→Win", detail: "Short: Are you sure you want to disable sharing of macOS applications?\nLong: If you click Disable, you will not be able to open Windows files with macOS applications.", correlates: ["e16"] },
  { id: "e15", sourceFile: "parallels-system.log", category: "GUI Messages", severity: "info", start: m(29, 48, 201), end: m(29, 49, 434), label: "GUI_QUESTION_SHARE_FROM_WIN_TO_MAC", humanLabel: "Share prompt: Win→Mac", detail: "Short: Disable sharing of Windows apps?\nLong: macOS files won't open with Windows apps.", correlates: ["e17"] },
  { id: "e16", sourceFile: "parallels-system.log", category: "Config Diffs", severity: "info", start: m(29, 47, 118), end: m(29, 47, 179), label: "13 config changes", humanLabel: "Sharing disabled (13 keys)", detail: "SharedApplications.FromMacToWin: true→false\nGeneral.Profile.Custom: false→true\nSharedApplications.SmartMount: true→false\nSharedFolders.Enabled: true→false\n…(+9 more)", correlates: ["e14"] },
  { id: "e17", sourceFile: "parallels-system.log", category: "Config Diffs", severity: "info", start: m(29, 50, 10), end: m(29, 50, 44), label: "4 config changes", humanLabel: "Win sharing off (4 keys)", detail: "SharedApplications.FromWinToMac: true→false\nWebApplications.Enabled: true→false\n…(+2 more)", correlates: ["e15"] },
  { id: "e18", sourceFile: "vm.log", category: "Storage", severity: "warn", start: m(18, 0), label: "Disk trim queue full", humanLabel: "TRIM queue full", detail: "256 pending ops. New TRIM requests deferred." },
  { id: "e19", sourceFile: "parallels-system.log", category: "Errors", severity: "danger", start: m(25, 30), label: "Memory balloon deflation failed", humanLabel: "Balloon error", detail: "4096→2048MB failed. Guest: insufficient free memory. Pressure: high." },
  { id: "e20", sourceFile: "parallels-system.log", category: "GUI Messages", severity: "info", start: m(30, 12, 500), end: m(30, 14, 200), label: "GUI_QUESTION_ENABLE_USB_CONNECT", humanLabel: "USB auto-connect prompt", detail: "Enable automatic USB device connection?", correlates: ["e21"] },
  { id: "e21", sourceFile: "parallels-system.log", category: "Config Diffs", severity: "warn", start: m(32, 5), end: m(32, 5, 120), label: "2 config changes", humanLabel: "USB policy changed", detail: "USB.AutoConnect: ask→full\nUSB.AutoConnectDevices: ''→'*'", correlates: ["e20"] },
];

// ─── Helpers ─────────────────────────────────────────────────────────────
const pt = (s) => new Date(s).getTime();
const ft = (ms) => new Date(ms).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
const ftMs = (iso) => {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }) + "." + String(d.getMilliseconds()).padStart(3, "0");
};
const fd = (ms) => (ms < 1000 ? `${ms}ms` : ms < 60000 ? `${(ms / 1000).toFixed(1)}s` : `${(ms / 60000).toFixed(1)}m`);

// ─── Badge ───────────────────────────────────────────────────────────────
function Bdg({ children, v = "default", s }) {
  const b = BADGE[v] || BADGE.default;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", padding: "0px 5px",
      height: "18px", borderRadius: "3px", fontSize: "10px", fontWeight: 600,
      fontFamily: F.mono, letterSpacing: "0.01em", whiteSpace: "nowrap", lineHeight: 1,
      background: b.bg, color: b.fg, border: `1px solid ${b.bd}`, ...s,
    }}>
      {children}
    </span>
  );
}

// Severity dot
function SevDot({ severity }) {
  const color = { info: "#10B981", warn: "#F59E0B", danger: "#EF4444" }[severity] || "#D1D5DB";
  return <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: color, display: "inline-block", flexShrink: 0 }} />;
}

// ─── Main component ──────────────────────────────────────────────────────
export default function SubsystemLanesFull() {
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [collapsed, setCollapsed] = useState(() => new Set());
  const [viewStart, setViewStart] = useState(BASE - 60000);
  const [viewEnd, setViewEnd] = useState(BASE + 50 * 60000);
  const [showCorrelations, setShowCorrelations] = useState(true);
  const [tableFilter, setTableFilter] = useState("");
  const [flashId, setFlashId] = useState(null);

  const svgRef = useRef(null);
  const tableRef = useRef(null);
  const rowRefs = useRef({});
  const [dragging, setDragging] = useState(false);
  const dragState = useRef({});

  const active = hovered || selected;
  const correlatedIds = useMemo(() => {
    if (!active?.correlates) return new Set();
    return new Set(active.correlates);
  }, [active]);

  // Sorted events for the table
  const sortedEvents = useMemo(() => {
    return [...EVENTS].sort((a, b) => pt(a.start) - pt(b.start));
  }, []);

  // Filtered table events
  const tableEvents = useMemo(() => {
    if (!tableFilter) return sortedEvents;
    const q = tableFilter.toLowerCase();
    return sortedEvents.filter((e) =>
      (e.humanLabel || e.label).toLowerCase().includes(q) ||
      e.sourceFile.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q) ||
      (e.detail || "").toLowerCase().includes(q)
    );
  }, [sortedEvents, tableFilter]);

  // Group events by subsystem for timeline
  const lanes = useMemo(() => {
    return SUBSYSTEMS.map((sub) => {
      const events = EVENTS.filter((e) => (F2S[e.sourceFile] || "pd") === sub.id);
      return { ...sub, events };
    }).filter((lane) => lane.events.length > 0);
  }, []);

  // ─── Timeline layout ──────────────────────────────────────────────────
  const GUTTER = 110;
  const WIDTH = 760;
  const LANE_H = 48;
  const LANE_PAD = 5;
  const BAR_H = 14;
  const TOP = 26;
  const visibleLanes = lanes.filter((l) => !collapsed.has(l.id));
  const totalH = TOP + visibleLanes.length * LANE_H + 8;

  const toX = useCallback((ms) => GUTTER + ((ms - viewStart) / (viewEnd - viewStart)) * (WIDTH - GUTTER - 12), [viewStart, viewEnd]);
  const toT = useCallback((x) => viewStart + ((x - GUTTER) / (WIDTH - GUTTER - 12)) * (viewEnd - viewStart), [viewStart, viewEnd]);

  // Pan
  const onDown = (e) => {
    if (e.target.closest("[data-eid]")) return;
    setDragging(true);
    dragState.current = { sx: e.clientX, vs: viewStart, ve: viewEnd };
  };
  const onMove = (e) => {
    if (!dragging) return;
    const dx = e.clientX - dragState.current.sx;
    const r = dragState.current.ve - dragState.current.vs;
    const dt = (-dx / (WIDTH - GUTTER - 12)) * r;
    setViewStart(dragState.current.vs + dt);
    setViewEnd(dragState.current.ve + dt);
  };
  const onUp = () => setDragging(false);

  // Zoom
  const onWheel = (e) => {
    e.preventDefault();
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = e.clientX - rect.left;
    const mt = toT(mx);
    const f = e.deltaY > 0 ? 1.15 : 0.87;
    const ns = mt - (mt - viewStart) * f;
    const ne = mt + (viewEnd - mt) * f;
    if (ne - ns > 5000 && ne - ns < 86400000 * 3) { setViewStart(ns); setViewEnd(ne); }
  };

  // Ticks
  const ticks = useMemo(() => {
    const r = viewEnd - viewStart;
    const step = r < 120000 ? 10000 : r < 600000 ? 60000 : r < 3600000 ? 300000 : r < 14400000 ? 900000 : 3600000;
    const res = [];
    for (let t = Math.ceil(viewStart / step) * step; t <= viewEnd; t += step) res.push(t);
    return res;
  }, [viewStart, viewEnd]);

  // Stack events within a lane
  function stackEvents(events) {
    const sorted = [...events].sort((a, b) => pt(a.start) - pt(b.start));
    const rows = [];
    sorted.forEach((ev) => {
      const es = pt(ev.start);
      const ee = ev.end ? pt(ev.end) : es + 30000;
      let placed = false;
      for (let r = 0; r < rows.length; r++) {
        if (es >= rows[r]) { rows[r] = ee; ev._row = r; placed = true; break; }
      }
      if (!placed) { ev._row = rows.length; rows.push(ee); }
    });
    return { events: sorted, rowCount: Math.max(rows.length, 1) };
  }

  // ─── Scroll-to-row logic ──────────────────────────────────────────────
  const scrollToEvent = useCallback((ev) => {
    const row = rowRefs.current[ev.id];
    if (row && tableRef.current) {
      row.scrollIntoView({ behavior: "smooth", block: "center" });
      setFlashId(ev.id);
      setTimeout(() => setFlashId(null), 400);
    }
  }, []);

  // Select from timeline → scroll table
  const selectFromTimeline = useCallback((ev) => {
    setSelected((prev) => prev?.id === ev.id ? null : ev);
    if (ev) scrollToEvent(ev);
  }, [scrollToEvent]);

  // Select from table → center in timeline
  const selectFromTable = useCallback((ev) => {
    setSelected((prev) => prev?.id === ev.id ? null : ev);
    // Center the event in the timeline view
    const evTime = pt(ev.start);
    const halfRange = (viewEnd - viewStart) / 2;
    setViewStart(evTime - halfRange);
    setViewEnd(evTime + halfRange);
  }, [viewStart, viewEnd]);

  // Subsystem color for a source file
  const subColor = (file) => {
    const subId = F2S[file] || "pd";
    return SUBSYSTEMS.find((s) => s.id === subId)?.color || C.t3;
  };

  return (
    <div style={{
      fontFamily: F.sans, background: C.bg, maxWidth: "920px",
      margin: "0 auto", padding: "12px 16px", color: C.t0,
      display: "flex", flexDirection: "column", height: "100vh", boxSizing: "border-box",
    }}>
      {/* ─── Header ─── */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexShrink: 0 }}>
        <span style={{ fontSize: "15px", fontWeight: 800 }}>⏱ Subsystem Lanes</span>
        <Bdg v="purple">v3-full</Bdg>
        <Bdg v="dim">{EVENTS.length} events</Bdg>
        <div style={{ flex: 1 }} />
        <label style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10px", fontFamily: F.mono, color: C.t3, cursor: "pointer" }}>
          <input type="checkbox" checked={showCorrelations} onChange={(e) => setShowCorrelations(e.target.checked)} style={{ margin: 0 }} />
          correlations
        </label>
      </div>

      {/* ─── Legend ─── */}
      <div style={{ display: "flex", gap: "3px", marginBottom: "6px", flexWrap: "wrap", flexShrink: 0 }}>
        {SUBSYSTEMS.map((sub) => (
          <Bdg key={sub.id} v={sub.bv} s={{ cursor: "pointer", opacity: collapsed.has(sub.id) ? 0.35 : 1 }}>
            <span onClick={() => setCollapsed((p) => { const n = new Set(p); n.has(sub.id) ? n.delete(sub.id) : n.add(sub.id); return n; })}>
              {sub.icon} {sub.label}
            </span>
          </Bdg>
        ))}
        <div style={{ width: "1px", background: C.b2, margin: "0 4px" }} />
        {Object.entries(CAT_C).slice(0, 6).map(([cat, c]) => (
          <span key={cat} style={{
            display: "inline-flex", alignItems: "center", gap: "3px",
            fontSize: "9px", fontFamily: F.mono, color: c.fg, fontWeight: 500,
          }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "2px", background: c.bg, border: `1px solid ${c.bd}` }} />
            {cat}
          </span>
        ))}
      </div>

      {/* ─── Timeline SVG ─── */}
      <div
        ref={svgRef}
        onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
        onWheel={onWheel}
        style={{
          border: `1px solid ${C.b1}`, borderRadius: "3px 3px 0 0", background: "#fff",
          cursor: dragging ? "grabbing" : "grab", userSelect: "none", overflow: "hidden", flexShrink: 0,
        }}
      >
        <svg width={WIDTH} height={totalH} style={{ display: "block" }}>
          {/* Time axis */}
          {ticks.map((tick) => {
            const x = toX(tick);
            if (x < GUTTER || x > WIDTH - 12) return null;
            return (
              <g key={tick}>
                <line x1={x} y1={TOP - 2} x2={x} y2={totalH} stroke={C.b0} />
                <text x={x} y={TOP - 7} textAnchor="middle" fontSize="9" fontFamily={F.mono} fill={C.t4} fontWeight="500">{ft(tick)}</text>
              </g>
            );
          })}
          <line x1={GUTTER - 1} y1={0} x2={GUTTER - 1} y2={totalH} stroke={C.b1} />

          {/* Lanes */}
          {visibleLanes.map((lane, li) => {
            const laneY = TOP + li * LANE_H;
            const { events: stacked, rowCount } = stackEvents(lane.events);

            return (
              <g key={lane.id}>
                <rect x={0} y={laneY} width={WIDTH} height={LANE_H} fill={li % 2 === 0 ? "#FAFBFD" : "#fff"} />
                <line x1={0} y1={laneY + LANE_H} x2={WIDTH} y2={laneY + LANE_H} stroke={C.b0} />
                <rect x={0} y={laneY} width="3" height={LANE_H} fill={lane.color} opacity="0.5" />

                <text x={8} y={laneY + 15} fontSize="11" fill={C.t4} style={{ opacity: 0.6 }}>{lane.icon}</text>
                <text x={26} y={laneY + 15} fontSize="11" fontWeight="700" fontFamily={F.sans} fill={C.t1}>{lane.label}</text>
                <text x={26} y={laneY + 28} fontSize="8.5" fontFamily={F.mono} fill={C.t4}>{lane.events.length} events</text>

                {stacked.map((ev) => {
                  const es = pt(ev.start);
                  const ee = ev.end ? pt(ev.end) : es;
                  const x1 = toX(es);
                  const x2 = ev.end ? toX(ee) : x1;
                  const w = Math.max(ev.end ? x2 - x1 : 6, 4);
                  if (x1 > WIDTH || x2 < GUTTER) return null;
                  const cx = Math.max(x1, GUTTER);
                  const cw = Math.min(w, WIDTH - 12 - cx);

                  const isActive = active?.id === ev.id;
                  const isCor = correlatedIds.has(ev.id);
                  const catColors = CAT_C[ev.category] || CAT_C.Tools;
                  const focused = isActive || isCor;

                  const rOff = ev._row || 0;
                  const bh = Math.min(BAR_H, (LANE_H - LANE_PAD * 2) / rowCount - 1);
                  const by = laneY + LANE_PAD + rOff * (bh + 1);

                  return (
                    <g key={ev.id} data-eid={ev.id}
                      onClick={(e) => { e.stopPropagation(); selectFromTimeline(ev); }}
                      onMouseEnter={() => setHovered(ev)}
                      onMouseLeave={() => setHovered(null)}
                      style={{ cursor: "pointer" }}>
                      <rect x={cx} y={by} width={cw} height={bh} rx="2"
                        fill={focused ? catColors.bg : "#F1F5F9"}
                        stroke={isActive ? catColors.fg : isCor ? catColors.fg : "#E2E8F0"}
                        strokeWidth={focused ? 1.5 : 0.5}
                        style={{ transition: "all 60ms" }} />
                      {ev.severity === "danger" && <rect x={cx} y={by} width="2.5" height={bh} rx="1" fill={BADGE.red.fg} />}
                      {ev.severity === "warn" && <rect x={cx} y={by} width="2.5" height={bh} rx="1" fill={BADGE.amber.fg} />}
                      {!ev.end && <circle cx={cx + 3} cy={by + bh / 2} r="2" fill={focused ? catColors.fg : C.t4} opacity={focused ? 0.8 : 0.3} />}
                      {cw > 45 && bh >= 12 && (
                        <text x={cx + (ev.end ? 5 : 10)} y={by + bh / 2} dominantBaseline="middle" fontSize="8.5"
                          fontWeight="600" fontFamily={F.sans} fill={focused ? catColors.fg : C.t4}
                          style={{ pointerEvents: "none" }}>
                          {(ev.humanLabel || ev.label).slice(0, Math.floor(cw / 5))}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* Correlation lines */}
          {showCorrelations && active?.correlates?.map((cid) => {
            const corEv = EVENTS.find((e) => e.id === cid);
            if (!corEv) return null;
            const aLi = visibleLanes.findIndex((l) => l.events.some((e) => e.id === active.id));
            const cLi = visibleLanes.findIndex((l) => l.events.some((e) => e.id === cid));
            if (aLi < 0 || cLi < 0) return null;
            const ay = TOP + aLi * LANE_H + LANE_H / 2;
            const cy = TOP + cLi * LANE_H + LANE_H / 2;
            const ax = Math.max(toX(pt(active.start)), GUTTER);
            const ccx = Math.max(toX(pt(corEv.start)), GUTTER);
            return <line key={cid} x1={ax} y1={ay} x2={ccx} y2={cy} stroke="#3B82F6" strokeWidth="1" strokeDasharray="3,2" opacity="0.5" style={{ pointerEvents: "none" }} />;
          })}
        </svg>
      </div>

      {/* Time range */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0 4px", flexShrink: 0 }}>
        <span style={{ fontSize: "9px", color: C.t4 }}>{ft(viewStart)} — {ft(viewEnd)} ({fd(viewEnd - viewStart)})</span>
        <span style={{ fontSize: "9px", color: C.t4 }}>scroll to zoom · drag to pan · click event to jump in table ↓</span>
      </div>

      {/* ─── Detail panel (between timeline and table) ─── */}
      {selected && (
        <div style={{ border: `1px solid ${C.b1}`, borderRadius: "3px", overflow: "hidden", marginBottom: "4px", flexShrink: 0 }}>
          <div style={{ padding: "5px 10px", background: C.headerBg, borderBottom: `1px solid ${C.b1}`, display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700 }}>{selected.humanLabel || selected.label}</span>
            <Bdg v={CAT_BV[selected.category] || "default"} s={{ height: "16px", fontSize: "9px" }}>{selected.category}</Bdg>
            {selected.severity === "warn" && <Bdg v="amber" s={{ height: "16px", fontSize: "9px" }}>warn</Bdg>}
            {selected.severity === "danger" && <Bdg v="red" s={{ height: "16px", fontSize: "9px" }}>error</Bdg>}
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: "9px", fontFamily: F.mono, color: C.t4 }}>{selected.sourceFile}</span>
            <span onClick={() => setSelected(null)} style={{ cursor: "pointer", fontSize: "12px", color: C.t4, marginLeft: "4px", lineHeight: 1 }}>✕</span>
          </div>
          <div style={{ padding: "5px 10px", background: C.panelBg, display: "flex", gap: "16px" }}>
            {/* Left: KV */}
            <div style={{ display: "grid", gridTemplateColumns: "55px 1fr", gap: "1px 6px", fontSize: "10.5px", minWidth: "200px" }}>
              <span style={{ color: C.t3, fontWeight: 500 }}>Start</span>
              <span style={{ fontFamily: F.mono, fontSize: "10px", color: C.t2 }}>{ftMs(selected.start)}</span>
              {selected.end && <>
                <span style={{ color: C.t3, fontWeight: 500 }}>End</span>
                <span style={{ fontFamily: F.mono, fontSize: "10px", color: C.t2 }}>{ftMs(selected.end)}</span>
                <span style={{ color: C.t3, fontWeight: 500 }}>Duration</span>
                <span style={{ fontFamily: F.mono, fontSize: "10px", color: C.t2 }}>{fd(pt(selected.end) - pt(selected.start))}</span>
              </>}
              <span style={{ color: C.t3, fontWeight: 500 }}>Lane</span>
              <span>{(() => { const s = SUBSYSTEMS.find((s) => s.id === (F2S[selected.sourceFile] || "pd")); return s ? <Bdg v={s.bv} s={{ height: "15px", fontSize: "9px" }}>{s.icon} {s.label}</Bdg> : "—"; })()}</span>
              {selected.humanLabel && <>
                <span style={{ color: C.t3, fontWeight: 500 }}>Raw</span>
                <span style={{ fontFamily: F.mono, fontSize: "9px", color: C.t4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selected.label}</span>
              </>}
            </div>
            {/* Right: Detail + correlations */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {selected.detail && (
                <pre style={{
                  fontFamily: F.mono, fontSize: "10px", color: C.t2, margin: 0,
                  whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: "1.35",
                  padding: "3px 6px", background: "#fff", border: `1px solid ${C.b0}`,
                  borderRadius: "2px", maxHeight: "60px", overflow: "auto",
                }}>{selected.detail}</pre>
              )}
              {selected.correlates?.length > 0 && (
                <div style={{ marginTop: "4px", display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: C.t4 }}>linked:</span>
                  {selected.correlates.map((cid) => {
                    const ce = EVENTS.find((e) => e.id === cid);
                    if (!ce) return null;
                    return (
                      <span key={cid} onClick={() => { setSelected(ce); scrollToEvent(ce); }}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: "3px",
                          padding: "1px 5px", borderRadius: "3px", cursor: "pointer",
                          border: `1px solid ${C.b1}`, background: "#fff", fontSize: "9.5px",
                          fontWeight: 600, color: C.t1,
                        }}>
                        {ce.humanLabel || ce.label}
                        <span style={{ fontFamily: F.mono, fontSize: "8px", color: C.t4 }}>{ce.sourceFile.replace(".log", "")}</span>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Joined Log Table ─── */}
      <div style={{ flex: 1, minHeight: "180px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Table header bar */}
        <div style={{
          display: "flex", alignItems: "center", gap: "6px",
          padding: "4px 8px", background: C.headerBg,
          borderBottom: `1px solid ${C.b1}`, borderTop: `1px solid ${C.b1}`,
          flexShrink: 0,
        }}>
          <span style={{ fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: C.t4 }}>
            Joined Log
          </span>
          <Bdg v="dim" s={{ height: "16px", fontSize: "9px" }}>{tableEvents.length} rows</Bdg>
          <div style={{ flex: 1 }} />
          <input
            type="text" placeholder="Filter events…" value={tableFilter}
            onChange={(e) => setTableFilter(e.target.value)}
            style={{
              width: "180px", padding: "2px 6px", fontSize: "10px", fontFamily: F.mono,
              border: `1px solid ${C.b1}`, borderRadius: "3px", outline: "none",
              background: "#fff", color: C.t2,
            }}
          />
        </div>

        {/* Column headers */}
        <div style={{
          display: "flex", alignItems: "center", gap: 0,
          padding: "3px 8px", background: "#FAFBFC",
          borderBottom: `1px solid ${C.b1}`, flexShrink: 0,
          fontSize: "9.5px", fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "0.04em", color: C.t3,
        }}>
          <span style={{ width: "82px", flexShrink: 0 }}>Time</span>
          <span style={{ width: "120px", flexShrink: 0 }}>Source</span>
          <span style={{ width: "80px", flexShrink: 0 }}>Category</span>
          <span style={{ width: "18px", flexShrink: 0 }} />
          <span style={{ flex: 1 }}>Event</span>
        </div>

        {/* Scrollable rows */}
        <div ref={tableRef} style={{ flex: 1, overflow: "auto" }}>
          {tableEvents.map((ev, i) => {
            const isSel = selected?.id === ev.id;
            const isCor = selected && correlatedIds.has(ev.id);
            const isHov = hovered?.id === ev.id;
            const isFlash = flashId === ev.id;

            let bg = i % 2 === 0 ? "#fff" : "#FAFBFD";
            let borderLeft = "3px solid transparent";
            if (isSel) { bg = C.sel; borderLeft = `3px solid ${C.selBorder}`; }
            else if (isCor) { bg = C.corBg; borderLeft = `3px solid ${C.corBorder}`; }
            else if (isHov) { bg = C.corBg; }
            if (isFlash) { bg = C.flash; }

            return (
              <div
                key={ev.id}
                ref={(el) => { rowRefs.current[ev.id] = el; }}
                onClick={() => selectFromTable(ev)}
                onMouseEnter={() => setHovered(ev)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  display: "flex", alignItems: "center", gap: 0,
                  padding: "0 8px", height: "24px", minHeight: "24px",
                  borderBottom: `1px solid ${C.b0}`, borderLeft,
                  background: bg, cursor: "pointer", userSelect: "none",
                  transition: isFlash ? "background 300ms ease-out" : "background 60ms",
                }}
              >
                {/* Time */}
                <span style={{
                  width: "82px", flexShrink: 0, fontSize: "10px",
                  fontFamily: F.mono, color: C.t2, fontWeight: 400,
                }}>
                  {ftMs(ev.start)}
                </span>

                {/* Source */}
                <span
                  title={ev.sourceFile}
                  style={{
                    width: "120px", flexShrink: 0, fontSize: "9.5px",
                    fontFamily: F.mono, color: subColor(ev.sourceFile),
                    fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis",
                    whiteSpace: "nowrap", opacity: 0.8,
                  }}
                >
                  {ev.sourceFile}
                </span>

                {/* Category badge */}
                <span style={{ width: "80px", flexShrink: 0 }}>
                  <Bdg v={CAT_BV[ev.category] || "default"} s={{ height: "15px", fontSize: "8.5px", padding: "0 4px" }}>
                    {ev.category.length > 10 ? ev.category.slice(0, 9) + "…" : ev.category}
                  </Bdg>
                </span>

                {/* Severity dot */}
                <span style={{ width: "18px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <SevDot severity={ev.severity} />
                </span>

                {/* Label */}
                <span style={{
                  flex: 1, fontSize: "11px", fontFamily: F.sans,
                  fontWeight: isSel ? 600 : 400,
                  color: isSel ? C.t0 : C.t1,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {ev.humanLabel || ev.label}
                </span>

                {/* Correlation indicator */}
                {ev.correlates && ev.correlates.length > 0 && (
                  <span style={{
                    fontSize: "9px", fontFamily: F.mono, color: C.selBorder,
                    opacity: 0.5, flexShrink: 0, marginLeft: "4px",
                  }}>
                    ⟷{ev.correlates.length}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
