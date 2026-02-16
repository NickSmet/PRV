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
 * Discover the archive directory name (e.g. "PrlProblemReport-2021.06.25-14.08.26.729")
 * by scanning the current page for download links or known text patterns.
 */
function discoverArchiveName(): string | null {
  // 1. Look for links containing /files/ on the current page
  const links = document.querySelectorAll<HTMLAnchorElement>('a[href*="/files/"]');
  for (const link of links) {
    const match = link.href.match(/\/files\/([^/]+)\//);
    if (match) return match[1];
  }

  // 2. Fallback: scan page text for the archive name pattern
  const pageText = document.body?.textContent ?? '';
  const archiveMatch = pageText.match(/PrlProblemReport-[\d.]+/);
  if (archiveMatch) return archiveMatch[0];

  return null;
}

/**
 * Build a file download URL using the webapp file endpoint.
 * Pattern: /webapp/reports/{id}/files/{archiveName}/{filename}/download
 */
function buildFileUrl(reportId: string, archiveName: string, filename: string): string {
  const origin = window.location.origin;
  const safeName = filename.split('/').map(encodeURIComponent).join('/');
  return `${origin}/webapp/reports/${reportId}/files/${encodeURIComponent(archiveName)}/${safeName}/download`;
}

/**
 * Fetch a file from the report archive.
 */
async function fetchFile(reportId: string, archiveName: string, filename: string): Promise<string | null> {
  const url = buildFileUrl(reportId, archiveName, filename);
  console.log('[PRV] Fetching file:', url);

  try {
    const response = await fetch(url, { credentials: 'include' });
    if (!response.ok) {
      console.warn('[PRV] File fetch failed:', response.status, response.statusText, url);
      return null;
    }
    return await response.text();
  } catch (error) {
    console.warn('[PRV] File fetch error:', url, error);
    return null;
  }
}

/**
 * Load log attachments from the report archive.
 */
async function loadLogAttachments(reportId: string, archiveName: string): Promise<void> {
  console.log('[PRV] Loading log attachments for report', reportId);

  const logMappings: Array<{ filename: string; global: string }> = [
    { filename: 'tools.log', global: '__prv_toolsLogText' },
    { filename: 'parallels-system.log', global: '__prv_parallelsSystemLogText' }
  ];

  await Promise.all(
    logMappings.map(async ({ filename, global }) => {
      const content = await fetchFile(reportId, archiveName, filename);
      if (content) {
        (window as any)[global] = content;
      }
    })
  );
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
 * Fetch the full Report XML using the legacy report_xml endpoint.
 */
async function fetchReportXml(reportId: string): Promise<string | null> {
  const url = `${window.location.origin}/webapp/reports/${reportId}/report_xml/download`;
  console.log('[PRV] Fetching report XML from:', url);

  try {
    const response = await fetch(url, { credentials: 'include' });
    if (!response.ok) {
      console.warn('[PRV] Report XML fetch failed:', response.status, response.statusText);
      return null;
    }
    return await response.text();
  } catch (error) {
    console.warn('[PRV] Report XML fetch error:', error);
    return null;
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

  try {
    // 1. Fetch the main Report XML (uses its own endpoint)
    const xmlText = await fetchReportXml(reportId);
    if (!xmlText) {
      console.error('[PRV] Failed to fetch Report.xml');
      return false;
    }
    console.log('[PRV] Received report XML, size:', xmlText.length, 'bytes');

    // Extract all node data from the XML
    extractReportData(xmlText);

    // 2. Fetch log attachments (need archive name for file endpoint)
    const archiveName = discoverArchiveName();
    if (archiveName) {
      console.log('[PRV] Discovered archive:', archiveName);
      await loadLogAttachments(reportId, archiveName);
    } else {
      console.warn('[PRV] Could not discover archive name — log attachments skipped');
    }

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
