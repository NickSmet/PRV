import { error as kitError } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getReportusClient } from '$lib/server/reportus';
import { ReportusHttpError } from '@prv/report-api';

export const GET: RequestHandler = async ({ params, url }) => {
  const maxBytes = Number(url.searchParams.get('maxBytes') ?? '2097152');
  const client = getReportusClient();
  const decodedPath = params.filePath;
  if (!decodedPath) throw kitError(400, 'Missing filePath');

  try {
    const { text, truncated } = await client.downloadFileText(params.id, decodedPath, {
      maxBytes: Number.isFinite(maxBytes) ? maxBytes : 2 * 1024 * 1024
    });

    return new Response(text, {
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'x-prv-truncated': truncated ? 'true' : 'false'
      }
    });
  } catch (e) {
    if (e instanceof ReportusHttpError) throw kitError(e.status, e.message);
    throw e;
  }
};
