export interface VmDisk {
  location?: string;
  virtualSize?: string;
  actualSize?: string;
  interfaceType?: string;
  trim?: string;
  expanding?: string;
  splitted?: string;
}

export interface VmCd {
  location?: string;
  interfaceType?: string;
  connected?: string;
}

export interface VmUsbDevice {
  name?: string;
  timestamp?: string;
}

export interface VmNetAdapter {
  adapterType?: string;
  mode?: string;
  adapterName?: string;
  mac?: string;
  connected?: string;
  conditionerEnabled?: string;
  conditionerTxBps?: string;
  conditionerRxBps?: string;
  conditionerTxLossPpm?: string;
  conditionerRxLossPpm?: string;
  conditionerTxDelayMs?: string;
  conditionerRxDelayMs?: string;
}

export interface TravelMode {
  enabled?: string;
  enterCode?: string;
  threshold?: string;
  quitCode?: string;
  state?: string;
}

export interface CurrentVmSummary {
  vmName?: string;
  vmHome?: string;
  creationDate?: string;
  vmUuid?: string;
  sourceVmUuid?: string;
  linkedVmUuid?: string;
  macVm?: boolean;
  startAutomatically?: string;
  startupView?: string;
  pauseAfter?: string;
  pauseAfterTimeout?: string;
  onMacShutdown?: string;
  onVmShutdown?: string;
  onWindowClose?: string;
  reclaimDiskSpace?: string;
  cpuCount?: string;
  ramMb?: string;
  vramMb?: string;
  hypervisorType?: string;
  nestedVirtualization?: string;
  resourceQuota?: string;
  videoMode?: string;
  scaleToFit?: string;
  mouse?: string;
  keyboard?: string;
  travelMode?: TravelMode;
  tpm?: string;
  sharedBluetooth?: string;
  sharedCamera?: string;
  usb3?: string;
  rollbackMode?: string;
  isolated?: string;
  sharedProfile?: string;
  shareHostCloud?: string;
  mapMacVolumes?: string;
  accessGuestFromHost?: string;
  shareOneDriveWithHost?: string;
  shareGuestNetDrives?: string;
  shareGuestExternDrives?: string;
  sharedGuestApps?: string;
  sharedHostApps?: string;
  clipboardSync?: string;
  timeSync?: string;
  smartGuard?: string;
  smartGuardSchema?: string;
  bootFlags?: string;
  highPerfGraphics?: string;
  shareHostPrinters?: string;
  syncDefaultPrinter?: string;
  showPageSetup?: string;
  sharedCCID?: string;
  hdds: VmDisk[];
  cds: VmCd[];
  netAdapters: VmNetAdapter[];
  usbDevices: VmUsbDevice[];
  state?: string;
}

function parseXml(xml: string): Document | null {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'application/xml');
    const parserError = doc.querySelector('parsererror');
    if (parserError) {
      console.warn('[PRV] XML parsererror in parseCurrentVm:', parserError.textContent?.slice(0, 200));
    }
    return doc;
  } catch {
    console.warn('[PRV] parseXml threw while parsing CurrentVm XML');
    return null;
  }
}

function extractVmFragment(xml: string): string | null {
  if (!xml.includes('<ParallelsVirtualMachine')) {
    console.warn('[PRV] parseCurrentVm: input XML does not contain <ParallelsVirtualMachine>');
    return null;
  }

  const match = xml.match(/<ParallelsVirtualMachine[\s\S]*?<\/ParallelsVirtualMachine>/);
  if (!match) {
    console.warn('[PRV] parseCurrentVm: failed to extract <ParallelsVirtualMachine> fragment');
    return null;
  }

  return match[0];
}

function text(doc: ParentNode, selector: string): string | undefined {
  return doc.querySelector(selector)?.textContent?.trim() || undefined;
}

function toArray<T>(nodes: NodeListOf<Element>, mapper: (el: Element) => T): T[] {
  return Array.from(nodes).map(mapper).filter(Boolean);
}

