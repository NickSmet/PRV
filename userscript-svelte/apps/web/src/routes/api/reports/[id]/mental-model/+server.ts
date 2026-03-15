import { error as kitError, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { TtlCache } from '$lib/server/cache';
import {
  buildReportModelFromRawPayloads,
  deriveCurrentVmFields,
  discoverPerVmFiles,
  ensureDomParser,
  evaluateRules,
  fetchNodePayload,
  nodeRegistry,
  parseCurrentVm,
  parseToolsLog,
  type NodeKey
} from '@prv/report-core';
import { buildNodesFromReport, buildRealityModel, type RealityRawItem } from '@prv/report-viewmodel';
import type { CurrentVmModel } from '@prv/report-core';
import type { GuestCommandsSummary, HostInfoSummary, MountInfoSummary } from '@prv/report-core';
import { ReportusHttpError } from '@prv/report-api';
import { ReportSourceError, resolveReportSource } from '$lib/server/report-source';

const ttlMs = 10 * 60 * 1000;
const nodePayloadCache = new TtlCache<
  string,
  { text: string; truncated: boolean; sourceFile?: { filename: string; path: string } }
>(ttlMs);
const fileTextCache = new TtlCache<string, { text: string; truncated: boolean }>(ttlMs);

function normalizeUuid(uuid: string | undefined): string {
  return (uuid ?? '').trim().toLowerCase();
}

function buildRawItems(opts: {
  nodes: NodeKey[];
  indexFiles: { filename: string; path: string; size: number }[];
  perVm: ReturnType<typeof discoverPerVmFiles>;
}): RealityRawItem[] {
  const seen = new Set<string>();
  const items: RealityRawItem[] = [];

  for (const nodeKey of opts.nodes) {
    items.push({ kind: 'node', nodeKey, title: nodeKey });
  }

  function addFile(group: string, file: { filename: string; path: string; size: number }, vmUuid?: string) {
    if (seen.has(file.path)) return;
    seen.add(file.path);
    items.push({
      kind: 'file',
      filePath: file.path,
      filename: file.filename,
      size: file.size,
      group,
      vmUuid
    });
  }

  for (const [uuid, file] of Object.entries(opts.perVm.vmConfigByUuid)) addFile('VM configs', file, uuid);
  for (const [uuid, file] of Object.entries(opts.perVm.vmLogByUuid)) addFile('VM logs', file, uuid);
  for (const [uuid, file] of Object.entries(opts.perVm.toolsLogByUuid)) addFile('Tools logs', file, uuid);
  if (opts.perVm.currentVmLog) addFile('VM logs', opts.perVm.currentVmLog);
  if (opts.perVm.currentToolsLog) addFile('Tools logs', opts.perVm.currentToolsLog);
  for (const file of opts.perVm.screenshots) addFile('Screenshots/images', file);

  for (const file of opts.indexFiles) addFile('Other', file);

  return items;
}

export const GET: RequestHandler = async ({ params }) => {
  ensureDomParser();

  const reportId = params.id;
  let source: Awaited<ReturnType<typeof resolveReportSource>>;
  try {
    source = await resolveReportSource(reportId);
  } catch (e) {
    if (e instanceof ReportusHttpError || e instanceof ReportSourceError) {
      throw kitError(e.status, e.message);
    }
    throw e;
  }

  const allNodeKeys = Object.keys(nodeRegistry) as NodeKey[];
  const defaultNodes: NodeKey[] = [
    'TimeZone',
    'CurrentVm',
    'GuestOs',
    'LicenseData',
    'NetConfig',
    'AdvancedVmInfo',
    'HostInfo',
    'LoadedDrivers',
    'MountInfo',
    'AllProcesses',
    'MoreHostInfo',
    'VmDirectory',
    'GuestCommands',
    'AppConfig',
    'ClientInfo',
    'ClientProxyInfo',
    'InstalledSoftware',
    'LaunchdInfo',
    'AutoStatisticInfo',
    'ToolsLog',
    'ParallelsSystemLog'
  ];

  const raw: Partial<Record<NodeKey, string>> = {};
  for (const nodeKey of defaultNodes) {
    const cacheKey = `${source.sourceKind}::${reportId}::${nodeKey}::${2 * 1024 * 1024}`;
    const cached = nodePayloadCache.get(cacheKey);
    if (cached) {
      raw[nodeKey] = cached.text;
      continue;
    }

    const payload = await fetchNodePayload(source.client, reportId, source.index, nodeKey, {
      maxBytes: 2 * 1024 * 1024
    });
    if (!payload) continue;
    nodePayloadCache.set(cacheKey, {
      text: payload.text,
      truncated: payload.truncated,
      sourceFile: payload.sourceFile ? { filename: payload.sourceFile.filename, path: payload.sourceFile.path } : undefined
    });
    raw[nodeKey] = payload.text;
  }

  const { report } = buildReportModelFromRawPayloads(raw);
  // Enrich canonical model with API metadata for more accurate rules.
  report.meta.productName = source.index.product ?? report.meta.productName;
  report.meta.productVersion = source.index.product_version ?? report.meta.productVersion;
  report.meta.reportId = String(source.index.report_id ?? reportId);
  report.meta.reportType = source.index.report_type ?? report.meta.reportType;
  report.meta.reportReason = source.index.report_reason ?? report.meta.reportReason;
  const markers = evaluateRules(report);
  const nodes = buildNodesFromReport(report, markers);

  const perVm = discoverPerVmFiles(source.index);

  const vmConfigByUuid: Record<string, CurrentVmModel | null> = {};
  const currentVmUuid = normalizeUuid(report.currentVm?.vmUuid);
  if (currentVmUuid && report.currentVm) {
    vmConfigByUuid[currentVmUuid] = report.currentVm;
  }

  for (const [uuidRaw, file] of Object.entries(perVm.vmConfigByUuid)) {
    const uuid = normalizeUuid(uuidRaw);
    const cacheKey = `${source.sourceKind}::${reportId}::file::${file.path}::${2 * 1024 * 1024}`;
    const cached = fileTextCache.get(cacheKey);
    const payload = cached
      ? cached
      : await source.client.downloadFileText(reportId, file.path, { maxBytes: 2 * 1024 * 1024 });

    if (!cached) fileTextCache.set(cacheKey, payload);

    const summary = parseCurrentVm(payload.text);
    vmConfigByUuid[uuid] = summary ? deriveCurrentVmFields(summary) : null;
  }

  const toolsLogMetaByUuid: Record<
    string,
    { status?: string; hasCorruptRegistry?: boolean; hasPrlDdIssue?: boolean; kbArticle?: string } | null
  > = {};
  for (const [uuidRaw, file] of Object.entries(perVm.toolsLogByUuid)) {
    const uuid = normalizeUuid(uuidRaw);
    const cacheKey = `${source.sourceKind}::${reportId}::file::${file.path}::${2 * 1024 * 1024}`;
    const cached = fileTextCache.get(cacheKey);
    const payload = cached
      ? cached
      : await source.client.downloadFileText(reportId, file.path, { maxBytes: 2 * 1024 * 1024 });
    if (!cached) fileTextCache.set(cacheKey, payload);

    const summary = parseToolsLog(payload.text);
    toolsLogMetaByUuid[uuid] = summary
      ? {
          status: summary.status,
          hasCorruptRegistry: summary.hasCorruptRegistry,
          hasPrlDdIssue: summary.hasPrlDdIssue,
          kbArticle: summary.kbArticle
        }
      : null;
  }

  const reality = buildRealityModel({ reportId, report, index: source.index, perVm });

  const rawItems = buildRawItems({
    nodes: allNodeKeys,
    indexFiles: source.index.files,
    perVm
  });

  const reportMeta = {
    report_id: source.index.report_id ?? Number(reportId),
    report_type: source.index.report_type ?? null,
    report_reason: source.index.report_reason ?? null,
    product: source.index.product ?? null,
    product_version: source.index.product_version ?? null,
    received: source.index.received ?? null,
    parsed: source.index.parsed ?? null,
    problem_description: source.index.problem_description ?? null,
    server_uuid: source.index.server_uuid ?? null,
    computer_model: source.index.computer_model ?? null,
    md5: source.index.md5 ?? null
  };

  const host = report.hostDevices as HostInfoSummary | null | undefined;
  const storage = report.storage as MountInfoSummary | null | undefined;

  const systemVolume = storage?.volumes?.find((v) => v.mountedOn === '/');
  const hostSummary = {
    os: host?.system?.os?.displayString ?? host?.system?.os?.version ?? null,
    cpu: host?.system?.cpu?.model ?? null,
    ramGb: host?.system?.memory?.hostRamGb ?? null,
    isNotebook: host?.system?.isNotebook ?? null,
    computerModel: reportMeta.computer_model ?? null,
    systemDisk: systemVolume
      ? {
          free: systemVolume.free ?? null,
          capacity: systemVolume.capacityStr ?? null
        }
      : null
  };

  const guest = report.guestCommands as GuestCommandsSummary | null | undefined;
  const vmIpsByUuid: Record<string, string[]> = {};
  if (currentVmUuid && guest?.network?.adapters?.length) {
    const ips = new Set<string>();
    for (const a of guest.network.adapters) {
      if (a.ip) ips.add(a.ip);
      if (a.ipv6) ips.add(a.ipv6);
    }
    vmIpsByUuid[currentVmUuid] = Array.from(ips);
  }

  return json({ reality, reportMeta, hostSummary, vmIpsByUuid, markers, nodes, rawItems, vmConfigByUuid, toolsLogMetaByUuid });
};
