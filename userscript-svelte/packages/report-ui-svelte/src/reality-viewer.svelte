<script lang="ts">
  import './styles.css';

  import Badge from './components/ui/badge.svelte';
  import RealityCard from './components/reality/RealityCard.svelte';
  import RawModal from './components/reality/RawModal.svelte';
  import VmEntry from './components/reality/VmEntry.svelte';
  import NodeBody from './components/node/NodeBody.svelte';

  import type { Marker, CurrentVmModel } from '@prv/report-core';
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
    iconUrlByKey
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
  } = $props();

  let rawModalOpen = $state(false);
  let rawModalItem = $state<null | { kind: 'node'; nodeKey: string; title: string } | { kind: 'file'; filePath: string; filename: string; title: string }>(null);

  let subSectionStates = $state<Record<string, boolean>>({});

  function nodeForKey(nodeKey: string): NodeModel | null {
    // NodeModel.title usually equals NodeKey, except a few log nodes.
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
    const ordered = [
      'Nodes',
      'VM configs',
      'VM logs',
      'Tools logs',
      'Screenshots/images',
      'Other'
    ];
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
</script>

<div class="max-w-5xl">
  <!-- Report header -->
  <div class="mb-4">
    <div class="text-[12px] text-muted-foreground">Report</div>
    <div class="flex items-center gap-2 flex-wrap">
      <h1 class="text-[18px] font-bold">#{String(reportMeta.report_id ?? reportId)}</h1>
      {#if reportMeta.report_type}
        <Badge variant="outline" class="text-[11px]">{reportMeta.report_type}</Badge>
      {/if}
      {#if reportMeta.product_version}
        <Badge variant="outline" class="text-[11px]">{reportMeta.product_version}</Badge>
      {/if}
    </div>
    <div class="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-[12px]">
      {#if reportMeta.received}
        <div class="rounded-lg border border-border bg-background px-3 py-2">
          <div class="text-muted-foreground text-[11px]">Received</div>
          <div class="font-mono">{reportMeta.received}</div>
        </div>
      {/if}
      {#if reportMeta.parsed}
        <div class="rounded-lg border border-border bg-background px-3 py-2">
          <div class="text-muted-foreground text-[11px]">Parsed</div>
          <div class="font-mono">{reportMeta.parsed}</div>
        </div>
      {/if}
      {#if reportMeta.problem_description}
        <div class="md:col-span-2 rounded-lg border border-border bg-background px-3 py-2">
          <div class="text-muted-foreground text-[11px]">User description</div>
          <div class="whitespace-pre-wrap break-words">{reportMeta.problem_description}</div>
        </div>
      {/if}
    </div>
  </div>

  <!-- Host (flat section) -->
  <section class="mb-5">
    <div class="flex items-baseline justify-between gap-2 flex-wrap mb-2">
      <h2 class={`text-[15px] font-bold ${sectionIconUrls.host ? 'flex items-center gap-2' : ''}`}>
        {#if sectionIconUrls.host}
          <img src={sectionIconUrls.host} alt="" class="w-5 h-5" />
        {/if}
        Host
      </h2>
      <div class="flex items-center gap-1.5 flex-wrap">
        {#if hostSummary.os}
          <Badge variant="outline" class="text-[11px]">{hostSummary.os}</Badge>
        {/if}
        {#if hostSummary.ramGb !== null}
          <Badge variant="outline" class="text-[11px]">{hostSummary.ramGb} GB RAM</Badge>
        {/if}
        {#if hostSummary.systemDisk?.capacity}
          <Badge variant="outline" class="text-[11px]">/ {hostSummary.systemDisk.capacity}</Badge>
        {/if}
      </div>
    </div>
    <div class="mb-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-[12px]">
      {#if hostSummary.computerModel}
        <div class="rounded-lg border border-border bg-background px-3 py-2">
          <div class="text-muted-foreground text-[11px]">Model</div>
          <div class="font-mono">{hostSummary.computerModel}</div>
        </div>
      {/if}
      {#if hostSummary.cpu}
        <div class="rounded-lg border border-border bg-background px-3 py-2">
          <div class="text-muted-foreground text-[11px]">CPU</div>
          <div class="font-mono">{hostSummary.cpu}</div>
        </div>
      {/if}
    </div>

    <div class="space-y-2">
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
              <div class="text-sm text-muted-foreground">No {card.render.nodeKey} data.</div>
            {/if}
          {:else}
            <div class="text-sm text-muted-foreground">Not implemented.</div>
          {/if}
        </RealityCard>
      {/each}
    </div>
  </section>

  <!-- Parallels Desktop (flat section) -->
  <section class="mb-5">
    <div class="flex items-baseline justify-between gap-2 flex-wrap mb-2">
      <h2 class={`text-[15px] font-bold ${sectionIconUrls.parallels ? 'flex items-center gap-2' : ''}`}>
        {#if sectionIconUrls.parallels}
          <img src={sectionIconUrls.parallels} alt="" class="w-5 h-5" />
        {/if}
        Parallels Desktop
      </h2>
      <div class="flex items-center gap-1.5 flex-wrap">
        {#if reportMeta.product_version}
          <Badge variant="outline" class="text-[11px]">{reportMeta.product_version}</Badge>
        {/if}
      </div>
    </div>

    <div class="space-y-2">
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
              <div class="text-sm text-muted-foreground">No {card.render.nodeKey} data.</div>
            {/if}
          {:else}
            <div class="text-sm text-muted-foreground">Not implemented.</div>
          {/if}
        </RealityCard>
      {/each}
    </div>
  </section>

  <!-- Virtual Machines (flat section) -->
  <section class="mb-5">
    <div class="flex items-baseline justify-between gap-2 flex-wrap mb-2">
      <h2 class={`text-[15px] font-bold ${sectionIconUrls.vms ? 'flex items-center gap-2' : ''}`}>
        {#if sectionIconUrls.vms}
          <img src={sectionIconUrls.vms} alt="" class="w-5 h-5" />
        {/if}
        Virtual Machines
      </h2>
      <div class="text-[12px] text-muted-foreground">{vmSection?.vms?.length ?? 0} VMs</div>
    </div>

    {#if !vmSection?.vms || vmSection.vms.length === 0}
      <div class="text-sm text-muted-foreground">No VM directory data.</div>
    {:else}
      <div class="space-y-2">
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
            openByDefault={false}
            iconUrl={vmIconUrl}
            headerBadges={vmHeaderBadges}
            iconUrlByKey={iconUrlByKey}
          >
            <div class="mb-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-[12px]">
              {#if cfg?.vmHome}
                <div class="rounded-lg border border-border bg-background px-3 py-2">
                  <div class="text-muted-foreground text-[11px]">Location</div>
                  <div class="font-mono break-all">{cfg.vmHome}</div>
                </div>
              {/if}
              {#if cfg?.creationDate}
                <div class="rounded-lg border border-border bg-background px-3 py-2">
                  <div class="text-muted-foreground text-[11px]">Created</div>
                  <div class="font-mono">{cfg.creationDate}</div>
                </div>
              {/if}
              {#if ips.length}
                <div class="md:col-span-2 rounded-lg border border-border bg-background px-3 py-2">
                  <div class="text-muted-foreground text-[11px]">IP addresses</div>
                  <div class="font-mono">{ips.join(', ')}</div>
                </div>
              {/if}
            </div>

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
              <RealityCard
                title={card.title}
                iconKey={card.iconKey}
                iconUrlByKey={iconUrlByKey}
                headerBadges={
                  card.render.kind === 'vmLogs' && vmLogMeta
                    ? [
                        { label: vmLogMeta.status ?? 'Tools', tone: toolsStatusTone(vmLogMeta.status), iconKey: 'clipboard' },
                        ...(vmLogMeta.hasCorruptRegistry
                          ? [{ label: 'Corrupt Registry', tone: 'danger', iconKey: 'warn' }]
                          : []),
                        ...(vmLogMeta.hasPrlDdIssue
                          ? [{ label: vmLogMeta.kbArticle ?? 'KB125243', tone: 'danger', iconKey: 'warn' }]
                          : [])
                      ]
                    : card.render.kind === 'vmSettings' && vm.isCurrent
                      ? mergeBadges(selectHeaderBadges(guestOsNode), selectHeaderBadges(vmCardNode))
                    : selectHeaderBadges(vmCardNode)
                }
                openByDefault={card.openByDefault}
                sources={card.sources}
                onOpenSource={openSource}
              >
                {#if card.render.kind === 'vmSettings'}
                  {#if vm.isCurrent}
                    {@const node = nodes.find((n) => n.id === 'current-vm') ?? null}
                    {#if node}
                      <NodeBody {node} {markers} subSectionStates={subSectionStates} {iconUrlByKey} />
                    {:else}
                      <div class="text-sm text-muted-foreground">No CurrentVm data.</div>
                    {/if}
                  {:else}
                    {#if cfg}
                      {@const node = buildCurrentVmNode(cfg)}
                      <NodeBody {node} markers={[]} subSectionStates={subSectionStates} {iconUrlByKey} />
                    {:else}
                      <div class="text-sm text-muted-foreground">No config for this VM in report.</div>
                    {/if}
                  {/if}
                {:else if card.render.kind === 'vmLogs'}
                  <div class="space-y-2">
                    {#if toolsLogMetaByUuid[vm.uuid]}
                      {@const m = toolsLogMetaByUuid[vm.uuid]}
                      {#if m}
                        <div class="flex items-center gap-2 flex-wrap text-[12px]">
                          <span class="text-muted-foreground">Tools:</span>
                          <Badge variant="outline" class="text-[10px]">{m.status ?? 'unknown'}</Badge>
                          {#if m.hasCorruptRegistry}
                            <Badge variant="destructive" class="text-[10px]">Corrupt Registry</Badge>
                          {/if}
                          {#if m.hasPrlDdIssue}
                            <Badge variant="destructive" class="text-[10px]">{m.kbArticle ?? 'prl_dd.inf'}</Badge>
                          {/if}
                        </div>
                      {/if}
                    {/if}
                    {#if card.sources.length === 0}
                      <div class="text-sm text-muted-foreground">No discovered per-VM logs.</div>
                    {:else}
                      <div class="flex flex-col gap-1">
                        {#each card.sources as src}
                          {#if src.kind === 'file'}
                            <button
                              type="button"
                              class="text-left text-[12px] font-mono text-muted-foreground hover:text-foreground underline underline-offset-2"
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
                    <div class="text-sm text-muted-foreground">No {card.render.nodeKey} data.</div>
                  {/if}
                {:else}
                  <div class="text-sm text-muted-foreground">Not implemented.</div>
                {/if}
              </RealityCard>
            {/each}
          </VmEntry>
        {/each}
      </div>
    {/if}
  </section>

  <!-- Raw escape hatch -->
  <section class="mb-6">
    <RealityCard
      title="Raw report nodes"
      iconKey="folder"
      iconUrlByKey={iconUrlByKey}
      headerBadges={[]}
      openByDefault={false}
      sources={[]}
      onOpenSource={() => {}}
    >
      {@const grouped = groupRawItems(rawItems)}
      <div class="space-y-3">
        {#each grouped as g (g.group)}
          <div>
            <div class="text-[11px] uppercase tracking-wide text-muted-foreground font-bold mb-1">
              {g.group}
            </div>
            <div class="flex flex-col gap-1">
              {#each g.items as it}
                <button
                  type="button"
                  class="text-left text-[12px] font-mono text-muted-foreground hover:text-foreground underline underline-offset-2"
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
    </RealityCard>
  </section>
</div>

<RawModal
  {reportId}
  open={rawModalOpen}
  item={rawModalItem}
  onClose={() => {
    rawModalOpen = false;
    rawModalItem = null;
  }}
/>
