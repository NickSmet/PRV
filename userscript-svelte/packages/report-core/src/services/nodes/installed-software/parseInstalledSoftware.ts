/**
 * Parse InstalledSoftware (macOS applications list)
 *
 * Extracts list of installed macOS applications with their versions.
 */

export interface InstalledApp {
  name: string;
  path?: string;
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

    const apps: InstalledApp[] = [];
    const uniqueApps = new Set<string>();

    const lines = cleanedText.split('\n');
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      // Typical format:
      // /Applications/Foo.app : 1.2.3
      // /Applications/Foo.app/Contents/Applications/Bar.app : 9.9.9   (nested; ignore)
      const m = /^(?<path>\/.*?\.app)\s*:\s*(?<version>.*)$/.exec(line);
      const path = m?.groups?.path?.trim();
      if (!path) continue;

      // Ignore nested `.app` bundles inside another `.app` bundle.
      // If the path contains ".app/" anywhere, it's a component bundle (Dorico/VSTAudioEngine style).
      if (path.toLowerCase().includes('.app/')) continue;

      const version = (m?.groups?.version ?? '').trim();
      const name = path.split('/').pop() ?? path;

      // Deduplicate by path+version (keeps separate versions if they exist).
      const appKey = `${path}:${version}`;
      if (uniqueApps.has(appKey)) continue;
      uniqueApps.add(appKey);

      apps.push({
        name,
        path,
        version: version || undefined
      });
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
