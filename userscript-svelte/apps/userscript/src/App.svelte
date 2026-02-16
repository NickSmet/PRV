<script lang="ts">
  import { onMount } from 'svelte';

  import { RealityViewer, builtinSectionIcons, reportusParserIcons, iconUrlByIconKey, type FetchContentFn } from '@prv/report-ui-svelte';
  import { buildNodesFromReport, buildRealityModel, type NodeModel, type RealityModel } from '@prv/report-viewmodel';
  import {
    buildReportModelFromRawPayloads,
    evaluateRules,
    type Marker,
    type CurrentVmModel,
    type HostInfoSummary,
    type GuestCommandsSummary
  } from '@prv/report-core';

  import { loadFullReport, loadReportFromXML } from './lib/reportLoader';

  declare global {
    interface Window {
      __prv_currentVmXml?: string;
      __prv_guestOsXml?: string;
      __prv_licenseDataJson?: string;
      __prv_netConfigXml?: string;
      __prv_advancedVmInfoXml?: string;
      __prv_hostInfoXml?: string;
      __prv_loadedDriversText?: string;
      __prv_mountInfoText?: string;
      __prv_allProcessesText?: string;
      __prv_moreHostInfoXml?: string;
      __prv_vmDirectoryXml?: string;
      __prv_guestCommandsJson?: string;
      __prv_appConfigXml?: string;
      __prv_clientInfoText?: string;
      __prv_clientProxyInfoText?: string;
      __prv_installedSoftwareText?: string;
      __prv_timezoneXml?: string;
      __prv_toolsLogText?: string;
      __prv_parallelsSystemLogText?: string;
      __prv_launchdInfoText?: string;
      __prv_autoStatisticInfoXml?: string;
    }
  }

  let reportId = $state('');
  let nodes = $state<NodeModel[]>([]);
  let markers = $state<Marker[]>([]);
  let reality = $state<RealityModel | null>(null);
  let reportMeta = $state({
    report_id: 0 as number,
    report_type: null as string | null,
    report_reason: null as string | null,
    product: null as string | null,
    product_version: null as string | null,
    received: null as string | null,
    parsed: null as string | null,
    problem_description: null as string | null,
    server_uuid: null as string | null,
    computer_model: null as string | null,
    md5: null as string | null
  });
  let hostSummary = $state({
    os: null as string | null,
    cpu: null as string | null,
    ramGb: null as number | null,
    isNotebook: null as boolean | null,
    computerModel: null as string | null,
    systemDisk: null as { free: string | null; capacity: string | null } | null
  });
  let vmIpsByUuid = $state<Record<string, string[]>>({});
  let vmConfigByUuid = $state<Record<string, CurrentVmModel | null>>({});
  let toolsLogMetaByUuid = $state<Record<string, { status?: string; hasCorruptRegistry?: boolean; hasPrlDdIssue?: boolean; kbArticle?: string } | null>>({});

  function getReportId(): string {
    const match = window.location.pathname.match(/\/reports\/(\d+)/);
    return match?.[1] ?? '0';
  }

  function rebuildFromGlobals() {
    const payloads = {
      TimeZone: window.__prv_timezoneXml,
      CurrentVm: window.__prv_currentVmXml,
      GuestOs: window.__prv_guestOsXml,
      LicenseData: window.__prv_licenseDataJson,
      NetConfig: window.__prv_netConfigXml,
      AdvancedVmInfo: window.__prv_advancedVmInfoXml,
      HostInfo: window.__prv_hostInfoXml,
      LoadedDrivers: window.__prv_loadedDriversText,
      MountInfo: window.__prv_mountInfoText,
      AllProcesses: window.__prv_allProcessesText,
      MoreHostInfo: window.__prv_moreHostInfoXml,
      VmDirectory: window.__prv_vmDirectoryXml,
      GuestCommands: window.__prv_guestCommandsJson,
      AppConfig: window.__prv_appConfigXml,
      ClientInfo: window.__prv_clientInfoText,
      ClientProxyInfo: window.__prv_clientProxyInfoText,
      InstalledSoftware: window.__prv_installedSoftwareText,
      ToolsLog: window.__prv_toolsLogText,
      ParallelsSystemLog: window.__prv_parallelsSystemLogText,
      LaunchdInfo: window.__prv_launchdInfoText,
      AutoStatisticInfo: window.__prv_autoStatisticInfoXml
    } as const;

    const { report } = buildReportModelFromRawPayloads(payloads);
    const nextMarkers = evaluateRules(report);
    markers = nextMarkers;
    nodes = buildNodesFromReport(report, nextMarkers);

    // Build RealityModel (sections / cards / VM structure)
    reportId = getReportId();
    reality = buildRealityModel({ reportId, report });

    // reportMeta from canonical model
    reportMeta = {
      report_id: Number(report.meta.reportId ?? reportId) || 0,
      report_type: report.meta.reportType ?? null,
      report_reason: report.meta.reportReason ?? null,
      product: report.meta.productName ?? null,
      product_version: report.meta.productVersion ?? null,
      received: null,
      parsed: null,
      problem_description: null,
      server_uuid: null,
      computer_model: null,
      md5: null
    };

    // hostSummary from HostInfoSummary
    const host = report.hostDevices as HostInfoSummary | null;
    const storageVolumes = report.storage?.volumes ?? [];
    const systemVolume = storageVolumes.find((v) => v.mountedOn === '/');
    hostSummary = {
      os: host?.system?.os?.displayString ?? host?.system?.os?.version ?? null,
      cpu: host?.system?.cpu?.model ?? null,
      ramGb: host?.system?.memory?.hostRamGb ?? null,
      isNotebook: host?.system?.isNotebook ?? null,
      computerModel: null,
      systemDisk: systemVolume
        ? { free: systemVolume.free ?? null, capacity: systemVolume.capacityStr ?? null }
        : null
    };

    // vmConfigByUuid — current VM config
    const currentUuid = (report.currentVm?.vmUuid ?? '').trim().toLowerCase();
    vmConfigByUuid = {};
    if (currentUuid && report.currentVm) {
      vmConfigByUuid[currentUuid] = report.currentVm;
    }

    // vmIpsByUuid from guest commands
    vmIpsByUuid = {};
    const guest = report.guestCommands as GuestCommandsSummary | null;
    if (currentUuid && guest?.network?.adapters?.length) {
      const ips = new Set<string>();
      for (const a of guest.network.adapters) {
        if (a.ip) ips.add(a.ip);
        if (a.ipv6) ips.add(a.ipv6);
      }
      vmIpsByUuid[currentUuid] = Array.from(ips);
    }

    // toolsLogMetaByUuid from parsed tools log
    toolsLogMetaByUuid = {};
    if (currentUuid && report.toolsLog) {
      toolsLogMetaByUuid[currentUuid] = {
        status: report.toolsLog.status,
        hasCorruptRegistry: report.toolsLog.hasCorruptRegistry,
        hasPrlDdIssue: report.toolsLog.hasPrlDdIssue,
        kbArticle: report.toolsLog.kbArticle
      };
    }
  }

  async function loadAndBuild() {
    if (window.__prv_currentVmXml) {
      rebuildFromGlobals();
      return;
    }

    const pre = document.querySelector('pre');
    if (pre && pre.textContent?.includes('<ParallelsProblemReport')) {
      loadReportFromXML(pre.textContent);
      rebuildFromGlobals();
      return;
    }

    const ok = await loadFullReport();
    if (ok) {
      rebuildFromGlobals();
    }
  }

  /** Map nodeKey → window global name for raw content display */
  const nodeKeyToGlobal: Record<string, string> = {
    TimeZone: '__prv_timezoneXml',
    CurrentVm: '__prv_currentVmXml',
    GuestOs: '__prv_guestOsXml',
    LicenseData: '__prv_licenseDataJson',
    NetConfig: '__prv_netConfigXml',
    AdvancedVmInfo: '__prv_advancedVmInfoXml',
    HostInfo: '__prv_hostInfoXml',
    LoadedDrivers: '__prv_loadedDriversText',
    MountInfo: '__prv_mountInfoText',
    AllProcesses: '__prv_allProcessesText',
    MoreHostInfo: '__prv_moreHostInfoXml',
    VmDirectory: '__prv_vmDirectoryXml',
    GuestCommands: '__prv_guestCommandsJson',
    AppConfig: '__prv_appConfigXml',
    ClientInfo: '__prv_clientInfoText',
    ClientProxyInfo: '__prv_clientProxyInfoText',
    InstalledSoftware: '__prv_installedSoftwareText',
    ToolsLog: '__prv_toolsLogText',
    ParallelsSystemLog: '__prv_parallelsSystemLogText',
    LaunchdInfo: '__prv_launchdInfoText',
    AutoStatisticInfo: '__prv_autoStatisticInfoXml'
  };

  const fetchContent: FetchContentFn = async (item) => {
    if (item.kind === 'node') {
      const globalKey = nodeKeyToGlobal[item.nodeKey];
      const raw = globalKey ? (window as any)[globalKey] : undefined;
      if (typeof raw === 'string') {
        return { text: raw, truncated: false, source: 'embedded' };
      }
      return null;
    }
    // File items not available in userscript context
    return null;
  };

  onMount(() => {
    loadAndBuild();
  });
</script>

{#if reality}
  <RealityViewer
    {reportId}
    {reality}
    {reportMeta}
    {hostSummary}
    {vmIpsByUuid}
    {markers}
    {nodes}
    rawItems={[]}
    {vmConfigByUuid}
    {toolsLogMetaByUuid}
    sectionIconUrls={{
      host: builtinSectionIcons.hostApple,
      parallels: builtinSectionIcons.parallels,
      vms: reportusParserIcons.vms
    }}
    vmIconUrl={reportusParserIcons.vms}
    iconUrlByKey={iconUrlByIconKey}
    {fetchContent}
  />
{:else}
  <div style="padding: 16px; font-family: system-ui; font-size: 13px; color: #64748b;">
    Loading report data...
  </div>
{/if}
