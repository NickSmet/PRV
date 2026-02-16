import { useState, useMemo } from "react";

// ─── Sample data (realistic mix) ─────────────────────────────────────────────

const rawProcesses = [
  { pid: "401", name: "System/Library/PrivateFrameworks/SkyLight.framework/Versions/A/Resources/WindowServer", cpu: 31.3, mem: 2.1, user: "_windowserver", type: "system" },
  { pid: "1204", name: "Applications/Microsoft Teams.app/Contents/Frameworks/Microsoft Teams Helper (Renderer).app/Contents/MacOS/Microsoft Teams Helper (Renderer)", cpu: 30.3, mem: 4.1, user: "brenosantos", type: "app" },
  { pid: "1209", name: "Applications/Microsoft Teams.app/Contents/Frameworks/Microsoft Teams Helper (GPU).app/Contents/MacOS/Microsoft Teams Helper (GPU)", cpu: 14.8, mem: 1.1, user: "brenosantos", type: "app" },
  { pid: "312", name: "usr/libexec/airportd", cpu: 11.1, mem: 0.3, user: "root", type: "system" },
  { pid: "890", name: "System/Library/CoreServices/NotificationCenter.app/Contents/MacOS/NotificationCenter", cpu: 8.5, mem: 0.6, user: "brenosantos", type: "system" },
  { pid: "1302", name: "Applications/Vivaldi.app/Contents/MacOS/Vivaldi", cpu: 5.2, mem: 1.0, user: "brenosantos", type: "app" },
  { pid: "1305", name: "Applications/Vivaldi.app/Contents/Frameworks/Vivaldi Helper (Renderer).app/Contents/MacOS/Vivaldi Helper (Renderer)", cpu: 3.8, mem: 0.8, user: "brenosantos", type: "app" },
  { pid: "1102", name: "Applications/Notion.app/Contents/MacOS/Notion", cpu: 2.4, mem: 0.7, user: "brenosantos", type: "app" },
  { pid: "980", name: "System/Applications/Mail.app/Contents/MacOS/Mail", cpu: 1.8, mem: 0.9, user: "brenosantos", type: "app" },
  { pid: "1401", name: "Applications/Parallels Desktop.app/Contents/MacOS/prl_client_app", cpu: 1.5, mem: 0.7, user: "brenosantos", type: "app" },
  { pid: "1050", name: "Applications/ChatGPT.app/Contents/MacOS/ChatGPT", cpu: 0.9, mem: 0.4, user: "brenosantos", type: "app" },
  { pid: "1060", name: "Applications/Tailscale.app/Contents/MacOS/Tailscale", cpu: 0.3, mem: 0.2, user: "brenosantos", type: "app" },
  { pid: "1070", name: "Applications/Mouse Jiggler.app/Contents/MacOS/Mouse Jiggler", cpu: 0.1, mem: 0.1, user: "brenosantos", type: "app" },
  { pid: "1080", name: "Applications/Parallels Toolbox.app/Contents/MacOS/Parallels Toolbox", cpu: 0.2, mem: 0.3, user: "brenosantos", type: "app" },
  { pid: "1090", name: "Applications/Utilities.app/Contents/MacOS/Utilities", cpu: 0.1, mem: 0.1, user: "brenosantos", type: "app" },
  { pid: "200", name: "usr/sbin/syslogd", cpu: 0.1, mem: 0.1, user: "root", type: "service" },
  { pid: "210", name: "usr/libexec/opendirectoryd", cpu: 0.4, mem: 0.2, user: "root", type: "service" },
  { pid: "150", name: "sbin/launchd", cpu: 0.2, mem: 0.3, user: "root", type: "system" },
  { pid: "553", name: "System/Library/CoreServices/TimeMachine/backupd", cpu: 0.0, mem: 0.1, user: "root", type: "service" },
  { pid: "12354", name: "System/Library/Frameworks/AddressBook.framework/Versions/A/Helpers/AddressBookSourceSync.app/Contents/MacOS/AddressBookSourceSync", cpu: 48.7, mem: 0.1, user: "jamescary", type: "service" },
  { pid: "12364", name: "System/Library/Frameworks/AddressBook.framework/Versions/A/Helpers/AddressBookManager.app/Contents/MacOS/AddressBookManager", cpu: 42.1, mem: 0.2, user: "jamescary", type: "service" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractShortName(fullPath) {
  // Try to find .app name first
  const appMatch = fullPath.match(/\/([^/]+)\.app\b/);
  if (appMatch) return appMatch[1];
  // Fall back to last path component
  const parts = fullPath.split("/");
  return parts[parts.length - 1] || fullPath;
}

function extractAppName(fullPath) {
  // For grouping: get the top-level app name (before any Helper/Framework sub-paths)
  const appMatch = fullPath.match(/(?:^|\/)(Applications\/[^/]+\.app)/);
  if (appMatch) {
    const m = appMatch[1].match(/\/([^/]+)\.app$/);
    return m ? m[1] : null;
  }
  return null;
}

function isHelper(fullPath) {
  return /Helper\s*\(/.test(fullPath) || /Framework/.test(fullPath);
}

const typeConfig = {
  app:     { label: "App",     bg: "#EFF6FF", color: "#2563EB", border: "#BFDBFE" },
  system:  { label: "System",  bg: "#F1F5F9", color: "#475569", border: "#E2E8F0" },
  service: { label: "Service", bg: "#EDE9FE", color: "#6D28D9", border: "#DDD6FE" },
};

// ─── Tiny bar component ───────────────────────────────────────────────────────

function MicroBar({ value, max, color, width = 60 }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div
      style={{
        width,
        height: "6px",
        borderRadius: "3px",
        background: "#F1F5F9",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: "100%",
          borderRadius: "3px",
          background: color,
          minWidth: value > 0 ? "2px" : "0px",
        }}
      />
    </div>
  );
}

// ─── Sort arrow ───────────────────────────────────────────────────────────────

function SortArrow({ active, direction }) {
  if (!active) return <span style={{ color: "#CBD5E1", fontSize: "10px", marginLeft: "3px" }}>⇅</span>;
  return (
    <span style={{ color: "#3B82F6", fontSize: "10px", marginLeft: "3px" }}>
      {direction === "desc" ? "↓" : "↑"}
    </span>
  );
}

// ─── Type badge ───────────────────────────────────────────────────────────────

function TypeBadge({ type }) {
  const c = typeConfig[type] || typeConfig.service;
  return (
    <span
      style={{
        display: "inline-flex",
        padding: "0px 6px",
        borderRadius: "3px",
        fontSize: "10px",
        fontWeight: 600,
        fontFamily: "'SF Mono', Consolas, monospace",
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        background: c.bg,
        color: c.color,
        border: `1px solid ${c.border}`,
        whiteSpace: "nowrap",
      }}
    >
      {c.label}
    </span>
  );
}

// ─── Filter pill ──────────────────────────────────────────────────────────────

function FilterPill({ label, active, count, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: "4px 10px",
        borderRadius: "6px",
        border: active ? "1px solid #3B82F6" : "1px solid #E2E8F0",
        background: active ? "#EFF6FF" : "#fff",
        color: active ? "#2563EB" : "#64748B",
        fontSize: "12px",
        fontWeight: 500,
        cursor: "pointer",
        transition: "all 100ms ease",
      }}
    >
      {label}
      <span
        style={{
          fontSize: "10px",
          fontWeight: 600,
          color: active ? "#3B82F6" : "#94A3B8",
          background: active ? "#DBEAFE" : "#F1F5F9",
          padding: "0 5px",
          borderRadius: "10px",
        }}
      >
        {count}
      </span>
    </button>
  );
}

