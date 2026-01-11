<script lang="ts">
  import './app.css';
  import { onMount } from 'svelte';

  import {
    HardDrive,
    Network,
    Plane,
    Monitor,
    AlertTriangle,
    Keyboard,
    Mouse,
    Disc,
    Webcam,
    Bluetooth,
    Usb,
    Printer,
    Cloud,
    FolderOpen,
    Clipboard,
    Clock,
    Shield,
    Cpu
  } from '@lucide/svelte';

  import {
    buildCurrentVmNode,
    buildCurrentVmNodeWithMarkers,
    buildGuestOsNode,
    buildLicenseDataNode,
    buildNetConfigNode,
    buildAdvancedVmInfoNode,
    buildHostInfoNode,
    // Phase 2 builders
    buildLoadedDriversNode,
    buildMountInfoNode,
    buildAllProcessesNode,
    buildMoreHostInfoNode,
    buildVmDirectoryNode,
    // Phase 3 builders
    buildGuestCommandsNode,
    buildAppConfigNode,
    buildClientInfoNode,
    buildClientProxyInfoNode,
    buildInstalledSoftwareNode,
    // Phase 4 builders
    buildTimeZoneNode,
    buildToolsLogNode,
    buildParallelsSystemLogNode,
    buildLaunchdInfoNode,
    buildAutoStatisticInfoNode,
    type NodeModel,
    type NodeRow
  } from './lib/nodeBuilder';
  import type { Marker } from './lib/types/markers';
  import { loadFullReport, loadReportFromXML } from './lib/reportLoader';

  // shadcn-svelte components
  import Badge from '$lib/components/ui/badge.svelte';
  import Input from '$lib/components/ui/input.svelte';
  import * as Collapsible from '$lib/components/ui/collapsible';
  import { CopyButton } from './ui/copy-button';
  // import CompactLayoutDemo from '$lib/components/compact/CompactLayoutDemo.svelte';
  import CompactCurrentVm from '$lib/components/compact/CompactCurrentVm.svelte';

  // Svelte 5 props using $props() rune
  let { context = 'reportus' }: { context?: 'reportus' | string } = $props();

  declare global {
    interface Window {
      __prv_currentVmXml?: string;
      __prv_guestOsXml?: string;
      __prv_licenseDataJson?: string;
      __prv_netConfigXml?: string;
      __prv_advancedVmInfoXml?: string;
      __prv_hostInfoXml?: string;
      // Phase 2 globals
      __prv_loadedDriversText?: string;
      __prv_mountInfoText?: string;
      __prv_allProcessesText?: string;
      __prv_moreHostInfoXml?: string;
      __prv_vmDirectoryXml?: string;
      // Phase 3 globals
      __prv_guestCommandsJson?: string;
      __prv_appConfigXml?: string;
      __prv_clientInfoText?: string;
      __prv_clientProxyInfoText?: string;
      __prv_installedSoftwareText?: string;
      // Phase 4 globals
      __prv_timezoneXml?: string;
      __prv_toolsLogText?: string;
      __prv_parallelsSystemLogText?: string;
      __prv_launchdInfoText?: string;
      __prv_autoStatisticInfoXml?: string;
    }
  }
  
  const sampleCurrentVmXml = `
  <ParallelsVirtualMachine>
    <Identification>
      <VmName>Sample VM</VmName>
      <VmHome>/Users/demo/Parallels/Sample.pvm</VmHome>
      <VmUuid>1234-5678</VmUuid>
      <SourceVmUuid>1234-5678</SourceVmUuid>
      <VmCreationDate>2024-01-01</VmCreationDate>
    </Identification>
    <Hardware>
      <Cpu><Number>4</Number><VirtualizedHV>1</VirtualizedHV></Cpu>
      <Memory><RAM>8192</RAM></Memory>
      <Video><VideoMemorySize>512</VideoMemorySize><EnableHiResDrawing>1</EnableHiResDrawing></Video>
      <Hdd><SystemName>/Users/demo/Parallels/Sample.pvm/harddisk.hdd</SystemName><Size>64 GB</Size><SizeOnDisk>40 GB</SizeOnDisk><InterfaceType>NVMe</InterfaceType><OnlineCompactMode>1</OnlineCompactMode><DiskType>1</DiskType><Splitted>0</Splitted></Hdd>
      <NetworkAdapter><AdapterType>5</AdapterType><EmulatedType>Shared</EmulatedType><AdapterName>Shared Network</AdapterName><MAC>00:11:22:33:44:55</MAC><Connected>1</Connected><LinkRateLimit><Enable>0</Enable></LinkRateLimit></NetworkAdapter>
      <UsbConnectHistory><USBPort><SystemName>USB Device</SystemName><Timestamp>2024-04-01</Timestamp></USBPort></UsbConnectHistory>
      <TpmChip><Type>2.0</Type></TpmChip>
      <CdRom><SystemName>disk.iso</SystemName><InterfaceType>SATA</InterfaceType><Connected>0</Connected></CdRom>
    </Hardware>
    <Settings>
      <Runtime>
        <HypervisorType>0</HypervisorType>
        <ResourceQuota>100</ResourceQuota>
        <FullScreen><ScaleViewMode>1</ScaleViewMode></FullScreen>
        <UndoDisks>0</UndoDisks>
        <OptimizeModifiers>1</OptimizeModifiers>
      </Runtime>
      <Tools>
        <MouseSync><Enabled>1</Enabled></MouseSync>
        <TimeSync><Enabled>1</Enabled></TimeSync>
        <SharedFolders><GuestSharing><ShareRemovableDrives>1</ShareRemovableDrives><ShareNetworkDrives>1</ShareNetworkDrives></GuestSharing></SharedFolders>
      </Tools>
      <TravelOptions>
        <Enabled>0</Enabled>
        <Condition><Enter>0</Enter><Quit>0</Quit></Condition>
      </TravelOptions>
      <UsbController><XhcEnabled>1</XhcEnabled></UsbController>
      <SharedBluetooth><Enabled>0</Enabled></SharedBluetooth>
      <SharedCamera><Enabled>1</Enabled></SharedCamera>
    </Settings>
  </ParallelsVirtualMachine>`;

  const sampleGuestOsXml = `
  <GuestOsInformation>
    <ConfOsType>Windows</ConfOsType>
    <RealOsVersion>Windows 11 Pro, Version 22H2</RealOsVersion>
    <OsKernelVersion>10.0.22621</OsKernelVersion>
  </GuestOsInformation>`;

  const sampleLicenseDataJson = `{
    "license": {
      "edition": 3,
      "main_period_ends_at": "2025-12-31T23:59:59Z",
      "is_auto_renewable": true,
      "is_beta": false,
      "is_bytebot": false,
      "is_china": false,
      "is_expired": false,
      "is_grace_period": false,
      "is_nfr": false,
      "is_purchased_online": true,
      "is_sublicense": false,
      "is_suspended": false,
      "is_trial": false,
      "is_upgrade": false
    }
  }`;

  const sampleNetConfigXml = `
  <ParallelsNetworkConfig>
    <UseKextless>1</UseKextless>
    <VirtualNetworks>
      <VirtualNetwork>
        <NetworkType>1</NetworkType>
        <Description>Shared Networking</Description>
        <HostOnlyNetwork>
          <DhcpIPAddress>10.211.55.1</DhcpIPAddress>
          <IPNetMask>255.255.255.0</IPNetMask>
          <HostIPAddress>10.211.55.2</HostIPAddress>
          <DHCPServer><Enabled>1</Enabled></DHCPServer>
          <DHCPv6Server><Enabled>0</Enabled></DHCPv6Server>
        </HostOnlyNetwork>
      </VirtualNetwork>
      <VirtualNetwork>
        <NetworkType>2</NetworkType>
        <Description>Host-Only Networking</Description>
        <HostOnlyNetwork>
          <DhcpIPAddress>10.37.129.1</DhcpIPAddress>
          <IPNetMask>255.255.255.0</IPNetMask>
          <HostIPAddress>10.37.129.2</HostIPAddress>
          <DHCPServer><Enabled>1</Enabled></DHCPServer>
          <DHCPv6Server><Enabled>0</Enabled></DHCPv6Server>
        </HostOnlyNetwork>
      </VirtualNetwork>
    </VirtualNetworks>
  </ParallelsNetworkConfig>`;

  const sampleAdvancedVmInfoXml = `
  <AdvancedVmInfo>
    <SavedStateItem>
      <Name>Snapshot 1</Name>
      <DateTime>2024-11-15 10:30:00</DateTime>
    </SavedStateItem>
    <SavedStateItem>
      <Name>Snapshot 2</Name>
      <DateTime>2024-11-20 14:45:00</DateTime>
    </SavedStateItem>
    <SavedStateItem>
      <Name>Before Update</Name>
      <DateTime>2024-11-25 09:00:00</DateTime>
    </SavedStateItem>
  </AdvancedVmInfo>

  /Users/demo/Parallels/Sample.pvm:
  -rw-r--r--  1 demo  staff  1024 Nov 30 10:00 config.pvs
  drwxr-xr-x  3 demo  staff   96 Nov 30 10:00 harddisk.hdd
  -rw-r--r--  1 demo  staff  2048 Nov 30 10:00 {860e329aab41}.hds`;

  const sampleHostInfoXml = `
  <ParallelsHostInfo>
    <UsbDevice>
      <Name>Apple Keyboard</Name>
      <Uuid>usb-device-001</Uuid>
    </UsbDevice>
    <UsbDevice>
      <Name>Logitech Mouse</Name>
      <Uuid>usb-device-002</Uuid>
    </UsbDevice>
    <HardDisk>
      <Name>Macintosh HD</Name>
      <Uuid>disk-001</Uuid>
      <Size>1000000000000</Size>
    </HardDisk>
    <HardDisk>
      <Name>AppleAPFSMedia</Name>
      <Uuid>disk-002</Uuid>
      <Size>500000000000</Size>
    </HardDisk>
    <NetworkAdapter>
      <Name>en0</Name>
      <Uuid>net-001</Uuid>
      <MacAddress>00:1A:2B:3C:4D:5E</MacAddress>
      <NetAddress>192.168.1.100</NetAddress>
    </NetworkAdapter>
    <Camera>
      <Name>FaceTime HD Camera</Name>
      <Uuid>cam-001</Uuid>
    </Camera>
    <HIDDevice>
      <Name>Apple Internal Keyboard / Trackpad</Name>
      <Uuid>hid-001</Uuid>
    </HIDDevice>
    <Printer>
      <Name>HP LaserJet</Name>
      <Uuid>printer-001</Uuid>
    </Printer>
  </ParallelsHostInfo>`;

  // Svelte 5 runes for reactive state
  let nodeModels = $state<NodeModel[]>([buildCurrentVmNode()]);
  let markers = $state<Marker[]>([]);
  let query = $state('');
  let open = $state(new Set<string>());
  let subSectionStates = $state<Record<string, boolean>>({});
  let initialized = $state(false);

  // Derived values
  let isWidened = $derived(open.size > 0);

  // Restore state from sessionStorage on init (for HMR persistence)
  function restoreState() {
    try {
      const savedOpen = sessionStorage.getItem('prv:openNodes');
      const savedSubSections = sessionStorage.getItem('prv:subSections');

      if (savedOpen) {
        open = new Set(JSON.parse(savedOpen));
      }
      if (savedSubSections) {
        subSectionStates = JSON.parse(savedSubSections);
      }
    } catch (e) {
      console.warn('[PRV] Failed to restore state from sessionStorage:', e);
    }
  }

  // Save state to sessionStorage whenever it changes (for HMR persistence)
  $effect(() => {
    if (initialized) {
      try {
        sessionStorage.setItem('prv:openNodes', JSON.stringify(Array.from(open)));
        sessionStorage.setItem('prv:subSections', JSON.stringify(subSectionStates));
      } catch (e) {
        console.warn('[PRV] Failed to save state to sessionStorage:', e);
      }
    }
  });

  // Initialize open set after nodeModels is defined (only once)
  $effect(() => {
    if (nodeModels.length > 0 && !initialized) {
      // Try to restore previous state first
      const hadSavedState = sessionStorage.getItem('prv:openNodes');
      if (hadSavedState) {
        restoreState();
      } else {
        // No saved state, use defaults
        open = new Set(nodeModels.filter((n) => n.openByDefault).map((n) => n.id));
      }
      initialized = true;
    }
  });

  function rebuild(xml: string) {
    const useSample = (window as any).__prv_useSampleVm === true;
    const effectiveXml = xml || window.__prv_currentVmXml || (useSample ? sampleCurrentVmXml : undefined);

    const nodes: NodeModel[] = [];
    let allMarkers: Marker[] = [];

    // Build CurrentVm node
    if (!effectiveXml) {
      console.warn('[PRV] rebuild called with no XML; showing placeholder CurrentVm node');
      nodes.push(buildCurrentVmNode());
    } else {
      console.log('[PRV] rebuild CurrentVm with XML length', effectiveXml.length, 'sampleFallback:', useSample && !xml && !window.__prv_currentVmXml);

      // Build node with markers from rule engine
      const result = buildCurrentVmNodeWithMarkers(effectiveXml);
      nodes.push(result.node);
      allMarkers = [...allMarkers, ...result.markers];

      console.log('[PRV] Generated', result.markers.length, 'markers from CurrentVm rules');
    }

    // Build GuestOs node (always use sample data for now)
    const guestOsXml = window.__prv_guestOsXml || sampleGuestOsXml;
    nodes.push(buildGuestOsNode(guestOsXml));
    console.log('[PRV] Built GuestOs node');

    // Build LicenseData node (always use sample data for now)
    const licenseJson = window.__prv_licenseDataJson || sampleLicenseDataJson;
    nodes.push(buildLicenseDataNode(licenseJson));
    console.log('[PRV] Built LicenseData node');

    // Build NetConfig node (always use sample data for now)
    const netConfigXml = window.__prv_netConfigXml || sampleNetConfigXml;
    nodes.push(buildNetConfigNode(netConfigXml));
    console.log('[PRV] Built NetConfig node');

    // Build AdvancedVmInfo node (always use sample data for now)
    const advancedVmXml = window.__prv_advancedVmInfoXml || sampleAdvancedVmInfoXml;
    nodes.push(buildAdvancedVmInfoNode(advancedVmXml));
    console.log('[PRV] Built AdvancedVmInfo node');

    // Build HostInfo node (always use sample data for now)
    const hostInfoXml = window.__prv_hostInfoXml || sampleHostInfoXml;
    nodes.push(buildHostInfoNode(hostInfoXml));
    console.log('[PRV] Built HostInfo node');

    // Build Phase 2 nodes
    nodes.push(buildLoadedDriversNode(window.__prv_loadedDriversText));
    console.log('[PRV] Built LoadedDrivers node');

    nodes.push(buildMountInfoNode(window.__prv_mountInfoText));
    console.log('[PRV] Built MountInfo node');

    nodes.push(buildAllProcessesNode(window.__prv_allProcessesText));
    console.log('[PRV] Built AllProcesses node');

    nodes.push(buildMoreHostInfoNode(window.__prv_moreHostInfoXml));
    console.log('[PRV] Built MoreHostInfo node');

    nodes.push(buildVmDirectoryNode(window.__prv_vmDirectoryXml));
    console.log('[PRV] Built VmDirectory node');

    // Build Phase 3 nodes
    nodes.push(buildGuestCommandsNode(window.__prv_guestCommandsJson));
    console.log('[PRV] Built GuestCommands node');

    nodes.push(buildAppConfigNode(window.__prv_appConfigXml));
    console.log('[PRV] Built AppConfig node');

    nodes.push(buildClientInfoNode(window.__prv_clientInfoText));
    console.log('[PRV] Built ClientInfo node');

    nodes.push(buildClientProxyInfoNode(window.__prv_clientProxyInfoText));
    console.log('[PRV] Built ClientProxyInfo node');

    nodes.push(buildInstalledSoftwareNode(window.__prv_installedSoftwareText));
    console.log('[PRV] Built InstalledSoftware node');

    // Build Phase 4 nodes
    nodes.push(buildTimeZoneNode(window.__prv_timezoneXml));
    console.log('[PRV] Built TimeZone node');

    nodes.push(buildToolsLogNode(window.__prv_toolsLogText));
    console.log('[PRV] Built ToolsLog node');

    nodes.push(buildParallelsSystemLogNode(window.__prv_parallelsSystemLogText));
    console.log('[PRV] Built ParallelsSystemLog node');

    nodes.push(buildLaunchdInfoNode(window.__prv_launchdInfoText));
    console.log('[PRV] Built LaunchdInfo node');

    nodes.push(buildAutoStatisticInfoNode(window.__prv_autoStatisticInfoXml));
    console.log('[PRV] Built AutoStatisticInfo node');

    nodeModels = nodes;
    markers = allMarkers;

    // Only set default open state on first initialization (and no saved state)
    if (!initialized && !sessionStorage.getItem('prv:openNodes')) {
      open = new Set(nodeModels.filter((n) => n.openByDefault).map((n) => n.id));
    }

    // auto-open first sub-section (e.g. Travel Mode) for better UX
    // Only do this if there's no saved state
    if (!sessionStorage.getItem('prv:subSections')) {
      const firstNode = nodeModels[0];
      const firstSectionWithSub = firstNode?.sections.find((s) => s.subSections && s.subSections.length);
      const firstSub = firstSectionWithSub?.subSections?.[0];

      if (firstNode && firstSectionWithSub && firstSub) {
        const key = `${firstNode.id}::${firstSectionWithSub.title}::${firstSub.id}`;
        subSectionStates[key] = true;
      }
    }
  }
  
  async function loadFullReportFromPage() {
    console.log('[PRV] Loading full report from server');

    const success = await loadFullReport();

    if (success) {
      console.log('[PRV] Full report loaded successfully, rebuilding nodes');
      // The data is now in window.__prv_* globals, trigger rebuild
      rebuild(window.__prv_currentVmXml || '');
    } else {
      console.error('[PRV] Failed to load full report');
    }
  }
  
  onMount(() => {
    console.log('[PRV] App mount: initializing Report Viewer panel');

    // Check if data already loaded (e.g., by userscript injection)
    if (window.__prv_currentVmXml) {
      console.log('[PRV] Using existing window.__prv_* globals');
      rebuild(window.__prv_currentVmXml);
      return;
    }

    // Try to detect if we have inline XML in a <pre> tag (for testing/dev)
    const pre = document.querySelector('pre');

    if (pre && pre.textContent?.includes('<ParallelsProblemReport')) {
      console.log('[PRV] Using inline <pre> content for full report');
      loadReportFromXML(pre.textContent);
      rebuild(window.__prv_currentVmXml || '');
      return;
    }

    // Otherwise, fetch full report from server
    console.log('[PRV] No existing data; fetching full report from server');
    loadFullReportFromPage();

    // Listen for XML reload events (from dev server HMR)
    const handleXMLReload = () => {
      console.log('[PRV] Handling XML reload event...');
      rebuild(window.__prv_currentVmXml || '');
    };

    window.addEventListener('prv:xml-reload', handleXMLReload);

    // Cleanup
    return () => {
      window.removeEventListener('prv:xml-reload', handleXMLReload);
    };
  });
  
  function toggleNode(id: string) {
    const newOpen = new Set(open);
    if (newOpen.has(id)) {
      newOpen.delete(id);
    } else {
      newOpen.add(id);
    }
    open = newOpen;
  }
  
  function matchesFilter(node: NodeModel, row: NodeRow) {
    if (!query.trim()) return true;
  
    const q = query.trim().toLowerCase();
  
    return node.title.toLowerCase().includes(q) || row.label.toLowerCase().includes(q) || (row.value?.toLowerCase().includes(q) ?? false);
  }
  
  function badgeIconComponent(iconKey: string) {
    switch (iconKey) {
      case 'hdd':
        return HardDrive;
      case 'net':
        return Network;
      case 'travel':
        return Plane;
      case 'vm':
        return Monitor;
      case 'warn':
        return AlertTriangle;
      case 'keyboard':
        return Keyboard;
      case 'mouse':
        return Mouse;
      case 'cd':
      case 'disc':
        return Disc;
      case 'camera':
        return Webcam;
      case 'bluetooth':
        return Bluetooth;
      case 'usb':
        return Usb;
      case 'printer':
        return Printer;
      case 'cloud':
        return Cloud;
      case 'folder':
        return FolderOpen;
      case 'clipboard':
        return Clipboard;
      case 'clock':
        return Clock;
      case 'shield':
        return Shield;
      case 'cpu':
        return Cpu;
      default:
        return null;
    }
  }

  function getSubSectionKey(nodeId: string, sectionTitle: string, subId: string): string {
    return `${nodeId}::${sectionTitle}::${subId}`;
  }
