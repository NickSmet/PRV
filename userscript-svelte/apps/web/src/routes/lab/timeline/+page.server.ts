import type { PageServerLoad } from './$types';
import fs from 'node:fs/promises';
import { findFixturesReportsDir } from '$lib/server/fixtures';

export const load: PageServerLoad = async () => {
  const reportsDir = await findFixturesReportsDir();
  if (!reportsDir) {
    return { fixtureReportIds: [] as string[] };
  }

  const entries = await fs.readdir(reportsDir, { withFileTypes: true }).catch(() => []);
  const fixtureReportIds: string[] = [];

  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const m = /^report-(\d+)$/.exec(e.name);
    if (!m) continue;
    fixtureReportIds.push(m[1]);
  }

  fixtureReportIds.sort((a, b) => Number(b) - Number(a));
  return { fixtureReportIds };
};