// ─── CPU color helper ─────────────────────────────────────────────────────────

function cpuColor(v) {
  if (v >= 30) return "#EF4444";
  if (v >= 10) return "#F59E0B";
  if (v >= 1)  return "#3B82F6";
  return "#94A3B8";
}

function memColor(v) {
  if (v >= 4) return "#EF4444";
  if (v >= 2) return "#F59E0B";
  if (v >= 0.5) return "#3B82F6";
  return "#94A3B8";
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ProcessTable() {
  const [sortKey, setSortKey] = useState("cpu");
  const [sortDir, setSortDir] = useState("desc");
  const [typeFilter, setTypeFilter] = useState("all");
  const [expandedPid, setExpandedPid] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const maxCpu = Math.max(...rawProcesses.map((p) => p.cpu), 1);
  const maxMem = Math.max(...rawProcesses.map((p) => p.mem), 1);

  const typeCounts = useMemo(() => {
    const c = { all: rawProcesses.length, app: 0, system: 0, service: 0 };
    rawProcesses.forEach((p) => { c[p.type] = (c[p.type] || 0) + 1; });
    return c;
  }, []);

  const filtered = useMemo(() => {
    let list = typeFilter === "all" ? rawProcesses : rawProcesses.filter((p) => p.type === typeFilter);
    list = [...list].sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      if (typeof va === "number") return sortDir === "desc" ? vb - va : va - vb;
      return sortDir === "desc" ? String(vb).localeCompare(String(va)) : String(va).localeCompare(String(vb));
    });
    return list;
  }, [sortKey, sortDir, typeFilter]);

  const displayed = showAll ? filtered : filtered.slice(0, 10);

  function toggleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const colHeaderStyle = (key) => ({
    padding: "8px 8px",
    fontSize: "10.5px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: sortKey === key ? "#3B82F6" : "#94A3B8",
    cursor: "pointer",
    userSelect: "none",
    whiteSpace: "nowrap",
    background: "transparent",
    border: "none",
    textAlign: "left",
    display: "flex",
    alignItems: "center",
  });

  return (
    <div
      style={{
        maxWidth: "720px",
        margin: "0 auto",
        padding: "24px",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
        color: "#0F172A",
        background: "#F8FAFC",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "12px" }}>
        <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#0F172A" }}>
          Processes
        </h3>
        <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#94A3B8" }}>
          {rawProcesses.length} processes · sorted by {sortKey.toUpperCase()} {sortDir === "desc" ? "↓" : "↑"}
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "12px", flexWrap: "wrap" }}>
        {[
          { key: "all", label: "All" },
          { key: "app", label: "Apps" },
          { key: "system", label: "System" },
          { key: "service", label: "Services" },
        ].map((f) => (
          <FilterPill
            key={f.key}
            label={f.label}
            active={typeFilter === f.key}
            count={typeCounts[f.key] || 0}
            onClick={() => setTypeFilter(f.key)}
          />
        ))}
      </div>

      {/* Table */}
      <div
        style={{
          border: "1px solid #E2E8F0",
          borderRadius: "10px",
          overflow: "hidden",
          background: "#fff",
        }}
      >
        {/* Header row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 120px 120px 80px",
            borderBottom: "1px solid #E2E8F0",
            background: "#FAFBFC",
          }}
        >
          <button style={colHeaderStyle("name")} onClick={() => toggleSort("name")}>
            Process <SortArrow active={sortKey === "name"} direction={sortDir} />
          </button>
          <button style={colHeaderStyle("cpu")} onClick={() => toggleSort("cpu")}>
            CPU <SortArrow active={sortKey === "cpu"} direction={sortDir} />
          </button>
          <button style={colHeaderStyle("mem")} onClick={() => toggleSort("mem")}>
            Memory <SortArrow active={sortKey === "mem"} direction={sortDir} />
          </button>
          <button style={colHeaderStyle("user")} onClick={() => toggleSort("user")}>
            User <SortArrow active={sortKey === "user"} direction={sortDir} />
          </button>
        </div>

        {/* Rows */}
        {displayed.map((proc) => {
          const short = extractShortName(proc.name);
          const helper = isHelper(proc.name);
          const expanded = expandedPid === proc.pid;

          return (
            <div key={proc.pid}>
              <div
                onClick={() => setExpandedPid(expanded ? null : proc.pid)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 120px 120px 80px",
                  alignItems: "center",
                  padding: "0",
                  borderBottom: "1px solid #F1F5F9",
                  cursor: "pointer",
                  background: expanded ? "#F8FAFC" : "transparent",
                  transition: "background 100ms ease",
                }}
              >
                {/* Name cell */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 10px",
                    minWidth: 0,
                  }}
                >
                  <TypeBadge type={proc.type} />
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: helper ? 400 : 600,
                      color: helper ? "#64748B" : "#0F172A",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={proc.name}
                  >
                    {helper ? `  ↳ ${short}` : short}
                  </span>
                </div>

                {/* CPU cell */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 8px",
                  }}
                >
                  <MicroBar value={proc.cpu} max={maxCpu} color={cpuColor(proc.cpu)} />
                  <span
                    style={{
                      fontFamily: "'SF Mono', Consolas, monospace",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: cpuColor(proc.cpu),
                      minWidth: "38px",
                      textAlign: "right",
                    }}
                  >
                    {proc.cpu.toFixed(1)}%
                  </span>
                </div>

                {/* Memory cell */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 8px",
                  }}
                >
                  <MicroBar value={proc.mem} max={maxMem} color={memColor(proc.mem)} />
                  <span
                    style={{
                      fontFamily: "'SF Mono', Consolas, monospace",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: memColor(proc.mem),
                      minWidth: "38px",
                      textAlign: "right",
                    }}
                  >
                    {proc.mem.toFixed(1)}%
                  </span>
                </div>

                {/* User cell */}
                <div style={{ padding: "8px 8px" }}>
                  <span
                    style={{
                      fontFamily: "'SF Mono', Consolas, monospace",
                      fontSize: "11px",
                      color: proc.user === "root" || proc.user.startsWith("_") ? "#94A3B8" : "#475569",
                      fontWeight: 500,
                    }}
                  >
                    {proc.user}
                  </span>
                </div>
              </div>

              {/* Expanded detail */}
              {expanded && (
                <div
                  style={{
                    padding: "8px 10px 10px 10px",
                    background: "#FAFBFC",
                    borderBottom: "1px solid #E2E8F0",
                    fontSize: "11.5px",
                    fontFamily: "'SF Mono', Consolas, monospace",
                    color: "#64748B",
                    lineHeight: 1.6,
                  }}
                >
                  <div style={{ display: "grid", gridTemplateColumns: "50px 1fr", gap: "2px 10px" }}>
                    <span style={{ color: "#94A3B8" }}>PID</span>
                    <span style={{ color: "#334155" }}>{proc.pid}</span>
                    <span style={{ color: "#94A3B8" }}>Path</span>
                    <span style={{ color: "#334155", wordBreak: "break-all" }}>/{proc.name}</span>
                    <span style={{ color: "#94A3B8" }}>User</span>
                    <span style={{ color: "#334155" }}>{proc.user}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Show more / less */}
        {filtered.length > 10 && (
          <div
            style={{
              padding: "10px",
              textAlign: "center",
              borderTop: "1px solid #F1F5F9",
            }}
          >
            <button
              onClick={() => setShowAll(!showAll)}
              style={{
                background: "none",
                border: "1px solid #E2E8F0",
                borderRadius: "6px",
                padding: "5px 16px",
                fontSize: "12px",
                color: "#64748B",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              {showAll ? `Show top 10` : `Show all ${filtered.length} processes`}
            </button>
          </div>
        )}
      </div>

      {/* Summary cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "8px",
          marginTop: "12px",
        }}
      >
        <div
          style={{
            background: "#fff",
            border: "1px solid #E2E8F0",
            borderRadius: "8px",
            padding: "10px 14px",
          }}
        >
          <div style={{ fontSize: "10.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#94A3B8", marginBottom: "4px" }}>
            Top CPU Consumer
          </div>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "#0F172A" }}>
            {extractShortName([...rawProcesses].sort((a, b) => b.cpu - a.cpu)[0].name)}
          </div>
          <div style={{ fontSize: "12px", fontFamily: "monospace", color: cpuColor([...rawProcesses].sort((a, b) => b.cpu - a.cpu)[0].cpu), fontWeight: 600 }}>
            {[...rawProcesses].sort((a, b) => b.cpu - a.cpu)[0].cpu.toFixed(1)}% CPU
          </div>
        </div>
        <div
          style={{
            background: "#fff",
            border: "1px solid #E2E8F0",
            borderRadius: "8px",
            padding: "10px 14px",
          }}
        >
          <div style={{ fontSize: "10.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#94A3B8", marginBottom: "4px" }}>
            Top Memory Consumer
          </div>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "#0F172A" }}>
            {extractShortName([...rawProcesses].sort((a, b) => b.mem - a.mem)[0].name)}
          </div>
          <div style={{ fontSize: "12px", fontFamily: "monospace", color: memColor([...rawProcesses].sort((a, b) => b.mem - a.mem)[0].mem), fontWeight: 600 }}>
            {[...rawProcesses].sort((a, b) => b.mem - a.mem)[0].mem.toFixed(1)}% Memory
          </div>
        </div>
      </div>

      {/* Behavior notes */}
      <div
        style={{
          marginTop: "20px",
          padding: "14px",
          background: "#F1F5F9",
          borderRadius: "8px",
          fontSize: "12px",
          color: "#64748B",
          lineHeight: 1.7,
        }}
      >
        <div style={{ fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", color: "#94A3B8", marginBottom: "6px" }}>
          📋 Behavior Notes (not rendered in production)
        </div>
        <div>
          <strong>Sorting:</strong> Click any column header to sort. Click again to toggle asc/desc.
          Default: CPU descending.
        </div>
        <div style={{ marginTop: "4px" }}>
          <strong>Type filters:</strong> The pill buttons filter by process type. Counts update to show
          how many match each category. "All" shows everything.
        </div>
        <div style={{ marginTop: "4px" }}>
          <strong>Expand:</strong> Click any row to reveal full path, PID, and user.
          The collapsed view shows just the extracted short name.
        </div>
        <div style={{ marginTop: "4px" }}>
          <strong>Helper grouping:</strong> Sub-processes like "Teams Helper (Renderer)" are indented
          with ↳ and dimmed weight — visually nesting them under the parent app without
          collapsing the data.
        </div>
        <div style={{ marginTop: "4px" }}>
          <strong>Color thresholds:</strong> CPU: red ≥30%, amber ≥10%, blue ≥1%, grey below.
          Memory: red ≥4%, amber ≥2%, blue ≥0.5%, grey below.
        </div>
        <div style={{ marginTop: "4px" }}>
          <strong>Show more:</strong> Default shows top 10 rows. "Show all" reveals the full list.
          This keeps the initial view scannable for support agents.
        </div>
        <div style={{ marginTop: "4px" }}>
          <strong>Future: App grouping toggle.</strong> A toggle could aggregate helper processes
          under their parent app (sum CPU/mem for all "Microsoft Teams*" processes into one row
          that expands to show individual helpers). This is useful but adds complexity — 
          recommend as a Phase 2 enhancement.
        </div>
      </div>
    </div>
  );
}
