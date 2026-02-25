import { b as private_env } from "./shared-server.js";
import { c as createReportusClient } from "./index.js";
function getReportusClient() {
  const baseUrl = private_env.REPORTUS_BASE_URL ?? "https://reportus.prls.net";
  const basicAuth = private_env.REPORTUS_BASIC_AUTH;
  if (!basicAuth) {
    throw new Error("Missing REPORTUS_BASIC_AUTH");
  }
  return createReportusClient({ baseUrl, basicAuth });
}
export {
  getReportusClient as g
};
