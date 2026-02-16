import { error as kitError } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getReportusClient } from '$lib/server/reportus';
import { TtlCache } from '$lib/server/cache';
import { ensureDomParser, fetchNodePayload, nodeRegistry, type NodeKey } from '@prv/report-core';
import { ReportusHttpError } from '@prv/report-api';

const payloadCache = new TtlCache<string, { text: string; truncated: boolean; sourceFile?: { filename: string; path: string } }>(
  10 * 60 * 1000
);

function isNodeKey(value: string): value is NodeKey {
  return value in nodeRegistry;
}

export const GET: RequestHandler = async ({ params, url }) => {
  ensureDomParser();

  const nodeKey = params.nodeKey;
  if (!isNodeKey(nodeKey)) throw kitError(400, `Unknown nodeKey: ${nodeKey}`);

  const maxBytes = Number(url.searchParams.get('maxBytes') ?? '2097152');
  const max = Number.isFinite(maxBytes) ? maxBytes : 2 * 1024 * 1024;

  const cacheKey = `${params.id}::${nodeKey}::${max}`;
  const cached = payloadCache.get(cacheKey);
  if (cached) {
    return new Response(cached.text, {
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'x-prv-truncated': cached.truncated ? 'true' : 'false',
        ...(cached.sourceFile?.path ? { 'x-prv-source-file': cached.sourceFile.path } : {}),
        ...(cached.sourceFile?.filename ? { 'x-prv-source-filename': cached.sourceFile.filename } : {})
      }
    });
  }

  const client = getReportusClient();
  let index: Awaited<ReturnType<typeof client.getReportIndex>>;
  try {
    index = await client.getReportIndex(params.id);
  } catch (e) {
    if (e instanceof ReportusHttpError) throw kitError(e.status, e.message);
    throw e;
  }
  const payload = await fetchNodePayload(client, params.id, index, nodeKey, { maxBytes: max });
  if (!payload) throw kitError(404, `Missing payload for nodeKey: ${nodeKey}`);

  payloadCache.set(cacheKey, {
    text: payload.text,
    truncated: payload.truncated,
    sourceFile: payload.sourceFile ? { filename: payload.sourceFile.filename, path: payload.sourceFile.path } : undefined
  });

  return new Response(payload.text, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'x-prv-truncated': payload.truncated ? 'true' : 'false',
      ...(payload.sourceFile?.path ? { 'x-prv-source-file': payload.sourceFile.path } : {}),
      ...(payload.sourceFile?.filename ? { 'x-prv-source-filename': payload.sourceFile.filename } : {})
    }
  });
};
