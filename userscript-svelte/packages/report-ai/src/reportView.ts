/**
 * ReportView — AI-friendly, hierarchical projection of a Parallels Problem Report.
 *
 * Organized by component (Host / Parallels / VMs) matching the Reality View UI.
 * Parser summaries are passed through with minimal reshaping — the coding agent
 * works with raw primitive arrays and objects, sorting/filtering in code.
 */

import type {
  ReportModel,
  CurrentVmModel,
  Marker,
  MarkerTarget,
  PerVmDiscoveredFiles,

  // Parser summaries — passed through as-is
  HostInfoSummary,
  MoreHostInfoSummary,
  MountInfoSummary,
  LoadedDriversSummary,
  AllProcessesSummary,
  LaunchdInfoSummary,
  InstalledSoftwareSummary,
  LicenseDataSummary,
  NetConfigSummary,
  AppConfigSummary,
  ClientInfoSummary,
  ClientProxyInfoSummary,
  AutoStatisticInfoSummary,
  TimeZoneSummary,
  GuestOsSummary,
  GuestCommandsSummary,
  AdvancedVmInfoSummary,
  CurrentVmSummary,
  ToolsLogSummary,
  ParallelsSystemLogSummary,
} from '@prv/report-core';

// ── Top-Level ──────────────────────────────────────────────

export interface ReportView {
  meta: ReportViewMeta;
  markers: ReportViewMarker[];
  host: ReportViewHost;
  parallels: ReportViewParallels;
  vms: ReportViewVm[];
}

// ── Meta ───────────────────────────────────────────────────

export interface ReportViewMeta {
  reportId?: string;
  productName?: string;
  productVersion?: string;
  reportType?: string;
  reportReason?: string;
  /**
   * Reportus "received" timestamp if provided by the MCP server/index.
   * ISO 8601 string, ideally with timezone (e.g. "2026-02-16T23:39:56Z").
   */
  receivedIso?: string;
  /** Timezone summary parsed from the Report.xml <TimeZone> node. */
  timezone: TimeZoneSummary | null;
  /** Timezone offset formatted as ISO 8601 offset (e.g. "-03:00"). */
  timezoneOffsetIso: string | null;
}

// ── Markers ────────────────────────────────────────────────

export interface ReportViewMarker {
  id: string;
  severity: 'info' | 'warn' | 'danger' | 'success';
  label: string;
  tooltip?: string;
  target: string;
}

// ── Host ───────────────────────────────────────────────────

export interface ReportViewHost {
  hardware: ReportViewHostHardware | null;
  gpu: MoreHostInfoSummary | null;
  storage: ReportViewHostStorage | null;
  kexts: LoadedDriversSummary | null;
  processes: ReportViewHostProcesses | null;
  services: ReportViewLaunchdInfo | null;
  installedApps: InstalledSoftwareSummary | null;
}

export type ReportViewHostHardware = Omit<HostInfoSummary, 'hardDisks' | 'usbDevices' | 'inputDevices'> & {
  hardDisks: Array<Omit<HostInfoSummary['hardDisks'][number], 'sizeBytes' | 'partitions'> & {
    sizeMb: number | null;
    partitions: Array<Omit<HostInfoSummary['hardDisks'][number]['partitions'][number], 'sizeBytes' | 'freeSizeBytes' | 'gptType'> & {
      sizeMb: number | null;
      freeMb: number | null;
    }>;
  }>;
  usbDevices: Array<Omit<HostInfoSummary['usbDevices'][number], 'rawUuid' | 'vfSupported'>>;
  inputDevices: Array<Omit<HostInfoSummary['inputDevices'][number], 'isMouse' | 'isKeyboard' | 'isGameController' | 'role'> & {
    types: string[];
  }>;
};

export type ReportViewHostProcesses = Omit<AllProcessesSummary, 'items'> & {
  items: Array<Omit<AllProcessesSummary['items'][number], 'command' | 'displayName' | 'shortName'> & {
    command: string;
    commandTruncated?: boolean;
  }>;
};

export interface ReportViewLaunchdInfo {
  formattedListing: string | null;
  stats: {
    files: number;
    folders: number;
    rootOwnedFiles: number;
  } | null;
}

export interface ReportViewHostStorage {
  alerts: { lowStorage: boolean; hddFull: boolean; hasNtfs: boolean } | null;
  meta: { totalVolumes: number; skippedVolumes: number; parseWarnings: string[] } | null;
  localDisks: Array<{
    id: string;
    label: string;
    fs: string;
    sizeGi: number;
    usedGi: number;
    freeGi: number;
    usedPct: number;
    significant: boolean;
    volumes: Array<{ id: string; label: string; mount: string; usedGi: number; flags: string[] }>;
  }>;
  networkShares: Array<{
    id: string;
    label: string;
    protocol: string;
    source: string;
    mount: string;
    sizeGi: number;
    usedGi: number;
    freeGi: number;
    usedPct: number;
  }>;
  virtualMounts: Array<{
    id: string;
    label: string;
    mount: string;
    usedPct: number | null;
    note: string | null;
  }>;
}

