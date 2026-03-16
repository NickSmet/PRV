import type { TimelineEvent } from './types';

type TimestampParts = {
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  ms: number;
};

const TS_RE =
  /^(?<mm>\d{2})-(?<dd>\d{2})\s+(?<hh>\d{2}):(?<mi>\d{2}):(?<ss>\d{2})(?:\.(?<ms>\d{1,3}))?\s+/;

export function inferBaseYear(texts: Array<{ filename: string; text: string }>): number | null {
  for (const { filename, text } of texts) {
    if (!text) continue;

    // tools.log often has YYYY.MM.DD
    const ymdDot = text.match(/\b(20\d{2})\.(\d{2})\.(\d{2})\b/);
    if (ymdDot) return Number(ymdDot[1]);

    // Some logs contain build lines like: "Thu, 08 Jan 2026 20:52:22"
    const buildLine = text.match(/\b(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun),\s+\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(20\d{2})\b/);
    if (buildLine) return Number(buildLine[1]);

    // ISO-ish dates inside logs
    const ymdDash = text.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/);
    if (ymdDash) return Number(ymdDash[1]);

    // As a fallback, also try filename (rare)
    const fnYear = filename.match(/\b(20\d{2})\b/);
    if (fnYear) return Number(fnYear[1]);
  }

  return null;
}

export function parseTimestampParts(line: string): TimestampParts | null {
  const m = TS_RE.exec(line);
  if (!m?.groups) return null;
  const month = Number(m.groups.mm);
  const day = Number(m.groups.dd);
  const hour = Number(m.groups.hh);
  const minute = Number(m.groups.mi);
  const second = Number(m.groups.ss);
  const ms = Number((m.groups.ms ?? '0').padEnd(3, '0'));

  if (
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    !Number.isFinite(hour) ||
    !Number.isFinite(minute) ||
    !Number.isFinite(second) ||
    !Number.isFinite(ms)
  ) {
    return null;
  }

  return { month, day, hour, minute, second, ms };
}

export function toUtcDate(
  parts: TimestampParts,
  opts: { year: number; timezoneOffsetSeconds: number | null }
): Date {
  const localAsUtcMs = Date.UTC(
    opts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
    parts.ms
  );
  const offsetMs = (opts.timezoneOffsetSeconds ?? 0) * 1000;
  return new Date(localAsUtcMs - offsetMs);
}

