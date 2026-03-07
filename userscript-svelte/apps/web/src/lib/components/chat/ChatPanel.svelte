<script lang="ts">
  import { getChatContext, type ToolCallEntry } from "$lib/contexts/chat-context.svelte";
  import { Button } from "$lib/components/ui/button/index";
  import AiElementsChat from "./AiElementsChat.svelte";
  import ToolCallCard from "./ToolCallCard.svelte";

  const chat = getChatContext();

  const messages = $derived(chat.state.messages);
  const toolCalls = $derived(chat.state.toolCalls);
  const isLoading = $derived(chat.state.status === "loading");
  const errorText = $derived(chat.state.error);

  const sortedToolCalls = $derived.by(() => {
    return [...toolCalls].sort((a, b) => a.tool_call.timestamp - b.tool_call.timestamp);
  });

  function toolCallsBetween(index: number): ToolCallEntry[] {
    const current = messages[index];
    if (!current) return [];
    const currentTime = current.timestamp.getTime();
    const nextTime = index + 1 < messages.length ? messages[index + 1]!.timestamp.getTime() : Infinity;

    return sortedToolCalls.filter((tc) => {
      if (!tc.tool_result) return false;
      const t = tc.tool_call.timestamp;
      return t >= currentTime && t < nextTime;
    });
  }

  const inProgressToolCalls = $derived.by(() => sortedToolCalls.filter((tc) => !tc.tool_result));

  async function handleSendMessage(text: string) {
    await chat.sendMessage(text);
  }
</script>

<AiElementsChat
  reportId={chat.reportId}
  displayId={chat.conversationId}
  title="Report Chat"
  {messages}
  {isLoading}
  onSendMessage={handleSendMessage}
>
  {#snippet headerActions()}
    <Button size="sm" variant="outline" onclick={() => chat.clearConversation()}>
      Clear
    </Button>
  {/snippet}

  {#snippet topPanel()}
    {#if errorText}
      <div class="shrink-0 border-b bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {errorText}
      </div>
    {/if}
  {/snippet}

  {#snippet messageContent(_message, index)}
    {#each toolCallsBetween(index) as tc (tc.tool_call.tool_call_id)}
      <ToolCallCard entry={tc} />
    {/each}
  {/snippet}

  {#snippet loadingContent()}
    {#if isLoading}
      {#each inProgressToolCalls as tc (tc.tool_call.tool_call_id)}
        <ToolCallCard entry={tc} />
      {/each}
    {/if}
  {/snippet}
</AiElementsChat>
