<script lang="ts">
	import { browser } from '$app/environment';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import type { Pane } from 'paneforge';
	import { onDestroy } from 'svelte';

	import * as Resizable from '$lib/components/ui/resizable';
	import { LogWorkspaceController } from '$lib/lab/log-workspace/createLogWorkspace.svelte';
	import type { LogWorkspacePageData } from '$lib/lab/log-workspace/types';
	import LogViewerDetailPane from '$lib/lab/log-viewer/LogViewerDetailPane.svelte';
	import LogViewerTable from '$lib/lab/log-viewer/LogViewerTable.svelte';
	import LogViewerToolbar from '$lib/lab/log-viewer/LogViewerToolbar.svelte';
	import { VIEWER_COLORS, VIEWER_FONTS } from '$lib/lab/log-viewer/theme';

	import LogTimeline from './LogTimeline.svelte';
	import LogTimelineDetailPane from './LogTimelineDetailPane.svelte';
	import LogTimelineToolbar from './LogTimelineToolbar.svelte';

	let { data }: { data: LogWorkspacePageData } = $props();

	let workspace = $state<LogWorkspaceController | null>(null);

	// timelineCollapsed tracks whether the timeline vis section is hidden.
	// It stays true even when the pane is at its collapsedSize (just the header strip).
	let timelineCollapsed = $state(false);

	// Pane refs for programmatic collapse/expand.
	// Type is the Svelte component instance of paneforge's Pane.
	let timelinePane = $state<Pane | null>(null);
	let timelineDetailPane = $state<Pane | null>(null);
	let logDetailPane = $state<Pane | null>(null);

	$effect.pre(() => {
		const nextData = data;
		if (workspace?.data.reportId === nextData.reportId) return;
		workspace?.destroy();
		workspace = new LogWorkspaceController(nextData);
		if (browser) workspace.init();
	});

	onDestroy(() => {
		workspace?.destroy();
	});

	// Toggle timeline by driving the pane; onCollapse/onExpand keep timelineCollapsed in sync.
	function toggleTimeline() {
		if (timelineCollapsed) {
			timelinePane?.expand();
		} else {
			timelinePane?.collapse();
		}
	}

	// Whether the log row detail panel should be open.
	const showLogDetail = $derived(!!(workspace?.detailOpen && workspace?.selectedRow));

	// Keep timeline detail pane in sync with selected event.
	$effect(() => {
		const pane = timelineDetailPane;
		const ws = workspace;
		if (!pane || !ws) return;
		if (ws.selectedEvent) {
			if (pane.isCollapsed()) pane.expand();
		} else {
			if (!pane.isCollapsed()) pane.collapse();
		}
	});

	// Keep log detail pane in sync with detailOpen + selectedRow.
	$effect(() => {
		const pane = logDetailPane;
		if (!pane) return;
		if (showLogDetail) {
			if (pane.isCollapsed()) pane.expand();
		} else {
			if (!pane.isCollapsed()) pane.collapse();
		}
	});
</script>

