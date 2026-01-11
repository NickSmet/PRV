/**
 * Parse TimeZone (timezone offset information)
 *
 * Extracts timezone offset from the report XML.
 */

export interface TimeZoneSummary {
  timezoneOffset: number;
  timezoneOffsetStr: string; // formatted like "UTC+3" or "UTC-5"
}

/**
 * Parse timezone offset from XML data
 */
export function parseTimeZone(xmlData: string): TimeZoneSummary | null {
  if (!xmlData || xmlData.trim().length === 0) {
    return null;
  }

  try {
    // Extract TimeZone value from XML
    const timezoneRegex = /<TimeZone>([+-]?\d+)<\/TimeZone>/;
    const match = xmlData.match(timezoneRegex);

    if (!match || !match[1]) {
      return null;
    }

    const timezoneOffset = parseInt(match[1], 10);

    // Format timezone string (e.g., "UTC+3" or "UTC-5")
    const sign = timezoneOffset >= 0 ? '+' : '';
    const timezoneOffsetStr = `UTC${sign}${timezoneOffset}`;

    return {
      timezoneOffset,
      timezoneOffsetStr
    };
  } catch (error) {
    console.error('[parseTimeZone] Parse error:', error);
    return null;
  }
}
