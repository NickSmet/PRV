import type { LogKind, LogRow, LogLevel, ParseResult, ParseStats, YearInferredFrom } from './types';
import { extractDiffFields, extractGuiMessageDataFields, extractLeadingBracketTags } from './extract';
import { parseTsRaw } from './timestamp';
import { inferTimestampYears } from './year';

function parsePid(v: string | undefined): number | null {
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function parseHeaderPart(hdr: string): { component: string; pid: number | null; ctx: string | null } {
  const parts = hdr.split(':');
  if (parts.length >= 3) {
    const ctx = parts[parts.length - 1] ?? '';
    const pidPart = parts[parts.length - 2] ?? '';
    const pid = /^\d+$/.test(pidPart) ? parsePid(pidPart) : null;
    if (pid != null) {
      const component = parts.slice(0, -2).join(':') || hdr;
      return { component, pid, ctx: ctx || null };
    }
  }

  return { component: hdr, pid: null, ctx: null };
}

function looksLikeKeyValueLine(raw: string): boolean {
  return /^[A-Za-z0-9 _.\-]{1,80}:\s+\S/.test(raw);
}

function isIndented(raw: string): boolean {
  return /^\s+/.test(raw);
}

function initKindCounts(): Record<LogKind, number> {
  return { entry: 0, continuation: 0, repeat: 0, meta: 0, unknown: 0 };
}

function bump<T extends string>(m: Map<T, number>, k: T) {
  m.set(k, (m.get(k) ?? 0) + 1);
}

type ParserOptions = {
  reportId: string;
  sourceFile: string;
  baseYear: number;
  yearInferredFrom: YearInferredFrom;
  lineYears?: Array<number | null>;
};

type ParserFinalize = {
  stats: ParseStats;
  baseYear: number;
  yearInferredFrom: YearInferredFrom;
};

export type LogParser = {
  pushLine(raw: string): LogRow;
  finalize(): ParserFinalize;
};

export function createLogParser(opts: ParserOptions): LogParser {
  const entryRe =
    /^(?<ts>\d\d-\d\d \d\d:\d\d:\d\d\.\d{3}) (?<lvl>[A-Z]) \/(?<hdr>[^/]+)\/ ?(?<msg>.*)$/;
  const relaxedEntryRe =
    /^(?:(?<prefix>\S+\s+\S+)\s+)?(?:(?:(?<lvl>[A-Z])|(?<badLvl>\S+))\s+)?\/(?<hdr>[^/]+)\/ ?(?<msg>.*)$/;
  const repeatRe =
    /^(?<ts>\d\d-\d\d \d\d:\d\d:\d\d\.\d{3}) Last message repeated (?<n>\d+) times\.$/;
  const relaxedRepeatRe =
    /^(?:(?<prefix>\S+\s+\S+)\s+)?Last message repeated (?<n>\d+) times\.$/;

  const kindCounts = initKindCounts();
  const componentCounts = new Map<string, number>();
  const tagCounts = new Map<string, number>();

  let lineNo = 0;
  let lastEntryId: string | null = null;
  let lastEntryEndsWithColon = false;
  let entryWithTs = 0;
  let lastResolvedTsWallMs: number | null = null;

  function buildBaseRow(
    kind: LogKind,
    raw: string,
    overrides: Partial<LogRow> = {}
  ): LogRow {
    return {
      id: `${opts.sourceFile}:${lineNo}`,
      reportId: opts.reportId,
      sourceFile: opts.sourceFile,
      lineNo,
      kind,
      tsWallMs: null,
      tsRaw: null,
      level: null,
      component: null,
      pid: null,
      ctx: null,
      raw,
      message: raw,
      tags: [],
      parentId: null,
      repeatCount: null,
      fields: null,
      ...overrides
    };
  }

  function resolveFallbackTsWallMs(): number | null {
    if (lastResolvedTsWallMs == null) return null;
    return lastResolvedTsWallMs + 1;
  }

  function buildEntryRow(args: {
    raw: string;
    tsRaw: string | null;
    level: LogLevel;
    hdr: string;
    msgRaw: string;
  }): LogRow {
    const { component, pid, ctx } = parseHeaderPart(args.hdr);
    const { tags, rest } = extractLeadingBracketTags(args.msgRaw);
    const message = rest;

    const fields: Record<string, string> = {};
    const diffFields = extractDiffFields(message);
    if (diffFields) Object.assign(fields, diffFields);
    const guiFields = extractGuiMessageDataFields(message);
    if (guiFields) Object.assign(fields, guiFields);

    const lineYear = opts.lineYears?.[lineNo - 1] ?? opts.baseYear;
    const parsedTsWallMs = args.tsRaw ? parseTsRaw(args.tsRaw, lineYear) : null;
    const tsWallMs = parsedTsWallMs ?? resolveFallbackTsWallMs();
    if (parsedTsWallMs != null) entryWithTs += 1;

    const row = buildBaseRow('entry', args.raw, {
      tsWallMs,
      tsRaw: args.tsRaw,
      level: args.level,
      component,
      pid,
      ctx,
      message,
      tags,
      fields: Object.keys(fields).length ? fields : null
    });

    kindCounts.entry += 1;
    bump(componentCounts, component);
    for (const t of tags) bump(tagCounts, t);

    lastEntryId = row.id;
    lastEntryEndsWithColon =
      message.trimEnd().endsWith(':') || args.msgRaw.trimEnd().endsWith(':');
    if (tsWallMs != null) lastResolvedTsWallMs = tsWallMs;
    return row;
  }

  function pushLine(raw: string): LogRow {
    lineNo += 1;

    const entryMatch = entryRe.exec(raw);
    if (entryMatch?.groups) {
      return buildEntryRow({
        raw,
        tsRaw: entryMatch.groups.ts,
        level: entryMatch.groups.lvl as LogLevel,
        hdr: entryMatch.groups.hdr,
        msgRaw: entryMatch.groups.msg ?? ''
      });
    }

    const relaxedEntryMatch = relaxedEntryRe.exec(raw);
    if (relaxedEntryMatch?.groups) {
      return buildEntryRow({
        raw,
        tsRaw: relaxedEntryMatch.groups.prefix ?? null,
        level: (relaxedEntryMatch.groups.lvl as LogLevel | undefined) ?? 'I',
        hdr: relaxedEntryMatch.groups.hdr,
        msgRaw: relaxedEntryMatch.groups.msg ?? ''
      });
    }

    const repeatMatch = repeatRe.exec(raw);
    if (repeatMatch?.groups) {
      const tsRaw = repeatMatch.groups.ts;
      const repeatCount = Number(repeatMatch.groups.n);
      const lineYear = opts.lineYears?.[lineNo - 1] ?? opts.baseYear;
      const row = buildBaseRow('repeat', raw, {
        tsWallMs: parseTsRaw(tsRaw, lineYear) ?? resolveFallbackTsWallMs(),
        tsRaw,
        message: raw.replace(/^\d\d-\d\d \d\d:\d\d:\d\d\.\d{3}\s+/, ''),
        parentId: lastEntryId,
        repeatCount: Number.isFinite(repeatCount) ? repeatCount : null
      });
      kindCounts.repeat += 1;
      if (row.tsWallMs != null) lastResolvedTsWallMs = row.tsWallMs;
      return row;
    }

    const relaxedRepeatMatch = relaxedRepeatRe.exec(raw);
    if (relaxedRepeatMatch?.groups) {
      const repeatCount = Number(relaxedRepeatMatch.groups.n);
      const row = buildBaseRow('repeat', raw, {
        tsWallMs: resolveFallbackTsWallMs(),
        tsRaw: relaxedRepeatMatch.groups.prefix ?? null,
        message: raw.replace(/^(?:\S+\s+\S+\s+)?/, ''),
        parentId: lastEntryId,
        repeatCount: Number.isFinite(repeatCount) ? repeatCount : null
      });
      kindCounts.repeat += 1;
      if (row.tsWallMs != null) lastResolvedTsWallMs = row.tsWallMs;
      return row;
    }

    if (/^\*{1,}\s*/.test(raw)) {
      const row = buildBaseRow('meta', raw);
      kindCounts.meta += 1;
      return row;
    }

    const shouldAttach =
      !!lastEntryId && (lastEntryEndsWithColon || isIndented(raw) || looksLikeKeyValueLine(raw));
    if (shouldAttach) {
      const row = buildBaseRow('continuation', raw, {
        parentId: lastEntryId
      });
      kindCounts.continuation += 1;
      return row;
    }

    const row = buildBaseRow('unknown', raw);
    kindCounts.unknown += 1;
    return row;
  }

  function topN(m: Map<string, number>, n: number): Array<{ key: string; count: number }> {
    return [...m.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([key, count]) => ({ key, count }));
  }

  function finalize(): ParserFinalize {
    const totalRows = lineNo;
    const unknownRate = totalRows ? kindCounts.unknown / totalRows : 0;

    const stats: ParseStats = {
      totalRows,
      kindCounts,
      entryWithTs,
      unknownRate,
      topComponents: topN(componentCounts, 10).map((x) => ({ component: x.key, count: x.count })),
      topTags: topN(tagCounts, 10).map((x) => ({ tag: x.key, count: x.count }))
    };

    return {
      stats,
      baseYear: opts.baseYear,
      yearInferredFrom: opts.yearInferredFrom
    };
  }

  return { pushLine, finalize };
}

export function parseLogText(opts: {
  text: string;
  reportId: string;
  sourceFile: string;
  baseYear: number;
  yearInferredFrom: YearInferredFrom;
  lineYears?: Array<number | null>;
  warnings?: string[];
}): ParseResult {
  const rows: LogRow[] = [];

  const lines = opts.text.split(/\r?\n/);
  if (lines.length > 0 && lines[lines.length - 1] === '') lines.pop();

  const parser = createLogParser({
    reportId: opts.reportId,
    sourceFile: opts.sourceFile,
    baseYear: opts.baseYear,
    yearInferredFrom: opts.yearInferredFrom,
    lineYears: opts.lineYears ?? inferTimestampYears(lines, opts.baseYear)
  });

  for (const raw of lines) rows.push(parser.pushLine(raw));

  const result = parser.finalize();
  return {
    rows,
    stats: result.stats,
    baseYear: result.baseYear,
    yearInferredFrom: result.yearInferredFrom,
    warnings: [...(opts.warnings ?? [])]
  };
}
