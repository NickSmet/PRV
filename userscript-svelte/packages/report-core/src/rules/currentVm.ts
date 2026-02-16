/**
 * CurrentVm Rules
 * 
 * Rules that evaluate the CurrentVm node and produce markers.
 * Ported from the legacy NodeParser.js markBullet calls.
 */

import type { Rule } from './types';
import type { Marker } from '../types/markers';
import {
  createNodeMarker,
  createSubSectionMarker,
  createRowMarker
} from '../types/markers';

const NODE_ID = 'current-vm';

// ============================================================================
// VM Type Rules
// ============================================================================

/**
 * Mac VM detection
 * Legacy: markBullet("CurrentVm", 'macvm')
 */
const macVmRule: Rule = (report) => {
  if (report.currentVm?.macVm) {
    return [
      createNodeMarker('macvm', NODE_ID, 'info', 'Mac VM', {
        tooltip: 'This is a macOS virtual machine',
        iconKey: 'apple'
      })
    ];
  }
  return [];
};

// ============================================================================
// Storage Rules
// ============================================================================

/**
 * No HDD attached
 * Legacy: markBullet('CurrentVm','bad','','No HDD attached to VM!')
 */
const noHddRule: Rule = (report) => {
  const vm = report.currentVm;
  if (!vm?.hdds?.length && !vm?.macVm) {
    return [
      createNodeMarker('no-hdd', NODE_ID, 'danger', 'No HDD', {
        tooltip: 'No HDD attached to VM!',
        iconKey: 'alert-triangle'
      }),
      createSubSectionMarker('no-hdd-subsection', NODE_ID, 'Hardware', 'hdds', 'danger', 'Empty', {
        tooltip: 'No HDD attached to VM!'
      })
    ];
  }
  return [];
};

/**
 * Boot Camp VM detection
 * Legacy: markBullet('CurrentVm', 'Boot Camp')
 */
const bootCampRule: Rule = (report) => {
  if (report.currentVm?.isBootCamp) {
    return [
      createNodeMarker('boot-camp', NODE_ID, 'info', 'Boot Camp', {
        tooltip: 'This VM uses a Boot Camp partition',
        iconKey: 'hard-drive'
      })
    ];
  }
  return [];
};

/**
 * TRIM enabled on vHDD
 * Legacy: markBullet('CurrentVm', 'trim')
 */
const trimEnabledRule: Rule = (report) => {
  if (report.currentVm?.hasTrimEnabled && !report.currentVm?.isBootCamp) {
    return [
      createNodeMarker('trim-enabled', NODE_ID, 'info', 'TRIM', {
        tooltip: 'TRIM is enabled on virtual disk',
        iconKey: 'hard-drive'
      })
    ];
  }
  return [];
};

/**
 * Splitted disk
 * Legacy: markBullet('CurrentVm', 'splitted')
 */
const splittedDiskRule: Rule = (report) => {
  if (report.currentVm?.hasSplittedDisk && !report.currentVm?.isBootCamp) {
    return [
      createNodeMarker('splitted-disk', NODE_ID, 'info', 'Splitted', {
        tooltip: 'Virtual disk is split into multiple files',
        iconKey: 'hard-drive'
      })
    ];
  }
  return [];
};

/**
 * Plain (non-expanding) vHDD
 * Legacy: markBullet('CurrentVm', icons["plain vHDD"])
 */
const plainDiskRule: Rule = (report) => {
  if (report.currentVm?.isPlainDisk) {
    return [
      createNodeMarker('plain-disk', NODE_ID, 'info', 'Plain Disk', {
        tooltip: 'Non-expanding (pre-allocated) virtual disk',
        iconKey: 'hard-drive'
      })
    ];
  }
  return [];
};

/**
 * External vHDD location
 * Legacy: markBullet('CurrentVm', icons["external vHDD"])
 */
