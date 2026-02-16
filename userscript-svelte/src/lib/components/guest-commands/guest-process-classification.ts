import type { ProcessType } from '../../../services/parseAllProcesses';

/**
 * GuestCommands process classification (Windows paths from prl_cpuusage).
 *
 * Keep this logic isolated so we can tweak buckets over time without touching UI.
 */
export function classifyWindowsGuestProcessType(path: string): ProcessType {
  const p = path.toLowerCase();

  // 1) Parallels Tools (most relevant for PRV troubleshooting)
  if (
    p.includes('\\program files\\parallels\\parallels tools\\') ||
    p.includes('\\program files (x86)\\parallels\\parallels tools\\')
  ) {
    return 'parallels-tools';
  }

  // 2) Windows OS / system
  if (
    p.startsWith('c:\\windows\\') ||
    p.includes('\\windows\\system32\\') ||
    p.includes('\\windows\\syswow64\\')
  ) {
    return 'system';
  }

  // 3) Microsoft components (EdgeWebView, Visual Studio, Defender, Office ClickToRun, etc.)
  // Heuristic requested: if under Program Files and the next folder contains "Microsoft" -> microsoft-component.
  const programFilesMicrosoftFolder = /^c:\\program files(?: \(x86\))?\\[^\\]*microsoft[^\\]*\\/;
  if (
    programFilesMicrosoftFolder.test(p) ||
    p.startsWith('c:\\program files\\microsoft\\') ||
    p.startsWith('c:\\program files (x86)\\microsoft\\') ||
    p.includes('\\microsoft\\edgewebview\\') ||
    p.includes('\\microsoft visual studio\\') ||
    p.includes('\\programdata\\microsoft\\') ||
    p.includes('\\common files\\microsoft shared\\')
  ) {
    return 'microsoft-component';
  }

  // 4) Third-party apps (Program Files, AppData\Local\Programs, etc.)
  if (
    p.startsWith('c:\\program files\\') ||
    p.startsWith('c:\\program files (x86)\\') ||
    p.startsWith('c:\\users\\') ||
    p.startsWith('c:\\programdata\\')
  ) {
    return 'third-party-app';
  }

  return 'other';
}

export function windowsProcessShortName(path: string): string {
  const parts = path.split(/\\+/);
  const last = parts[parts.length - 1] || path;
  return last.replace(/\.exe$/i, '');
}

