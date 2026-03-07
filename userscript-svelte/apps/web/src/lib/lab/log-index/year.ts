import type { YearInferredFrom } from './types';

function clampYear(year: number, nowYear: number): number | null {
  if (!Number.isFinite(year)) return null;
  const y = Math.trunc(year);
  if (y < 2000 || y > nowYear + 2) return null;
  return y;
}

export function inferBaseYearFromText(
  text: string,
  nowYear: number
): { year: number | null; inferredFrom: YearInferredFrom | null } {
  // Parallels banner: "* Build information   : ... Thu, 08 Jan 2026 ..."
  const build = text.match(/^\*\s*Build information\s*:\s*.*\b(20\d{2})\b/m);
  if (build) {
    const y = clampYear(Number(build[1]), nowYear);
    if (y) return { year: y, inferredFrom: 'parallels-build' };
  }

  // Parallels daily timestamp: "DAILY TIMESTAMP: 2026-02-03 ..."
  const daily = text.match(/\bDAILY TIMESTAMP:\s*(20\d{2})-\d{2}-\d{2}\b/m);
  if (daily) {
    const y = clampYear(Number(daily[1]), nowYear);
    if (y) return { year: y, inferredFrom: 'parallels-daily' };
  }

  // Tools internal timestamps: "2025.10.03 03:04:18.824"
  const tools = text.match(/\b(20\d{2})\.\d{2}\.\d{2}\b/m);
  if (tools) {
    const y = clampYear(Number(tools[1]), nowYear);
    if (y) return { year: y, inferredFrom: 'tools-inner' };
  }

  return { year: null, inferredFrom: null };
}

export function chooseBaseYear(opts: {
  text: string;
  yearHint: number | null | undefined;
  nowYear: number;
}): { baseYear: number; yearInferredFrom: YearInferredFrom; warnings: string[] } {
  const warnings: string[] = [];

  const inferred = inferBaseYearFromText(opts.text, opts.nowYear);
  if (inferred.year) {
    return { baseYear: inferred.year, yearInferredFrom: inferred.inferredFrom!, warnings };
  }

  const hint = opts.yearHint != null ? clampYear(Number(opts.yearHint), opts.nowYear) : null;
  if (hint) return { baseYear: hint, yearInferredFrom: 'hint', warnings };

  warnings.push('Base year not found in log; defaulting to current year.');
  return { baseYear: opts.nowYear, yearInferredFrom: 'default', warnings };
}

export function clampBaseYear(
  year: number,
  nowYear: number
): { baseYear: number; yearInferredFrom: YearInferredFrom; warning?: string } {
  const y = clampYear(year, nowYear);
  if (y) return { baseYear: y, yearInferredFrom: 'default' };
  return {
    baseYear: nowYear,
    yearInferredFrom: 'clamped',
    warning: `Inferred year ${year} out of range; clamped to ${nowYear}.`
  };
}

