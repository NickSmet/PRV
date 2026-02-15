/**
 * Report Loader Service
 *
 * Fetches and extracts data from the full Parallels Problem Report XML.
 * Endpoint: https://reportus.prls.net/webapp/reports/{id}/report_xml/download
 *
 * This loader:
 * 1. Fetches the complete report XML (~1MB)
 * 2. Extracts all node data (inline, CDATA-wrapped, JSON)
 * 3. Populates window.__prv_* globals for each parser
 * 4. Provides scaffolding for attachment fetching (logs, screenshots)
 */

import { XMLParser } from 'fast-xml-parser';

type ParsedXml = Record<string, unknown>;

/**
 * Extract text content from a node, stripping CDATA if present
 */
function normalizeText(text: unknown): string | undefined {
  if (text === null || text === undefined) return undefined;
  const value = String(text);
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function firstOrSelf<T>(value: T | T[] | undefined): T | undefined {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

function flattenTextContent(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map(flattenTextContent).join('');

  if (isRecord(value)) {
    let out = '';
    const cdata = value.__cdata;
    if (typeof cdata === 'string') out += cdata;

    const text = value.__text;
    if (typeof text === 'string') out += text;

    for (const [key, child] of Object.entries(value)) {
      if (key.startsWith('@_')) continue;
      if (key === '__cdata' || key === '__text') continue;
      out += flattenTextContent(child);
    }
    return out;
  }

  return '';
}

function extractNodeText(nodeValue: unknown): string | undefined {
  const text = flattenTextContent(nodeValue);
  return normalizeText(text);
}

function parseReportXml(xmlText: string): ParsedXml | null {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    cdataPropName: '__cdata',
    textNodeName: '__text',
    parseTagValue: false,
    parseAttributeValue: false,
    trimValues: false,
    processEntities: false
  });

  try {
    return parser.parse(xmlText) as ParsedXml;
  } catch (error) {
    console.error('[PRV] Report XML parsing error:', error);
    return null;
  }
}

/**
 * Extract timezone from root-level <TimeZone> element
 */
function buildTimeZoneXml(timeZoneValue: unknown): string | undefined {
  const timezone = extractNodeText(timeZoneValue);
  if (!timezone) return undefined;

  return `<ParallelsProblemReport><TimeZone>${timezone}</TimeZone></ParallelsProblemReport>`;
}

function indexOfTagStart(xml: string, tagName: string, fromIndex: number): number {
  // Finds the next "<tagName" that is not a closing tag.
  // We intentionally keep this simple; the more robust matching happens in extractElementXml().
  const re = new RegExp(`<${tagName}(\\s|>|/)`, 'g');
  re.lastIndex = fromIndex;
  const match = re.exec(xml);
  return match ? match.index : -1;
}