const externalVhddRule: Rule = (report) => {
  // Skip for Chrome OS product
  if (report.meta.productName?.includes('Chrome OS')) return [];
  
  if (report.currentVm?.isExternalVhdd) {
    const externalCount = report.currentVm.externalVhddLocations?.length ?? 0;
    const externalSample = (report.currentVm.externalVhddLocations ?? [])
      .slice(0, 2)
      .map((p) => p.split('/').filter(Boolean).pop() ?? p)
      .join(', ');
    return [
      createNodeMarker('external-vhdd', NODE_ID, 'warn', externalCount > 1 ? `External vHDD (${externalCount})` : 'External vHDD', {
        tooltip: externalCount > 0
          ? `Virtual HDD is located outside the PVM bundle (${externalCount} disk${externalCount === 1 ? '' : 's'}).${externalSample ? ` Example: ${externalSample}` : ''}`
          : 'Virtual HDD is located outside the PVM bundle',
        iconKey: 'hard-drive'
      }),
      createSubSectionMarker('external-vhdd-subsection', NODE_ID, 'Hardware', 'hdds', 'warn', 'External', {
        tooltip: 'Virtual HDD is located outside the PVM bundle'
      })
    ];
  }
  return [];
};

/**
 * Rollback Mode enabled
 * Legacy: markBullet('CurrentVm', icons.rollbackMode, '','Rollback Mode')
 */
const rollbackModeRule: Rule = (report) => {
  if (report.currentVm?.rollbackMode === '1') {
    return [
      createNodeMarker('rollback-mode', NODE_ID, 'warn', 'Rollback Mode', {
        tooltip: 'Rollback Mode is enabled - changes are discarded on shutdown',
        iconKey: 'rotate-ccw'
      })
    ];
  }
  return [];
};

// ============================================================================
// Network Rules
// ============================================================================

/**
 * Shared networking mode
 * Legacy: markBullet('CurrentVm', 'shared')
 */
const sharedNetworkRule: Rule = (report) => {
  if (report.currentVm?.isSharedNetwork) {
    return [
      createNodeMarker('shared-network', NODE_ID, 'info', 'Shared', {
        tooltip: 'Using Shared Networking mode',
        iconKey: 'network'
      })
    ];
  }
  return [];
};

/**
 * Bridged networking mode
 * Legacy: markBullet('CurrentVm', 'bridged')
 */
const bridgedNetworkRule: Rule = (report) => {
  if (report.currentVm?.isBridgedNetwork) {
    return [
      createNodeMarker('bridged-network', NODE_ID, 'info', 'Bridged', {
        tooltip: 'Using Bridged Networking mode',
        iconKey: 'network'
      })
    ];
  }
  return [];
};

/**
 * Disconnected network adapter
 * Legacy: iconVMNETWORKs=icons.adapterNotConnected
 */
const disconnectedAdapterRule: Rule = (report) => {
  if (report.currentVm?.hasDisconnectedAdapter) {
    return [
      createNodeMarker('disconnected-adapter', NODE_ID, 'warn', 'NIC Offline', {
        tooltip: 'One or more network adapters are disconnected',
        iconKey: 'wifi-off'
      }),
      createSubSectionMarker('disconnected-adapter-subsection', NODE_ID, 'Hardware', 'networks', 'warn', 'Disconnected', {
        tooltip: 'Network adapter is disconnected'
      })
    ];
  }
  return [];
};

/**
 * Network conditioner enabled
 * Legacy: markBullet('CurrentVm', icons['network conditioner limited/fullspeed'])
 */
const networkConditionerRule: Rule = (report) => {
  if (report.currentVm?.hasNetworkConditioner) {
    const isLimited = report.currentVm?.hasNetworkConditionerLimited;
    return [
      createNodeMarker(
        'network-conditioner',
        NODE_ID,
        isLimited ? 'warn' : 'info',
        isLimited ? 'Net Limited' : 'Net Conditioner',
        {
          tooltip: isLimited
            ? 'Network Conditioner is limiting bandwidth'
            : 'Network Conditioner is enabled (full speed)',
          iconKey: 'activity'
        }
      )
    ];
  }
  return [];
};

// ============================================================================
// VM Identity Rules
// ============================================================================

