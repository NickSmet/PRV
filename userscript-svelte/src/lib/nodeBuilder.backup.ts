import { parseCurrentVm, type CurrentVmSummary } from '../services/parseCurrentVm';

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
    variant: 'default' | 'secondary' | 'outline' | 'muted' | 'success';
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
      openByDefault: true
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
    { label: 'PVM Location', value: summary.vmHome, type: 'path' },
    { label: 'Creation Date', value: summary.creationDate, type: 'datetime' },
    { label: 'VM UUID', value: summary.vmUuid, type: 'uuid' },
    { label: 'Source UUID', value: summary.sourceVmUuid, type: 'uuid' }
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
      { label: 'Type', value: adapter.adapterType, iconKey: 'net' },
      { label: 'Connected', ...toBadge(adapter.connected, 'yesNo') },
      { label: 'Mode', value: adapter.mode },
      { label: 'Adapter name', value: adapter.adapterName },
      { label: 'Mac', value: adapter.mac },
      { label: 'Conditioner', ...toBadge(adapter.conditionerEnabled, 'enabled') }
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
          { label: 'Location', value: disk.location, type: 'path' },
          { label: 'Virtual Size', value: disk.virtualSize },
          { label: 'Actual Size', value: disk.actualSize },
          { label: 'Interface', value: disk.interfaceType },
          { label: 'Splitted', ...toBadge(disk.splitted === '0' ? '0' : '1', 'yesNo') },
          { label: 'Trim', ...toBadge(disk.trim, 'enabled') },
          { label: 'Expanding', ...toBadge(disk.expanding, 'yesNo') }
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
        { label: 'Location', value: cd.location, type: 'path' },
        { label: 'Interface', value: cd.interfaceType }
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
            type: 'datetime'
          }
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

  if (summary.travelMode?.state === '1') badges.push({ label: 'Travel Mode', tone: 'warn', iconKey: 'travel' });
  if (summary.macVm) badges.push({ label: 'Mac VM', tone: 'info', iconKey: 'vm' });
  if (!summary.hdds?.length) badges.push({ label: 'No HDD', tone: 'danger', iconKey: 'hdd' });
  if (summary.netAdapters?.some((n) => n.connected === '0')) badges.push({ label: 'NIC offline', tone: 'warn', iconKey: 'net' });

  return {
    id: 'current-vm',
    title: 'CurrentVm',
    badges,
    sections,
    openByDefault: true
  };
}
