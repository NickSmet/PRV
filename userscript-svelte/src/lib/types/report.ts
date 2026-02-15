/**
 * Unified Report Model Types
 *
 * This module defines the complete typed representation of a Parallels Problem Report.
 * All parsers populate sections of this model; all rules read from it.
 */

import type { CurrentVmSummary, VmDisk, VmNetAdapter } from '../../services/parseCurrentVm';
import type { GuestOsSummary } from '../../services/parseGuestOs';
import type { LicenseDataSummary } from '../../services/parseLicenseData';
import type { NetConfigSummary } from '../../services/parseNetConfig';
import type { AdvancedVmInfoSummary } from '../../services/parseAdvancedVmInfo';
import type { HostInfoSummary } from '../../services/parseHostInfo';
import type { LoadedDriversSummary } from '../../services/parseLoadedDrivers';
import type { MountInfoSummary } from '../../services/parseMountInfo';
import type { AllProcessesSummary } from '../../services/parseAllProcesses';
import type { MoreHostInfoSummary } from '../../services/parseMoreHostInfo';
import type { VmDirectorySummary } from '../../services/parseVmDirectory';
import type { GuestCommandsSummary } from '../../services/parseGuestCommands';
import type { AppConfigSummary } from '../../services/parseAppConfig';
import type { ClientInfoSummary } from '../../services/parseClientInfo';
import type { ClientProxyInfoSummary } from '../../services/parseClientProxyInfo';
import type { InstalledSoftwareSummary } from '../../services/parseInstalledSoftware';
// Phase 4 imports
import type { TimeZoneSummary } from '../../services/parseTimeZone';
import type { ToolsLogSummary } from '../../services/parseToolsLog';
import type { ParallelsSystemLogSummary } from '../../services/parseParallelsSystemLog';
import type { LaunchdInfoSummary } from '../../services/parseLaunchdInfo';
import type { AutoStatisticInfoSummary } from '../../services/parseAutoStatisticInfo';

// ============================================================================
// Report Metadata
// ============================================================================

export interface ReportMeta {
  productName?: string;        // e.g., "Parallels Desktop", "Parallels Desktop for Chrome OS"
  productVersion?: string;
  reportId?: string;
  timezone?: number;
  vendorInfo?: string;
}

// ============================================================================
// Host Information
// ============================================================================

export interface HostInfo {
  osVersion?: string;
  osMajor?: number;
  osMinor?: number;
  ramMb?: number;
  cpuModel?: string;
  cpuIsAppleSilicon?: boolean;
  displayCount?: number;
  hasDisplayLink?: boolean;
}

// ============================================================================
// License Information
// ============================================================================

export interface LicenseInfo {
  expirationDate?: Date;
  isPirated?: boolean;          // Expiration > 12 years in future
  licenseType?: string;
}

// ============================================================================
// Guest OS Information
// ============================================================================

export interface GuestOsInfo {
  type?: 'Windows' | 'Linux' | 'macvm' | string;
  version?: string;
  kernel?: string;
  adapters?: GuestNetAdapter[];
  networkDrives?: string[];
}

export interface GuestNetAdapter {
  name?: string;
  ip?: string;
  mac?: string;
}

// ============================================================================
// Advanced VM Information
// ============================================================================

export interface AdvancedVmInfo {
  snapshotCount?: number;
  hasAclIssues?: boolean;
  hasRootOwner?: boolean;
  hasDeleteSnapshotOperation?: boolean;
  mainSnapshotMissing?: boolean;
}

// ============================================================================
// Loaded Drivers / Kexts
// ============================================================================

export interface LoadedDrivers {
  hasNonAppleKexts?: boolean;
  hasBadKexts?: boolean;
  isHackintosh?: boolean;
  hasPrlKexts?: boolean;
  kextList?: string[];
}

// ============================================================================
// Process List
// ============================================================================

export interface ProcessList {
  hasBadProcesses?: boolean;
  badProcessCount?: number;
  processList?: string[];
}

// ============================================================================
// Storage / Mount Information
// ============================================================================

export interface MountInfo {
  isLowStorage?: boolean;
  isHddFull?: boolean;
  volumes?: VolumeInfo[];
}

export interface VolumeInfo {
  name?: string;
  capacity?: number;
  used?: number;
  free?: number;
}

// ============================================================================
// Network Configuration
// ============================================================================

export interface NetConfigInfo {
  hasSharedNetworking?: boolean;
  hasHostOnlyNetworking?: boolean;
  isKextless?: boolean;
}

// ============================================================================
// Proxy Information
// ============================================================================

