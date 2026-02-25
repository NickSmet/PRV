import fs from 'node:fs';
import path from 'node:path';

import dotenv from 'dotenv';
import { createReportusClient } from '@prv/report-api';
import type { ReportusReportIndex } from '@prv/report-api';
import {
  buildReportModelFromRawPayloads,
  discoverPerVmFiles,
  ensureDomParser,
  evaluateRules,
  fetchNodePayload,
  nodeRegistry,
  parseCurrentVm,
  parseToolsLog,
  type NodeKey,
  type ReportModel,
} from '@prv/report-core';
import { buildReportView } from '@prv/report-ai';

type CliOptions = {
  inPaths: string[];
  reportIds: string[];
  outTsPath?: string;
  outAuditPath?: string;
  dumpDir?: string;
  maxStringExamples: number;
  maxEnumValues: number;
};

function parseArgs(argv: string[]): CliOptions {
  const opts: CliOptions = {
    inPaths: [],
    reportIds: [],
    maxStringExamples: 3,
    maxEnumValues: 10,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = argv[i + 1];

    if (!arg.startsWith('-') && /^\d+$/.test(arg)) {
      opts.reportIds.push(arg);
      continue;
    }

    if (arg === '--in' && next) {
      opts.inPaths.push(next);
      i++;
      continue;
    }

    if ((arg === '--report-id' || arg === '--reportId') && next) {
      opts.reportIds.push(next);
      i++;
      continue;
    }

    if ((arg === '--report-ids' || arg === '--reportIds') && next) {
      const ids = next.split(',').map((s) => s.trim()).filter(Boolean);
      opts.reportIds.push(...ids);
      i++;
      continue;
    }

    if ((arg === '--out' || arg === '--out-ts') && next) {
      opts.outTsPath = next;
      i++;
      continue;
    }

    if (arg === '--out-audit' && next) {
      opts.outAuditPath = next;
      i++;
      continue;
    }

    if (arg === '--dump-dir' && next) {
      opts.dumpDir = next;
      i++;
      continue;
    }

    if (arg === '--max-examples' && next) {
      const n = Number.parseInt(next, 10);
      if (Number.isFinite(n) && n > 0) opts.maxStringExamples = Math.min(n, 20);
      i++;
      continue;
    }

    if (arg === '--max-enum' && next) {
      const n = Number.parseInt(next, 10);
      if (Number.isFinite(n) && n > 0) opts.maxEnumValues = Math.min(n, 100);
      i++;
      continue;
    }
  }

  return opts;
}

function ensureDirForFile(filePath: string) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function readJson(absPath: string): unknown {
  const text = fs.readFileSync(absPath, 'utf8');
  return JSON.parse(text);
}

function loadEnvFromRepo(): void {
  const cwd = process.cwd();
  // Prefer project root `.env`, but also support the MCP server’s `.env` location.
  dotenv.config({ path: path.resolve(cwd, '.env'), override: false });
  dotenv.config({ path: path.resolve(cwd, 'servers/mcp/.env'), override: false });
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

type TypeKind = 'unknown' | 'null' | 'boolean' | 'number' | 'string' | 'array' | 'object' | 'union';

type TypeNode =
  | { kind: 'unknown' }
  | { kind: 'null' }
  | { kind: 'boolean'; trueCount: number; falseCount: number }
  | { kind: 'number'; integerCount: number; floatCount: number; min: number | null; max: number | null }
  | { kind: 'string'; maxLen: number; examples: Set<string>; enumValues: Map<string, number> }
  | { kind: 'array'; minLen: number; maxLen: number; element: TypeNode }
  | { kind: 'object'; props: Map<string, PropStats> }
  | { kind: 'union'; members: TypeNode[] };

type PropStats = {
  presentCount: number;
  nodes: TypeNode;
};

const UNKNOWN: TypeNode = { kind: 'unknown' };

function isPlainObject(v: unknown): v is Record<string, unknown> {
  if (v === null || v === undefined) return false;
  if (typeof v !== 'object') return false;
  if (Array.isArray(v)) return false;
  return Object.prototype.toString.call(v) === '[object Object]';
}

function looksLikeStableEnum(value: string): boolean {
  const s = value.trim();
  if (!s) return false;
  if (s.length > 32) return false;
  if (/^\d{4}-\d{2}-\d{2}T/.test(s)) return false; // ISO
  if (/^\d{4}-\d{2}-\d{2}\s/.test(s)) return false; // local date
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-/.test(s.toLowerCase())) return false; // uuid
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(s)) return false; // ipv4
  if (s.includes('/') || s.includes('\\')) return false; // path-ish
  if (s.includes('@')) return false; // email/at
  if (s.includes('%')) return false; // ipv6 zone, etc.
  if (/[{}]/.test(s)) return false;
  // allow: letters, numbers, space, underscore, dash, dot, parentheses, comma
  if (!/^[A-Za-z0-9 _.,()\-]+$/.test(s)) return false;
  return true;
}