{#if workspace}
	<main
		style={`font-family:${VIEWER_FONTS.sans}; background:${VIEWER_COLORS.bg}; display:flex; flex-direction:column; height:100dvh; overflow:hidden; color:${VIEWER_COLORS.t0}; font-size:11px;`}
	>
		<!-- ── breadcrumb header ──────────────────────────────────────── -->
		<div style="display:flex; align-items:center; justify-content:space-between; gap:12px; padding:8px 12px; flex-shrink:0;">
			<div class="flex items-center gap-2 flex-wrap">
				<a
					style={`font-size:12px; color:${VIEWER_COLORS.t2}; text-decoration:underline; text-underline-offset:2px;`}
					href="/lab/timeline"
				>
					Timeline
				</a>
				<span style={`color:${VIEWER_COLORS.t3}; font-size:12px;`}>/</span>
				<a
					style={`font-size:12px; color:${VIEWER_COLORS.t2}; text-decoration:underline; text-underline-offset:2px;`}
					href={`/lab/timeline/${encodeURIComponent(data.reportId)}`}
				>
					Debug
				</a>
				<span style={`color:${VIEWER_COLORS.t3}; font-size:12px;`}>/</span>
				<span style={`font-size:14px; font-weight:700; color:${VIEWER_COLORS.t1};`}>Compact</span>
				<span style={`font-size:12px; color:${VIEWER_COLORS.t2};`}>Report {data.reportId}</span>
			</div>
		</div>

		{#if !data.reportOk}
			<div
				style={`margin:0 12px 12px; border:1px solid ${VIEWER_COLORS.b1}; border-radius:10px; background:#fff; padding:12px; color:${VIEWER_COLORS.t2}; font-size:12px;`}
			>
				Report <code style={`font-family:${VIEWER_FONTS.mono};`}>{data.reportId}</code> is not available through Reportus and no matching fixture fallback was found.
			</div>
		{:else}
			<!-- ── file / filter toolbar ─────────────────────────────────── -->
			<LogTimelineToolbar
				files={data.files}
				selectedFiles={workspace.selectedFiles}
				loading={workspace.loading || workspace.timelineLoading}
				eventCount={workspace.events.length}
				onToggleFile={(filename) => workspace?.toggleFile(filename)}
				onReload={() => workspace?.reloadSelected()}
			/>

			<!-- ── main resizable area ───────────────────────────────────── -->
			<!--
				Level 1 (vertical): timeline section ↕ log viewer section.
				  collapsedSize=5  → the timeline snaps to ~5 % (≈30 px header strip)
				                     so the header button stays visible & clickable.
				  minSize=15       → dragging below ~15 % triggers the snap-to-header.

				Level 2a (horizontal inside timeline): vis-timeline ↔ event detail.
				Level 2b (horizontal inside log): log table ↔ row detail.
				  Both detail panes: collapsedSize=0, minSize=3 (≈30 px on typical widths).
				  Dragging below 3 % collapses the detail → same effect as clicking Close.
			-->
			<div style="flex:1; min-height:0; overflow:hidden; padding:12px; display:flex; flex-direction:column;">
				<Resizable.PaneGroup direction="vertical" style="flex:1; min-height:0;">

					<!-- ── TIMELINE PANE ─────────────────────────────────────── -->
					<Resizable.Pane
						bind:this={timelinePane}
						defaultSize={42}
						minSize={15}
						collapsible={true}
						collapsedSize={5}
						onCollapse={() => (timelineCollapsed = true)}
						onExpand={() => (timelineCollapsed = false)}
					>
						<!--
							This div fills the pane and provides the card border/radius.
							margin-bottom creates visual gap between the two cards;
							it's 0 when we are fully within the pane sizing flow.
						-->
						<div
							style={`height:100%; border:1px solid ${VIEWER_COLORS.b1}; border-radius:10px; background:#fff; overflow:hidden; display:flex; flex-direction:column;`}
						>
							<!-- header strip — always visible, even when pane is at collapsedSize -->
							<button
								type="button"
								onclick={toggleTimeline}
								style={`display:flex; align-items:center; gap:8px; padding:8px 10px; border:none; border-bottom:${timelineCollapsed ? '0' : `1px solid ${VIEWER_COLORS.b1}`}; background:${VIEWER_COLORS.panelBg}; cursor:pointer; text-align:left; flex-shrink:0; width:100%;`}
								aria-expanded={!timelineCollapsed}
							>
								{#if timelineCollapsed}
									<ChevronRight class="h-4 w-4" />
								{:else}
									<ChevronDown class="h-4 w-4" />
								{/if}
								<span
									style={`font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; color:${VIEWER_COLORS.t2};`}
								>
									Timeline
								</span>
								{#if workspace.selectedEvent}
									<span
										style={`font-size:11px; color:${VIEWER_COLORS.t3}; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;`}
									>
										{workspace.selectedEvent.label}
									</span>
								{/if}
								<span style="flex:1;"></span>
								<span
									style={`font-size:10px; font-family:${VIEWER_FONTS.mono}; color:${VIEWER_COLORS.t3};`}
								>
									{workspace.events.length} events
								</span>
							</button>

							{#if !timelineCollapsed}
								<!-- Level 2a: horizontal split — vis-timeline | event detail -->
								<Resizable.PaneGroup
									direction="horizontal"
									style="flex:1; min-height:0; min-width:0;"
								>
									<Resizable.Pane defaultSize={72} minSize={20}>
								<div
										style="height:100%; padding:10px; display:flex; flex-direction:column; overflow:hidden; gap:8px;"
									>
										<div style="flex:1; min-height:0; overflow:hidden;">
											<LogTimeline
												payload={workspace.timelinePayload}
												loading={workspace.timelineLoading}
												error={workspace.timelineError}
												hasSelection={workspace.selectedFiles.length > 0}
												onItemClick={(item) => workspace?.onTimelineItemClick(item)}
											/>
										</div>
										{#if workspace.timelineNotice}
											<div
												style={`flex-shrink:0; border:1px solid ${VIEWER_COLORS.b1}; border-radius:8px; background:#fff; padding:8px 10px; font-size:11px; color:${VIEWER_COLORS.t2};`}
											>
												{workspace.timelineNotice}
											</div>
										{/if}
									</div>
									</Resizable.Pane>

									<Resizable.Handle withHandle={true} />

									<!-- Timeline event detail: collapses to 0 when dragged < 3 % -->
									<Resizable.Pane
										bind:this={timelineDetailPane}
										defaultSize={28}
										minSize={3}
										collapsible={true}
										collapsedSize={0}
									onCollapse={() => workspace?.selectTimelineEvent(null)}
								>
									{#if workspace.selectedEvent}
										<LogTimelineDetailPane
											event={workspace.selectedEvent}
											onClose={() => workspace?.selectTimelineEvent(null)}
											/>
										{/if}
									</Resizable.Pane>
								</Resizable.PaneGroup>
							{/if}
						</div>
					</Resizable.Pane>

					<!-- ── VERTICAL RESIZE HANDLE ────────────────────────────── -->
					<Resizable.Handle withHandle={true} class="my-1.5" />

					<!-- ── LOG VIEWER PANE ───────────────────────────────────── -->
					<Resizable.Pane defaultSize={58} minSize={20}>
						<div
							style={`height:100%; border:1px solid ${VIEWER_COLORS.b1}; border-radius:10px; overflow:hidden; background:${VIEWER_COLORS.bg}; display:flex; flex-direction:column;`}
						>
						<LogViewerToolbar
							files={data.files}
							selectedFiles={workspace.selectedFiles}
							stats={workspace.stats}
							clipped={workspace.clipped}
							totalRows={workspace.totalRows}
							totalMatches={workspace.totalMatches}
							searchInput={workspace.searchInput}
							searchQuery={workspace.searchQuery}
							matchCount={workspace.matchCount}
							activeMatchOrdinal={workspace.activeMatchOrdinal}
							findLoading={workspace.findLoading}
							showFileToggles={false}
							onToggleFile={(filename) => workspace?.toggleFile(filename)}
							onSearchInput={(value) => workspace?.setSearchInput(value)}
							onClearSearch={() => workspace?.clearSearch()}
							onSearchKeydown={(event) => workspace?.handleSearchKeydown(event)}
							onMoveMatch={(delta) => workspace?.moveMatch(delta)}
							onJumpToMatch={(ordinal) => workspace?.jumpToMatchOrdinal(ordinal)}
						/>

							{#if workspace.error}
								<div
									style={`margin:10px 12px 0; border:1px solid ${VIEWER_COLORS.b1}; border-radius:8px; background:#fff; padding:10px; font-size:12px; color:#B91C1C;`}
								>
									{workspace.error}
								</div>
							{/if}

							<!-- Level 2b: horizontal split — log table | row detail -->
							<Resizable.PaneGroup
								direction="horizontal"
								style="flex:1; min-height:0; min-width:0;"
							>
							<Resizable.Pane defaultSize={72} minSize={20}>
								<div style="height:100%; display:flex; flex-direction:column; overflow:hidden;">
									<LogViewerTable
										renderReady={workspace.renderReady}
										loading={workspace.loading}
										selectedFileMetas={workspace.selectedFileMetas}
										progressByFile={workspace.progressByFile}
										totalRows={workspace.totalRows}
										virtual={workspace.virtual}
										placeholder={workspace.placeholder}
										rowHeight={workspace.rowHeight}
										selectedRowId={workspace.selectedRow?.id ?? null}
										searchQuery={workspace.searchQuery}
										matchRowIdSet={workspace.matchRowIdSet}
										activeMatchRowId={workspace.activeMatchRowId}
										onTableElementChange={(element) =>
											workspace?.handleTableElementChange(element)}
										onViewportHeightChange={(value) =>
											workspace?.handleViewportHeightChange(value)}
										onScroll={(event) => workspace?.handleScroll(event)}
										onOpenRow={(row) => workspace?.openRow(row)}
									/>
								</div>
							</Resizable.Pane>

								<Resizable.Handle withHandle={true} />

								<!-- Row detail: collapses to 0 when dragged < 3 % -->
								<Resizable.Pane
									bind:this={logDetailPane}
									defaultSize={28}
									minSize={3}
									collapsible={true}
									collapsedSize={0}
									onCollapse={() => {
										if (workspace) workspace.detailOpen = false;
									}}
								>
									{#if showLogDetail && workspace.selectedRow}
										<LogViewerDetailPane
											selectedRow={workspace.selectedRow}
											detailOpen={workspace.detailOpen}
											fillContainer={true}
									onClose={() => { if (workspace) workspace.detailOpen = false; }}
										onCopyRaw={(row) => workspace?.copyRaw(row)}
										/>
									{/if}
								</Resizable.Pane>
							</Resizable.PaneGroup>
						</div>
					</Resizable.Pane>

				</Resizable.PaneGroup>
			</div>
		{/if}
	</main>
{/if}

<style>
	:global(.vis-item.prv-ct-item) {
		border-radius: 4px;
		border-width: 1px;
		font-size: 11px;
		font-weight: 500;
		line-height: 1.3;
	}

	:global(.vis-item.prv-ct-item .vis-item-content) {
		padding: 1px 6px;
		display: flex;
		align-items: center;
		gap: 3px;
	}

	:global(.vis-item.prv-ct-item--apps) {
		background: rgba(16, 185, 129, 0.12);
		border-color: rgba(16, 185, 129, 0.35);
		color: rgb(6, 95, 70);
	}

	:global(.vis-item.prv-ct-item--gui) {
		background: rgba(59, 130, 246, 0.12);
		border-color: rgba(59, 130, 246, 0.35);
		color: rgb(30, 64, 175);
	}

	:global(.vis-item.prv-ct-item--config) {
		background: rgba(217, 119, 6, 0.12);
		border-color: rgba(217, 119, 6, 0.35);
		color: rgb(120, 53, 15);
	}

	:global(.vis-item.prv-ct-item--warn) {
		border-color: rgba(234, 179, 8, 0.5);
		background: rgba(234, 179, 8, 0.12);
		color: rgb(113, 63, 18);
	}

	:global(.vis-item.prv-ct-item--danger) {
		border-color: rgba(239, 68, 68, 0.5);
		background: rgba(239, 68, 68, 0.1);
		color: rgb(127, 29, 29);
	}

	:global(.vis-item.prv-ct-item.vis-selected) {
		box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.4);
	}

	:global(.prv-ct-sev) {
		display: inline-block;
		width: 6px;
		height: 6px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	:global(.prv-ct-sev--warn) {
		background: #f59e0b;
	}

	:global(.prv-ct-sev--danger) {
		background: #ef4444;
	}

	:global(.prv-ct-label) {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	:global(.prv-ct-cat-label) {
		font-weight: 700;
		font-size: 12px;
	}

	:global(.prv-ct-cat-label--apps) {
		color: rgb(6, 95, 70);
	}

	:global(.prv-ct-cat-label--gui) {
		color: rgb(30, 64, 175);
	}

	:global(.prv-ct-cat-label--config) {
		color: rgb(120, 53, 15);
	}

	:global(.prv-ct-cat-count) {
		font-size: 9px;
		font-weight: 500;
		color: #94a3b8;
		margin-left: 2px;
	}

	:global(.vis-label.prv-ct-group--sub-parent) {
		font-weight: 700;
	}

	:global(.prv-ct-sub-label) {
		font-weight: 700;
		font-size: 12px;
		color: #1e293b;
	}

	:global(.vis-label.prv-ct-group--cat) {
		font-size: 11px;
	}

	:global(.prv-timeline-container) {
		min-height: 200px !important;
		border-radius: 8px !important;
	}

	:global(.prv-ct-pill) {
		display: inline-flex;
		align-items: center;
		padding: 2px 8px;
		border-radius: 999px;
		border: 1px solid hsl(var(--border));
		font-size: 10px;
		line-height: 1.4;
		color: hsl(var(--muted-foreground));
		background: hsl(var(--background));
	}

	:global(.prv-ct-pill--apps) {
		border-color: rgba(16, 185, 129, 0.35);
		color: rgba(6, 95, 70, 0.95);
	}

	:global(.prv-ct-pill--gui) {
		border-color: rgba(59, 130, 246, 0.35);
		color: rgba(30, 64, 175, 0.95);
	}

	:global(.prv-ct-pill--config) {
		border-color: rgba(217, 119, 6, 0.35);
		color: rgba(120, 53, 15, 0.95);
	}
</style>