// ── Parallels Desktop ──────────────────────────────────────

export interface ReportViewParallels {
  license: ReportViewLicense | null;
  virtualNetworks: ReportViewVirtualNetworks | null;
  appConfig: AppConfigSummary | null;
  client: ClientInfoSummary | null;
  proxy: ClientProxyInfoSummary | null;
  installHistory: ReportViewInstallHistory | null;
}

export interface ReportViewLicense {
  edition: number | null;
  editionName: string | null;
  expirationIso: string | null;
  isExpired: boolean | null;
  isTrial: boolean | null;
  isPirated: boolean | null;
}

export interface ReportViewVirtualNetwork {
  name: string | null;
  networkType: string | null;
  dhcpIp: string | null;
  netMask: string | null;
  hostIp: string | null;
  dhcpEnabled: boolean | null;
  dhcpV6Enabled: boolean | null;
}

export interface ReportViewVirtualNetworks {
  kextlessMode: string | null;
  networks: ReportViewVirtualNetwork[];
  hasSharedNetwork: boolean | null;
  hasHostOnlyNetwork: boolean | null;
}

export interface ReportViewInstallHistory {
  installations: Array<{ version: string; dateIso: string | null }>;
  installationCount: number | null;
}

// ── Per-VM ─────────────────────────────────────────────────

export interface ReportViewVmFiles {
  configPvs?: string;
  vmLog?: string;
  toolsLog?: string;
}

export interface ReportViewVm {
  uuid: string;
  /**
   * Canonical UUID key used for lookups (lowercase, no braces).
   * Use this when joining against per-VM files and other normalized maps.
   */
  uuidKey: string;
  name: string;
  isCurrent: boolean;
  settings: ReportViewVmSettings | null;
  guestOs: GuestOsSummary | null;
  guestCommands: GuestCommandsSummary | null;
  storageAndSnapshots: ReportViewVmStorageAndSnapshots | null;
  toolsLog: ReportViewVmToolsLog | null;
  systemLog: ParallelsSystemLogSummary | null;
  files: ReportViewVmFiles;
}

export interface ReportViewVmToolsLogEntry {
  timestampIso: string | null;
  message: string | null;
}

export interface ReportViewVmToolsLog {
  isWindows: boolean | null;
  status: string | null;
  entries: ReportViewVmToolsLogEntry[];
  hasCorruptRegistry: boolean | null;
  hasPrlDdIssue: boolean | null;
  kbArticle: string | null;
}

export interface ReportViewVmUsbDevice {
  name: string | null;
  /** ISO 8601 timestamp if parseable (e.g. from epoch-ms strings). */
  lastConnectedIso: string | null;
}

export interface ReportViewVmNetAdapter {
  name: string | null;
  mode: string | null;
  type: string | null;
  connected: boolean | null;
  mac: string | null;
}

export interface ReportViewVmSettings {
  vmName: string | null;
  vmUuid: string | null;
  sourceVmUuid: string | null;
  vmHome: string | null;
  pvmBundleRoot: string | null;
  creationDateIso: string | null;

  startAutomatically: string | null;
  startupView: string | null;
  pauseAfter: string | null;
  onMacShutdown: string | null;
  onVmShutdown: string | null;
  onWindowClose: string | null;

  cpuCount: number | null;
  ramMb: number | null;
  vramMb: number | null;

  hypervisor: string | null;
  videoMode: string | null;
  scaleToFit: string | null;
  mouse: string | null;
  keyboard: string | null;

  nestedVirtualization: string | null;
  highPerfGraphics: string | null;
  usb3: string | null;
  reclaimDiskSpace: string | null;
  rollbackMode: string | null;

  hasTrimEnabled: string | null;
  isExternalVhdd: string | null;

  netAdapters: ReportViewVmNetAdapter[];
  usbDevices: ReportViewVmUsbDevice[];
}

export interface ReportViewVmStorageAndSnapshots {
  snapshots: Array<{ name: string; createdIso: string | null }>;
  snapshotCount: number;
  pvmBundleContents?: string;
  hasAclIssues?: boolean;
  hasRootOwner?: boolean;
  hasDeleteSnapshotOp?: boolean;
  mainSnapshotMissing?: boolean;
}

// ── Builder Options ────────────────────────────────────────

export interface BuildReportViewOptions {
  reportId?: string;
  perVm?: PerVmDiscoveredFiles;
  /** Reportus index.received (ISO 8601) if available; used for some timestamp normalization. */
  receivedIso?: string;
  /**
   * Pre-parsed data for non-current VMs, keyed by lowercase UUID.
   * The handler populates this by fetching/parsing per-UUID files before calling buildReportView().
   */
  parsedPerVm?: Record<string, {
    settings?: CurrentVmSummary | null;
    toolsLog?: ToolsLogSummary | null;
  }>;
}