function freshNodeForValue(value: unknown, opts: CliOptions): TypeNode {
  if (value === null) return { kind: 'null' };
  if (value === undefined) return UNKNOWN;
  if (typeof value === 'boolean') return { kind: 'boolean', trueCount: value ? 1 : 0, falseCount: value ? 0 : 1 };
  if (typeof value === 'number') {
    const isInt = Number.isInteger(value);
    return {
      kind: 'number',
      integerCount: isInt ? 1 : 0,
      floatCount: isInt ? 0 : 1,
      min: Number.isFinite(value) ? value : null,
      max: Number.isFinite(value) ? value : null,
    };
  }
  if (typeof value === 'string') {
    const s = value;
    const node: TypeNode = {
      kind: 'string',
      maxLen: s.length,
      examples: new Set<string>(),
      enumValues: new Map<string, number>(),
    };
    if (s.length <= 120) node.examples.add(s);
    if (looksLikeStableEnum(s)) node.enumValues.set(s, 1);
    // Trim to caps
    while (node.examples.size > opts.maxStringExamples) node.examples.delete(node.examples.values().next().value);
    while (node.enumValues.size > opts.maxEnumValues) node.enumValues.delete(node.enumValues.keys().next().value);
    return node;
  }
  if (Array.isArray(value)) {
    const element: TypeNode = value.length ? freshNodeForValue(value[0], opts) : UNKNOWN;
    return { kind: 'array', minLen: value.length, maxLen: value.length, element };
  }
  if (isPlainObject(value)) {
    const props = new Map<string, PropStats>();
    for (const key of Object.keys(value)) {
      props.set(key, { presentCount: 1, nodes: freshNodeForValue(value[key], opts) });
    }
    return { kind: 'object', props };
  }
  return UNKNOWN;
}

