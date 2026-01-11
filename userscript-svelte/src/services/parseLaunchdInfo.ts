/**
 * Parse LaunchdInfo (launchd daemons and agents)
 *
 * Displays launchd daemons and agents in a formatted file listing.
 * Uses parseLsLr utility from parseAdvancedVmInfo.
 */

import { parseLsLr } from './parseAdvancedVmInfo';

export interface LaunchdInfoSummary {
  formattedListing: string;
}

/**
 * Parse LaunchdInfo text data (ls -lR output)
 * Simply delegates to parseLsLr utility
 */
export function parseLaunchdInfo(textData: string): LaunchdInfoSummary | null {
  if (!textData || textData.trim().length === 0) {
    return null;
  }

  try {
    const formattedListing = parseLsLr(textData);

    return {
      formattedListing
    };
  } catch (error) {
    console.error('[parseLaunchdInfo] Parse error:', error);
    return null;
  }
}