// ── Builder ────────────────────────────────────────────────

function serializeMarkerTarget(target: MarkerTarget): string {
  switch (target.type) {
    case 'node':
      return `node:${target.nodeId}`;
    case 'section':
      return `section:${target.nodeId}.${target.sectionTitle}`;
    case 'subSection':
      return `subSection:${target.nodeId}.${target.sectionTitle}.${target.subSectionId}`;
    case 'row':
      return `row:${target.nodeId}.${target.path}`;
  }
}

function toStringOrNull(v: unknown): string | null {
  if (v === undefined || v === null) return null;
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  try {
    return String(v);
  } catch {
    return null;
  }
}

function normalizeUuid(raw: unknown): string | null {
  const s = toStringOrNull(raw);
  if (!s) return null;
  const m = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/.exec(s);
  if (!m) return null;
  return m[0].toLowerCase();
}

function toBoolOrNull(v: unknown): boolean | null {
  if (v === undefined || v === null) return null;
  if (v === true || v === '1' || v === 1) return true;
  if (v === false || v === '0' || v === 0) return false;
  return null;
}

function toEnabledLabel(v: unknown): string | null {
  if (v === undefined || v === null) return null;
  if (v === true || v === '1' || v === 1) return 'Enabled';
  if (v === false || v === '0' || v === 0) return 'Disabled';
  return toStringOrNull(v);
}

function toYesNoLabel(v: unknown): string | null {
  if (v === undefined || v === null) return null;
  if (v === true || v === '1' || v === 1) return 'Yes';
  if (v === false || v === '0' || v === 0) return 'No';
  return toStringOrNull(v);
}

function mapLabel(map: Record<string, string>, raw: unknown): string | null {
  const s = toStringOrNull(raw);
  if (!s) return null;
  return map[s] ?? s;
}

function epochMsToIso(raw: unknown): string | null {
  const s = toStringOrNull(raw);
  if (!s) return null;
  if (!/^\d{13}$/.test(s)) return null;
  const num = Number.parseInt(s, 10);
  if (!Number.isFinite(num)) return null;
  try {
    return new Date(num).toISOString();
  } catch {
    return null;
  }
}

function dateTimeToIsoLocal(raw: unknown): string | null {
  const s = toStringOrNull(raw);
  if (!s) return null;
  // "YYYY-MM-DD HH:MM:SS" -> "YYYY-MM-DDTHH:MM:SS"
  if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}$/.test(s)) return s.replace(' ', 'T');
  // "YYYY/MM/DD HH:MM:SS" -> "YYYY-MM-DDTHH:MM:SS"
  if (/^\d{4}\/\d{2}\/\d{2}\s+\d{1,2}:\d{2}:\d{2}$/.test(s)) {
    const [datePart, timePart] = s.split(/\s+/, 2);
    const dateIso = datePart.replace(/\//g, '-');
    const timeIso = timePart.length === 7 ? `0${timePart}` : timePart;
    return `${dateIso}T${timeIso}`;
  }
  // "YYYY-MM-DD HH:MM:SS -0300" -> "YYYY-MM-DDTHH:MM:SS-03:00"
  if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}\s+[+-]\d{4}$/.test(s)) {
    const [datePart, timePart, offsetPart] = s.split(/\s+/, 3);
    const offset = offsetPart.replace(/^([+-]\d{2})(\d{2})$/, '$1:$2');
    return `${datePart}T${timePart}${offset}`;
  }
  return null;
}

function secondsOffsetToIso(raw: unknown): string | null {
  const n = typeof raw === 'number' ? raw : Number.parseInt(toStringOrNull(raw) ?? '', 10);
  if (!Number.isFinite(n)) return null;

  const totalMinutes = Math.trunc(n / 60);
  const sign = totalMinutes < 0 ? '-' : '+';
  const abs = Math.abs(totalMinutes);
  const hh = String(Math.trunc(abs / 60)).padStart(2, '0');
  const mm = String(abs % 60).padStart(2, '0');
  return `${sign}${hh}:${mm}`;
}

function inferYearForMonthDay(receivedIso: string | undefined, month: number): number | null {
  if (!receivedIso) return null;
  const d = new Date(receivedIso);
  if (!Number.isFinite(d.getTime())) return null;
  const receivedYear = d.getUTCFullYear();
  const receivedMonth = d.getUTCMonth() + 1;
  return month > receivedMonth ? receivedYear - 1 : receivedYear;
}

function monthDayTimeToIsoLocal(raw: unknown, receivedIso: string | undefined): string | null {
  const s = toStringOrNull(raw);
  if (!s) return null;
  const m = /^(\d{2})-(\d{2})\s+(\d{2}:\d{2}:\d{2})$/.exec(s.trim());
  if (!m) return null;
  const month = Number.parseInt(m[1], 10);
  const day = Number.parseInt(m[2], 10);
  const time = m[3];
  if (!Number.isFinite(month) || !Number.isFinite(day) || month < 1 || month > 12 || day < 1 || day > 31) return null;
  const year = inferYearForMonthDay(receivedIso, month);
  if (!year) return null;
  return `${String(year).padStart(4, '0')}-${m[1]}-${m[2]}T${time}`;
}

