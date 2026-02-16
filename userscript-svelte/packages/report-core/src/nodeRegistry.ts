import type { ReportId, ReportusFileEntry, ReportusReportIndex, ReportusClient } from '@prv/report-api';
import {
  parseAdvancedVmInfo,
  parseAllProcesses,
  parseAppConfig,
  parseAutoStatisticInfo,
  parseClientInfo,
  parseClientProxyInfo,
  parseCurrentVm,
  parseGuestCommands,
  parseGuestOs,
  parseHostInfo,
  parseInstalledSoftware,
  parseLaunchdInfo,
  parseLicenseData,
  parseLoadedDrivers,
  parseMoreHostInfo,
  parseMountInfo,
  parseNetConfig,
  parseParallelsSystemLog,
  parseTimeZone,
  parseToolsLog,
  parseVmDirectory
} from './services/index';
import { createEmptyReportModel, deriveCurrentVmFields, type ReportModel } from './types/report';
import type { CurrentVmSummary } from './services/parseCurrentVm';

export type NodeKey =
  | 'AdvancedVmInfo'
  | 'AllProcesses'
  | 'AppConfig'
  | 'AutoStatisticInfo'
  | 'ClientInfo'
  | 'ClientProxyInfo'
  | 'CurrentVm'
  | 'GuestCommands'
  | 'GuestOs'
  | 'HostInfo'
  | 'InstalledSoftware'
  | 'LaunchdInfo'
  | 'LicenseData'
  | 'LoadedDrivers'
  | 'MoreHostInfo'
  | 'MountInfo'
  | 'NetConfig'
  | 'ParallelsSystemLog'
  | 'TimeZone'
  | 'ToolsLog'
  | 'VmDirectory';

export type NodeParser = (raw: string, ctx?: { guestOsType?: string }) => unknown | null;

export const nodeRegistry: Record<NodeKey, { filenameHints: string[]; parse: NodeParser }> = {
  TimeZone: { filenameHints: ['Report.xml'], parse: (raw) => parseTimeZone(raw) },
  CurrentVm: { filenameHints: ['CurrentVm.xml'], parse: (raw) => parseCurrentVm(raw) },
  GuestOs: { filenameHints: ['GuestOs.xml'], parse: (raw) => parseGuestOs(raw) },
  LicenseData: { filenameHints: ['LicenseData.json', 'Report.xml'], parse: (raw) => parseLicenseData(raw) },
  NetConfig: { filenameHints: ['NetConfig.xml'], parse: (raw) => parseNetConfig(raw) },
  AdvancedVmInfo: { filenameHints: ['AdvancedVmInfo.xml'], parse: (raw) => parseAdvancedVmInfo(raw) },
  HostInfo: { filenameHints: ['HostInfo.xml'], parse: (raw) => parseHostInfo(raw) },
  LoadedDrivers: { filenameHints: ['LoadedDrivers.txt', 'AllLoadedDrivers.txt'], parse: (raw) => parseLoadedDrivers(raw) },
  // MountInfo is sometimes embedded directly in Report.xml as CDATA.
  MountInfo: { filenameHints: ['MountInfo.txt', 'Report.xml'], parse: (raw) => parseMountInfo(raw) },
  AllProcesses: { filenameHints: ['AllProcesses.txt'], parse: (raw) => parseAllProcesses(raw) },
  MoreHostInfo: { filenameHints: ['MoreHostInfo.xml'], parse: (raw) => parseMoreHostInfo(raw) },
  VmDirectory: { filenameHints: ['VmDirectory.xml'], parse: (raw) => parseVmDirectory(raw) },
  // GuestCommands may be an archive ref in Report.xml (<NameInArchive>GuestCommands.xml</NameInArchive>)
  // or embedded inline as <GuestCommands><GuestCommand>...</GuestCommand></GuestCommands>.
  GuestCommands: { filenameHints: ['GuestCommands.xml', 'GuestCommands.json', 'Report.xml'], parse: (raw, ctx) => parseGuestCommands(raw, ctx?.guestOsType) },
  AppConfig: { filenameHints: ['AppConfig.xml'], parse: (raw) => parseAppConfig(raw) },
  // Some reports store ClientInfo in ClientInfo.xml and reference it from Report.xml.
  ClientInfo: { filenameHints: ['ClientInfo.txt', 'ClientInfo.xml', 'Report.xml'], parse: (raw) => parseClientInfo(raw) },
  ClientProxyInfo: { filenameHints: ['ClientProxyInfo.txt'], parse: (raw) => parseClientProxyInfo(raw) },
  InstalledSoftware: { filenameHints: ['InstalledSoftware.txt'], parse: (raw) => parseInstalledSoftware(raw) },
  ToolsLog: { filenameHints: ['tools.log'], parse: (raw) => parseToolsLog(raw) },
  ParallelsSystemLog: { filenameHints: ['parallels-system.log'], parse: (raw) => parseParallelsSystemLog(raw) },
  LaunchdInfo: { filenameHints: ['LaunchdInfo.txt'], parse: (raw) => parseLaunchdInfo(raw) },
  // AutoStatisticInfo is often embedded (or references an archive file) via Report.xml.
  AutoStatisticInfo: { filenameHints: ['AutoStatisticInfo.xml', 'Report.xml'], parse: (raw) => parseAutoStatisticInfo(raw) }
};

