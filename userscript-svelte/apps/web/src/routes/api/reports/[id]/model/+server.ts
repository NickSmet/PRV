import { error as kitError, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { TtlCache } from '$lib/server/cache';
import {
  buildReportModelFromRawPayloads,
  ensureDomParser,
  evaluateRules,
  fetchNodePayload,
  type NodeKey
} from '@prv/report-core';
import { buildNodesFromReport } from '@prv/report-viewmodel';
import { ReportusHttpError } from '@prv/report-api';
import { ReportSourceError, resolveReportSource } from '$lib/server/report-source';

const payloadCache = new TtlCache<string, { text: string; truncated: boolean }>(10 * 60 * 1000);

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

export const GET: RequestHandler = async ({ params }) => {
  ensureDomParser();
  let source: Awaited<ReturnType<typeof resolveReportSource>>;
  try {
    source = await resolveReportSource(params.id);
  } catch (e) {
    if (e instanceof ReportusHttpError || e instanceof ReportSourceError) throw kitError(e.status, e.message);
    throw e;
  }

  const raw: Partial<Record<NodeKey, string>> = {};

  for (const nodeKey of defaultNodes) {
    const cacheKey = `${source.sourceKind}::${params.id}::${nodeKey}`;
    const cached = payloadCache.get(cacheKey);
    if (cached) {
      raw[nodeKey] = cached.text;
      continue;
    }

    const payload = await fetchNodePayload(source.client, params.id, source.index, nodeKey, {
      maxBytes: 2 * 1024 * 1024
    });
    if (!payload) continue;
    payloadCache.set(cacheKey, { text: payload.text, truncated: payload.truncated });
    raw[nodeKey] = payload.text;
  }

  const { report } = buildReportModelFromRawPayloads(raw);
  // Enrich canonical model with API metadata for more accurate rules.
  report.meta.productName = source.index.product ?? report.meta.productName;
  report.meta.productVersion = source.index.product_version ?? report.meta.productVersion;
  report.meta.reportId = String(source.index.report_id ?? params.id);
  report.meta.reportType = source.index.report_type ?? report.meta.reportType;
  report.meta.reportReason = source.index.report_reason ?? report.meta.reportReason;
  const markers = evaluateRules(report);
  const nodes = buildNodesFromReport(report, markers);

  return json({ nodes, markers });
};
