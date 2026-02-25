<script lang="ts">
  import type { ChatMessage } from '$lib/contexts/chat-context.svelte';

  let { message }: { message: ChatMessage } = $props();

  const isUser = $derived(message.role === 'user');
</script>

<div class="chat-message" class:chat-message--user={isUser} class:chat-message--assistant={!isUser}>
  <div class="chat-message__role">
    {isUser ? 'You' : 'Assistant'}
  </div>
  <div class="chat-message__content">
    {message.content}
  </div>
</div>

<style>
  .chat-message {
    padding: 12px 16px;
    max-width: 85%;
    border-radius: 12px;
    font-size: 14px;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .chat-message--user {
    align-self: flex-end;
    background: var(--color-primary, #3b82f6);
    color: white;
    border-bottom-right-radius: 4px;
  }

  .chat-message--assistant {
    align-self: flex-start;
    background: var(--color-surface-alt, #f3f4f6);
    color: var(--color-text, #1f2937);
    border-bottom-left-radius: 4px;
  }

  .chat-message__role {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
    opacity: 0.7;
  }

  .chat-message__content {
    margin: 0;
  }
</style>
