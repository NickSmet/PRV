import { parseCurrentVm, type CurrentVmSummary } from '../services/parseCurrentVm';
import { parseGuestOs, type GuestOsSummary } from '../services/parseGuestOs';
import { parseLicenseData, type LicenseDataSummary } from '../services/parseLicenseData';
import { parseNetConfig, type NetConfigSummary } from '../services/parseNetConfig';
import { parseAdvancedVmInfo, type AdvancedVmInfoSummary } from '../services/parseAdvancedVmInfo';
import { parseHostInfo, type HostInfoSummary } from '../services/parseHostInfo';
import { parseLoadedDrivers, type LoadedDriversSummary } from '../services/parseLoadedDrivers';
import { parseMountInfo, type MountInfoSummary } from '../services/parseMountInfo';
import { parseAllProcesses, type AllProcessesSummary } from '../services/parseAllProcesses';
import { parseMoreHostInfo, type MoreHostInfoSummary } from '../services/parseMoreHostInfo';
import { parseVmDirectory, type VmDirectorySummary } from '../services/parseVmDirectory';
import { parseGuestCommands, type GuestCommandsSummary } from '../services/parseGuestCommands';
import { parseAppConfig, type AppConfigSummary } from '../services/parseAppConfig';
import { parseClientInfo, type ClientInfoSummary } from '../services/parseClientInfo';
import { parseClientProxyInfo, type ClientProxyInfoSummary } from '../services/parseClientProxyInfo';
import { parseInstalledSoftware, type InstalledSoftwareSummary } from '../services/parseInstalledSoftware';
// Phase 4 imports
import { parseTimeZone, type TimeZoneSummary } from '../services/parseTimeZone';
import { parseToolsLog, type ToolsLogSummary } from '../services/parseToolsLog';
import { parseParallelsSystemLog, type ParallelsSystemLogSummary } from '../services/parseParallelsSystemLog';
import { parseLaunchdInfo, type LaunchdInfoSummary } from '../services/parseLaunchdInfo';
import { parseAutoStatisticInfo, type AutoStatisticInfoSummary } from '../services/parseAutoStatisticInfo';
import type { Marker } from './types/markers';
import type { ReportModel } from './types/report';
import { deriveCurrentVmFields, createEmptyReportModel } from './types/report';
import { evaluateCurrentVmRules } from './rules';
import { getNodeLevelMarkers, severityToVariant } from './types/markers';

export interface NodeBadge {
  label: string;
  tone?: 'info' | 'warn' | 'danger';
  iconKey?: 'hdd' | 'net' | 'travel' | 'vm' | 'warn';
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
  iconKey?: 'hdd' | 'net' | 'travel' | 'vm' | 'warn';
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
}