function findTagEndIndex(xml: string, startIndex: number): number {
  // Find the end '>' of a tag while respecting quotes.
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
  const start = indexOfTagStart(xmlText, tagName, 0);
  if (start === -1) return undefined;

  let depth = 0;
  let i = start;

  while (i < xmlText.length) {
    // Skip comments
    if (xmlText.startsWith('<!--', i)) {
      const end = xmlText.indexOf('-->', i + 4);
      if (end === -1) break;
      i = end + 3;
      continue;
    }

    // Skip CDATA blocks (do not interpret tags inside)
    if (xmlText.startsWith('<![CDATA[', i)) {
      const end = xmlText.indexOf(']]>', i + 9);
      if (end === -1) break;
      i = end + 3;
      continue;
    }

    // Closing tag
    if (xmlText.startsWith(`</${tagName}`, i)) {
      depth--;
      const tagEnd = findTagEndIndex(xmlText, i);
      if (tagEnd === -1) break;
      i = tagEnd + 1;
      if (depth === 0) {
        return xmlText.slice(start, i);
      }
      continue;
    }

    // Opening tag (not closing)
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

  console.warn(`[PRV] Failed to extract <${tagName}> element as XML string (unbalanced tags)`);
  return undefined;
}

/**
 * Parse report ID from URL or return default
 */
function getReportIdFromUrl(): string | null {
  const match = window.location.pathname.match(/\/reports\/(\d+)/);
  return match ? match[1] : null;
}

/**
 * Build report download URL
 */
function buildReportDownloadUrl(reportId: string): string {
  const host = window.location.hostname;
  return `https://${host}/webapp/reports/${reportId}/report_xml/download`;
}

/**
 * Build attachment URL (scaffolding for future implementation)
 */
function buildAttachmentUrl(reportId: string, type: 'logs' | 'screenshots' | 'attachments' | 'memory_dumps', filename: string): string {
  const host = window.location.hostname;
  return `https://${host}/webapp/reports/${reportId}/${type}/${filename}`;
}

/**
 * Fetch attachment (scaffolding - to be implemented)
 */
async function fetchAttachment(reportId: string, type: 'logs' | 'screenshots' | 'attachments' | 'memory_dumps', filename: string): Promise<string | null> {
  const safeFilename = encodeURIComponent(filename);
  const url = buildAttachmentUrl(reportId, type, safeFilename);
  console.log('[PRV] [ATTACHMENT] Fetching:', url);

  try {
    const response = await fetch(url, { credentials: 'include' });
    if (!response.ok) {
      console.warn('[PRV] [ATTACHMENT] Failed:', response.status, response.statusText, url);
      return null;
    }
    return await response.text();
  } catch (error) {
    console.warn('[PRV] [ATTACHMENT] Error fetching:', url, error);
    return null;
  }
}

/**
 * Load all log attachments (scaffolding - to be implemented)
 */
async function loadLogAttachments(reportId: string): Promise<void> {
  console.log('[PRV] [ATTACHMENTS] Loading log attachments for report', reportId);

  // Fetch these logs separately (SystemLogs <Data/> is empty in report XML)
  const logFiles = [
    'tools.log',
    'parallels-system.log',
    'vm.log',
    'dispatcher.log',
    'prl_client_app.log'
  ];

  for (const logFile of logFiles) {
    const content = await fetchAttachment(reportId, 'logs', logFile);

    if (content) {
      // Map to appropriate global based on log file name
      if (logFile === 'tools.log') {
        (window as any).__prv_toolsLogText = content;
      } else if (logFile === 'parallels-system.log') {
        (window as any).__prv_parallelsSystemLogText = content;
      }
      // Add more mappings as needed
    }
  }
}

/**
 * Extract all node data from the report XML and populate window globals
 */
export function extractReportData(xmlText: string): void {
  console.log('[PRV] Extracting data from report XML, length:', xmlText.length);

  const parsed = parseReportXml(xmlText);
  const report = parsed?.ParallelsProblemReport;

  if (!isRecord(report)) {
    console.error('[PRV] Root element <ParallelsProblemReport> not found');
    return;
  }

  // Extract Phase 1 data
  console.log('[PRV] Extracting Phase 1 data...');

  // TimeZone (root level, inline)
  (window as any).__prv_timezoneXml = buildTimeZoneXml(report.TimeZone);

  // CurrentVm (CDATA XML)
  (window as any).__prv_currentVmXml = extractNodeText(firstOrSelf(report.CurrentVm));

  // GuestOs (CDATA XML)
  (window as any).__prv_guestOsXml = extractNodeText(firstOrSelf(report.GuestOs));

  // LicenseData (inline JSON)
  (window as any).__prv_licenseDataJson = extractNodeText(firstOrSelf(report.LicenseData));

  // NetConfig (CDATA XML)
  (window as any).__prv_netConfigXml = extractNodeText(firstOrSelf(report.NetConfig));

  // AdvancedVmInfo (inline XML)
  (window as any).__prv_advancedVmInfoXml = extractElementXml(xmlText, 'AdvancedVmInfo');

  // HostInfo (CDATA XML)
  (window as any).__prv_hostInfoXml = extractNodeText(firstOrSelf(report.HostInfo));

  console.log('[PRV] Phase 1 extraction complete');

  // Extract Phase 2 data
  console.log('[PRV] Extracting Phase 2 data...');

  // LoadedDrivers (CDATA text)
  (window as any).__prv_loadedDriversText = extractNodeText(firstOrSelf(report.LoadedDrivers));

  // MountInfo (inline text)
  (window as any).__prv_mountInfoText = extractNodeText(firstOrSelf(report.MountInfo));

  // AllProcesses (CDATA text)
  (window as any).__prv_allProcessesText = extractNodeText(firstOrSelf(report.AllProcesses));

  // MoreHostInfo (CDATA plist)
  (window as any).__prv_moreHostInfoXml = extractNodeText(firstOrSelf(report.MoreHostInfo));

  // VmDirectory (CDATA XML)
  (window as any).__prv_vmDirectoryXml = extractNodeText(firstOrSelf(report.VmDirectory));

  console.log('[PRV] Phase 2 extraction complete');

  // Extract Phase 3 data
  console.log('[PRV] Extracting Phase 3 data...');

  // GuestCommands:
  // - some reports embed inline XML (<GuestCommand> children)
  // - some reports embed JSON text
  // Preserve the full XML element string only when inline XML is present.
  const guestCommandsValue = firstOrSelf(report.GuestCommands);
  const hasInlineGuestCommands = isRecord(guestCommandsValue) && 'GuestCommand' in guestCommandsValue;
  (window as any).__prv_guestCommandsJson = hasInlineGuestCommands
    ? extractElementXml(xmlText, 'GuestCommands')
    : extractNodeText(guestCommandsValue);

  // AppConfig (CDATA XML)
  (window as any).__prv_appConfigXml = extractNodeText(firstOrSelf(report.AppConfig));

  // ClientInfo (CDATA text)
  (window as any).__prv_clientInfoText = extractNodeText(firstOrSelf(report.ClientInfo));

  // ClientProxyInfo (CDATA text)
  (window as any).__prv_clientProxyInfoText = extractNodeText(firstOrSelf(report.ClientProxyInfo));

  // InstalledSoftware (CDATA text) - direct child of root to avoid the one inside CurrentVm
  (window as any).__prv_installedSoftwareText = extractNodeText(firstOrSelf(report.InstalledSoftware));

  console.log('[PRV] Phase 3 extraction complete');

  // Extract Phase 4 data (excluding attachments)
  console.log('[PRV] Extracting Phase 4 data...');

  // LaunchdInfo (CDATA text)
  (window as any).__prv_launchdInfoText = extractNodeText(firstOrSelf(report.LaunchdInfo));

  // AutoStatisticInfo (inline XML)
  (window as any).__prv_autoStatisticInfoXml = extractElementXml(xmlText, 'AutoStatisticInfo');

  console.log('[PRV] Phase 4 extraction complete (attachments deferred)');

  // Log extraction summary with details
  const extractedGlobals = Object.keys(window as any)
    .filter(key => key.startsWith('__prv_'))
    .filter(key => (window as any)[key] !== undefined);

  console.log(`[PRV] Extracted ${extractedGlobals.length} node data sets from report XML`);
  console.log('[PRV] Extracted globals:', extractedGlobals.map(k => k.replace('__prv_', '')).join(', '));

  // Log any missing/empty extractions
  const allExpected = [
    '__prv_timezoneXml',
    '__prv_currentVmXml',
    '__prv_guestOsXml',
    '__prv_licenseDataJson',
    '__prv_netConfigXml',
    '__prv_advancedVmInfoXml',
    '__prv_hostInfoXml',
    '__prv_loadedDriversText',
    '__prv_mountInfoText',
    '__prv_allProcessesText',
    '__prv_moreHostInfoXml',
    '__prv_vmDirectoryXml',
    '__prv_guestCommandsJson',
    '__prv_appConfigXml',
    '__prv_clientInfoText',
    '__prv_clientProxyInfoText',
    '__prv_installedSoftwareText',
    '__prv_launchdInfoText',
    '__prv_autoStatisticInfoXml'
  ];

  const missing = allExpected.filter(key => !(window as any)[key]);
  if (missing.length > 0) {
    console.warn('[PRV] Missing or empty extractions:', missing.map(k => k.replace('__prv_', '')).join(', '));
  }
}

/**
 * Load full report XML and extract all data
 */
export async function loadFullReport(): Promise<boolean> {
  const reportId = getReportIdFromUrl();

  if (!reportId) {
    console.error('[PRV] Could not determine report ID from URL');
    return false;
  }

  const url = buildReportDownloadUrl(reportId);
  console.log('[PRV] Fetching full report XML from:', url);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error('[PRV] Failed to fetch report XML:', response.status, response.statusText);
      return false;
    }

    const xmlText = await response.text();
    console.log('[PRV] Received report XML, size:', xmlText.length, 'bytes');

    // Extract all node data
    extractReportData(xmlText);

    // Load log attachments (scaffolding - currently just logs intent)
    await loadLogAttachments(reportId);

    return true;
  } catch (error) {
    console.error('[PRV] Error loading report:', error);
    return false;
  }
}

/**
 * Extract data from an existing XML string (for testing)
 */
export function loadReportFromXML(xmlText: string): void {
  console.log('[PRV] Loading report from provided XML string');
  extractReportData(xmlText);
}