export interface ProxyInfo {
  httpProxyEnabled?: boolean;
}

// ============================================================================
// App Configuration
// ============================================================================

export interface AppConfigInfo {
  hasUsbPermanentAssignments?: boolean;
  verboseLoggingEnabled?: boolean;
}

// ============================================================================
// CurrentVm Extended Model
// ============================================================================

/**
 * Extended CurrentVm model with derived/computed fields for rule evaluation.
 * Extends the base CurrentVmSummary from the parser.
 */
export interface CurrentVmModel extends CurrentVmSummary {
  // Derived fields for rule evaluation
  isBootCamp?: boolean;
  isExternalVhdd?: boolean;
  /**
   * Normalized `.pvm` bundle root used for disk location comparisons.
   * (May be empty if VmHome is missing.)
   */
  pvmBundleRoot?: string;
  /**
   * Disk locations (as reported) that are outside the `.pvm` bundle root.
   * This helps the UI explain *which* disk triggered `isExternalVhdd`.
   */
  externalVhddLocations?: string[];
  isCopied?: boolean;
  isOnExternalVolume?: boolean;
  isPlainDisk?: boolean;
  hasSplittedDisk?: boolean;
  hasTrimEnabled?: boolean;
  hasNetworkConditioner?: boolean;
  hasNetworkConditionerLimited?: boolean;
  hasDisconnectedAdapter?: boolean;
  isSharedNetwork?: boolean;
  isBridgedNetwork?: boolean;
  isLinkedClone?: boolean;
  linkedVmUuid?: string;
}

/**
 * Compute derived fields from base CurrentVmSummary
 */
export function deriveCurrentVmFields(summary: CurrentVmSummary): CurrentVmModel {
  const vmHomeRaw = summary.vmHome || '';
  const hdds = summary.hdds || [];
  const netAdapters = summary.netAdapters || [];

  function normalizePosixPath(input: string): string {
    const trimmed = input.trim();
    if (!trimmed) return '';
    // Normalize repeated slashes and remove a trailing slash (except root).
    const collapsed = trimmed.replace(/\/{2,}/g, '/');
    if (collapsed.length > 1 && collapsed.endsWith('/')) return collapsed.slice(0, -1);
    return collapsed;
  }

  function dirnamePosix(absPath: string): string {
    const p = normalizePosixPath(absPath);
    const idx = p.lastIndexOf('/');
    if (idx <= 0) return '/';
    return p.slice(0, idx);
  }

  /**
   * CurrentVm's `VmHome` is *usually* the `.pvm` folder path, but some reports
   * provide a path to `config.pvs` inside the bundle:
   * - `/.../VM.pvm`
   * - `/.../VM.pvm/config.pvs`
   *
   * For any path comparisons (e.g. "external vHDD"), normalize this to the
   * `.pvm` bundle root.
   */
  function normalizePvmBundleRoot(vmHomeValue: string): string {
    const vmHome = normalizePosixPath(vmHomeValue);
    if (!vmHome) return '';

    // Prefer explicit `.pvm` root if present anywhere in the path.
    const pvmMatch = /^(?<root>.*?\.pvm)(?:\/|$)/i.exec(vmHome);
    const root = pvmMatch?.groups?.root;
    if (root) return normalizePosixPath(root);

    // Fallback: if it points to a file, take its directory.
    if (/\.(pvs|xml|txt|log|json)$/i.test(vmHome)) {
      return dirnamePosix(vmHome);
    }

    return vmHome;
  }

  const vmHome = normalizePvmBundleRoot(vmHomeRaw);

  // Check for Boot Camp: expanding=0 and actualSize=0
  const isBootCamp = hdds.some(
    (hdd) => hdd.expanding === '0' && (hdd.actualSize === '0' || hdd.actualSize === '0 B')
  );

  const externalVhddLocations = hdds
    .map((hdd) => hdd.location)
    .filter((loc): loc is string => typeof loc === 'string')
    .filter((rawLoc) => {
      const location = normalizePosixPath(rawLoc);
      if (!location || !vmHome) return false;
      // If disk location isn't an absolute path (uncommon in reports), treat as internal.
      if (!location.startsWith('/')) return false;
      // If HDD location doesn't start with the `.pvm` bundle root, it's external-to-bundle.
      const rootPrefix = vmHome.endsWith('/') ? vmHome : `${vmHome}/`;
      return !location.startsWith(rootPrefix);
    });

  // Check for external vHDD (location outside PVM bundle root)
  const isExternalVhdd = externalVhddLocations.length > 0;

  // Check if VM was copied (Source UUID != VM UUID)
  const isCopied = !!(
    summary.sourceVmUuid &&
    summary.vmUuid &&
    summary.sourceVmUuid !== summary.vmUuid
  );

  // Check if VM is on external volume
  const isOnExternalVolume = vmHome.startsWith('/Volumes/');

  // Check for plain (non-expanding) disk
  const isPlainDisk = hdds.some((hdd) => hdd.expanding === '0') && !isBootCamp;

  // Check for splitted disk
  const hasSplittedDisk = hdds.some((hdd) => hdd.splitted === '1');

  // Check for TRIM enabled
  const hasTrimEnabled = hdds.some((hdd) => hdd.trim === '1');

  // Check network adapters
  const hasDisconnectedAdapter = netAdapters.some((adapter) => adapter.connected === '0');
  const hasNetworkConditioner = netAdapters.some((adapter) => adapter.conditionerEnabled === '1');
  const hasNetworkConditionerLimited = hasNetworkConditioner; // Would need more fields to determine limited vs fullspeed
  const isSharedNetwork = netAdapters.some((adapter) => adapter.mode?.toLowerCase().includes('shared'));
  const isBridgedNetwork = netAdapters.some((adapter) => adapter.mode?.toLowerCase().includes('bridged'));

  return {
    ...summary,
    isBootCamp,
    isExternalVhdd,
    pvmBundleRoot: vmHome || undefined,
    externalVhddLocations,
    isCopied,
    isOnExternalVolume,
    isPlainDisk,
    hasSplittedDisk,
    hasTrimEnabled,
    hasNetworkConditioner,
    hasNetworkConditionerLimited,
    hasDisconnectedAdapter,
    isSharedNetwork,
    isBridgedNetwork,
    isLinkedClone: false, // Would need linkedVmUuid field
    linkedVmUuid: undefined
  };
}

