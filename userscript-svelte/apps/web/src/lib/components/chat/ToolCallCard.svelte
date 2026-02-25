<script lang="ts">
  import type { ToolCallEntry } from '$lib/contexts/chat-context.svelte';

  let { entry }: { entry: ToolCallEntry } = $props();

  let expanded = $state(false);

  const status = $derived(
    entry.tool_result
      ? entry.tool_result.error_message
        ? 'error'
        : 'completed'
      : 'running'
  );

  const statusIcon = $derived(
    status === 'completed' ? '\u2713' :
    status === 'error' ? '\u2717' :
    '\u2026'
  );

  const toolName = $derived(entry.tool_call.tool_name.split('.').pop() ?? entry.tool_call.tool_name);

  function truncate(text: string, maxLen: number): string {
    if (text.length <= maxLen) return text;
    return text.slice(0, maxLen) + '...';
  }

  const resultPreview = $derived(() => {
    if (!entry.tool_result) return null;
    const raw = entry.tool_result.tool_result || entry.tool_result.content || '';
    return truncate(raw, 500);
  });
</script>

<div class="tool-card" class:tool-card--running={status === 'running'} class:tool-card--error={status === 'error'}>
  <button class="tool-card__header" onclick={() => expanded = !expanded}>
    <span class="tool-card__icon" class:tool-card__icon--running={status === 'running'} class:tool-card__icon--error={status === 'error'} class:tool-card__icon--ok={status === 'completed'}>
      {statusIcon}
    </span>
    <span class="tool-card__name">{toolName}</span>
    <span class="tool-card__chevron">{expanded ? '\u25B2' : '\u25BC'}</span>
  </button>

  {#if expanded}
    <div class="tool-card__body">
      <div class="tool-card__section">
        <div class="tool-card__label">Input</div>
        <pre class="tool-card__code">{entry.tool_call.tool_args}</pre>
      </div>

      {#if entry.tool_result}
        <div class="tool-card__section">
          <div class="tool-card__label">{entry.tool_result.error_message ? 'Error' : 'Output'}</div>
          {#if entry.tool_result.error_message}
            <pre class="tool-card__code tool-card__code--error">{entry.tool_result.error_message}</pre>
          {:else}
            <pre class="tool-card__code">{resultPreview()}</pre>
          {/if}
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .tool-card {
    border: 1px solid var(--color-border, #e5e7eb);
    border-radius: 8px;
    margin: 4px 0;
    overflow: hidden;
    font-size: 13px;
    align-self: flex-start;
    max-width: 90%;
  }

  .tool-card--running {
    border-color: var(--color-warning, #f59e0b);
  }

  .tool-card--error {
    border-color: var(--color-error, #ef4444);
  }

  .tool-card__header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: var(--color-surface-alt, #f9fafb);
    border: none;
    cursor: pointer;
    width: 100%;
    text-align: left;
    font-size: 13px;
    font-family: inherit;
    color: inherit;
  }

  .tool-card__header:hover {
    background: var(--color-surface-hover, #f3f4f6);
  }

  .tool-card__icon {
    font-size: 14px;
    font-weight: bold;
  }

  .tool-card__icon--ok { color: var(--color-success, #22c55e); }
  .tool-card__icon--error { color: var(--color-error, #ef4444); }
  .tool-card__icon--running { color: var(--color-warning, #f59e0b); }

  .tool-card__name {
    font-weight: 500;
    flex: 1;
    font-family: monospace;
  }

  .tool-card__chevron {
    font-size: 10px;
    opacity: 0.5;
  }

  .tool-card__body {
    padding: 8px 12px;
    border-top: 1px solid var(--color-border, #e5e7eb);
  }

  .tool-card__section {
    margin-bottom: 8px;
  }

  .tool-card__section:last-child {
    margin-bottom: 0;
  }

  .tool-card__label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
    opacity: 0.6;
  }

  .tool-card__code {
    background: var(--color-code-bg, #f1f5f9);
    padding: 8px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 12px;
    white-space: pre-wrap;
    word-break: break-all;
    max-height: 200px;
    overflow-y: auto;
    margin: 0;
  }

  .tool-card__code--error {
    background: #fef2f2;
    color: var(--color-error, #ef4444);
  }
</style>
