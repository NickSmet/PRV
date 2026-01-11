/**
 * Parse parallels-system.log (system log analysis)
 *
 * Detects Coherence state dumps and other system-level diagnostic information.
 */

export interface ParallelsSystemLogSummary {
  hasCoherenceDump: boolean;
  coherenceDumpCount?: number;
}

/**
 * Parse parallels-system.log for Coherence state dumps
 */
export function parseParallelsSystemLog(textData: string): ParallelsSystemLogSummary | null {
  if (!textData || textData.trim().length === 0) {
    return null;
  }

  try {
    // Check last 50000 chars for Coherence state dump
    const last50000chars = textData.slice(Math.max(0, textData.length - 50000));

    const coherenceMatches = last50000chars.match(/Coherence state full dump/gm);
    const hasCoherenceDump = !!coherenceMatches;
    const coherenceDumpCount = coherenceMatches?.length || 0;

    return {
      hasCoherenceDump,
      coherenceDumpCount: hasCoherenceDump ? coherenceDumpCount : undefined
    };
  } catch (error) {
    console.error('[parseParallelsSystemLog] Parse error:', error);
    return null;
  }
}
