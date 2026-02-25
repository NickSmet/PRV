<script lang="ts">
  import { getChatContext, type ChatMessage, type ToolCallEntry } from '$lib/contexts/chat-context.svelte';
  import ChatMessageComponent from './ChatMessage.svelte';
  import ToolCallCard from './ToolCallCard.svelte';
  import ChatInput from './ChatInput.svelte';

  const chat = getChatContext();

  let messagesContainer: HTMLDivElement | undefined = $state();

  // Auto-scroll to bottom when messages change
  $effect(() => {
    // Access reactive dependencies
    const _ = chat.state.messages.length + chat.state.toolCalls.length;
    if (messagesContainer) {
      // Use setTimeout to let the DOM render first
      setTimeout(() => {
        if (messagesContainer) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      }, 0);
    }
  });

  /**
   * Interleave messages and tool calls by timestamp.
   * Tool calls are placed between the messages they occurred between.
   */
  function buildDisplayItems(): Array<{ type: 'message'; data: ChatMessage } | { type: 'tool'; data: ToolCallEntry }> {
    const messages = chat.state.messages;
    const toolCalls = chat.state.toolCalls;
    const items: Array<{ type: 'message'; data: ChatMessage } | { type: 'tool'; data: ToolCallEntry }> = [];

    for (let i = 0; i < messages.length; i++) {
      items.push({ type: 'message', data: messages[i]! });

      // Find tool calls between this message and the next
      const currentTime = messages[i]!.timestamp.getTime();
      const nextTime = i + 1 < messages.length ? messages[i + 1]!.timestamp.getTime() : Infinity;

      for (const tc of toolCalls) {
        const tcTime = tc.tool_call.timestamp;
        if (tcTime >= currentTime && tcTime < nextTime) {
          items.push({ type: 'tool', data: tc });
        }
      }
    }

    // If no messages yet but there are tool calls, show them
    if (messages.length === 0) {
      for (const tc of toolCalls) {
        items.push({ type: 'tool', data: tc });
      }
    }

    return items;
  }

  const displayItems = $derived(buildDisplayItems());
  const isLoading = $derived(chat.state.status === 'loading');

  function handleSend(text: string) {
    chat.sendMessage(text);
  }
</script>

<div class="chat-panel">
  <div class="chat-panel__header">
    <span class="chat-panel__title">Report Chat</span>
    <button class="chat-panel__clear" onclick={() => chat.clearConversation()} title="New conversation">
      Clear
    </button>
  </div>

  <div class="chat-panel__messages" bind:this={messagesContainer}>
    {#if displayItems.length === 0}
      <div class="chat-panel__empty">
        Ask a question about this report. The AI will analyze the report data to answer.
      </div>
    {/if}

    {#each displayItems as item}
      {#if item.type === 'message'}
        <ChatMessageComponent message={item.data} />
      {:else}
        <ToolCallCard entry={item.data} />
      {/if}
    {/each}

    {#if isLoading}
      <div class="chat-panel__loading">
        <span class="chat-panel__dot"></span>
        <span class="chat-panel__dot"></span>
        <span class="chat-panel__dot"></span>
      </div>
    {/if}

    {#if chat.state.error}
      <div class="chat-panel__error">
        {chat.state.error}
      </div>
    {/if}
  </div>

  <ChatInput onSend={handleSend} disabled={isLoading} />
</div>

<style>
  .chat-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--color-bg, #fff);
    border-left: 1px solid var(--color-border, #e5e7eb);
  }

  .chat-panel__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid var(--color-border, #e5e7eb);
    background: var(--color-surface, #fff);
  }

  .chat-panel__title {
    font-weight: 600;
    font-size: 14px;
  }

  .chat-panel__clear {
    font-size: 12px;
    padding: 4px 8px;
    border: 1px solid var(--color-border, #d1d5db);
    border-radius: 4px;
    background: transparent;
    cursor: pointer;
    color: var(--color-text-muted, #6b7280);
  }

  .chat-panel__clear:hover {
    background: var(--color-surface-alt, #f3f4f6);
  }

  .chat-panel__messages {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .chat-panel__empty {
    text-align: center;
    color: var(--color-text-muted, #9ca3af);
    font-size: 14px;
    padding: 40px 20px;
    line-height: 1.6;
  }

  .chat-panel__loading {
    display: flex;
    gap: 4px;
    padding: 12px 16px;
    align-self: flex-start;
  }

  .chat-panel__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--color-text-muted, #9ca3af);
    animation: bounce 1.4s infinite ease-in-out both;
  }

  .chat-panel__dot:nth-child(1) { animation-delay: -0.32s; }
  .chat-panel__dot:nth-child(2) { animation-delay: -0.16s; }

  @keyframes bounce {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
  }

  .chat-panel__error {
    padding: 8px 12px;
    background: #fef2f2;
    color: var(--color-error, #ef4444);
    border-radius: 8px;
    font-size: 13px;
    align-self: flex-start;
  }
</style>
