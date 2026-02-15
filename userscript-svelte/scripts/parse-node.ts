import fs from 'node:fs';
import path from 'node:path';
import chokidar from 'chokidar';

import { parseHTML } from 'linkedom';

import {
  parseAdvancedVmInfo,
  parseAllProcesses,
  parseAppConfig,
  parseAutoStatisticInfo,
  parseClientInfo,
  parseClientProxyInfo,
  parseCurrentVm,
  parseGuestCommands,
  parseGuestOs,
  parseHostInfo,
  parseInstalledSoftware,
  parseLaunchdInfo,
  parseLicenseData,
  parseLoadedDrivers,
  parseMoreHostInfo,
  parseMountInfo,
  parseNetConfig,
  parseParallelsSystemLog,
  parseTimeZone,
  parseToolsLog,
  parseVmDirectory
} from '@prv/report-core';

type NodeKey =
  | 'AdvancedVmInfo'
  | 'AllProcesses'
  | 'AppConfig'
  | 'AutoStatisticInfo'
  | 'ClientInfo'
  | 'ClientProxyInfo'
  | 'CurrentVm'
  | 'GuestCommands'
  | 'GuestOs'
  | 'HostInfo'
  | 'InstalledSoftware'
  | 'LaunchdInfo'
  | 'LicenseData'
  | 'LoadedDrivers'
  | 'MoreHostInfo'
  | 'MountInfo'
  | 'NetConfig'
  | 'ParallelsSystemLog'
  | 'TimeZone'
  | 'ToolsLog'
  | 'VmDirectory';

type CliOptions = {
  fixtureDir?: string;
  reportXmlPath?: string;
  node: NodeKey;
  outPath?: string;
  watch: boolean;
};

function parseArgs(argv: string[]): CliOptions {
  const opts: CliOptions = {
    node: 'GuestCommands',
    watch: false
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = argv[i + 1];

    if (arg === '--fixture' && next) {
      opts.fixtureDir = next;
      i++;
      continue;
    }

    if ((arg === '--report' || arg === '--report-xml') && next) {
      opts.reportXmlPath = next;
      i++;
      continue;
    }

    if (arg === '--node' && next) {
      opts.node = next as NodeKey;
      i++;
      continue;
    }

    if (arg === '--out' && next) {
      opts.outPath = next;
      i++;
      continue;
    }

    if (arg === '--watch') {
      opts.watch = true;
      continue;
    }
  }

  return opts;
}

function resolveReportXmlPath(opts: CliOptions): string {
  if (opts.reportXmlPath) {
    return opts.reportXmlPath;
  }

  if (opts.fixtureDir) {
    const candidates = [
      path.join(opts.fixtureDir, 'report.xml'),
      path.join(opts.fixtureDir, 'Report.xml'),
      path.join(opts.fixtureDir, 'Report (1).xml')
    ];

    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) return candidate;
    }
  }

  throw new Error('Missing report XML path. Provide `--report-xml <path>` or `--fixture <dir>` containing `report.xml`.');
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

function ensureDomParserAvailable() {
  if (typeof (globalThis as any).DOMParser !== 'undefined') return;
  const { window } = parseHTML('<html></html>');
  (globalThis as any).DOMParser = window.DOMParser;
  (globalThis as any).XMLSerializer = window.XMLSerializer;
}

function parseReportXmlOrThrow(xml: string): Document {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'application/xml');
  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    throw new Error(`Failed to parse report XML: ${parseError.textContent || 'unknown error'}`);
  }
  return doc;
}

function normalizeFixtureRelativePath(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  // Disallow absolute paths and Windows drive roots.
  if (path.isAbsolute(trimmed)) return undefined;
  if (/^[A-Za-z]:[\\/]/.test(trimmed)) return undefined;

  // Disallow traversal.
  if (trimmed.split(/[\\/]/).some((part) => part === '..')) return undefined;

  // Normalize separators for consistent joining.
  return trimmed.replace(/\\/g, '/');
}

const fixtureIndexCache = new Map<string, Map<string, string>>();

function buildFixtureIndex(fixtureDir: string): Map<string, string> {
  const byBaseNameLower = new Map<string, string>();

  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.')) continue;
      if (entry.isDirectory()) {
        if (entry.name === '_out' || entry.name === 'node_modules') continue;
        walk(path.join(dir, entry.name));
        continue;
      }
      if (!entry.isFile()) continue;
      const absPath = path.join(dir, entry.name);
      const baseLower = entry.name.toLowerCase();
      if (!byBaseNameLower.has(baseLower)) {
        byBaseNameLower.set(baseLower, absPath);
      }
    }
  };

  walk(fixtureDir);
  return byBaseNameLower;
}

function getFixtureIndex(fixtureDir: string): Map<string, string> {
  const cached = fixtureIndexCache.get(fixtureDir);
  if (cached) return cached;
  const index = buildFixtureIndex(fixtureDir);
  fixtureIndexCache.set(fixtureDir, index);
  return index;
}

function readFixtureFile(fixtureDir: string, filePathOrName: string): string | undefined {
  const normalized = normalizeFixtureRelativePath(filePathOrName);
  if (normalized) {
    const asPath = path.join(fixtureDir, normalized);
    if (fs.existsSync(asPath) && fs.statSync(asPath).isFile()) {
      return fs.readFileSync(asPath, 'utf8');
    }
  }

  const baseName = path.basename(filePathOrName);
  const baseLower = baseName.toLowerCase();
  let hit = getFixtureIndex(fixtureDir).get(baseLower);
  if (!hit) {
    // Allow fixture folders to change during --watch without requiring a restart.
    fixtureIndexCache.delete(fixtureDir);
    hit = getFixtureIndex(fixtureDir).get(baseLower);
  }
  if (!hit) return undefined;
  return fs.readFileSync(hit, 'utf8');
}

