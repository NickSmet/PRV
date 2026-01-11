/**
 * Parse GuestCommands (Windows guest diagnostics)
 *
 * Extracts ipconfig network adapters, net use mapped drives, and prl_cpuusage top processes.
 */

export interface GuestNetworkAdapter {
  name?: string;
  descriptor?: string;
  ip?: string;
}

export interface GuestCommandsSummary {
  guestType?: string;
  isLinux?: boolean;
  isEmpty?: boolean;
  networkAdapters: GuestNetworkAdapter[];
  networkDrives: string[];
  topProcesses: string[];
}

/**
 * Parse guest commands from JSON object
 */
export function parseGuestCommands(jsonData: string, guestOsType?: string): GuestCommandsSummary | null {
  if (!jsonData || jsonData.trim().length < 100) {
    return {
      guestType: guestOsType,
      isLinux: guestOsType?.toLowerCase() === 'linux',
      isEmpty: true,
      networkAdapters: [],
      networkDrives: [],
      topProcesses: []
    };
  }

  try {
    const data = JSON.parse(jsonData);
    const guestCommands = data.GuestCommand;

    if (!guestCommands) {
      return {
        guestType: guestOsType,
        isLinux: false,
        isEmpty: true,
        networkAdapters: [],
        networkDrives: [],
        topProcesses: []
      };
    }

    // Extract command results
    const commands: Record<string, string> = {};
    if (Array.isArray(guestCommands)) {
      for (const cmd of guestCommands) {
        const name = cmd.CommandName;
        const result = cmd.CommandResult;
        if (name && result) {
          commands[name] = result;
        }
      }
    } else {
      // Handle single command or object format
      for (const [key, value] of Object.entries(guestCommands)) {
        if (typeof value === 'object' && value !== null) {
          const cmdName = (value as any).CommandName;
          const cmdResult = (value as any).CommandResult;
          if (cmdName && cmdResult) {
            commands[cmdName] = cmdResult;
          }
        }
      }
    }

    const netUse = commands['net use'] || '';
    const ipconfig = commands['ipconfig /all'] || '';
    const cpuUsage = commands['prl_cpuusage --sort-cpu-desc --time 4000'] || '';

    return {
      guestType: guestOsType,
      isLinux: false,
      isEmpty: false,
      networkAdapters: parseIpconfig(ipconfig),
      networkDrives: parseNetUse(netUse),
      topProcesses: parseCpuUsage(cpuUsage)
    };
  } catch (error) {
    console.error('[parseGuestCommands] Parse error:', error);
    return null;
  }
}

/**
 * Parse network volumes from net use output
 */
function parseNetUse(output: string): string[] {
  const netVolumesRegex = /[A-Z]: +\\\\Mac\\\w+/g;
  const matches = output.match(netVolumesRegex);
  return matches ? Array.from(new Set(matches)) : [];
}

/**
 * Parse network adapters from ipconfig /all output
 */
function parseIpconfig(output: string): GuestNetworkAdapter[] {
  const adaptersRegex = /\n[ \w][^\n:]*:[\r\n]+( +[^\n]*\n){1,}/gi;
  const matches = output.match(adaptersRegex);

  if (!matches) {
    return [];
  }

  const adapters: GuestNetworkAdapter[] = [];

  for (const match of matches) {
    const adapter: GuestNetworkAdapter = {};

    try {
      const nameMatch = match.match(/\n([ \w][^\n:]*):/)
;
      if (nameMatch) {
        adapter.name = nameMatch[1].trim();
      }
    } catch (e) {}

    try {
      const descriptorMatch = match.match(/\n[ \w][^\n:]*:[^$]*?:[^$]*?:([^\n]*?)\n/);
      if (descriptorMatch) {
        adapter.descriptor = descriptorMatch[1].trim();
      }
    } catch (e) {}

    try {
      const ipMatch = match.match(/IPv4[^$]*?: (\d{1,3}(\.\d{1,3}){3})/);
      if (ipMatch) {
        adapter.ip = ipMatch[1];
      }
    } catch (e) {}

    if (adapter.name || adapter.ip) {
      adapters.push(adapter);
    }
  }

  return adapters;
}

/**
 * Parse top CPU processes from prl_cpuusage output
 */
function parseCpuUsage(output: string): string[] {
  const cpuUsageRegex = /\d+\.\d\d% +\d+ C:[\\w \(\)\-\{\} \._]+\.exe/g;
  const matches = output.match(cpuUsageRegex);
  return matches ? matches.slice(0, 5) : [];
}
