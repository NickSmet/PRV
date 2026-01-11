/**
 * Parse AppConfig (Parallels Desktop application configuration)
 *
 * Extracts verbose logging status, default VM folders, and USB permanent assignments.
 */

import { parseXml, getText } from './xmlUtils';

export interface UsbPermanentAssignment {
  friendlyName?: string;
  systemName?: string;
  connectTo?: string;
  vmUuid?: string;
  action?: number; // 1 = connect to VM, 0 = connect to Mac
}

export interface AppConfigSummary {
  verboseLoggingEnabled?: boolean;
  defaultVmFolders: string[];
  usbPermanentAssignments: UsbPermanentAssignment[];
  hasExternalVmFolder?: boolean;
  isUserDefinedOnDisconnectedServer?: boolean;
}

/**
 * Parse AppConfig XML for application preferences
 */
export function parseAppConfig(xmlData: string): AppConfigSummary | null {
  if (!xmlData || xmlData.trim().length === 0) {
    return null;
  }

  try {
    const doc = parseXml(xmlData);
    if (!doc) {
      return null;
    }

    // Check for UserDefinedOnDisconnectedServer case
    const rootEl = doc.documentElement;
    if (!rootEl || rootEl.getElementsByTagName('ParallelsPreferences').length === 0) {
      return {
        verboseLoggingEnabled: undefined,
        defaultVmFolders: [],
        usbPermanentAssignments: [],
        isUserDefinedOnDisconnectedServer: true
      };
    }

    // Parse verbose logging
    const verboseLogEl = doc.querySelector('ServerSettings CommonPreferences Debug VerboseLogEnabled');
    const verboseLoggingText = verboseLogEl?.textContent?.trim();
    const verboseLoggingEnabled = verboseLoggingText === '1';

    // Parse default VM folders using regex (more reliable for multiple users)
    const defaultVmFolderRegex = /<UserDefaultVmFolder>([^<]+)<\/UserDefaultVmFolder>/gm;
    const defaultVmFolders: string[] = [];
    let hasExternalVmFolder = false;
    let match;

    while ((match = defaultVmFolderRegex.exec(xmlData)) !== null) {
      const folder = match[1];
      defaultVmFolders.push(folder);
      if (folder.startsWith('/Volumes')) {
        hasExternalVmFolder = true;
      }
    }

    // Parse USB permanent assignments
    const usbPermanentAssignments: UsbPermanentAssignment[] = [];
    const usbIdentityElements = doc.querySelectorAll('UsbPreferences UsbIdentity');

    for (const usbEl of Array.from(usbIdentityElements)) {
      const friendlyName = getText(usbEl as any, 'FriendlyName');
      const systemName = getText(usbEl as any, 'SystemName');

      // Check for associations
      const associationEl = usbEl.querySelector('AssociationsNew Association');
      if (associationEl) {
        const action = getText(associationEl as any, 'Action');
        const vmUuid = getText(associationEl as any, 'VmUuid');

        usbPermanentAssignments.push({
          friendlyName,
          systemName,
          connectTo: action === '1' ? 'VM' : 'This Mac',
          vmUuid,
          action: action ? parseInt(action) : undefined
        });
      }
    }

    return {
      verboseLoggingEnabled,
      defaultVmFolders,
      usbPermanentAssignments,
      hasExternalVmFolder,
      isUserDefinedOnDisconnectedServer: false
    };
  } catch (error) {
    console.error('[parseAppConfig] Parse error:', error);
    return null;
  }
}
