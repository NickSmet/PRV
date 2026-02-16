/**
 * Parse GuestCommands (Windows guest diagnostics)
 *
 * Extracts system/network/process/power-request diagnostics from captured guest command outputs.
 */

import { XMLParser } from 'fast-xml-parser';

export type GuestArchitecture = 'ARM64' | 'x86' | 'x64' | 'unknown';
export type GuestDriveStatus = 'OK' | 'Disconnected' | 'Unavailable' | 'Reconnecting' | 'Other';

export interface GuestSystemInfo {
  hostname?: string;
  processorCount?: number;
  architecture?: GuestArchitecture;
}

export interface GuestNetworkAdapter {
  name?: string;
  description?: string;
  ip?: string;
  ipv6?: string;
  gateway?: string;
  dns?: string[];
  dhcpEnabled?: boolean;
}

export interface GuestNetworkDrive {
  letter?: string;
  remotePath?: string;
  status?: GuestDriveStatus;
  statusRaw?: string;
  provider?: string;
}

export interface GuestCpuProcess {
  path?: string;
  pid?: number;
  cpuPercent?: number;
  memoryKb?: number;
  architecture?: GuestArchitecture;
  user?: string;
}

export interface GuestCpuTotals {
  cpuPercent?: number;
  memoryKb?: number;
}

export interface GuestPowerRequest {
  type?: string;
  requestor?: string;
  path?: string;
}

export interface GuestCommandsSummary {
  guestType?: string;
  isLinux?: boolean;
  isEmpty?: boolean;
  system?: GuestSystemInfo;
  network?: {
    adapters?: GuestNetworkAdapter[];
    drives?: GuestNetworkDrive[];
  };
  processes?: GuestCpuProcess[];
  totals?: GuestCpuTotals;
  powerRequests?: GuestPowerRequest[];
}

/**
 * Parse guest commands from JSON text or inline XML <GuestCommands> element.
 */
export function parseGuestCommands(data: string, guestOsType?: string): GuestCommandsSummary | null {
  const isLinux = guestOsType ? /linux/i.test(guestOsType) : undefined;

  if (!data || data.trim().length < 10) {
    return {
      guestType: guestOsType,
      isLinux,
      isEmpty: true,
      system: undefined,
      network: { adapters: [], drives: [] },
      processes: [],
      totals: undefined,
      powerRequests: []
    };
  }

  try {
    const trimmed = data.trim();
    let commands: Record<string, string> = {};

    // XML form (common): <GuestCommands><GuestCommand>...</GuestCommand></GuestCommands>
    if (trimmed.startsWith('<') && trimmed.includes('<GuestCommands')) {
      commands = parseGuestCommandsXml(trimmed);
    }

    // JSON form (some reports): { GuestCommand: [...] }
    else if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      const parsed = JSON.parse(trimmed);
      const guestCommands = (parsed as any)?.GuestCommand;

      if (!guestCommands) {
        return {
          guestType: guestOsType,
          isLinux,
          isEmpty: true,
          system: undefined,
          network: { adapters: [], drives: [] },
          processes: [],
          totals: undefined,
          powerRequests: []
        };
      }

      if (Array.isArray(guestCommands)) {
        for (const cmd of guestCommands) {
          const name = cmd?.CommandName;
          const result = cmd?.CommandResult;
          if (name && result) {
            commands[String(name).trim().toLowerCase()] = String(result);
          }
        }
      } else {
        for (const value of Object.values(guestCommands)) {
          if (typeof value === 'object' && value !== null) {
            const cmdName = (value as any).CommandName;
            const cmdResult = (value as any).CommandResult;
            if (cmdName && cmdResult) {
              commands[String(cmdName).trim().toLowerCase()] = String(cmdResult);
            }
          }
        }
      }
    }

    // Unknown format: treat as empty (avoid throwing)
    else {
      return {
        guestType: guestOsType,
        isLinux,
        isEmpty: true,
        system: undefined,
        network: { adapters: [], drives: [] },
        processes: [],
        totals: undefined,
        powerRequests: []
      };
    }

    const envSet = commands['cmd /c set'] || '';
    const netUse = commands['net use'] || '';
    const ipconfig = commands['ipconfig /all'] || '';
    const cpuUsage = commands['prl_cpuusage --sort-cpu-desc --time 4000'] || '';
    const powerRequests = commands['powercfg -requests'] || '';

    const cpu = parseCpuUsage(cpuUsage);

    return {
      guestType: guestOsType,
      isLinux,
      isEmpty: Object.keys(commands).length === 0,
      system: parseCmdSet(envSet),
      network: {
        adapters: parseIpconfig(ipconfig),
        drives: parseNetUse(netUse)
      },
      processes: cpu.processes,
      totals: cpu.totals,
      powerRequests: parsePowercfgRequests(powerRequests)
    };
  } catch (error) {
    console.error('[parseGuestCommands] Parse error:', error);
    return null;
  }
}

