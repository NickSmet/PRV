<script lang="ts">
  import './styles.css';

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

  import Badge from './components/ui/badge.svelte';
  import Input from './components/ui/input.svelte';
  import { CopyButton } from './ui/copy-button';

  import CompactCurrentVm from './components/compact/CompactCurrentVm.svelte';
  import AdvancedVmInfoView from './components/advanced-vm-info/advanced-vm-info-view.svelte';
  import AllProcessesView from './components/all-processes/all-processes-view.svelte';
  import GuestCommandsView from './components/guest-commands/guest-commands-view.svelte';
  import HostInfoView from './components/host-info/host-info-view.svelte';
  import LaunchdInfoView from './components/launchd-info/launchd-info-view.svelte';
  import MountInfoView from './components/mount-info/mount-info-view.svelte';
  import MoreHostInfoView from './components/more-host-info/more-host-info-view.svelte';
  import NetConfigView from './components/net-config/net-config-view.svelte';
  import VmDirectoryView from './components/vm-directory/vm-directory-view.svelte';

  import type { Marker } from '@prv/report-core';
  import type { NodeModel, NodeRow } from '@prv/report-viewmodel';

  let {
    context = 'reportus',
    nodes,
    markers = []
  }: {
    context?: string;
    nodes: NodeModel[];
    markers?: Marker[];
  } = $props();

  let query = $state('');
  let open = $state(new Set<string>());
  let isWidened = $state(false);
  let subSectionStates = $state<Record<string, boolean>>({});

  function toggleNode(id: string) {
    if (open.has(id)) {
      open = new Set(Array.from(open).filter((x) => x !== id));
    } else {
      open = new Set([...Array.from(open), id]);
    }
  }

  function matchesFilter(node: NodeModel, row: NodeRow): boolean {
    const q = query.trim().toLowerCase();
    if (!q) return true;

    const inTitle = node.title.toLowerCase().includes(q);
    const inLabel = row.label.toLowerCase().includes(q);
    const inValue = (row.value || '').toLowerCase().includes(q);
    return inTitle || inLabel || inValue;
  }

  function badgeIconComponent(iconKey: string | undefined) {
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
    {#each nodes as node (node.id)}
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
                {#each node.badges as badge (badge.label)}
                  {@const variant =
                    badge.tone === 'danger'
                      ? 'destructive'
                      : badge.tone === 'warn'
                        ? 'default'
                        : 'outline'}
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
              <CompactCurrentVm {node} {markers} />
            {:else if node.id === 'advanced-vm-info'}
              {@const summary = node.data as any}
              {#if summary}
                <AdvancedVmInfoView {summary} />
              {:else}
                <div class="rv-empty">No AdvancedVmInfo data</div>
              {/if}
            {:else if node.id === 'mount-info'}
              {@const summary = node.data as any}
              {#if summary}
                <MountInfoView {summary} />
              {:else}
                <div class="rv-empty">No MountInfo data</div>
              {/if}
            {:else if node.id === 'all-processes'}
              {@const summary = node.data as any}
              {#if summary}
                <AllProcessesView {summary} />
              {:else}
                <div class="rv-empty">No AllProcesses data</div>
              {/if}
            {:else if node.id === 'guest-commands'}
              {@const summary = node.data as any}
              {#if summary}
                <GuestCommandsView {summary} />
              {:else}
                <div class="rv-empty">No GuestCommands data</div>
              {/if}
            {:else if node.id === 'more-host-info'}
              {@const summary = node.data as any}
              {#if summary}
                <MoreHostInfoView {summary} />
              {:else}
                <div class="rv-empty">No MoreHostInfo data</div>
              {/if}
            {:else if node.id === 'host-info'}
              {@const summary = node.data as any}
              {#if summary}
                <HostInfoView {summary} />
              {:else}
                <div class="rv-empty">No HostInfo data</div>
              {/if}
            {:else if node.id === 'vm-directory'}
              {@const summary = node.data as any}
              {#if summary}
                <VmDirectoryView {summary} />
              {:else}
                <div class="rv-empty">No VmDirectory data</div>
              {/if}
            {:else if node.id === 'net-config'}
              {@const summary = node.data as any}
              {#if summary}
                <NetConfigView {summary} />
              {:else}
                <div class="rv-empty">No NetConfig data</div>
              {/if}
            {:else if node.id === 'launchd-info'}
              {@const summary = node.data as any}
              {#if summary}
                <LaunchdInfoView {summary} />
              {:else}
                <div class="rv-empty">No LaunchdInfo data</div>
              {/if}
            {:else}
              {#each node.sections as section (section.title)}
                <div class="rv-section-block">
                  <div class="rv-section-heading">{section.title}</div>
                  {#if section.rows.filter((r) => matchesFilter(node, r)).length === 0}
                    <div class="rv-empty">No matches</div>
                  {:else}
                    {#each section.rows.filter((r) => matchesFilter(node, r)) as row, idx (row.label + '::' + (row.value ?? '') + '::' + idx)}
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
                            <CopyButton
                              text={row.value}
                              size="sm"
                              variant="ghost"
                              class="h-auto min-h-6 px-2 font-mono text-[11px] text-muted-foreground hover:text-foreground whitespace-normal break-all text-left"
                            >
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
                    {#each section.subSections as sub (sub.id)}
                      {@const subKey = getSubSectionKey(node.id, section.title, sub.id)}
                      <div class="rv-sub-section">
                        <div
                          class="rv-sub-header"
                          role="button"
                          tabindex="0"
                          onclick={() => {
                            subSectionStates[subKey] = !subSectionStates[subKey];
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
                          <span class="rv-sub-toggle">{subSectionStates[subKey] ? '−' : '+'}</span>
                        </div>
                        {#if subSectionStates[subKey]}
                          <div class="rv-sub-body">
                            {#each sub.rows.filter((r) => matchesFilter(node, r)) as row, idx (row.label + '::' + (row.value ?? '') + '::' + idx)}
                              <div class="rv-row">
                                <div class="rv-row-label">{row.label}</div>
                                <div class="rv-row-value">
                                  {#if row.badge}
                                    <Badge variant={row.badge.variant} class="text-[11px]">
                                      {row.badge.label}
                                    </Badge>
                                  {:else if row.value && (row.type === 'path' || row.type === 'uuid')}
                                    <CopyButton
                                      text={row.value}
                                      size="sm"
                                      variant="ghost"
                                      class="h-auto min-h-6 px-2 font-mono text-[11px] text-muted-foreground hover:text-foreground whitespace-normal break-all text-left"
                                    >
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