export function parseParallelsSystemLog(
  text: string,
  opts: { sourceFile: string; year: number; timezoneOffsetSeconds: number | null }
): TimelineEvent[] {
  if (!text.trim()) return [];

  const events: TimelineEvent[] = [];

  type OpenMsg = {
    id: string;
    typeCode: string;
    startedAt: Date;
    line: number;
    detail?: string;
  };

  const openByKey = new Map<string, OpenMsg>();

  // Keep a short-lived cache of message metadata by Code=...
  const msgDataByCode = new Map<string, { at: Date; detail: string }>();

  // Config diff burst accumulator
  type DiffLine = { at: Date; line: number; text: string };
  let diffBurst: { start: Date; end: Date; lines: DiffLine[] } | null = null;

  function flushDiffBurst() {
    if (!diffBurst) return;
    const count = diffBurst.lines.length;
    if (count > 0) {
      const preview = diffBurst.lines
        .slice(0, 20)
        .map((d) => d.text)
        .join('\n');
      const truncated = count > 20 ? `\n… +${count - 20} more` : '';
      const detail = `${preview}${truncated}`;

      const label = count === 1 ? '1 config change' : `${count} config changes`;
      events.push({
        id: `parallels-system.log:config:${diffBurst.start.getTime()}:${count}`,
        ruleId: 'lab.parallels_system.config_diff_burst',
        sourceFile: opts.sourceFile,
        category: 'Config Diffs',
        severity: 'info',
        start: diffBurst.start,
        end: diffBurst.end,
        label,
        detail,
        startRef: {
          sourceFile: opts.sourceFile,
          lineNo: diffBurst.lines[0]?.line,
          tsWallMs: diffBurst.start.getTime()
        },
        endRef: {
          sourceFile: opts.sourceFile,
          lineNo: diffBurst.lines[count - 1]?.line,
          tsWallMs: diffBurst.end.getTime()
        }
      });
    }
    diffBurst = null;
  }

  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    const parts = parseTimestampParts(line);
    if (!parts) continue;
    const at = toUtcDate(parts, { year: opts.year, timezoneOffsetSeconds: opts.timezoneOffsetSeconds });
    const lineNo = i + 1;

    // Message metadata line
    // Example: Message data: ... Code=GUI_QUESTION_...; ... Short="..."; Long="..."; Details="";
    const msgData = /Message data: .*?\bCode=(?<code>[A-Z0-9_]+);.*?\bShort="(?<short>[^"]*)";\s*Long="(?<long>[^"]*)";\s*Details="(?<details>[^"]*)";/.exec(
      line
    );
    if (msgData?.groups?.code) {
      const code = msgData.groups.code;
      const short = msgData.groups.short?.trim();
      const long = msgData.groups.long?.trim();
      const details = msgData.groups.details?.trim();
      const detailParts = [short ? `Short: ${short}` : null, long ? `Long: ${long}` : null, details ? `Details: ${details}` : null].filter(Boolean);
      msgDataByCode.set(code, { at, detail: detailParts.join('\n') });
    }

    // GUI message start
    const show = /Showing message box\.\s+Type = \[(?<type>[^,]+),\s*(?<code>[^\]]+)\]\.\s+Id = \{(?<id>[0-9a-fA-F-]{36})\}/.exec(
      line
    );
    if (show?.groups?.id && show.groups.code) {
      const id = show.groups.id.toLowerCase();
      const typeCode = show.groups.code.trim();
      const key = `${id}|${typeCode}`;
      const meta = msgDataByCode.get(typeCode);
      const metaFresh = meta && Math.abs(meta.at.getTime() - at.getTime()) <= 2000 ? meta.detail : undefined;
      openByKey.set(key, { id, typeCode, startedAt: at, line: lineNo, detail: metaFresh });
      continue;
    }

    // GUI message end
    const close = /Closing message box\.\s+Type = \[(?<type>[^,]+),\s*(?<code>[^\]]+)\]\.\s+Id = \{(?<id>[0-9a-fA-F-]{36})\}/.exec(
      line
    );
    if (close?.groups?.id && close.groups.code) {
      const id = close.groups.id.toLowerCase();
      const typeCode = close.groups.code.trim();
      const key = `${id}|${typeCode}`;
      const open = openByKey.get(key);
      if (open) {
        openByKey.delete(key);
        events.push({
          id: `parallels-system.log:gui:${open.startedAt.getTime()}:${typeCode}`,
          ruleId: 'lab.parallels_system.gui_message',
          sourceFile: opts.sourceFile,
          category: 'GUI Messages',
          severity: 'info',
          start: open.startedAt,
          end: at,
          label: `PD Message: ${typeCode}`,
          detail: open.detail,
          startRef: { sourceFile: opts.sourceFile, lineNo: open.line, tsWallMs: open.startedAt.getTime() },
          endRef: { sourceFile: opts.sourceFile, lineNo, tsWallMs: at.getTime() },
          rawRef: { line: open.line }
        });
      }
      continue;
    }

    // Config diffs
    const diff = /(VmCfgCommitDiff|VmCfgAtomicEditDiff|diff):\s+Key:\s+'(?<key>[^']+)',\s+New value:\s+'(?<new>[^']*)',\s+Old value:\s+'(?<old>[^']*)'/.exec(
      line
    );
    if (diff?.groups?.key) {
      const key = diff.groups.key;
      const oldV = diff.groups.old ?? '';
      const newV = diff.groups.new ?? '';
      const rendered = `${key}: '${oldV}' → '${newV}'`;

      if (!diffBurst) {
        diffBurst = { start: at, end: at, lines: [{ at, line: lineNo, text: rendered }] };
        continue;
      }

      const gapMs = at.getTime() - diffBurst.end.getTime();
      if (gapMs > 250) {
        flushDiffBurst();
        diffBurst = { start: at, end: at, lines: [{ at, line: lineNo, text: rendered }] };
      } else {
        diffBurst.end = at;
        diffBurst.lines.push({ at, line: lineNo, text: rendered });
      }
      continue;
    }
  }

  flushDiffBurst();

  // Close any open GUI messages (leave them as points)
  for (const open of openByKey.values()) {
    events.push({
      id: `parallels-system.log:gui:${open.startedAt.getTime()}:${open.typeCode}:open`,
      ruleId: 'lab.parallels_system.gui_message',
      sourceFile: opts.sourceFile,
      category: 'GUI Messages',
      severity: 'warn',
      start: open.startedAt,
      label: `PD Message: ${open.typeCode}`,
      detail: open.detail,
      startRef: { sourceFile: opts.sourceFile, lineNo: open.line, tsWallMs: open.startedAt.getTime() },
      rawRef: { line: open.line }
    });
  }

  return events;
}

