/**
 * execute_report_code — single code-execution tool for AI report analysis.
 *
 * The agent writes JavaScript defining `main(data, report, ctx)` which runs
 * in a sandbox with the full pre-loaded report data.
 */

import { z } from 'zod';
import { createHash } from 'node:crypto';
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
import { executeReportCodeSandbox } from './sandbox';

// ── Credentials ───────────────────────────────────────────

export type ReportusCredentials = {
  baseUrl: string;
  basicAuth: string;
};

/**
 * Resolve Reportus credentials.
 * - If explicit creds are provided, use them (SvelteKit passes from $env).
 * - Otherwise fall back to process.env (stdio MCP server with dotenv).
 */
function resolveCredentials(creds?: ReportusCredentials): ReportusCredentials {
  if (creds) return creds;
  const baseUrl = process.env.REPORTUS_BASE_URL ?? 'https://reportus.prls.net';
  const basicAuth = process.env.REPORTUS_BASIC_AUTH;
  if (!basicAuth) {
    throw new Error('Missing REPORTUS_BASIC_AUTH');
  }
  return { baseUrl, basicAuth };
}

function getClient(creds?: ReportusCredentials) {
  const { baseUrl, basicAuth } = resolveCredentials(creds);
  return createReportusClient({ baseUrl, basicAuth });
}

// ── In-process caching ─────────────────────────────────────

type CachedReport = {
  cachedAt: number;
  index: ReportusReportIndex;
  report: ReportModel;
  markers: ReturnType<typeof evaluateRules>;
  perVm: ReturnType<typeof discoverPerVmFiles>;
  parsedPerVm: Record<string, {
    settings?: ReturnType<typeof parseCurrentVm>;
    toolsLog?: ReturnType<typeof parseToolsLog>;
  }>;
  view: ReturnType<typeof buildReportView>;
  /**
   * Small in-memory cache of raw attachment texts read via report.file().
   * Keyed by Reportus file path.
   */
  fileCache: Map<string, string>;
};

const REPORT_CACHE_TTL_MS = 10 * 60 * 1000;
const REPORT_CACHE_MAX_ENTRIES = 8;
const reportCache = new Map<string, CachedReport>();
const FILE_CACHE_MAX_ENTRIES = 6;

function credsCacheKey(reportId: string, creds: ReportusCredentials): string {
  // Do not embed credentials in memory keys; hash instead.
  const authHash = createHash('sha256').update(creds.basicAuth).digest('hex').slice(0, 12);
  return `${creds.baseUrl}|${authHash}|${reportId}`;
}

function getCachedReport(key: string): CachedReport | null {
  const hit = reportCache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.cachedAt > REPORT_CACHE_TTL_MS) {
    reportCache.delete(key);
    return null;
  }
  // Refresh LRU order
  reportCache.delete(key);
  reportCache.set(key, hit);
  return hit;
}

function setCachedReport(key: string, value: CachedReport): void {
  reportCache.set(key, value);
  while (reportCache.size > REPORT_CACHE_MAX_ENTRIES) {
    const oldestKey = reportCache.keys().next().value as string | undefined;
    if (!oldestKey) break;
    reportCache.delete(oldestKey);
  }
}

function enrichReportMetaFromIndex(
  report: ReportModel,
  index: ReportusReportIndex,
  reportId: string,
) {
  report.meta.productName = index.product ?? report.meta.productName;
  report.meta.productVersion = index.product_version ?? report.meta.productVersion;
  report.meta.reportId = String(index.report_id ?? reportId);
  report.meta.reportType = index.report_type ?? report.meta.reportType;
  report.meta.reportReason = index.report_reason ?? report.meta.reportReason;
}

// ── Tool Description ───────────────────────────────────────