// ============================================================================
// Complete Report Model
// ============================================================================

/**
 * The unified report model that aggregates all parsed data.
 * All rules read from this single source of truth.
 */
export interface ReportModel {
  meta: ReportMeta;
  host: HostInfo;
  hostDevices: HostInfoSummary | null;          // Parsed from parseHostInfo
  license: LicenseDataSummary | null;           // Parsed from parseLicenseData
  currentVm: CurrentVmModel | null;
  advancedVm: AdvancedVmInfoSummary | null;     // Parsed from parseAdvancedVmInfo
  guestOs: GuestOsSummary | null;               // Parsed from parseGuestOs
  drivers: LoadedDriversSummary | null;         // Parsed from parseLoadedDrivers
  processes: AllProcessesSummary | null;        // Parsed from parseAllProcesses
  storage: MountInfoSummary | null;             // Parsed from parseMountInfo
  network: NetConfigSummary | null;             // Parsed from parseNetConfig
  moreHostInfo: MoreHostInfoSummary | null;     // Parsed from parseMoreHostInfo
  vmDirectory: VmDirectorySummary | null;       // Parsed from parseVmDirectory
  guestCommands: GuestCommandsSummary | null;   // Parsed from parseGuestCommands
  appConfig: AppConfigSummary | null;           // Parsed from parseAppConfig
  clientInfo: ClientInfoSummary | null;         // Parsed from parseClientInfo
  proxy: ClientProxyInfoSummary | null;         // Parsed from parseClientProxyInfo
  installedSoftware: InstalledSoftwareSummary | null;  // Parsed from parseInstalledSoftware
  // Phase 4 fields
  timezone: TimeZoneSummary | null;             // Parsed from parseTimeZone
  toolsLog: ToolsLogSummary | null;             // Parsed from parseToolsLog
  systemLog: ParallelsSystemLogSummary | null;  // Parsed from parseParallelsSystemLog
  launchdInfo: LaunchdInfoSummary | null;       // Parsed from parseLaunchdInfo
  autoStatisticInfo: AutoStatisticInfoSummary | null;  // Parsed from parseAutoStatisticInfo
}

/**
 * Create an empty/initial ReportModel
 */
export function createEmptyReportModel(): ReportModel {
  return {
    meta: {},
    host: {},
    hostDevices: null,
    license: null,
    currentVm: null,
    advancedVm: null,
    guestOs: null,
    drivers: null,
    processes: null,
    storage: null,
    network: null,
    moreHostInfo: null,
    vmDirectory: null,
    guestCommands: null,
    appConfig: null,
    clientInfo: null,
    proxy: null,
    installedSoftware: null,
    // Phase 4 fields
    timezone: null,
    toolsLog: null,
    systemLog: null,
    launchdInfo: null,
    autoStatisticInfo: null
  };
}