function formatMac(raw: unknown): string | null {
  const s = toStringOrNull(raw);
  if (!s) return null;
  const hex = s.replace(/[^0-9a-fA-F]/g, '');
  if (hex.length === 12) {
    return hex.toUpperCase().match(/.{2}/g)?.join(':') ?? null;
  }
  if (/^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/.test(s)) return s.toUpperCase();
  return s;
}

const RAW_FIELD = '__raw';

function withRaw<T extends object>(value: T, raw: unknown): T {
  try {
    Object.defineProperty(value, RAW_FIELD, { value: raw, enumerable: false });
  } catch {
    // best-effort
  }
  return value;
}

function bytesToMb(raw: unknown): number | null {
  const n = typeof raw === 'number' ? raw : Number.parseInt(toStringOrNull(raw) ?? '', 10);
  if (!Number.isFinite(n)) return null;
  if (n < 0) return null;
  return Math.round(n / (1024 * 1024));
}

function toIntOrNull(raw: unknown): number | null {
  const n = Number.parseInt(toStringOrNull(raw) ?? '', 10);
  return Number.isFinite(n) ? n : null;
}

function truncateText(value: string, maxChars: number): { text: string; truncated: boolean } {
  if (value.length <= maxChars) return { text: value, truncated: false };
  const clipped = value.slice(0, Math.max(0, maxChars)).trimEnd();
  return { text: clipped + '…', truncated: true };
}

function buildHostHardware(host: HostInfoSummary | null): ReportViewHostHardware | null {
  if (!host) return null;

  const hardDisks = host.hardDisks.map((d) => {
    const { sizeBytes, partitions, ...rest } = d;
    const out = {
      ...rest,
      sizeMb: bytesToMb(sizeBytes),
      partitions: partitions.map((p) => {
        const { sizeBytes: pSizeBytes, freeSizeBytes, gptType, ...pRest } = p;
        return withRaw(
          {
            ...pRest,
            sizeMb: bytesToMb(pSizeBytes),
            freeMb: bytesToMb(freeSizeBytes),
          },
          { ...p, gptType },
        );
      }),
    };
    return withRaw(out, d);
  });

  const usbDevices = host.usbDevices.map((d) => {
    const { rawUuid, vfSupported, ...rest } = d;
    return withRaw(rest, { ...d, rawUuid, vfSupported });
  });

  const inputDevices = host.inputDevices.map((d) => {
    const types = new Set<string>();
    if (d.isKeyboard) types.add('keyboard');
    if (d.isMouse) types.add('mouse');
    if (d.isGameController) types.add('game-controller');

    if (types.size === 0) {
      switch (d.role) {
        case 'keyboard':
          types.add('keyboard');
          break;
        case 'mouse':
          types.add('mouse');
          break;
        case 'combo':
          types.add('keyboard');
          types.add('mouse');
          break;
        case 'gamepad':
          types.add('game-controller');
          break;
        default:
          break;
      }
    }

    const { isMouse, isKeyboard, isGameController, role, ...rest } = d;
    return withRaw(
      {
        ...rest,
        types: Array.from(types),
      },
      { ...d, isMouse, isKeyboard, isGameController, role },
    );
  });

  return withRaw(
    {
      ...host,
      hardDisks,
      usbDevices,
      inputDevices,
    },
    host,
  );
}

const PROCESS_COMMAND_MAX_CHARS = 240;

function buildHostProcesses(processes: AllProcessesSummary | null): ReportViewHostProcesses | null {
  if (!processes) return null;

  const items = processes.items.map((p) => {
    const { command, displayName, shortName, ...rest } = p as any;
    const clipped = truncateText(command ?? '', PROCESS_COMMAND_MAX_CHARS);
    const out: ReportViewHostProcesses['items'][number] = {
      ...rest,
      command: clipped.text,
      ...(clipped.truncated ? { commandTruncated: true } : {}),
    };
    return withRaw(out, { ...p, displayName, shortName });
  });

  const top = processes.top
    ? {
        ...processes.top,
        timestamp: dateTimeToIsoLocal(processes.top.timestamp) ?? processes.top.timestamp,
      }
    : undefined;

  return withRaw({ ...processes, items, top }, processes);
}

function buildLaunchdInfo(launchd: LaunchdInfoSummary | null): ReportViewLaunchdInfo | null {
  if (!launchd) return null;
  const l = launchd as unknown as Record<string, unknown>;
  const statsRaw = (l as any).stats as Record<string, unknown> | undefined;
  const stats =
    statsRaw &&
    typeof statsRaw.files === 'number' &&
    typeof statsRaw.folders === 'number' &&
    typeof statsRaw.rootOwnedFiles === 'number'
      ? {
          files: statsRaw.files,
          folders: statsRaw.folders,
          rootOwnedFiles: statsRaw.rootOwnedFiles,
        }
      : null;

  return withRaw(
    {
      formattedListing: toStringOrNull((l as any).formattedListing),
      stats,
    },
    launchd,
  );
}