export const EXECUTE_REPORT_CODE_DESCRIPTION = `Code-driven Parallels Desktop technical report analysis. Write JavaScript that traverses pre-loaded report data in a sandbox.

Declare a function \`main(data, report, ctx)\` and return any JSON-serializable value.

=== SIGNATURE ===
- data: ReportView - pre-loaded, hierarchical report data (synchronous)
- report: { file(path, opts?), files[] } - raw file access API (async)
- ctx: helpers (preview, schema, raw)
- console.log/warn/error - captured and returned as logs

=== DATA MODEL (data: ReportView) ===
\`\`\`ts
interface ReportView {
  meta: {
    reportId?; productName?; productVersion?; reportType?; reportReason?;
    receivedIso?;        // Reportus index.received when available (ISO 8601)
    timezone;            // TimeZoneSummary | null (from Report.xml)
    timezoneOffsetIso;   // e.g. "-03:00"
  };
  markers: Array<{ id; severity: 'info'|'warn'|'danger'|'success'; label; tooltip?; target: string }>;
  host: {
    hardware: {
      system; networkAdapters; usbDevices; audio; bluetoothDevices; printers; cameras; smartCardReaders; flags; hasDisplayLink;
      // hard disk sizes are MB (no raw bytes)
      hardDisks: Array<{ name; identifier; sizeMb; sizeFormatted; partitions: Array<{ name; systemName?; sizeMb?; freeMb?; typeName? }> }>;
      // input device booleans collapsed into a single field: types: string[]
      inputDevices: Array<{ name; identifier; transport; vendorId?; productId?; types: string[] }>;
    } | null;
    gpu: MoreHostInfoSummary | null;   // .gpus[], .displayCount, .hasNoDisplays
    storage: {
      alerts: { lowStorage: boolean; hddFull: boolean; hasNtfs: boolean } | null;
      meta: { totalVolumes: number; skippedVolumes: number; parseWarnings: string[] } | null;
      localDisks: Array<{ id; label; fs; sizeGi; usedGi; freeGi; usedPct; significant; volumes: Array<{ id; label; mount; usedGi; flags }> }>;
      networkShares: Array<{ id; label; protocol; source; mount; sizeGi; usedGi; freeGi; usedPct }>;
      virtualMounts: Array<{ id; label; mount; usedPct; note }> ;
    } | null;
    kexts: LoadedDriversSummary | null;  // .kexts[], .nonAppleKexts[], .badKexts[], .isHackintosh, .hasPrlKexts
    processes: AllProcessesSummary | null;  // like report-core, but items[].command may be truncated + commandTruncated?: true (and no displayName/shortName)
    services: { formattedListing: string | null; stats: { files; folders; rootOwnedFiles } | null } | null; // no parsed tree (use formattedListing)
    installedApps: InstalledSoftwareSummary | null;  // .apps[] ({name, version?}), .appCount
  };
  parallels: {
    license: { edition?; editionName?; expirationIso?; isPirated?; isExpired?; isTrial? } | null; // no epoch timestamps
    virtualNetworks: { kextlessMode?; hasSharedNetwork?; hasHostOnlyNetwork?; networks: Array<{ name?; networkType?; dhcpEnabled?; dhcpV6Enabled?; dhcpIp?; netMask?; hostIp? }> } | null;
    appConfig: AppConfigSummary | null;  // .verboseLoggingEnabled?, .defaultVmFolders[], .usbPermanentAssignments[]
    client: ClientInfoSummary | null;  // .accountEmail?, .pdPreferences[]
    proxy: ClientProxyInfoSummary | null;  // .httpProxyEnabled
    installHistory: { installationCount: number | null; installations: Array<{ version: string; dateIso: string | null }> } | null;
  };
  vms: Array<{
    uuid: string; uuidKey: string; name: string; isCurrent: boolean;
    settings: { vmName?; creationDateIso?; cpuCount?; ramMb?; vramMb?; hypervisor?; videoMode?; scaleToFit?; mouse?; keyboard?; netAdapters?; usbDevices? } | null;
    guestOs: GuestOsSummary | null;  // .type?, .version?, .name?, .kernel?
    guestCommands: GuestCommandsSummary | null;  // .system?, .network?, .processes[], .totals?, .powerRequests[]
    storageAndSnapshots: { snapshotCount: number; snapshots: Array<{ name: string; createdIso: string | null }>; pvmBundleContents?; hasAclIssues? } | null; // no pvmBundleTree
    toolsLog: { status: string | null; entries: Array<{ timestampIso: string | null; message: string | null }>; hasCorruptRegistry?; hasPrlDdIssue?; kbArticle? } | null;
    systemLog: ParallelsSystemLogSummary | null;  // .hasCoherenceDump, .coherenceDumpCount?
    files: { configPvs?; vmLog?; toolsLog? };  // raw file paths for report.file()
  }>;
}
\`\`\`

=== RAW FILE ACCESS ===
\`\`\`ts
report.file(path: string, opts?: { maxChars?: number }): Promise<string | null>
report.files: Array<{ filename: string; path: string; size: number }>
\`\`\`

=== HELPERS (ctx) ===
\`\`\`ts
ctx.preview(value, maxLen?) => string
ctx.schema(opts?) => string               // inferred TS schema for ReportView (supports filtering via opts.query)
ctx.raw(value, opts?) => any            // clone including non-enumerable props (debug only; use rarely)
\`\`\`

=== GUIDANCE ===
- Traverse and reason using the normal (display-ready) fields in data.
- If you're unsure about field names, call ctx.schema() once and search within it.
- Use ctx.raw(...) only when the user asks for "under the hood" details (raw codes, original values, derivations) or when debugging mismatches.
- Many objects carry a hidden \`__raw\` payload (non-enumerable). Use \`ctx.raw(obj)\` to inspect it.
- Do not guess property names. If you haven't confirmed a field exists in the schema, avoid mapping/renaming it.
- When you just need to “see what’s there”, return the subtree directly (e.g. \`return data.host.gpu;\`) instead of projecting it into a new shape that can drop fields.
- Prefer a two-step approach for narrow questions: (1) return the relevant subtree as-is, then (2) write a second version that picks specific fields after confirming their names.

=== EXAMPLES ===
\`\`\`js
// Quick summary
function main(data) {
  const vm = data.vms.find(v => v.isCurrent);
  return {
    product: data.meta.productVersion,
    guestOs: vm?.guestOs?.name,
    ramMb: vm?.settings?.ramMb,
    dangers: data.markers.filter(m => m.severity === 'danger').map(m => m.label),
  };
}
\`\`\`

\`\`\`js
// Sort processes by CPU usage (raw primitives - you sort in code)
function main(data) {
  const procs = data.host.processes?.items ?? [];
  return [...procs].sort((a, b) => b.cpu - a.cpu).slice(0, 10)
    .map(p => ({ name: p.appName ?? p.command, cpu: p.cpu, mem: p.mem, type: p.type }));
}
\`\`\`

\`\`\`js
// Read a raw log file for a non-current VM
async function main(data, report) {
  const vm = data.vms.find(v => !v.isCurrent && v.files.vmLog);
  if (!vm) return 'no non-current VM with log';
  const log = await report.file(vm.files.vmLog, { maxChars: 10000 });
  const lines = (log || '').split('\\n');
  return { vm: vm.name, totalLines: lines.length, last5: lines.slice(-5) };
}
\`\`\`
`;

