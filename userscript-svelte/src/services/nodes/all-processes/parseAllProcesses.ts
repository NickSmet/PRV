/**
 * Parse AllProcesses (ps aux output)
 *
 * Extracts full process list (ps aux) + a minimal "top" snapshot when present.
 *
 * Note: Older UI only showed running apps + top CPU/mem. We now parse everything
 * into a unified list with a `kind` field (app/service/other) and derive the
 * legacy fields from it for compatibility.
 */

import {
  classifyHostProcessType,
  detectAppNameFromCommand,
  displayNameFor,
  extractShortNameFromCommand,
  isHelperCommand
} from './process-classification';

export interface ProcessInfo {
  user: string;
  pid?: string;
  cpu: number;
  mem: number;
  name: string;
}

// NOTE: This union is shared by both host (macOS) and guest (Windows) process tables.
export type ProcessType =
  | 'parallels-tools'
  | 'windows-store-app'
  | 'microsoft-component'
  | 'macos-app'
  | 'third-party-app'
  | 'system'
  | 'service'
  | 'other';

export interface ProcessItem {
  user: string;
  pid: string;
  cpu: number;
  mem: number;
  command: string;
  type: ProcessType;
  /**
   * Best-effort bundle label like "Google Chrome.app"
   */
  appName?: string;
  /**
   * Whether this looks like a helper subprocess (renderer/GPU/etc) — used for
   * indentation/dimming in the UI.
   */
  isHelper: boolean;
  /**
   * Short display name extracted from command path (or appName).
   */
  shortName: string;
  /**
   * A compact display name suitable for list UIs.
   */
  displayName: string;
}

export interface TopSnapshot {
  processesTotal?: number;
  running?: number;
  sleeping?: number;
  threads?: number;
  loadAvg?: { one?: number; five?: number; fifteen?: number };
  cpu?: { user?: number; sys?: number; idle?: number };
  timestamp?: string;
}

export interface AllProcessesSummary {
  /**
   * Unified list parsed from ps aux.
   */
  items: ProcessItem[];

  /**
   * Legacy field kept for compatibility. Prefer filtering `items` by `type`.
   */
  runningApps: string[];
  topCpuProcesses: ProcessInfo[];
  topMemProcesses: ProcessInfo[];

  /**
   * Minimal parsed snapshot from "top" section (if present).
   */
  top?: TopSnapshot;
  hasBsdtarIssue: boolean;
}

/**
 * Parse ps aux output for process information
 */
export function parseAllProcesses(textData: string): AllProcessesSummary | null {
  if (!textData || textData.trim().length === 0) {
    return null;
  }

  // Check for bsdtar issue (toolbox_report.xml.tar.gz)
  const hasBsdtarIssue = /toolbox_report\.xml\.tar\.gz/.test(textData);

  const psAuxSection = extractSection(textData, 'ps aux');
  const topSection = extractSection(textData, 'top -i 1 -l 3 -o cpu -S -d');

  const items = psAuxSection ? parsePsAuxSection(psAuxSection) : [];

  const runningApps = Array.from(
    new Set(
      items
        .filter((p) => (p.type === 'macos-app' || p.type === 'third-party-app') && p.appName)
        .map((p) => p.appName as string)
    )
  ).sort();

  const { topCpuProcesses, topMemProcesses } = deriveTopLists(items);
  const top = topSection ? parseTopSnapshot(topSection) : undefined;

  return {
    items,
    runningApps,
    topCpuProcesses,
    topMemProcesses,
    top,
    hasBsdtarIssue
  };
}

/**
 * Extract a marked section:
 *   ======= <name> =======
 */
function extractSection(textData: string, name: string): string | null {
  const marker = `======= ${name} =======`;
  const start = textData.indexOf(marker);
  if (start === -1) return null;

  const after = start + marker.length;
  const nextMarkerIdx = textData.indexOf('=======', after);
  const end = nextMarkerIdx === -1 ? textData.length : nextMarkerIdx;
  return textData.slice(after, end).trim();
}

function parseNum(s: string): number {
  return Number.parseFloat(s.replace(',', '.'));
}

function prettyCommand(cmd: string): string {
  return cmd.startsWith('/') ? cmd.slice(1) : cmd;
}

// (process classification helpers extracted to ./process-classification.ts)

/**
 * Parse the ps aux section into a full list.
 */
