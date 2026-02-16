/**
 * Parse ClientInfo (user account and preferences)
 *
 * Extracts user account email, Parallels Desktop preferences, and Shared Apps preferences per VM.
 */

export interface PdPreference {
  name: string;
  value: string;
}

export interface SharedAppsPreference {
  vmUuid: string;
  vmName?: string;
  preferences: Array<{ name: string; value: string }>;
}

export interface ClientInfoSummary {
  accountEmail?: string;
  pdPreferences: PdPreference[];
  sharedAppsPreferences: SharedAppsPreference[];
}

/**
 * Parse ClientInfo text for user preferences
 */
export function parseClientInfo(textData: string): ClientInfoSummary | null {
  if (!textData || textData.trim().length === 0) {
    return null;
  }

  try {
    const lines = textData.split('\n');

    // Regex patterns
    const accountRegex = /(AccountConsentGroup|AccountLocaleUpdated)(\/| -- )(?<email>\w[^@]+@[.\w]+)/;
    const pdPreferencesRegex = /Application preferences\/(?<prefName>[\w ]+) -- (?<prefValue>[\d\w]+)/;
    const sharedAppsPrefsRegex = /Shared Applications\/(?<uuid>{[\w\d-]+})\/(?<prefName>[\w ]+) -- (?<prefValue>[\w\d]+)/;

    let accountEmail: string | undefined;
    const pdPreferences: PdPreference[] = [];
    const sharedAppsMap = new Map<string, Array<{ name: string; value: string }>>();

    for (const line of lines) {
      // Extract account email
      if (!accountEmail) {
        const accountMatch = accountRegex.exec(line);
        if (accountMatch?.groups?.email) {
          accountEmail = accountMatch.groups.email;
        }
      }

      // Extract PD preferences
      const pdPrefMatch = pdPreferencesRegex.exec(line);
      if (pdPrefMatch?.groups) {
        pdPreferences.push({
          name: pdPrefMatch.groups.prefName,
          value: pdPrefMatch.groups.prefValue
        });
      }

      // Extract Shared Apps preferences
      const sharedAppMatch = sharedAppsPrefsRegex.exec(line);
      if (sharedAppMatch?.groups) {
        const uuid = sharedAppMatch.groups.uuid;
        const prefName = sharedAppMatch.groups.prefName;
        const prefValue = sharedAppMatch.groups.prefValue;

        if (!sharedAppsMap.has(uuid)) {
          sharedAppsMap.set(uuid, []);
        }

        sharedAppsMap.get(uuid)!.push({
          name: prefName,
          value: prefValue
        });
      }
    }

    // Convert shared apps map to array
    const sharedAppsPreferences: SharedAppsPreference[] = Array.from(sharedAppsMap.entries()).map(
      ([uuid, preferences]) => ({
        vmUuid: uuid,
        preferences
      })
    );

    return {
      accountEmail,
      pdPreferences,
      sharedAppsPreferences
    };
  } catch (error) {
    console.error('[parseClientInfo] Parse error:', error);
    return null;
  }
}
