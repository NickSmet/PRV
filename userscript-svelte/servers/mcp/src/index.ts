import 'dotenv/config';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

import { createReportusClient } from '@prv/report-api';
import {
  buildReportModelFromRawPayloads,
  ensureDomParser,
  evaluateRules,
  fetchNodePayload,
  nodeRegistry,
  parseGuestOs,
  type ReportModel,
  type NodeKey
} from '@prv/report-core';
import { toAgentSummary, truncateText } from '@prv/report-ai';
import { buildNodesFromReport } from '@prv/report-viewmodel';

function getEnv(name: string): string | undefined {
  return process.env[name];
}

function getClient() {
  const baseUrl = getEnv('REPORTUS_BASE_URL') ?? 'https://reportus.prls.net';
  const basicAuth = getEnv('REPORTUS_BASIC_AUTH');
  if (!basicAuth) {
    throw new Error('Missing REPORTUS_BASIC_AUTH');
  }
  return createReportusClient({ baseUrl, basicAuth });
}

function isNodeKey(value: string): value is NodeKey {
  return value in nodeRegistry;
}

function enrichReportMetaFromIndex(report: ReportModel, index: Awaited<ReturnType<ReturnType<typeof getClient>['getReportIndex']>>, reportId: string) {
  report.meta.productName = index.product ?? report.meta.productName;
  report.meta.productVersion = index.product_version ?? report.meta.productVersion;
  report.meta.reportId = String(index.report_id ?? reportId);
  report.meta.reportType = index.report_type ?? report.meta.reportType;
  report.meta.reportReason = index.report_reason ?? report.meta.reportReason;
}

const server = new McpServer({
  name: 'prv-reportus',
  version: '0.0.1'
});

const tool = server.tool.bind(server) as unknown as (
  name: string,
  schema: unknown,
  handler: (args: any) => Promise<any>
) => void;

tool(
  'report_index',
  { reportId: z.string() },
  async ({ reportId }) => {
    const client = getClient();
    const index = await client.getReportIndex(reportId);
    return { content: [{ type: 'text', text: JSON.stringify(index, null, 2) }] };
  }
);

tool(
  'get_file_text',
  { reportId: z.string(), filePath: z.string(), maxBytes: z.number().int().positive().optional(), maxChars: z.number().int().positive().optional() },
  async ({ reportId, filePath, maxBytes, maxChars }) => {
    const client = getClient();
    const { text, truncated } = await client.downloadFileText(reportId, filePath, { maxBytes });
    const trimmed = truncateText(text, { maxChars });
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ text: trimmed.text, truncated: truncated || trimmed.truncated }, null, 2)
      }]
    };
  }
);

tool(
  'parse_node',
  { reportId: z.string(), nodeKey: z.string(), maxBytes: z.number().int().positive().optional() },
  async ({ reportId, nodeKey, maxBytes }) => {
    ensureDomParser();
    if (!isNodeKey(nodeKey)) {
      return { content: [{ type: 'text', text: JSON.stringify({ error: `Unknown nodeKey: ${nodeKey}` }, null, 2) }] };
    }

    const client = getClient();
    const index = await client.getReportIndex(reportId);

    let guestOsType: string | undefined;
    if (nodeKey === 'GuestCommands') {
      const guestPayload = await fetchNodePayload(client, reportId, index, 'GuestOs', { maxBytes: 256 * 1024 });
      const guestSummary = guestPayload?.text ? parseGuestOs(guestPayload.text) : null;
      guestOsType = guestSummary?.type ?? undefined;
    }

    const payload = await fetchNodePayload(client, reportId, index, nodeKey, { maxBytes });
    if (!payload) {
      return { content: [{ type: 'text', text: JSON.stringify({ nodeKey, summary: null }, null, 2) }] };
    }

    const summary = nodeRegistry[nodeKey].parse(payload.text, { guestOsType });
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(
          {
            nodeKey,
            summary,
            truncated: payload.truncated,
            sourceFile: payload.sourceFile
          },
          null,
          2
        )
      }]
    };
  }
);

tool(
  'build_model',
  { reportId: z.string(), nodes: z.array(z.string()).optional(), maxBytes: z.number().int().positive().optional() },
  async ({ reportId, nodes, maxBytes }) => {
    ensureDomParser();
    const client = getClient();
    const index = await client.getReportIndex(reportId);

    const wanted = (nodes ?? Object.keys(nodeRegistry)) as string[];
    const raw: Partial<Record<NodeKey, string>> = {};

    for (const key of wanted) {
      if (!isNodeKey(key)) continue;
      const payload = await fetchNodePayload(client, reportId, index, key, { maxBytes });
      if (payload?.text) raw[key] = payload.text;
    }

    const { report } = buildReportModelFromRawPayloads(raw);
    enrichReportMetaFromIndex(report, index, reportId);
    const markers = evaluateRules(report);
    const nodeModels = buildNodesFromReport(report, markers);
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ report, markers, nodes: nodeModels }, null, 2)
      }]
    };
  }
);

tool(
  'markers',
  { reportId: z.string(), nodes: z.array(z.string()).optional(), maxBytes: z.number().int().positive().optional() },
  async ({ reportId, nodes, maxBytes }) => {
    ensureDomParser();
    const client = getClient();
    const index = await client.getReportIndex(reportId);

    const wanted = (nodes ?? Object.keys(nodeRegistry)) as string[];
    const raw: Partial<Record<NodeKey, string>> = {};

    for (const key of wanted) {
      if (!isNodeKey(key)) continue;
      const payload = await fetchNodePayload(client, reportId, index, key, { maxBytes });
      if (payload?.text) raw[key] = payload.text;
    }

    const { report } = buildReportModelFromRawPayloads(raw);
    enrichReportMetaFromIndex(report, index, reportId);
    const markers = evaluateRules(report);
    return { content: [{ type: 'text', text: JSON.stringify({ markers }, null, 2) }] };
  }
);

tool(
  'agent_summary',
  { reportId: z.string(), nodes: z.array(z.string()).optional(), maxBytes: z.number().int().positive().optional() },
  async ({ reportId, nodes, maxBytes }) => {
    ensureDomParser();
    const client = getClient();
    const index = await client.getReportIndex(reportId);

    const wanted = (nodes ?? [
      'CurrentVm',
      'GuestOs',
      'HostInfo',
      'LoadedDrivers',
      'MountInfo',
      'AllProcesses',
      'MoreHostInfo',
      'NetConfig',
      'AdvancedVmInfo',
      'VmDirectory',
      'LicenseData'
    ]) as string[];

    const raw: Partial<Record<NodeKey, string>> = {};
    for (const key of wanted) {
      if (!isNodeKey(key)) continue;
      const payload = await fetchNodePayload(client, reportId, index, key, { maxBytes });
      if (payload?.text) raw[key] = payload.text;
    }

    const { report } = buildReportModelFromRawPayloads(raw);
    enrichReportMetaFromIndex(report, index, reportId);
    const summary = toAgentSummary(report);
    return { content: [{ type: 'text', text: JSON.stringify(summary, null, 2) }] };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
