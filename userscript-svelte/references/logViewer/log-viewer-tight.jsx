import { useState, useRef, useEffect, useMemo, useCallback } from "react";

// ─── Tokens ──────────────────────────────────────────────────────────────
const F = {
  sans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  mono: "'SF Mono', Consolas, monospace",
};
const C = {
  bg: "#FFFFFF",
  panelBg: "#FAFBFC",
  headerBg: "#F8FAFC",
  b0: "#F1F5F9",
  b1: "#E2E8F0",
  b2: "#E4E4E7",
  t0: "#0F172A",
  t1: "#1E293B",
  t2: "#64748B",
  t3: "#94A3B8",
  t4: "#A1A1AA",
  sel: "#EFF6FF",
  selBorder: "#3B82F6",
};

// ─── Per-log-file color assignments ──────────────────────────────────────
// Stable, distinguishable colors for up to 6 log files.
// These are used both in the selector chips AND the Source column.
const LOG_COLORS = [
  { fg: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE", dot: "#3B82F6" }, // blue
  { fg: "#7C3AED", bg: "#F3E8FF", border: "#DDD6FE", dot: "#8B5CF6" }, // purple
  { fg: "#059669", bg: "#ECFDF5", border: "#A7F3D0", dot: "#10B981" }, // green
  { fg: "#D97706", bg: "#FEF3C7", border: "#FDE68A", dot: "#F59E0B" }, // amber
  { fg: "#DC2626", bg: "#FEE2E2", border: "#FECACA", dot: "#EF4444" }, // red
  { fg: "#0891B2", bg: "#ECFEFF", border: "#A5F3FC", dot: "#06B6D4" }, // cyan
];

// ─── Level colors ────────────────────────────────────────────────────────
const LVL = {
  F: { label: "F", color: "#DC2626", bg: "#FEE2E2" }, // fatal
  E: { label: "E", color: "#DC2626", bg: "#FEE2E2" }, // error
  W: { label: "W", color: "#D97706", bg: "#FEF3C7" }, // warning
  I: { label: "I", color: "#2563EB", bg: "#EFF6FF" }, // info
  D: { label: "D", color: "#64748B", bg: "#F1F5F9" }, // debug
  T: { label: "T", color: "#94A3B8", bg: "#F8FAFC" }, // trace
};

// ─── Generate synthetic log data ─────────────────────────────────────────
// Simulates tail-mode: we have the LAST 20,000 lines of each log.
const LOG_FILES = [
  { name: "vm.log", fullName: "vm.log", size: "1.9 MiB" },
  { name: "prl-sys.log", fullName: "parallels-system.log", size: "5.2 MiB" },
  { name: "tools.log", fullName: "tools.log", size: "1.3 MiB" },
];

const COMPONENTS = {
  "vm.log": ["MonitorArm", "USB", "HddUtils", "VGA", "NetAdapter", "MemBalloon", "Snapshot", "SharedFolders", "Coherence", "D3D"],
  "prl-sys.log": ["Dispatcher", "License", "ConfigDiff", "GUI", "NetService", "UpdateCheck", "Backup", "VMController"],
  "tools.log": ["ToolsSvc", "DnD", "SharedProfile", "Clipboard", "TimeSync", "AutoUpdate", "CoherenceHelper"],
};

const MESSAGES = {
  MonitorArm: [
    "type:00000013 state:00000000 not started",
    "phymemrange_enable 0x10007000",
    "type:00000012 state:00000001 not started",
    "interrupt handler registered for vector 0x33",
    "state transition: idle → running",
  ],
  USB: [
    "Reset",
    "DisableEndpoint while io_cnt is not zero",
    "ep create: dscr 07:05, attr 03, mps 64",
    "superspeed ep create: bpi 64, mps 1024",
    "device attached: vid=0x05ac pid=0x8290",
    "SET_CONFIGURATION(1) succeeded",
    "hub port 2: device connected (high-speed)",
  ],
  HddUtils: [
    "total 250 MB, 4152 reqs, 3483 msec",
    "rh total reqs 4152 / 3030",
    "rh saved in 0 msec",
    "compact: trimmed 120 MB, ratio 0.82",
    "flush queue: 47 pending ops",
  ],
  VGA: [
    "resolution changed to 2560x1600",
    "display 0: 2560x1600@60Hz (scaled 2x)",
    "VRAM usage: 48MB / 128MB",
    "cursor shape updated (32x32 ARGB)",
  ],
  NetAdapter: [
    "link state: up, speed 1000 Mbps",
    "DHCP lease obtained: 10.211.55.5",
    "DNS server set: 10.211.55.1",
    "ARP reply: 10.211.55.1 is at 00:1c:42:00:00:08",
    "TX packets: 14523, RX packets: 18201",
  ],
  MemBalloon: [
    "inflate: 2048 → 3072 MB",
    "deflate: 3072 → 2048 MB",
    "guest free memory: 1420 MB",
    "pressure: low, target: 2048 MB",
  ],
  Snapshot: [
    "creating snapshot 'Checkpoint-1'",
    "snapshot created in 1.2 sec",
    "reverting to snapshot 'Clean Install'",
  ],
  SharedFolders: [
    "mount: /Users/nikolai → Z:\\",
    "file notification: /Users/nikolai/Documents changed",
    "unmount requested by guest",
  ],
  Coherence: [
    "window added: WINWORD.EXE (hwnd=0x00120A)",
    "window removed: Calculator (hwnd=0x001106)",
    "taskbar sync: 12 windows",
    "focus changed to explorer.exe",
  ],
  D3D: [
    "D3D11 device created for WINWORD.EXE",
    "shader compilation: 340ms (cached: 12/15)",
    "present: 16.7ms avg (60fps target)",
    "texture upload: 4.2 MB (compressed)",
  ],
  Dispatcher: [
    "VM started: {56dfbb15-0ed0-4d2b-b4f6-a18d3a4cb301}",
    "VM state: running → suspended",
    "config saved to vm-config.pvs",
    "resource limit check passed",
  ],
  License: [
    "license check: Pro, valid until 2026-12-01",
    "feature flags: coherence=1, 3d=1, network=1",
    "activation server: ok (120ms)",
  ],
  ConfigDiff: [
    "SharedApplications.FromMacToWin: true → false",
    "General.Profile.Custom: false → true",
    "SharedFolders.Enabled: true → false",
    "USB.AutoConnect: ask → full",
    "Settings.Tools.SmartMount: true → false",
  ],
  GUI: [
    "GUI_QUESTION_SHARE_FROM_MAC_TO_WIN shown",
    "user response: Disable",
    "GUI_QUESTION_SHARE_FROM_WIN_TO_MAC shown",
    "GUI_QUESTION_ENABLE_USB_CONNECT shown",
    "user response: Enable",
    "notification: 'Tools update available'",
  ],
  NetService: [
    "NAT engine started on 10.211.55.1",
    "DHCP server: lease 10.211.55.5 to 00:1c:42:a3:b7:ef",
    "DNS proxy: forwarding to 192.168.1.1",
    "NAT table flushed: 47 entries cleared",
    "port forward: host:8080 → guest:80",
  ],
  UpdateCheck: [
    "checking update.parallels.com",
    "current: 19.4.1-54962, latest: 19.4.2-55001",
    "update available, user notified",
  ],
  Backup: [
    "Time Machine backup started",
    "excluding VM bundles: 2 items",
    "backup completed in 4.2 min",
  ],
  VMController: [
    "start request for VM {56dfbb15}",
    "hypervisor attached, 4 vCPU allocated",
    "memory allocated: 8192 MB",
    "boot device: disk0 (hdd0.hdd)",
  ],
  ToolsSvc: [
    "service started, protocol v4.2",
    "host handshake complete",
    "guest OS: Windows 11 (26200)",
    "feature negotiation: 14/14 ok",
  ],
  DnD: [
    "drag started: file (1 item)",
    "drop accepted by guest",
    "transfer complete: 1.2 MB in 0.3s",
    "clipboard sync: text (240 chars)",
  ],
  SharedProfile: [
    "profile sync: Desktop, Documents, Downloads",
    "conflict: file modified on both sides, keeping guest version",
    "sync complete: 3 dirs, 47 files",
  ],
  Clipboard: [
    "clipboard changed: text (512 bytes)",
    "clipboard changed: image (1.4 MB PNG)",
    "paste to guest: text",
    "format negotiation: CF_UNICODETEXT",
  ],
  TimeSync: [
    "guest clock drift: +1.2s, adjusting",
    "NTP check: offset 0.003s",
    "timezone sync: America/Chicago → guest",
  ],
  AutoUpdate: [
    "checking for tools update",
    "tools version: 19.4.1.54962 (current)",
    "no update available",
  ],
  CoherenceHelper: [
    "coherence mode: enabled",
    "window list refresh: 14 windows",
    "taskbar update sent",
  ],
};

// Generate realistic log data
function generateLogs() {
  const rows = [];
  let id = 0;
  // Base time: simulate ~45 minutes of logs
  const baseTime = new Date("2026-01-08T13:00:00.000Z").getTime();
  const endTime = baseTime + 45 * 60 * 1000;

  // We want ~800 rows to keep the prototype snappy but representative
  const TARGET = 800;
  const perFile = Math.floor(TARGET / LOG_FILES.length);

  LOG_FILES.forEach((file, fi) => {
    const comps = COMPONENTS[file.name];
    for (let i = 0; i < perFile; i++) {
      const comp = comps[Math.floor(Math.random() * comps.length)];
      const msgs = MESSAGES[comp] || ["unknown message"];
      const msg = msgs[Math.floor(Math.random() * msgs.length)];
      const time = baseTime + Math.random() * (endTime - baseTime);
      const levels = ["I", "I", "I", "I", "W", "W", "F", "D", "D", "I"];
      const lvl = levels[Math.floor(Math.random() * levels.length)];
      const pid = 30840 + Math.floor(Math.random() * 100);
      const ctx = Math.floor(Math.random() * 0xffffff)
        .toString(16)
        .padStart(6, "0");

      rows.push({
        id: id++,
        source: file.name,
        sourceIdx: fi,
        time,
        timeStr: "", // filled below
        lvl,
        comp,
        pid,
        ctx,
        kind: "entry",
        message: msg,
        line: 15000 + i,
      });
    }
  });

  // Sort by time (ascending) — TAIL means we see the end
  rows.sort((a, b) => a.time - b.time);

  // Format times after sort
  rows.forEach((r, i) => {
    r.id = i;
    const d = new Date(r.time);
    const hh = String(d.getUTCHours()).padStart(2, "0");
    const mm = String(d.getUTCMinutes()).padStart(2, "0");
    const ss = String(d.getUTCSeconds()).padStart(2, "0");
    const ms = String(d.getUTCMilliseconds()).padStart(3, "0");
    r.timeStr = `${hh}:${mm}:${ss}.${ms}`;
    r.line = 20000 - (rows.length - i); // tail: last lines
  });

  return rows;
}

const ALL_ROWS = generateLogs();

// ─── Components ──────────────────────────────────────────────────────────

function LevelBadge({ lvl }) {
  const meta = LVL[lvl] || LVL.I;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "16px",
        height: "16px",
        borderRadius: "2px",
        fontSize: "9px",
        fontWeight: 700,
        fontFamily: F.mono,
        background: meta.bg,
        color: meta.color,
        lineHeight: 1,
        flexShrink: 0,
      }}
    >
      {meta.label}
    </span>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────
