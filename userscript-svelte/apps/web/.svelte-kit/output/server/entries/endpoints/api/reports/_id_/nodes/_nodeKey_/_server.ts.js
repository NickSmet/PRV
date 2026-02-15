import { json } from "@sveltejs/kit";
import { g as getReportusClient } from "../../../../../../../chunks/reportus.js";
import "fast-xml-parser";
import { e as ensureDomParser, f as fetchNodePayload, p as parseGuestOs, n as nodeRegistry } from "../../../../../../../chunks/runtime.js";
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
  const index = await client.getReportIndex(params.id);
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
