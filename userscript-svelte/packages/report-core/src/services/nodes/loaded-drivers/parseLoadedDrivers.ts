/**
 * Parse LoadedDrivers information
 *
 * Extracts kernel extensions/kexts from the loaded drivers list.
 * Detects non-Apple kexts, bad kexts (hackintosh/legacy patcher), and Parallels kexts.
 */

export interface LoadedDriversSummary {
  kexts: string[];
  nonAppleKexts: string[];
  badKexts: string[];
  hasPrlKexts: boolean;
  hasNonAppleKexts: boolean;
  hasBadKexts: boolean;
  onlyApple: boolean;
  isHackintosh: boolean;
}

const KNOWN_BAD_KEXTS = [
  // Common hackintosh kexts
  'org.hwsensors',
  'as.acidanthera',
  'com.rehabman',
  'org.vanilla',
  'org.netkas',
  'org.tgwbd',
  'com.insanelymac',
  // Add more as needed
];

/**
 * Parse loaded drivers text output (kextstat)
 */
export function parseLoadedDrivers(textData: string, cpuModel?: string, hostOsMajor?: number): LoadedDriversSummary | null {
  if (!textData || textData.trim().length === 0) {
    return null;
  }

  // Regex to filter out non-Apple/non-Parallels kexts (excluding header lines)
  const nonAppleRegex = /^((?!com\.apple|LoadedDrivers|Linked Against|com\.parallels).)+$/gm;
  const kextNameRegex = / (\w+\.[^ ]*)/gm;

  // Find all Parallels kexts
  const prlMatches = textData.match(/com\.parallels[^\s]*/g);
  const hasPrlKexts = prlMatches !== null && prlMatches.length > 0;

  // Find all non-Apple kexts
  const nonAppleMatches = textData.match(nonAppleRegex);
  const hasNonAppleKexts = nonAppleMatches !== null && nonAppleMatches.length > 0;

  // Extract kext names from non-Apple matches
  const nonAppleKexts: string[] = [];
  const badKexts: string[] = [];
  let hasBadKexts = false;

  if (nonAppleMatches) {
    for (const match of nonAppleMatches) {
      const kextMatch = match.match(kextNameRegex);
      if (kextMatch && kextMatch[0]) {
        const kextName = kextMatch[0].trim();
        nonAppleKexts.push(kextName);

        // Check if it's a known bad kext
        if (KNOWN_BAD_KEXTS.some(bad => kextName.includes(bad))) {
          badKexts.push(kextName);
          hasBadKexts = true;
        }
      }
    }
  }

  // Determine overall status
  const isAppleSilicon = cpuModel?.includes('Apple') ?? false;
  const isKextless = hostOsMajor !== undefined && hostOsMajor >= 12;
  const onlyApple = !hasNonAppleKexts && (!hasPrlKexts || isAppleSilicon || isKextless);

  return {
    kexts: [...(prlMatches || []), ...nonAppleKexts],
    nonAppleKexts,
    badKexts,
    hasPrlKexts,
    hasNonAppleKexts,
    hasBadKexts,
    onlyApple,
    isHackintosh: hasBadKexts
  };
}
