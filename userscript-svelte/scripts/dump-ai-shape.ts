import fs from 'node:fs';
import path from 'node:path';

import {
  buildReportModelFromRawPayloads,
  discoverPerVmFiles,
  ensureDomParser,
  evaluateRules,
  nodeRegistry,
  parseCurrentVm,
  parseToolsLog,
  type NodeKey,
  type ReportModel,
} from '@prv/report-core';
import { buildReportView } from '@prv/report-ai';
import type { ReportusFileEntry, ReportusReportIndex } from '@prv/report-api';
import { cloneIncludingHidden } from '../servers/mcp/src/ctxHelpers';

type CliOptions = {
  fixtureDir?: string;
  reportId?: string;
  outPath?: string;
  rawOutPath?: string;
  reportXmlOutPath?: string;
  auditOutPath?: string;
  auditMaxItems: number;
};

function parseArgs(argv: string[]): CliOptions {
  const opts: CliOptions = {
    auditMaxItems: 200,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = argv[i + 1];

    if (arg === '--fixture' && next) {
      opts.fixtureDir = next;
      i++;
      continue;
    }

    if ((arg === '--report-id' || arg === '--reportId') && next) {
      opts.reportId = next;
      i++;
      continue;
    }

    if (arg === '--out' && next) {
      opts.outPath = next;
      i++;
      continue;
    }

    if (arg === '--raw-out' && next) {
      opts.rawOutPath = next;
      i++;
      continue;
    }

    if (arg === '--report-xml-out' && next) {
      opts.reportXmlOutPath = next;
      i++;
      continue;
    }

    if (arg === '--audit-out' && next) {
      opts.auditOutPath = next;
      i++;
      continue;
    }

    if (arg === '--audit-max' && next) {
      const n = Number.parseInt(next, 10);
      if (Number.isFinite(n) && n > 0) opts.auditMaxItems = Math.min(n, 2000);
      i++;
      continue;
    }
  }

  return opts;
}

function requireFixtureDir(opts: CliOptions): { fixtureDir: string; reportId: string } {
  if (opts.fixtureDir) {
    const resolved = path.resolve(opts.fixtureDir);
    const m = /report-(\d+)/.exec(path.basename(resolved));
    const reportId = opts.reportId ?? (m ? m[1] : 'unknown');
    return { fixtureDir: resolved, reportId };
  }

  if (opts.reportId) {
    const resolved = path.resolve('fixtures', 'reports', `report-${opts.reportId}`);
    return { fixtureDir: resolved, reportId: opts.reportId };
  }

  throw new Error('Missing fixture input. Provide `--fixture <dir>` or `--report-id <id>`.');
}

function readTextIfExists(absPath: string): string | null {
  try {
    if (!fs.existsSync(absPath)) return null;
    if (!fs.statSync(absPath).isFile()) return null;
    return fs.readFileSync(absPath, 'utf8');
  } catch {
    return null;
  }
}

function ensureDirForFile(filePath: string) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function stableStringify(value: unknown): string {
  const seen = new WeakSet<object>();

  const normalize = (v: any): any => {
    if (v === null || v === undefined) return v;
    if (typeof v !== 'object') return v;
    if (v instanceof Date) return v.toISOString();
    if (Array.isArray(v)) return v.map(normalize);

    if (seen.has(v)) return '[Circular]';
    seen.add(v);

    const out: Record<string, any> = {};
    for (const key of Object.keys(v).sort()) {
      out[key] = normalize(v[key]);
    }
    return out;
  };

  return JSON.stringify(normalize(value), null, 2) + '\n';
}

function normalizeFixtureRelativePath(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (path.isAbsolute(trimmed)) return undefined;
  if (/^[A-Za-z]:[\\/]/.test(trimmed)) return undefined;
  if (trimmed.split(/[\\/]/).some((part) => part === '..')) return undefined;
  return trimmed.replace(/\\/g, '/');
}

