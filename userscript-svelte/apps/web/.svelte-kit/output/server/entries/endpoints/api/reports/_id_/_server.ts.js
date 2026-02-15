import { json } from "@sveltejs/kit";
import { g as getReportusClient } from "../../../../../chunks/reportus.js";
const GET = async ({ params }) => {
  const client = getReportusClient();
  const index = await client.getReportIndex(params.id);
  return json(index);
};
export {
  GET
};