function parseDisks(doc: Document): VmDisk[] {
  const nodes = doc.querySelectorAll('ParallelsVirtualMachine > Hardware > Hdd');
  return toArray(nodes, (el) => ({
    location: text(el, 'SystemName'),
    virtualSize: text(el, 'Size'),
    actualSize: text(el, 'SizeOnDisk'),
    interfaceType: text(el, 'InterfaceType'),
    trim: text(el, 'OnlineCompactMode'),
    expanding: text(el, 'DiskType'),
    splitted: text(el, 'Splitted')
  }));
}

function parseCds(doc: Document): VmCd[] {
  const nodes = doc.querySelectorAll('ParallelsVirtualMachine > Hardware > CdRom');
  return toArray(nodes, (el) => ({
    location: text(el, 'SystemName'),
    interfaceType: text(el, 'InterfaceType'),
    connected: text(el, 'Connected')
  }));
}

function parseNets(doc: Document): VmNetAdapter[] {
  const nodes = doc.querySelectorAll('ParallelsVirtualMachine > Hardware > NetworkAdapter');
  return toArray(nodes, (el) => ({
    adapterType: text(el, 'AdapterType'),
    mode: text(el, 'EmulatedType'),
    adapterName: text(el, 'AdapterName'),
    mac: text(el, 'MAC'),
    connected: text(el, 'Connected'),
    conditionerEnabled: text(el, 'LinkRateLimit > Enable'),
    conditionerTxBps: text(el, 'LinkRateLimit > TxBps'),
    conditionerRxBps: text(el, 'LinkRateLimit > RxBps'),
    conditionerTxLossPpm: text(el, 'LinkRateLimit > TxLossPpm'),
    conditionerRxLossPpm: text(el, 'LinkRateLimit > RxLossPpm'),
    conditionerTxDelayMs: text(el, 'LinkRateLimit > TxDelayMs'),
    conditionerRxDelayMs: text(el, 'LinkRateLimit > RxDelayMs')
  }));
}

function parseTravelMode(doc: Document): TravelMode | undefined {
  const base = doc.querySelector('ParallelsVirtualMachine > Settings > TravelOptions');
  if (!base) return undefined;
  return {
    enabled: text(base, 'Enabled'),
    enterCode: text(base, 'Condition > Enter'),
    threshold: text(base, 'Condition > EnterBetteryThreshold'),
    quitCode: text(base, 'Condition > Quit'),
    state: text(base, 'Enabled')
  };
}

function parseUsbDevices(doc: Document): VmUsbDevice[] {
  const nodes = doc.querySelectorAll('ParallelsVirtualMachine > Hardware > UsbConnectHistory > USBPort');
  return toArray(nodes, (el) => ({
    name: text(el, 'SystemName'),
    timestamp: text(el, 'Timestamp')
  }));
}

