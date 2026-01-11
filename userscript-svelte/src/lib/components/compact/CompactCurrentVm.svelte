<script lang="ts">
	/**
	 * CompactCurrentVm - Compact layout for CurrentVm node
	 * 
	 * Displays VM configuration in a dense, scannable format with:
	 * - Collapsible sub-sections (HDDs, Networks, etc.)
	 * - Markers/badges for issues and notable configurations
	 * - Copy buttons for paths and UUIDs (via RowValue component)
	 */
	import * as Tooltip from '$lib/components/ui/tooltip';
	import * as Collapsible from '$lib/components/ui/collapsible';
	import { Badge } from '$lib/components/ui/badge';
	import RowValue from './RowValue.svelte';
	import type { NodeModel, NodeSection, NodeRow } from '$lib/nodeBuilder';
	import type { Marker } from '$lib/types/markers';
	import { getMarkersForSubSection, severityToVariant } from '$lib/types/markers';
	import { scrollToMarker } from '$lib/stores/markerStore.svelte';
	import {
		HardDrive as HardDriveIcon,
		Network,
		Usb,
		Disc,
		Cpu,
		Monitor,
		Settings,
		AlertTriangle
	} from '@lucide/svelte';

	interface Props {
		node: NodeModel;
		markers?: Marker[];
	}

	let { node, markers = [] }: Props = $props();

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

	// Handle marker click - scroll to target
	function handleMarkerClick(marker: Marker) {
		scrollToMarker(marker.id);
	}
</script>

<style>
	/* Highlight flash animation for click-to-scroll */
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

