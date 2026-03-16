import type { YearInferredFrom } from './types';

type MonthDay = {
  month: number;
  day: number;
};

type ReportDateParts = MonthDay & {
  year: number;
};

function clampYear(year: number, nowYear: number): number | null {
  if (!Number.isFinite(year)) return null;
  const y = Math.trunc(year);
  if (y < 2000 || y > nowYear + 2) return null;
  return y;
}

function parseTimestampMonthDay(tsRaw: string): MonthDay | null {
  const match = /^(\d\d)-(\d\d) \d\d:\d\d:\d\d\.\d{3}$/.exec(tsRaw);
  if (!match) return null;

  const month = Number(match[1]);
  const day = Number(match[2]);
  if (!Number.isFinite(month) || !Number.isFinite(day) || month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  return { month, day };
}

export function extractLineTimestampMonthDay(line: string): MonthDay | null {
  const match = /^(\d\d-\d\d \d\d:\d\d:\d\d\.\d{3})\b/.exec(line);
  if (!match) return null;
  return parseTimestampMonthDay(match[1]);
}

function compareMonthDay(a: MonthDay, b: MonthDay): number {
  if (a.month !== b.month) return a.month - b.month;
  return a.day - b.day;
}

function parseReportReceivedDate(
  reportReceivedAt: string | null | undefined,
  timezoneOffsetSeconds: number | null | undefined
): ReportDateParts | null {
  if (!reportReceivedAt) return null;

  const receivedMs = Date.parse(reportReceivedAt);
  if (!Number.isFinite(receivedMs)) return null;

  const localMs = receivedMs + (timezoneOffsetSeconds ?? 0) * 1000;
  const local = new Date(localMs);
  const year = local.getUTCFullYear();
  const month = local.getUTCMonth() + 1;
  const day = local.getUTCDate();
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null;

  return { year, month, day };
}

function findLastTimestampMonthDay(text: string): MonthDay | null {
  const lines = text.split(/\r?\n/);
  for (let i = lines.length - 1; i >= 0; i -= 1) {
    const parts = extractLineTimestampMonthDay(lines[i] ?? '');
    if (parts) return parts;
  }
  return null;
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
  reportReceivedAt: string | null | undefined;
  timezoneOffsetSeconds: number | null | undefined;
  nowYear: number;
}): { baseYear: number; yearInferredFrom: YearInferredFrom; warnings: string[] } {
  const warnings: string[] = [];

  const reportDate = parseReportReceivedDate(opts.reportReceivedAt, opts.timezoneOffsetSeconds);
  if (reportDate) {
    const lastTimestamp = findLastTimestampMonthDay(opts.text);
    const anchoredYear =
      lastTimestamp && compareMonthDay(lastTimestamp, reportDate) > 0
        ? reportDate.year - 1
        : reportDate.year;
    const clamped = clampYear(anchoredYear, opts.nowYear);
    if (clamped) {
      return { baseYear: clamped, yearInferredFrom: 'report-received', warnings };
    }
  }

  const inferred = inferBaseYearFromText(opts.text, opts.nowYear);
  if (inferred.year) {
    return { baseYear: inferred.year, yearInferredFrom: inferred.inferredFrom!, warnings };
  }

  const hint = opts.yearHint != null ? clampYear(Number(opts.yearHint), opts.nowYear) : null;
  if (hint) return { baseYear: hint, yearInferredFrom: 'hint', warnings };

  warnings.push('Base year not found in log; defaulting to current year.');
  return { baseYear: opts.nowYear, yearInferredFrom: 'default', warnings };
}

export function inferTimestampYears(lines: string[], baseYear: number): Array<number | null> {
  const years = new Array<number | null>(lines.length).fill(null);

  let year = baseYear;
  let newer: MonthDay | null = null;

  for (let i = lines.length - 1; i >= 0; i -= 1) {
    const parts = extractLineTimestampMonthDay(lines[i] ?? '');
    if (!parts) continue;

    if (newer && parts.month > newer.month) year -= 1;

    years[i] = year;
    newer = parts;
  }

  return years;
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