export default function LogViewer() {
  const [enabledFiles, setEnabledFiles] = useState(() => new Set(LOG_FILES.map((f) => f.name)));
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const tableBodyRef = useRef(null);
  const rowRefs = useRef({});
  const searchTimerRef = useRef(null);
  const hasScrolledRef = useRef(false);

  // Debounced search — decoupled from table rendering
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 150);
    return () => clearTimeout(searchTimerRef.current);
  }, [searchQuery]);

  // Filtered rows
  const filteredRows = useMemo(() => {
    let rows = ALL_ROWS;
    if (enabledFiles.size < LOG_FILES.length) {
      rows = rows.filter((r) => enabledFiles.has(r.source));
    }
    if (debouncedQuery) {
      const q = debouncedQuery.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.message.toLowerCase().includes(q) ||
          r.comp.toLowerCase().includes(q) ||
          r.source.toLowerCase().includes(q)
      );
    }
    return rows;
  }, [enabledFiles, debouncedQuery]);

  // Stats
  const stats = useMemo(() => {
    const levels = { F: 0, E: 0, W: 0, I: 0, D: 0, T: 0 };
    filteredRows.forEach((r) => {
      if (levels[r.lvl] !== undefined) levels[r.lvl]++;
    });
    return levels;
  }, [filteredRows]);

  // Scroll to bottom on first render and when data changes
  useEffect(() => {
    if (tableBodyRef.current && !hasScrolledRef.current) {
      // Use requestAnimationFrame to ensure DOM is rendered
      requestAnimationFrame(() => {
        tableBodyRef.current.scrollTop = tableBodyRef.current.scrollHeight;
        hasScrolledRef.current = true;
      });
    }
  }, [filteredRows]);

  // Select row + open detail
  const handleRowClick = useCallback((row) => {
    setSelectedRow(row);
    setDetailOpen(true);
  }, []);

  // Toggle file
  const toggleFile = (name) => {
    setEnabledFiles((prev) => {
      const n = new Set(prev);
      n.has(name) ? n.delete(name) : n.add(name);
      return n;
    });
  };

  // Detail panel width
  const DETAIL_W = detailOpen && selectedRow ? 300 : 0;

  return (
    <div
      style={{
        fontFamily: F.sans,
        background: C.bg,
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
        color: C.t0,
        fontSize: "11px",
      }}
    >
      {/* ─── Top bar: log selector + search ─── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 12px",
          borderBottom: `1px solid ${C.b1}`,
          background: C.headerBg,
          flexShrink: 0,
        }}
      >
        {/* Log file chips */}
        {LOG_FILES.map((file, fi) => {
          const lc = LOG_COLORS[fi];
          const on = enabledFiles.has(file.name);
          return (
            <div
              key={file.name}
              onClick={() => toggleFile(file.name)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "3px 8px",
                borderRadius: "4px",
                cursor: "pointer",
                border: `1px solid ${on ? lc.border : C.b1}`,
                background: on ? lc.bg : "#fff",
                opacity: on ? 1 : 0.45,
                transition: "all 80ms",
                userSelect: "none",
              }}
            >
              {/* Checkbox */}
              <span
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "2px",
                  border: `1.5px solid ${on ? lc.fg : C.b1}`,
                  background: on ? lc.fg : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {on && (
                  <svg width="7" height="7" viewBox="0 0 12 12">
                    <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              {/* Name */}
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  fontFamily: F.mono,
                  color: on ? lc.fg : C.t3,
                }}
              >
                {file.name}
              </span>
              {/* Size */}
              <span
                style={{
                  fontSize: "9px",
                  fontFamily: F.mono,
                  color: on ? lc.fg : C.t4,
                  opacity: 0.6,
                }}
              >
                {file.size}
              </span>
            </div>
          );
        })}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Stats badges */}
        <div style={{ display: "flex", gap: "3px", alignItems: "center" }}>
          {stats.F > 0 && (
            <span style={{ fontSize: "9px", fontFamily: F.mono, fontWeight: 700, color: LVL.F.color, background: LVL.F.bg, padding: "1px 4px", borderRadius: "2px" }}>
              {stats.F} F
            </span>
          )}
          {stats.W > 0 && (
            <span style={{ fontSize: "9px", fontFamily: F.mono, fontWeight: 700, color: LVL.W.color, background: LVL.W.bg, padding: "1px 4px", borderRadius: "2px" }}>
              {stats.W} W
            </span>
          )}
          <span style={{ fontSize: "9px", fontFamily: F.mono, color: C.t4 }}>
            {filteredRows.length.toLocaleString()} rows
          </span>
        </div>

        {/* Divider */}
        <div style={{ width: "1px", height: "18px", background: C.b2 }} />

        {/* Search */}
        <div style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Search message/raw…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "200px",
              padding: "4px 8px 4px 24px",
              fontSize: "11px",
              fontFamily: F.mono,
              border: `1px solid ${C.b1}`,
              borderRadius: "3px",
              outline: "none",
              background: "#fff",
              color: C.t1,
            }}
          />
          <svg
            width="12"
            height="12"
            viewBox="0 0 16 16"
            fill="none"
            style={{ position: "absolute", left: "7px", top: "6px", opacity: 0.35 }}
          >
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="2" />
            <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          {searchQuery && (
            <span
              onClick={() => setSearchQuery("")}
              style={{
                position: "absolute",
                right: "6px",
                top: "4px",
                cursor: "pointer",
                fontSize: "12px",
                color: C.t4,
                lineHeight: 1,
              }}
            >
              ✕
            </span>
          )}
        </div>
      </div>

      {/* ─── Content area: table + detail slide-over ─── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* ─── Table ─── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
          {/* Column headers */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "0 8px",
              height: "22px",
              borderBottom: `1px solid ${C.b1}`,
              background: C.panelBg,
              flexShrink: 0,
              fontSize: "9px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              color: C.t3,
              userSelect: "none",
            }}
          >
            <span style={{ width: "70px", flexShrink: 0 }}>Source</span>
            <span style={{ width: "90px", flexShrink: 0 }}>Time</span>
            <span style={{ width: "18px", flexShrink: 0, textAlign: "center" }}>Lv</span>
            <span style={{ width: "90px", flexShrink: 0, paddingLeft: "6px" }}>Comp</span>
            <span style={{ width: "80px", flexShrink: 0, paddingLeft: "4px" }}>Pid:ctx</span>
            <span style={{ flex: 1, paddingLeft: "4px" }}>Message</span>
          </div>

          {/* Scrollable rows */}
          <div
            ref={tableBodyRef}
            style={{
              flex: 1,
              overflow: "auto",
              overflowAnchor: "none",
            }}
          >
            {filteredRows.map((row, i) => {
              const isSel = selectedRow?.id === row.id;
              const lc = LOG_COLORS[row.sourceIdx];
              const isF = row.lvl === "F" || row.lvl === "E";
              const isW = row.lvl === "W";

              let bg = i % 2 === 0 ? "#fff" : "#FAFBFD";
              let leftBorder = "2px solid transparent";
              if (isSel) {
                bg = C.sel;
                leftBorder = `2px solid ${C.selBorder}`;
              } else if (isF) {
                bg = i % 2 === 0 ? "#FFFBFB" : "#FFF5F5";
              }

              return (
                <div
                  key={row.id}
                  ref={(el) => { rowRefs.current[row.id] = el; }}
                  onClick={() => handleRowClick(row)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "0 8px",
                    height: "22px",
                    minHeight: "22px",
                    borderBottom: `1px solid ${C.b0}`,
                    borderLeft: leftBorder,
                    background: bg,
                    cursor: "pointer",
                    userSelect: "none",
                    transition: "background 40ms",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSel) e.currentTarget.style.background = "#F8FAFF";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSel) e.currentTarget.style.background = bg;
                  }}
                >
                  {/* Source — colored by log file */}
                  <span
                    style={{
                      width: "70px",
                      flexShrink: 0,
                      fontSize: "10px",
                      fontFamily: F.mono,
                      fontWeight: 600,
                      color: lc.fg,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {row.source}
                  </span>

                  {/* Time */}
                  <span
                    style={{
                      width: "90px",
                      flexShrink: 0,
                      fontSize: "10px",
                      fontFamily: F.mono,
                      color: C.t2,
                    }}
                  >
                    {row.timeStr}
                  </span>

                  {/* Level */}
                  <span style={{ width: "18px", flexShrink: 0, display: "flex", justifyContent: "center" }}>
                    <LevelBadge lvl={row.lvl} />
                  </span>

                  {/* Component */}
                  <span
                    style={{
                      width: "90px",
                      flexShrink: 0,
                      paddingLeft: "6px",
                      fontSize: "10px",
                      fontFamily: F.mono,
                      color: C.t2,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {row.comp}
                  </span>

                  {/* Pid:ctx */}
                  <span
                    style={{
                      width: "80px",
                      flexShrink: 0,
                      paddingLeft: "4px",
                      fontSize: "9.5px",
                      fontFamily: F.mono,
                      color: C.t4,
                    }}
                  >
                    {row.pid}:{row.ctx}
                  </span>

                  {/* Message */}
                  <span
                    style={{
                      flex: 1,
                      paddingLeft: "4px",
                      fontSize: "11px",
                      fontFamily: F.mono,
                      color: isF ? "#991B1B" : isW ? "#92400E" : C.t1,
                      fontWeight: isF ? 600 : 400,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      minWidth: 0,
                    }}
                  >
                    {row.message}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Detail slide-over ─── */}
        <div
          style={{
            width: DETAIL_W ? `${DETAIL_W}px` : "0px",
            flexShrink: 0,
            borderLeft: DETAIL_W ? `1px solid ${C.b1}` : "none",
            background: C.panelBg,
            overflow: "hidden",
            transition: "width 120ms ease-out",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {selectedRow && (
            <>
              {/* Detail header */}
              <div
                style={{
                  padding: "6px 10px",
                  borderBottom: `1px solid ${C.b1}`,
                  background: C.headerBg,
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: C.t3 }}>
                  Details
                </span>
                <div style={{ flex: 1 }} />
                <span
                  onClick={() => { setDetailOpen(false); setSelectedRow(null); }}
                  style={{ cursor: "pointer", fontSize: "12px", color: C.t4, lineHeight: 1 }}
                >
                  ✕
                </span>
              </div>

              {/* Detail content */}
              <div style={{ flex: 1, overflow: "auto", padding: "8px 10px" }}>
                {/* Source + line */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    marginBottom: "6px",
                    fontSize: "11px",
                    fontFamily: F.mono,
                    color: LOG_COLORS[selectedRow.sourceIdx].fg,
                    fontWeight: 600,
                  }}
                >
                  {selectedRow.source}:{selectedRow.line}
                </div>

                {/* KV grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "65px 1fr",
                    gap: "2px 6px",
                    fontSize: "10.5px",
                    marginBottom: "8px",
                  }}
                >
                  <span style={{ color: C.t3, fontWeight: 500 }}>source</span>
                  <span style={{ fontFamily: F.mono, fontSize: "10px", color: C.t2 }}>{selectedRow.source}</span>

                  <span style={{ color: C.t3, fontWeight: 500 }}>kind</span>
                  <span style={{ fontFamily: F.mono, fontSize: "10px", color: C.t2 }}>{selectedRow.kind}</span>

                  <span style={{ color: C.t3, fontWeight: 500 }}>level</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <LevelBadge lvl={selectedRow.lvl} />
                    <span style={{ fontFamily: F.mono, fontSize: "10px", color: C.t2 }}>{selectedRow.lvl}</span>
                  </span>

                  <span style={{ color: C.t3, fontWeight: 500 }}>line</span>
                  <span style={{ fontFamily: F.mono, fontSize: "10px", color: C.t2 }}>{selectedRow.line}</span>

                  <span style={{ color: C.t3, fontWeight: 500 }}>component</span>
                  <span style={{ fontFamily: F.mono, fontSize: "10px", color: C.t2 }}>{selectedRow.comp}</span>

                  <span style={{ color: C.t3, fontWeight: 500 }}>pid</span>
                  <span style={{ fontFamily: F.mono, fontSize: "10px", color: C.t2 }}>{selectedRow.pid}</span>

                  <span style={{ color: C.t3, fontWeight: 500 }}>ctx</span>
                  <span style={{ fontFamily: F.mono, fontSize: "10px", color: C.t2 }}>{selectedRow.ctx}</span>

                  <span style={{ color: C.t3, fontWeight: 500 }}>time</span>
                  <span style={{ fontFamily: F.mono, fontSize: "10px", color: C.t2 }}>{selectedRow.timeStr}</span>
                </div>

                {/* Message section */}
                <div style={{ marginBottom: "8px" }}>
                  <div
                    style={{
                      fontSize: "9px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color: C.t4,
                      marginBottom: "3px",
                    }}
                  >
                    message
                  </div>
                  <div
                    style={{
                      padding: "4px 6px",
                      background: "#fff",
                      border: `1px solid ${C.b0}`,
                      borderRadius: "2px",
                      fontSize: "11px",
                      fontFamily: F.mono,
                      color: C.t1,
                      lineHeight: "1.4",
                      wordBreak: "break-word",
                    }}
                  >
                    {selectedRow.message}
                  </div>
                </div>

                {/* Raw section */}
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      marginBottom: "3px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "9px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        color: C.t4,
                      }}
                    >
                      raw
                    </span>
                    <span
                      style={{
                        fontSize: "9px",
                        fontFamily: F.mono,
                        color: C.selBorder,
                        cursor: "pointer",
                        marginLeft: "auto",
                      }}
                      onClick={() => {
                        navigator.clipboard?.writeText(
                          `${new Date(selectedRow.time).toISOString().slice(0, 10)} ${selectedRow.timeStr} ${selectedRow.lvl} /${selectedRow.comp}:${selectedRow.pid}:${selectedRow.ctx}/ ${selectedRow.message}`
                        );
                      }}
                    >
                      📋 Copy raw
                    </span>
                  </div>
                  <pre
                    style={{
                      padding: "4px 6px",
                      background: "#fff",
                      border: `1px solid ${C.b0}`,
                      borderRadius: "2px",
                      fontSize: "10px",
                      fontFamily: F.mono,
                      color: C.t2,
                      lineHeight: "1.4",
                      margin: 0,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-all",
                    }}
                  >
                    {`01-08 ${selectedRow.timeStr} ${selectedRow.lvl} /${selectedRow.comp}:${selectedRow.pid}:${selectedRow.ctx}/ ${selectedRow.message}`}
                  </pre>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
