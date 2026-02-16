<script lang="ts">
  import Badge from '../ui/badge.svelte';
  import { CopyButton } from '../../ui/copy-button';
  import * as Collapsible from '../ui/collapsible';
  import DenseChevron from '../dense/DenseChevron.svelte';

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

  function toggleSubSection(key: string) {
    if (subSectionStates) {
      subSectionStates[key] = !subSectionStates[key];
    } else {
      internalSubSectionStates[key] = !internalSubSectionStates[key];
    }
  }
</script>

{#if node.id === 'current-vm'}
  <CompactCurrentVm {node} {markers} {iconUrlByKey} />
{:else if node.id === 'advanced-vm-info'}
  {@const summary = node.data as any}
  {#if summary}
    <AdvancedVmInfoView {summary} />
  {:else}
    <div class="text-[11px] text-muted-foreground">No AdvancedVmInfo data</div>
  {/if}
{:else if node.id === 'mount-info'}
  {@const summary = node.data as any}
  {#if summary}
    <MountInfoView {summary} />
  {:else}
    <div class="text-[11px] text-muted-foreground">No MountInfo data</div>
  {/if}
{:else if node.id === 'all-processes'}
  {@const summary = node.data as any}
  {#if summary}
    <AllProcessesView {summary} />
  {:else}
    <div class="text-[11px] text-muted-foreground">No AllProcesses data</div>
  {/if}
{:else if node.id === 'guest-commands'}
  {@const summary = node.data as any}
  {#if summary}
    <GuestCommandsView {summary} />
  {:else}
    <div class="text-[11px] text-muted-foreground">No GuestCommands data</div>
  {/if}
{:else if node.id === 'more-host-info'}
  {@const summary = node.data as any}
  {#if summary}
    <MoreHostInfoView {summary} />
  {:else}
    <div class="text-[11px] text-muted-foreground">No MoreHostInfo data</div>
  {/if}
{:else if node.id === 'host-info'}
  {@const summary = node.data as any}
  {#if summary}
    <HostInfoView {summary} />
  {:else}
    <div class="text-[11px] text-muted-foreground">No HostInfo data</div>
  {/if}
{:else if node.id === 'vm-directory'}
  {@const summary = node.data as any}
  {#if summary}
    <VmDirectoryView {summary} />
  {:else}
    <div class="text-[11px] text-muted-foreground">No VmDirectory data</div>
  {/if}
{:else if node.id === 'net-config'}
  {@const summary = node.data as any}
  {#if summary}
    <NetConfigView {summary} />
  {:else}
    <div class="text-[11px] text-muted-foreground">No NetConfig data</div>
  {/if}
{:else if node.id === 'launchd-info'}
  {@const summary = node.data as any}
  {#if summary}
    <LaunchdInfoView {summary} />
  {:else}
    <div class="text-[11px] text-muted-foreground">No LaunchdInfo data</div>
  {/if}
{:else}
  <!-- Generic node renderer -->
  {#each node.sections as section (section.title)}
    <div class="space-y-0">
      <div class="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground py-1 border-b border-slate-100">
        {section.title}
      </div>
      {#if section.rows.filter((r) => matchesFilter(node, r)).length === 0}
        <div class="text-[11px] text-muted-foreground py-1 px-1">No matches</div>
      {:else}
        {#each section.rows.filter((r) => matchesFilter(node, r)) as row, idx (row.label + '::' + (row.value ?? '') + '::' + idx)}
          <div class="flex items-center justify-between py-[2px] px-1 text-[11px]">
            <span class="text-muted-foreground flex items-center gap-1">
              {#if row.iconKey}
                <PrvIcon iconKey={row.iconKey} {iconUrlByKey} size={13} class="text-muted-foreground" />
              {/if}
              {row.label}
            </span>
            <span class="text-right">
              {#if row.badge}
                <Badge variant={row.badge.variant} class="text-[9px]">
                  {row.badge.label}
                </Badge>
              {:else if row.value && (row.type === 'path' || row.type === 'uuid')}
                <CopyButton
                  text={row.value}
                  size="sm"
                  variant="ghost"
                  class="h-auto min-h-5 px-1 font-mono text-[10px] text-muted-foreground hover:text-foreground whitespace-normal break-all text-right"
                >
                  {row.value}
                </CopyButton>
              {:else if row.value && row.type === 'datetime'}
                <span class="font-mono text-[10px] text-muted-foreground">{row.value}</span>
              {:else}
                <span class="font-medium">{row.value}</span>
              {/if}
            </span>
          </div>
        {/each}
      {/if}

      {#if section.subSections && section.subSections.length}
        {#each section.subSections as sub (sub.id)}
          {@const subKey = getSubSectionKey(node.id, section.title, sub.id)}
          {@const isOpen = !!states[subKey]}
          <Collapsible.Root open={isOpen} onOpenChange={() => toggleSubSection(subKey)}>
            <Collapsible.Trigger class="w-full">
              <div
                class={`flex items-center gap-1.5 py-[5px] px-1 pl-2 min-h-[28px] cursor-pointer select-none border-b border-slate-100
                  ${isOpen ? 'bg-slate-50/80' : 'bg-transparent'}
                  hover:bg-slate-50/50`}
              >
                <DenseChevron open={isOpen} />
                {#if sub.iconKey}
                  <PrvIcon iconKey={sub.iconKey} {iconUrlByKey} size={13} class="text-muted-foreground opacity-70" />
                {/if}
                <span class="text-[12px] font-semibold text-slate-700 shrink-0">{sub.title}</span>
                <div class="flex-1"></div>
              </div>
            </Collapsible.Trigger>
            <Collapsible.Content>
              <div class="py-0.5 px-2 pl-6 border-b border-slate-100 bg-slate-50/30">
                {#each sub.rows.filter((r) => matchesFilter(node, r)) as row, idx (row.label + '::' + (row.value ?? '') + '::' + idx)}
                  <div class="flex items-center justify-between py-[2px] text-[11px]">
                    <span class="text-muted-foreground">{row.label}</span>
                    <span class="text-right">
                      {#if row.badge}
                        <Badge variant={row.badge.variant} class="text-[9px]">
                          {row.badge.label}
                        </Badge>
                      {:else if row.value && (row.type === 'path' || row.type === 'uuid')}
                        <CopyButton
                          text={row.value}
                          size="sm"
                          variant="ghost"
                          class="h-auto min-h-5 px-1 font-mono text-[10px] text-muted-foreground hover:text-foreground whitespace-normal break-all text-right"
                        >
                          {row.value}
                        </CopyButton>
                      {:else if row.value && row.type === 'datetime'}
                        <span class="font-mono text-[10px] text-muted-foreground">{row.value}</span>
                      {:else}
                        <span class="font-medium">{row.value}</span>
                      {/if}
                    </span>
                  </div>
                {/each}
              </div>
            </Collapsible.Content>
          </Collapsible.Root>
        {/each}
      {/if}
    </div>
  {/each}
{/if}
