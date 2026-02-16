<script lang="ts">
	import * as Tooltip from '../ui/tooltip';
	import * as Collapsible from '../ui/collapsible';
	import { Badge } from '../ui/badge';
	import DenseChevron from '../dense/DenseChevron.svelte';
	import RowValue from './RowValue.svelte';
	import type { NodeModel, NodeSection, NodeRow, NodeSubSection } from '@prv/report-viewmodel';
	import type { Marker } from '@prv/report-core';
	import { getMarkersForSubSection, severityToVariant } from '@prv/report-core';
	import { scrollToMarker } from '../../stores/markerStore.svelte.ts';
	import PrvIcon from '../PrvIcon.svelte';

	interface Props {
		node: NodeModel;
		markers?: Marker[];
		iconUrlByKey?: Record<string, string>;
	}

	let { node, markers = [], iconUrlByKey }: Props = $props();

	function badgeVariant(tone: string | undefined): 'destructive' | 'default' | 'outline' {
		if (tone === 'danger') return 'destructive';
		if (tone === 'warn') return 'default';
		return 'outline';
	}

	function iconClass(tone: string | undefined): string {
		if (tone === 'danger') return 'text-red-700';
		if (tone === 'warn') return 'text-amber-700';
		return 'text-muted-foreground';
	}

	// Collapsible state
	let networksOpen = $state(false);
	let hddsOpen = $state(false);
	let usbOpen = $state(false);
	let cdOpen = $state(false);

	// Helper to find a section
	function getSection(title: string): NodeSection | undefined {
		return node.sections.find((s) => s.title === title);
	}

	// Get sections
	const startupSection = $derived(getSection('Startup / Shutdown'));
	const generalSection = $derived(getSection('General'));
	const hardwareSection = $derived(getSection('Hardware'));
	const sharingSection = $derived(getSection('Sharing'));
	const otherSection = $derived(getSection('Other'));

	// Get subsections from Hardware
	const networkSubs = $derived(hardwareSection?.subSections?.find((s) => s.title === 'Networks'));
	const hddSubs = $derived(hardwareSection?.subSections?.find((s) => s.title === 'HDDs'));
	const usbSubs = $derived(hardwareSection?.subSections?.find((s) => s.title === 'USBs'));
	const cdSubs = $derived(hardwareSection?.subSections?.find((s) => s.title === 'CD / DVD'));

	// Get markers for each sub-section
	const networkMarkers = $derived(getMarkersForSubSection(markers, node.id, 'Hardware', 'networks'));
	const hddMarkers = $derived(getMarkersForSubSection(markers, node.id, 'Hardware', 'hdds'));
	const usbMarkers = $derived(getMarkersForSubSection(markers, node.id, 'Hardware', 'usbs'));
	const cdMarkers = $derived(getMarkersForSubSection(markers, node.id, 'Hardware', 'cds'));

	type RowGroup = { key: string; rows: NodeRow[] };
	function groupByLabelStart(rows: NodeRow[] | undefined, startLabel: string): RowGroup[] {
		if (!rows || rows.length === 0) return [];
		const groups: RowGroup[] = [];
		let current: NodeRow[] = [];
		let idx = 0;

		for (const row of rows) {
			if (row.label === startLabel && current.length > 0) {
				groups.push({ key: String(idx++), rows: current });
				current = [];
			}
			current.push(row);
		}

		if (current.length > 0) groups.push({ key: String(idx++), rows: current });
		return groups;
	}

	const hddGroups = $derived(groupByLabelStart(hddSubs?.rows, 'Location'));
	const networkGroups = $derived(groupByLabelStart(networkSubs?.rows, 'Type'));

	// Handle marker click - scroll to target
	function handleMarkerClick(marker: Marker) {
		scrollToMarker(marker.id);
	}
</script>

<style>
	:global(.marker-highlight-flash) {
		animation: marker-flash 1.5s ease-out;
	}

	@keyframes marker-flash {
		0% {
			background-color: rgba(251, 191, 36, 0.4);
			box-shadow: 0 0 0 2px rgba(251, 191, 36, 0.6);
		}
		100% {
			background-color: transparent;
			box-shadow: none;
		}
	}
</style>