function mergeNodes(a: TypeNode, b: TypeNode, opts: CliOptions): TypeNode {
  if (a.kind === 'unknown') return b;
  if (b.kind === 'unknown') return a;

  if (a.kind === 'union') return mergeUnion(a, b, opts);
  if (b.kind === 'union') return mergeUnion(b, a, opts);

  if (a.kind !== b.kind) {
    return mergeUnion({ kind: 'union', members: [a] }, b, opts);
  }

  switch (a.kind) {
    case 'null':
      return a;
    case 'boolean':
      return {
        kind: 'boolean',
        trueCount: a.trueCount + (b as any).trueCount,
        falseCount: a.falseCount + (b as any).falseCount,
      };
    case 'number': {
      const bn = b as Extract<TypeNode, { kind: 'number' }>;
      return {
        kind: 'number',
        integerCount: a.integerCount + bn.integerCount,
        floatCount: a.floatCount + bn.floatCount,
        min: a.min === null ? bn.min : bn.min === null ? a.min : Math.min(a.min, bn.min),
        max: a.max === null ? bn.max : bn.max === null ? a.max : Math.max(a.max, bn.max),
      };
    }
    case 'string': {
      const bs = b as Extract<TypeNode, { kind: 'string' }>;
      const examples = new Set(a.examples);
      for (const e of bs.examples) examples.add(e);
      const enumValues = new Map(a.enumValues);
      for (const [k, count] of bs.enumValues.entries()) {
        enumValues.set(k, (enumValues.get(k) ?? 0) + count);
      }
      while (examples.size > opts.maxStringExamples) examples.delete(examples.values().next().value);
      while (enumValues.size > opts.maxEnumValues) enumValues.delete(enumValues.keys().next().value);
      return { kind: 'string', maxLen: Math.max(a.maxLen, bs.maxLen), examples, enumValues };
    }
    case 'array': {
      const ba = b as Extract<TypeNode, { kind: 'array' }>;
      // Merge element across all items in both arrays by sampling each element.
      let element = mergeNodes(a.element, ba.element, opts);
      const minLen = Math.min(a.minLen, ba.minLen);
      const maxLen = Math.max(a.maxLen, ba.maxLen);
      return { kind: 'array', minLen, maxLen, element };
    }
    case 'object': {
      const bo = b as Extract<TypeNode, { kind: 'object' }>;
      const props = new Map<string, PropStats>();
      for (const [k, v] of a.props.entries()) props.set(k, { presentCount: v.presentCount, nodes: v.nodes });

      for (const [k, v] of bo.props.entries()) {
        const existing = props.get(k);
        if (!existing) {
          props.set(k, { presentCount: v.presentCount, nodes: v.nodes });
        } else {
          props.set(k, {
            presentCount: existing.presentCount + v.presentCount,
            nodes: mergeNodes(existing.nodes, v.nodes, opts),
          });
        }
      }
      return { kind: 'object', props };
    }
    default:
      return a;
  }
}

function mergeUnion(union: Extract<TypeNode, { kind: 'union' }>, other: TypeNode, opts: CliOptions): TypeNode {
  const members = [...union.members];
  // Try merging with existing compatible member.
  for (let i = 0; i < members.length; i++) {
    const m = members[i]!;
    if (m.kind === other.kind || m.kind === 'union' || other.kind === 'union') {
      // Let mergeNodes decide; if it stays non-union we replace.
      const merged = mergeNodes(m, other, opts);
      if (merged.kind !== 'union') {
        members[i] = merged;
        return normalizeUnion({ kind: 'union', members }, opts);
      }
    }
  }
  members.push(other);
  return normalizeUnion({ kind: 'union', members }, opts);
}

function normalizeUnion(node: Extract<TypeNode, { kind: 'union' }>, opts: CliOptions): TypeNode {
  const flat: TypeNode[] = [];
  for (const m of node.members) {
    if (m.kind === 'union') flat.push(...m.members);
    else flat.push(m);
  }

  // De-dup by kind (coarse) and merge compatible ones.
  const byKind = new Map<TypeKind, TypeNode>();
  for (const m of flat) {
    const existing = byKind.get(m.kind);
    if (!existing) byKind.set(m.kind, m);
    else byKind.set(m.kind, mergeNodes(existing, m, opts));
  }
  const members = Array.from(byKind.values());
  if (members.length === 1) return members[0]!;
  return { kind: 'union', members };
}

function mergeSamples(samples: unknown[], opts: CliOptions): TypeNode {
  let root: TypeNode = UNKNOWN;
  for (const s of samples) {
    const n = freshNodeForValue(s, opts);
    root = mergeNodes(root, n, opts);
  }
  return root;
}

function toPascal(s: string): string {
  return s
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join('');
}

function singularize(name: string): string {
  if (name.endsWith('ies')) return name.slice(0, -3) + 'y';
  if (name.endsWith('sses')) return name; // classes/addresses: leave
  if (name.endsWith('s') && name.length > 3) return name.slice(0, -1);
  return name;
}