export function parseVmLog(
  text: string,
  opts: { sourceFile: string; year: number; timezoneOffsetSeconds: number | null }
): TimelineEvent[] {
  if (!text.trim()) return [];

  type AppAgg = {
    start: Date;
    end: Date;
    label: string;
    detail?: string;
    startLine: number;
    endLine: number;
  };
  const byKey = new Map<string, AppAgg>();

  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    const parts = parseTimestampParts(line);
    if (!parts) continue;
    const at = toUtcDate(parts, { year: opts.year, timezoneOffsetSeconds: opts.timezoneOffsetSeconds });

    const d3d = /\b(?<d3d>D3D\d+\.\d+):\s+(?<path>.+)$/.exec(line);
    if (!d3d?.groups?.d3d || !d3d.groups.path) continue;

    const d3dVer = d3d.groups.d3d;
    const p = d3d.groups.path;
    const exeMatch = p.match(/([^\\\/]+\.exe)\b/gi);
    const exe = exeMatch?.[exeMatch.length - 1] ?? null;
    if (!exe) continue;

    const key = `${exe.toLowerCase()}|${d3dVer}`;
    const label = `${exe} (${d3dVer})`;

    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, { start: at, end: at, label, detail: p.trim(), startLine: i + 1, endLine: i + 1 });
      continue;
    }
    if (at.getTime() < existing.start.getTime()) {
      existing.start = at;
      existing.startLine = i + 1;
    }
    if (at.getTime() > existing.end.getTime()) {
      existing.end = at;
      existing.endLine = i + 1;
    }
  }

  const out: TimelineEvent[] = [];
  for (const [key, agg] of byKey.entries()) {
    out.push({
      id: `vm.log:apps:${agg.start.getTime()}:${key}`,
      ruleId: 'lab.vm.app_range',
      sourceFile: opts.sourceFile,
      category: 'Apps',
      severity: 'info',
      start: agg.start,
      end: agg.end.getTime() === agg.start.getTime() ? undefined : agg.end,
      label: agg.label,
      detail: agg.detail,
      startRef: { sourceFile: opts.sourceFile, lineNo: agg.startLine, tsWallMs: agg.start.getTime() },
      endRef:
        agg.end.getTime() === agg.start.getTime()
          ? undefined
          : { sourceFile: opts.sourceFile, lineNo: agg.endLine, tsWallMs: agg.end.getTime() }
    });
  }

  out.sort((a, b) => a.start.getTime() - b.start.getTime());
  return out;
}
