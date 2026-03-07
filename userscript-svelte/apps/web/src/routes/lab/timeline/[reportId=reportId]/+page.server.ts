import type { PageServerLoad } from './$types';
import fs from 'node:fs/promises';
import path from 'node:path';
import { getFixtureReportDir } from '$lib/server/fixtures';

function parseTimezoneOffsetSeconds(reportXml: string): number | null {
  const m = reportXml.match(/<TimeZone>(-?\d+)<\/TimeZone>/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}

function inferYearHintFromFilenames(files: Array<{ filename: string }>): number | null {
  for (const f of files) {
    const name = f.filename;
    // Common fixture filename: prl_vm_app_2026-02-03-141913_*.diag
    const ymd = name.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/);
    if (ymd) return Number(ymd[1]);
    const ymdDot = name.match(/\b(20\d{2})\.(\d{2})\.(\d{2})\b/);
    if (ymdDot) return Number(ymdDot[1]);
  }
  return null;
}

export const load: PageServerLoad = async ({ params }) => {
  const reportId = params.reportId;

  const fixtureDir = await getFixtureReportDir(reportId);
  if (!fixtureDir) {
    return {
      reportId,
      fixtureOk: false,
      timezoneOffsetSeconds: null,
      yearHint: null,
      files: [] as Array<{ filename: string; size: number }>,
      defaultSelected: [] as string[]
    };
  }

  const dirEntries = await fs.readdir(fixtureDir, { withFileTypes: true });
  const files: Array<{ filename: string; size: number }> = [];

  for (const e of dirEntries) {
    if (!e.isFile()) continue;
    const filename = e.name;
    const st = await fs.stat(path.join(fixtureDir, filename)).catch(() => null);
    if (!st) continue;
    files.push({ filename, size: st.size });
  }

  files.sort((a, b) => a.filename.localeCompare(b.filename));

  const reportXml = await fs.readFile(path.join(fixtureDir, 'Report.xml'), 'utf8').catch(() => '');
  const timezoneOffsetSeconds = reportXml ? parseTimezoneOffsetSeconds(reportXml) : null;
  const yearHint = inferYearHintFromFilenames(files);

  const available = new Set(files.map((f) => f.filename));
  const defaultSelected: string[] = [];
  if (available.has('vm.log')) defaultSelected.push('vm.log');
  if (available.has('parallels-system.log')) defaultSelected.push('parallels-system.log');
  if (defaultSelected.length === 0) {
    const first = files.slice(0, 2).map((f) => f.filename);
    defaultSelected.push(...first);
  }

  return { reportId, fixtureOk: true, timezoneOffsetSeconds, yearHint, files, defaultSelected };
};
