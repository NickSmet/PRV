import { error as kitError, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getReportusClient } from '$lib/server/reportus';
import { ReportusHttpError } from '@prv/report-api';

export const GET: RequestHandler = async ({ params }) => {
  const client = getReportusClient();
  try {
    const index = await client.getReportIndex(params.id);
    return json(index);
  } catch (e) {
    if (e instanceof ReportusHttpError) throw kitError(e.status, e.message);
    throw e;
  }
};