/**
 * Copied VM (Source UUID != VM UUID)
 * Legacy: markBullet("CurrentVm", 'copied vm')
 */
const copiedVmRule: Rule = (report) => {
  if (report.currentVm?.isCopied) {
    return [
      createNodeMarker('copied-vm', NODE_ID, 'warn', 'Copied VM', {
        tooltip: 'This VM was copied from another VM (Source UUID differs from VM UUID)',
        iconKey: 'copy'
      }),
      createRowMarker('copied-vm-detail', NODE_ID, 'General.Source UUID', 'warn', 'Copied', {
        tooltip: 'Source UUID differs from VM UUID'
      })
    ];
  }
  return [];
};

/**
 * Imported VM heuristic (bogus creation date)
 * Legacy quirk: imported VMs sometimes have creation date set to 1751-12-31.
 */
const importedVmRule: Rule = (report) => {
  if (report.currentVm?.isImported) {
    return [
      createNodeMarker('imported-vm', NODE_ID, 'warn', 'Imported', {
        tooltip: 'VM creation date looks bogus (1751-12-31) — this usually indicates an imported VM.',
        iconKey: 'clock'
      }),
      createRowMarker('imported-vm-date', NODE_ID, 'General.Creation Date', 'warn', 'Imported', {
        tooltip: 'Bogus creation date (1751-12-31) is a known indicator of imported VM.'
      })
    ];
  }
  return [];
};

/**
 * VM on external drive
 * Legacy: markBullet("CurrentVm", "external drive")
 */
const externalDriveRule: Rule = (report) => {
  if (report.currentVm?.isOnExternalVolume) {
    return [
      createNodeMarker('external-drive', NODE_ID, 'warn', 'External Drive', {
        tooltip: 'VM is located on an external volume (/Volumes/...)',
        iconKey: 'hard-drive'
      })
    ];
  }
  return [];
};

/**
 * Linked clone
 * Legacy: markBullet('CurrentVm', icons["linked clone"])
 */
const linkedCloneRule: Rule = (report) => {
  if (report.currentVm?.isLinkedClone) {
    return [
      createNodeMarker('linked-clone', NODE_ID, 'info', 'Linked Clone', {
        tooltip: 'This is a linked clone VM',
        iconKey: 'link'
      })
    ];
  }
  return [];
};

// ============================================================================
// Hypervisor & Virtualization Rules
// ============================================================================

/**
 * Apple Hypervisor
 * Legacy: markBullet("CurrentVm", "AppleHV")
 */
const appleHvRule: Rule = (report) => {
  const vm = report.currentVm;
  // Only show for non-macvm
  if (vm?.hypervisorType === '1' && !vm?.macVm) {
    return [
      createNodeMarker('apple-hv', NODE_ID, 'info', 'Apple HV', {
        tooltip: 'Using Apple Hypervisor Framework',
        iconKey: 'cpu'
      })
    ];
  }
  return [];
};

/**
 * Nested Virtualization
 * Legacy: markBullet("CurrentVm", "Nested")
 */
const nestedVirtRule: Rule = (report) => {
  if (report.currentVm?.nestedVirtualization === '1') {
    return [
      createNodeMarker('nested-virt', NODE_ID, 'info', 'Nested', {
        tooltip: 'Nested Virtualization is enabled',
        iconKey: 'layers'
      })
    ];
  }
  return [];
};

// ============================================================================
// Runtime Mode Rules
// ============================================================================

/**
 * Headless mode
 * Legacy: markBullet("CurrentVm", "headless")
 */
const headlessModeRule: Rule = (report) => {
  const vm = report.currentVm;
  const isHeadless =
    vm?.startAutomatically === '5' ||
    vm?.startAutomatically === '1' ||
    vm?.onWindowClose === '5';
  
  if (isHeadless) {
    return [
      createNodeMarker('headless', NODE_ID, 'info', 'Headless', {
        tooltip: 'VM runs in headless mode (no window)',
        iconKey: 'monitor-off'
      })
    ];
  }
  return [];
};

/**
 * Travel Mode enabled
 * Legacy: markBullet('CurrentVm', icons.travelMode,'','Travel Mode')
 */