function isLikelyFilenameReference(value: string): boolean {
  const normalized = normalizeFixtureRelativePath(value);
  if (!normalized) return false;
  const base = path.basename(normalized);
  if (!base) return false;
  if (!/\.(xml|txt|log|json)$/i.test(base)) return false;
  return true;
}

function resolveNodePayload(opts: CliOptions, reportXmlText: string, nodeName: NodeKey): string {
  // Prefer reading by file name when we have a fixture directory and the file exists.
  const fileHint: Partial<Record<NodeKey, string>> = {
    AdvancedVmInfo: 'AdvancedVmInfo.xml',
    AppConfig: 'AppConfig.xml',
    AutoStatisticInfo: 'AutoStatisticInfo.xml',
    ClientInfo: 'ClientInfo.xml',
    ClientProxyInfo: 'ClientProxyInfo.xml',
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
    AllProcesses: 'AllProcesses.txt'
  };

  if (opts.fixtureDir) {
    const hinted = fileHint[nodeName];
    if (hinted) {
      const fromHint = readFixtureFile(opts.fixtureDir, hinted);
      if (fromHint !== undefined) return fromHint;
    }
  }

  const doc = parseReportXmlOrThrow(reportXmlText);
  const element = doc.querySelector(nodeName);
  const textValue = element?.textContent?.trim() || '';

  if (opts.fixtureDir && textValue && isLikelyFilenameReference(textValue)) {
    const fromRef = readFixtureFile(opts.fixtureDir, textValue);
    if (fromRef !== undefined) return fromRef;

    // Avoid feeding the filename into the parser when the payload file is missing.
    return '';
  }

  if (!element) {
    if (opts.fixtureDir) {
      const candidates = [
        `${nodeName}.xml`,
        `${nodeName}.txt`,
        `${nodeName}.log`,
        `${nodeName}.json`
      ];
      for (const candidate of candidates) {
        const fromCandidate = readFixtureFile(opts.fixtureDir, candidate);
        if (fromCandidate !== undefined) return fromCandidate;
      }
    }

    return '';
  }

  // Some parsers expect an XML wrapper element rather than just text content.
  if (nodeName === 'GuestCommands' || nodeName === 'TimeZone') {
    return extractElementXml(reportXmlText, nodeName) ?? textValue;
  }

  // Some parsers expect raw JSON/text content (not wrapped element XML).
  return textValue;
}

function runOnce(opts: CliOptions) {
  ensureDomParserAvailable();

  const reportXmlPath = resolveReportXmlPath(opts);
  const xmlText = fs.readFileSync(reportXmlPath, 'utf8');

  let result: unknown;

  const payload = resolveNodePayload(opts, xmlText, opts.node);

  switch (opts.node) {
    case 'GuestCommands':
      // Many reports embed GuestCommands inline as XML. Some embed JSON text.
      // The parser accepts either a `<GuestCommands>...</GuestCommands>` XML string or JSON.
      result = parseGuestCommands(payload, undefined);
      break;
    case 'HostInfo':
      result = parseHostInfo(payload);
      break;
    case 'GuestOs':
      result = parseGuestOs(payload);
      break;
    case 'CurrentVm':
      result = parseCurrentVm(payload);
      break;
    case 'NetConfig':
      result = parseNetConfig(payload);
      break;
    case 'MoreHostInfo':
      result = parseMoreHostInfo(payload);
      break;
    case 'VmDirectory':
      result = parseVmDirectory(payload);
      break;
    case 'AppConfig':
      result = parseAppConfig(payload);
      break;
    case 'ClientInfo':
      result = parseClientInfo(payload);
      break;
    case 'ClientProxyInfo':
      result = parseClientProxyInfo(payload);
      break;
    case 'AdvancedVmInfo':
      result = parseAdvancedVmInfo(payload);
      break;
    case 'AutoStatisticInfo':
      result = parseAutoStatisticInfo(payload);
      break;
    case 'LicenseData':
      result = parseLicenseData(payload);
      break;
    case 'LoadedDrivers':
      result = parseLoadedDrivers(payload);
      break;
    case 'MountInfo':
      result = parseMountInfo(payload);
      break;
    case 'AllProcesses':
      result = parseAllProcesses(payload);
      break;
    case 'InstalledSoftware':
      result = parseInstalledSoftware(payload);
      break;
    case 'ToolsLog':
      result = parseToolsLog(payload, undefined);
      break;
    case 'ParallelsSystemLog':
      result = parseParallelsSystemLog(payload);
      break;
    case 'LaunchdInfo':
      result = parseLaunchdInfo(payload);
      break;
    case 'TimeZone':
      result = parseTimeZone(payload);
      break;
    default:
      throw new Error(`Unsupported --node: ${opts.node}`);
  }

  const output = stableStringify(result);
  process.stdout.write(output);

  if (opts.outPath) {
    fs.mkdirSync(path.dirname(opts.outPath), { recursive: true });
    fs.writeFileSync(opts.outPath, output, 'utf8');
  }
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

async function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (!opts.watch) {
    runOnce(opts);
    return;
  }

  const reportXmlPath = resolveReportXmlPath(opts);
  const watched = [reportXmlPath];

  const outPath = opts.outPath;
  console.log('[parse-node] watching:', watched.join(', '));
  if (outPath) console.log('[parse-node] writing:', outPath);

  const run = () => {
    try {
      runOnce(opts);
    } catch (e) {
      console.error('[parse-node] error:', e);
    }
  };

  run();

  const watcher = chokidar.watch(watched, { ignoreInitial: true });
  watcher.on('change', run);

  process.on('SIGINT', async () => {
    await watcher.close();
    process.exit(0);
  });
}

main();
