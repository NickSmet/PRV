/**
 * Parse LaunchdInfo (launchd daemons and agents)
 *
 * LaunchdInfo is essentially `ls -lR` output over several well-known folders:
 * - /Library/LaunchAgents
 * - /Library/LaunchDaemons
 * - /Users/<user>/Library/LaunchAgents
 *
 * We parse it into a structured tree (for nicer UI) and also keep the legacy
 * formatted listing for quick copy/debug.
 */

import {
  countLsTree,
  countOwner,
  parseLsLr,
  parseLsLrTree,
  type LsFolderEntry
} from '../../utils/lsLr';

export interface LaunchdInfoSummary {
  formattedListing: string;
  tree?: LsFolderEntry;
  stats?: {
    files: number;
    folders: number;
    rootOwnedFiles: number;
  };
}

/**
 * Parse LaunchdInfo text data (ls -lR output)
 */
export function parseLaunchdInfo(textData: string): LaunchdInfoSummary | null {
  if (!textData || textData.trim().length === 0) {
    return null;
  }

  try {
    const formattedListing = parseLsLr(textData);
    const tree = parseLsLrTree(textData, { rootName: 'launchd' });
    const stats = tree
      ? {
          ...countLsTree(tree),
          rootOwnedFiles: countOwner(tree, 'root')
        }
      : undefined;

    return {
      formattedListing,
      tree,
      stats
    };
  } catch (error) {
    console.error('[parseLaunchdInfo] Parse error:', error);
    return null;
  }
}
