/**
 * Network Configuration Parser
 *
 * Parses the ParallelsNetworkConfig XML to extract:
 * - Virtual networks (Shared, Host-Only)
 * - DHCP settings
 * - Kextless mode status (macOS 11+)
 */

export interface VirtualNetwork {
  name?: string;
  dhcpIp?: string;
  netMask?: string;
  hostIp?: string;
  dhcpEnabled?: string;
  dhcpV6Enabled?: string;
  networkType?: string;
}

export interface NetConfigSummary {
  kextless?: string;              // '0'=kext, '1'=kextless, '-1'=kextless
  kextlessMode?: 'kextless' | 'kext' | 'unknown';
  networks: VirtualNetwork[];
  hasSharedNetwork?: boolean;
  hasHostOnlyNetwork?: boolean;
}

function parseXml(xml: string): Document | null {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'application/xml');
    const parseError = doc.querySelector('parsererror');
    if (parseError) {
      console.error('[parseNetConfig] XML parsing error:', parseError.textContent);
      return null;
    }
    return doc;
  } catch (e) {
    console.error('[parseNetConfig] Failed to parse XML:', e);
    return null;
  }
}

function getText(el: Element, selector: string): string | undefined {
  const target = el.querySelector(selector);
  return target?.textContent?.trim() || undefined;
}

/**
 * Parse ParallelsNetworkConfig XML
 */
export function parseNetConfig(xmlData: string, hostOsMajor?: number): NetConfigSummary | null {
  if (!xmlData) {
    console.warn('[parseNetConfig] No XML data provided');
    return null;
  }

  const doc = parseXml(xmlData);
  if (!doc) return null;

  const kextless = doc.querySelector('UseKextless')?.textContent?.trim();

  // Determine kextless mode
  let kextlessMode: 'kextless' | 'kext' | 'unknown' = 'unknown';
  if (kextless === '1' || kextless === '-1') {
    kextlessMode = 'kextless';
  } else if (kextless === '0') {
    kextlessMode = 'kext';
  }

  // Parse virtual networks
  const networkElements = doc.querySelectorAll('VirtualNetwork');
  const networks: VirtualNetwork[] = [];
  let hasSharedNetwork = false;
  let hasHostOnlyNetwork = false;

  networkElements.forEach((netEl) => {
    const networkType = getText(netEl, 'NetworkType');

    // Filter out NetworkType=0 (legacy script has: networkExclude = { 'NetworkType': 0 })
    if (networkType === '0') {
      return;
    }

    const name = getText(netEl, 'Description');
    const dhcpIp = getText(netEl, 'HostOnlyNetwork DhcpIPAddress');
    const netMask = getText(netEl, 'HostOnlyNetwork IPNetMask');
    const hostIp = getText(netEl, 'HostOnlyNetwork HostIPAddress');
    const dhcpEnabled = getText(netEl, 'HostOnlyNetwork DHCPServer Enabled');
    const dhcpV6Enabled = getText(netEl, 'HostOnlyNetwork DHCPv6Server Enabled');

    networks.push({
      name,
      dhcpIp,
      netMask,
      hostIp,
      dhcpEnabled,
      dhcpV6Enabled,
      networkType
    });

    // Track network types
    if (name?.toLowerCase().includes('shared')) {
      hasSharedNetwork = true;
    }
    if (name?.toLowerCase().includes('host only') || name?.toLowerCase().includes('host-only')) {
      hasHostOnlyNetwork = true;
    }
  });

  return {
    kextless,
    kextlessMode,
    networks,
    hasSharedNetwork,
    hasHostOnlyNetwork
  };
}