// ── Tool Schema ────────────────────────────────────────────

export const EXECUTE_REPORT_CODE_SCHEMA = {
  reportId: z.string().describe('The numeric report ID'),
  code: z.string().describe('JavaScript code defining main(data, report, ctx)'),
  timeoutMs: z.number().int().positive().max(60000).optional()
    .describe('Execution timeout in ms (default 30000, max 60000)'),
  maxOutputChars: z.number().int().positive().max(200000).optional()
    .describe('Max characters in returned JSON (default 50000, max 200000)'),
};

// ── Handler ────────────────────────────────────────────────

export async function handleExecuteReportCode(args: {
  reportId: string;
  code: string;
  timeoutMs?: number;
  maxOutputChars?: number;
  /** Pass credentials explicitly when called from SvelteKit (where process.env doesn't have .env values). */
  credentials?: ReportusCredentials;
}) {
  const { reportId, code } = args;
  const timeoutMs = Math.min(args.timeoutMs ?? 30000, 60000);
  const maxOutputChars = Math.min(args.maxOutputChars ?? 50000, 200000);

  ensureDomParser();

  const resolvedCreds = resolveCredentials(args.credentials);
  const cacheKey = credsCacheKey(reportId, resolvedCreds);

  // Reuse parsed report structure across tool calls (reduces repeated Reportus fetches).
  // Note: raw attachment reads via report.file() still hit Reportus.
  const cached = getCachedReport(cacheKey);

  const client = createReportusClient({ baseUrl: resolvedCreds.baseUrl, basicAuth: resolvedCreds.basicAuth });
  let index: ReportusReportIndex;
  let report: ReportModel;
  let markers: ReturnType<typeof evaluateRules>;
  let perVm: ReturnType<typeof discoverPerVmFiles>;
  let parsedPerVm: CachedReport['parsedPerVm'];
  let data: ReturnType<typeof buildReportView>;
  let fileCache: CachedReport['fileCache'];

  if (cached) {
    ({ index, report, markers, perVm, parsedPerVm, view: data, fileCache } = cached);
  } else {
    // 1. Fetch report index
    index = await client.getReportIndex(reportId);

    // 2. Fetch all node payloads
    const raw: Partial<Record<NodeKey, string>> = {};
    for (const key of Object.keys(nodeRegistry) as NodeKey[]) {
      const payload = await fetchNodePayload(client, reportId, index, key);
      if (payload?.text) raw[key] = payload.text;
    }

    // 3. Build ReportModel + markers
    const built = buildReportModelFromRawPayloads(raw);
    report = built.report;
    enrichReportMetaFromIndex(report, index, reportId);
    markers = evaluateRules(report);

    // 4. Discover per-VM files
    perVm = discoverPerVmFiles(index);

    // 5. Parse non-current VM data (config.pvs + tools.log)
    const currentUuid = (report.currentVm?.vmUuid ?? '').toLowerCase();
    parsedPerVm = {};

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

    // 6. Build ReportView
    data = buildReportView(report, markers, { reportId, perVm, parsedPerVm, receivedIso: index.received });

    setCachedReport(cacheKey, {
      cachedAt: Date.now(),
      index,
      report,
      markers,
      perVm,
      parsedPerVm,
      view: data,
      fileCache: new Map<string, string>(),
    });

    // Grab the stored cache reference so report.file() can populate it.
    fileCache = reportCache.get(cacheKey)!.fileCache;
  }

  // 7. Build the report API object for raw file access
  const reportApi = {
    file: async (path: string, opts?: { maxChars?: number }): Promise<string | null> => {
      try {
        const entry = index.files.find((f) => f.path === path || f.filename === path);
        if (!entry) return null;
        const cacheKey = entry.path;
        let text = fileCache.get(cacheKey);
        if (typeof text !== 'string') {
          const downloaded = await client.downloadFileText(reportId, entry.path, { maxBytes: 2 * 1024 * 1024 });
          text = downloaded.text;

          // LRU-ish eviction: refresh insertion order and cap size.
          fileCache.set(cacheKey, text);
          if (fileCache.size > FILE_CACHE_MAX_ENTRIES) {
            const oldest = fileCache.keys().next().value as string | undefined;
            if (oldest) fileCache.delete(oldest);
          }
        } else {
          // Refresh insertion order
          fileCache.delete(cacheKey);
          fileCache.set(cacheKey, text);
        }

        const maxChars = opts?.maxChars ?? 50000;
        return text.length > maxChars ? text.slice(0, maxChars) : text;
      } catch {
        return null;
      }
    },
    files: index.files.map((f) => ({ filename: f.filename, path: f.path, size: f.size })),
  };

  // 8. Execute in sandbox
  const { result, logs } = await executeReportCodeSandbox(code, data, reportApi, {
    timeoutMs,
    maxOutputChars,
  });

  // 9. Serialize + truncate output
  let text = '';
  try {
    text = JSON.stringify({ result, logs }, null, 2);
  } catch {
    text = JSON.stringify({ result: String(result), logs }, null, 2);
  }

  if (text.length > maxOutputChars) {
    text = text.slice(0, maxOutputChars) + '\n/* ...truncated... */';
  }

  return { content: [{ type: 'text' as const, text }] };
}