export function resolveFileByFilename(
  index: Pick<ReportusReportIndex, 'files'>,
  filename: string
): ReportusFileEntry | undefined {
  const direct = index.files.find((f) => f.filename === filename);
  if (direct) return direct;
  return index.files.find((f) => f.path.endsWith('/' + filename));
}

export async function fetchNodePayload(
  client: ReportusClient,
  reportId: ReportId,
  index: Pick<ReportusReportIndex, 'files'>,
  nodeKey: NodeKey,
  opts?: { maxBytes?: number }
): Promise<{ text: string; truncated: boolean; sourceFile?: ReportusFileEntry } | null> {
  for (const hint of nodeRegistry[nodeKey].filenameHints) {
    const entry = resolveFileByFilename(index, hint);
    if (!entry) continue;

    // Special-case: using Report.xml as a *source of embedded node payloads*.
    // We should not pass the whole Report.xml into per-node parsers (e.g. LicenseData expects JSON).
    if (hint === 'Report.xml' || entry.filename === 'Report.xml') {
      const reportXml = await client.downloadFileText(reportId, entry.path, opts);

      // Some parsers intentionally operate on the full Report.xml.
      if (nodeKey === 'TimeZone') {
        return { ...reportXml, sourceFile: entry };
      }

      const extracted = extractNodePayloadFromReportXml(reportXml.text, nodeKey);
      if (extracted) {
        // If Report.xml only contains an archive reference, resolve it and download the real payload.
        const archiveRef = extractNameInArchive(extracted, nodeKey);
        if (archiveRef) {
          const refEntry = resolveFileByFilename(index, archiveRef);
          if (refEntry) {
            const refPayload = await client.downloadFileText(reportId, refEntry.path, opts);
            return { ...refPayload, sourceFile: refEntry };
          }
        }

        return { text: extracted, truncated: reportXml.truncated, sourceFile: entry };
      }

      continue;
    }

    const result = await client.downloadFileText(reportId, entry.path, opts);
    return { ...result, sourceFile: entry };
  }

  return null;
}

export type RawNodePayloads = Partial<Record<NodeKey, string>>;

