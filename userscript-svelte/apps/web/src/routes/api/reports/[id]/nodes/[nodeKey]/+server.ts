import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getReportusClient } from '$lib/server/reportus';
import { ensureDomParser, fetchNodePayload, nodeRegistry, type NodeKey, parseGuestOs } from '@prv/report-core';

function isNodeKey(value: string): value is NodeKey {
  return value in nodeRegistry;
}

export const GET: RequestHandler = async ({ params, url }) => {
  ensureDomParser();

  const nodeKey = params.nodeKey;
  if (!isNodeKey(nodeKey)) {
    return json({ error: `Unknown nodeKey: ${nodeKey}` }, { status: 400 });
  }

  const client = getReportusClient();
  const maxBytes = Number(url.searchParams.get('maxBytes') ?? '2097152');

  const index = await client.getReportIndex(params.id);

  let guestOsType: string | undefined;
  if (nodeKey === 'GuestCommands') {
    const guestPayload = await fetchNodePayload(client, params.id, index, 'GuestOs', { maxBytes: 256 * 1024 });
    const guestSummary = guestPayload?.text ? parseGuestOs(guestPayload.text) : null;
    guestOsType = guestSummary?.type ?? undefined;
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

