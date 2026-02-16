const reportusParserIconsBase = '/reportus-parser-icons/';
const builtinsBase = '/icons/';

function iconUrl(base: string, filename: string): string {
  return `${base}${filename}`;
}

export const builtinSectionIcons = {
  hostApple: iconUrl(reportusParserIconsBase, 'OS_Apple.webp'),
  parallels: iconUrl(builtinsBase, 'parallels.ico'),
  vm: iconUrl(builtinsBase, 'parallels.ico')
} as const;

export const reportusParserIcons = {
  coherence: iconUrl(reportusParserIconsBase, 'coherence.png'),
  macvm: iconUrl(reportusParserIconsBase, 'macvm.png'),
  legacyBios: iconUrl(reportusParserIconsBase, 'legacyBios.png'),
  rollbackMode: iconUrl(reportusParserIconsBase, '121571351-9230ac80-ca2b-11eb-91e7-bd75ea4f6ae4.png'),
  adapterNotConnected: iconUrl(reportusParserIconsBase, '2183366.png'),
  noNetwork: iconUrl(reportusParserIconsBase, '2313811.png'),
  apipa: iconUrl(reportusParserIconsBase, '2333550.png'),
  'Low storage': iconUrl(reportusParserIconsBase, 'lowStorage.png'),
  'DisplayLink device!': iconUrl(reportusParserIconsBase, '3273973.png'),
  onedrive: iconUrl(reportusParserIconsBase, '2335410.png'),
  'network folder': iconUrl(reportusParserIconsBase, '1930805.png'),
  usb: iconUrl(reportusParserIconsBase, 'usb.png'),
  keyboard: iconUrl(reportusParserIconsBase, '2293934.png'),
  mouse: iconUrl(reportusParserIconsBase, '2817912.png'),
  printers: iconUrl(reportusParserIconsBase, 'printer.png'),
  'all good': iconUrl(reportusParserIconsBase, '1828520.png'),
  warning: iconUrl(reportusParserIconsBase, 'warning.png'),
  'serious warning': iconUrl(reportusParserIconsBase, '1200px-OOjs_UI_icon_alert-warning.svg.png'),
  bad: iconUrl(reportusParserIconsBase, 'bad.png'),
  headless: iconUrl(reportusParserIconsBase, '1089503.png'),
  'not headless': iconUrl(reportusParserIconsBase, '3653500.png'),
  isolated: iconUrl(reportusParserIconsBase, '859521.png'),
  flags: iconUrl(reportusParserIconsBase, '2966844.png'),
  nosnapshots: iconUrl(reportusParserIconsBase, 'snapshot.png'),
  snapshots: iconUrl(reportusParserIconsBase, 'snapshot.png'),
  screens: iconUrl(reportusParserIconsBase, '96313515-5cf7ca00-1016-11eb-87d7-4eb1784e6eab.png'),
  vms: iconUrl(reportusParserIconsBase, '1503641514_parallels.png'),
  vpn: iconUrl(reportusParserIconsBase, '1451546.png'),
  'external drive': iconUrl(reportusParserIconsBase, '3796075.png'),
  'copied vm': iconUrl(reportusParserIconsBase, '3512155.png'),
  AppleHV: iconUrl(reportusParserIconsBase, 'OS_Apple.webp'),
  Nested: iconUrl(reportusParserIconsBase, '5201125.png'),
  splitted: iconUrl(reportusParserIconsBase, '1443588.png'),
  trim: iconUrl(reportusParserIconsBase, 'unnamed.png'),
  webcam: iconUrl(reportusParserIconsBase, '179879.png'),
  gpu: iconUrl(reportusParserIconsBase, 'gpu2.png'),
  ACL: iconUrl(reportusParserIconsBase, 'security_denied.png'),
  fullscreen: iconUrl(reportusParserIconsBase, '6504020.png'),
  noTimeSync: iconUrl(reportusParserIconsBase, '5123714.png'),
  hdds: iconUrl(reportusParserIconsBase, 'hdd.png'),
  cd: iconUrl(reportusParserIconsBase, '2606574.png'),
  networkAdapter: iconUrl(reportusParserIconsBase, 'networkAdapter.png'),
  TPM: iconUrl(reportusParserIconsBase, '3125811.png'),
  'network conditioner fullspeed': iconUrl(reportusParserIconsBase, 'data-funnel-icon-5.jpg'),
  'network conditioner limited': iconUrl(reportusParserIconsBase, '118004041-c728e100-b351-11eb-9018-516a78e18a28.png'),
  'plain vHDD': iconUrl(reportusParserIconsBase, '4528584.png'),
  'external vHDD': iconUrl(reportusParserIconsBase, 'External-Drive-Red-icon.png'),
  'linked clone': iconUrl(reportusParserIconsBase, '3634746.png'),
  'smart guard': iconUrl(reportusParserIconsBase, '595-5952790_download-svg-download-png-shield-icon-png.png'),
  'Boot Camp': iconUrl(reportusParserIconsBase, '96314275-97616700-1016-11eb-9990-8b2e92d49052.png'),
  'root or unknown owner': iconUrl(reportusParserIconsBase, '100492918-868e3000-3142-11eb-9ee6-44826cd637c7.png'),
  'resource quota': iconUrl(reportusParserIconsBase, '4643333.png'),
  pirated: iconUrl(reportusParserIconsBase, '972564.png'),
  kext: iconUrl(reportusParserIconsBase, '1978024.png'),
  kextless: iconUrl(reportusParserIconsBase, '2238506.png'),
  pvm: iconUrl(reportusParserIconsBase, 'pvm.png'),
  shared: iconUrl(reportusParserIconsBase, '5693296.png'),
  bridged: iconUrl(reportusParserIconsBase, 'ethernet.png'),
  install: iconUrl(reportusParserIconsBase, '2756717-200.png'),
  service: iconUrl(reportusParserIconsBase, '71d177d628bca6aff2813176cba0c18f.png'),
  apps: iconUrl(reportusParserIconsBase, '4562583.png'),
  installedApps: iconUrl(reportusParserIconsBase, 'Applications-Folder-Blue-icon.png'),
  hotcpu: iconUrl(reportusParserIconsBase, '2499379.png'),
  docSearch: iconUrl(reportusParserIconsBase, '3126554.png'),
  'External Default VM folder': iconUrl(reportusParserIconsBase, '3637372.png'),
  'not PvmDefault': iconUrl(reportusParserIconsBase, '983874.png'),
  travelMode: iconUrl(reportusParserIconsBase, '121824353-5ceabf80-ccb4-11eb-9120-b5cbd15e31e9.png'),
  inputDevice: iconUrl(reportusParserIconsBase, 'input.png'),
  CCID: iconUrl(reportusParserIconsBase, 'CCID.png')
} as const;

export type ReportusParserIconKey = keyof typeof reportusParserIcons;

// Map `iconKey` strings → colorful legacy icon URLs.
// All reportus parser icons are available directly by their key.
// Legacy aliases (e.g. 'hdd' → hdds icon) are kept for backwards compat.
export const iconUrlByIconKey: Record<string, string> = {
  // All reportus parser icons (identity mappings)
  ...reportusParserIcons,

  // Legacy aliases from viewmodel/nodeBuilder
  vm: reportusParserIcons.vms,
  monitor: reportusParserIcons.gpu,
  hdd: reportusParserIcons.hdds,
  printer: reportusParserIcons.printers,
  warn: reportusParserIcons.warning,
  net: reportusParserIcons.networkAdapter
};
