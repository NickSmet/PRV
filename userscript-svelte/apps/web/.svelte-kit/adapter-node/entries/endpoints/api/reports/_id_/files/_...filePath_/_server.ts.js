import { error } from "@sveltejs/kit";
import { g as getReportusClient, R as ReportusHttpError } from "../../../../../../../chunks/reportus.js";
const GET = async ({ params, url }) => {
  const maxBytes = Number(url.searchParams.get("maxBytes") ?? "2097152");
  const client = getReportusClient();
  const decodedPath = params.filePath;
  if (!decodedPath) throw error(400, "Missing filePath");
  try {
    const { text, truncated } = await client.downloadFileText(params.id, decodedPath, {
      maxBytes: Number.isFinite(maxBytes) ? maxBytes : 2 * 1024 * 1024
    });
    return new Response(text, {
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "x-prv-truncated": truncated ? "true" : "false"
      }
    });
  } catch (e) {
    if (e instanceof ReportusHttpError) throw error(e.status, e.message);
    throw e;
  }
};
export {
  GET
};
