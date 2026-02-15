/**
 * Host Info Parser
 *
 * Parses the ParallelsHostInfo XML to extract:
 * - System identity (OS/CPU/RAM) and privacy restrictions
 * - Storage inventory with partitions
 * - Network adapters with IPv4/IPv6 addresses
 * - USB inventory (including UUID decomposition + VF support)
 * - Audio devices (input/output) with lightweight classification
 * - HID input devices (filtered to reduce noise)
 * - Printers, cameras, smart card readers, bluetooth serial ports
 */

export type HostPartitionScheme = 'GPT' | 'APFS' | 'MBR' | 'unknown';
export type HostNetAdapterType = 'ethernet' | 'wifi' | 'other';
export type HostUsbSpeed = 'low' | 'full' | 'high' | 'super' | 'unknown';
export type HostUsbState = 'connected' | 'disconnected' | 'in-use';
export type HostAudioDeviceType =
  | 'builtin'
  | 'monitor'
  | 'bluetooth'
  | 'virtual'
  | 'usb'
  | 'continuity'
  | 'mute'
  | 'other';
export type HostInputTransport =
  | 'USB'
  | 'Bluetooth'
  | 'Bluetooth Low Energy'
  | 'FIFO'
  | 'SPI'
  | 'unknown';
export type HostInputRole = 'keyboard' | 'mouse' | 'combo' | 'gamepad' | 'unknown';

export interface HostInfoSummary {
  system: {
    hardwareUuid: string | null;
    isNotebook: boolean;
    os: {
      name: string | null;
      version: string | null;
      build: string | null;
      displayString: string | null;
      architecture: number | null;
    };
    cpu: {
      model: string | null;
      cores: number | null;
      speedMhz: number | null;
      hvtSupported: boolean | null;
    };
    memory: {
      hostRamMb: number | null;
      hostRamGb: number | null;
      maxVmMemoryMb: number | null;
      recommendedMaxMb: number | null;
      live: {
        freeMb: number;
        wiredMb: number;
        inactiveMb: number;
        activeMb: number;
      } | null;
    };
    privacy: {
      cameraAllowed: boolean | null;
      microphoneAllowed: boolean | null;
    };
  };

  hardDisks: Array<{
    name: string;
    identifier: string;
    sizeBytes: number | null;
    sizeFormatted: string | null;
    logicalSectorSize: number | null;
    removable: boolean | null;
    external: boolean | null;
    isVirtualDisk: boolean | null;
    parentStore: string | null;
    partitionScheme: HostPartitionScheme;
    partitions: Array<{
      name: string;
      systemName: string | null;
      sizeBytes: number | null;
      freeSizeBytes: number | null;
      typeName: string | null;
      gptType: string | null;
    }>;
  }>;

  networkAdapters: Array<{
    name: string;
    identifier: string;
    type: HostNetAdapterType;
    enabled: boolean | null;
    mac: string | null;
    addresses: {
      ipv4: string | null;
      ipv4Subnet: string | null;
      ipv6: string | null;
      ipv6Prefix: string | null;
    };
    dhcp: boolean | null;
    dhcpv6: boolean | null;
    vlanTag: number | null;
  }>;

  usbDevices: Array<{
    name: string;
    rawUuid: string | null;
    location: string | null;
    vendorId: string | null;
    productId: string | null;
    speed: HostUsbSpeed;
    serial: string | null;
    state: HostUsbState | null;
    vfSupported: boolean | null;
  }>;

  audio: {
    outputs: Array<{ name: string; id: string | null; type: HostAudioDeviceType }>;
    inputs: Array<{ name: string; id: string | null; type: HostAudioDeviceType }>;
  };

  inputDevices: Array<{
    name: string;
    identifier: string;
    transport: HostInputTransport;
    vendorId: number | null;
    productId: number | null;
    isMouse: boolean | null;
    isKeyboard: boolean | null;
    isGameController: boolean | null;
    role: HostInputRole;
  }>;

  bluetoothDevices: Array<{ name: string; port: string }>;

  printers: Array<{ name: string; isDefault: boolean | null }>;
  cameras: Array<{ name: string }>;
  smartCardReaders: Array<{ name: string }>;

  flags: {
    hasExternalDisks: boolean;
    hasBluetoothAudio: boolean;
    hasUsbCamera: boolean;
    privacyRestricted: boolean;
    lowMemory: boolean;
    isNotebook: boolean;
  };

