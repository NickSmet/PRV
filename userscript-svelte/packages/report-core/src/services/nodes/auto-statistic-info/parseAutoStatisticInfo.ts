/**
 * Parse AutoStatisticInfo (Parallels Desktop installation history)
 *
 * Extracts list of PD installations with version and date.
 */

import { parseXml, getText } from '../../xmlUtils';

export interface PdInstallation {
  version: string;
  date: string;
}

export interface AutoStatisticInfoSummary {
  installations: PdInstallation[];
  installationCount: number;
}

/**
 * Parse AutoStatisticInfo XML for PD installation history
 */
export function parseAutoStatisticInfo(xmlData: string): AutoStatisticInfoSummary | null {
  if (!xmlData || xmlData.trim().length === 0) {
    return null;
  }

  try {
    const doc = parseXml(xmlData);
    if (!doc) return null;

    // Get all PDInstallationHistory elements
    const installationElements = doc.querySelectorAll('PDInstallationHistory');

    if (installationElements.length === 0) {
      return {
        installations: [],
        installationCount: 0
      };
    }

    const installations: PdInstallation[] = [];

    installationElements.forEach((el) => {
      const version = getText(el, 'InstalledVersionName');
      const date = getText(el, 'InstalledVersionDate');

      if (version && date) {
        installations.push({ version, date });
      }
    });

    return {
      installations,
      installationCount: installations.length
    };
  } catch (error) {
    console.error('[parseAutoStatisticInfo] Parse error:', error);
    return null;
  }
}
