<script lang="ts">
  import { RealityViewer } from '@prv/report-ui-svelte';
  import type { NodeModel, RealityModel, RealityRawItem } from '@prv/report-viewmodel';
  import type { Marker, CurrentVmModel } from '@prv/report-core';
  import ChatPanel from '$lib/components/chat/ChatPanel.svelte';
  import { createChatContext, setChatContext } from '$lib/contexts/chat-context.svelte';

  let { data }: {
    data: {
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
  } = $props();

  let chatOpen = $state(false);

  // Create and set chat context for this report
  const chatContext = createChatContext(String(data.reality.reportId));
  setChatContext(chatContext);
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
    />
  </main>

  <!-- Chat toggle button -->
  <button
    class="chat-toggle"
    class:chat-toggle--active={chatOpen}
    onclick={() => chatOpen = !chatOpen}
    title={chatOpen ? 'Close chat' : 'Open chat'}
  >
    {chatOpen ? '\u2715' : 'Chat'}
  </button>

  <!-- Chat side panel -->
  {#if chatOpen}
    <aside class="page-layout__chat">
      <ChatPanel />
    </aside>
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
    overflow-y: auto;
    min-width: 0;
  }

  .page-layout__chat {
    width: 400px;
    min-width: 320px;
    height: 100vh;
    flex-shrink: 0;
  }

  .chat-toggle {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 100;
    padding: 10px 20px;
    border: none;
    border-radius: 24px;
    background: var(--color-primary, #3b82f6);
    color: white;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    transition: background 0.15s;
  }

  .chat-toggle:hover {
    background: var(--color-primary-hover, #2563eb);
  }

  .chat-toggle--active {
    background: var(--color-text-muted, #6b7280);
    padding: 10px 14px;
    border-radius: 50%;
  }

  .chat-toggle--active:hover {
    background: var(--color-text, #374151);
  }
</style>