function parsePsAuxSection(section: string): ProcessItem[] {
  const lines = section.split('\n').map((l) => l.trimEnd());
  const out: ProcessItem[] = [];

  // Find header line and start parsing after it.
  const headerIdx = lines.findIndex((l) => l.startsWith('USER') && l.includes('COMMAND'));
  const startIdx = headerIdx === -1 ? 0 : headerIdx + 1;

  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    // Stop if we accidentally hit another marker.
    if (line.startsWith('=======')) break;

    // Columns: USER PID %CPU %MEM VSZ RSS TT STAT STARTED TIME COMMAND...
    const parts = line.trim().split(/\s+/);
    if (parts.length < 11) continue;

    const user = parts[0] ?? '';
    const pid = parts[1] ?? '';
    const cpuRaw = parts[2] ?? '0';
    const memRaw = parts[3] ?? '0';
    const command = parts.slice(10).join(' ');

    if (!user || !pid || !command) continue;

    const appName = detectAppNameFromCommand(command);
    const type = classifyHostProcessType(command, appName);
    const displayName = displayNameFor(command, type, appName);
    const shortName = appName ? appName.replace(/\.app$/, '') : extractShortNameFromCommand(command);
    const isHelper = isHelperCommand(command);

    out.push({
      user,
      pid,
      cpu: parseNum(cpuRaw),
      mem: parseNum(memRaw),
      command,
      type,
      appName: appName ?? undefined,
      isHelper,
      shortName,
      displayName
    });
  }

  return out;
}

/**
 * Derive top CPU/mem lists without reusing object references (avoids "[Circular]"
 * in debug JSON output).
 */
function deriveTopLists(items: ProcessItem[]): {
  topCpuProcesses: ProcessInfo[];
  topMemProcesses: ProcessInfo[];
} {
  function toProcessInfo(it: ProcessItem): ProcessInfo {
    return {
      user: it.user,
      pid: it.pid,
      cpu: it.cpu,
      mem: it.mem,
      name: prettyCommand(it.command)
    };
  }

  const topCpuProcesses = [...items]
    .sort((a, b) => b.cpu - a.cpu)
    .slice(0, 5)
    .map(toProcessInfo);

  const topMemProcesses = [...items]
    .sort((a, b) => b.mem - a.mem)
    .slice(0, 5)
    .map(toProcessInfo);

  return { topCpuProcesses, topMemProcesses };
}

function parseTopSnapshot(section: string): TopSnapshot {
  const snapshot: TopSnapshot = {};
  const lines = section.split('\n').map((l) => l.trim());

  for (const line of lines) {
    if (!line) continue;

    // Processes: 821 total, 9 running, 812 sleeping, 3752 threads
    const procMatch = line.match(/Processes:\s+(\d+)\s+total,\s+(\d+)\s+running,\s+(\d+)\s+sleeping,\s+(\d+)\s+threads/i);
    if (procMatch) {
      snapshot.processesTotal = Number(procMatch[1]);
      snapshot.running = Number(procMatch[2]);
      snapshot.sleeping = Number(procMatch[3]);
      snapshot.threads = Number(procMatch[4]);
      continue;
    }

    // 2026/01/10 14:29:45
    if (/^\d{4}\/\d{2}\/\d{2}\s+\d{1,2}:\d{2}:\d{2}$/.test(line)) {
      snapshot.timestamp = line;
      continue;
    }

    // Load Avg: 9.30, 11.70, 11.46
    const loadMatch = line.match(/Load Avg:\s*([\d.]+),\s*([\d.]+),\s*([\d.]+)/i);
    if (loadMatch) {
      snapshot.loadAvg = {
        one: parseNum(loadMatch[1]),
        five: parseNum(loadMatch[2]),
        fifteen: parseNum(loadMatch[3])
      };
      continue;
    }

    // CPU usage: 67.9% user, 30.34% sys, 2.56% idle
    const cpuMatch = line.match(/CPU usage:\s*([\d.]+)%\s*user,\s*([\d.]+)%\s*sys,\s*([\d.]+)%\s*idle/i);
    if (cpuMatch) {
      snapshot.cpu = {
        user: parseNum(cpuMatch[1]),
        sys: parseNum(cpuMatch[2]),
        idle: parseNum(cpuMatch[3])
      };
      continue;
    }
  }

  return snapshot;
}