type NamedType = {
  name: string;
  node: TypeNode;
  path: string;
};

function collectNamedTypes(root: TypeNode): NamedType[] {
  const out: NamedType[] = [];
  const seen = new Set<TypeNode>();

  const visit = (node: TypeNode, typeName: string, p: string) => {
    if (seen.has(node)) return;
    if (node.kind !== 'object') return;
    seen.add(node);
    out.push({ name: typeName, node, path: p });

    for (const [key, prop] of node.props.entries()) {
      const child = prop.nodes;
      const childPath = p ? `${p}.${key}` : key;

      if (child.kind === 'object') {
        visit(child, `${typeName}${toPascal(key)}`, childPath);
      } else if (child.kind === 'array') {
        const element = child.element;
        if (element.kind === 'object') {
          const elemName = `${typeName}${toPascal(singularize(key))}`;
          visit(element, elemName, `${childPath}[]`);
        }
      } else if (child.kind === 'union') {
        for (const m of child.members) {
          if (m.kind === 'object') {
            visit(m, `${typeName}${toPascal(key)}`, childPath);
          } else if (m.kind === 'array' && m.element.kind === 'object') {
            visit(m.element, `${typeName}${toPascal(singularize(key))}`, `${childPath}[]`);
          }
        }
      }
    }
  };

  visit(root, 'ReportView', '');
  return out;
}

function formatTypeRef(node: TypeNode, ctx: { currentName: string; key?: string }, namedByPath: Map<string, string>): string {
  switch (node.kind) {
    case 'unknown':
      return 'unknown';
    case 'null':
      return 'null';
    case 'boolean':
      return 'boolean';
    case 'number':
      return 'number';
    case 'string':
      return 'string';
    case 'array': {
      const inner = formatTypeRef(node.element, ctx, namedByPath);
      return `${inner}[]`;
    }
    case 'object': {
      // Resolve by path-based name if possible.
      const k = ctx.key ? `${ctx.currentName}.${ctx.key}` : ctx.currentName;
      const ref = namedByPath.get(k);
      return ref ?? '{ [key: string]: unknown }';
    }
    case 'union':
      return node.members.map((m) => formatTypeRef(m, ctx, namedByPath)).sort().join(' | ');
  }
}

function buildNamedByPath(named: NamedType[]): Map<string, string> {
  const map = new Map<string, string>();

  for (const t of named) {
    map.set(t.path ? t.path : 'ReportView', t.name);
  }

  // Additional mappings for object nodes under arrays: "foo[]" and "foo" both point to the same type name.
  for (const t of named) {
    if (t.path.endsWith('[]')) {
      map.set(t.path.slice(0, -2), t.name);
    }
  }

  return map;
}

function propOptional(prop: PropStats, sampleCount: number): boolean {
  return prop.presentCount < sampleCount;
}

function nodeHasNull(node: TypeNode): boolean {
  if (node.kind === 'null') return true;
  if (node.kind !== 'union') return false;
  return node.members.some((m) => nodeHasNull(m));
}

function literalHint(node: TypeNode, opts: CliOptions): string | null {
  if (node.kind !== 'string') return null;
  if (node.enumValues.size === 0) return null;
  if (node.enumValues.size > opts.maxEnumValues) return null;
  const values = Array.from(node.enumValues.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([v]) => v);
  if (values.length === 0 || values.length > opts.maxEnumValues) return null;
  const allSafe = values.every((v) => looksLikeStableEnum(v));
  if (!allSafe) return null;
  return values.map((v) => JSON.stringify(v)).join(' | ');
}

function examplesHint(node: TypeNode, opts: CliOptions): string | null {
  if (node.kind !== 'string') return null;
  const examples = Array.from(node.examples.values()).filter(Boolean);
  if (examples.length === 0) return null;
  return examples.slice(0, opts.maxStringExamples).map((e) => JSON.stringify(e)).join(', ');
}

