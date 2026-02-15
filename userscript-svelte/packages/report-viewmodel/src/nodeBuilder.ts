import type {
  AdvancedVmInfoSummary,
  AllProcessesSummary,
  AppConfigSummary,
  AutoStatisticInfoSummary,
  ClientInfoSummary,
  ClientProxyInfoSummary,
  CurrentVmModel,
  GuestCommandsSummary,
  GuestOsSummary,
  HostInfoSummary,
  InstalledSoftwareSummary,
  LaunchdInfoSummary,
  LicenseDataSummary,
  LoadedDriversSummary,
  Marker,
  MoreHostInfoSummary,
  MountInfoSummary,
  NetConfigSummary,
  ParallelsSystemLogSummary,
  ReportModel,
  TimeZoneSummary,
  ToolsLogSummary,
  VmDirectorySummary
} from '@prv/report-core';
import { getNodeLevelMarkers } from '@prv/report-core';
import { formatHddInterface, formatMbytes } from './units';

export interface NodeBadge {
  label: string;
  tone?: 'info' | 'warn' | 'danger';
  iconKey?:
    | 'hdd'
    | 'net'
    | 'travel'
    | 'vm'
    | 'warn'
    | 'keyboard'
    | 'mouse'
    | 'cd'
    | 'disc'
    | 'camera'
    | 'bluetooth'
    | 'usb'
    | 'printer'
    | 'cloud'
    | 'folder'
    | 'clipboard'
    | 'clock'
    | 'shield'
    | 'cpu';
}

export interface NodeRow {
  label: string;
  value?: string;
  iconKey?: string;
  badge?: {
    label: string;
    variant: 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'muted';
  };
  type?: 'text' | 'path' | 'uuid' | 'datetime';
}

export interface NodeSubSection {
  id: string;
  title: string;
  rows: NodeRow[];
  iconKey?: NodeBadge['iconKey'];
}

export interface NodeSection {
  title: string;
  rows: NodeRow[];
  subSections?: NodeSubSection[];
}

export interface NodeModel {
  id: string;
  title: string;
  badges: NodeBadge[];
  sections: NodeSection[];
  openByDefault?: boolean;
  /**
   * Optional per-node structured payload for custom renderers in `src/App.svelte`.
   * Keep this stable and additive; don't rely on it for core parsing logic.
   */
  data?: unknown;
}

function markerIconKeyToNodeIconKey(iconKey: string | undefined): NodeBadge['iconKey'] | undefined {
  if (!iconKey) return undefined;
  switch (iconKey) {
    case 'hard-drive':
      return 'hdd';
    case 'network':
    case 'wifi-off':
      return 'net';
    case 'alert-triangle':
      return 'warn';
    case 'keyboard':
      return 'keyboard';
    case 'mouse':
      return 'mouse';
    case 'disc':
      return 'disc';
    case 'webcam':
      return 'camera';
    case 'bluetooth':
      return 'bluetooth';
    case 'usb':
      return 'usb';
    case 'printer':
      return 'printer';
    case 'cloud':
      return 'cloud';
    case 'folder-open':
      return 'folder';
    case 'clipboard':
      return 'clipboard';
    case 'clock':
      return 'clock';
    case 'shield':
      return 'shield';
    case 'cpu':
      return 'cpu';
    default:
      return undefined;
  }
}

function markerSeverityToTone(severity: Marker['severity']): NodeBadge['tone'] {
  if (severity === 'danger') return 'danger';
  if (severity === 'warn') return 'warn';
  return 'info';
}

function applyNodeLevelMarkerBadges(node: NodeModel, markers: Marker[]): NodeModel {
  const nodeLevel = getNodeLevelMarkers(markers, node.id);
  if (nodeLevel.length === 0) return node;

  const markerBadges: NodeBadge[] = nodeLevel.map((m) => ({
    label: m.label,
    tone: markerSeverityToTone(m.severity),
    iconKey: markerIconKeyToNodeIconKey(m.iconKey)
  }));

  const seen = new Set<string>(node.badges.map((b) => b.label));
  const merged = [...node.badges];
  for (const badge of markerBadges) {
    if (seen.has(badge.label)) continue;
    merged.push(badge);
    seen.add(badge.label);
  }

  return { ...node, badges: merged };
}

export function buildNodesFromReport(report: ReportModel, markers: Marker[] = []): NodeModel[] {
  const nodes: NodeModel[] = [
    buildCurrentVmNode(report.currentVm),
    buildGuestOsNode(report.guestOs),
    buildLicenseDataNode(report.license),
    buildNetConfigNode(report.network),
    buildAdvancedVmInfoNode(report.advancedVm),
    buildHostInfoNode(report.hostDevices),
    buildLoadedDriversNode(report.drivers),
    buildMountInfoNode(report.storage),
    buildAllProcessesNode(report.processes),
    buildMoreHostInfoNode(report.moreHostInfo),
    buildVmDirectoryNode(report.vmDirectory),
    buildGuestCommandsNode(report.guestCommands),
    buildAppConfigNode(report.appConfig),
    buildClientInfoNode(report.clientInfo),
    buildClientProxyInfoNode(report.proxy),
    buildInstalledSoftwareNode(report.installedSoftware),
    buildToolsLogNode(report.toolsLog),
    buildParallelsSystemLogNode(report.systemLog),
    buildLaunchdInfoNode(report.launchdInfo),
    buildAutoStatisticInfoNode(report.autoStatisticInfo),
    // TimeZone is rarely useful; keep it at the very end.
    buildTimeZoneNode(report.timezone)
  ];

  return nodes.map((n) => applyNodeLevelMarkerBadges(n, markers));
}

const maps: Record<string, Record<string, string>> = {
  hypervisor: { '0': 'Parallels', '1': 'Apple' },
  videoMode: { '0': 'Scaled', '1': 'Best for Retina', '2': 'Best for external' },
  scaleToFit: { '0': 'Off', '1': 'Auto', '2': 'Keep ratio', '3': 'Stretch' },
  startAuto: {
    '0': 'Never',
    '1': 'When Mac Starts',
    '2': '—',
    '3': 'When PD starts',
    '4': 'When window opens',
    '5': 'When user logs in'
  },
  startupView: { '0': 'Same as last time', '1': 'Window', '2': 'Full Screen', '3': 'Coherence', '4': 'PiP', '5': 'Headless' },
  onWindowClose: { '1': 'Suspend', '4': 'ShutDown', '0': 'Force stop', '5': 'Keep running', '2': 'Ask' },
  onMacShutdown: { '0': 'Stop', '1': 'Suspend', '2': 'Shut down' },
  onVmShutdown: { '0': 'Keep window open', '1': 'Close window', '3': 'Quit PD' },
  keyboard: { '0': 'Auto', '1': 'Don\'t optimize', '2': 'Optimize for games' },
  mouse: { '0': 'Auto', '1': 'Don\'t optimize', '2': 'Optimize for games' },
  networkMode: {
    '0': 'Shared',
    '1': 'Host-Only',
    '2': 'Bridged',
    '3': 'Disconnected'
  },
  yesNo: { '0': 'No', '1': 'Yes' },
  enabled: { '0': 'Disabled', '1': 'Enabled' },
  onOff: { '0': 'Off', '1': 'On' }
};