function getXmlText(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'string') return value.trim() || undefined;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map(getXmlText).filter(Boolean).join('');
  if (typeof value === 'object') {
    const record = value as any;
    if (typeof record.__cdata === 'string') return record.__cdata.trim() || undefined;
    if (typeof record.__text === 'string') return record.__text.trim() || undefined;
  }
  return undefined;
}

function parseGuestCommandsXml(xml: string): Record<string, string> {
  const parser = new XMLParser({
    ignoreAttributes: true,
    cdataPropName: '__cdata',
    textNodeName: '__text',
    parseTagValue: false,
    trimValues: false,
    processEntities: false
  });

  const parsed = parser.parse(xml) as any;
  const root = parsed?.GuestCommands;
  const guestCommands = root?.GuestCommand;

  const list = Array.isArray(guestCommands) ? guestCommands : guestCommands ? [guestCommands] : [];
  const commands: Record<string, string> = {};

  for (const cmd of list) {
    const name = getXmlText(cmd?.CommandName);
    const result = getXmlText(cmd?.CommandResult);
    if (!name || result === undefined) continue;
    commands[name.trim().toLowerCase()] = result;
  }

  return commands;
}

/**
 * Parse network volumes from net use output
 */
function parseNetUse(output: string): GuestNetworkDrive[] {
  const drives: GuestNetworkDrive[] = [];
  const seenLetters = new Set<string>();

  const lines = output.split(/\r?\n/);
  let inTable = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (/^-{5,}$/.test(trimmed)) {
      inTable = true;
      continue;
    }

    if (!inTable) continue;
    if (/^the command completed/i.test(trimmed)) break;
    if (/^status\s+local\s+remote\s+network/i.test(trimmed)) continue;

    const columns = trimmed.split(/\s{2,}/).map((c) => c.trim()).filter(Boolean);
    if (columns.length < 3) continue;

    let statusRaw: string | undefined;
    let local: string | undefined;
    let remotePath: string | undefined;
    let provider: string | undefined;

    if (columns.length === 3) {
      local = columns[0];
      remotePath = columns[1];
      provider = columns[2];
    } else {
      statusRaw = columns[0];
      local = columns[1];
      remotePath = columns[2];
      provider = columns.slice(3).join(' ');
    }

    const letterMatch = /^([A-Z]):$/.exec(local ?? '');
    const letter = letterMatch ? letterMatch[1] : undefined;
    if (letter) {
      if (seenLetters.has(letter)) continue;
      seenLetters.add(letter);
    }

    const normalized = (statusRaw ?? '').trim();
    const lower = normalized.toLowerCase();
    const status: GuestDriveStatus =
      normalized === '' ? 'OK'
      : lower === 'ok' ? 'OK'
      : lower === 'disconnected' ? 'Disconnected'
      : lower === 'unavailable' ? 'Unavailable'
      : lower === 'reconnecting' ? 'Reconnecting'
      : 'Other';

    drives.push({
      letter,
      remotePath,
      status,
      statusRaw: status === 'Other' ? (statusRaw ?? undefined) : undefined,
      provider
    });
  }

  return drives;
}

/**
 * Parse system environment from `cmd /c set` output.
 */
function parseCmdSet(output: string): GuestSystemInfo | undefined {
  if (!output || output.trim().length === 0) return undefined;

  let hostname: string | undefined;
  let processorCount: number | undefined;
  let architecture: GuestArchitecture | undefined;

  for (const line of output.split(/\r?\n/)) {
    const idx = line.indexOf('=');
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim().toUpperCase();
    const value = line.slice(idx + 1).trim();

    if (key === 'COMPUTERNAME') {
      hostname = value || undefined;
    } else if (key === 'NUMBER_OF_PROCESSORS') {
      const num = Number.parseInt(value, 10);
      processorCount = Number.isFinite(num) ? num : undefined;
    } else if (key === 'PROCESSOR_ARCHITECTURE') {
      architecture = normalizeArchitecture(value);
    }
  }

  if (!hostname && !processorCount && !architecture) return undefined;
  return { hostname, processorCount, architecture };
}

function normalizeArchitecture(value: string): GuestArchitecture {
  const upper = value.trim().toUpperCase();
  if (upper === 'ARM64') return 'ARM64';
  if (upper === 'X86') return 'x86';
  if (upper === 'X64' || upper === 'AMD64') return 'x64';
  return 'unknown';
}

function isGlobalIpv6(ipv6: string): boolean {
  const normalized = ipv6.toLowerCase();
  if (normalized.startsWith('fe80:')) return false;
  return true;
}