function buildHostStorage(storage: MountInfoSummary | null): ReportViewHostStorage | null {
  if (!storage) return null;

  const parsed = storage.parsed;
  const alerts = parsed?.alerts
    ? {
        lowStorage: !!parsed.alerts.lowStorage,
        hddFull: !!parsed.alerts.hddFull,
        hasNtfs: !!parsed.alerts.hasNtfs,
      }
    : storage
        ? {
            lowStorage: !!storage.lowStorage,
            hddFull: !!storage.hddFull,
            hasNtfs: !!storage.hasNtfsVolumes,
          }
        : null;

  const meta = parsed?.meta
    ? {
        totalVolumes: parsed.meta.totalVolumes ?? 0,
        skippedVolumes: parsed.meta.skippedVolumes ?? 0,
        parseWarnings: parsed.meta.parseWarnings ?? [],
      }
    : null;

  const localDisks =
    parsed?.localDisks?.map((d) =>
      withRaw(
        {
          id: d.diskId,
          label: d.label,
          fs: d.filesystem,
          sizeGi: d.containerSizeGi,
          usedGi: d.usedGi,
          freeGi: d.freeGi,
          usedPct: d.capacityPercent,
          significant: d.significant,
          volumes: (d.volumes ?? []).map((v) =>
            withRaw(
              {
                id: v.id,
                label: v.label,
                mount: v.mount,
                usedGi: v.usedGi,
                flags: v.flags ?? [],
              },
              v,
            ),
          ),
        },
        d,
      ),
    ) ?? [];

  const networkShares =
    parsed?.networkShares?.map((s) =>
      withRaw(
        {
          id: s.shareId,
          label: s.label,
          protocol: s.protocol,
          source: s.source,
          mount: s.mountPoint,
          sizeGi: s.sizeGi,
          usedGi: s.usedGi,
          freeGi: s.freeGi,
          usedPct: s.capacityPercent,
        },
        s,
      ),
    ) ?? [];

  // "virtual mounts": entries that are commonly pseudo-filesystems (autofs/map/devfs)
  const virtualMounts =
    storage.volumes
      ?.filter((v) => {
        const fs = (v.filesystem ?? '').toLowerCase();
        const id = (v.identifier ?? '').toLowerCase();
        if (fs === 'devfs' || fs === 'autofs') return true;
        if (id === 'map' || id === 'map-auto_home' || id.startsWith('map ')) return true;
        return false;
      })
      .map((v) =>
        withRaw(
          {
            id: v.identifier,
            label: v.identifier,
            mount: v.mountedOn,
            usedPct: typeof v.capacity === 'number' ? v.capacity : null,
            note: 'Pseudo-filesystem entry (not a real disk volume)',
          },
          v,
        ),
      ) ?? [];

  const out: ReportViewHostStorage = {
    alerts,
    meta,
    localDisks,
    networkShares,
    virtualMounts,
  };

  return withRaw(out, storage);
}

function buildLicense(license: LicenseDataSummary | null): ReportViewLicense | null {
  if (!license) return null;
  const l = license as unknown as Record<string, unknown>;

  const expirationIso =
    dateTimeToIsoLocal((l as any).expirationDate) ??
    epochMsToIso((l as any).expirationTimestamp) ??
    toStringOrNull((l as any).expirationDate);

  const out: ReportViewLicense = {
    edition: typeof (l as any).edition === 'number' ? (l as any).edition : null,
    editionName: toStringOrNull((l as any).editionName),
    expirationIso,
    isExpired: typeof (l as any).isExpired === 'boolean' ? (l as any).isExpired : null,
    isTrial: typeof (l as any).isTrial === 'boolean' ? (l as any).isTrial : null,
    isPirated: typeof (l as any).isPirated === 'boolean' ? (l as any).isPirated : null,
  };
  return withRaw(out, license);
}

function buildVirtualNetworks(networks: NetConfigSummary | null): ReportViewVirtualNetworks | null {
  if (!networks) return null;
  const n = networks as unknown as Record<string, unknown>;
  const rawVirtualNetworks = ((n as any).networks as Array<Record<string, unknown>> | undefined) ?? [];

  const out: ReportViewVirtualNetworks = {
    kextlessMode: toStringOrNull((n as any).kextlessMode),
    hasSharedNetwork: typeof (n as any).hasSharedNetwork === 'boolean' ? (n as any).hasSharedNetwork : null,
    hasHostOnlyNetwork: typeof (n as any).hasHostOnlyNetwork === 'boolean' ? (n as any).hasHostOnlyNetwork : null,
    networks: rawVirtualNetworks.map((vn) =>
      withRaw(
        {
          name: toStringOrNull(vn.name),
          networkType: toStringOrNull(vn.networkType),
          dhcpIp: toStringOrNull(vn.dhcpIp),
          netMask: toStringOrNull(vn.netMask),
          hostIp: toStringOrNull(vn.hostIp),
          dhcpEnabled: toBoolOrNull(vn.dhcpEnabled),
          dhcpV6Enabled: toBoolOrNull(vn.dhcpV6Enabled),
        },
        vn,
      ),
    ),
  };

  return withRaw(out, networks);
}