export function parseCurrentVm(xml: string): CurrentVmSummary | null {
  if (!xml) {
    console.warn('[PRV] parseCurrentVm called with empty XML');
    return null;
  }

  const fragment = extractVmFragment(xml);
  if (!fragment) {
    return null;
  }

  const doc = parseXml(fragment);
  if (!doc) return null;

  const root = doc.querySelector('ParallelsVirtualMachine');
  if (!root) {
    console.warn('[PRV] parseCurrentVm: <ParallelsVirtualMachine> element not found after parsing');
    return null;
  }

  const vmHome = text(doc, 'ParallelsVirtualMachine > Identification > VmHome');
  const macVm = !!vmHome?.match(/\.macvm/i);

  return {
    vmName: text(root, 'Identification > VmName'),
    vmHome,
    creationDate: text(root, 'Identification > VmCreationDate'),
    vmUuid: text(root, 'Identification > VmUuid'),
    sourceVmUuid: text(root, 'Identification > SourceVmUuid'),
    linkedVmUuid: text(root, 'Identification > LinkedVmUuid'),
    macVm,
    startAutomatically: text(root, 'Settings > Startup > AutoStart'),
    startupView: text(root, 'Settings > Startup > WindowMode'),
    pauseAfter: text(root, 'Settings > Tools > Coherence > PauseIdleVM'),
    pauseAfterTimeout: text(root, 'Settings > Tools > Coherence > PauseIdleVMTimeout'),
    onMacShutdown: text(root, 'Settings > Shutdown > AutoStop'),
    onVmShutdown: text(root, 'Settings > Runtime > ActionOnStop'),
    onWindowClose: text(root, 'Settings > Shutdown > OnVmWindowClose'),
    reclaimDiskSpace: text(root, 'Settings > Shutdown > ReclaimDiskSpace'),
    cpuCount: text(root, 'Hardware > Cpu > Number'),
    ramMb: text(root, 'Hardware > Memory > RAM'),
    vramMb: text(root, 'Hardware > Video > VideoMemorySize'),
    hypervisorType: text(root, 'Settings > Runtime > HypervisorType'),
    nestedVirtualization: text(root, 'Hardware > Cpu > VirtualizedHV'),
    resourceQuota: text(root, 'Settings > Runtime > ResourceQuota'),
    videoMode: text(root, 'Hardware > Video > EnableHiResDrawing'),
    scaleToFit: text(root, 'Settings > Runtime > FullScreen > ScaleViewMode'),
    mouse: text(root, 'Settings > Tools > MouseSync > Enabled'),
    keyboard: text(root, 'Settings > Runtime > OptimizeModifiers'),
    travelMode: parseTravelMode(doc),
    tpm: text(root, 'Hardware > TpmChip > Type'),
    sharedBluetooth: text(root, 'Settings > SharedBluetooth > Enabled'),
    sharedCamera: text(root, 'Settings > SharedCamera > Enabled'),
    usb3: text(root, 'Settings > UsbController > XhcEnabled'),
    rollbackMode: text(root, 'Settings > Runtime > UndoDisks'),
    isolated: text(root, 'Settings > Tools > IsolatedVm'),
    sharedProfile: text(root, 'Settings > Tools > SharedProfile > Enabled'),
    shareHostCloud: text(root, 'Settings > Tools > SharedFolders > HostSharing > SharedCloud'),
    mapMacVolumes: text(root, 'Settings > Tools > SharedVolumes > Enabled'),
    accessGuestFromHost: text(root, 'Settings > Tools > SharedFolders > GuestSharing > Enabled'),
    shareOneDriveWithHost: text(root, 'Settings > Tools > SharedFolders > GuestSharing > AutoMountCloudDrives'),
    shareGuestNetDrives: text(root, 'Settings > Tools > SharedFolders > GuestSharing > AutoMountNetworkDrives'),
    shareGuestExternDrives: text(root, 'Settings > Tools > SharedFolders > GuestSharing > ShareRemovableDrives'),
    sharedGuestApps: text(root, 'Settings > Tools > SharedApplications > FromWinToMac'),
    sharedHostApps: text(root, 'Settings > Tools > SharedApplications > FromMacToWin'),
    clipboardSync: text(root, 'Settings > Tools > ClipboardSync > Enabled'),
    timeSync: text(root, 'Settings > Tools > TimeSync > Enabled'),
    smartGuard: text(root, 'Settings > Autoprotect > Enabled'),
    smartGuardSchema: text(root, 'Settings > Autoprotect > Schema'),
    bootFlags: text(root, 'Settings > Runtime > SystemFlags'),
    highPerfGraphics: text(root, 'Settings > Runtime > OptimizePowerConsumptionMode'),
    shareHostPrinters: text(root, 'Settings > VirtualPrintersInfo > UseHostPrinters'),
    syncDefaultPrinter: text(root, 'Settings > VirtualPrintersInfo > SyncDefaultPrinter'),
    showPageSetup: text(root, 'Settings > VirtualPrintersInfo > ShowHostPrinterUI'),
    sharedCCID: text(root, 'Settings > SharedCCID > Enabled'),
    hdds: parseDisks(doc),
    cds: parseCds(doc),
    netAdapters: parseNets(doc),
    usbDevices: parseUsbDevices(doc)
  };
}
