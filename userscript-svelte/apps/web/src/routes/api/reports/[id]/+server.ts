import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getReportusClient } from '$lib/server/reportus';

export const GET: RequestHandler = async ({ params }) => {
  const client = getReportusClient();
  const index = await client.getReportIndex(params.id);
  return json(index);
};

