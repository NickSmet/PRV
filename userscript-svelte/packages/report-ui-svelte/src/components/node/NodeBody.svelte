<script lang="ts">
  import Badge from '../ui/badge.svelte';
  import { CopyButton } from '../../ui/copy-button';

  import CompactCurrentVm from '../compact/CompactCurrentVm.svelte';
  import AdvancedVmInfoView from '../advanced-vm-info/advanced-vm-info-view.svelte';
  import AllProcessesView from '../all-processes/all-processes-view.svelte';
  import GuestCommandsView from '../guest-commands/guest-commands-view.svelte';
  import HostInfoView from '../host-info/host-info-view.svelte';
  import LaunchdInfoView from '../launchd-info/launchd-info-view.svelte';
  import MountInfoView from '../mount-info/mount-info-view.svelte';
  import MoreHostInfoView from '../more-host-info/more-host-info-view.svelte';
  import NetConfigView from '../net-config/net-config-view.svelte';
  import VmDirectoryView from '../vm-directory/vm-directory-view.svelte';

  import type { Marker } from '@prv/report-core';
  import type { NodeModel, NodeRow } from '@prv/report-viewmodel';
  import PrvIcon from '../PrvIcon.svelte';

  type SubSectionStates = Record<string, boolean>;

  let {
    node,
    markers = [],
    query = '',
    subSectionStates,
    iconUrlByKey
  }: {
    node: NodeModel;
    markers?: Marker[];
    query?: string;
    subSectionStates?: SubSectionStates;
    iconUrlByKey?: Record<string, string>;
  } = $props();

  let internalSubSectionStates = $state<SubSectionStates>({});
  const states = $derived(subSectionStates ?? internalSubSectionStates);

  function matchesFilter(nodeModel: NodeModel, row: NodeRow): boolean {
    const q = query.trim().toLowerCase();
    if (!q) return true;

    const inTitle = nodeModel.title.toLowerCase().includes(q);
    const inLabel = row.label.toLowerCase().includes(q);
    const inValue = (row.value || '').toLowerCase().includes(q);
    return inTitle || inLabel || inValue;
  }

  function getSubSectionKey(nodeId: string, sectionTitle: string, subId: string): string {
    return `${nodeId}::${sectionTitle}::${subId}`;
  }
</script>

{#if node.id === 'current-vm'}
  <CompactCurrentVm {node} {markers} {iconUrlByKey} />
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
                <span class="inline-block mr-1.5 -mt-0.5 align-middle">
                  <PrvIcon iconKey={row.iconKey} {iconUrlByKey} size={14} />
                </span>
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
                states[subKey] = !states[subKey];
              }}
              onkeydown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  states[subKey] = !states[subKey];
                }
              }}
            >
              <div class="rv-sub-title">
                <PrvIcon iconKey={sub.iconKey} {iconUrlByKey} size={13} class="text-muted-foreground" />
                <span>{sub.title}</span>
              </div>
              <span class="rv-sub-toggle">{states[subKey] ? '−' : '+'}</span>
            </div>
            {#if states[subKey]}
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
