import { error as kitError } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getReportusClient } from '$lib/server/reportus';
import { TtlCache } from '$lib/server/cache';
import { ReportusHttpError } from '@prv/report-api';

const bytesCache = new TtlCache<string, { bytes: Uint8Array; truncated: boolean }>(10 * 60 * 1000);

function contentTypeFromPath(filePath: string): string {
  const lower = filePath.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.gif')) return 'image/gif';
  if (lower.endsWith('.svg')) return 'image/svg+xml';
  if (lower.endsWith('.gz')) return 'application/gzip';
  if (lower.endsWith('.json')) return 'application/json; charset=utf-8';
  if (lower.endsWith('.xml')) return 'application/xml; charset=utf-8';
  if (lower.endsWith('.txt') || lower.endsWith('.log')) return 'text/plain; charset=utf-8';
  return 'application/octet-stream';
}

export const GET: RequestHandler = async ({ params, url }) => {
  const maxBytes = Number(url.searchParams.get('maxBytes') ?? '2097152');
  const max = Number.isFinite(maxBytes) ? maxBytes : 2 * 1024 * 1024;

  const decodedPath = params.filePath;
  if (!decodedPath) throw kitError(400, 'Missing filePath');

  const cacheKey = `${params.id}::${decodedPath}::${max}::bytes`;
  const cached = bytesCache.get(cacheKey);
  if (cached) {
    return new Response(cached.bytes, {
      headers: {
        'content-type': contentTypeFromPath(decodedPath),
        'x-prv-truncated': cached.truncated ? 'true' : 'false'
      }
    });
  }

  const client = getReportusClient();
  try {
    const { bytes, truncated } = await client.downloadFileBytes(params.id, decodedPath, { maxBytes: max });
    bytesCache.set(cacheKey, { bytes, truncated });

    return new Response(bytes, {
      headers: {
        'content-type': contentTypeFromPath(decodedPath),
        'x-prv-truncated': truncated ? 'true' : 'false'
      }
    });
  } catch (e) {
    if (e instanceof ReportusHttpError) throw kitError(e.status, e.message);
    throw e;
  }
};
