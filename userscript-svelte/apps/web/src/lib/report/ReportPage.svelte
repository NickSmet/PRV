<script lang="ts">
  import { browser } from '$app/environment';
  import MessageSquare from '@lucide/svelte/icons/message-square';
  import Logs from '@lucide/svelte/icons/logs';
  import SquareArrowOutUpRight from '@lucide/svelte/icons/square-arrow-out-up-right';
  import X from '@lucide/svelte/icons/x';

  import { RealityViewer } from '@prv/report-ui-svelte';
  import type { NodeModel, RealityModel, RealityRawItem } from '@prv/report-viewmodel';
  import type { Marker, CurrentVmModel } from '@prv/report-core';

  import ChatPanel from '$lib/components/chat/ChatPanel.svelte';
  import { createChatContext, setChatContext } from '$lib/contexts/chat-context.svelte';
  import { builtinSectionIcons, iconUrlByIconKey, reportusParserIcons } from '$lib/reportusIcons';

  type ReportPageData = {
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
    vmIpsByUuid: Record<string, string[]>;
    markers: Marker[];
    nodes: NodeModel[];
    rawItems: RealityRawItem[];
    vmConfigByUuid: Record<string, CurrentVmModel | null>;
    toolsLogMetaByUuid: Record<
      string,
      { status?: string; hasCorruptRegistry?: boolean; hasPrlDdIssue?: boolean; kbArticle?: string } | null
    >;
  };

  let { data }: { data: ReportPageData } = $props();

  let chatOpen = $state(false);
  let logsOpen = $state(false);

  const reportId = $derived(String(data.reality.reportId));
  const logsPath = $derived(`/${encodeURIComponent(reportId)}/logs`);

  const chatContext = createChatContext(String(data.reality.reportId));
  setChatContext(chatContext);

  $effect(() => {
    if (!browser || !logsOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  });

  $effect(() => {
    if (!browser || !logsOpen) return;

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        logsOpen = false;
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  });

  function closeLogsOverlay() {
    logsOpen = false;
  }
</script>

<div class="page-layout" class:page-layout--chat-open={chatOpen}>
  <main class="page-layout__main p-4">
    <RealityViewer
      reportId={data.reality.reportId}
      reality={data.reality}
      reportMeta={data.reportMeta}
      hostSummary={data.hostSummary}
      vmIpsByUuid={data.vmIpsByUuid}
      markers={data.markers}
      nodes={data.nodes}
      rawItems={data.rawItems}
      vmConfigByUuid={data.vmConfigByUuid}
      toolsLogMetaByUuid={data.toolsLogMetaByUuid}
      sectionIconUrls={{
        host: builtinSectionIcons.hostApple,
        parallels: builtinSectionIcons.parallels,
        vms: reportusParserIcons.vms
      }}
      vmIconUrl={reportusParserIcons.vms}
      iconUrlByKey={iconUrlByIconKey}
    />
  </main>

  {#if chatOpen}
    <aside class="page-layout__chat">
      <ChatPanel />
    </aside>
  {/if}

  <div class="floating-actions">
    <button
      class="floating-action"
      onclick={() => logsOpen = true}
      title="Open logs timeline"
      type="button"
    >
      <Logs class="h-4 w-4" />
      <span>Logs</span>
    </button>

    <button
      class="floating-action"
      class:floating-action--active={chatOpen}
      onclick={() => chatOpen = !chatOpen}
      title={chatOpen ? 'Close chat' : 'Open chat'}
      type="button"
    >
      <MessageSquare class="h-4 w-4" />
      <span>{chatOpen ? 'Hide chat' : 'Chat'}</span>
    </button>
  </div>

  {#if logsOpen}
    <div class="logs-overlay-backdrop">
      <button
        aria-label="Close logs"
        class="logs-overlay__scrim"
        onclick={closeLogsOverlay}
        type="button"
      ></button>

      <div
        aria-label="Report logs"
        aria-modal="true"
        class="logs-overlay"
        role="dialog"
      >
        <header class="logs-overlay__header">
          <div class="logs-overlay__title-wrap">
            <div class="logs-overlay__eyebrow">Logs workspace</div>
            <div class="logs-overlay__title">Report {reportId}</div>
          </div>

          <div class="logs-overlay__actions">
            <a
              class="logs-overlay__link"
              href={logsPath}
              rel="noreferrer"
              target="_blank"
            >
              <SquareArrowOutUpRight class="h-4 w-4" />
              <span>Open standalone</span>
            </a>

            <button
              class="logs-overlay__close"
              onclick={closeLogsOverlay}
              title="Close logs"
              type="button"
            >
              <X class="h-4 w-4" />
            </button>
          </div>
        </header>

        <div class="logs-overlay__body">
          <iframe class="logs-overlay__frame" src={logsPath} title={`Report ${reportId} logs`}></iframe>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .page-layout {
    display: flex;
    height: 100vh;
    overflow: hidden;
    position: relative;
  }

  .page-layout__main {
    flex: 1;
    min-width: 0;
    overflow-y: auto;
  }

  .page-layout__chat {
    width: 400px;
    min-width: 320px;
    height: 100vh;
    flex-shrink: 0;
  }

  .floating-actions {
    position: fixed;
    right: 20px;
    bottom: 20px;
    z-index: 100;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 10px;
  }

  .floating-action {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    border: none;
    border-radius: 999px;
    padding: 10px 16px;
    background: rgba(15, 23, 42, 0.92);
    color: white;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.24);
    transition:
      transform 0.15s ease,
      background 0.15s ease;
  }

  .floating-action:hover {
    transform: translateY(-1px);
    background: rgba(15, 23, 42, 1);
  }

  .floating-action--active {
    background: rgba(71, 85, 105, 0.95);
  }

  .logs-overlay-backdrop {
    position: fixed;
    inset: 0;
    z-index: 140;
    display: flex;
    padding: 18px;
    pointer-events: auto;
    background: rgba(15, 23, 42, 0.58);
    backdrop-filter: blur(6px);
  }

  .logs-overlay__scrim {
    position: absolute;
    inset: 0;
    border: 0;
    background: transparent;
    cursor: pointer;
  }

  .logs-overlay {
    position: relative;
    display: flex;
    flex: 1;
    min-height: 0;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid rgba(148, 163, 184, 0.35);
    border-radius: 20px;
    background: white;
    box-shadow: 0 24px 80px rgba(15, 23, 42, 0.28);
    z-index: 1;
  }

  .logs-overlay__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    border-bottom: 1px solid rgba(226, 232, 240, 1);
    padding: 14px 18px;
    background:
      radial-gradient(circle at top left, rgba(191, 219, 254, 0.45), transparent 34%),
      linear-gradient(180deg, rgba(248, 250, 252, 1), rgba(255, 255, 255, 0.98));
  }

  .logs-overlay__title-wrap {
    min-width: 0;
  }

  .logs-overlay__eyebrow {
    color: rgb(100 116 139);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .logs-overlay__title {
    color: rgb(15 23 42);
    font-size: 16px;
    font-weight: 700;
  }

  .logs-overlay__actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .logs-overlay__link,
  .logs-overlay__close {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    border: 1px solid rgba(203, 213, 225, 1);
    border-radius: 999px;
    background: white;
    color: rgb(15 23 42);
    font-size: 13px;
    font-weight: 600;
    text-decoration: none;
  }

  .logs-overlay__link {
    padding: 8px 12px;
  }

  .logs-overlay__close {
    justify-content: center;
    width: 38px;
    height: 38px;
    cursor: pointer;
  }

  .logs-overlay__body {
    flex: 1;
    min-height: 0;
    background: rgb(248 250 252);
  }

  .logs-overlay__frame {
    width: 100%;
    height: 100%;
    border: 0;
    background: white;
  }

  @media (max-width: 900px) {
    .page-layout__chat {
      position: fixed;
      inset: 0;
      width: auto;
      min-width: 0;
      z-index: 120;
    }

    .floating-actions {
      right: 14px;
      bottom: 14px;
      gap: 8px;
    }

    .floating-action {
      padding: 10px 14px;
    }

    .logs-overlay-backdrop {
      padding: 10px;
    }

    .logs-overlay__header {
      align-items: flex-start;
      flex-direction: column;
    }

    .logs-overlay__actions {
      width: 100%;
      justify-content: space-between;
    }
  }
</style>