{#snippet sectionHeader(title: string)}
	<div class="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground py-1 border-b border-slate-100">
		{title}
	</div>
{/snippet}

{#snippet markerBadges(markerList: Marker[])}
	{#each markerList as marker}
		<Tooltip.Root>
			<Tooltip.Trigger>
				<Badge
					variant={severityToVariant(marker.severity)}
					class="text-[9px] cursor-pointer"
					onclick={(e) => { e.stopPropagation(); handleMarkerClick(marker); }}
				>
					{marker.label}
				</Badge>
			</Tooltip.Trigger>
			<Tooltip.Content>
				<p class="text-xs">{marker.tooltip || marker.label}</p>
			</Tooltip.Content>
		</Tooltip.Root>
	{/each}
{/snippet}

{#snippet subSectionTrigger(sub: NodeSubSection, open: boolean, markerList: Marker[])}
	<div
		class={`flex items-center gap-1.5 py-[5px] px-1 pl-2 min-h-[28px] cursor-pointer select-none border-b border-slate-100
			${open ? 'bg-slate-50/80' : 'bg-transparent'}
			hover:bg-slate-50/50`}
	>
		<DenseChevron {open} />
		{#if sub.iconKey}
			<PrvIcon iconKey={sub.iconKey} {iconUrlByKey} size={13} class="text-muted-foreground opacity-70" />
		{/if}
		<span class="text-[12px] font-semibold text-slate-700 shrink-0">{sub.title}</span>
		<div class="flex items-center gap-1">
			{@render markerBadges(markerList)}
		</div>
		<div class="flex-1"></div>
		<span class="text-[11px] font-mono text-muted-foreground tabular-nums">{sub.rows.length > 0 ? '' : '0'}</span>
	</div>
{/snippet}

<Tooltip.Provider>
	<div class="compact-current-vm space-y-0">
		<!-- Badges row -->
		{#if node.badges.length}
			<div class="flex flex-wrap items-center gap-1 py-1.5 px-1">
				{#each node.badges as b (b.label)}
					<Badge variant={badgeVariant(b.tone)} class="text-[10px] gap-1">
						{#if b.iconKey}
							<PrvIcon iconKey={b.iconKey} {iconUrlByKey} size={12} class={iconClass(b.tone)} />
						{/if}
						{b.label}
					</Badge>
				{/each}
			</div>
		{/if}

		<!-- General section -->
		{#if generalSection}
			{@render sectionHeader(generalSection.title)}
			<div class="py-0.5 text-[11px]">
				{#each generalSection.rows as row}
					<div class="flex items-start justify-between gap-2 py-[2px] px-1">
						<span class="text-muted-foreground shrink-0">{row.label}</span>
						<RowValue {row} size="sm" />
					</div>
				{/each}
			</div>
		{/if}

		<!-- Startup / Shutdown -->
		{#if startupSection}
			{@render sectionHeader(startupSection.title)}
			<div class="grid grid-cols-2 gap-x-4 gap-y-0 py-0.5 text-[11px]">
				{#each startupSection.rows as row}
					<div class="flex items-center justify-between py-[2px] px-1">
						<span class="text-muted-foreground">{row.label}</span>
						<RowValue {row} size="sm" />
					</div>
				{/each}
			</div>
		{/if}

		<!-- Hardware inline flow -->
		{#if hardwareSection}
			{@render sectionHeader('Hardware')}
			<div class="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 py-1.5 px-1 text-[11px]">
				{#each hardwareSection.rows as row, i}
					{#if i > 0}
						<span class="text-muted-foreground/30">·</span>
					{/if}
					<span class="inline-flex items-center gap-0.5">
						{#if row.iconKey}
							<PrvIcon iconKey={row.iconKey} {iconUrlByKey} size={13} class="text-muted-foreground" />
						{/if}
						<span class="font-medium text-muted-foreground">{row.label}:</span>
						<RowValue {row} size="sm" />
					</span>
				{/each}
			</div>
		{/if}

		<!-- Networks collapsible -->
		{#if networkSubs && networkSubs.rows.length > 0}
			<Collapsible.Root bind:open={networksOpen}>
				<Collapsible.Trigger class="w-full" data-marker-id="networks-section">
					{@render subSectionTrigger(networkSubs, networksOpen, networkMarkers)}
				</Collapsible.Trigger>
				<Collapsible.Content>
					<div class="py-0.5 px-2 pl-6 border-b border-slate-100 bg-slate-50/30" data-marker-id="disconnected-adapter-subsection">
						{#each networkGroups as group, groupIndex (group.key)}
							{#if groupIndex > 0}
								<div class="border-t border-slate-100 my-0.5"></div>
							{/if}
							<div class="space-y-0 text-[11px]">
								{#each group.rows as row}
									<div class="flex items-center justify-between py-[2px]">
										<span class="text-muted-foreground flex items-center gap-1">
											{#if row.iconKey}
												<PrvIcon iconKey={row.iconKey} {iconUrlByKey} size={12} class="text-muted-foreground" />
											{/if}
											{row.label}
										</span>
										<RowValue {row} size="sm" />
									</div>
								{/each}
							</div>
						{/each}
					</div>
				</Collapsible.Content>
			</Collapsible.Root>
		{/if}

		<!-- HDDs collapsible -->
		{#if hddSubs && hddSubs.rows.length > 0}
			<Collapsible.Root bind:open={hddsOpen}>
				<Collapsible.Trigger class="w-full" data-marker-id="hdds-section">
					{@render subSectionTrigger(hddSubs, hddsOpen, hddMarkers)}
				</Collapsible.Trigger>
				<Collapsible.Content>
					<div class="py-0.5 px-2 pl-6 border-b border-slate-100 bg-slate-50/30" data-marker-id="no-hdd-subsection">
						{#each hddGroups as group, groupIndex (group.key)}
							{@const externalRow = group.rows.find((r) => r.label === 'External to PVM')}
							{#if groupIndex > 0}
								<div class="border-t border-slate-100 my-0.5"></div>
							{/if}
							<div class="text-[11px]">
								<div class="flex items-center gap-1.5 py-[2px]">
									<span class="text-[10px] font-semibold text-foreground/70">Disk {groupIndex + 1}</span>
									{#if externalRow}
										<RowValue row={externalRow} size="sm" class="shrink-0" />
									{/if}
								</div>
								{#each group.rows as row}
									<div class="flex items-center justify-between py-[2px]">
										<span class="text-muted-foreground">{row.label}</span>
										<RowValue {row} size="sm" class="max-w-[65%]" />
									</div>
								{/each}
							</div>
						{/each}
					</div>
				</Collapsible.Content>
			</Collapsible.Root>
		{/if}

		<!-- USB Devices collapsible -->
		{#if usbSubs && usbSubs.rows.length > 0}
			<Collapsible.Root bind:open={usbOpen}>
				<Collapsible.Trigger class="w-full" data-marker-id="usbs-section">
					{@render subSectionTrigger(usbSubs, usbOpen, usbMarkers)}
				</Collapsible.Trigger>
				<Collapsible.Content>
					<div class="py-0.5 px-2 pl-6 border-b border-slate-100 bg-slate-50/30">
						{#each usbSubs.rows as row}
							<div class="flex items-center gap-1.5 py-[3px] border-b border-slate-50 last:border-b-0 text-[11px]">
								{#if row.iconKey}
									<PrvIcon iconKey={row.iconKey} {iconUrlByKey} size={12} class="text-muted-foreground opacity-60" />
								{/if}
								<span class="font-medium text-foreground truncate">{row.label}</span>
								{#if row.value}
									<div class="flex-1"></div>
									<span class="font-mono text-[9px] text-muted-foreground shrink-0">{row.value}</span>
								{/if}
							</div>
						{/each}
					</div>
				</Collapsible.Content>
			</Collapsible.Root>
		{/if}

		<!-- CD/DVD collapsible -->
		{#if cdSubs && cdSubs.rows.length > 0}
			<Collapsible.Root bind:open={cdOpen}>
				<Collapsible.Trigger class="w-full" data-marker-id="cds-section">
					{@render subSectionTrigger(cdSubs, cdOpen, cdMarkers)}
				</Collapsible.Trigger>
				<Collapsible.Content>
					<div class="py-0.5 px-2 pl-6 border-b border-slate-100 bg-slate-50/30">
						<div class="text-[11px]">
							{#each cdSubs.rows as row}
								<div class="flex items-center justify-between py-[2px]">
									<span class="text-muted-foreground">{row.label}</span>
									<RowValue {row} size="sm" />
								</div>
							{/each}
						</div>
					</div>
				</Collapsible.Content>
			</Collapsible.Root>
		{/if}

		<!-- Sharing as compact 2-col table -->
		{#if sharingSection}
			{@render sectionHeader(sharingSection.title)}
			<div class="grid grid-cols-2 gap-x-4 gap-y-0 py-0.5 text-[11px]">
				{#each sharingSection.rows as row}
					<div class="flex items-center justify-between py-[2px] px-1">
						<span class="text-muted-foreground">{row.label}</span>
						<RowValue {row} size="sm" />
					</div>
				{/each}
			</div>
		{/if}

		<!-- Other section -->
		{#if otherSection}
			{@render sectionHeader('Other')}
			<div class="grid grid-cols-2 gap-x-4 gap-y-0 py-0.5 text-[11px]">
				{#each otherSection.rows as row}
					<div class="flex items-center justify-between py-[2px] px-1">
						<span class="text-muted-foreground">{row.label}</span>
						<RowValue {row} size="sm" />
					</div>
				{/each}
			</div>
		{/if}
	</div>
</Tooltip.Provider>