function printTs(named: NamedType[], sampleCount: number, opts: CliOptions): string {
  const namedByPath = buildNamedByPath(named);

  const lines: string[] = [];
  lines.push('/* eslint-disable */');
  lines.push('/**');
  lines.push(' * GENERATED (local) — ReportView shape inferred from JSON dumps.');
  lines.push(` * Samples: ${sampleCount}`);
  lines.push(' *');
  lines.push(' * Notes:');
  lines.push(' * - This is *descriptive*, not authoritative. It reflects the observed dumps.');
  lines.push(' * - Many raw values exist under non-enumerable `__raw` and are visible via ctx.raw(...) in the MCP sandbox.');
  lines.push(' */');
  lines.push('');

  // Print deepest-first to reduce forward refs noise (optional).
  const ordered = [...named].sort((a, b) => b.path.split('.').length - a.path.split('.').length);

  for (const t of ordered) {
    if (t.node.kind !== 'object') continue;
    lines.push('/**');
    lines.push(` * Path: ${t.path || '(root)'}`);
    lines.push(' */');
    lines.push(`export interface ${t.name} {`);

    const props = Array.from(t.node.props.entries()).sort(([a], [b]) => a.localeCompare(b));
    for (const [key, prop] of props) {
      const optional = propOptional(prop, sampleCount);
      const nullable = nodeHasNull(prop.nodes);

      const literal = literalHint(prop.nodes, opts);
      const examples = examplesHint(prop.nodes, opts);

      if (literal || examples) {
        const bits: string[] = [];
        if (literal) bits.push(`literals: ${literal}`);
        if (examples) bits.push(`examples: ${examples}`);
        lines.push(`  /** ${bits.join(' | ')} */`);
      }

      // Reference child types by path name when possible.
      const propPath = t.path ? `${t.path}.${key}` : key;
      const directRef = namedByPath.get(propPath);
      const arrayElemRef = prop.nodes.kind === 'array' ? namedByPath.get(`${propPath}[]`) : undefined;
      const refName = directRef ?? arrayElemRef;

      const typeRef =
        refName
          ? prop.nodes.kind === 'array'
            ? `${refName}[]`
            : refName
          : formatTypeRef(prop.nodes, { currentName: t.name, key }, namedByPath);

      const finalType = nullable && !typeRef.includes('null') ? `${typeRef} | null` : typeRef;
      lines.push(`  ${JSON.stringify(key)}${optional ? '?' : ''}: ${finalType};`);
    }

    lines.push('}');
    lines.push('');
  }

  return lines.join('\n');
}

type AuditItem = {
  path: string;
  reason: string;
  details?: string;
};

function collectAudit(root: TypeNode, sampleCount: number, opts: CliOptions): AuditItem[] {
  const items: AuditItem[] = [];

  const visit = (node: TypeNode, p: string) => {
    if (node.kind === 'object') {
      for (const [k, prop] of node.props.entries()) {
        const childPath = p ? `${p}.${k}` : k;
        const optional = propOptional(prop, sampleCount);
        if (optional) items.push({ path: childPath, reason: 'optional', details: `${prop.presentCount}/${sampleCount} samples` });

        // Always null?
        const n = prop.nodes;
        if (n.kind === 'null') items.push({ path: childPath, reason: 'always null' });
        if (n.kind === 'union') {
          const nonNull = n.members.filter((m) => m.kind !== 'null');
          if (nonNull.length === 0) items.push({ path: childPath, reason: 'always null' });
        }

        visit(prop.nodes, childPath);
      }
      return;
    }

    if (node.kind === 'array') {
      if (node.maxLen === 0) items.push({ path: `${p}[]`, reason: 'always empty array' });
      visit(node.element, `${p}[]`);
      return;
    }

    if (node.kind === 'string') {
      if (node.maxLen >= 2000) {
        items.push({ path: p, reason: 'very long string', details: `maxLen=${node.maxLen}` });
      }

      if (sampleCount >= 3) {
        const enumValues = Array.from(node.enumValues.entries())
          .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
          .map(([v]) => v);
        if (enumValues.length > 0 && enumValues.length <= opts.maxEnumValues) {
          items.push({ path: p, reason: 'string enum candidate', details: enumValues.slice(0, opts.maxEnumValues).join(', ') });
        }
      }
    }

    if (node.kind === 'array') {
      if (node.maxLen >= 200) items.push({ path: p, reason: 'large array', details: `maxLen=${node.maxLen}` });
    }
  };

  visit(root, '');
  return items;
}

