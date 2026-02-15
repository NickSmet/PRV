/**
 * Guest OS Parser
 *
 * Parses the GuestOsInformation XML node to extract:
 * - Guest OS type (Windows, Linux, macvm, etc.)
 * - Guest OS version string
 * - Kernel version
 */


import windowsVersions from './windowsVersions.json';

const getName = (version: string) => 
  windowsVersions.find(w => `${w.version}.${w.build}` === version)?.name ?? version;


export interface GuestOsSummary {
  type?: string;
  version?: string;
  kernel?: string;
}

function parseXml(xml: string): Document | null {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'application/xml');
    const parseError = doc.querySelector('parsererror');
    if (parseError) {
      console.error('[parseGuestOs] XML parsing error:', parseError.textContent);
      return null;
    }
    return doc;
  } catch (e) {
    console.error('[parseGuestOs] Failed to parse XML:', e);
    return null;
  }
}

function getText(doc: Document, selector: string): string | undefined {
  const el = doc.querySelector(selector);
  return el?.textContent?.trim() || undefined;
}

/**
 * Parse GuestOsInformation XML
 */
export function parseGuestOs(xmlData: string): GuestOsSummary | null {
  if (!xmlData) {
    console.warn('[parseGuestOs] No XML data provided');
    return null;
  }

  const doc = parseXml(xmlData);
  if (!doc) return null;

  // Extract fields from XML
  const type = getText(doc, 'ConfOsType');
  const versionRaw = getText(doc, 'RealOsVersion');
  const kernel = getText(doc, 'OsKernelVersion');

  // Remove trailing comma from version if present (legacy quirk)
  const version = versionRaw?.replace(/,\s*$/, '' ) ?? '';
  const name = getName(version);

  return {
    type,
    version,
    name,
    kernel
  };
} 