function isLikelyFilenameReference(value: string): boolean {
  const normalized = normalizeFixtureRelativePath(value);
  if (!normalized) return false;
  const base = path.basename(normalized);
  if (!base) return false;
  if (!/\.(xml|txt|log|json)$/i.test(base)) return false;
  return true;
}

function findTagEndIndex(xml: string, startIndex: number): number {
  let inQuote: '"' | "'" | null = null;
  for (let i = startIndex; i < xml.length; i++) {
    const ch = xml[i];
    if (inQuote) {
      if (ch === inQuote) inQuote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      inQuote = ch as '"' | "'";
      continue;
    }
    if (ch === '>') return i;
  }
  return -1;
}

function extractElementXml(xmlText: string, tagName: string): string | undefined {
  const start = xmlText.search(new RegExp(`<${tagName}(\\s|>|/)`));
  if (start === -1) return undefined;

  let depth = 0;
  let i = start;

  while (i < xmlText.length) {
    if (xmlText.startsWith('<!--', i)) {
      const end = xmlText.indexOf('-->', i + 4);
      if (end === -1) break;
      i = end + 3;
      continue;
    }

    if (xmlText.startsWith('<![CDATA[', i)) {
      const end = xmlText.indexOf(']]>', i + 9);
      if (end === -1) break;
      i = end + 3;
      continue;
    }

    if (xmlText.startsWith(`</${tagName}`, i)) {
      depth--;
      const tagEnd = findTagEndIndex(xmlText, i);
      if (tagEnd === -1) break;
      i = tagEnd + 1;
      if (depth === 0) return xmlText.slice(start, i);
      continue;
    }

    if (xmlText.startsWith(`<${tagName}`, i)) {
      const tagEnd = findTagEndIndex(xmlText, i);
      if (tagEnd === -1) break;
      const tagText = xmlText.slice(i, tagEnd + 1);
      const isSelfClosing = /\/>\s*$/.test(tagText);
      if (!isSelfClosing) depth++;
      i = tagEnd + 1;
      continue;
    }

    i++;
  }

  return undefined;
}

