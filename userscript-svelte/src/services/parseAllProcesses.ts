/**
 * Parse AllProcesses (ps aux output)
 *
 * Extracts running applications and top CPU/Memory consuming processes.
 */

export interface ProcessInfo {
  user: string;
  pid?: string;
  cpu: number;
  mem: number;
  name: string;
}

export interface AllProcessesSummary {
  runningApps: string[];
  topCpuProcesses: ProcessInfo[];
  topMemProcesses: ProcessInfo[];
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

  // Extract running applications from /Applications
  const runningApps = extractRunningApps(textData);

  // Parse ps aux output for top processes
  const { topCpuProcesses, topMemProcesses } = parsePsAuxOutput(textData);

  return {
    runningApps,
    topCpuProcesses,
    topMemProcesses,
    hasBsdtarIssue
  };
}

/**
 * Extract list of running applications from /Applications directory
 */
function extractRunningApps(textData: string): string[] {
  // Regex to match /Applications/AppName.app (with leading space to avoid nested apps)
  const runningAppsRegex = /\s\/Applications\/((?!Parallels Desktop\.app|\/).)*\//gm;
  const appRegex = /\/Applications\/([^\/]+)\//;

  const matches = textData.match(runningAppsRegex);
  if (!matches) {
    return [];
  }

  const uniqueApps = new Set<string>();
  for (const match of matches) {
    const appMatch = match.match(appRegex);
    if (appMatch && appMatch[1]) {
      uniqueApps.add(appMatch[1]);
    }
  }

  return Array.from(uniqueApps).sort();
}

/**
 * Parse ps aux output for top CPU and Memory processes
 */
function parsePsAuxOutput(textData: string): {
  topCpuProcesses: ProcessInfo[];
  topMemProcesses: ProcessInfo[];
} {
  // Regex to parse ps aux lines
  const processRegex = /^(?<user>[^ ]+) +(?<pid>[\d.]+) +(?<cpu>[\d,.]+)  +(?<mem>[\d.,]+) +(?<vsz>[\d]+) +(?<rss>[\d]+) +(?<tt>[\w\?]+) +(?<stat>[\w+]+) +(?<started>[\d\:\.\w]+) +(?<timeRunning>[\d\:\.]+) +\/(?<name>[^\n]*)$/gm;

  const processes: ProcessInfo[] = [];
  const lines = textData.split('\n');

  for (const line of lines) {
    processRegex.lastIndex = 0; // Reset regex
    const match = processRegex.exec(line);
    if (match && match.groups) {
      const { user, pid, cpu, mem, name } = match.groups;
      processes.push({
        user,
        pid,
        cpu: parseFloat(cpu.replace(',', '.')),
        mem: parseFloat(mem.replace(',', '.')),
        name
      });
    }
  }

  // Get top 5 by CPU
  const topCpuProcesses = [...processes]
    .sort((a, b) => b.cpu - a.cpu)
    .slice(0, 5);

  // Get top 5 by Memory
  const topMemProcesses = [...processes]
    .sort((a, b) => b.mem - a.mem)
    .slice(0, 5);

  return { topCpuProcesses, topMemProcesses };
}
