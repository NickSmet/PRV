import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getReportusClient } from '$lib/server/reportus';
import { TtlCache } from '$lib/server/cache';
import {
  buildReportModelFromRawPayloads,
  ensureDomParser,
  evaluateRules,
  fetchNodePayload,
  type NodeKey
} from '@prv/report-core';
import { buildNodesFromReport } from '@prv/report-viewmodel';

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
  const client = getReportusClient();
  const index = await client.getReportIndex(params.id);

  const raw: Partial<Record<NodeKey, string>> = {};

  for (const nodeKey of defaultNodes) {
    const cacheKey = `${params.id}::${nodeKey}`;
    const cached = payloadCache.get(cacheKey);
    if (cached) {
      raw[nodeKey] = cached.text;
      continue;
    }

    const payload = await fetchNodePayload(client, params.id, index, nodeKey, { maxBytes: 2 * 1024 * 1024 });
    if (!payload) continue;
    payloadCache.set(cacheKey, { text: payload.text, truncated: payload.truncated });
    raw[nodeKey] = payload.text;
  }

  const { report } = buildReportModelFromRawPayloads(raw);
  const markers = evaluateRules(report);
  const nodes = buildNodesFromReport(report, markers);

  return json({ nodes, markers });
};