function buildInstallHistory(history: AutoStatisticInfoSummary | null): ReportViewInstallHistory | null {
  if (!history) return null;
  const h = history as unknown as Record<string, unknown>;
  const rawInstallations = ((h as any).installations as Array<Record<string, unknown>> | undefined) ?? [];

  const installations = rawInstallations
    .map((i) => ({
      version: toStringOrNull(i.version) ?? '',
      dateIso: dateTimeToIsoLocal(i.date) ?? toStringOrNull(i.date),
    }))
    .filter((i) => i.version || i.dateIso);

  const out: ReportViewInstallHistory = {
    installationCount: typeof (h as any).installationCount === 'number' ? (h as any).installationCount : null,
    installations,
  };

  return withRaw(out, history);
}

function buildVmToolsLog(toolsLog: ToolsLogSummary | null, receivedIso: string | undefined): ReportViewVmToolsLog | null {
  if (!toolsLog) return null;

  const tl = toolsLog as unknown as Record<string, unknown>;
  const rawEntries = (tl.entries as unknown as Array<Record<string, unknown>> | undefined) ?? [];

  const entries: ReportViewVmToolsLogEntry[] = rawEntries.map((e) => {
    const rawTimestamp = toStringOrNull(e.timestamp);
    const timestampIso =
      monthDayTimeToIsoLocal(rawTimestamp, receivedIso) ??
      dateTimeToIsoLocal(rawTimestamp) ??
      epochMsToIso(rawTimestamp);
    return withRaw(
      {
        timestampIso,
        message: toStringOrNull(e.message),
      },
      e,
    );
  });

  const out: ReportViewVmToolsLog = {
    isWindows: typeof tl.isWindows === 'boolean' ? (tl.isWindows as boolean) : null,
    status: toStringOrNull(tl.status),
    entries,
    hasCorruptRegistry: typeof tl.hasCorruptRegistry === 'boolean' ? (tl.hasCorruptRegistry as boolean) : null,
    hasPrlDdIssue: typeof tl.hasPrlDdIssue === 'boolean' ? (tl.hasPrlDdIssue as boolean) : null,
    kbArticle: toStringOrNull(tl.kbArticle),
  };

  return withRaw(out, toolsLog);
}

