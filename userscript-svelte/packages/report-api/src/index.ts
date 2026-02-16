export type ReportId = string;

export interface ReportusFileEntry {
  filename: string;
  path: string;
  size: number;
  offset: number;
}

export interface ReportusReportIndex {
  _id: string;
  filename: string;
  ap_info?: Record<string, unknown>;
  files: ReportusFileEntry[];
  // Optional metadata fields returned by Reportus (may vary by environment/version).
  md5?: string;
  parsed?: string;
  received?: string;
  problem_code?: number;
  problem_description?: string;
  product?: string;
  product_version?: string;
  report_id?: number;
  report_reason?: string;
  report_type?: string;
  server_uuid?: string;
  computer_model?: string;
}

export interface ReportusClient {
  getReportIndex(reportId: ReportId): Promise<ReportusReportIndex>;
  downloadFileText(
    reportId: ReportId,
    filePath: string,
    opts?: { maxBytes?: number }
  ): Promise<{ text: string; truncated: boolean }>;
  downloadFileBytes(
    reportId: ReportId,
    filePath: string,
    opts?: { maxBytes?: number }
  ): Promise<{ bytes: Uint8Array; truncated: boolean }>;
}

export class ReportusHttpError extends Error {
  readonly status: number;
  readonly url: string;

  constructor(opts: { status: number; url: string; message?: string }) {
    super(opts.message ?? `Reportus HTTP ${opts.status}`);
    this.name = 'ReportusHttpError';
    this.status = opts.status;
    this.url = opts.url;
  }
}

export function createReportusClient(opts: { baseUrl: string; basicAuth: string }): ReportusClient {
  const baseUrl = opts.baseUrl.replace(/\/+$/, '');
  const authHeader = opts.basicAuth.startsWith('Basic ') ? opts.basicAuth : `Basic ${opts.basicAuth}`;

  function encodeFilePathSegments(filePath: string): string {
    return filePath.split('/').map(encodeURIComponent).join('/');
  }

  async function getReportIndex(reportId: ReportId): Promise<ReportusReportIndex> {
    const url = `${baseUrl}/api/reports/${encodeURIComponent(reportId)}`;
    const res = await fetch(url, {
      headers: { Authorization: authHeader }
    });
    if (!res.ok) {
      throw new ReportusHttpError({ status: res.status, url, message: `Reportus getReportIndex failed: HTTP ${res.status}` });
    }
    return (await res.json()) as ReportusReportIndex;
  }

  async function downloadFileBytes(
    reportId: ReportId,
    filePath: string,
    opts?: { maxBytes?: number }
  ): Promise<{ bytes: Uint8Array; truncated: boolean }> {
    const maxBytes = opts?.maxBytes ?? 2 * 1024 * 1024;
    const url = `${baseUrl}/api/reports/${encodeURIComponent(reportId)}/files/${encodeFilePathSegments(filePath)}/download`;
    const res = await fetch(url, { headers: { Authorization: authHeader } });
    if (!res.ok) {
      throw new ReportusHttpError({
        status: res.status,
        url,
        message: `Reportus downloadFileBytes failed: HTTP ${res.status}`
      });
    }

    const reader = res.body?.getReader();
    if (!reader) {
      const ab = await res.arrayBuffer();
      const bytes = new Uint8Array(ab);
      return { bytes: bytes.slice(0, maxBytes), truncated: bytes.length > maxBytes };
    }

    const chunks: Uint8Array[] = [];
    let total = 0;
    let truncated = false;

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (!value) continue;

      if (total + value.length > maxBytes) {
        const remaining = Math.max(0, maxBytes - total);
        if (remaining > 0) chunks.push(value.slice(0, remaining));
        truncated = true;
        break;
      }

      chunks.push(value);
      total += value.length;
    }

    if (truncated) {
      try {
        await reader.cancel();
      } catch {
        // ignore
      }
    }

    const out = new Uint8Array(chunks.reduce((sum, c) => sum + c.length, 0));
    let offset = 0;
    for (const c of chunks) {
      out.set(c, offset);
      offset += c.length;
    }

    return { bytes: out, truncated };
  }

  async function downloadFileText(
    reportId: ReportId,
    filePath: string,
    opts?: { maxBytes?: number }
  ): Promise<{ text: string; truncated: boolean }> {
    const { bytes, truncated } = await downloadFileBytes(reportId, filePath, opts);
    const text = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
    return { text, truncated };
  }

  return { getReportIndex, downloadFileText, downloadFileBytes };
}