const maps = {
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

export function buildCurrentVmNode(rawXml?: string): NodeModel {
  if (!rawXml) {
    console.warn('[PRV] buildCurrentVmNode called without XML');
  }

  const summary: CurrentVmSummary | null = rawXml ? parseCurrentVm(rawXml) : null;
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
        return [
          { label: 'Location', value: disk.location, type: 'path' as const } as NodeRow,
          { label: 'Virtual Size', value: disk.virtualSize } as NodeRow,
          { label: 'Actual Size', value: disk.actualSize } as NodeRow,
          { label: 'Interface', value: disk.interfaceType } as NodeRow,
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
export function buildCurrentVmNodeWithMarkers(
  rawXml?: string,
  hostRamMb?: number
): { node: NodeModel; markers: Marker[] } {
  // Build the base node (without legacy badges - we'll use markers instead)
  const node = buildCurrentVmNode(rawXml);
  
  // If no XML, return empty markers
  if (!rawXml) {
    return { node, markers: [] };
  }
  
  // Parse and derive fields for rule evaluation
  const summary = parseCurrentVm(rawXml);
  if (!summary) {
    return { node, markers: [] };
  }
  
  const currentVmModel = deriveCurrentVmFields(summary);
  
  // Build report model for rule evaluation
  const report: ReportModel = {
    ...createEmptyReportModel(),
    currentVm: currentVmModel,
    host: hostRamMb ? { ramMb: hostRamMb } : {}
  };
  
  // Evaluate rules to get markers
  const markers = evaluateCurrentVmRules(report);
  
  // Convert node-level markers to badges for the node model
  const nodeLevelMarkers = getNodeLevelMarkers(markers, 'current-vm');
  const markerBadges: NodeBadge[] = nodeLevelMarkers.map((m) => ({
    label: m.label,
    tone: m.severity === 'danger' ? 'danger' : m.severity === 'warn' ? 'warn' : 'info',
    iconKey: m.iconKey as NodeBadge['iconKey']
  }));
  
  // Replace legacy badges with marker-based badges
  const nodeWithMarkerBadges: NodeModel = {
    ...node,
    badges: markerBadges
  };
  
  return { node: nodeWithMarkerBadges, markers };
}

/**
 * Get markers for a specific sub-section from a markers array
 */
export function getSubSectionMarkers(
  markers: Marker[],
  nodeId: string,
  sectionTitle: string,
  subSectionId: string
): Marker[] {
  return markers.filter((m) => {
    if (m.target.type !== 'subSection') return false;
    return (
      m.target.nodeId === nodeId &&
      m.target.sectionTitle === sectionTitle &&
      m.target.subSectionId === subSectionId
    );
  });
}

/**
 * Convert a marker's severity to a badge variant string
 */
export function markerSeverityToVariant(
  severity: Marker['severity']
): 'default' | 'secondary' | 'destructive' | 'outline' | 'success' {
  return severityToVariant(severity);
}

// ============================================================================
// Phase 1: New Node Builders
// ============================================================================

/**
 * Build GuestOs node
 */
export function buildGuestOsNode(rawXml?: string): NodeModel {
  const summary = rawXml ? parseGuestOs(rawXml) : null;
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

  pushSection(sections, 'Guest OS', [
    { label: 'Type', value: summary.type },
    { label: 'Version', value: summary.version },
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
export function buildLicenseDataNode(jsonData?: string): NodeModel {
  const summary = jsonData ? parseLicenseData(jsonData) : null;
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
export function buildNetConfigNode(rawXml?: string, hostOsMajor?: number): NodeModel {
  const summary = rawXml ? parseNetConfig(rawXml, hostOsMajor) : null;
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
  const networkRows: NodeRow[] = summary.networks.flatMap((net, index) => [
    { label: `Network ${index + 1}`, value: net.name },
    { label: 'DHCP IP', value: net.dhcpIp },
    { label: 'Net Mask', value: net.netMask },
    { label: 'Host IP', value: net.hostIp },
    { label: 'DHCP Enabled', ...toBadge(net.dhcpEnabled, 'yesNo') },
    { label: 'IPv6 DHCP Enabled', ...toBadge(net.dhcpV6Enabled, 'yesNo') }
  ].filter(r => r.value !== undefined || r.badge !== undefined));

  pushSection(sections, 'Virtual Networks', networkRows);

  return {
    id: 'net-config',
    title: 'NetConfig',
    badges,
    sections
  };
}

/**
 * Build AdvancedVmInfo node
 */
export function buildAdvancedVmInfoNode(
  rawData?: string,
  isBootCamp?: boolean,
  guestOsType?: string,
  productName?: string
): NodeModel {
  const summary = rawData ? parseAdvancedVmInfo(rawData, isBootCamp, guestOsType, productName) : null;
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

  // PVM Bundle contents (if available)
  if (summary.pvmBundleContents && summary.pvmBundleContents.length > 10) {
    pushSection(sections, 'PVM Bundle', [
      { label: 'Contents', value: summary.pvmBundleContents }
    ]);
  }

  return {
    id: 'advanced-vm-info',
    title: 'AdvancedVmInfo',
    badges,
    sections
  };
}

/**
 * Build HostInfo node
 */
export function buildHostInfoNode(rawXml?: string): NodeModel {
  const summary = rawXml ? parseHostInfo(rawXml) : null;
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

  // Add DisplayLink badge if detected
  if (summary.hasDisplayLink) {
    badges.push({ label: 'DisplayLink', tone: 'warn' });
  }

  const hardwareSubSections: NodeSubSection[] = [];

  // USB Devices
  const usbRows: NodeRow[] = summary.usbDevices.length
    ? summary.usbDevices.map((usb, index) => ({
        label: usb.name || `USB Device ${index + 1}`,
        value: usb.uuid,
        iconKey: 'usb',
        type: 'uuid' as const
      }))
    : [{ label: 'No USB devices', badge: { label: 'Empty', variant: 'muted' } }];
  hardwareSubSections.push({
    id: 'usb-devices',
    title: 'USB Devices',
    iconKey: 'usb',
    rows: usbRows
  });

  // Hard Disks
  const hddRows: NodeRow[] = summary.hardDisks.length
    ? summary.hardDisks.flatMap((hdd, index) => [
        { label: hdd.name || `Disk ${index + 1}`, value: hdd.size, iconKey: 'hdd' },
        { label: 'UUID', value: hdd.uuid, type: 'uuid' as const }
      ].filter(r => r.value !== undefined))
    : [{ label: 'No hard disks', badge: { label: 'Empty', variant: 'muted' } }];
  hardwareSubSections.push({
    id: 'hard-disks',
    title: 'Hard Disks',
    iconKey: 'hdd',
    rows: hddRows
  });

  // Network Adapters
  const netRows: NodeRow[] = summary.networkAdapters.length
    ? summary.networkAdapters.flatMap((net, index) => [
        { label: net.name || `Adapter ${index + 1}`, iconKey: 'net' },
        { label: 'MAC', value: net.mac },
        { label: 'IP', value: net.ip },
        { label: 'UUID', value: net.uuid, type: 'uuid' as const }
      ].filter(r => r.value !== undefined))
    : [{ label: 'No network adapters', badge: { label: 'Empty', variant: 'muted' } }];
  hardwareSubSections.push({
    id: 'network-adapters',
    title: 'Network Adapters',
    iconKey: 'net',
    rows: netRows
  });

  // Cameras
  const cameraRows: NodeRow[] = summary.cameras.length
    ? summary.cameras.map((cam, index) => ({
        label: cam.name || `Camera ${index + 1}`,
        value: cam.uuid,
        type: 'uuid' as const
      }))
    : [{ label: 'No cameras', badge: { label: 'Empty', variant: 'muted' } }];
  hardwareSubSections.push({
    id: 'cameras',
    title: 'Cameras',
    rows: cameraRows
  });

  // Input Devices
  const inputRows: NodeRow[] = summary.inputDevices.length
    ? summary.inputDevices.map((input, index) => ({
        label: input.name || `Input Device ${index + 1}`,
        value: input.uuid,
        type: 'uuid' as const
      }))
    : [{ label: 'No input devices', badge: { label: 'Empty', variant: 'muted' } }];
  hardwareSubSections.push({
    id: 'input-devices',
    title: 'Input Devices',
    rows: inputRows
  });

  // Printers
  const printerRows: NodeRow[] = summary.printers.length
    ? summary.printers.map((printer, index) => ({
        label: printer.name || `Printer ${index + 1}`,
        value: printer.uuid,
        iconKey: 'printer',
        type: 'uuid' as const
      }))
    : [{ label: 'No printers', badge: { label: 'Empty', variant: 'muted' } }];
  hardwareSubSections.push({
    id: 'printers',
    title: 'Printers',
    iconKey: 'printer',
    rows: printerRows
  });

  // CCIDs
  const ccidRows: NodeRow[] = summary.ccids.length
    ? summary.ccids.map((ccid, index) => ({
        label: ccid.name || `CCID ${index + 1}`,
        value: ccid.uuid,
        type: 'uuid' as const
      }))
    : [{ label: 'No CCIDs', badge: { label: 'Empty', variant: 'muted' } }];
  hardwareSubSections.push({
    id: 'ccids',
    title: 'Smart Card Readers',
    rows: ccidRows
  });

  pushSection(sections, 'Host Devices', [], {
    subSections: hardwareSubSections
  });

  return {
    id: 'host-info',
    title: 'HostInfo',
    badges,
    sections
  };
}

// ============================================================================
// Phase 2: System Diagnostics Node Builders
// ============================================================================

/**
 * Build LoadedDrivers node
 */
export function buildLoadedDriversNode(
  textData?: string,
  cpuModel?: string,
  hostOsMajor?: number
): NodeModel {
  const summary = textData ? parseLoadedDrivers(textData, cpuModel, hostOsMajor) : null;
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
export function buildMountInfoNode(textData?: string): NodeModel {
  const summary = textData ? parseMountInfo(textData) : null;
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

  // Build volume rows
  const volumeRows: NodeRow[] = summary.volumes.flatMap(vol => [
    { label: 'Device', value: vol.identifier },
    { label: 'Mounted on', value: vol.mountedOn },
    { label: 'Size', value: vol.size },
    { label: 'Free', value: vol.free },
    { label: 'Capacity', value: vol.capacityStr,
      badge: vol.capacity > 99 ? { label: 'Critical', variant: 'destructive' as const } :
             vol.capacity > 90 ? { label: 'Warning', variant: 'destructive' as const } : undefined },
    { label: 'Filesystem', value: vol.filesystem,
      badge: vol.isNtfs ? { label: 'NTFS', variant: 'secondary' as const } : undefined }
  ].filter(r => r.value !== undefined || r.badge !== undefined));

  pushSection(sections, 'Mounted Volumes', volumeRows);

  return {
    id: 'mount-info',
    title: 'MountInfo',
    badges,
    sections
  };
}

/**
 * Build AllProcesses node
 */
export function buildAllProcessesNode(textData?: string): NodeModel {
  const summary = textData ? parseAllProcesses(textData) : null;
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

  // Running applications
  const appRows: NodeRow[] = summary.runningApps.length > 0
    ? summary.runningApps.map(app => ({ label: app, value: 'Running' }))
    : [{ label: 'No apps detected', badge: { label: 'Empty', variant: 'muted' } }];

  pushSection(sections, 'Running Applications', appRows);

  return {
    id: 'all-processes',
    title: 'AllProcesses',
    badges,
    sections
  };
}

/**
 * Build MoreHostInfo node
 */
export function buildMoreHostInfoNode(xmlData?: string): NodeModel {
  const summary = xmlData ? parseMoreHostInfo(xmlData) : null;
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

  // Build GPU subsections
  const gpuSubSections: NodeSubSection[] = summary.gpus.map((gpu, index) => {
    const displayRows: NodeRow[] = gpu.displays.length > 0
      ? gpu.displays.flatMap(display => [
          { label: 'Display', value: display.name },
          { label: 'Physical', value: display.physicalResolution },
          { label: 'Logical', value: display.logicalResolution }
        ].filter(r => r.value !== undefined))
      : [{ label: 'No displays', badge: { label: 'Empty', variant: 'muted' } }];

    return {
      id: `gpu-${index}`,
      title: gpu.name,
      rows: displayRows
    };
  });

  if (gpuSubSections.length > 0) {
    pushSection(sections, 'GPUs & Displays', [], { subSections: gpuSubSections });
  } else {
    pushSection(sections, 'GPUs & Displays', [
      { label: 'Status', value: 'No GPU information available' }
    ]);
  }

  return {
    id: 'more-host-info',
    title: 'MoreHostInfo',
    badges,
    sections
  };
}

/**
 * Build VmDirectory node
 */
export function buildVmDirectoryNode(xmlData?: string): NodeModel {
  const summary = xmlData ? parseVmDirectory(xmlData) : null;
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
    sections
  };
}

// ============================================================================
// Phase 3: Guest & Configuration Node Builders
// ============================================================================

/**
 * Build GuestCommands node
 */
export function buildGuestCommandsNode(jsonData?: string, guestOsType?: string): NodeModel {
  const summary = jsonData ? parseGuestCommands(jsonData, guestOsType) : null;
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
      sections: [{ title: 'Info', rows: [{ label: 'Status', value: "It's Linux. Look inside." }] }]
    };
  }

  // Handle empty guest commands
  if (summary.isEmpty) {
    badges.push({ label: 'Empty', tone: 'warn' });
  }

  // Network adapters section
  const adapterRows: NodeRow[] = summary.networkAdapters.length > 0
    ? summary.networkAdapters.flatMap(adapter => [
        { label: 'Adapter', value: adapter.name },
        { label: 'Descriptor', value: adapter.descriptor },
        { label: 'IP', value: adapter.ip }
      ].filter(r => r.value !== undefined))
    : [{ label: 'No adapters', badge: { label: 'Empty', variant: 'muted' as const } }];

  pushSection(sections, 'Network Adapters', adapterRows);

  // Network drives section
  const driveRows: NodeRow[] = summary.networkDrives.length > 0
    ? summary.networkDrives.map(drive => ({ label: 'Drive', value: drive }))
    : [{ label: 'No network drives', badge: { label: 'Empty', variant: 'muted' as const } }];

  pushSection(sections, 'Network Volumes', driveRows);

  // Top processes section
  const processRows: NodeRow[] = summary.topProcesses.length > 0
    ? summary.topProcesses.map((proc, index) => ({ label: `${index + 1}.`, value: proc }))
    : [{ label: 'No processes', badge: { label: 'Empty', variant: 'muted' as const } }];

  pushSection(sections, 'Top Processes', processRows);

  return {
    id: 'guest-commands',
    title: 'GuestCommands',
    badges,
    sections
  };
}

/**
 * Build AppConfig node
 */
export function buildAppConfigNode(xmlData?: string): NodeModel {
  const summary = xmlData ? parseAppConfig(xmlData) : null;
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
export function buildClientInfoNode(textData?: string): NodeModel {
  const summary = textData ? parseClientInfo(textData) : null;
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
export function buildClientProxyInfoNode(textData?: string): NodeModel {
  const summary = textData ? parseClientProxyInfo(textData) : null;
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
export function buildInstalledSoftwareNode(textData?: string): NodeModel {
  const summary = textData ? parseInstalledSoftware(textData) : null;
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
export function buildTimeZoneNode(xmlData?: string): NodeModel {
  const summary = xmlData ? parseTimeZone(xmlData) : null;
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
export function buildToolsLogNode(textData?: string, guestOsType?: string): NodeModel {
  const summary = textData ? parseToolsLog(textData, guestOsType) : null;
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
export function buildParallelsSystemLogNode(textData?: string): NodeModel {
  const summary = textData ? parseParallelsSystemLog(textData) : null;
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
export function buildLaunchdInfoNode(textData?: string): NodeModel {
  const summary = textData ? parseLaunchdInfo(textData) : null;
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

  pushSection(sections, 'Launchd Daemons & Agents', [
    { label: 'File Listing', value: summary.formattedListing }
  ]);

  return {
    id: 'launchd-info',
    title: 'LaunchdInfo',
    badges,
    sections
  };
}

/**
 * Build AutoStatisticInfo node
 */
export function buildAutoStatisticInfoNode(xmlData?: string): NodeModel {
  const summary = xmlData ? parseAutoStatisticInfo(xmlData) : null;
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
