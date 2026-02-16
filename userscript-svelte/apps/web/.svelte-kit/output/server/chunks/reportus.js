import { b as private_env } from "./shared-server.js";
class ReportusHttpError extends Error {
  constructor(opts) {
    super(opts.message ?? `Reportus HTTP ${opts.status}`);
    this.name = "ReportusHttpError";
    this.status = opts.status;
    this.url = opts.url;
  }
}
function createReportusClient(opts) {
  const baseUrl = opts.baseUrl.replace(/\/+$/, "");
  const authHeader = opts.basicAuth.startsWith("Basic ") ? opts.basicAuth : `Basic ${opts.basicAuth}`;
  function encodeFilePathSegments(filePath) {
    return filePath.split("/").map(encodeURIComponent).join("/");
  }
  async function getReportIndex(reportId) {
    const url = `${baseUrl}/api/reports/${encodeURIComponent(reportId)}`;
    const res = await fetch(url, {
      headers: { Authorization: authHeader }
    });
    if (!res.ok) {
      throw new ReportusHttpError({ status: res.status, url, message: `Reportus getReportIndex failed: HTTP ${res.status}` });
    }
    return await res.json();
  }
  async function downloadFileBytes(reportId, filePath, opts2) {
    const maxBytes = opts2?.maxBytes ?? 2 * 1024 * 1024;
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
    const chunks = [];
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
  async function downloadFileText(reportId, filePath, opts2) {
    const { bytes, truncated } = await downloadFileBytes(reportId, filePath, opts2);
    const text = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
    return { text, truncated };
  }
  return { getReportIndex, downloadFileText, downloadFileBytes };
}
function getReportusClient() {
  const baseUrl = private_env.REPORTUS_BASE_URL ?? "https://reportus.prls.net";
  const basicAuth = private_env.REPORTUS_BASIC_AUTH;
  if (!basicAuth) {
    throw new Error("Missing REPORTUS_BASIC_AUTH");
  }
  return createReportusClient({ baseUrl, basicAuth });
}
export {
  ReportusHttpError as R,
  getReportusClient as g
};
