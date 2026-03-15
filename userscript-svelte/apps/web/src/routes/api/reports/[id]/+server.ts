import { error as kitError, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ReportusHttpError } from '@prv/report-api';
import { ReportSourceError, resolveReportSource } from '$lib/server/report-source';

export const GET: RequestHandler = async ({ params }) => {
  try {
    const source = await resolveReportSource(params.id);
    return json(source.index);
  } catch (e) {
    if (e instanceof ReportusHttpError || e instanceof ReportSourceError) {
      throw kitError(e.status, e.message);
    }
    throw e;
  }
};
