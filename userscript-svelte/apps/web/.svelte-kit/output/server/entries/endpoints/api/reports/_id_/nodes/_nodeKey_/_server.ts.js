import { json, error } from "@sveltejs/kit";
import { g as getReportusClient, R as ReportusHttpError } from "../../../../../../../chunks/reportus.js";
import "fast-xml-parser";
import { e as ensureDomParser, f as fetchNodePayload, c as parseGuestOs, n as nodeRegistry } from "../../../../../../../chunks/runtime.js";
function isNodeKey(value) {
  return value in nodeRegistry;
}
const GET = async ({ params, url }) => {
  ensureDomParser();
  const nodeKey = params.nodeKey;
  if (!isNodeKey(nodeKey)) {
    return json({ error: `Unknown nodeKey: ${nodeKey}` }, { status: 400 });
  }
  const client = getReportusClient();
  const maxBytes = Number(url.searchParams.get("maxBytes") ?? "2097152");
  let index;
  try {
    index = await client.getReportIndex(params.id);
  } catch (e) {
    if (e instanceof ReportusHttpError) throw error(e.status, e.message);
    throw e;
  }
  let guestOsType;
  if (nodeKey === "GuestCommands") {
    const guestPayload = await fetchNodePayload(client, params.id, index, "GuestOs", { maxBytes: 256 * 1024 });
    const guestSummary = guestPayload?.text ? parseGuestOs(guestPayload.text) : null;
    guestOsType = guestSummary?.type ?? void 0;
  }
  const payload = await fetchNodePayload(client, params.id, index, nodeKey, {
    maxBytes: Number.isFinite(maxBytes) ? maxBytes : 2 * 1024 * 1024
  });
  if (!payload) {
    return json({ nodeKey, summary: null, truncated: false, sourceFile: null });
  }
  const summary = nodeRegistry[nodeKey].parse(payload.text, { guestOsType });
  return json({
    nodeKey,
    summary,
    truncated: payload.truncated,
    sourceFile: payload.sourceFile
  });
};
export {
  GET
};
