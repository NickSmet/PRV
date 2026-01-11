/**
 * Parse MoreHostInfo (system_profiler GPU/Display information)
 *
 * Extracts GPU names and connected displays with resolutions.
 */

export interface DisplayInfo {
  name: string;
  physicalResolution?: string;
  logicalResolution?: string;
}

export interface GpuInfo {
  name: string;
  displays: DisplayInfo[];
}

export interface MoreHostInfoSummary {
  gpus: GpuInfo[];
  displayCount: number;
  hasNoDisplays: boolean;
}

/**
 * Parse MoreHostInfo XML/Plist for GPU and display information
 */
export function parseMoreHostInfo(xmlData: string): MoreHostInfoSummary | null {
  if (!xmlData || xmlData.trim().length < 120) {
    return null;
  }

  // Skip Windows reports
  if (xmlData.includes('Windows')) {
    return null;
  }

  try {
    // Clean up XML header/footer artifacts
    const cleanedXml = xmlData
      .replace(/\<MoreHostInfo[^$]*dtd\"\>/gm, '')
      .replace(/\<\=/g, '')
      .replace(/\<\/MoreHostInfo>/g, '');

    const parser = new DOMParser();
    const doc = parser.parseFromString(cleanedXml, 'text/xml');

    // Check for parsing errors
    const parserError = doc.querySelector('parsererror');
    if (parserError) {
      console.warn('[parseMoreHostInfo] XML parsing error:', parserError.textContent);
      return null;
    }

    const gpus: GpuInfo[] = [];
    let displayCount = 0;

    // Find all dict elements that might contain GPU info
    // Plist structure: <plist><dict><array><dict>...GPU data...</dict></array></dict></plist>
    const dictElements = doc.querySelectorAll('dict');

    for (const dictEl of Array.from(dictElements)) {
      // Look for _dataType = SPDisplaysDataType
      const keys = dictEl.querySelectorAll('key');
      let isSPDisplaysDataType = false;
      let gpuName = '';
      const displays: DisplayInfo[] = [];

      for (const key of Array.from(keys)) {
        const keyText = key.textContent?.trim();
        const nextEl = key.nextElementSibling;

        if (keyText === '_dataType' && nextEl?.textContent === 'SPDisplaysDataType') {
          isSPDisplaysDataType = true;
        }

        // Extract GPU name
        if (keyText === 'sppci_model' || keyText === '_name') {
          gpuName = nextEl?.textContent?.trim() || '';
        }

        // Extract display information
        if (keyText === 'spdisplays_ndrvs' && nextEl?.nodeName === 'array') {
          // Parse displays array
          const displayDicts = nextEl.querySelectorAll('dict');
          for (const displayDict of Array.from(displayDicts)) {
            const display = parseDisplay(displayDict);
            if (display) {
              displays.push(display);
              displayCount++;
            }
          }
        }
      }

      if (isSPDisplaysDataType && gpuName) {
        gpus.push({ name: gpuName, displays });
      }
    }

    return {
      gpus,
      displayCount,
      hasNoDisplays: displayCount === 0
    };
  } catch (error) {
    console.error('[parseMoreHostInfo] Parse error:', error);
    return null;
  }
}

/**
 * Parse a single display dict element
 */
function parseDisplay(dictEl: Element): DisplayInfo | null {
  let name = '';
  let physicalResolution = '';
  let logicalResolution = '';
  let vendorId = '';

  const keys = dictEl.querySelectorAll('key');
  for (const key of Array.from(keys)) {
    const keyText = key.textContent?.trim();
    const nextEl = key.nextElementSibling;
    const value = nextEl?.textContent?.trim();

    switch (keyText) {
      case '_name':
        name = value || '';
        break;
      case '_spdisplays_display-vendor-id':
        vendorId = value || '';
        break;
      case '_spdisplays_pixels':
        physicalResolution = value || '';
        break;
      case '_spdisplays_resolution':
        logicalResolution = value || '';
        break;
    }
  }

  // Handle MacBook built-in display
  if (name === 'Color LCD' && vendorId === '610') {
    name = 'MacBook Built-In Display';
  }

  if (!name) {
    return null;
  }

  return {
    name,
    physicalResolution,
    logicalResolution
  };
}
