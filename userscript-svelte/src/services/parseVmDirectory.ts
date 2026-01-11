/**
 * Parse VmDirectory (list of all VMs on the system)
 *
 * Extracts VM names, locations, UUIDs, and registration dates.
 */

import { parseXml, getText } from './xmlUtils';

export interface VmDirectoryEntry {
  name?: string;
  location?: string;
  uuid?: string;
  registeredOn?: string;
}

export interface VmDirectorySummary {
  vms: VmDirectoryEntry[];
  vmCount: number;
}

/**
 * Parse VmDirectory XML for list of all VMs
 */
export function parseVmDirectory(xmlData: string): VmDirectorySummary | null {
  if (!xmlData || xmlData.trim().length === 0) {
    return null;
  }

  try {
    // Replace & with _ to avoid XML parsing issues
    const cleanedXml = xmlData.replace(/&/g, '_');

    const doc = parseXml(cleanedXml);
    if (!doc) {
      return null;
    }

    const vms: VmDirectoryEntry[] = [];

    // Find all VirtualMachine elements
    const vmElements = doc.querySelectorAll('VirtualMachine');

    for (const vmEl of Array.from(vmElements)) {
      const name = getText(vmEl as any, 'VmName');
      const location = getText(vmEl as any, 'VmHome');
      const uuid = getText(vmEl as any, 'Uuid');
      const registeredOn = getText(vmEl as any, 'RegistrationDateTime');

      // Only add if we have at least a name
      if (name || location) {
        vms.push({
          name,
          location,
          uuid,
          registeredOn
        });
      }
    }

    return {
      vms,
      vmCount: vms.length
    };
  } catch (error) {
    console.error('[parseVmDirectory] Parse error:', error);
    return null;
  }
}
