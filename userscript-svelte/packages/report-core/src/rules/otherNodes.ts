/**
 * Non-CurrentVm Rules
 *
 * These rules replicate legacy "markBullet" heuristics for other nodes, but in a
 * sustainable format: pure rules over the canonical `ReportModel`.
 *
 * Note: Many of these indicators are also represented as `NodeModel.badges` in
 * `@prv/report-viewmodel`. Keeping them as rules ensures they remain available
 * to non-UI surfaces (e.g. MCP/AI shaping) without duplicating parsing.
 */

import type { Rule } from './types';
import { createNodeMarker } from '../types/markers';

const LICENSE_NODE = 'license-data';
const NETCONFIG_NODE = 'net-config';
const ADV_NODE = 'advanced-vm-info';
const HOST_NODE = 'host-info';
const MORE_HOST_NODE = 'more-host-info';
const DRIVERS_NODE = 'loaded-drivers';
const STORAGE_NODE = 'mount-info';
const PROCESSES_NODE = 'all-processes';
const PROXY_NODE = 'client-proxy-info';
const TOOLS_NODE = 'tools-log';
const SYSLOG_NODE = 'parallels-system-log';
const VMDIR_NODE = 'vm-directory';
const GUEST_COMMANDS_NODE = 'guest-commands';
const APP_CONFIG_NODE = 'app-config';
const INSTALLED_SOFTWARE_NODE = 'installed-software';
const LAUNCHD_NODE = 'launchd-info';
const AUTOSTAT_NODE = 'auto-statistic-info';

const licenseRules: Rule[] = [
  (report) => {
    if (report.license?.isPirated) {
      return [
        createNodeMarker('license.pirated', LICENSE_NODE, 'danger', 'Pirated', {
          tooltip: 'License expiration is far in the future (suspicious / likely pirated)',
          iconKey: 'pirated'
        })
      ];
    }
    return [];
  }
];

const netConfigRules: Rule[] = [
  (report) => {
    const s = report.network;
    if (!s) return [];
    const out = [];

    if (s.kextlessMode === 'kextless') {
      out.push(
        createNodeMarker('netconfig.kextless', NETCONFIG_NODE, 'info', 'Kextless', {
          tooltip: 'Virtual networking is running in kextless mode',
          iconKey: 'kextless'
        })
      );
    } else if (s.kextlessMode === 'kext') {
      out.push(
        createNodeMarker('netconfig.kext', NETCONFIG_NODE, 'info', 'Kext', {
          tooltip: 'Virtual networking uses kernel extensions',
          iconKey: 'kext'
        })
      );
    }

    if (!s.hasSharedNetwork || !s.hasHostOnlyNetwork) {
      out.push(
        createNodeMarker('netconfig.network-missing', NETCONFIG_NODE, 'warn', 'Network missing', {
          tooltip: 'Shared or Host-Only virtual network is missing',
          iconKey: 'warning'
        })
      );
    }

    return out;
  }
];

const clientProxyRules: Rule[] = [
  (report) => {
    const s = report.proxy;
    if (!s) return [];
    if (s.httpProxyEnabled) {
      return [
        createNodeMarker('proxy.http-enabled', PROXY_NODE, 'warn', 'HTTP proxy enabled', {
          tooltip: 'HTTP proxy is enabled in client settings',
          iconKey: 'vpn'
        })
      ];
    }
    return [
      createNodeMarker('proxy.none', PROXY_NODE, 'info', 'No proxy', {
        tooltip: 'No HTTP proxy detected in client settings',
        iconKey: 'networkAdapter'
      })
    ];
  }
];

const advancedVmInfoRules: Rule[] = [
  (report) => {
    const s = report.advancedVm;
    if (!s) return [];
    const out = [];

    if (s.snapshotCount === 0) out.push(createNodeMarker('adv.no-snapshots', ADV_NODE, 'info', 'No snapshots', { iconKey: 'nosnapshots' }));
    if ((s.snapshotCount ?? 0) > 0) out.push(createNodeMarker('adv.snapshots', ADV_NODE, 'info', `${s.snapshotCount} snapshots`, { iconKey: 'snapshots' }));
    if (s.hasAclIssues) out.push(createNodeMarker('adv.acl', ADV_NODE, 'warn', 'ACL issues', { iconKey: 'ACL' }));
    if (s.hasRootOwner) out.push(createNodeMarker('adv.root-owner', ADV_NODE, 'warn', 'Root owner', { iconKey: 'root or unknown owner' }));
    if (s.hasDeleteSnapshotOp) out.push(createNodeMarker('adv.delete-snapshot', ADV_NODE, 'danger', 'Delete snapshot op', { iconKey: 'bad' }));
    if (s.mainSnapshotMissing) out.push(createNodeMarker('adv.main-snapshot-missing', ADV_NODE, 'danger', 'Main snapshot missing', { iconKey: 'bad' }));

    return out;
  }
];