function extractIpv4(value: string): string | undefined {
  const match = value.match(/\b(\d{1,3}(?:\.\d{1,3}){3})\b/);
  return match?.[1];
}

function extractIps(value: string): string[] {
  const ips: string[] = [];
  const v4 = value.match(/\b(\d{1,3}(?:\.\d{1,3}){3})\b/g) ?? [];
  ips.push(...v4);

  const v6 = value.match(/\b[0-9a-fA-F:]{2,}(?:%[0-9]+)?\b/g) ?? [];
  for (const candidate of v6) {
    if (candidate.includes('::') || candidate.includes(':')) {
      const cleaned = candidate.replace(/%[0-9]+$/, '');
      if (!/^\d+(?:\.\d+){3}$/.test(cleaned)) ips.push(cleaned);
    }
  }

  return ips;
}

function normalizeIpconfigValue(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.replace(/\(.*\)\s*$/, '').trim() || undefined;
}

/**
 * Parse network adapters from ipconfig /all output
 */
function parseIpconfig(output: string): GuestNetworkAdapter[] {
  if (!output || output.trim().length === 0) return [];

  const adapters: GuestNetworkAdapter[] = [];
  const lines = output.split(/\r?\n/);

  let current: GuestNetworkAdapter | undefined;
  let dns: string[] = [];
  let gatewayCandidates: string[] = [];
  let continuation: 'dns' | 'gateway' | undefined;

  const flush = () => {
    if (!current) return;
    if (dns.length > 0) current.dns = dns;
    const ipv4Gateway = gatewayCandidates.map(extractIpv4).find(Boolean);
    if (ipv4Gateway) current.gateway = ipv4Gateway;

    if (current.name || current.ip || current.description || current.ipv6) {
      adapters.push(current);
    }

    current = undefined;
    dns = [];
    gatewayCandidates = [];
    continuation = undefined;
  };

  for (const line of lines) {
    const trimmedRight = line.trimEnd();
    const trimmed = trimmedRight.trim();

    if (!trimmed) {
      continuation = undefined;
      continue;
    }

    // New adapter section header: "Ethernet adapter Ethernet:"
    if (!/^\s/.test(line) && trimmedRight.endsWith(':')) {
      flush();
      current = { name: trimmedRight.slice(0, -1).trim() };
      continue;
    }

    if (!current) continue;

    // Continuation lines for multi-line properties (DNS / Default Gateway)
    if (continuation && /^\s+/.test(line) && !trimmed.includes(':')) {
      if (continuation === 'dns') {
        dns.push(...extractIps(trimmed));
      } else if (continuation === 'gateway') {
        gatewayCandidates.push(trimmed);
      }
      continue;
    }

    continuation = undefined;

    const match = /^\s*(?<key>[^:]+?)\s*:\s*(?<value>.*)$/.exec(line);
    if (!match?.groups) continue;

    const rawKey = match.groups.key;
    const value = match.groups.value ?? '';
    const key = rawKey.replace(/\.+/g, ' ').trim().toLowerCase();

    if (key.startsWith('description')) {
      current.description = normalizeIpconfigValue(value);
      continue;
    }

    if (key === 'dhcp enabled') {
      const normalized = value.trim().toLowerCase();
      if (normalized === 'yes') current.dhcpEnabled = true;
      else if (normalized === 'no') current.dhcpEnabled = false;
      continue;
    }

    if (key === 'ipv4 address') {
      current.ip = extractIpv4(value) ?? normalizeIpconfigValue(value);
      continue;
    }

    if (key === 'ipv6 address') {
      const normalized = normalizeIpconfigValue(value);
      if (normalized && isGlobalIpv6(normalized) && !current.ipv6) {
        current.ipv6 = normalized.replace(/%[0-9]+$/, '');
      }
      continue;
    }

    if (key === 'default gateway') {
      continuation = 'gateway';
      gatewayCandidates.push(value);
      continue;
    }

    if (key === 'dns servers') {
      continuation = 'dns';
      dns.push(...extractIps(value));
      continue;
    }
  }

  flush();
  // De-dup DNS servers in-place
  for (const adapter of adapters) {
    if (!adapter.dns) continue;
    adapter.dns = Array.from(new Set(adapter.dns));
  }

  return adapters;
}

/**
 * Parse top CPU processes from prl_cpuusage output
 */
