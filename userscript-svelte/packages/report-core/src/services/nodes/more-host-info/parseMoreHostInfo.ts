/**
 * Parse MoreHostInfo (system_profiler GPU/Display information)
 *
 * Extracts GPU names and connected displays with resolutions.
 */

export interface DisplayInfo {
  name: string;
  physicalWidth: number;
  physicalHeight: number;
  logicalWidth: number;
  logicalHeight: number;
  refreshRate?: number;
  builtin: boolean;
}

export interface GpuInfo {
  name: string;
  type?: 'integrated' | 'discrete' | 'unknown';
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

    // system_profiler -xml structure:
    // <plist><array> ... <dict> { _dataType: SPDisplaysDataType, _items: [ GPU dicts... ] } ... </array></plist>
    // Important: Only consider *direct* key/value pairs inside a dict (ignore nested keys).
    const spDisplaysSections = findPlistDictsByDataType(doc, 'SPDisplaysDataType');

    for (const section of spDisplaysSections) {
      const itemsArray = getDictValue(section, '_items');
      if (!itemsArray || itemsArray.nodeName !== 'array') continue;

      for (const gpuDict of directChildDicts(itemsArray)) {
        const gpu = parseGpu(gpuDict);
        if (!gpu) continue;
        gpus.push(gpu);
        displayCount += gpu.displays.length;
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

function dictEntries(dictEl: Element): Array<{ key: string; valueEl: Element | null }> {
  const entries: Array<{ key: string; valueEl: Element | null }> = [];
  const children = Array.from(dictEl.children);
  for (let i = 0; i < children.length; i++) {
    const el = children[i];
    if (el.nodeName !== 'key') continue;
    const key = el.textContent?.trim() || '';
    const valueEl = children[i + 1] ?? null;
    entries.push({ key, valueEl: valueEl as Element | null });
  }
  return entries;
}

function getDictValue(dictEl: Element, keyName: string): Element | null {
  for (const { key, valueEl } of dictEntries(dictEl)) {
    if (key === keyName) return valueEl;
  }
  return null;
}

function findPlistDictsByDataType(doc: Document, dataType: string): Element[] {
  const out: Element[] = [];
  for (const dictEl of Array.from(doc.querySelectorAll('dict'))) {
    const dtEl = getDictValue(dictEl, '_dataType');
    const dt = dtEl?.textContent?.trim();
    if (dt === dataType) out.push(dictEl);
  }
  return out;
}

function directChildDicts(arrayEl: Element): Element[] {
  return Array.from(arrayEl.children).filter((c) => c.nodeName === 'dict') as Element[];
}

function parseGpu(dictEl: Element): GpuInfo | null {
  let name = '';
  let type: 'integrated' | 'discrete' | 'unknown' = 'unknown';
  const displays: DisplayInfo[] = [];

  for (const { key, valueEl } of dictEntries(dictEl)) {
    if (!valueEl) continue;

    if (key === 'sppci_model' || key === '_name') {
      name = valueEl.textContent?.trim() || name;
      continue;
    }

    if (key === 'sppci_bus') {
      const v = valueEl.textContent?.trim() || '';
      if (v.includes('builtin')) type = 'integrated';
      else if (v.toLowerCase().includes('pcie')) type = 'discrete';
      continue;
    }

    if (key === 'spdisplays_ndrvs' && valueEl.nodeName === 'array') {
      for (const displayDict of directChildDicts(valueEl)) {
        const display = parseDisplay(displayDict);
        if (display) displays.push(display);
      }
    }
  }

  if (!name) return null;
  return { name, type, displays };
}

function parseWxH(input: string): { w: number; h: number } | null {
  const m = input.match(/(?<w>\d+)\s*x\s*(?<h>\d+)/i);
  if (!m?.groups) return null;
  const w = Number.parseInt(m.groups.w, 10);
  const h = Number.parseInt(m.groups.h, 10);
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return null;
  return { w, h };
}

function parseResolutionWithRefresh(input: string): { w: number; h: number; hz?: number } | null {
  // e.g. "2560 x 1080 @ 144.00Hz"
  const parts = input.split('@').map((p) => p.trim());
  const base = parseWxH(parts[0] || '');
  if (!base) return null;

  const hzPart = parts[1];
  if (!hzPart) return { ...base };

  const hzMatch = hzPart.match(/(?<hz>\d+(?:\.\d+)?)\s*hz/i);
  const hz = hzMatch?.groups?.hz ? Number.parseFloat(hzMatch.groups.hz) : undefined;
  return { ...base, hz: Number.isFinite(hz ?? NaN) ? hz : undefined };
}

/**
 * Parse a single display dict element
 */
function parseDisplay(dictEl: Element): DisplayInfo | null {
  let name = '';
  let physical: { w: number; h: number } | null = null;
  let logical: { w: number; h: number; hz?: number } | null = null;
  let vendorId = '';
  let builtin = false;

  for (const { key, valueEl } of dictEntries(dictEl)) {
    const value = valueEl?.textContent?.trim();
    switch (key) {
      case '_name':
        name = value || '';
        break;
      case '_spdisplays_display-vendor-id':
        vendorId = value || '';
        break;
      case '_spdisplays_pixels':
        physical = value ? parseWxH(value) : null;
        break;
      case '_spdisplays_resolution':
        logical = value ? parseResolutionWithRefresh(value) : null;
        break;
      case 'spdisplays_connection_type':
        // internal/external (e.g. spdisplays_internal)
        builtin = (value || '').includes('internal');
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

  // Fallbacks if parsing failed
  if (!physical && logical) physical = { w: logical.w, h: logical.h };
  if (!logical && physical) logical = { w: physical.w, h: physical.h, hz: undefined };
  if (!physical || !logical) return null;

  return {
    name,
    physicalWidth: physical.w,
    physicalHeight: physical.h,
    logicalWidth: logical.w,
    logicalHeight: logical.h,
    refreshRate: logical.hz,
    builtin
  };
}