const hostInfoRules: Rule[] = [
  (report) => {
    const s = report.hostDevices;
    if (!s) return [];
    const out = [];

    if (s.flags.lowMemory) out.push(createNodeMarker('host.low-memory', HOST_NODE, 'warn', 'High memory usage', { iconKey: 'warning' }));
    if (s.flags.privacyRestricted) out.push(createNodeMarker('host.privacy', HOST_NODE, 'warn', 'Privacy restricted', { iconKey: 'isolated' }));
    if (s.hasDisplayLink) out.push(createNodeMarker('host.displaylink', HOST_NODE, 'warn', 'DisplayLink', { iconKey: 'DisplayLink device!' }));
    if (s.flags.hasExternalDisks) out.push(createNodeMarker('host.external-disk', HOST_NODE, 'info', 'External disk', { iconKey: 'external drive' }));
    if (s.flags.hasUsbCamera) out.push(createNodeMarker('host.usb-camera', HOST_NODE, 'info', 'USB camera', { iconKey: 'webcam' }));
    if (s.flags.hasBluetoothAudio) out.push(createNodeMarker('host.bt-audio', HOST_NODE, 'info', 'BT audio'));

    return out;
  }
];

const moreHostInfoRules: Rule[] = [
  (report) => {
    const s = report.moreHostInfo;
    if (!s) return [];
    if (s.hasNoDisplays) {
      return [createNodeMarker('morehost.no-displays', MORE_HOST_NODE, 'warn', 'No displays', { iconKey: 'screens' })];
    }
    return [createNodeMarker('morehost.displays', MORE_HOST_NODE, 'info', `${s.displayCount} displays`, { iconKey: 'screens' })];
  }
];

const loadedDriversRules: Rule[] = [
  (report) => {
    const s = report.drivers;
    if (!s) return [];
    const out = [];

    if (s.isHackintosh) out.push(createNodeMarker('drivers.hackintosh', DRIVERS_NODE, 'danger', 'Hackintosh', { iconKey: 'bad' }));
    if (s.hasNonAppleKexts && !s.hasPrlKexts && !s.isHackintosh) out.push(createNodeMarker('drivers.no-prl', DRIVERS_NODE, 'warn', 'No PRL kexts', { iconKey: 'kext' }));
    if (s.onlyApple) out.push(createNodeMarker('drivers.only-apple', DRIVERS_NODE, 'info', 'Only Apple', { iconKey: 'all good' }));
    if (s.hasNonAppleKexts && !s.onlyApple && !s.isHackintosh) out.push(createNodeMarker('drivers.non-apple', DRIVERS_NODE, 'warn', 'Non-Apple kexts', { iconKey: 'kext' }));

    return out;
  }
];

const mountInfoRules: Rule[] = [
  (report) => {
    const s = report.storage;
    if (!s) return [];
    const out = [];
    if (s.hddFull) out.push(createNodeMarker('storage.full', STORAGE_NODE, 'danger', 'HDD FULL!', { iconKey: 'bad' }));
    if (!s.hddFull && s.lowStorage) out.push(createNodeMarker('storage.low', STORAGE_NODE, 'warn', 'Low storage', { iconKey: 'Low storage' }));
    if (s.hasNtfsVolumes) out.push(createNodeMarker('storage.ntfs', STORAGE_NODE, 'info', 'NTFS detected', { iconKey: 'hdds' }));
    return out;
  }
];

const allProcessesRules: Rule[] = [
  (report) => {
    const s = report.processes;
    if (!s) return [];
    if (s.hasBsdtarIssue) {
      return [
        createNodeMarker('processes.bsdtar', PROCESSES_NODE, 'danger', 'bsdtar', {
          tooltip: 'Known bsdtar issue detected in process list',
          iconKey: 'bad'
        })
      ];
    }
    return [];
  }
];

const toolsLogRules: Rule[] = [
  (report) => {
    const s = report.toolsLog;
    if (!s) return [];
    const out = [];

    if (!s.isWindows) out.push(createNodeMarker('tools.not-windows', TOOLS_NODE, 'info', 'Not Windows'));
    if (s.isWindows) {
      if (s.status === 'success') out.push(createNodeMarker('tools.success', TOOLS_NODE, 'info', 'Successful', { iconKey: 'all good' }));
      if (s.status === 'warning') out.push(createNodeMarker('tools.warning', TOOLS_NODE, 'warn', 'Warning', { iconKey: 'warning' }));
      if (s.status === 'error') out.push(createNodeMarker('tools.failed', TOOLS_NODE, 'danger', 'Failed', { iconKey: 'bad' }));
      if (s.status === 'empty') out.push(createNodeMarker('tools.empty', TOOLS_NODE, 'warn', 'Empty', { iconKey: 'warning' }));
    }

    if (s.hasCorruptRegistry) out.push(createNodeMarker('tools.corrupt-reg', TOOLS_NODE, 'danger', 'Corrupt Registry', { iconKey: 'bad' }));
    if (s.hasPrlDdIssue && s.kbArticle) out.push(createNodeMarker('tools.kb', TOOLS_NODE, 'danger', s.kbArticle, { iconKey: 'bad' }));

    return out;
  }
];

