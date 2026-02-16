<script lang="ts">
  import './styles.css';

  import Badge from './components/ui/badge.svelte';
  import RealityCard from './components/reality/RealityCard.svelte';
  import RawModal, { type FetchContentFn } from './components/reality/RawModal.svelte';
  import VmEntry from './components/reality/VmEntry.svelte';
  import NodeBody from './components/node/NodeBody.svelte';
  import DenseChevron from './components/dense/DenseChevron.svelte';
  import DenseDivider from './components/dense/DenseDivider.svelte';
  import HostInfoFlagsSummary from './components/host-info/host-info-flags-summary.svelte';
  import HostInfoSystemBanner from './components/host-info/host-info-system-banner.svelte';

  import type { Marker, CurrentVmModel, ParsedMountInfoDisk } from '@prv/report-core';
  import type {
    NodeModel,
    RealityModel,
    RealitySourceRef,
    RealityRawItem,
    RealityCardModel
  } from '@prv/report-viewmodel';
  import { buildCurrentVmNode } from '@prv/report-viewmodel';

  type ToolsLogMeta = {
    status?: string;
    hasCorruptRegistry?: boolean;
    hasPrlDdIssue?: boolean;
    kbArticle?: string;
  };

  type NodeBadge = { label: string; tone?: 'info' | 'warn' | 'danger'; iconKey?: string };

  let {
    reportId,
    reality,
    reportMeta,
    hostSummary,
    vmIpsByUuid = {},
    markers = [],
    nodes = [],
    rawItems = [],
    vmConfigByUuid = {},
    toolsLogMetaByUuid = {},
    sectionIconUrls = {},
    vmIconUrl,
    iconUrlByKey,
    fetchContent
  }: {
    reportId: string;
    reality: RealityModel;
    reportMeta: {
      report_id: number;
      report_type: string | null;
      report_reason: string | null;
      product: string | null;
      product_version: string | null;
      received: string | null;
      parsed: string | null;
      problem_description: string | null;
      server_uuid: string | null;
      computer_model: string | null;
      md5: string | null;
    };
    hostSummary: {
      os: string | null;
      cpu: string | null;
      ramGb: number | null;
      isNotebook: boolean | null;
      computerModel: string | null;
      systemDisk: { free: string | null; capacity: string | null } | null;
    };
    vmIpsByUuid?: Record<string, string[]>;
    markers?: Marker[];
    nodes?: NodeModel[];
    rawItems?: RealityRawItem[];
    vmConfigByUuid?: Record<string, CurrentVmModel | null | undefined>;
    toolsLogMetaByUuid?: Record<string, ToolsLogMeta | null | undefined>;
    sectionIconUrls?: { host?: string; parallels?: string; vms?: string };
    vmIconUrl?: string;
    iconUrlByKey?: Record<string, string>;
    fetchContent?: FetchContentFn;
  } = $props();

  // Section collapse states
  let hostOpen = $state(false);
  let parallelsOpen = $state(false);
  let vmsOpen = $state(true);
  let rawOpen = $state(false);

  let rawModalOpen = $state(false);
  let rawModalItem = $state<null | { kind: 'node'; nodeKey: string; title: string } | { kind: 'file'; filePath: string; filename: string; title: string }>(null);

  let subSectionStates = $state<Record<string, boolean>>({});

  function nodeForKey(nodeKey: string): NodeModel | null {
    const direct = nodes.find((n) => n.title === nodeKey);
    if (direct) return direct;
    if (nodeKey === 'ToolsLog') return nodes.find((n) => n.id === 'tools-log') ?? null;
    if (nodeKey === 'ParallelsSystemLog') return nodes.find((n) => n.id === 'parallels-system-log') ?? null;
    return null;
  }

  function openSource(src: RealitySourceRef) {
    if (src.kind === 'node') {
      rawModalItem = { kind: 'node', nodeKey: src.nodeKey, title: src.label ?? src.nodeKey };
      rawModalOpen = true;
      return;
    }
    rawModalItem = {
      kind: 'file',
      filePath: src.filePath,
      filename: src.filename,
      title: src.label ?? src.filename
    };
    rawModalOpen = true;
  }

  function openRawItem(item: RealityRawItem) {
    if (item.kind === 'node') {
      rawModalItem = { kind: 'node', nodeKey: item.nodeKey, title: item.title };
      rawModalOpen = true;
      return;
    }
    rawModalItem = { kind: 'file', filePath: item.filePath, filename: item.filename, title: item.filename };
    rawModalOpen = true;
  }

  function groupRawItems(items: RealityRawItem[]): Array<{ group: string; items: RealityRawItem[] }> {
    const map = new Map<string, RealityRawItem[]>();
    for (const it of items) {
      const group = it.kind === 'file' ? it.group : 'Nodes';
      const arr = map.get(group) ?? [];
      arr.push(it);
      map.set(group, arr);
    }
    const ordered = ['Nodes', 'VM configs', 'VM logs', 'Tools logs', 'Screenshots/images', 'Other'];
    const out: Array<{ group: string; items: RealityRawItem[] }> = [];
    for (const key of ordered) {
      const arr = map.get(key);
      if (arr?.length) out.push({ group: key, items: arr });
    }
    for (const [group, arr] of map.entries()) {
      if (ordered.includes(group)) continue;
      out.push({ group, items: arr });
    }
    return out;
  }

  function renderNodeCard(card: RealityCardModel) {
    if (card.render.kind !== 'nodeKey') return null;
    return nodeForKey(card.render.nodeKey);
  }

  function cardListForSection(sectionId: string): RealityCardModel[] {
    const section = reality.sections.find((s) => s.id === sectionId);
    return section?.cards ?? [];
  }

  const vmSection = $derived(reality.sections.find((s) => s.id === 'vms'));

  function selectHeaderBadges(node: NodeModel | null): NodeBadge[] {
    if (!node?.badges?.length) return [];
    const seen = new Set<string>();
    const cleaned = node.badges.filter((b) => {
      const label = String(b.label ?? '').trim();
      if (!label) return false;
      if (label === 'pending') return false;
      if (seen.has(label)) return false;
      seen.add(label);
      return true;
    });

    const danger = cleaned.filter((b) => b.tone === 'danger');
    const warn = cleaned.filter((b) => b.tone === 'warn');
    const info = cleaned.filter((b) => !b.tone || b.tone === 'info');
    return [...danger, ...warn, ...info.slice(0, 2)];
  }

  function mergeBadges(...lists: NodeBadge[][]): NodeBadge[] {
    const out: NodeBadge[] = [];
    const seen = new Set<string>();
    for (const list of lists) {
      for (const b of list) {
        const label = String(b.label ?? '').trim();
        if (!label) continue;
        if (seen.has(label)) continue;
        seen.add(label);
        out.push(b);
      }
    }
    return out;
  }

  function toolsStatusTone(status: string | undefined): 'info' | 'warn' | 'danger' {
    if (status === 'error') return 'danger';
    if (status === 'warning' || status === 'empty') return 'warn';
    return 'info';
  }

  // Count files in rawItems
  const fileCount = $derived(rawItems.filter(it => it.kind === 'file').length);
  const nodeCount = $derived(rawItems.filter(it => it.kind === 'node').length);

  // Host-level system data (cross-node lookup)
  const hostInfoNode = $derived(nodes.find((n) => n.id === 'host-info') ?? null);
  const hostInfoData = $derived(hostInfoNode?.data as any);
  const hostInfoSystem = $derived(hostInfoData?.system ?? null);
  const hostInfoFlags = $derived(hostInfoData?.flags ?? null);
  const hostInfoHasDisplayLink = $derived(hostInfoData?.hasDisplayLink ?? false);

  // System disk from mount-info (cross-node)
  const mountInfoNode = $derived(nodes.find((n) => n.id === 'mount-info') ?? null);
  const mountInfoSystemDisk = $derived.by((): ParsedMountInfoDisk | undefined => {
    const parsed = (mountInfoNode?.data as any)?.parsed;
    if (!parsed?.localDisks) return undefined;
    return (parsed.localDisks as ParsedMountInfoDisk[]).find((d: ParsedMountInfoDisk) => d.label === 'System Disk');
  });

  // System disk fallback from host-info
  const hostInfoSystemDisk = $derived.by(() => {
    if (!hostInfoData) return undefined;
    const disks = hostInfoData.hardDisks ?? [];
    for (const disk of disks) {
      if (disk.external === true || disk.isVirtualDisk === true) continue;
      const totalSize = disk.sizeBytes;
      let totalFree: number | null = null;
      for (const p of disk.partitions) {
        if (p.freeSizeBytes !== null && p.freeSizeBytes >= 0) {
          totalFree = (totalFree ?? 0) + p.freeSizeBytes;
        }
      }
      if (totalSize && totalFree !== null) {
        return { name: disk.name, sizeBytes: totalSize, freeBytes: totalFree, partitionScheme: disk.partitionScheme };
      }
    }
    return undefined;
  });
