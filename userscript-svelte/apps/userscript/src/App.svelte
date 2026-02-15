<script lang="ts">
  import { onMount } from 'svelte';

  import { ReportViewer } from '@prv/report-ui-svelte';
  import { buildNodesFromReport, type NodeModel } from '@prv/report-viewmodel';
  import { buildReportModelFromRawPayloads, evaluateRules, type Marker } from '@prv/report-core';

  import { loadFullReport, loadReportFromXML } from './lib/reportLoader';

  let { context = 'reportus' }: { context?: 'reportus' | string } = $props();

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

  let nodes = $state<NodeModel[]>([]);
  let markers = $state<Marker[]>([]);

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

  onMount(() => {
    loadAndBuild();
  });
</script>

<ReportViewer {context} nodes={nodes} markers={markers} />