const systemLogRules: Rule[] = [
  (report) => {
    const s = report.systemLog;
    if (!s) return [];
    if (s.hasCoherenceDump) {
      return [
        createNodeMarker('syslog.coherence', SYSLOG_NODE, 'warn', 'Coherence dumps', {
          tooltip: `Coherence state dumps found (${s.coherenceDumpCount})`,
          iconKey: 'coherence'
        })
      ];
    }
    return [];
  }
];

const vmDirectoryRules: Rule[] = [
  (report) => {
    const s = report.vmDirectory;
    if (!s) return [];
    if (s.vmCount > 0) {
      return [createNodeMarker('vmdir.count', VMDIR_NODE, 'info', `${s.vmCount} VMs`, { iconKey: 'vms' })];
    }
    return [createNodeMarker('vmdir.none', VMDIR_NODE, 'warn', 'No VMs', { iconKey: 'warning' })];
  }
];

const guestCommandsRules: Rule[] = [
  (report) => {
    const s = report.guestCommands;
    if (!s) return [];
    if (s.isLinux) {
      return [createNodeMarker('guestcmd.linux', GUEST_COMMANDS_NODE, 'info', 'Linux')];
    }
    if (s.isEmpty) {
      return [createNodeMarker('guestcmd.empty', GUEST_COMMANDS_NODE, 'warn', 'Empty', { iconKey: 'warning' })];
    }
    return [];
  }
];

const appConfigRules: Rule[] = [
  (report) => {
    const s = report.appConfig;
    if (!s) return [];
    const out = [];
    if (s.isUserDefinedOnDisconnectedServer) {
      out.push(createNodeMarker('appcfg.disconnected', APP_CONFIG_NODE, 'warn', 'Disconnected', { iconKey: 'warning' }));
      return out;
    }
    if (s.verboseLoggingEnabled) out.push(createNodeMarker('appcfg.verbose', APP_CONFIG_NODE, 'info', 'Verbose logging'));
    if (s.hasExternalVmFolder) out.push(createNodeMarker('appcfg.external-vm-folder', APP_CONFIG_NODE, 'info', 'External VM folder', { iconKey: 'External Default VM folder' }));
    if ((s.usbPermanentAssignments?.length ?? 0) > 0) out.push(createNodeMarker('appcfg.usb-assign', APP_CONFIG_NODE, 'info', 'USB assignments', { iconKey: 'usb' }));
    return out;
  }
];

const installedSoftwareRules: Rule[] = [
  (report) => {
    const s = report.installedSoftware;
    if (!s) return [];
    return [createNodeMarker('software.count', INSTALLED_SOFTWARE_NODE, 'info', `${s.appCount} apps`, { iconKey: 'installedApps' })];
  }
];

const launchdRules: Rule[] = [
  (report) => {
    const s = report.launchdInfo;
    if (!s?.stats) return [];
    const out = [createNodeMarker('launchd.files', LAUNCHD_NODE, 'info', `${s.stats.files} files`, { iconKey: 'service' })];
    if (s.stats.rootOwnedFiles > 0) out.push(createNodeMarker('launchd.root-owned', LAUNCHD_NODE, 'warn', `${s.stats.rootOwnedFiles} root-owned`, { iconKey: 'root or unknown owner' }));
    return out;
  }
];

const autoStatisticRules: Rule[] = [
  (report) => {
    const s = report.autoStatisticInfo;
    if (!s) return [];
    if (s.installationCount > 0) {
      return [createNodeMarker('autostat.count', AUTOSTAT_NODE, 'info', `${s.installationCount} installations`, { iconKey: 'install' })];
    }
    return [];
  }
];

export const otherNodeRules: Rule[] = [
  ...licenseRules,
  ...netConfigRules,
  ...clientProxyRules,
  ...advancedVmInfoRules,
  ...hostInfoRules,
  ...moreHostInfoRules,
  ...loadedDriversRules,
  ...mountInfoRules,
  ...allProcessesRules,
  ...toolsLogRules,
  ...systemLogRules,
  ...vmDirectoryRules,
  ...guestCommandsRules,
  ...appConfigRules,
  ...installedSoftwareRules,
  ...launchdRules,
  ...autoStatisticRules
];