</script>

<div class="max-w-[860px] mx-auto px-4 py-3 text-[12.5px] leading-[1.35] text-slate-900 bg-white">
  <!-- Report header (compact) -->
  <div class="flex items-baseline gap-1.5 flex-wrap mb-0.5">
    <span class="text-[15px] font-extrabold">Report #{String(reportMeta.report_id ?? reportId)}</span>
    {#if reportMeta.report_type}
      <Badge variant="blue">{reportMeta.report_type}</Badge>
    {/if}
    {#if reportMeta.product_version}
      <Badge variant="outline">{reportMeta.product_version}</Badge>
    {/if}
    {#if reportMeta.received}
      <span class="text-[11px] text-zinc-400 font-mono">{reportMeta.received}</span>
    {/if}
  </div>

  {#if reportMeta.problem_description}
    <div class="px-2 py-1 mb-3 bg-slate-50 rounded text-[12px] border border-slate-100">
      <span class="text-zinc-400 text-[10px] font-semibold uppercase mr-1.5">User description</span>
      <span class="text-blue-600 font-mono text-[11.5px]">{reportMeta.problem_description}</span>
    </div>
  {/if}

  <!-- ═══════════════════════════════════════════════════════════════════════
       HOST SECTION
       ═══════════════════════════════════════════════════════════════════════ -->
  <section class="mb-2">
    <!-- Group Header -->
    <button
      type="button"
      class="w-full flex items-center gap-1.5 py-[7px] cursor-pointer select-none border-b-2 border-slate-200"
      class:mb-0={hostOpen}
      class:mb-2={!hostOpen}
      onclick={() => (hostOpen = !hostOpen)}
    >
      <DenseChevron open={hostOpen} />
      {#if sectionIconUrls.host}
        <img src={sectionIconUrls.host} alt="" class="w-[14px] h-[14px]" />
      {:else}
        <span class="text-[14px]">🍎</span>
      {/if}
      <span class="text-[14px] font-bold text-slate-900">Host</span>
      <div class="flex-1"></div>
    </button>

    {#if hostOpen}
      <!-- Host system summary (flags + CPU/RAM/Disk) at top level -->
      {#if hostInfoFlags}
        <div class="pl-5">
          <HostInfoFlagsSummary flags={hostInfoFlags} hasDisplayLink={hostInfoHasDisplayLink} />
        </div>
      {/if}
      {#if hostInfoSystem}
        <div class="pl-5">
          <HostInfoSystemBanner system={hostInfoSystem} systemDisk={hostInfoSystemDisk} mountInfoDisk={mountInfoSystemDisk} />
        </div>
      {/if}

      <!-- Host cards -->
      <div>
        {#each cardListForSection('host') as card (card.id)}
          {@const node = renderNodeCard(card)}
          <RealityCard
            title={card.title}
            iconKey={card.iconKey}
            iconUrlByKey={iconUrlByKey}
            headerBadges={selectHeaderBadges(node)}
            openByDefault={card.openByDefault}
            sources={card.sources}
            onOpenSource={openSource}
          >
            {#if card.render.kind === 'nodeKey'}
              {#if node}
                <NodeBody {node} {markers} subSectionStates={subSectionStates} {iconUrlByKey} />
              {:else}
                <div class="text-[11px] text-zinc-400">No {card.render.nodeKey} data.</div>
              {/if}
            {:else}
              <div class="text-[11px] text-zinc-400">Not implemented.</div>
            {/if}
          </RealityCard>
        {/each}
      </div>
    {/if}
  </section>

  <!-- ═══════════════════════════════════════════════════════════════════════
       PARALLELS DESKTOP SECTION
       ═══════════════════════════════════════════════════════════════════════ -->
  <section class="mb-2">
    <!-- Group Header -->
    <button
      type="button"
      class="w-full flex items-center gap-1.5 py-[7px] cursor-pointer select-none border-b-2 border-slate-200"
      class:mb-0={parallelsOpen}
      class:mb-2={!parallelsOpen}
      onclick={() => (parallelsOpen = !parallelsOpen)}
    >
      <DenseChevron open={parallelsOpen} />
      {#if sectionIconUrls.parallels}
        <img src={sectionIconUrls.parallels} alt="" class="w-[14px] h-[14px]" />
      {:else}
        <span class="text-[14px]">▶️</span>
      {/if}
      <span class="text-[14px] font-bold text-slate-900">Parallels Desktop</span>
      {#if reportMeta.product_version}
        <Badge variant="blue">{reportMeta.product_version}</Badge>
      {/if}
      <div class="flex-1"></div>
    </button>

    {#if parallelsOpen}
      <div>
        {#each cardListForSection('parallels') as card (card.id)}
          {@const node = renderNodeCard(card)}
          <RealityCard
            title={card.title}
            iconKey={card.iconKey}
            iconUrlByKey={iconUrlByKey}
            headerBadges={selectHeaderBadges(node)}
            openByDefault={card.openByDefault}
            sources={card.sources}
            onOpenSource={openSource}
          >
            {#if card.render.kind === 'nodeKey'}
              {#if node}
                <NodeBody {node} {markers} subSectionStates={subSectionStates} {iconUrlByKey} />
              {:else}
                <div class="text-[11px] text-zinc-400">No {card.render.nodeKey} data.</div>
              {/if}
            {:else}
              <div class="text-[11px] text-zinc-400">Not implemented.</div>
            {/if}
          </RealityCard>
        {/each}
      </div>
    {/if}
  </section>

  <!-- ═══════════════════════════════════════════════════════════════════════
       VIRTUAL MACHINES SECTION
       ═══════════════════════════════════════════════════════════════════════ -->
  <section class="mb-2">
    <!-- Group Header -->
    <button
      type="button"
      class="w-full flex items-center gap-1.5 py-[7px] cursor-pointer select-none border-b-2 border-slate-200"
      class:mb-0={vmsOpen}
      class:mb-2={!vmsOpen}
      onclick={() => (vmsOpen = !vmsOpen)}
    >
      <DenseChevron open={vmsOpen} />
      {#if sectionIconUrls.vms}
        <img src={sectionIconUrls.vms} alt="" class="w-[14px] h-[14px]" />
      {:else}
        <span class="text-[14px]">🗂</span>
      {/if}
      <span class="text-[14px] font-bold text-slate-900">Virtual Machines</span>
      <div class="flex-1"></div>
      <span class="text-[12px] text-zinc-400">{vmSection?.vms?.length ?? 0} VMs</span>
    </button>

    {#if vmsOpen}
      {#if !vmSection?.vms || vmSection.vms.length === 0}
        <div class="py-2 px-7 text-[11px] text-zinc-400">No VM directory data.</div>
      {:else}
        <div>
          {#each vmSection.vms as vm (vm.uuid)}
            {@const cfg = vmConfigByUuid[vm.uuid] ?? null}
            {@const ips = vmIpsByUuid[vm.uuid] ?? []}
            {@const cfgNode = cfg ? buildCurrentVmNode(cfg) : null}
            {@const currentVmNode = vm.isCurrent ? (nodes.find((n) => n.id === 'current-vm') ?? null) : null}
            {@const guestOsNode = vm.isCurrent ? (nodes.find((n) => n.id === 'guest-os') ?? null) : null}
            {@const vmHeaderBadges =
              vm.isCurrent
                ? mergeBadges(selectHeaderBadges(guestOsNode), selectHeaderBadges(currentVmNode))
                : selectHeaderBadges(cfgNode)}
            <VmEntry
              name={vm.name}
              uuid={vm.uuid}
              isCurrent={vm.isCurrent}
              openByDefault={vm.isCurrent}
              iconUrl={vmIconUrl}
              headerBadges={vmHeaderBadges}
              iconUrlByKey={iconUrlByKey}
            >
              <!-- VM quick info -->
              {#if cfg?.vmHome || cfg?.creationDate || ips.length}
                <div class="py-1.5 px-2 pl-7 border-b border-slate-100 text-[11px]">
                  <div class="flex flex-wrap gap-x-4 gap-y-0.5">
                    {#if cfg?.vmHome}
                      <div><span class="text-zinc-400">Home:</span> <span class="font-mono text-[10px] text-zinc-600">{cfg.vmHome}</span></div>
                    {/if}
                    {#if cfg?.creationDate}
                      <div><span class="text-zinc-400">Created:</span> <span class="font-mono text-zinc-600">{cfg.creationDate}</span></div>
                    {/if}
                    {#if ips.length}
                      <div><span class="text-zinc-400">IP:</span> <span class="font-mono text-zinc-600">{ips.join(', ')}</span></div>
                    {/if}
                  </div>
                </div>
              {/if}

              <!-- VM cards -->
              {#each vm.cards as card (card.id)}
                {@const vmCardNode =
                  card.render.kind === 'nodeKey'
                    ? renderNodeCard(card)
                    : card.render.kind === 'vmSettings' && cfg
                      ? cfgNode
                      : card.render.kind === 'vmSettings' && vm.isCurrent
                        ? (nodes.find((n) => n.id === 'current-vm') ?? null)
                        : null}
                {@const vmLogMeta = toolsLogMetaByUuid[vm.uuid] ?? null}

                {#if card.render.kind === 'vmLogs'}
                  <DenseDivider label="VM Logs" />
                {/if}

                <RealityCard
                  title={card.title}
                  iconKey={card.iconKey}
                  iconUrlByKey={iconUrlByKey}
                  headerBadges={
                    card.render.kind === 'vmLogs' && vmLogMeta
                      ? [
                          { label: vmLogMeta.status ?? 'Tools', tone: toolsStatusTone(vmLogMeta.status), iconKey: 'clipboard' },
                          ...(vmLogMeta.hasCorruptRegistry
                            ? [{ label: 'Corrupt Registry', tone: 'danger' as const, iconKey: 'warn' }]
                            : []),
                          ...(vmLogMeta.hasPrlDdIssue
                            ? [{ label: vmLogMeta.kbArticle ?? 'KB125243', tone: 'danger' as const, iconKey: 'warn' }]
                            : [])
                        ]
                      : card.render.kind === 'vmSettings' && vm.isCurrent
                        ? mergeBadges(selectHeaderBadges(guestOsNode), selectHeaderBadges(vmCardNode))
                        : selectHeaderBadges(vmCardNode)
                  }
                  openByDefault={card.openByDefault}
                  sources={card.sources}
                  onOpenSource={openSource}
                  indent={12}
                >
                  {#if card.render.kind === 'vmSettings'}
                    {#if vm.isCurrent}
                      {@const node = nodes.find((n) => n.id === 'current-vm') ?? null}
                      {#if node}
                        <NodeBody {node} {markers} subSectionStates={subSectionStates} {iconUrlByKey} />
                      {:else}
                        <div class="text-[11px] text-zinc-400">No CurrentVm data.</div>
                      {/if}
                    {:else}
                      {#if cfg}
                        {@const node = buildCurrentVmNode(cfg)}
                        <NodeBody {node} markers={[]} subSectionStates={subSectionStates} {iconUrlByKey} />
                      {:else}
                        <div class="text-[11px] text-zinc-400">No config for this VM in report.</div>
                      {/if}
                    {/if}
                  {:else if card.render.kind === 'vmLogs'}
                    <div class="space-y-1">
                      {#if toolsLogMetaByUuid[vm.uuid]}
                        {@const m = toolsLogMetaByUuid[vm.uuid]}
                        {#if m}
                          <div class="flex items-center gap-2 flex-wrap text-[11px]">
                            <span class="text-zinc-400">Tools:</span>
                            <Badge variant="outline">{m.status ?? 'unknown'}</Badge>
                            {#if m.hasCorruptRegistry}
                              <Badge variant="destructive">Corrupt Registry</Badge>
                            {/if}
                            {#if m.hasPrlDdIssue}
                              <Badge variant="destructive">{m.kbArticle ?? 'prl_dd.inf'}</Badge>
                            {/if}
                          </div>
                        {/if}
                      {/if}
                      {#if card.sources.length === 0}
                        <div class="text-[11px] text-zinc-400">No discovered per-VM logs.</div>
                      {:else}
                        <div class="flex flex-col gap-0.5">
                          {#each card.sources as src}
                            {#if src.kind === 'file'}
                              <button
                                type="button"
                                class="text-left text-[11px] font-mono text-zinc-500 hover:text-zinc-800 underline underline-offset-2"
                                onclick={() => openSource(src)}
                              >
                                {src.filename}
                              </button>
                            {/if}
                          {/each}
                        </div>
                      {/if}
                    </div>
                  {:else if card.render.kind === 'nodeKey'}
                    {#if vmCardNode}
                      <NodeBody node={vmCardNode} {markers} subSectionStates={subSectionStates} {iconUrlByKey} />
                    {:else}
                      <div class="text-[11px] text-zinc-400">No {card.render.nodeKey} data.</div>
                    {/if}
                  {:else}
                    <div class="text-[11px] text-zinc-400">Not implemented.</div>
                  {/if}
                </RealityCard>
              {/each}

              {#if !vm.isCurrent}
                <div class="py-1 px-3 pl-8 text-[10.5px] text-zinc-400 italic border-b border-slate-100">
                  No guest diagnostics — not the reported VM
                </div>
              {/if}
            </VmEntry>
          {/each}
        </div>
      {/if}
    {/if}
  </section>

  <!-- ═══════════════════════════════════════════════════════════════════════
       RAW ESCAPE HATCH
       ═══════════════════════════════════════════════════════════════════════ -->
  <div class="border-t border-slate-100">
    <button
      type="button"
      class="w-full flex items-center gap-1.5 py-1.5 text-[11.5px] text-zinc-400 cursor-pointer hover:text-zinc-600"
      onclick={() => (rawOpen = !rawOpen)}
    >
      <DenseChevron open={rawOpen} />
      <span>📋</span>
      <span>Raw Report Nodes</span>
      <span class="font-mono text-[10px]">· {nodeCount} nodes · {fileCount} files</span>
    </button>

    {#if rawOpen}
      {@const grouped = groupRawItems(rawItems)}
      <div class="py-2 px-2 pl-7 space-y-3 border-t border-slate-100 bg-slate-50/50">
        {#each grouped as g (g.group)}
          <div>
            <div class="text-[10px] uppercase tracking-wide text-zinc-400 font-bold mb-1">
              {g.group}
            </div>
            <div class="flex flex-col gap-0.5">
              {#each g.items as it}
                <button
                  type="button"
                  class="text-left text-[11px] font-mono text-zinc-500 hover:text-zinc-800 underline underline-offset-2"
                  onclick={() => openRawItem(it)}
                >
                  {#if it.kind === 'node'}
                    {it.nodeKey}
                  {:else}
                    {it.filename}
                  {/if}
                </button>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<RawModal
  {reportId}
  open={rawModalOpen}
  item={rawModalItem}
  {fetchContent}
  onClose={() => {
    rawModalOpen = false;
    rawModalItem = null;
  }}
/>
