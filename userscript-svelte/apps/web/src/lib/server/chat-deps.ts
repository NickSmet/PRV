/**
 * Shared chat dependencies — singleton for all chat API routes.
 *
 * Creates in-memory persistence, resolves OpenAI config from env vars,
 * and provides the MCP catalog with the embedded /mcp server.
 */

import { env } from '$env/dynamic/private';

import {
  InMemoryChatPersistence,
  type ChatDependencies,
  type McpCatalog,
  type OpenAIConfig,
} from '@prv/ai-chat';

// Singleton persistence (in-memory — conversations lost on restart)
const persistence = new InMemoryChatPersistence();

function getOpenAIConfig(): OpenAIConfig {
  return {
    provider: (env.AI_CHAT_PROVIDER as 'auto' | 'openai' | 'azure') || 'auto',
    apiMode: (env.AI_CHAT_API_MODE as 'chat_completions' | 'responses') || 'responses',
    chatModel: env.AI_CHAT_MODEL || 'gpt-4o-mini',
    openaiApiKey: env.OPENAI_API_KEY,
    openaiBaseUrl: env.OPENAI_BASE_URL,
    azureApiKey: env.AZURE_OPENAI_API_KEY,
    azureEndpoint: env.AZURE_OPENAI_ENDPOINT,
    azureApiVersion: env.AZURE_OPENAI_API_VERSION,
  };
}

/**
 * Build the MCP catalog with the embedded /mcp server.
 * The port is resolved at request time to handle dynamic port assignment.
 */
