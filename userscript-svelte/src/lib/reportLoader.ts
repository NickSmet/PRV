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

/**
 * Extract text content from a node, stripping CDATA if present
 */
function extractNodeText(node: Element | null): string | undefined {
  if (!node) return undefined;
  const text = node.textContent?.trim();
  return text || undefined;
}

/**
 * Extract CDATA-wrapped content from a node
 */
function extractCDATA(node: Element | null): string | undefined {
  if (!node) return undefined;

  const text = node.textContent?.trim();
  if (!text) return undefined;

  // CDATA content is already unwrapped by textContent
  return text;
}

/**
 * Extract inline XML content (serialize child nodes)
 */
function extractInlineXML(node: Element | null): string | undefined {
  if (!node) return undefined;

  // Serialize the node itself as XML
  const serializer = new XMLSerializer();
  return serializer.serializeToString(node);
}

/**
 * Extract timezone from root-level <TimeZone> element
 */
function extractTimeZone(doc: Document): string | undefined {
  const node = doc.querySelector('ParallelsProblemReport > TimeZone');
  if (!node) return undefined;

  const timezone = extractNodeText(node);
  if (!timezone) return undefined;

  // Wrap in minimal XML for parseTimeZone
  return `<ParallelsProblemReport><TimeZone>${timezone}</TimeZone></ParallelsProblemReport>`;
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
  const url = buildAttachmentUrl(reportId, type, filename);
  console.log('[PRV] [ATTACHMENT] Would fetch:', url);

  // TODO: Implement actual fetching logic
  // For now, return null to indicate attachment not loaded
  return null;
}

/**
 * Load all log attachments (scaffolding - to be implemented)
 */
async function loadLogAttachments(reportId: string): Promise<void> {
  console.log('[PRV] [ATTACHMENTS] Loading log attachments for report', reportId);

  // TODO: Fetch these logs separately
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

  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'application/xml');

  // Check for parse errors
  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    console.error('[PRV] XML parsing error:', parseError.textContent);
    return;
  }

  const root = doc.querySelector('ParallelsProblemReport');
  if (!root) {
    console.error('[PRV] Root element <ParallelsProblemReport> not found');
    return;
  }

  // Extract Phase 1 data
  console.log('[PRV] Extracting Phase 1 data...');

  // TimeZone (root level, inline)
  (window as any).__prv_timezoneXml = extractTimeZone(doc);

  // CurrentVm (CDATA XML)
  const currentVmNode = doc.querySelector('CurrentVm');
  (window as any).__prv_currentVmXml = extractCDATA(currentVmNode);

  // GuestOs (CDATA XML)
  const guestOsNode = doc.querySelector('GuestOs');
  (window as any).__prv_guestOsXml = extractCDATA(guestOsNode);

  // LicenseData (inline JSON)
  const licenseNode = doc.querySelector('LicenseData');
  (window as any).__prv_licenseDataJson = extractNodeText(licenseNode);

  // NetConfig (CDATA XML)
  const netConfigNode = doc.querySelector('NetConfig');
  (window as any).__prv_netConfigXml = extractCDATA(netConfigNode);

  // AdvancedVmInfo (inline XML)
  const advancedVmNode = doc.querySelector('AdvancedVmInfo');
  (window as any).__prv_advancedVmInfoXml = extractInlineXML(advancedVmNode);

  // HostInfo (CDATA XML)
  const hostInfoNode = doc.querySelector('HostInfo');
  (window as any).__prv_hostInfoXml = extractCDATA(hostInfoNode);

  console.log('[PRV] Phase 1 extraction complete');

  // Extract Phase 2 data
  console.log('[PRV] Extracting Phase 2 data...');

  // LoadedDrivers (CDATA text)
  const loadedDriversNode = doc.querySelector('LoadedDrivers');
  (window as any).__prv_loadedDriversText = extractCDATA(loadedDriversNode);

  // MountInfo (inline text)
  const mountInfoNode = doc.querySelector('MountInfo');
  (window as any).__prv_mountInfoText = extractNodeText(mountInfoNode);

  // AllProcesses (CDATA text)
  const allProcessesNode = doc.querySelector('AllProcesses');
  (window as any).__prv_allProcessesText = extractCDATA(allProcessesNode);

  // MoreHostInfo (CDATA plist)
  const moreHostInfoNode = doc.querySelector('MoreHostInfo');
  (window as any).__prv_moreHostInfoXml = extractCDATA(moreHostInfoNode);

  // VmDirectory (CDATA XML)
  const vmDirectoryNode = doc.querySelector('VmDirectory');
  (window as any).__prv_vmDirectoryXml = extractCDATA(vmDirectoryNode);

  console.log('[PRV] Phase 2 extraction complete');

  // Extract Phase 3 data
  console.log('[PRV] Extracting Phase 3 data...');

  // GuestCommands (inline JSON)
  const guestCommandsNode = doc.querySelector('GuestCommands');
  (window as any).__prv_guestCommandsJson = extractNodeText(guestCommandsNode);

  // AppConfig (CDATA XML)
  const appConfigNode = doc.querySelector('AppConfig');
  (window as any).__prv_appConfigXml = extractCDATA(appConfigNode);

  // ClientInfo (CDATA text)
  const clientInfoNode = doc.querySelector('ClientInfo');
  (window as any).__prv_clientInfoText = extractCDATA(clientInfoNode);

  // ClientProxyInfo (CDATA text)
  const clientProxyInfoNode = doc.querySelector('ClientProxyInfo');
  (window as any).__prv_clientProxyInfoText = extractCDATA(clientProxyInfoNode);

  // InstalledSoftware (CDATA text) - direct child of root to avoid the one inside CurrentVm
  const installedSoftwareNode = doc.querySelector('ParallelsProblemReport > InstalledSoftware');
  (window as any).__prv_installedSoftwareText = extractCDATA(installedSoftwareNode);

  console.log('[PRV] Phase 3 extraction complete');

  // Extract Phase 4 data (excluding attachments)
  console.log('[PRV] Extracting Phase 4 data...');

  // LaunchdInfo (CDATA text)
  const launchdInfoNode = doc.querySelector('LaunchdInfo');
  (window as any).__prv_launchdInfoText = extractCDATA(launchdInfoNode);

  // AutoStatisticInfo (inline XML)
  const autoStatisticInfoNode = doc.querySelector('AutoStatisticInfo');
  (window as any).__prv_autoStatisticInfoXml = extractInlineXML(autoStatisticInfoNode);

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