type ReportusCredentials = { baseUrl: string; basicAuth: string };

function resolveReportusCredentials(): ReportusCredentials {
  const baseUrl = process.env.REPORTUS_BASE_URL ?? 'https://reportus.prls.net';
  const basicAuth = process.env.REPORTUS_BASIC_AUTH;
  if (!basicAuth) throw new Error('Missing env var REPORTUS_BASIC_AUTH (Basic auth token)');
  return { baseUrl, basicAuth };
}

function enrichReportMetaFromIndex(report: ReportModel, index: ReportusReportIndex, reportId: string) {
  report.meta.productName = index.product ?? report.meta.productName;
  report.meta.productVersion = index.product_version ?? report.meta.productVersion;
  report.meta.reportId = String(index.report_id ?? reportId);
  report.meta.reportType = index.report_type ?? report.meta.reportType;
  report.meta.reportReason = index.report_reason ?? report.meta.reportReason;
}

async function buildReportViewFromReportus(reportId: string) {
  ensureDomParser();
  const creds = resolveReportusCredentials();
  const client = createReportusClient({ baseUrl: creds.baseUrl, basicAuth: creds.basicAuth });

  const index = await client.getReportIndex(reportId);

  // Fetch all node payloads
  const raw: Partial<Record<NodeKey, string>> = {};
  for (const key of Object.keys(nodeRegistry) as NodeKey[]) {
    const payload = await fetchNodePayload(client, reportId, index, key);
    if (payload?.text) raw[key] = payload.text;
  }

  const built = buildReportModelFromRawPayloads(raw);
  const report = built.report;
  enrichReportMetaFromIndex(report, index, reportId);
  const markers = evaluateRules(report);

  const perVm = discoverPerVmFiles(index);
  const receivedIso = index.received;

  // Parse non-current VM data (config.pvs + tools.log)
  const currentUuid = (report.currentVm?.vmUuid ?? '').toLowerCase();
  const parsedPerVm: Record<string, { settings?: ReturnType<typeof parseCurrentVm>; toolsLog?: ReturnType<typeof parseToolsLog> }> = {};

  for (const [uuid, entry] of Object.entries(perVm.vmConfigByUuid)) {
    if (uuid === currentUuid) continue;
    try {
      const { text } = await client.downloadFileText(reportId, entry.path, { maxBytes: 2 * 1024 * 1024 });
      const settings = parseCurrentVm(text);
      if (!parsedPerVm[uuid]) parsedPerVm[uuid] = {};
      parsedPerVm[uuid].settings = settings;
    } catch {
      // best-effort
    }
  }

  for (const [uuid, entry] of Object.entries(perVm.toolsLogByUuid)) {
    if (uuid === currentUuid) continue;
    try {
      const { text } = await client.downloadFileText(reportId, entry.path, { maxBytes: 1 * 1024 * 1024 });
      const toolsLog = parseToolsLog(text);
      if (!parsedPerVm[uuid]) parsedPerVm[uuid] = {};
      parsedPerVm[uuid].toolsLog = toolsLog;
    } catch {
      // best-effort
    }
  }

  const view = buildReportView(report, markers, { reportId, perVm, parsedPerVm, receivedIso });
  return { view, index };
}