  hasDisplayLink: boolean;
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

function toInt(value: string | undefined): number | null {
  if (!value) return null;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : null;
}

function toBool01(value: string | undefined): boolean | null {
  if (value === undefined) return null;
  if (value === '1') return true;
  if (value === '0') return false;
  return null;
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

function diskIdentifierFromDevPath(value: string | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  const m = /\/dev\/(disk\d+)/.exec(trimmed);
  return m?.[1] ?? null;
}

function stripDiskSuffix(name: string): string {
  return name.replace(/\s*\(disk\d+\)\s*$/, '').trim();
}

function partitionSchemeFromValue(value: string | undefined): HostPartitionScheme {
  switch (value) {
    case '1':
      return 'GPT';
    case '2':
      return 'MBR';
    case '3':
      return 'APFS';
    default:
      return 'unknown';
  }
}

function netAdapterTypeFromValue(value: string | undefined): HostNetAdapterType {
  switch (value) {
    case '0':
      return 'ethernet';
    case '2':
      return 'wifi';
    default:
      return 'other';
  }
}

function pickIpv6(candidates: string[]): string | null {
  if (candidates.length === 0) return null;
  const nonLinkLocal = candidates.find((c) => !c.toLowerCase().startsWith('fe80:'));
  return nonLinkLocal ?? candidates[0] ?? null;
}

function parseNetAddress(value: string): { addr: string; suffix: string | null } {
  const raw = value.trim();
  const idx = raw.indexOf('/');
  if (idx === -1) return { addr: raw, suffix: null };
  return { addr: raw.slice(0, idx), suffix: raw.slice(idx + 1) || null };
}

function usbSpeedFromValue(value: string | undefined): HostUsbSpeed {
  const v = (value ?? '').toLowerCase().trim();
  if (v === 'low' || v === 'full' || v === 'high' || v === 'super' || v === 'unknown') return v;
  return 'unknown';
}

function usbStateFromValue(value: string | undefined): HostUsbState | null {
  if (value === undefined) return null;
  switch (value) {
    case '0':
      return 'connected';
    case '1':
      return 'in-use';
    case '2':
      return 'disconnected';
    default:
      return null;
  }
}

function parseUsbUuid(rawUuid: string | undefined): {
  rawUuid: string | null;
  location: string | null;
  vendorId: string | null;
  productId: string | null;
  speed: HostUsbSpeed;
  serial: string | null;
} {
  if (!rawUuid) {
    return { rawUuid: null, location: null, vendorId: null, productId: null, speed: 'unknown', serial: null };
  }

  const parts = rawUuid.split('|');
  if (parts.length >= 4) {
    const location = parts[0]?.trim() || null;
    const vendorId = parts[1]?.trim() || null;
    const productId = parts[2]?.trim() || null;
    const speed = usbSpeedFromValue(parts[3]);
    const serialRaw = (parts[5] ?? '').trim();
    const serial = !serialRaw || serialRaw === 'Empty' || serialRaw === '--' ? null : serialRaw;
    return { rawUuid, location, vendorId, productId, speed, serial };
  }

  return { rawUuid, location: null, vendorId: null, productId: null, speed: 'unknown', serial: null };
}

function parseOsPresentation(value: string | undefined): { name: string | null; version: string | null; build: string | null } {
  if (!value) return { name: null, version: null, build: null };
  const raw = value.trim();
  const m = /^(.+?)\s+([0-9]+(?:\.[0-9]+)*)(?:\(([^)]+)\))?$/.exec(raw);
  if (!m) return { name: null, version: null, build: null };
  return { name: m[1]?.trim() || null, version: m[2]?.trim() || null, build: m[3]?.trim() || null };
}

function audioTypeFromUuidAndName(
  uuid: string | null,
  name: string,
  direction: 'in' | 'out'
): HostAudioDeviceType {
  const u = uuid ?? '';
  const n = name.toLowerCase();

  if (!u && !name) return 'other';
  if (u.includes('BuiltInSpeakerDevice') || u.includes('BuiltInMicrophoneDevice')) return 'builtin';
  if (n === 'mute' || u.toLowerCase().includes('null')) return 'mute';
  if (u.includes('AppleUSBAudioEngine')) return 'usb';
  if (/([0-9a-f]{2}-){5}[0-9a-f]{2}/i.test(u)) return 'bluetooth';
  if (n.includes('teams') || n.includes('zoom') || n.includes('loopback') || u.toLowerCase().includes('loopback')) return 'virtual';
  if (n.includes('iphone') || n.includes('ipad') || u.toLowerCase().includes('iphone') || u.toLowerCase().includes('ipad'))
    return 'continuity';

  if (direction === 'out') {
    const looksLikeDisplay = n.includes('dell') || n.includes('lg') || n.includes('samsung') || n.includes('display') || n.includes('monitor');
    if (u.endsWith('_out') && looksLikeDisplay) return 'monitor';
  }

  return 'other';
}

function transportFromValue(value: string | undefined): HostInputTransport {
  const v = (value ?? '').trim();
  if (!v) return 'unknown';
  if (
    v === 'USB' ||
    v === 'Bluetooth' ||
    v === 'Bluetooth Low Energy' ||
    v === 'FIFO' ||
    v === 'SPI'
  ) {
    return v;
  }
  return 'unknown';
}

function inputRole(isKeyboard: boolean | null, isMouse: boolean | null, isGameController: boolean | null): HostInputRole {
  if (isKeyboard && isMouse) return 'combo';
  if (isKeyboard) return 'keyboard';
  if (isMouse) return 'mouse';
  if (isGameController) return 'gamepad';
  return 'unknown';
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

  // System identity
  const hardwareUuid = getText(doc.documentElement, 'HardwareUuid') ?? null;
  const isNotebook = (getText(doc.documentElement, 'HostNotebookFlag') ?? '') === '1';

  const osEl = doc.querySelector('OsVersion');
  const osPresentation = getText(osEl ?? doc.documentElement, 'StringPresentation');
  const osParsed = parseOsPresentation(osPresentation);
  const osArchitecture = toInt(getText(osEl ?? doc.documentElement, 'OsArchitecture'));

  const cpuEl = doc.querySelector('Cpu');
  const cpuCores = toInt(getText(cpuEl ?? doc.documentElement, 'Number'));
  const cpuSpeed = toInt(getText(cpuEl ?? doc.documentElement, 'Speed'));
  const hvtNptAvail = toBool01(getText(cpuEl ?? doc.documentElement, 'HvtNptAvail'));
  const hvtUnrestrictedAvail = toBool01(getText(cpuEl ?? doc.documentElement, 'HvtUnrestrictedAvail'));
  const hvtSupported =
    hvtNptAvail === null && hvtUnrestrictedAvail === null
      ? null
      : Boolean(hvtNptAvail || hvtUnrestrictedAvail);

  const memoryEl = doc.querySelector('MemorySettings');
  const hostRamMb = toInt(getText(memoryEl ?? doc.documentElement, 'HostRamSize'));
  const maxVmMemoryMb = toInt(getText(memoryEl ?? doc.documentElement, 'MaxVmMemory'));
  const recommendedMaxMb = toInt(getText(memoryEl ?? doc.documentElement, 'RecommendedMaxMemory'));

  const memLiveEl = memoryEl?.querySelector('AdvancedMemoryInfo');
  const liveFreeMb = toInt(getText(memLiveEl ?? memoryEl ?? doc.documentElement, 'FreeMemSize'));
  const liveWiredMb = toInt(getText(memLiveEl ?? memoryEl ?? doc.documentElement, 'WireMemSize'));
  const liveInactiveMb = toInt(getText(memLiveEl ?? memoryEl ?? doc.documentElement, 'InactiveMemSize'));
  const liveActiveMb = toInt(getText(memLiveEl ?? memoryEl ?? doc.documentElement, 'ActiveMemSize'));
  const memoryLive =
    liveFreeMb === null && liveWiredMb === null && liveInactiveMb === null && liveActiveMb === null
      ? null
      : {
          freeMb: liveFreeMb ?? 0,
          wiredMb: liveWiredMb ?? 0,
          inactiveMb: liveInactiveMb ?? 0,
          activeMb: liveActiveMb ?? 0
        };

  const privacyEl = doc.querySelector('PrivacyRestrictions');
  const cameraAllowed = toBool01(getText(privacyEl ?? doc.documentElement, 'Camera'));
  const microphoneAllowed = toBool01(getText(privacyEl ?? doc.documentElement, 'Microphone'));

  // Storage
  const hardDisks: HostInfoSummary['hardDisks'] = [];
  const hddElements = doc.querySelectorAll('HardDisks > HardDisk');
  hddElements.forEach((el) => {
    const rawName = getText(el, 'Name') ?? '';
    const name = stripDiskSuffix(rawName) || rawName || 'Disk';
    const uuid = getText(el, 'Uuid');
    const identifier = diskIdentifierFromDevPath(uuid) ?? /(\bdisk\d+\b)/.exec(rawName)?.[1] ?? '';

    const sizeBytes = toInt(getText(el, 'Size'));
    const sizeFormatted = sizeBytes === null ? null : humanFileSize(sizeBytes);

    const partitions: HostInfoSummary['hardDisks'][number]['partitions'] = [];
    el.querySelectorAll('Partition').forEach((p) => {
      const pSizeBytes = toInt(getText(p, 'Size'));
      const pFreeBytes = toInt(getText(p, 'FreeSize'));
      partitions.push({
        name: getText(p, 'Name') ?? 'Partition',
        systemName: getText(p, 'SystemName') ?? null,
        sizeBytes: pSizeBytes,
        freeSizeBytes: pFreeBytes,
        typeName: getText(p, 'TypeName') ?? null,
        gptType: getText(p, 'GptType') ?? null
      });
    });

    hardDisks.push({
      name,
      identifier,
      sizeBytes,
      sizeFormatted,
      logicalSectorSize: toInt(getText(el, 'LogicalSectorSize')),
      removable: toBool01(getText(el, 'Removable')),
      external: toBool01(getText(el, 'External')),
      isVirtualDisk: toBool01(getText(el, 'IsVirtualDisk')),
      parentStore: (getText(el, 'ParentStoreName') ?? '').trim() || null,
      partitionScheme: partitionSchemeFromValue(getText(el, 'PartitionScheme')),
      partitions
    });
  });

  // Network
  const networkAdapters: HostInfoSummary['networkAdapters'] = [];
  const netElements = doc.querySelectorAll('NetworkAdapters > NetworkAdapter');
  netElements.forEach((el) => {
    const netAddresses = Array.from(el.querySelectorAll('NetAddress'))
      .map((a) => a.textContent?.trim())
      .filter((a): a is string => Boolean(a));

    const ipv4Candidate = netAddresses.find((a) => /\b\d{1,3}(\.\d{1,3}){3}\b/.test(a)) ?? null;
    const ipv6Candidates = netAddresses.filter((a) => a.includes(':'));
    const ipv6Candidate = pickIpv6(ipv6Candidates);

    const ipv4Parsed = ipv4Candidate ? parseNetAddress(ipv4Candidate) : null;
    const ipv6Parsed = ipv6Candidate ? parseNetAddress(ipv6Candidate) : null;

    const vlanTagRaw = toInt(getText(el, 'VLANTag'));
    const vlanTag = vlanTagRaw === 65535 ? null : vlanTagRaw;

    networkAdapters.push({
      name: getText(el, 'Name') ?? 'Adapter',
      identifier: getText(el, 'Uuid') ?? '',
      type: netAdapterTypeFromValue(getText(el, 'Type')),
      enabled: toBool01(getText(el, 'Enabled')),
      mac: getText(el, 'MacAddress') ?? null,
      addresses: {
        ipv4: ipv4Parsed?.addr ?? null,
        ipv4Subnet: ipv4Parsed?.suffix ?? null,
        ipv6: ipv6Parsed?.addr ?? null,
        ipv6Prefix: ipv6Parsed?.suffix ?? null
      },
      dhcp: toBool01(getText(el, 'ConfigureWithDhcp')),
      dhcpv6: toBool01(getText(el, 'ConfigureWithDhcpIPv6')),
      vlanTag
    });
  });

  // USB
  const usbDevices: HostInfoSummary['usbDevices'] = [];
  const usbElements = doc.querySelectorAll('UsbDevices > UsbDevice');
  usbElements.forEach((el) => {
    const uuid = getText(el, 'Uuid');
    const parsed = parseUsbUuid(uuid);
    usbDevices.push({
      name: getText(el, 'Name') ?? 'USB Device',
      rawUuid: parsed.rawUuid,
      location: parsed.location,
      vendorId: parsed.vendorId,
      productId: parsed.productId,
      speed: parsed.speed,
      serial: parsed.serial,
      state: usbStateFromValue(getText(el, 'DeviceState')),
      vfSupported: toBool01(getText(el, 'SupportedByVirtualizationFramework'))
    });
  });

  // Audio
  const outputs: HostInfoSummary['audio']['outputs'] = [];
  const inputs: HostInfoSummary['audio']['inputs'] = [];
  doc.querySelectorAll('SoundDevices OutputDevices OutputDevice').forEach((el) => {
    const name = getText(el, 'Name') ?? 'Output';
    const id = getText(el, 'Uuid') ?? null;
    outputs.push({ name, id, type: audioTypeFromUuidAndName(id, name, 'out') });
  });
  doc.querySelectorAll('SoundDevices MixerDevices MixerDevice').forEach((el) => {
    const name = getText(el, 'Name') ?? 'Input';
    const id = getText(el, 'Uuid') ?? null;
    inputs.push({ name, id, type: audioTypeFromUuidAndName(id, name, 'in') });
  });

  // HID input devices
  const inputDevices: HostInfoSummary['inputDevices'] = [];
  doc.querySelectorAll('HIDDevices > HIDDevice').forEach((el) => {
    const name = getText(el, 'Name') ?? '';
    const vendorId = toInt(getText(el, 'VendorID'));
    const productId = toInt(getText(el, 'ProductID'));
    const transport = transportFromValue(getText(el, 'Transport'));
    const isMouse = toBool01(getText(el, 'IsMouse'));
    const isKeyboard = toBool01(getText(el, 'IsKeyboard'));
    const isGameController = toBool01(getText(el, 'IsGameController'));

    const isNoise = !name.trim() && (vendorId ?? 0) === 0 && (productId ?? 0) === 0;
    if (isNoise) return;

    inputDevices.push({
      name: name.trim() || 'HID Device',
      identifier: getText(el, 'Uuid') ?? '',
      transport,
      vendorId,
      productId,
      isMouse,
      isKeyboard,
      isGameController,
      role: inputRole(isKeyboard, isMouse, isGameController)
    });
  });

  // Printers
  const printers: HostInfoSummary['printers'] = [];
  doc.querySelectorAll('Printers > Printer').forEach((el) => {
    printers.push({
      name: getText(el, 'Name') ?? 'Printer',
      isDefault: toBool01(getText(el, 'Default'))
    });
  });

  // Cameras (scope to avoid <PrivacyRestrictions><Camera>)
  const cameras: HostInfoSummary['cameras'] = [];
  doc.querySelectorAll('Cameras > Camera').forEach((el) => {
    const name = getText(el, 'Name') ?? el.textContent?.trim() ?? '';
    cameras.push({ name: name || 'Camera' });
  });

  // Smart card readers
  const smartCardReaders: HostInfoSummary['smartCardReaders'] = [];
  doc.querySelectorAll('SmartCardReaders > SmartCardReader').forEach((el) => {
    const name = getText(el, 'Name') ?? el.textContent?.trim() ?? '';
    smartCardReaders.push({ name: name || 'Smart Card Reader' });
  });

  // Bluetooth serial ports
  const bluetoothDevices: HostInfoSummary['bluetoothDevices'] = [];
  doc.querySelectorAll('SerialPorts > SerialPort').forEach((el) => {
    const port = getText(el, 'Name') ?? getText(el, 'Uuid') ?? '';
    if (!port.startsWith('/dev/cu.')) return;
    if (port === '/dev/cu.debug-console') return;
    if (port === '/dev/cu.Bluetooth-Incoming-Port') return;
    const name = port.replace('/dev/cu.', '').trim();
    if (!name) return;
    bluetoothDevices.push({ name, port });
  });

  const hasBluetoothAudio = outputs.some((d) => d.type === 'bluetooth') || inputs.some((d) => d.type === 'bluetooth');
  const hasExternalDisks = hardDisks.some((d) => d.external === true);
  const hasUsbCamera =
    usbDevices.some((d) => /camera|webcam/i.test(d.name)) ||
    inputDevices.some((d) => /camera|webcam/i.test(d.name));
  const privacyRestricted = cameraAllowed === false || microphoneAllowed === false;
  const lowMemory = (() => {
    if (!memoryLive || !hostRamMb) return false;
    const active = memoryLive.activeMb ?? 0;
    const wired = memoryLive.wiredMb ?? 0;
    const ratio = (active + wired) / hostRamMb;
    return ratio >= 0.85;
  })();

  return {
    system: {
      hardwareUuid,
      isNotebook,
      os: {
        name: osParsed.name,
        version: osParsed.version,
        build: osParsed.build,
        displayString: osPresentation?.trim() ?? null,
        architecture: osArchitecture
      },
      cpu: {
        model: getText(cpuEl ?? doc.documentElement, 'Model') ?? null,
        cores: cpuCores,
        speedMhz: cpuSpeed,
        hvtSupported
      },
      memory: {
        hostRamMb,
        hostRamGb: hostRamMb === null ? null : Math.round(hostRamMb / 1024),
        maxVmMemoryMb,
        recommendedMaxMb,
        live: memoryLive
      },
      privacy: { cameraAllowed, microphoneAllowed }
    },
    hardDisks,
    networkAdapters,
    usbDevices,
    audio: { outputs, inputs },
    inputDevices,
    bluetoothDevices,
    printers,
    cameras,
    smartCardReaders,
    flags: {
      hasExternalDisks,
      hasBluetoothAudio,
      hasUsbCamera,
      privacyRestricted,
      lowMemory,
      isNotebook
    },
    hasDisplayLink
  };
}