const travelModeRule: Rule = (report) => {
  if (report.currentVm?.travelMode?.enabled === '1') {
    return [
      createNodeMarker('travel-mode', NODE_ID, 'warn', 'Travel Mode', {
        tooltip: 'Travel Mode is enabled',
        iconKey: 'plane'
      })
    ];
  }
  return [];
};

/**
 * Isolated VM
 * Legacy: markBullet("CurrentVm", "isolated")
 */
const isolatedVmRule: Rule = (report) => {
  if (report.currentVm?.isolated === '1') {
    return [
      createNodeMarker('isolated', NODE_ID, 'info', 'Isolated', {
        tooltip: 'VM is running in isolated mode',
        iconKey: 'shield'
      })
    ];
  }
  return [];
};

// ============================================================================
// Configuration Warning Rules
// ============================================================================

/**
 * Time Sync disabled
 * Legacy: markBullet("CurrentVm", "noTimeSync")
 */
const noTimeSyncRule: Rule = (report) => {
  if (report.currentVm?.timeSync === '0') {
    return [
      createNodeMarker('no-time-sync', NODE_ID, 'warn', 'No Time Sync', {
        tooltip: 'Time synchronization with host is disabled',
        iconKey: 'clock'
      })
    ];
  }
  return [];
};

/**
 * Boot flags present
 * Legacy: markBullet("CurrentVm", "flags")
 */
const bootFlagsRule: Rule = (report) => {
  if (report.currentVm?.bootFlags && report.currentVm.bootFlags.trim() !== '') {
    return [
      createNodeMarker('boot-flags', NODE_ID, 'warn', 'Boot Flags', {
        tooltip: `Boot flags set: ${report.currentVm.bootFlags}`,
        iconKey: 'flag'
      })
    ];
  }
  return [];
};

/**
 * Resource Quota < 100%
 * Legacy: markBullet("CurrentVm", "resource quota")
 */
const resourceQuotaRule: Rule = (report) => {
  const quota = parseInt(report.currentVm?.resourceQuota || '100');
  if (quota < 100) {
    return [
      createNodeMarker('resource-quota', NODE_ID, 'warn', `Quota ${quota}%`, {
        tooltip: `Resource quota is limited to ${quota}%`,
        iconKey: 'gauge'
      })
    ];
  }
  return [];
};

/**
 * Smart Guard enabled
 * Legacy: markBullet("CurrentVm", "smart guard")
 */
const smartGuardRule: Rule = (report) => {
  if (report.currentVm?.smartGuard === '1') {
    return [
      createNodeMarker('smart-guard', NODE_ID, 'info', 'Smart Guard', {
        tooltip: 'Smart Guard (automatic snapshots) is enabled',
        iconKey: 'shield'
      })
    ];
  }
  return [];
};

/**
 * TPM enabled
 * Legacy: markBullet("CurrentVm", icons.TPM)
 */
const tpmRule: Rule = (report) => {
  const tpm = report.currentVm?.tpm;
  if (tpm && tpm !== '0') {
    return [
      createNodeMarker('tpm', NODE_ID, 'info', 'TPM', {
        tooltip: `TPM ${tpm} is enabled`,
        iconKey: 'key'
      })
    ];
  }
  return [];
};

/**
 * GuestCommands missing on a "running VM" report type (likely tools not working)
 * Legacy: markBullet('GuestCommands', icons.warning) when empty while VM is running.
 */
const missingGuestCommandsOnRunningVmReportRule: Rule = (report) => {
  const type = report.meta.reportType ?? '';
  const t = type.toLowerCase();
  const isRunningVmReport = type === 'UserDefinedOnRunningVmReport' || t.includes('runningvmreport') || t.includes('running');

  const isLinux = report.guestOs?.type ? /linux/i.test(report.guestOs.type) : false;
  const guestCommandsEmpty = !report.guestCommands || report.guestCommands.isEmpty;

  if (isRunningVmReport && !isLinux && guestCommandsEmpty) {
    return [
      createNodeMarker('guest-commands-missing', NODE_ID, 'warn', 'No GuestCommands', {
        tooltip:
          type === 'UserDefinedOnRunningVmReport'
            ? 'GuestCommands is empty for a running VM report; this often indicates Parallels Tools is not working.'
            : `GuestCommands is empty for report type "${type}"; this often indicates Parallels Tools is not working.`,
        iconKey: 'alert-triangle'
      })
    ];
  }

  return [];
};