function buildVmSettings(settings: CurrentVmModel | CurrentVmSummary | null, fallbackName: string): ReportViewVmSettings | null {
  if (!settings) return null;

  const hypervisor = { '0': 'Parallels', '1': 'Apple' };
  const videoMode = { '0': 'Scaled', '1': 'Best for Retina', '2': 'Best for external' };
  const scaleToFit = { '0': 'Off', '1': 'Auto', '2': 'Keep ratio', '3': 'Stretch' };
  const startAuto = {
    '0': 'Never',
    '1': 'When Mac Starts',
    '2': '—',
    '3': 'When PD starts',
    '4': 'When window opens',
    '5': 'When user logs in',
  };
  const startupView = { '0': 'Same as last time', '1': 'Window', '2': 'Full Screen', '3': 'Coherence', '4': 'PiP', '5': 'Headless' };
  const onWindowClose = { '1': 'Suspend', '4': 'ShutDown', '0': 'Force stop', '5': 'Keep running', '2': 'Ask' };
  const onMacShutdown = { '0': 'Stop', '1': 'Suspend', '2': 'Shut down' };
  const onVmShutdown = { '0': 'Keep window open', '1': 'Close window', '3': 'Quit PD' };
  const keyboard = { '0': 'Auto', '1': "Don't optimize", '2': 'Optimize for games' };
  const mouse = { '0': 'Auto', '1': "Don't optimize", '2': 'Optimize for games' };
  const networkMode = { '0': 'Host-Only', '1': 'Shared', '2': 'Bridged' };
  const adapterType = {
    '0': 'Legacy',
    '1': 'RealTek RTL8029AS',
    '2': 'Intel(R) PRO/1000MT',
    '3': 'Virtio',
    '4': 'Intel(R) Gigabit CT',
  };

  const st = settings as unknown as Record<string, unknown>;
  const vmName = toStringOrNull(st.vmName) ?? fallbackName;

  const rawNetAdapters = (st.netAdapters as unknown as Array<Record<string, unknown>> | undefined) ?? [];
  const netAdapters: ReportViewVmNetAdapter[] = rawNetAdapters.map((a) => {
    const modeRaw = toStringOrNull(a.mode);
    const adapterTypeRaw = toStringOrNull(a.adapterType);
    return withRaw(
      {
        name: toStringOrNull(a.adapterName),
        mode: modeRaw ? mapLabel(networkMode, modeRaw) : null,
        type: adapterTypeRaw ? mapLabel(adapterType, adapterTypeRaw) : null,
        connected: toBoolOrNull(a.connected),
        mac: formatMac(a.mac),
      },
      a,
    );
  });

  const rawUsbDevices = (st.usbDevices as unknown as Array<Record<string, unknown>> | undefined) ?? [];
  const usbDevices: ReportViewVmUsbDevice[] = rawUsbDevices.map((d) =>
    withRaw(
      {
        name: toStringOrNull(d.name),
        lastConnectedIso: epochMsToIso(d.timestamp) ?? dateTimeToIsoLocal(d.timestamp),
      },
      d,
    ),
  );

  // Derived fields exist on CurrentVmModel (booleans), and may be absent on CurrentVmSummary.
  const hasTrimEnabledRaw = (st as { hasTrimEnabled?: unknown }).hasTrimEnabled;
  const isExternalVhddRaw = (st as { isExternalVhdd?: unknown }).isExternalVhdd;

  const pauseAfterRaw = toStringOrNull(st.pauseAfter);
  const pauseAfterTimeoutRaw = toStringOrNull(st.pauseAfterTimeout);
  const pauseAfterLabel =
    pauseAfterRaw === '0'
      ? 'Disabled'
      : pauseAfterTimeoutRaw
          ? `After ${pauseAfterTimeoutRaw} sec.`
          : pauseAfterRaw;

  const out: ReportViewVmSettings = {
    vmName,
    vmUuid: toStringOrNull(st.vmUuid),
    sourceVmUuid: toStringOrNull(st.sourceVmUuid),
    vmHome: toStringOrNull(st.vmHome),
    pvmBundleRoot: toStringOrNull((st as { pvmBundleRoot?: unknown }).pvmBundleRoot),
    creationDateIso: dateTimeToIsoLocal(st.creationDate),

    startAutomatically: mapLabel(startAuto, st.startAutomatically),
    startupView: mapLabel(startupView, st.startupView),
    pauseAfter: pauseAfterLabel,
    onMacShutdown: mapLabel(onMacShutdown, st.onMacShutdown),
    onVmShutdown: mapLabel(onVmShutdown, st.onVmShutdown),
    onWindowClose: mapLabel(onWindowClose, st.onWindowClose),

    cpuCount: toIntOrNull(st.cpuCount),
    ramMb: toIntOrNull(st.ramMb),
    vramMb: toIntOrNull(st.vramMb),

    hypervisor: mapLabel(hypervisor, st.hypervisorType),
    videoMode: mapLabel(videoMode, st.videoMode),
    scaleToFit: mapLabel(scaleToFit, st.scaleToFit),
    mouse: mapLabel(mouse, st.mouse),
    keyboard: mapLabel(keyboard, st.keyboard),

    nestedVirtualization: toEnabledLabel(st.nestedVirtualization),
    highPerfGraphics: toEnabledLabel(st.highPerfGraphics),
    usb3: toEnabledLabel(st.usb3),
    reclaimDiskSpace: toEnabledLabel(st.reclaimDiskSpace),
    rollbackMode: toEnabledLabel(st.rollbackMode),

    hasTrimEnabled: toYesNoLabel(hasTrimEnabledRaw),
    isExternalVhdd: toYesNoLabel(isExternalVhddRaw),

    netAdapters,
    usbDevices,
  };

  return withRaw(out, settings);
}

function buildVmStorageAndSnapshots(storage: AdvancedVmInfoSummary | null): ReportViewVmStorageAndSnapshots | null {
  if (!storage) return null;

  const s = storage as unknown as Record<string, unknown>;
  const rawSnapshots = ((s as any).snapshots as Array<Record<string, unknown>> | undefined) ?? [];

  const snapshots = rawSnapshots.map((snap) =>
    withRaw(
      {
        name: toStringOrNull(snap.name) ?? '',
        createdIso: dateTimeToIsoLocal(snap.dateTime) ?? toStringOrNull(snap.dateTime),
      },
      snap,
    ),
  );

  const out: ReportViewVmStorageAndSnapshots = {
    snapshots,
    snapshotCount: typeof (s as any).snapshotCount === 'number' ? (s as any).snapshotCount : snapshots.length,
    pvmBundleContents: typeof (s as any).pvmBundleContents === 'string' ? ((s as any).pvmBundleContents as string) : undefined,
    hasAclIssues: typeof (s as any).hasAclIssues === 'boolean' ? ((s as any).hasAclIssues as boolean) : undefined,
    hasRootOwner: typeof (s as any).hasRootOwner === 'boolean' ? ((s as any).hasRootOwner as boolean) : undefined,
    hasDeleteSnapshotOp: typeof (s as any).hasDeleteSnapshotOp === 'boolean' ? ((s as any).hasDeleteSnapshotOp as boolean) : undefined,
    mainSnapshotMissing: typeof (s as any).mainSnapshotMissing === 'boolean' ? ((s as any).mainSnapshotMissing as boolean) : undefined,
  };

  return withRaw(out, storage);
}

