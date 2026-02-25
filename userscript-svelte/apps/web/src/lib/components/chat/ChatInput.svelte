<script lang="ts">
  let { onSend, disabled = false }: { onSend: (text: string) => void; disabled?: boolean } = $props();

  let inputText = $state('');

  function handleSubmit(e: Event) {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || disabled) return;
    onSend(text);
    inputText = '';
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }
</script>

<form class="chat-input" onsubmit={handleSubmit}>
  <textarea
    class="chat-input__textarea"
    placeholder="Ask about this report..."
    bind:value={inputText}
    onkeydown={handleKeydown}
    {disabled}
    rows={1}
  ></textarea>
  <button
    type="submit"
    class="chat-input__button"
    disabled={disabled || !inputText.trim()}
  >
    Send
  </button>
</form>

<style>
  .chat-input {
    display: flex;
    gap: 8px;
    padding: 12px;
    border-top: 1px solid var(--color-border, #e5e7eb);
    background: var(--color-surface, #fff);
  }

  .chat-input__textarea {
    flex: 1;
    resize: none;
    border: 1px solid var(--color-border, #d1d5db);
    border-radius: 8px;
    padding: 8px 12px;
    font-size: 14px;
    line-height: 1.5;
    font-family: inherit;
    background: var(--color-bg, #fff);
    color: var(--color-text, #1f2937);
    outline: none;
    min-height: 38px;
    max-height: 120px;
  }

  .chat-input__textarea:focus {
    border-color: var(--color-primary, #3b82f6);
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }

  .chat-input__textarea:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .chat-input__button {
    padding: 8px 16px;
    border: none;
    border-radius: 8px;
    background: var(--color-primary, #3b82f6);
    color: white;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    align-self: flex-end;
  }

  .chat-input__button:hover:not(:disabled) {
    background: var(--color-primary-hover, #2563eb);
  }

  .chat-input__button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
</style>