<Tooltip.Provider>
	<div class="compact-current-vm space-y-3">
		<!-- General section (VM info) -->
		{#if generalSection}
			<section class="space-y-2">
				<h3 class="text-xs font-bold text-foreground">{generalSection.title}</h3>
				<div class="space-y-1 text-xs">
					{#each generalSection.rows as row}
						<div class="flex items-start justify-between gap-2">
							<span class="text-muted-foreground">{row.label}</span>
							<RowValue {row} size="sm" />
						</div>
					{/each}
				</div>
			</section>
		{/if}

		<!-- Startup & Shutdown as compact 2-column table -->
		{#if startupSection}
			<section class="space-y-2">
				<h3 class="text-xs font-bold text-foreground">{startupSection.title}</h3>
				<div class="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
					{#each startupSection.rows as row}
						<div class="flex items-center justify-between">
							<span class="text-muted-foreground">{row.label}</span>
							<RowValue {row} size="md" />
						</div>
					{/each}
				</div>
			</section>
		{/if}

		<!-- Hardware as inline flow -->
		{#if hardwareSection}
			<section class="space-y-2">
				<h3 class="text-xs font-bold text-foreground">Hardware</h3>
				<div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
					{#each hardwareSection.rows as row, i}
						{#if i > 0}
							<span class="text-muted-foreground/40">•</span>
						{/if}
						<Tooltip.Root>
							<Tooltip.Trigger class="inline-flex items-center gap-1">
								{#if row.iconKey === 'cpu'}
									<Cpu class="h-3.5 w-3.5 text-muted-foreground" />
								{:else if row.iconKey === 'monitor'}
									<Monitor class="h-3.5 w-3.5 text-muted-foreground" />
								{:else if row.iconKey === 'keyboard' || row.iconKey === 'mouse'}
									<Settings class="h-3.5 w-3.5 text-muted-foreground" />
								{/if}
								<span class="font-medium">{row.label}:</span>
								<RowValue {row} size="sm" />
							</Tooltip.Trigger>
							<Tooltip.Content>
								<p class="max-w-[250px] text-xs">{row.label}: {row.value || row.badge?.label}</p>
							</Tooltip.Content>
						</Tooltip.Root>
					{/each}
				</div>
			</section>
		{/if}

		<!-- Networks collapsible -->
		{#if networkSubs && networkSubs.rows.length > 0}
			<Collapsible.Root bind:open={networksOpen}>
				<Collapsible.Trigger
					class="flex w-full items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-xs font-semibold hover:bg-accent"
					data-marker-id="networks-section"
				>
					<div class="flex items-center gap-2">
						<Network class="h-3.5 w-3.5" />
						<span>{networkSubs.title}</span>
						{#each networkMarkers as marker}
							<Tooltip.Root>
								<Tooltip.Trigger>
									<Badge
										variant={severityToVariant(marker.severity)}
										class="h-4 px-1.5 text-[9px] cursor-pointer"
										onclick={(e) => { e.stopPropagation(); handleMarkerClick(marker); }}
									>
										{#if marker.severity === 'danger' || marker.severity === 'warn'}
											<AlertTriangle class="h-2.5 w-2.5 mr-0.5" />
										{/if}
										{marker.label}
									</Badge>
								</Tooltip.Trigger>
								<Tooltip.Content>
									<p class="text-xs">{marker.tooltip || marker.label}</p>
								</Tooltip.Content>
							</Tooltip.Root>
						{/each}
					</div>
					<span class="text-lg">{networksOpen ? '−' : '+'}</span>
				</Collapsible.Trigger>
				<Collapsible.Content class="mt-2 ml-4">
					<div class="rounded-md border border-border/50 bg-muted/20 p-3" data-marker-id="disconnected-adapter-subsection">
						<div class="space-y-0.5 text-[11px]">
							{#each networkSubs.rows as row}
								<div class="flex items-center justify-between">
									<span class="text-muted-foreground">{row.label}</span>
									<RowValue {row} size="sm" />
								</div>
							{/each}
						</div>
					</div>
				</Collapsible.Content>
			</Collapsible.Root>
		{/if}

		<!-- HDDs collapsible -->
		{#if hddSubs && hddSubs.rows.length > 0}
			<Collapsible.Root bind:open={hddsOpen}>
				<Collapsible.Trigger
					class="flex w-full items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-xs font-semibold hover:bg-accent"
					data-marker-id="hdds-section"
				>
					<div class="flex items-center gap-2">
						<HardDriveIcon class="h-3.5 w-3.5" />
						<span>{hddSubs.title}</span>
						{#each hddMarkers as marker}
							<Tooltip.Root>
								<Tooltip.Trigger>
									<Badge
										variant={severityToVariant(marker.severity)}
										class="h-4 px-1.5 text-[9px] cursor-pointer"
										onclick={(e) => { e.stopPropagation(); handleMarkerClick(marker); }}
									>
										{#if marker.severity === 'danger' || marker.severity === 'warn'}
											<AlertTriangle class="h-2.5 w-2.5 mr-0.5" />
										{/if}
										{marker.label}
									</Badge>
								</Tooltip.Trigger>
								<Tooltip.Content>
									<p class="text-xs">{marker.tooltip || marker.label}</p>
								</Tooltip.Content>
							</Tooltip.Root>
						{/each}
					</div>
					<span class="text-lg">{hddsOpen ? '−' : '+'}</span>
				</Collapsible.Trigger>
				<Collapsible.Content class="mt-2 ml-4">
					<div class="rounded-md border border-border/50 bg-muted/20 p-3" data-marker-id="no-hdd-subsection">
						<div class="space-y-0.5 text-[11px]">
							{#each hddSubs.rows as row}
								<div class="flex items-center justify-between">
									<span class="text-muted-foreground">{row.label}</span>
									<RowValue {row} size="sm" />
								</div>
							{/each}
						</div>
					</div>
				</Collapsible.Content>
			</Collapsible.Root>
		{/if}

		<!-- USB Devices collapsible -->
		{#if usbSubs && usbSubs.rows.length > 0}
			<Collapsible.Root bind:open={usbOpen}>
				<Collapsible.Trigger
					class="flex w-full items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-xs font-semibold hover:bg-accent"
					data-marker-id="usbs-section"
				>
					<div class="flex items-center gap-2">
						<Usb class="h-3.5 w-3.5" />
						<span>{usbSubs.title}</span>
						{#each usbMarkers as marker}
							<Tooltip.Root>
								<Tooltip.Trigger>
									<Badge
										variant={severityToVariant(marker.severity)}
										class="h-4 px-1.5 text-[9px] cursor-pointer"
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
					</div>
					<span class="text-lg">{usbOpen ? '−' : '+'}</span>
				</Collapsible.Trigger>
				<Collapsible.Content class="mt-2 ml-4">
					<div class="space-y-2">
						{#each usbSubs.rows as row}
							<div class="rounded-md border border-border/50 bg-muted/20 p-3">
								<div class="mb-1 text-xs font-semibold">{row.label}</div>
								{#if row.value}
									<div class="text-[11px] text-muted-foreground">{row.value}</div>
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
				<Collapsible.Trigger
					class="flex w-full items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-xs font-semibold hover:bg-accent"
					data-marker-id="cds-section"
				>
					<div class="flex items-center gap-2">
						<Disc class="h-3.5 w-3.5" />
						<span>{cdSubs.title}</span>
						{#each cdMarkers as marker}
							<Tooltip.Root>
								<Tooltip.Trigger>
									<Badge
										variant={severityToVariant(marker.severity)}
										class="h-4 px-1.5 text-[9px] cursor-pointer"
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
					</div>
					<span class="text-lg">{cdOpen ? '−' : '+'}</span>
				</Collapsible.Trigger>
				<Collapsible.Content class="mt-2 ml-4">
					<div class="rounded-md border border-border/50 bg-muted/20 p-3">
						<div class="space-y-0.5 text-[11px]">
							{#each cdSubs.rows as row}
								<div class="flex items-center justify-between">
									<span class="text-muted-foreground">{row.label}</span>
									<RowValue {row} size="sm" />
								</div>
							{/each}
						</div>
					</div>
				</Collapsible.Content>
			</Collapsible.Root>
		{/if}

		<!-- Sharing as compact table -->
		{#if sharingSection}
			<section class="space-y-2">
				<h3 class="text-xs font-bold text-foreground">{sharingSection.title}</h3>
				<div class="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
					{#each sharingSection.rows as row}
						<div class="flex items-center justify-between">
							<span class="text-muted-foreground">{row.label}</span>
							<RowValue {row} size="md" />
						</div>
					{/each}
				</div>
			</section>
		{/if}
	</div>
</Tooltip.Provider>
