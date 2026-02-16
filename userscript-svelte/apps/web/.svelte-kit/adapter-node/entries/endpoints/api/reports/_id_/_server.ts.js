import { json, error } from "@sveltejs/kit";
import { g as getReportusClient, R as ReportusHttpError } from "../../../../../chunks/reportus.js";
const GET = async ({ params }) => {
  const client = getReportusClient();
  try {
    const index = await client.getReportIndex(params.id);
    return json(index);
  } catch (e) {
    if (e instanceof ReportusHttpError) throw error(e.status, e.message);
    throw e;
  }
};
export {
  GET
};