function pushSection(
  sections: NodeSection[],
  title: string,
  rows: NodeRow[],
  extra?: Partial<NodeSection>
) {
  const filtered = rows.filter((r) => r.value !== undefined || r.badge !== undefined);
  const subSections = extra?.subSections ?? [];
  if (!filtered.length && !subSections.length) return;
  sections.push({ title, rows: filtered, ...extra });
}

// Helper function to convert Unix timestamp (milliseconds) to human-readable datetime
function formatTimestamp(timestamp: string | undefined): string | undefined {
  if (!timestamp) return undefined;

  const num = parseInt(timestamp, 10);
  if (isNaN(num)) return timestamp;

  // Check if it's a Unix timestamp in milliseconds (13 digits)
  if (timestamp.length === 13) {
    const date = new Date(num);
    // Format: "Nov 30, 2025 14:32"
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  return timestamp;
}

// Helper function to convert binary values (0/1) to badge objects
function toBadge(value: string | undefined, type: 'enabled' | 'yesNo' | 'onOff' = 'enabled'): { badge?: NodeRow['badge'] } {
  if (value === undefined) return {};

  const isOn = value === '1';

  if (type === 'enabled') {
    return {
      badge: {
        label: isOn ? 'Enabled' : 'Disabled',
        variant: isOn ? 'success' : 'muted'
      }
    };
  }

  if (type === 'yesNo') {
    return {
      badge: {
        label: isOn ? 'Yes' : 'No',
        variant: isOn ? 'success' : 'muted'
      }
    };
  }

  if (type === 'onOff') {
    return {
      badge: {
        label: isOn ? 'On' : 'Off',
        variant: isOn ? 'success' : 'muted'
      }
    };
  }

  return {};
}

export function buildCurrentVmNode(summary?: CurrentVmModel | null): NodeModel {
  const badges: NodeBadge[] = [];
  const sections: NodeSection[] = [];

  if (!summary) {
    return {
      id: 'current-vm',
      title: 'CurrentVm',
      badges: [{ label: 'pending', tone: 'info' }],
      sections: [{ title: 'Info', rows: [{ label: 'Status', value: 'No data yet' }] }],
      openByDefault: false
    };
  }

  pushSection(sections, 'Startup / Shutdown', [
    {
      label: 'Start Automatically',
      value: maps.startAuto[summary.startAutomatically || ''] || summary.startAutomatically
    },
    { label: 'Startup View', value: maps.startupView[summary.startupView || ''] || summary.startupView },
    ...(summary.pauseAfter === '0'
      ? [{ label: 'Pause After…', ...toBadge('0', 'enabled') }]
      : [{
          label: 'Pause After…',
          value: summary.pauseAfterTimeout
            ? `After ${summary.pauseAfterTimeout} sec.`
            : summary.pauseAfter
        }]),
    { label: 'Rollback Mode', ...toBadge(summary.rollbackMode, 'enabled') },
    { label: 'On Mac Shutdown', value: maps.onMacShutdown[summary.onMacShutdown || ''] || summary.onMacShutdown },
    { label: 'On VM Shutdown', value: maps.onVmShutdown[summary.onVmShutdown || ''] || summary.onVmShutdown },
    { label: 'On Window Close', value: maps.onWindowClose[summary.onWindowClose || ''] || summary.onWindowClose },
    { label: 'Reclaim Disk Space', ...toBadge(summary.reclaimDiskSpace, 'enabled') }
  ]);

  pushSection(sections, 'General', [
    { label: 'VM Name', value: summary.vmName },
    { label: 'PVM Location', value: summary.vmHome, type: 'path' as const },
    { label: 'Creation Date', value: summary.creationDate, type: 'datetime' as const },
    { label: 'VM UUID', value: summary.vmUuid, type: 'uuid' as const },
    { label: 'Source UUID', value: summary.sourceVmUuid, type: 'uuid' as const }
  ]);

  const hardwareRows: NodeRow[] = [
    { label: 'CPUs', value: summary.cpuCount, iconKey: 'cpu' },
    { label: 'RAM (MB)', value: summary.ramMb, iconKey: 'cpu' },
    { label: 'VRAM', value: summary.vramMb === '0' ? 'Auto' : summary.vramMb, iconKey: 'monitor' },
    { label: 'Resource Quota', value: summary.resourceQuota },
    { label: 'Video Mode', value: maps.videoMode[summary.videoMode || ''] || summary.videoMode, iconKey: 'monitor' },
    { label: 'Scale To Fit Screen', value: maps.scaleToFit[summary.scaleToFit || ''] || summary.scaleToFit, iconKey: 'monitor' },
    { label: 'Mouse', value: maps.mouse[summary.mouse || ''] || summary.mouse, iconKey: 'mouse' },
    { label: 'Keyboard', value: maps.keyboard[summary.keyboard || ''] || summary.keyboard, iconKey: 'keyboard' },
    { label: 'Hypervisor', value: maps.hypervisor[summary.hypervisorType || ''] || summary.hypervisorType },
    { label: 'Adaptive Hypervisor', value: summary.hypervisorType },
    { label: 'Nested Virtualization', ...toBadge(summary.nestedVirtualization, 'yesNo') },
    { label: '3D Acceleration', ...toBadge(summary.videoMode, 'enabled'), iconKey: 'monitor' }
  ];

  const hardwareSubSections: NodeSubSection[] = [];

  if (summary.netAdapters?.length) {
    const netRows: NodeRow[] = summary.netAdapters.flatMap((adapter, index) => [
      { label: 'Type', value: adapter.adapterType, iconKey: 'net' } as NodeRow,
      { label: 'Connected', ...toBadge(adapter.connected, 'yesNo') } as NodeRow,
      { label: 'Mode', value: adapter.mode } as NodeRow,
      { label: 'Adapter name', value: adapter.adapterName } as NodeRow,
      { label: 'Mac', value: adapter.mac } as NodeRow,
      { label: 'Conditioner', ...toBadge(adapter.conditionerEnabled, 'enabled') } as NodeRow
    ].filter(r => r.value !== undefined || r.badge !== undefined));
    hardwareSubSections.push({
      id: 'networks',
      title: 'Networks',
      iconKey: 'net',
      rows: netRows
    });
  }

  const hddRows: NodeRow[] = summary.hdds?.length
    ? summary.hdds.flatMap((disk, index) => {
        const isExternalToBundle =
          typeof disk.location === 'string' &&
          (summary.externalVhddLocations ?? []).includes(disk.location);

        return [
          {
            label: 'Location',
            value: disk.location,
            type: 'path' as const
          } as NodeRow,
          { label: 'External to PVM', ...toBadge(isExternalToBundle ? '1' : '0', 'yesNo') } as NodeRow,
          { label: 'Virtual Size', value: formatMbytes(disk.virtualSize) ?? disk.virtualSize } as NodeRow,
          { label: 'Actual Size', value: formatMbytes(disk.actualSize) ?? disk.actualSize } as NodeRow,
          { label: 'Interface', value: formatHddInterface(disk.interfaceType) ?? disk.interfaceType } as NodeRow,
          { label: 'Splitted', ...toBadge(disk.splitted === '0' ? '0' : '1', 'yesNo') } as NodeRow,
          { label: 'Trim', ...toBadge(disk.trim, 'enabled') } as NodeRow,
          { label: 'Expanding', ...toBadge(disk.expanding, 'yesNo') } as NodeRow
        ].filter(r => r.value !== undefined || r.badge !== undefined);
      })
    : [{ label: 'No disks attached', badge: { label: 'Empty', variant: 'muted' } }];

  hardwareSubSections.push({
    id: 'hdds',
    title: 'HDDs',
    iconKey: 'hdd',
    rows: hddRows
  });

  const cdRows: NodeRow[] = summary.cds?.length
    ? summary.cds.flatMap((cd, index) => [
        { label: 'Location', value: cd.location, type: 'path' as const } as NodeRow,
        { label: 'Interface', value: cd.interfaceType } as NodeRow
      ].filter(r => r.value !== undefined))
    : [{ label: 'No CD/DVD drives', badge: { label: 'Empty', variant: 'muted' } }];

  hardwareSubSections.push({
    id: 'cds',
    title: 'CD / DVD',
    rows: cdRows
  });

  const usbRows: NodeRow[] = summary.usbDevices?.length
    ? summary.usbDevices.flatMap((usb, index) => {
        const formattedTimestamp = formatTimestamp(usb.timestamp);
        return [
          {
            label: usb.name || `USB Device ${index + 1}`,
            value: formattedTimestamp ? `Last connected: ${formattedTimestamp}` : undefined,
            iconKey: 'usb',
            type: 'datetime' as const
          } as NodeRow
        ];
      }).filter(r => r.value !== undefined || r.label)
    : [{ label: 'No USB devices', badge: { label: 'Empty', variant: 'muted' } }];

  hardwareSubSections.push({
    id: 'usbs',
    title: 'USBs',
    iconKey: 'usb',
    rows: usbRows
  });

  pushSection(sections, 'Hardware', hardwareRows, {
    subSections: hardwareSubSections
  });

  pushSection(sections, 'Sharing', [
    { label: 'Isolated', ...toBadge(summary.isolated, 'enabled'), iconKey: 'shield' },
    { label: 'Shared Profile', ...toBadge(summary.sharedProfile, 'enabled'), iconKey: 'folder' },
    { label: 'Share Host Cloud', ...toBadge(summary.shareHostCloud, 'enabled'), iconKey: 'cloud' },
    { label: 'Map Mac Volumes', ...toBadge(summary.mapMacVolumes, 'enabled'), iconKey: 'folder' },
    { label: 'Access Guest from Host', ...toBadge(summary.accessGuestFromHost, 'enabled'), iconKey: 'net' },
    { label: 'Share OneDrive with Host', ...toBadge(summary.shareOneDriveWithHost, 'enabled'), iconKey: 'cloud' },
    { label: 'Share Guest Netw. Drives', ...toBadge(summary.shareGuestNetDrives, 'enabled'), iconKey: 'hdd' },
    { label: 'Share Guest Extern. Drives', ...toBadge(summary.shareGuestExternDrives, 'enabled'), iconKey: 'hdd' },
    { label: 'Shared Guest Apps', ...toBadge(summary.sharedGuestApps, 'enabled') },
    { label: 'Shared Host Apps', ...toBadge(summary.sharedHostApps, 'enabled') },
    { label: 'Clipboard', ...toBadge(summary.clipboardSync, 'enabled'), iconKey: 'clipboard' },
    { label: 'Time Sync', ...toBadge(summary.timeSync, 'enabled'), iconKey: 'clock' }
  ]);

  pushSection(sections, 'Other', [
    { label: 'Smart Guard', ...toBadge(summary.smartGuard, 'enabled'), iconKey: 'shield' },
    { label: 'Opt.TimeMachine', value: summary.smartGuardSchema, iconKey: 'clock' },
    { label: 'Boot Flags', value: summary.bootFlags },
    { label: 'High-perf graphics', ...toBadge(summary.highPerfGraphics, 'enabled'), iconKey: 'monitor' }
  ], {
    subSections:
      summary.travelMode
        ? [
            {
              id: 'travel',
              title: 'Travel Mode',
              iconKey: 'travel',
              rows: [
                {
                  label: 'Travel Mode',
                  ...toBadge(summary.travelMode.enabled, 'onOff')
                },
                {
                  label: 'Travel Enter',
                  value:
                    summary.travelMode.enterCode === '0'
                      ? 'Never'
                      : summary.travelMode.enterCode === '1'
                      ? 'Always when on battery'
                      : summary.travelMode.threshold
                      ? `On battery below ${summary.travelMode.threshold}%`
                      : summary.travelMode.enterCode
                },
                {
                  label: 'Travel Exit',
                  value:
                    summary.travelMode.quitCode === '0'
                      ? 'Never'
                      : summary.travelMode.quitCode
                      ? 'On Connecting to Battery'
                      : undefined
                }
              ]
            }
          ]
        : []
  });

  pushSection(sections, 'Devices', [
    { label: 'TPM', value: summary.tpm, iconKey: 'shield' },
    { label: 'Shared Bluetooth', ...toBadge(summary.sharedBluetooth, 'enabled'), iconKey: 'bluetooth' },
    { label: 'Shared Camera', ...toBadge(summary.sharedCamera, 'enabled'), iconKey: 'camera' },
    { label: 'USB 3.0', ...toBadge(summary.usb3, 'enabled'), iconKey: 'usb' },
    { label: 'Shared CCID', ...toBadge(summary.sharedCCID, 'enabled') },
    { label: 'Share Host Printers', ...toBadge(summary.shareHostPrinters, 'enabled'), iconKey: 'printer' },
    { label: 'Sync Default Printer', ...toBadge(summary.syncDefaultPrinter, 'enabled'), iconKey: 'printer' },
    { label: 'Show Page Setup', ...toBadge(summary.showPageSetup, 'enabled') }
  ]);

  // Legacy inline badges (kept for backwards compatibility)
  if (summary.travelMode?.state === '1') badges.push({ label: 'Travel Mode', tone: 'warn', iconKey: 'travel' });
  if (summary.macVm) badges.push({ label: 'Mac VM', tone: 'info', iconKey: 'vm' });
  if (!summary.hdds?.length) badges.push({ label: 'No HDD!!!', tone: 'danger', iconKey: 'hdd' });
  if (summary.netAdapters?.some((n) => n.connected === '0')) badges.push({ label: 'NIC offline', tone: 'warn', iconKey: 'net' });

  return {
    id: 'current-vm',
    title: 'CurrentVm',
    badges,
    sections,
    openByDefault: true
  };
}

/**
 * Build CurrentVm node with markers from the rule engine.
 * This is the new approach that uses declarative rules instead of inline badge logic.
 * 
 * @param rawXml - The raw XML content for CurrentVm
 * @param hostRamMb - Optional host RAM in MB for cross-node rules
 * @returns Object containing the node model and all generated markers
 */
// ============================================================================
// Phase 1: New Node Builders
// ============================================================================

/**
 * Build GuestOs node
 */
export function buildGuestOsNode(summary?: GuestOsSummary | null): NodeModel {
  const badges: NodeBadge[] = [];
  const sections: NodeSection[] = [];

  if (!summary) {
    return {
      id: 'guest-os',
      title: 'GuestOs',
      badges: [{ label: 'pending', tone: 'info' }],
      sections: [{ title: 'Info', rows: [{ label: 'Status', value: 'No data yet' }] }]
    };
  }

  const hasFriendlyName =
    !!summary.name && !!summary.version && summary.name !== summary.version;

  function releasedAgo(isoDate: string | undefined): string | undefined {
    if (!isoDate) return undefined;
    const d = new Date(isoDate);
    if (!Number.isFinite(d.getTime())) return undefined;
    const now = Date.now();
    const ms = now - d.getTime();
    const days = Math.floor(ms / 86_400_000);
    if (!Number.isFinite(days)) return undefined;
    if (days < 0) return 'in future';
    if (days < 1) return 'today';
    if (days < 30) return `${days}d ago`;
    if (days < 365) return `${Math.floor(days / 30)}mo ago`;
    return `${Math.floor(days / 365)}y ago`;
  }

  // If we have a friendly Windows version name (from windowsVersions.json), surface it.
  // Keep the raw version string for debugging / provenance.
  const rel = summary.releaseDate ? `${summary.releaseDate}${releasedAgo(summary.releaseDate) ? ` (${releasedAgo(summary.releaseDate)})` : ''}` : undefined;
  pushSection(sections, 'Guest OS', [
    { label: 'Type', value: summary.type },
    { label: 'Version', value: summary.name ?? summary.version },
    ...(hasFriendlyName ? [{ label: 'Version (raw)', value: summary.version }] : []),
    { label: 'Released', value: rel },
    { label: 'Kernel', value: summary.kernel }
  ]);

  return {
    id: 'guest-os',
    title: 'GuestOs',
    badges,
    sections
  };
}

/**
 * Build LicenseData node
 */
export function buildLicenseDataNode(summary?: LicenseDataSummary | null): NodeModel {
  const badges: NodeBadge[] = [];
  const sections: NodeSection[] = [];

  if (!summary) {
    return {
      id: 'license-data',
      title: 'LicenseData',
      badges: [{ label: 'pending', tone: 'info' }],
      sections: [{ title: 'Info', rows: [{ label: 'Status', value: 'No data yet' }] }]
    };
  }

  // Add pirated badge if detected
  if (summary.isPirated) {
    badges.push({ label: 'Pirated', tone: 'danger' });
  }

  pushSection(sections, 'License', [
    { label: 'Type', value: summary.editionName },
    { label: 'Expires', value: summary.expirationDate, type: 'datetime' as const }
  ]);

  const propertyRows: NodeRow[] = [
    { label: 'Auto renewable', ...toBadge(summary.isAutoRenewable ? '1' : '0', 'yesNo') },
    { label: 'Beta', ...toBadge(summary.isBeta ? '1' : '0', 'yesNo') },
    { label: 'Bytebot', ...toBadge(summary.isBytebot ? '1' : '0', 'yesNo') },
    { label: 'China', ...toBadge(summary.isChina ? '1' : '0', 'yesNo') },
    { label: 'Expired', ...toBadge(summary.isExpired ? '1' : '0', 'yesNo') },
    { label: 'Grace period', ...toBadge(summary.isGracePeriod ? '1' : '0', 'yesNo') },
    { label: 'NFR', ...toBadge(summary.isNfr ? '1' : '0', 'yesNo') },
    { label: 'Purchased online', ...toBadge(summary.isPurchasedOnline ? '1' : '0', 'yesNo') },
    { label: 'Sublicense', ...toBadge(summary.isSublicense ? '1' : '0', 'yesNo') },
    { label: 'Suspended', ...toBadge(summary.isSuspended ? '1' : '0', 'yesNo') },
    { label: 'Trial', ...toBadge(summary.isTrial ? '1' : '0', 'yesNo') },
    { label: 'Upgrade', ...toBadge(summary.isUpgrade ? '1' : '0', 'yesNo') }
  ];

  pushSection(sections, 'Properties', propertyRows);

  return {
    id: 'license-data',
    title: 'LicenseData',
    badges,
    sections
  };
}

/**
 * Build NetConfig node
 */
export function buildNetConfigNode(summary?: NetConfigSummary | null): NodeModel {
  const badges: NodeBadge[] = [];
  const sections: NodeSection[] = [];

  if (!summary) {
    return {
      id: 'net-config',
      title: 'NetConfig',
      badges: [{ label: 'pending', tone: 'info' }],
      sections: [{ title: 'Info', rows: [{ label: 'Status', value: 'No data yet' }] }]
    };
  }

  // Add kextless badge
  if (summary.kextlessMode === 'kextless') {
    badges.push({ label: 'Kextless', tone: 'info' });
  } else if (summary.kextlessMode === 'kext') {
    badges.push({ label: 'Kext', tone: 'info' });
  }

  // Warn if networks are missing
  if (!summary.hasSharedNetwork || !summary.hasHostOnlyNetwork) {
    badges.push({ label: 'Network missing', tone: 'warn' });
  }

  pushSection(sections, 'Network Configuration', [
    { label: 'Kextless Mode', value: summary.kextlessMode }
  ]);

  // Build network rows
  const networkRowsRaw: NodeRow[] = summary.networks.flatMap(
    (net, index): NodeRow[] => [
      { label: `Network ${index + 1}`, value: net.name },
      { label: 'DHCP IP', value: net.dhcpIp },
      { label: 'Net Mask', value: net.netMask },
      { label: 'Host IP', value: net.hostIp },
      { label: 'DHCP Enabled', ...toBadge(net.dhcpEnabled, 'yesNo') },
      { label: 'IPv6 DHCP Enabled', ...toBadge(net.dhcpV6Enabled, 'yesNo') }
    ]
  );
  const networkRows = networkRowsRaw.filter((r) => r.value !== undefined || r.badge !== undefined);

  pushSection(sections, 'Virtual Networks', networkRows);

  return {
    id: 'net-config',
    title: 'NetConfig',
    badges,
    sections,
    data: summary
  };
}

/**
 * Build AdvancedVmInfo node
 */
export function buildAdvancedVmInfoNode(
  summary?: AdvancedVmInfoSummary | null
): NodeModel {
  const badges: NodeBadge[] = [];
  const sections: NodeSection[] = [];

  if (!summary) {
    return {
      id: 'advanced-vm-info',
      title: 'AdvancedVmInfo',
      badges: [{ label: 'pending', tone: 'info' }],
      sections: [{ title: 'Info', rows: [{ label: 'Status', value: 'No data yet' }] }]
    };
  }

  // Add badges based on issues
  if (summary.snapshotCount === 0) {
    badges.push({ label: 'No snapshots', tone: 'info' });
  } else {
    badges.push({ label: `${summary.snapshotCount} snapshots`, tone: 'info' });
  }

  if (summary.hasAclIssues) {
    badges.push({ label: 'ACL issues', tone: 'warn' });
  }

  if (summary.hasRootOwner) {
    badges.push({ label: 'Root owner', tone: 'warn' });
  }

  if (summary.hasDeleteSnapshotOp) {
    badges.push({ label: 'Delete snapshot op', tone: 'danger' });
  }

  if (summary.mainSnapshotMissing) {
    badges.push({ label: 'Main snapshot missing', tone: 'danger' });
  }

  // Build snapshot rows
  const snapshotRows: NodeRow[] = summary.snapshots.length
    ? summary.snapshots.map((snap, index) => ({
        label: snap.name || `Snapshot ${index + 1}`,
        value: snap.dateTime,
        type: 'datetime' as const
      }))
    : [{ label: 'No snapshots', badge: { label: 'Empty', variant: 'muted' } }];

  pushSection(sections, 'Snapshots', snapshotRows);

  // PVM Bundle (structured tree is rendered in UI; keep minimal summary rows here)
  const bundleRows: NodeRow[] = [];
  if (summary.pvmBundleTree?.path) {
    bundleRows.push({ label: 'Root', value: summary.pvmBundleTree.path, type: 'path' as const });
  } else {
    bundleRows.push({ label: 'Status', value: 'No PVM bundle file list' });
  }
  pushSection(sections, 'PVM Bundle', bundleRows);

  return {
    id: 'advanced-vm-info',
    title: 'AdvancedVmInfo',
    badges,
    sections,
    data: summary
  };
}

/**
 * Build HostInfo node
 */
export function buildHostInfoNode(summary?: HostInfoSummary | null): NodeModel {
  const badges: NodeBadge[] = [];
  const sections: NodeSection[] = [];

  if (!summary) {
    return {
      id: 'host-info',
      title: 'HostInfo',
      badges: [{ label: 'pending', tone: 'info' }],
      sections: [{ title: 'Info', rows: [{ label: 'Status', value: 'No data yet' }] }]
    };
  }

  // Summary badges (keep short; details are in custom view)
  const osName = summary.system.os.name ?? null;
  const osVersion = summary.system.os.version ?? null;
  const hostRamGb = summary.system.memory.hostRamGb ?? null;
  if (osName && osVersion) badges.push({ label: `${osName} ${osVersion}`, tone: 'info' });
  else if (summary.system.os.displayString) badges.push({ label: summary.system.os.displayString, tone: 'info' });
  if (hostRamGb !== null) badges.push({ label: `${hostRamGb}GB RAM`, tone: 'info' });

  if (summary.flags.lowMemory) badges.push({ label: 'High memory usage', tone: 'warn', iconKey: 'warn' });
  if (summary.flags.privacyRestricted) badges.push({ label: 'Privacy restricted', tone: 'warn', iconKey: 'shield' });
  if (summary.hasDisplayLink) badges.push({ label: 'DisplayLink', tone: 'warn', iconKey: 'vm' });
  if (summary.flags.hasExternalDisks) badges.push({ label: 'External disk', tone: 'info', iconKey: 'hdd' });
  if (summary.flags.hasUsbCamera) badges.push({ label: 'USB camera', tone: 'info', iconKey: 'camera' });
  if (summary.flags.hasBluetoothAudio) badges.push({ label: 'BT audio', tone: 'info', iconKey: 'bluetooth' });

  return {
    id: 'host-info',
    title: 'HostInfo',
    badges,
    sections,
    data: summary
  };
}

// ============================================================================
// Phase 2: System Diagnostics Node Builders
// ============================================================================

/**
 * Build LoadedDrivers node
 */
export function buildLoadedDriversNode(
  summary?: LoadedDriversSummary | null
): NodeModel {
  const badges: NodeBadge[] = [];
  const sections: NodeSection[] = [];

  if (!summary) {
    return {
      id: 'loaded-drivers',
      title: 'LoadedDrivers',
      badges: [{ label: 'pending', tone: 'info' }],
      sections: [{ title: 'Info', rows: [{ label: 'Status', value: 'No data yet' }] }]
    };
  }

  // Add badges based on kext analysis
  if (summary.isHackintosh) {
    badges.push({ label: 'Hackintosh', tone: 'danger' });
  } else if (summary.hasNonAppleKexts && !summary.hasPrlKexts) {
    badges.push({ label: 'No PRL kexts', tone: 'warn' });
  } else if (summary.onlyApple) {
    badges.push({ label: 'Only Apple', tone: 'info' });
  } else if (summary.hasNonAppleKexts) {
    badges.push({ label: 'Non-Apple kexts', tone: 'warn' });
  }

  // Build kext list
  const kextRows: NodeRow[] = [];

  if (summary.onlyApple) {
    kextRows.push({ label: 'Status', value: 'Only Apple kexts (as expected)' });
  } else {
    if (summary.nonAppleKexts.length > 0) {
      summary.nonAppleKexts.forEach((kext, index) => {
        const isBad = summary.badKexts.includes(kext);
        kextRows.push({
          label: `Kext ${index + 1}`,
          value: kext,
          badge: isBad ? { label: 'Bad', variant: 'destructive' } : undefined
        });
      });
    }

    if (!summary.hasPrlKexts && !summary.onlyApple) {
      kextRows.unshift({
        label: 'Warning',
        value: 'No Parallels kexts found',
        badge: { label: 'Missing', variant: 'destructive' }
      });
    }
  }

  pushSection(sections, 'Loaded Drivers', kextRows.length > 0 ? kextRows : [
    { label: 'Kexts', value: `${summary.kexts.length} loaded` }
  ]);

  return {
    id: 'loaded-drivers',
    title: 'LoadedDrivers',
    badges,
    sections
  };
}

/**
 * Build MountInfo node
 */
export function buildMountInfoNode(summary?: MountInfoSummary | null): NodeModel {
  const badges: NodeBadge[] = [];
  const sections: NodeSection[] = [];

  if (!summary) {
    return {
      id: 'mount-info',
      title: 'MountInfo',
      badges: [{ label: 'pending', tone: 'info' }],
      sections: [{ title: 'Info', rows: [{ label: 'Status', value: 'No data yet' }] }]
    };
  }

  // Add storage warning badges
  if (summary.hddFull) {
    badges.push({ label: 'HDD FULL!', tone: 'danger' });
  } else if (summary.lowStorage) {
    badges.push({ label: 'Low storage', tone: 'warn' });
  }

  if (summary.hasNtfsVolumes) {
    badges.push({ label: 'NTFS detected', tone: 'info' });
  }

  return {
    id: 'mount-info',
    title: 'MountInfo',
    badges,
    sections,
    data: summary
  };
}

/**
 * Build AllProcesses node
 */
export function buildAllProcessesNode(summary?: AllProcessesSummary | null): NodeModel {
  const badges: NodeBadge[] = [];
  const sections: NodeSection[] = [];

  if (!summary) {
    return {
      id: 'all-processes',
      title: 'AllProcesses',
      badges: [{ label: 'pending', tone: 'info' }],
      sections: [{ title: 'Info', rows: [{ label: 'Status', value: 'No data yet' }] }]
    };
  }

  // Add bsdtar badge if detected
  if (summary.hasBsdtarIssue) {
    badges.push({ label: 'bsdtar', tone: 'danger' });
  }

  const total = summary.items?.length ?? 0;
  const apps =
    summary.items?.filter(
      (p) => p.type === 'macos-app' || p.type === 'third-party-app' || p.type === 'windows-store-app'
    ).length ?? 0;
  const services = summary.items?.filter((p) => p.type === 'service').length ?? 0;
  const other = Math.max(0, total - apps - services);

  pushSection(sections, 'Overview', [
    { label: 'Processes parsed', value: String(total) },
    { label: 'Apps', value: String(apps) },
    { label: 'Services', value: String(services) },
    { label: 'Other', value: String(other) },
    summary.top?.timestamp ? { label: 'Top snapshot', value: summary.top.timestamp } : undefined,
    summary.top?.loadAvg?.one != null
      ? { label: 'Load Avg', value: `${summary.top.loadAvg.one}, ${summary.top.loadAvg.five}, ${summary.top.loadAvg.fifteen}` }
      : undefined,
    summary.top?.cpu?.user != null
      ? { label: 'CPU usage', value: `${summary.top.cpu.user}% user, ${summary.top.cpu.sys}% sys, ${summary.top.cpu.idle}% idle` }
      : undefined
  ].filter(Boolean) as NodeRow[]);

  // Top CPU processes
  const topCpuRows: NodeRow[] = summary.topCpuProcesses.map((proc, index) => ({
    label: `${index + 1}. ${proc.name.substring(0, 40)}`,
    value: `${proc.cpu.toFixed(1)}% CPU (${proc.user})`
  }));

  pushSection(sections, 'Top CPU Usage', topCpuRows);

  // Top Memory processes
  const topMemRows: NodeRow[] = summary.topMemProcesses.map((proc, index) => ({
    label: `${index + 1}. ${proc.name.substring(0, 40)}`,
    value: `${proc.mem.toFixed(1)}% Memory (${proc.user})`
  }));

  pushSection(sections, 'Top Memory Usage', topMemRows);

  return {
    id: 'all-processes',
    title: 'AllProcesses',
    badges,
    sections,
    data: summary
  };
}

/**
 * Build MoreHostInfo node
 */
export function buildMoreHostInfoNode(summary?: MoreHostInfoSummary | null): NodeModel {
  const badges: NodeBadge[] = [];
  const sections: NodeSection[] = [];

  if (!summary) {
    return {
      id: 'more-host-info',
      title: 'MoreHostInfo',
      badges: [{ label: 'pending', tone: 'info' }],
      sections: [{ title: 'Info', rows: [{ label: 'Status', value: 'No data yet' }] }]
    };
  }

  // Add display count badge
  if (summary.hasNoDisplays) {
    badges.push({ label: 'No displays', tone: 'warn' });
  } else {
    badges.push({ label: `${summary.displayCount} displays`, tone: 'info' });
  }

  // Minimal section (the rich visualization is handled by MoreHostInfoView).
  pushSection(sections, 'Overview', [
    { label: 'GPUs', value: String(summary.gpus.length) },
    { label: 'Displays', value: String(summary.displayCount) }
  ]);

  return {
    id: 'more-host-info',
    title: 'MoreHostInfo',
    badges,
    sections,
    data: summary
  };
}

/**
 * Build VmDirectory node
 */
export function buildVmDirectoryNode(summary?: VmDirectorySummary | null): NodeModel {
  const badges: NodeBadge[] = [];
  const sections: NodeSection[] = [];

  if (!summary) {
    return {
      id: 'vm-directory',
      title: 'VmDirectory',
      badges: [{ label: 'pending', tone: 'info' }],
      sections: [{ title: 'Info', rows: [{ label: 'Status', value: 'No data yet' }] }]
    };
  }

  // Add VM count badge
  if (summary.vmCount > 0) {
    badges.push({ label: `${summary.vmCount} VMs`, tone: 'info' });
  } else {
    badges.push({ label: 'No VMs', tone: 'warn' });
  }

  // Build VM rows
  const vmRows: NodeRow[] = summary.vms.length > 0
    ? summary.vms.flatMap((vm, index) => [
        { label: `VM ${index + 1}`, value: vm.name },
        { label: 'Location', value: vm.location },
        { label: 'UUID', value: vm.uuid, type: 'uuid' as const },
        { label: 'Registered', value: vm.registeredOn, type: 'datetime' as const }
      ].filter(r => r.value !== undefined))
    : [{ label: 'No VMs found', badge: { label: 'Empty', variant: 'muted' } }];

  pushSection(sections, 'Virtual Machines', vmRows);

  return {
    id: 'vm-directory',
    title: 'VmDirectory',
    badges,
    sections,
    data: summary
  };
}

// ============================================================================
// Phase 3: Guest & Configuration Node Builders
// ============================================================================

/**
 * Build GuestCommands node
 */
export function buildGuestCommandsNode(summary?: GuestCommandsSummary | null): NodeModel {
  const badges: NodeBadge[] = [];
  const sections: NodeSection[] = [];

  if (!summary) {
    return {
      id: 'guest-commands',
      title: 'GuestCommands',
      badges: [{ label: 'pending', tone: 'info' }],
      sections: [{ title: 'Info', rows: [{ label: 'Status', value: 'No data yet' }] }]
    };
  }

  // Handle Linux VMs
  if (summary.isLinux) {
    return {
      id: 'guest-commands',
      title: 'GuestCommands',
      badges: [{ label: 'Linux', tone: 'info' }],
      sections: [{ title: 'Info', rows: [{ label: 'Status', value: "It's Linux. Look inside." }] }],
      data: summary
    };
  }

  // Handle empty guest commands
  if (summary.isEmpty) {
    badges.push({ label: 'Empty', tone: 'warn' });
  }

  // System section
  const systemRows: NodeRow[] = summary.system
    ? ([
        { label: 'Hostname', value: summary.system.hostname },
        { label: 'Processor count', value: summary.system.processorCount?.toString() },
        { label: 'Architecture', value: summary.system.architecture }
      ].filter((r) => r.value !== undefined))
    : [{ label: 'No system info', badge: { label: 'Empty', variant: 'muted' as const } }];

  pushSection(sections, 'System', systemRows);

  // Network adapters section
  const adapters = summary.network?.adapters ?? [];
  const adapterRows: NodeRow[] = adapters.length > 0
    ? adapters.flatMap((adapter) => [
        { label: 'Adapter', value: adapter.name },
        { label: 'Description', value: adapter.description },
        { label: 'IPv4', value: adapter.ip },
        { label: 'IPv6', value: adapter.ipv6 },
        { label: 'Gateway', value: adapter.gateway },
        { label: 'DHCP', value: adapter.dhcpEnabled === undefined ? undefined : (adapter.dhcpEnabled ? 'Enabled' : 'Disabled') },
        { label: 'DNS', value: adapter.dns?.join(', ') }
      ].filter(r => r.value !== undefined))
    : [{ label: 'No adapters', badge: { label: 'Empty', variant: 'muted' as const } }];

  pushSection(sections, 'Network Adapters', adapterRows);

  // Network drives section
  const drives = summary.network?.drives ?? [];
  const driveRows: NodeRow[] = drives.length > 0
    ? drives.flatMap((drive) => ([
        { label: 'Drive', value: drive.letter ? `${drive.letter}:` : undefined },
        { label: 'Remote', value: drive.remotePath },
        { label: 'Provider', value: drive.provider },
        { label: 'Status', value: drive.status === 'Other' ? (drive.statusRaw ?? 'Other') : drive.status }
      ].filter((r) => r.value !== undefined)))
    : [{ label: 'No network drives', badge: { label: 'Empty', variant: 'muted' as const } }];

  pushSection(sections, 'Network Volumes', driveRows);

  // Processes section (may be large; show a small slice in UI for now)
  const processes = summary.processes ?? [];
  const totals = summary.totals;
  const processesPreview = processes.slice(0, 5);
  const processRows: NodeRow[] = processesPreview.length > 0
    ? [
        ...(totals?.cpuPercent !== undefined || totals?.memoryKb !== undefined
          ? [{
              label: 'Totals',
              value: `${totals?.cpuPercent?.toFixed?.(2) ?? totals?.cpuPercent ?? '?'}% CPU, ${totals?.memoryKb ?? '?'} KB`
            }]
          : []),
        ...processesPreview.map((proc, index) => ({
          label: `${index + 1}.`,
          value: [
            proc.cpuPercent === undefined ? undefined : `${proc.cpuPercent.toFixed(2)}%`,
            proc.memoryKb === undefined ? undefined : `${proc.memoryKb} KB`,
            proc.pid === undefined ? undefined : `pid=${proc.pid}`,
            proc.architecture,
            proc.user,
            proc.path
          ].filter(Boolean).join(' ')
        }))
      ]
    : [{ label: 'No processes', badge: { label: 'Empty', variant: 'muted' as const } }];

  pushSection(sections, 'Processes', processRows);

  const powerRequests = summary.powerRequests ?? [];
  const powerRows: NodeRow[] = powerRequests.length > 0
    ? powerRequests.map((req, index) => ({
        label: `${index + 1}. ${req.type ?? 'Unknown'}`,
        value: [req.requestor, req.path].filter(Boolean).join(' ')
      }))
    : [{ label: 'No power requests', badge: { label: 'Empty', variant: 'muted' as const } }];

  pushSection(sections, 'Power Requests', powerRows);

  return {
    id: 'guest-commands',
    title: 'GuestCommands',
    badges,
    sections,
    data: summary
  };
}

/**
 * Build AppConfig node
 */
export function buildAppConfigNode(summary?: AppConfigSummary | null): NodeModel {
  const badges: NodeBadge[] = [];
  const sections: NodeSection[] = [];

  if (!summary) {
    return {
      id: 'app-config',
      title: 'AppConfig',
      badges: [{ label: 'pending', tone: 'info' }],
      sections: [{ title: 'Info', rows: [{ label: 'Status', value: 'No data yet' }] }]
    };
  }

  // Handle disconnected server case
  if (summary.isUserDefinedOnDisconnectedServer) {
    return {
      id: 'app-config',
      title: 'AppConfig',
      badges: [{ label: 'Disconnected', tone: 'warn' }],
      sections: [{ title: 'Info', rows: [{ label: 'Status', value: 'UserDefinedOnDisconnectedServer' }] }]
    };
  }

  // Add badges
  if (summary.verboseLoggingEnabled) {
    badges.push({ label: 'Verbose logging', tone: 'info' });
  }

  if (summary.hasExternalVmFolder) {
    badges.push({ label: 'External VM folder', tone: 'info' });
  }

  if (summary.usbPermanentAssignments.length > 0) {
    badges.push({ label: 'USB assignments', tone: 'info' });
  }

  // Settings section
  const settingsRows: NodeRow[] = [
    { label: 'Verbose Logging', ...toBadge(summary.verboseLoggingEnabled ? '1' : '0', 'yesNo') }
  ];

  pushSection(sections, 'Settings', settingsRows);

  // Default VM folders
  if (summary.defaultVmFolders.length > 0) {
    const folderRows: NodeRow[] = summary.defaultVmFolders.map(folder => ({
      label: 'Folder',
      value: folder,
      badge: folder.startsWith('/Volumes') ? { label: 'External', variant: 'secondary' as const } : undefined
    }));
    pushSection(sections, 'Default VM Folders', folderRows);
  }

  // USB permanent assignments
  if (summary.usbPermanentAssignments.length > 0) {
    const usbRows: NodeRow[] = summary.usbPermanentAssignments.flatMap(usb => [
      { label: 'Device', value: usb.friendlyName },
      { label: 'ID', value: usb.systemName },
      { label: 'Connect to', value: usb.connectTo }
    ].filter(r => r.value !== undefined));

    pushSection(sections, 'USB Permanent Assignments', usbRows);
  }

  return {
    id: 'app-config',
    title: 'AppConfig',
    badges,
    sections
  };
}

/**
 * Build ClientInfo node
 */
export function buildClientInfoNode(summary?: ClientInfoSummary | null): NodeModel {
  const badges: NodeBadge[] = [];
  const sections: NodeSection[] = [];

  if (!summary) {
    return {
      id: 'client-info',
      title: 'ClientInfo',
      badges: [{ label: 'pending', tone: 'info' }],
      sections: [{ title: 'Info', rows: [{ label: 'Status', value: 'No data yet' }] }]
    };
  }

  // Account section
  if (summary.accountEmail) {
    pushSection(sections, 'Account', [
      { label: 'Email', value: summary.accountEmail }
    ]);
  }

  // PD Preferences
  if (summary.pdPreferences.length > 0) {
    const prefRows: NodeRow[] = summary.pdPreferences.map(pref => ({
      label: pref.name,
      value: pref.value
    }));
    pushSection(sections, 'PD Preferences', prefRows);
  }

  // Shared Apps Preferences
  if (summary.sharedAppsPreferences.length > 0) {
    const sharedAppsRows: NodeRow[] = summary.sharedAppsPreferences.flatMap(vm =>
      vm.preferences.flatMap(pref => [
        { label: 'VM UUID', value: vm.vmUuid, type: 'uuid' as const },
        { label: pref.name, value: pref.value }
      ])
    );
    pushSection(sections, 'Shared Apps Preferences', sharedAppsRows);
  }

  return {
    id: 'client-info',
    title: 'ClientInfo',
    badges,
    sections
  };
}

/**
 * Build ClientProxyInfo node
 */
export function buildClientProxyInfoNode(summary?: ClientProxyInfoSummary | null): NodeModel {
  const badges: NodeBadge[] = [];
  const sections: NodeSection[] = [];

  if (!summary) {
    return {
      id: 'client-proxy-info',
      title: 'ClientProxyInfo',
      badges: [{ label: 'pending', tone: 'info' }],
      sections: [{ title: 'Info', rows: [{ label: 'Status', value: 'No data yet' }] }]
    };
  }

  // Add badge based on proxy status
  if (summary.httpProxyEnabled) {
    badges.push({ label: 'HTTP proxy enabled', tone: 'warn' });
  } else {
    badges.push({ label: 'No proxy', tone: 'info' });
  }

  pushSection(sections, 'Proxy Settings', [
    { label: 'HTTP Proxy', ...toBadge(summary.httpProxyEnabled ? '1' : '0', 'yesNo') }
  ]);

  return {
    id: 'client-proxy-info',
    title: 'ClientProxyInfo',
    badges,
    sections
  };
}

/**
 * Build InstalledSoftware node
 */
export function buildInstalledSoftwareNode(summary?: InstalledSoftwareSummary | null): NodeModel {
  const badges: NodeBadge[] = [];
  const sections: NodeSection[] = [];

  if (!summary) {
    return {
      id: 'installed-software',
      title: 'InstalledSoftware',
      badges: [{ label: 'pending', tone: 'info' }],
      sections: [{ title: 'Info', rows: [{ label: 'Status', value: 'No data yet' }] }]
    };
  }

  // Add app count badge
  badges.push({ label: `${summary.appCount} apps`, tone: 'info' });

  // Build app rows
  const appRows: NodeRow[] = summary.apps.length > 0
    ? summary.apps.map(app => ({
        label: app.name,
        value: app.version
      }))
    : [{ label: 'No apps', badge: { label: 'Empty', variant: 'muted' as const } }];

  pushSection(sections, 'Installed Applications', appRows);

  return {
    id: 'installed-software',
    title: 'InstalledSoftware',
    badges,
    sections
  };
}

//
// ==================== PHASE 4: Logs & Utilities ====================
//

/**
 * Build TimeZone node
 */
export function buildTimeZoneNode(summary?: TimeZoneSummary | null): NodeModel {
  const badges: NodeBadge[] = [];
  const sections: NodeSection[] = [];

  if (!summary) {
    return {
      id: 'timezone',
      title: 'TimeZone',
      badges: [{ label: 'pending', tone: 'info' }],
      sections: [{ title: 'Info', rows: [{ label: 'Status', value: 'No data yet' }] }]
    };
  }

  pushSection(sections, 'Timezone Information', [
    { label: 'Timezone Offset', value: summary.timezoneOffsetStr }
  ]);

  return {
    id: 'timezone',
    title: 'TimeZone',
    badges,
    sections
  };
}

/**
 * Build ToolsLog node
 */
export function buildToolsLogNode(summary?: ToolsLogSummary | null): NodeModel {
  const badges: NodeBadge[] = [];
  const sections: NodeSection[] = [];

  if (!summary) {
    return {
      id: 'tools-log',
      title: 'tools.log',
      badges: [{ label: 'pending', tone: 'info' }],
      sections: [{ title: 'Info', rows: [{ label: 'Status', value: 'No data yet' }] }]
    };
  }

  // Add status badge
  if (!summary.isWindows) {
    badges.push({ label: 'Not Windows', tone: 'info' });
  } else {
    if (summary.status === 'success') {
      badges.push({ label: 'Successful', tone: 'info' });
    } else if (summary.status === 'error') {
      badges.push({ label: 'Failed', tone: 'danger' });
    } else if (summary.status === 'warning') {
      badges.push({ label: 'Warning', tone: 'warn' });
    } else if (summary.status === 'empty') {
      badges.push({ label: 'Empty', tone: 'warn' });
    }
  }

  // Add KB article badges
  if (summary.hasCorruptRegistry) {
    badges.push({ label: 'Corrupt Registry', tone: 'danger' });
  }
  if (summary.hasPrlDdIssue && summary.kbArticle) {
    badges.push({ label: summary.kbArticle, tone: 'danger' });
  }

  // Build installation log rows
  const logRows: NodeRow[] = summary.entries.length > 0
    ? summary.entries.map(entry => ({
        label: entry.timestamp,
        value: entry.message
      }))
    : [{ label: 'No entries', badge: { label: 'Empty', variant: 'muted' as const } }];

  pushSection(sections, 'Installation Log', logRows);

  // Add issues section if there are any
  if (summary.hasCorruptRegistry || summary.hasPrlDdIssue) {
    const issueRows: NodeRow[] = [];
    if (summary.hasCorruptRegistry) {
      issueRows.push({
        label: 'Registry Database',
        badge: { label: 'Corrupt', variant: 'destructive' as const }
      });
    }
    if (summary.hasPrlDdIssue) {
      issueRows.push({
        label: 'prl_dd.inf issue',
        value: summary.kbArticle,
        badge: { label: 'KB125243', variant: 'destructive' as const }
      });
    }
    pushSection(sections, 'Detected Issues', issueRows);
  }

  return {
    id: 'tools-log',
    title: 'tools.log',
    badges,
    sections
  };
}

/**
 * Build ParallelsSystemLog node
 */
export function buildParallelsSystemLogNode(summary?: ParallelsSystemLogSummary | null): NodeModel {
  const badges: NodeBadge[] = [];
  const sections: NodeSection[] = [];

  if (!summary) {
    return {
      id: 'parallels-system-log',
      title: 'parallels-system.log',
      badges: [{ label: 'pending', tone: 'info' }],
      sections: [{ title: 'Info', rows: [{ label: 'Status', value: 'No data yet' }] }]
    };
  }

  // Add Coherence badge
  if (summary.hasCoherenceDump) {
    badges.push({ label: 'Coherence dumps', tone: 'warn' });
  }

  pushSection(sections, 'System Log Analysis', [
    {
      label: 'Coherence State Dumps',
      value: summary.hasCoherenceDump
        ? `${summary.coherenceDumpCount} found`
        : 'None found',
      badge: summary.hasCoherenceDump
        ? { label: 'Present', variant: 'default' as const }
        : { label: 'None', variant: 'outline' as const }
    }
  ]);

  return {
    id: 'parallels-system-log',
    title: 'parallels-system.log',
    badges,
    sections
  };
}

/**
 * Build LaunchdInfo node
 */
export function buildLaunchdInfoNode(summary?: LaunchdInfoSummary | null): NodeModel {
  const badges: NodeBadge[] = [];
  const sections: NodeSection[] = [];

  if (!summary) {
    return {
      id: 'launchd-info',
      title: 'LaunchdInfo',
      badges: [{ label: 'pending', tone: 'info' }],
      sections: [{ title: 'Info', rows: [{ label: 'Status', value: 'No data yet' }] }]
    };
  }

  if (summary.stats) {
    badges.push({ label: `${summary.stats.files} files`, tone: 'info' });
    if (summary.stats.rootOwnedFiles > 0) {
      badges.push({ label: `${summary.stats.rootOwnedFiles} root-owned`, tone: 'warn' });
    }
  }

  pushSection(sections, 'Launchd Daemons & Agents', [
    { label: 'Status', value: summary.tree ? 'Parsed as tree' : 'Parsed as listing' }
  ]);

  return {
    id: 'launchd-info',
    title: 'LaunchdInfo',
    badges,
    sections,
    data: summary
  };
}

/**
 * Build AutoStatisticInfo node
 */
export function buildAutoStatisticInfoNode(summary?: AutoStatisticInfoSummary | null): NodeModel {
  const badges: NodeBadge[] = [];
  const sections: NodeSection[] = [];

  if (!summary) {
    return {
      id: 'auto-statistic-info',
      title: 'AutoStatisticInfo',
      badges: [{ label: 'pending', tone: 'info' }],
      sections: [{ title: 'Info', rows: [{ label: 'Status', value: 'No data yet' }] }]
    };
  }

  // Add installation count badge
  if (summary.installationCount > 0) {
    badges.push({ label: `${summary.installationCount} installations`, tone: 'info' });
  }

  // Build installation rows
  const installRows: NodeRow[] = summary.installations.length > 0
    ? summary.installations.map(install => ({
        label: install.version,
        value: install.date,
        type: 'datetime' as const
      }))
    : [{ label: 'No installations', badge: { label: 'Empty', variant: 'muted' as const } }];

  pushSection(sections, 'PD Installation History', installRows);

  return {
    id: 'auto-statistic-info',
    title: 'AutoStatisticInfo',
    badges,
    sections
  };
}