function buildCatalog(mcpUrl: string): McpCatalog {
  return {
    version: 1,
    servers: [
      {
        id: 'prv-reportus',
        label: 'Report Analysis',
        namespace: 'report',
        description: 'Parallels Desktop technical report analysis tool. Executes JavaScript code in a sandbox with access to the full parsed report data.',
        mode: 'server',
        transport: 'http',
        url: mcpUrl,
        defaultEnabled: true,
        tools: [
          {
            name: 'execute_report_code',
            namespacedName: 'report.execute_report_code',
            description: 'Execute JavaScript code against a parsed Parallels Desktop technical report',
            usageHint:
              [
                'Strategy: prefer ONE tool call. Write a single `main(data, report, ctx)` that collects all fields you need and returns one compact JSON object. Only do a second tool call if the first result proves some required data is missing.',
                'Tool arguments must be an object with `reportId` and `code` (do not use a `raw` field).',
                '- If you want all values as strings, wrap them with `String(...)` (and preserve nulls) before returning.',
                '',
                'Common network mapping (single call):',
                '```js',
                'async function main(data, report, ctx) {',
                '  const s = (v) => (v === undefined || v === null) ? null : String(v);',
                '  const vm = data.vms.find(v => v.isCurrent) ?? data.vms[0];',
                '  const host = data.host.hardware;',
                '  const vn = data.parallels.virtualNetworks;',
                '  const set = vm?.settings ?? null; // settings are already readable-first (labels + ISO timestamps)',
                '',
                '  // Always include file presence so you can decide what to read next (if needed).',
                '  const files = vm?.files ?? null;',
                '',
                '  // Keep results small: slice arrays and avoid returning full logs.',
                '  const vmAdapters = (vm?.settings?.netAdapters ?? []).slice(0, 20);',
                '  const hostAdapters = (host?.networkAdapters ?? []).slice(0, 20);',
                '',
                '  // Guest network info (if present) is often the quickest truth source for IP/gateway/DNS.',
                '  const guestNet = vm?.guestCommands?.network ?? null;',
                '',
                '  // Display-only paths/dates often come from VM settings (not downloadable files).',
                '  const vmHome = set?.vmHome ?? null; // may be \"/.../VM.pvm\" or \"/.../VM.pvm/config.pvs\"',
                '  const creationDateIso = set?.creationDateIso ?? null;',
                '',
                '  // Optional: sample VMNET-related log lines (only if vmLog exists).',
                '  let vmnetEvents = null;',
                '  if (vm?.files?.vmLog) {',
                '    const text = await report.file(vm.files.vmLog, { maxChars: 20000 });',
                '    vmnetEvents = (text ?? \"\").split(\"\\n\").filter(l => l.includes(\"VMNET\")).slice(0, 30);',
                '  }',
                '',
                '  return {',
                '    currentVm: vm ? { uuid: vm.uuid, name: vm.name } : null,',
                '    files,',
                '    vmAdapters,',
                '    hostAdapters,',
                '    guestNet,',
                '    vmHome,',
                '    creationDateIso,',
                '    scaleToFit: set?.scaleToFit ?? null,',
                '    hypervisor: set?.hypervisor ?? null,',
                '    netAdapters: set?.netAdapters ?? null,',
                '    usbHistory: set?.usbDevices ?? null,',
                '    virtualNetworks: vn ?? null,',
                '    licenseExpirationIso: data.parallels.license?.expirationIso ?? null,',
                '    vmnetEvents,',
                '  };',
                '}',
                '```',
                '',
                'Log lines by partial match with surrounding context (keep output small):',
                '```js',
                'async function main(data, report) {',
                '  const vm = data.vms.find(v => v.isCurrent) ?? data.vms[0];',
                '  if (!vm?.files?.vmLog) return { error: \"vmLog not available\", files: vm?.files ?? null };',
                '  const text = await report.file(vm.files.vmLog, { maxChars: 200000 });',
                '  const lines = (text ?? \"\").split(\"\\n\");',
                '',
                '  const needle = \"VMNET\"; // or any substring',
                '  const before = 2, after = 3, maxMatches = 10;',
                '  const hits = [];',
                '  for (let i = 0; i < lines.length; i++) {',
                '    if (!lines[i].includes(needle)) continue;',
                '    const start = Math.max(0, i - before);',
                '    const end = Math.min(lines.length, i + after + 1);',
                '    hits.push({',
                '      line: i + 1,',
                '      block: lines.slice(start, end).map((t, k) => `${start + k + 1}: ${t}`),',
                '    });',
                '    if (hits.length >= maxMatches) break;',
                '  }',
                '  return { needle, totalLines: lines.length, hitCount: hits.length, hits };',
                '}',
                '```',
                '',
                'Host free disk space (from df/mount summary):',
                '```js',
                'function main(data) {',
                '  const storage = data.host.storage;',
                '  if (!storage) return null;',
                '  const systemDisk = storage.localDisks.find(d => d.label === \"System Disk\") ?? storage.localDisks[0];',
                '  if (!systemDisk) return { alerts: storage.alerts ?? null, localDisks: [] };',
                '  return {',
                '    alerts: storage.alerts ?? null,',
                '    disk: { id: systemDisk.id, label: systemDisk.label, sizeGi: systemDisk.sizeGi, freeGi: systemDisk.freeGi, usedGi: systemDisk.usedGi, usedPct: systemDisk.usedPct },',
                '    volumes: (systemDisk.volumes ?? []).slice(0, 20),',
                '    networkShares: (storage.networkShares ?? []).slice(0, 10),',
                '    virtualMounts: (storage.virtualMounts ?? []).slice(0, 10),',
                '  };',
                '}',
                '```',
                '',
                'Guest USB history vs host USB devices (quick comparison):',
                '```js',
                'function main(data) {',
                '  const vm = data.vms.find(v => v.isCurrent) ?? data.vms[0];',
                '  const guest = (vm?.settings?.usbDevices ?? []).map(d => ({',
                '    name: d.name ?? null,',
                '    lastConnectedIso: d.lastConnectedIso ?? null,',
                '  }));',
                '  const host = (data.host.hardware?.usbDevices ?? []).map(d => ({',
                '    name: d.name ?? null, vendorId: d.vendorId ?? null, productId: d.productId ?? null, serial: d.serial ?? null, state: d.state ?? null,',
                '  }));',
                '',
                '  // Very rough \"match\" heuristic: host name appears as a substring in guest history name',
                '  const guestNames = guest.map(d => (d.name ?? \"\").toLowerCase());',
                '  const matches = host.filter(h => (h.name ?? \"\").trim()).map(h => {',
                '    const hn = (h.name ?? \"\").toLowerCase();',
                '    const seenInGuest = guestNames.some(gn => hn && gn.includes(hn));',
                '    return { ...h, seenInGuest };',
                '  });',
                '',
                '  return { guestUsbHistory: guest.slice(0, 30), hostUsbDevices: host.slice(0, 30), hostSeenInGuest: matches.filter(m => m.seenInGuest) };',
                '}',
                '```',
                '',
                'If you use `ctx.preview()`, include it in the signature as the third argument: `main(data, report, ctx)`.',
              ].join('\n'),
            available: true,
            exposed: true,
            label: 'Execute Report Code',
            defaultEnabled: true,
          },
        ],
      },
    ],
  };
}

/**
 * Get chat dependencies for a request.
 * @param mcpUrl — The URL of the embedded /mcp server (e.g. `http://localhost:5174/mcp`)
 */
export function getChatDeps(mcpUrl: string): ChatDependencies {
  return {
    persistence,
    catalog: buildCatalog(mcpUrl),
    openaiConfig: getOpenAIConfig(),
  };
}

/**
 * Get the persistence instance for direct access (e.g., for polling endpoint).
 */
export function getChatPersistence() {
  return persistence;
}
