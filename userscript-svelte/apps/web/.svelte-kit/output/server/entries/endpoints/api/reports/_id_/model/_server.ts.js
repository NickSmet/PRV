import { error, json } from "@sveltejs/kit";
import { g as getReportusClient, R as ReportusHttpError } from "../../../../../../chunks/reportus.js";
import { T as TtlCache } from "../../../../../../chunks/cache.js";
import "fast-xml-parser";
import { e as evaluateRules } from "../../../../../../chunks/index.js";
import { e as ensureDomParser, f as fetchNodePayload, b as buildReportModelFromRawPayloads } from "../../../../../../chunks/runtime.js";
import { b as buildNodesFromReport } from "../../../../../../chunks/nodeBuilder.js";
const payloadCache = new TtlCache(10 * 60 * 1e3);
const defaultNodes = [
  "TimeZone",
  "CurrentVm",
  "GuestOs",
  "LicenseData",
  "NetConfig",
  "AdvancedVmInfo",
  "HostInfo",
  "LoadedDrivers",
  "MountInfo",
  "AllProcesses",
  "MoreHostInfo",
  "VmDirectory",
  "GuestCommands",
  "AppConfig",
  "ClientInfo",
  "ClientProxyInfo",
  "InstalledSoftware",
  "LaunchdInfo",
  "AutoStatisticInfo",
  "ToolsLog",
  "ParallelsSystemLog"
];
const GET = async ({ params }) => {
  ensureDomParser();
  const client = getReportusClient();
  let index;
  try {
    index = await client.getReportIndex(params.id);
  } catch (e) {
    if (e instanceof ReportusHttpError) throw error(e.status, e.message);
    throw e;
  }
  const raw = {};
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
  report.meta.productName = index.product ?? report.meta.productName;
  report.meta.productVersion = index.product_version ?? report.meta.productVersion;
  report.meta.reportId = String(index.report_id ?? params.id);
  report.meta.reportType = index.report_type ?? report.meta.reportType;
  report.meta.reportReason = index.report_reason ?? report.meta.reportReason;
  const markers = evaluateRules(report);
  const nodes = buildNodesFromReport(report, markers);
  return json({ nodes, markers });
};
export {
  GET
};