function printAuditMd(audit: AuditItem[], inPaths: string[]): string {
  const lines: string[] = [];
  lines.push('# ReportView Shape Audit');
  lines.push('');
  lines.push(`Inputs: ${inPaths.map((p) => `\`${p}\``).join(', ')}`);
  lines.push('');
  const grouped = new Map<string, AuditItem[]>();
  for (const a of audit) {
    const arr = grouped.get(a.reason) ?? [];
    if (!grouped.has(a.reason)) grouped.set(a.reason, arr);
    arr.push(a);
  }

  const reasons = Array.from(grouped.keys()).sort();
  for (const reason of reasons) {
    lines.push(`## ${reason}`);
    lines.push('');
    const items = grouped.get(reason) ?? [];
    for (const it of items.sort((a, b) => a.path.localeCompare(b.path)).slice(0, 200)) {
      lines.push(`- \`${it.path || '(root)'}\`${it.details ? ` — ${it.details}` : ''}`);
    }
    if (items.length > 200) lines.push(`- … +${items.length - 200} more`);
    lines.push('');
  }

  return lines.join('\n');
}

async function main() {
  loadEnvFromRepo();
  const opts = parseArgs(process.argv.slice(2));

  const reportIds = Array.from(new Set(opts.reportIds.map((s) => s.trim()).filter(Boolean)));
  const userInputs = opts.inPaths.map((p) => path.resolve(p));
  const allInputs: string[] = [...userInputs];
  const samples: unknown[] = [];

  // 1) Fetch real reports (if requested)
  if (reportIds.length > 0) {
    const dumpDir = path.resolve(opts.dumpDir ?? path.join('/tmp', 'prv-reportview-samples'));
    fs.mkdirSync(dumpDir, { recursive: true });

    for (const reportId of reportIds) {
      const { view } = await buildReportViewFromReportus(reportId);
      const dumpPath = path.join(dumpDir, `prv-reportview-${reportId}.json`);
      fs.writeFileSync(dumpPath, stableStringify(view), 'utf8');
      samples.push(view);
      allInputs.push(dumpPath);
    }
  }

  // 2) Load local JSON dumps (if provided)
  for (const p of userInputs) {
    if (!p.endsWith('.json')) continue;
    if (!fs.existsSync(p)) continue;
    samples.push(readJson(p));
  }

  if (samples.length === 0) {
    const hint = reportIds.length > 0
      ? 'No samples generated from report IDs.'
      : 'No input JSON provided.';
    throw new Error(`${hint} Use --report-id <id> (repeatable) or --in <path> (repeatable).`);
  }

  const root = mergeSamples(samples, opts);

  const named = collectNamedTypes(root);
  const outTsPath = path.resolve(opts.outTsPath ?? path.join('docs', 'reportview-shape.generated.ts'));
  const outAuditPath = path.resolve(opts.outAuditPath ?? path.join('docs', 'reportview-shape.audit.md'));

  ensureDirForFile(outTsPath);
  fs.writeFileSync(outTsPath, printTs(named, samples.length, opts), 'utf8');

  ensureDirForFile(outAuditPath);
  const audit = collectAudit(root, samples.length, opts);
  fs.writeFileSync(outAuditPath, printAuditMd(audit, allInputs), 'utf8');

  process.stdout.write(
    JSON.stringify(
      {
        ok: true,
        samples: samples.length,
        outTsPath,
        outAuditPath,
        dumpDir: reportIds.length > 0 ? path.resolve(opts.dumpDir ?? path.join('/tmp', 'prv-reportview-samples')) : undefined,
      },
      null,
      2,
    ) + '\n',
  );
}

main().catch((err) => {
  const msg = err instanceof Error ? err.message : String(err);
  process.stderr.write(`[describe-ai-shape] error: ${msg}\n`);
  process.exit(1);
});