function parseCpuUsage(output: string): { processes: GuestCpuProcess[]; totals?: GuestCpuTotals } {
  const processes: GuestCpuProcess[] = [];
  if (!output || output.trim().length === 0) return { processes, totals: undefined };

  const seen = new Set<string>();
  let totals: GuestCpuTotals | undefined;

  for (const line of output.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('Measure time')) continue;
    if (trimmed.startsWith('System:')) continue;
    if (trimmed.startsWith('Name ')) continue;
    if (trimmed.startsWith('====')) continue;
    if (trimmed.startsWith('---')) continue;

    if (trimmed.startsWith('TOTAL:')) {
      const match = /^TOTAL:\s+.*?(?<cpu>\d+(?:\.\d+)?)%\s+(?<mem>\d+)\s*$/.exec(trimmed);
      if (match?.groups) {
        totals = {
          cpuPercent: Number(match.groups.cpu),
          memoryKb: Number.parseInt(match.groups.mem, 10)
        };
      }
      continue;
    }

    let rest = trimmed;
    let path: string | undefined;
    let memoryKb: number | undefined;
    let cpuPercent: number | undefined;

    const pathMatch = /\s(?<mem>\d+)\s(?<path>[A-Za-z]:\\.+)$/.exec(rest);
    if (pathMatch?.groups) {
      memoryKb = Number.parseInt(pathMatch.groups.mem, 10);
      path = pathMatch.groups.path.trim();
      rest = rest.slice(0, pathMatch.index).trimEnd();
    } else {
      const memMatch = /\s(?<mem>\d+)\s*$/.exec(rest);
      if (memMatch?.groups) {
        memoryKb = Number.parseInt(memMatch.groups.mem, 10);
        rest = rest.slice(0, memMatch.index).trimEnd();
      }
    }

    const cpuMatch = /\s(?<cpu>\d+(?:\.\d+)?)%\s*$/.exec(rest);
    if (cpuMatch?.groups) {
      cpuPercent = Number(cpuMatch.groups.cpu);
      rest = rest.slice(0, cpuMatch.index).trimEnd();
    }

    const tokens = rest.trim().split(/\s+/).filter(Boolean);
    if (tokens.length < 3) continue;

    const archIndex = tokens.findIndex((t) => /^(ARM64|x86|x64|AMD64)$/i.test(t));
    if (archIndex < 0 || archIndex + 1 >= tokens.length) continue;

    const architecture = normalizeArchitecture(tokens[archIndex]);
    const pid = Number.parseInt(tokens[archIndex + 1], 10);
    const user = tokens.slice(1, archIndex).join(' ') || undefined;

    const key = `${pid}:${path ?? ''}:${cpuPercent ?? ''}:${memoryKb ?? ''}`;
    if (seen.has(key)) continue;
    seen.add(key);

    processes.push({
      path,
      pid: Number.isFinite(pid) ? pid : undefined,
      cpuPercent: Number.isFinite(cpuPercent ?? NaN) ? cpuPercent : undefined,
      memoryKb: Number.isFinite(memoryKb ?? NaN) ? memoryKb : undefined,
      architecture,
      user
    });
  }

  return { processes, totals };
}

function looksLikePath(value: string): boolean {
  if (!value) return false;
  if (/^[A-Za-z]:\\/.test(value)) return true;
  if (/^\\Device\\/.test(value)) return true;
  return false;
}

function parsePowercfgRequests(output: string): GuestPowerRequest[] {
  if (!output || output.trim().length === 0) return [];

  const requests: GuestPowerRequest[] = [];
  const lines = output.split(/\r?\n/);

  let currentType: string | undefined;
  let currentEntry: string[] = [];

  const flush = () => {
    if (!currentType) return;
    if (currentEntry.length === 0) return;

    const text = currentEntry.join(' ').replace(/\s+/g, ' ').trim();
    currentEntry = [];
    if (!text || /^none\.$/i.test(text)) return;

    let rest = text;
    const bracket = /^\[[^\]]+\]\s+/.exec(rest);
    if (bracket) {
      rest = rest.slice(bracket[0].length).trim();
    }

    const paren = /^(?<before>.*)\((?<inside>[^)]+)\)\s*$/.exec(rest);
    const requestor = paren?.groups?.inside?.trim() || rest;
    const before = paren?.groups?.before?.trim();
    const path = before && looksLikePath(before) ? before : undefined;

    requests.push({
      type: currentType,
      requestor: requestor || undefined,
      path
    });
  };

  for (const line of lines) {
    const trimmed = line.trim();
    const section = /^([A-Z][A-Z0-9]+)\s*:\s*$/.exec(trimmed);
    if (section) {
      flush();
      currentType = section[1];
      continue;
    }

    if (!currentType) continue;

    if (!trimmed) {
      flush();
      continue;
    }

    if (/^none\.$/i.test(trimmed)) {
      currentEntry = [];
      continue;
    }

    if (trimmed.startsWith('[') && currentEntry.length > 0) {
      flush();
    }

    currentEntry.push(trimmed);
  }

  flush();
  return requests;
}
