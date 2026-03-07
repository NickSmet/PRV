import type { RequestHandler } from './$types';
import fs from 'node:fs/promises';
import path from 'node:path';
import { getFixtureReportDir } from '$lib/server/fixtures';

async function readTextTruncated(filePath: string, maxBytes: number): Promise<{ text: string; truncated: boolean }> {
  const fh = await fs.open(filePath, 'r');
  try {
    const buf = Buffer.alloc(Math.max(0, maxBytes) + 1);
    const { bytesRead } = await fh.read(buf, 0, buf.length, 0);
    const truncated = bytesRead > maxBytes;
    const slice = buf.subarray(0, Math.min(bytesRead, maxBytes));
    return { text: slice.toString('utf8'), truncated };
  } finally {
    await fh.close();
  }
}

export const GET: RequestHandler = async ({ params, url }) => {
  const reportId = params.reportId;
  const rawFilePath = params.filePath;

  const fixtureDir = await getFixtureReportDir(reportId);
  if (!fixtureDir) return new Response('Fixture not found', { status: 404 });

  const maxBytesParam = Number(url.searchParams.get('maxBytes') ?? '2097152');
  const maxBytes = Number.isFinite(maxBytesParam) ? Math.max(0, Math.min(maxBytesParam, 10 * 1024 * 1024)) : 2 * 1024 * 1024;

  const segments = rawFilePath.split('/');
  if (segments.length !== 1) return new Response('Invalid file path', { status: 400 });

  const filename = segments[0] ?? '';
  if (!filename || filename.includes('\0') || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return new Response('Invalid filename', { status: 400 });
  }

  const dirEntries = await fs.readdir(fixtureDir, { withFileTypes: true }).catch(() => []);
  const allowed = new Set(dirEntries.filter((d) => d.isFile()).map((d) => d.name));
  if (!allowed.has(filename)) return new Response('Not found', { status: 404 });

  const fullPath = path.join(fixtureDir, filename);
  const { text, truncated } = await readTextTruncated(fullPath, maxBytes);

  return new Response(text, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'x-prv-truncated': truncated ? 'true' : 'false'
    }
  });
};
