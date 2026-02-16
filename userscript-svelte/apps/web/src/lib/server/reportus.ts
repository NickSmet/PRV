import { env } from '$env/dynamic/private';
import { createReportusClient } from '@prv/report-api';

export function getReportusClient() {
  const baseUrl = env.REPORTUS_BASE_URL ?? 'https://reportus.prls.net';
  const basicAuth = env.REPORTUS_BASIC_AUTH;
  if (!basicAuth) {
    throw new Error('Missing REPORTUS_BASIC_AUTH');
  }
  return createReportusClient({ baseUrl, basicAuth });
}

