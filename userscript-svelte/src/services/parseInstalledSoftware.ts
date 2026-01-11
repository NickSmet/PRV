/**
 * Parse InstalledSoftware (macOS applications list)
 *
 * Extracts list of installed macOS applications with their versions.
 */

export interface InstalledApp {
  name: string;
  version?: string;
}

export interface InstalledSoftwareSummary {
  apps: InstalledApp[];
  appCount: number;
}

/**
 * Parse installed software text for macOS applications
 */
export function parseInstalledSoftware(textData: string): InstalledSoftwareSummary | null {
  if (!textData || textData.trim().length === 0) {
    return null;
  }

  try {
    // Remove XML tags
    const cleanedText = textData.replace(/<\/?InstalledSoftware>/g, '');

    // Regex to extract app name and version
    const appRegex = /\/Applications\/(?<appName>[^.]*\.app)[^:]*: (?<version>[\d. ()]*)/g;

    const apps: InstalledApp[] = [];
    const uniqueApps = new Set<string>();

    let match;
    while ((match = appRegex.exec(cleanedText)) !== null) {
      if (match.groups) {
        const appName = match.groups.appName;
        const version = match.groups.version.trim();

        const appKey = `${appName}:${version}`;
        if (!uniqueApps.has(appKey)) {
          uniqueApps.add(appKey);
          apps.push({
            name: appName,
            version: version || undefined
          });
        }
      }
    }

    // Sort apps by name
    apps.sort((a, b) => a.name.localeCompare(b.name));

    return {
      apps,
      appCount: apps.length
    };
  } catch (error) {
    console.error('[parseInstalledSoftware] Parse error:', error);
    return null;
  }
}
