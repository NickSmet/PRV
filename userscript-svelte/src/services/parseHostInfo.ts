/**
 * Host Info Parser
 *
 * Parses the ParallelsHostInfo XML to extract:
 * - Host hardware devices (USB, HDDs, Network adapters, Cameras, etc.)
 * - DisplayLink device detection
 */

export interface HostUsbDevice {
  name?: string;
  uuid?: string;
}

export interface HostHardDisk {
  name?: string;
  uuid?: string;
  size?: string;
  sizeBytes?: number;
}

export interface HostNetworkAdapter {
  name?: string;
  uuid?: string;
  mac?: string;
  ip?: string;
}

export interface HostCamera {
  name?: string;
  uuid?: string;
}

export interface HostInputDevice {
  name?: string;
  uuid?: string;
}

export interface HostPrinter {
  name?: string;
  uuid?: string;
}

export interface HostCCID {
  name?: string;
  uuid?: string;
}

export interface HostInfoSummary {
  usbDevices: HostUsbDevice[];
  hardDisks: HostHardDisk[];
  networkAdapters: HostNetworkAdapter[];
  cameras: HostCamera[];
  inputDevices: HostInputDevice[];
  printers: HostPrinter[];
  ccids: HostCCID[];
  hasDisplayLink?: boolean;
}

function parseXml(xml: string): Document | null {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'application/xml');
    const parseError = doc.querySelector('parsererror');
    if (parseError) {
      console.error('[parseHostInfo] XML parsing error:', parseError.textContent);
      return null;
    }
    return doc;
  } catch (e) {
    console.error('[parseHostInfo] Failed to parse XML:', e);
    return null;
  }
}

function getText(el: Element, selector: string): string | undefined {
  const target = el.querySelector(selector);
  return target?.textContent?.trim() || undefined;
}

/**
 * Convert bytes to human-readable size
 */
function humanFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Parse HostInfo XML
 */
export function parseHostInfo(xmlData: string): HostInfoSummary | null {
  if (!xmlData) {
    console.warn('[parseHostInfo] No XML data provided');
    return null;
  }

  const doc = parseXml(xmlData);
  if (!doc) return null;

  // Check for DisplayLink
  const hasDisplayLink = xmlData.includes('DisplayLink');

  // Parse USB devices
  const usbDevices: HostUsbDevice[] = [];
  const usbElements = doc.querySelectorAll('UsbDevice');
  usbElements.forEach((el) => {
    usbDevices.push({
      name: getText(el, 'Name'),
      uuid: getText(el, 'Uuid')
    });
  });

  // Parse Hard Disks (filter out AppleAPFSMedia)
  const hardDisks: HostHardDisk[] = [];
  const hddElements = doc.querySelectorAll('HardDisk');
  hddElements.forEach((el) => {
    const name = getText(el, 'Name');
    // Filter: skip AppleAPFSMedia
    if (name === 'AppleAPFSMedia') return;

    const sizeStr = getText(el, 'Size');
    const sizeBytes = sizeStr ? parseInt(sizeStr, 10) : undefined;
    const sizeHuman = sizeBytes ? humanFileSize(sizeBytes) : undefined;

    hardDisks.push({
      name,
      uuid: getText(el, 'Uuid'),
      size: sizeHuman,
      sizeBytes
    });
  });

  // Parse Network Adapters
  const networkAdapters: HostNetworkAdapter[] = [];
  const netElements = doc.querySelectorAll('NetworkAdapter');
  netElements.forEach((el) => {
    networkAdapters.push({
      name: getText(el, 'Name'),
      uuid: getText(el, 'Uuid'),
      mac: getText(el, 'MacAddress'),
      ip: getText(el, 'NetAddress')
    });
  });

  // Parse Cameras
  const cameras: HostCamera[] = [];
  const cameraElements = doc.querySelectorAll('Camera');
  cameraElements.forEach((el) => {
    cameras.push({
      name: getText(el, 'Name'),
      uuid: getText(el, 'Uuid')
    });
  });

  // Parse Input Devices (HID devices)
  const inputDevices: HostInputDevice[] = [];
  const inputElements = doc.querySelectorAll('HIDDevice');
  inputElements.forEach((el) => {
    inputDevices.push({
      name: getText(el, 'Name'),
      uuid: getText(el, 'Uuid')
    });
  });

  // Parse Printers
  const printers: HostPrinter[] = [];
  const printerElements = doc.querySelectorAll('Printer');
  printerElements.forEach((el) => {
    printers.push({
      name: getText(el, 'Name'),
      uuid: getText(el, 'Uuid')
    });
  });

  // Parse Smart Card Readers (CCIDs)
  const ccids: HostCCID[] = [];
  const ccidElements = doc.querySelectorAll('SmartCardReaders');
  ccidElements.forEach((el) => {
    ccids.push({
      name: getText(el, 'Name'),
      uuid: getText(el, 'Uuid')
    });
  });

  return {
    usbDevices,
    hardDisks,
    networkAdapters,
    cameras,
    inputDevices,
    printers,
    ccids,
    hasDisplayLink
  };
}