export function buildReportView(
  report: ReportModel,
  markers: Marker[],
  opts?: BuildReportViewOptions,
): ReportView {
  const perVm = opts?.perVm;
  const parsedPerVm = opts?.parsedPerVm ?? {};
  const receivedIso = opts?.receivedIso;

  // ── Meta ─────────────────────────────────────────────────
  const meta: ReportViewMeta = {
    reportId: opts?.reportId ?? report.meta.reportId,
    productName: report.meta.productName,
    productVersion: report.meta.productVersion,
    reportType: report.meta.reportType,
    reportReason: report.meta.reportReason,
    receivedIso,
    timezone: report.timezone,
    timezoneOffsetIso: secondsOffsetToIso(report.timezone?.timezoneOffset),
  };

  // ── Markers ──────────────────────────────────────────────
  const viewMarkers: ReportViewMarker[] = markers.map((m) => ({
    id: m.id,
    severity: m.severity,
    label: m.label,
    tooltip: m.tooltip,
    target: serializeMarkerTarget(m.target),
  }));

  // ── Host ─────────────────────────────────────────────────
  const host: ReportViewHost = {
    hardware: buildHostHardware(report.hostDevices),
    gpu: report.moreHostInfo,
    storage: buildHostStorage(report.storage),
    kexts: report.drivers,
    processes: buildHostProcesses(report.processes),
    services: buildLaunchdInfo(report.launchdInfo),
    installedApps: report.installedSoftware,
  };

  // ── Parallels ────────────────────────────────────────────
  const parallels: ReportViewParallels = {
    license: buildLicense(report.license),
    virtualNetworks: buildVirtualNetworks(report.network),
    appConfig: report.appConfig,
    client: report.clientInfo,
    proxy: report.proxy,
    installHistory: buildInstallHistory(report.autoStatisticInfo),
  };

  // ── VMs ──────────────────────────────────────────────────
  const currentUuidKey = normalizeUuid(report.currentVm?.vmUuid) ?? '';
  const directoryVms = report.vmDirectory?.vms ?? [];

  const vms: ReportViewVm[] = directoryVms
    .filter((vm) => vm.uuid && vm.name)
    .map((vm) => {
      const uuidRaw = toStringOrNull(vm.uuid) ?? '';
      const uuidKey = normalizeUuid(uuidRaw) ?? uuidRaw.toLowerCase();
      const isCurrent = !!uuidKey && !!currentUuidKey && uuidKey === currentUuidKey;

      // Build file paths from perVm discovery
      const files: ReportViewVmFiles = {};
      if (perVm) {
        if (perVm.vmConfigByUuid[uuidKey]) files.configPvs = perVm.vmConfigByUuid[uuidKey].path;
        if (perVm.vmLogByUuid[uuidKey]) files.vmLog = perVm.vmLogByUuid[uuidKey].path;
        if (perVm.toolsLogByUuid[uuidKey]) files.toolsLog = perVm.toolsLogByUuid[uuidKey].path;

        // Current VM may use non-UUID-prefixed files
        if (isCurrent) {
          if (!files.vmLog && perVm.currentVmLog) files.vmLog = perVm.currentVmLog.path;
          if (!files.toolsLog && perVm.currentToolsLog) files.toolsLog = perVm.currentToolsLog.path;
        }
      }

      if (isCurrent) {
        const settings = buildVmSettings(report.currentVm, vm.name ?? uuidKey);
        const storageAndSnapshots = buildVmStorageAndSnapshots(report.advancedVm);
        const toolsLog = buildVmToolsLog(report.toolsLog, receivedIso);
        return {
          uuid: uuidRaw || uuidKey,
          uuidKey,
          name: vm.name ?? uuidKey,
          isCurrent: true,
          settings,
          guestOs: report.guestOs,
          guestCommands: report.guestCommands,
          storageAndSnapshots,
          toolsLog,
          systemLog: report.systemLog,
          files,
        };
      }

      // Non-current VM: use per-VM parsed data if available
      const perVmData = parsedPerVm[uuidKey];
      const settings = buildVmSettings(perVmData?.settings ?? null, vm.name ?? uuidKey);
      return {
        uuid: uuidRaw || uuidKey,
        uuidKey,
        name: vm.name ?? uuidKey,
        isCurrent: false,
        settings,
        guestOs: null,
        guestCommands: null,
        storageAndSnapshots: null,
        toolsLog: buildVmToolsLog(perVmData?.toolsLog ?? null, receivedIso),
        systemLog: null,
        files,
      };
    });

  return { meta, markers: viewMarkers, host, parallels, vms };
}