function extractFromReportXml(reportXml: string, nodeKey: NodeKey): string | null {
  const tag = nodeKey;
  const re = new RegExp(`<${tag}(\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, 'i');
  const match = re.exec(reportXml);
  if (!match) return null;

  // Some parsers require a single root element rather than inner-only content.
  if (nodeKey === 'GuestCommands' || nodeKey === 'AutoStatisticInfo' || nodeKey === 'AdvancedVmInfo' || nodeKey === 'TimeZone') {
    return extractElementXml(reportXml, nodeKey) ?? match[0].trim();
  }

  const inner = match[2] ?? '';
  const cdata = /<!\[CDATA\[([\s\S]*?)\]\]>/i.exec(inner);
  const rawInner = (cdata ? cdata[1] : inner).trim();
  return rawInner.length ? rawInner : null;
}

function readFixtureFileByName(fixtureDir: string, filePathOrName: string): string | null {
  const normalized = normalizeFixtureRelativePath(filePathOrName);
  if (normalized) {
    const abs = path.join(fixtureDir, normalized);
    const direct = readTextIfExists(abs);
    if (direct !== null) return direct;
  }
  const base = path.basename(filePathOrName);
  const abs = path.join(fixtureDir, base);
  return readTextIfExists(abs);
}

function resolveNodePayload(fixtureDir: string, reportXmlText: string, nodeName: NodeKey): string {
  const fileHint: Partial<Record<NodeKey, string>> = {
    AdvancedVmInfo: 'AdvancedVmInfo.xml',
    AppConfig: 'AppConfig.xml',
    AutoStatisticInfo: 'AutoStatisticInfo.xml',
    ClientInfo: 'ClientInfo.xml',
    ClientProxyInfo: 'ClientProxyInfo.txt',
    CurrentVm: 'CurrentVm.xml',
    GuestOs: 'GuestOs.xml',
    HostInfo: 'HostInfo.xml',
    InstalledSoftware: 'InstalledSoftware.txt',
    LaunchdInfo: 'LaunchdInfo.txt',
    LoadedDrivers: 'AllLoadedDrivers.txt',
    MoreHostInfo: 'MoreHostInfo.xml',
    MountInfo: 'MountInfo.txt',
    NetConfig: 'NetConfig.xml',
    ParallelsSystemLog: 'parallels-system.log',
    ToolsLog: 'tools.log',
    VmDirectory: 'VmDirectory.xml',
    AllProcesses: 'AllProcesses.txt',
    TimeZone: 'Report.xml',
    GuestCommands: 'Report.xml',
  };

  const hinted = fileHint[nodeName];
  if (hinted) {
    const fromHint = readFixtureFileByName(fixtureDir, hinted);
    if (fromHint !== null) {
      // Report.xml isn't the payload for these nodes; extract actual node text below.
      if (nodeName !== 'GuestCommands' && nodeName !== 'TimeZone') return fromHint;
    }
  }

  const extracted = extractFromReportXml(reportXmlText, nodeName);
  const textValue = extracted?.trim() ?? '';

  if (textValue && isLikelyFilenameReference(textValue)) {
    const fromRef = readFixtureFileByName(fixtureDir, textValue);
    if (fromRef !== null) return fromRef;
    return '';
  }

  if (!textValue) {
    // Fallback: try common extensions.
    const candidates = [
      `${nodeName}.xml`,
      `${nodeName}.txt`,
      `${nodeName}.log`,
      `${nodeName}.json`,
    ];
    for (const candidate of candidates) {
      const fromCandidate = readFixtureFileByName(fixtureDir, candidate);
      if (fromCandidate !== null) return fromCandidate;
    }
  }

  return textValue;
}

function buildFixtureIndex(fixtureDir: string): ReportusReportIndex {
  const files: ReportusFileEntry[] = [];
  const base = fixtureDir;

  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.')) continue;
      if (entry.isDirectory()) {
        if (entry.name === '_out') continue;
        walk(path.join(dir, entry.name));
        continue;
      }
      if (!entry.isFile()) continue;
      const abs = path.join(dir, entry.name);
      const rel = path.relative(base, abs).split(path.sep).join('/');
      const stat = fs.statSync(abs);
      files.push({
        filename: entry.name,
        path: rel,
        size: stat.size,
        offset: 0,
      });
    }
  };

  walk(base);
  files.sort((a, b) => a.path.localeCompare(b.path));

  return {
    _id: 'fixture',
    filename: path.basename(fixtureDir),
    files,
  };
}

function inferReceivedIsoFromFixture(index: Pick<ReportusReportIndex, 'files'>): string | undefined {
  // Common fixture file naming includes: prl_vm_app_2026-02-02-093601_*.diag
  const candidates: string[] = [];
  for (const f of index.files) {
    const name = f.filename ?? '';
    const m = /_(\d{4})-(\d{2})-(\d{2})-(\d{2})(\d{2})(\d{2})_/.exec(name);
    if (!m) continue;
    candidates.push(`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}`);
  }
  candidates.sort();
  return candidates.length ? candidates[candidates.length - 1] : undefined;
}

function enrichReportMetaFromReportXml(report: ReportModel, reportXml: string, reportId: string) {
  const productName = /<ProductName>\s*([^<]+?)\s*<\/ProductName>/i.exec(reportXml)?.[1]?.trim();
  const clientVersion = /<ClientVersion>\s*([^<]+?)\s*<\/ClientVersion>/i.exec(reportXml)?.[1]?.trim();
  const serverVersion = /<ServerVersion>\s*([^<]+?)\s*<\/ServerVersion>/i.exec(reportXml)?.[1]?.trim();
  const reportReason = /<ReportReason>\s*([^<]+?)\s*<\/ReportReason>/i.exec(reportXml)?.[1]?.trim();

  report.meta.reportId = reportId;
  report.meta.productName = productName ?? report.meta.productName;
  report.meta.productVersion = clientVersion ?? serverVersion ?? report.meta.productVersion;
  report.meta.reportReason = reportReason ?? report.meta.reportReason;
}

type AuditIssueType =
  | 'epoch_string'
  | 'epoch_number'
  | 'non_iso_datetime'
  | 'bool_01_string'
  | 'mac_compact';

type AuditIssue = {
  type: AuditIssueType;
  path: string;
  value: string;
  hint: string;
};

function auditValueIssues(root: unknown, maxItems: number): AuditIssue[] {
  const issues: AuditIssue[] = [];

  const boolKeyRe =
    /(enabled|disabled|connected|kextless|is[A-Z_]|has[A-Z_]|use[A-Z_]|shared|expanding|splitted|trim|isolated|pauseAfter|rollback|reclaim|usb3|timeSync|clipboard|accessGuestFromHost|start|onMacShutdown|onVmShutdown|onWindowClose)$/i;
  const timeKeyRe = /(timestamp|time|date|expires|expiration|received)$/i;

  const lastKeyName = (p: string): string => {
    const cleaned = p.replace(/\[\d+\]/g, '');
    const m = /(?:^|\.)([A-Za-z_][A-Za-z0-9_]*)$/.exec(cleaned);
    return m?.[1] ?? '';
  };

  const push = (issue: AuditIssue) => {
    if (issues.length >= maxItems) return;
    issues.push(issue);
  };

  const walk = (value: unknown, p: string) => {
    if (issues.length >= maxItems) return;
    if (value === null || value === undefined) return;

    if (typeof value === 'string') {
      const s = value.trim();
      if (/^\d{13}$/.test(s)) {
        push({ type: 'epoch_string', path: p, value: s, hint: 'epoch-ms string; prefer ISO 8601' });
      } else if (/^\d{10}$/.test(s)) {
        push({ type: 'epoch_string', path: p, value: s, hint: 'epoch-sec string; prefer ISO 8601' });
      } else if (s === '0' || s === '1') {
        const k = lastKeyName(p);
        if (k && boolKeyRe.test(k)) {
          push({ type: 'bool_01_string', path: p, value: s, hint: 'boolean encoded as string; prefer true/false + label' });
        }
      } else if (
        /^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}/.test(s) ||
        /^\d{4}\/\d{2}\/\d{2}\s+\d{1,2}:\d{2}:\d{2}/.test(s) ||
        /^\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}/.test(s)
      ) {
        // Includes partial timestamps like "MM-DD HH:MM:SS".
        if (!s.includes('T')) {
          push({ type: 'non_iso_datetime', path: p, value: s, hint: 'non-ISO timestamp; prefer ISO 8601 (include year if possible)' });
        }
      } else if (/^[0-9A-Fa-f]{12}$/.test(s)) {
        push({ type: 'mac_compact', path: p, value: s, hint: 'MAC without separators; prefer AA:BB:CC:DD:EE:FF' });
      }
      return;
    }

    if (typeof value === 'number') {
      const k = lastKeyName(p);
      if (k && timeKeyRe.test(k) && value >= 1_000_000_000_000 && value <= 9_999_999_999_999) {
        push({ type: 'epoch_number', path: p, value: String(value), hint: 'epoch-ms number; prefer ISO 8601 string in AI-facing shape' });
      }
      return;
    }

    if (typeof value !== 'object') return;

    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        walk(value[i], `${p}[${i}]`);
        if (issues.length >= maxItems) return;
      }
      return;
    }

    const obj = value as Record<string, unknown>;
    for (const key of Object.keys(obj)) {
      walk(obj[key], p ? `${p}.${key}` : key);
      if (issues.length >= maxItems) return;
    }
  };

  walk(root, '');
  return issues;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const { fixtureDir, reportId } = requireFixtureDir(opts);

  ensureDomParser();

  const reportXmlPath = path.join(fixtureDir, 'Report.xml');
  const reportXmlText = readTextIfExists(reportXmlPath);
  if (reportXmlText === null) {
    throw new Error(`Missing fixture file: ${reportXmlPath}`);
  }

  const reportXmlOutPath = opts.reportXmlOutPath ?? path.join('/tmp', `prv-report-${reportId}.Report.xml`);
  ensureDirForFile(reportXmlOutPath);
  fs.writeFileSync(reportXmlOutPath, reportXmlText, 'utf8');

  const raw: Partial<Record<NodeKey, string>> = {};
  for (const key of Object.keys(nodeRegistry) as NodeKey[]) {
    const payload = resolveNodePayload(fixtureDir, reportXmlText, key);
    if (payload && payload.trim().length > 0) raw[key] = payload;
  }

  const built = buildReportModelFromRawPayloads(raw as any);
  const report = built.report;
  enrichReportMetaFromReportXml(report, reportXmlText, reportId);

  const markers = evaluateRules(report);
  const index = buildFixtureIndex(fixtureDir);
  const perVm = discoverPerVmFiles(index);
  const receivedIso = inferReceivedIsoFromFixture(index);

  const currentUuid = (report.currentVm?.vmUuid ?? '').toLowerCase();
  const parsedPerVm: Record<string, { settings?: ReturnType<typeof parseCurrentVm>; toolsLog?: ReturnType<typeof parseToolsLog> }> = {};

  for (const [uuid, entry] of Object.entries(perVm.vmConfigByUuid)) {
    if (uuid === currentUuid) continue;
    const abs = path.join(fixtureDir, entry.path);
    const text = readTextIfExists(abs);
    if (text === null) continue;
    try {
      const settings = parseCurrentVm(text);
      if (!parsedPerVm[uuid]) parsedPerVm[uuid] = {};
      parsedPerVm[uuid].settings = settings;
    } catch {
      // best-effort
    }
  }

  for (const [uuid, entry] of Object.entries(perVm.toolsLogByUuid)) {
    if (uuid === currentUuid) continue;
    const abs = path.join(fixtureDir, entry.path);
    const text = readTextIfExists(abs);
    if (text === null) continue;
    try {
      const toolsLog = parseToolsLog(text);
      if (!parsedPerVm[uuid]) parsedPerVm[uuid] = {};
      parsedPerVm[uuid].toolsLog = toolsLog;
    } catch {
      // best-effort
    }
  }

  const view = buildReportView(report, markers, { reportId, perVm, parsedPerVm, receivedIso });
  const json = stableStringify(view);

  const outPath = opts.outPath ?? path.join('/tmp', `prv-reportview-${reportId}.json`);
  ensureDirForFile(outPath);
  fs.writeFileSync(outPath, json, 'utf8');

  const rawOutPath = opts.rawOutPath ?? path.join('/tmp', `prv-reportview-${reportId}.raw.json`);
  const rawView = cloneIncludingHidden(view, { maxDepth: 10, maxArrayItems: 800 });
  const rawJson = stableStringify(rawView);
  ensureDirForFile(rawOutPath);
  fs.writeFileSync(rawOutPath, rawJson, 'utf8');

  const audit = auditValueIssues(view, opts.auditMaxItems);
  const auditPayload = stableStringify({
    reportId,
    outPath,
    rawOutPath,
    reportXmlOutPath,
    issueCount: audit.length,
    issues: audit,
  });

  const auditOutPath = opts.auditOutPath ?? path.join('/tmp', `prv-reportview-${reportId}.audit.json`);
  ensureDirForFile(auditOutPath);
  fs.writeFileSync(auditOutPath, auditPayload, 'utf8');

  process.stdout.write(
    stableStringify({
      ok: true,
      reportId,
      fixtureDir,
      outPath,
      rawOutPath,
      reportXmlOutPath,
      auditOutPath,
      issueCount: audit.length,
    })
  );
}

main().catch((err) => {
  const msg = err instanceof Error ? err.message : String(err);
  process.stderr.write(`[dump-ai-shape] error: ${msg}\n`);
  process.exit(1);
});
