import type { ReportusFileEntry, ReportusReportIndex } from '@prv/report-api';

export interface PerVmDiscoveredFiles {
  vmConfigByUuid: Record<string, ReportusFileEntry>;
  vmLogByUuid: Record<string, ReportusFileEntry>;
  toolsLogByUuid: Record<string, ReportusFileEntry>;
  currentVmLog?: ReportusFileEntry;
  currentToolsLog?: ReportusFileEntry;
  screenshots: ReportusFileEntry[];
}

const UUID_RE =
  /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/;

function filenameMatchUuid(filename: string, re: RegExp): string | null {
  const m = re.exec(filename);
  if (!m) return null;
  const uuid = m[1] ?? m[0];
  if (!UUID_RE.test(uuid)) return null;
  return uuid.toLowerCase();
}

export function discoverPerVmFiles(index: ReportusReportIndex): PerVmDiscoveredFiles {
  const vmConfigByUuid: Record<string, ReportusFileEntry> = {};
  const vmLogByUuid: Record<string, ReportusFileEntry> = {};
  const toolsLogByUuid: Record<string, ReportusFileEntry> = {};
  const screenshots: ReportusFileEntry[] = [];

  let currentVmLog: ReportusFileEntry | undefined;
  let currentToolsLog: ReportusFileEntry | undefined;
  let fallbackVm1Gz: ReportusFileEntry | undefined;

  const configRe = /^vm-([0-9a-fA-F-]{36})-config\.pvs\.log$/;
  const vmLogRe = /^vm-([0-9a-fA-F-]{36})\.log$/;
  const toolsLogRe = /^tools-([0-9a-fA-F-]{36})\.log$/;

  for (const entry of index.files) {
    const filename = entry.filename ?? '';

    const configUuid = filenameMatchUuid(filename, configRe);
    if (configUuid) {
      vmConfigByUuid[configUuid] = entry;
      continue;
    }

    const vmLogUuid = filenameMatchUuid(filename, vmLogRe);
    if (vmLogUuid) {
      vmLogByUuid[vmLogUuid] = entry;
      continue;
    }

    const toolsUuid = filenameMatchUuid(filename, toolsLogRe);
    if (toolsUuid) {
      toolsLogByUuid[toolsUuid] = entry;
      continue;
    }

    if (filename === 'vm.log') {
      currentVmLog = entry;
      continue;
    }

    if (filename === 'vm.1.gz.log') {
      fallbackVm1Gz = entry;
      continue;
    }

    if (filename === 'tools.log') {
      currentToolsLog = entry;
      continue;
    }

    if (
      /^PrlProblemReportHostScreen-.*\.png$/i.test(filename) ||
      /^PrlProblemReportScreen-.*\.png$/i.test(filename)
    ) {
      screenshots.push(entry);
      continue;
    }
  }

  return {
    vmConfigByUuid,
    vmLogByUuid,
    toolsLogByUuid,
    currentVmLog: currentVmLog ?? fallbackVm1Gz,
    currentToolsLog,
    screenshots
  };
}

