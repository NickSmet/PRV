import path from 'node:path';
import fs from 'node:fs/promises';

async function isDir(p: string): Promise<boolean> {
  try {
    const st = await fs.stat(p);
    return st.isDirectory();
  } catch {
    return false;
  }
}

export async function findFixturesReportsDir(): Promise<string | null> {
  const cwd = process.cwd();
  const candidates = [
    path.resolve(cwd, 'fixtures', 'reports'),
    path.resolve(cwd, '..', 'fixtures', 'reports'),
    path.resolve(cwd, '..', '..', 'fixtures', 'reports'),
    path.resolve(cwd, '..', '..', '..', 'fixtures', 'reports')
  ];

  for (const c of candidates) {
    if (await isDir(c)) return c;
  }
  return null;
}

export async function getFixtureReportDir(reportId: string): Promise<string | null> {
  const reportsDir = await findFixturesReportsDir();
  if (!reportsDir) return null;
  const dir = path.join(reportsDir, `report-${reportId}`);
  return (await isDir(dir)) ? dir : null;
}

