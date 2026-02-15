/**
 * Parse ClientProxyInfo (HTTP proxy detection)
 *
 * Detects if HTTP proxy is enabled on the system.
 */

export interface ClientProxyInfoSummary {
  httpProxyEnabled: boolean;
  proxySettings?: string;
}

/**
 * Parse proxy info text for HTTP proxy detection
 */
export function parseClientProxyInfo(textData: string): ClientProxyInfoSummary | null {
  if (!textData || textData.trim().length === 0) {
    return null;
  }

  try {
    // Extract proxy settings dictionary
    const proxiesRegex = /<dictionary> {[^}]*}([^}]*)}/gm;
    const match = textData.match(proxiesRegex);
    const proxySettings = match ? match[0] : '';

    // Check if HTTPEnable is set to 1
    const httpProxyEnabled = /HTTPEnable : 1/.test(proxySettings);

    return {
      httpProxyEnabled,
      proxySettings: proxySettings || undefined
    };
  } catch (error) {
    console.error('[parseClientProxyInfo] Parse error:', error);
    return null;
  }
}