// ============================================================================
// Cross-Node Rules (require host info)
// ============================================================================

/**
 * Too much RAM assigned
 * Legacy: markBullet("CurrentVm", 'bad') when vmram > hostram/2 && hostram - vmram < 6144
 */
const tooMuchRamRule: Rule = (report) => {
  const vmRam = parseInt(report.currentVm?.ramMb || '0');
  const hostRam = report.host?.ramMb || 0;
  
  if (hostRam > 0 && vmRam > hostRam / 2 && hostRam - vmRam < 6144) {
    return [
      createNodeMarker('too-much-ram', NODE_ID, 'danger', 'Too Much RAM', {
        tooltip: `VM has ${vmRam}MB but host only has ${hostRam}MB (less than 6GB left for host)`,
        iconKey: 'memory-stick'
      }),
      createRowMarker('too-much-ram-detail', NODE_ID, 'Hardware.RAM (MB)', 'danger', '!!', {
        tooltip: 'VM RAM exceeds safe limits'
      })
    ];
  }
  return [];
};

/**
 * Uneven RAM amount
 * Legacy: markBullet("CurrentVm", 'warning') when vmram % 256 != 0
 */
const unevenRamRule: Rule = (report) => {
  const vmRam = parseInt(report.currentVm?.ramMb || '0');
  if (vmRam > 0 && vmRam % 256 !== 0) {
    return [
      createNodeMarker('uneven-ram', NODE_ID, 'warn', 'Uneven RAM', {
        tooltip: `RAM (${vmRam}MB) is not a multiple of 256MB`,
        iconKey: 'memory-stick'
      })
    ];
  }
  return [];
};

// ============================================================================
// Chrome OS Specific Rules
// ============================================================================

/**
 * Not PvmDefault (Chrome OS)
 * Legacy: markBullet('CurrentVm', 'not PvmDefault')
 */
const notPvmDefaultRule: Rule = (report) => {
  if (
    report.meta.productName?.includes('Chrome OS') &&
    report.currentVm?.vmName &&
    !/PvmDefault/i.test(report.currentVm.vmName)
  ) {
    return [
      createNodeMarker('not-pvmdefault', NODE_ID, 'warn', 'Not PvmDefault', {
        tooltip: 'VM name is not PvmDefault (unexpected for Chrome OS)',
        iconKey: 'alert-triangle'
      })
    ];
  }
  return [];
};

// ============================================================================
// Rule Registry
// ============================================================================

/**
 * All CurrentVm rules in evaluation order
 */
export const currentVmRules: Rule[] = [
  // VM Type
  macVmRule,
  
  // Storage
  noHddRule,
  bootCampRule,
  trimEnabledRule,
  splittedDiskRule,
  plainDiskRule,
  externalVhddRule,
  rollbackModeRule,
  
  // Network
  sharedNetworkRule,
  bridgedNetworkRule,
  disconnectedAdapterRule,
  networkConditionerRule,
  
  // Identity
  copiedVmRule,
  importedVmRule,
  externalDriveRule,
  linkedCloneRule,
  
  // Hypervisor
  appleHvRule,
  nestedVirtRule,
  
  // Runtime Mode
  headlessModeRule,
  travelModeRule,
  isolatedVmRule,
  
  // Configuration Warnings
  noTimeSyncRule,
  bootFlagsRule,
  resourceQuotaRule,
  smartGuardRule,
  tpmRule,
  missingGuestCommandsOnRunningVmReportRule,
  
  // Cross-Node (RAM)
  tooMuchRamRule,
  unevenRamRule,
  
  // Chrome OS
  notPvmDefaultRule
];