</script>

<div class={`rv-shell ${isWidened ? 'widened' : ''}`}>
  <header class="rv-header">
    <div>
      <p class="rv-title">Report Viewer</p>
      <Badge variant="default" class="text-xs">{context}</Badge>
    </div>
  </header>

  <Input
    type="search"
    placeholder="Search nodes, logs, assets..."
    bind:value={query}
    aria-label="Search nodes"
    class="mb-2.5"
  />

  <div class="rv-scroll">
    <!-- Compact Layout Demo Node - DISABLED -->
    <!--
    <div class="rv-node">
      <div
        class="rv-node-header"
        role="button"
        tabindex="0"
        onclick={() => toggleNode('compact-demo')}
        onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleNode('compact-demo')}
      >
        <div class="rv-node-title">
          <span>🎨 Compact Layout Prototype</span>
          <span class="rv-tags">
            <Badge variant="outline" class="text-[11px]">DEMO</Badge>
          </span>
        </div>
        <span>{open.has('compact-demo') ? '−' : '+'}</span>
      </div>
      {#if open.has('compact-demo')}
        <div class="rv-node-body">
          <CompactLayoutDemo />
        </div>
      {/if}
    </div>
    -->

    {#each nodeModels as node}
      <div class="rv-node">
        <div
          class="rv-node-header"
          role="button"
          tabindex="0"
          onclick={() => toggleNode(node.id)}
          onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleNode(node.id)}
        >
          <div class="rv-node-title">
            <span>{node.title}</span>
            {#if node.badges.length}
              <span class="rv-tags">
                {#each node.badges as badge}
                  {@const variant = badge.tone === 'danger' ? 'destructive' : badge.tone === 'warn' ? 'default' : 'outline'}
                  <Badge {variant} class="text-[11px] gap-1">
                    {#if badgeIconComponent(badge.iconKey)}
                      {@const IconComponent = badgeIconComponent(badge.iconKey)}
                      {#if IconComponent}
                        <IconComponent size={12} />
                      {/if}
                    {/if}
                    {badge.label}
                  </Badge>
                {/each}
              </span>
            {/if}
          </div>
          <span>{open.has(node.id) ? '−' : '+'}</span>
        </div>
        {#if open.has(node.id)}
          <div class="rv-node-body">
            {#if node.id === 'current-vm'}
              <!-- Compact CurrentVm rendering with markers -->
              <CompactCurrentVm {node} {markers} />
            {:else}
              <!-- Original rendering for other nodes -->
            {#each node.sections as section}
              <div class="rv-section-block">
                <div class="rv-section-heading">{section.title}</div>
                {#if section.rows.filter((r) => matchesFilter(node, r)).length === 0}
                  <div class="rv-empty">No matches</div>
                {:else}
                  {#each section.rows.filter((r) => matchesFilter(node, r)) as row}
                    <div class="rv-row">
                      <div class="rv-row-label">
                        {#if row.iconKey}
                          {@const IconComponent = badgeIconComponent(row.iconKey)}
                          {#if IconComponent}
                            <IconComponent size={14} class="inline mr-1.5 -mt-0.5" />
                          {/if}
                        {/if}
                        {row.label}
                      </div>
                      <div class="rv-row-value">
                        {#if row.badge}
                          <Badge variant={row.badge.variant} class="text-[11px]">
                            {row.badge.label}
                          </Badge>
                        {:else if row.value && (row.type === 'path' || row.type === 'uuid')}
                          <CopyButton text={row.value} size="sm" variant="ghost" class="h-auto min-h-6 px-2 font-mono text-[11px] text-muted-foreground hover:text-foreground whitespace-normal break-all text-left">
                            {row.value}
                          </CopyButton>
                        {:else if row.value && row.type === 'datetime'}
                          <span class="font-mono text-[11px] text-muted-foreground">{row.value}</span>
                        {:else}
                          {row.value}
                        {/if}
                      </div>
                    </div>
                  {/each}
                {/if}

                {#if section.subSections && section.subSections.length}
                  {#each section.subSections as sub}
                    {@const subKey = getSubSectionKey(node.id, section.title, sub.id)}
                    <div class="rv-sub-section">
                      <div
                        class="rv-sub-header"
                        role="button"
                        tabindex="0"
                        onclick={() => {
                          subSectionStates[subKey] = !subSectionStates[subKey];
                          console.log('[PRV] Sub-section toggled', { subKey, newState: subSectionStates[subKey] });
                        }}
                        onkeydown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            subSectionStates[subKey] = !subSectionStates[subKey];
                          }
                        }}
                      >
                        <div class="rv-sub-title">
                          {#if badgeIconComponent(sub.iconKey)}
                            {@const IconComponent = badgeIconComponent(sub.iconKey)}
                            {#if IconComponent}
                              <IconComponent size={13} />
                            {/if}
                          {/if}
                          <span>{sub.title}</span>
                        </div>
                        <span>{subSectionStates[subKey] ? '−' : '+'}</span>
                      </div>
                      {#if subSectionStates[subKey]}
                        <div class="rv-sub-body">
                          {#if sub.rows.filter((r) => matchesFilter(node, r)).length === 0}
                            <div class="rv-empty">No matches</div>
                          {:else}
                            {#each sub.rows.filter((r) => matchesFilter(node, r)) as row}
                              <div class="rv-row">
                                <div class="rv-row-label">
                                  {#if row.iconKey}
                                    {@const IconComponent = badgeIconComponent(row.iconKey)}
                                    {#if IconComponent}
                                      <IconComponent size={14} class="inline mr-1.5 -mt-0.5" />
                                    {/if}
                                  {/if}
                                  {row.label}
                                </div>
                                <div class="rv-row-value">
                                  {#if row.badge}
                                    <Badge variant={row.badge.variant} class="text-[11px]">
                                      {row.badge.label}
                                    </Badge>
                                  {:else if row.value && (row.type === 'path' || row.type === 'uuid')}
                                    <CopyButton text={row.value} size="sm" variant="ghost" class="h-auto min-h-6 px-2 font-mono text-[11px] text-muted-foreground hover:text-foreground whitespace-normal break-all text-left">
                                      {row.value}
                                    </CopyButton>
                                  {:else if row.value && row.type === 'datetime'}
                                    <span class="font-mono text-[11px] text-muted-foreground">{row.value}</span>
                                  {:else}
                                    {row.value}
                                  {/if}
                                </div>
                              </div>
                            {/each}
                          {/if}
                        </div>
                      {/if}
                    </div>
                  {/each}
                {/if}
              </div>
            {/each}
            {/if}
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>