function extractNodePayloadFromReportXml(reportXml: string, nodeKey: NodeKey): string | null {
  const tag = nodeKey;
  const re = new RegExp(`<${tag}(\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, 'i');
  const match = re.exec(reportXml);
  if (!match) return null;

  const inner = match[2] ?? '';
  const cdata = /<!\[CDATA\[([\s\S]*?)\]\]>/i.exec(inner);
  const rawInner = (cdata ? cdata[1] : inner).trim();

  // Some parsers require a single root element (e.g. GuestCommands XML form),
  // so return the full element XML instead of inner-only content.
  if (nodeKey === 'GuestCommands' || nodeKey === 'AutoStatisticInfo' || nodeKey === 'AdvancedVmInfo') {
    return match[0].trim();
  }

  return rawInner.length ? rawInner : null;
}

function extractNameInArchive(extractedXmlOrText: string, nodeKey: NodeKey): string | null {
  // Only applicable to nodes extracted from Report.xml where the element contains:
  // <NameInArchive>SomeFile.ext</NameInArchive>
  if (nodeKey !== 'ClientInfo' && nodeKey !== 'GuestCommands' && nodeKey !== 'AutoStatisticInfo') return null;
  const m = /<NameInArchive>\s*([^<\s]+)\s*<\/NameInArchive>/i.exec(extractedXmlOrText);
  const filename = m?.[1]?.trim();
  return filename ? filename : null;
}

export function buildReportModelFromRawPayloads(
  payloads: RawNodePayloads
): { report: ReportModel; summaries: Partial<Record<NodeKey, unknown | null>> } {
  const report = createEmptyReportModel();
  const summaries: Partial<Record<NodeKey, unknown | null>> = {};

  const guestOs = payloads.GuestOs ? parseGuestOs(payloads.GuestOs) : null;
  summaries.GuestOs = guestOs;
  report.guestOs = guestOs;

  const currentVmSummary: CurrentVmSummary | null = payloads.CurrentVm ? parseCurrentVm(payloads.CurrentVm) : null;
  summaries.CurrentVm = currentVmSummary;
  report.currentVm = currentVmSummary ? deriveCurrentVmFields(currentVmSummary) : null;

  report.license = payloads.LicenseData ? parseLicenseData(payloads.LicenseData) : null;
  summaries.LicenseData = report.license;

  report.network = payloads.NetConfig ? parseNetConfig(payloads.NetConfig) : null;
  summaries.NetConfig = report.network;

  report.advancedVm = payloads.AdvancedVmInfo ? parseAdvancedVmInfo(payloads.AdvancedVmInfo) : null;
  summaries.AdvancedVmInfo = report.advancedVm;

  report.hostDevices = payloads.HostInfo ? parseHostInfo(payloads.HostInfo) : null;
  summaries.HostInfo = report.hostDevices;

  report.drivers = payloads.LoadedDrivers ? parseLoadedDrivers(payloads.LoadedDrivers) : null;
  summaries.LoadedDrivers = report.drivers;

  report.storage = payloads.MountInfo ? parseMountInfo(payloads.MountInfo) : null;
  summaries.MountInfo = report.storage;

  report.processes = payloads.AllProcesses ? parseAllProcesses(payloads.AllProcesses) : null;
  summaries.AllProcesses = report.processes;

  report.moreHostInfo = payloads.MoreHostInfo ? parseMoreHostInfo(payloads.MoreHostInfo) : null;
  summaries.MoreHostInfo = report.moreHostInfo;

  report.vmDirectory = payloads.VmDirectory ? parseVmDirectory(payloads.VmDirectory) : null;
  summaries.VmDirectory = report.vmDirectory;

  report.appConfig = payloads.AppConfig ? parseAppConfig(payloads.AppConfig) : null;
  summaries.AppConfig = report.appConfig;

  report.clientInfo = payloads.ClientInfo ? parseClientInfo(payloads.ClientInfo) : null;
  summaries.ClientInfo = report.clientInfo;

  report.proxy = payloads.ClientProxyInfo ? parseClientProxyInfo(payloads.ClientProxyInfo) : null;
  summaries.ClientProxyInfo = report.proxy;

  report.installedSoftware = payloads.InstalledSoftware ? parseInstalledSoftware(payloads.InstalledSoftware) : null;
  summaries.InstalledSoftware = report.installedSoftware;

  report.launchdInfo = payloads.LaunchdInfo ? parseLaunchdInfo(payloads.LaunchdInfo) : null;
  summaries.LaunchdInfo = report.launchdInfo;

  report.autoStatisticInfo = payloads.AutoStatisticInfo ? parseAutoStatisticInfo(payloads.AutoStatisticInfo) : null;
  summaries.AutoStatisticInfo = report.autoStatisticInfo;

  report.toolsLog = payloads.ToolsLog ? parseToolsLog(payloads.ToolsLog) : null;
  summaries.ToolsLog = report.toolsLog;

  report.systemLog = payloads.ParallelsSystemLog ? parseParallelsSystemLog(payloads.ParallelsSystemLog) : null;
  summaries.ParallelsSystemLog = report.systemLog;

  report.timezone = payloads.TimeZone ? parseTimeZone(payloads.TimeZone) : null;
  summaries.TimeZone = report.timezone;

  report.guestCommands = payloads.GuestCommands ? parseGuestCommands(payloads.GuestCommands, guestOs?.type) : null;
  summaries.GuestCommands = report.guestCommands;

  return { report, summaries };
}
