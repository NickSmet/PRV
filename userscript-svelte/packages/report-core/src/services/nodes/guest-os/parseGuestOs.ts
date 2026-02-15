/**
 * Guest OS Parser
 *
 * Parses the GuestOsInformation XML node to extract:
 * - Guest OS type (Windows, Linux, macvm, etc.)
 * - Guest OS version string
 * - Kernel version
 */


import windowsVersions from './windowsVersions.json';

type WindowsVersionEntry = {
  name: string;
  version: string;
  build: string;
  releaseDate?: string;
};

function getWindowsVersionEntry(version: string): WindowsVersionEntry | null {
  return (windowsVersions as WindowsVersionEntry[]).find((w) => `${w.version}.${w.build}` === version) ?? null;
}

function parseWindowsVersionParts(fullVersion: string): { majorMinor: string; buildRaw: string; buildNum: number | null } | null {
  const m = /^(?<majorMinor>\d+\.\d+)\.(?<build>.+)$/.exec(fullVersion.trim());
  const majorMinor = m?.groups?.majorMinor;
  const buildRaw = m?.groups?.build;
  if (!majorMinor || !buildRaw) return null;
  const buildNum = /^\d+$/.test(buildRaw) ? Number.parseInt(buildRaw, 10) : null;
  return { majorMinor, buildRaw, buildNum: Number.isFinite(buildNum) ? buildNum : null };
}

function getMaxKnownWindowsBuild(majorMinor: string): { entry: WindowsVersionEntry; buildNum: number } | null {
  const entries = (windowsVersions as WindowsVersionEntry[])
    .filter((w) => w.version === majorMinor)
    .map((w) => ({ entry: w, buildNum: /^\d+$/.test(w.build) ? Number.parseInt(w.build, 10) : NaN }))
    .filter((x) => Number.isFinite(x.buildNum));

  if (entries.length === 0) return null;
  return entries.reduce((best, cur) => (cur.buildNum > best.buildNum ? cur : best));
}

function looksLikeWindowsType(type: string | undefined): boolean {
  const t = (type ?? '').toLowerCase();
  return t === 'windows' || t.includes('win');
}


export interface GuestOsSummary {
  type?: string;
  version?: string;
  name?: string;
  releaseDate?: string;
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
  const winEntry = getWindowsVersionEntry(version);
  const releaseDate = winEntry?.releaseDate;

  let name = winEntry?.name ?? version;

  // If we don't have an exact match, but the report is Windows and the build is newer than our newest known entry,
  // provide a helpful label to avoid confusing raw build strings.
  if (!winEntry && looksLikeWindowsType(type) && version) {
    const parts = parseWindowsVersionParts(version);
    if (parts && parts.buildNum != null) {
      const maxKnown = getMaxKnownWindowsBuild(parts.majorMinor);
      if (maxKnown && parts.buildNum > maxKnown.buildNum) {
        name = `Unknown Windows version (newer than ${maxKnown.entry.name})`;
      }
    }
  }

  return {
    type,
    version,
    name,
    releaseDate,
    kernel
  };
} 
