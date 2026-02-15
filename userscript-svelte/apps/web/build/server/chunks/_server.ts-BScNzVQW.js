import { j as json } from './shared-server-sSGG17Df.js';
import { g as getReportusClient } from './reportus-mitmi8Tc.js';

const GET = async ({ params }) => {
  const client = getReportusClient();
  const index = await client.getReportIndex(params.id);
  return json(index);
};

export { GET };
//# sourceMappingURL=_server.ts-BScNzVQW.js.map
