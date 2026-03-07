<script lang="ts">
  import {
    Tool,
    ToolHeader,
    ToolContent,
    ToolInput,
    ToolOutput,
    type ToolUIPartState,
  } from "$lib/components/ai-elements/tool/index";

  import type { ToolCallEntry } from "$lib/contexts/chat-context.svelte";

  type ToolCallRecord = {
    tool_call: {
      tool_name: string;
      tool_args: string;
    };
    tool_result?: {
      error_message?: string;
      timestamp?: number;
      tool_result?: string | null;
      content?: string | null;
    };
  };

  type Props = {
    entry: ToolCallEntry;
  };

  let { entry }: Props = $props();

  const toolCall = $derived.by((): ToolCallRecord => {
    return {
      tool_call: {
        tool_name: entry.tool_call.tool_name,
        tool_args: entry.tool_call.tool_args,
      },
      tool_result: entry.tool_result
        ? {
            error_message: entry.tool_result.error_message ?? undefined,
            timestamp: entry.tool_result.timestamp,
            tool_result: entry.tool_result.tool_result,
            content: entry.tool_result.content,
          }
        : undefined,
    };
  });

  const state = $derived.by((): ToolUIPartState => {
    if (!toolCall.tool_result) return "input-available";
    if (toolCall.tool_result.error_message) return "output-error";
    return "output-available";
  });

  const input = $derived.by((): Record<string, unknown> => {
    try {
      const parsed = JSON.parse(toolCall.tool_call.tool_args);
      if (parsed && typeof parsed === "object") return parsed;
      return { value: parsed };
    } catch {
      return { raw: toolCall.tool_call.tool_args };
    }
  });

  const output = $derived.by((): unknown => {
    const raw = toolCall.tool_result?.tool_result ?? toolCall.tool_result?.content ?? null;
    if (!raw) return undefined;

    if (typeof raw !== "string") return raw;

    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  });

  const errorText = $derived.by((): string | undefined => {
    return toolCall.tool_result?.error_message ?? undefined;
  });
</script>

<Tool>
  <ToolHeader type={toolCall.tool_call.tool_name} state={state} />
  <ToolContent>
    <ToolInput input={input} />
    <ToolOutput {output} {errorText} />
  </ToolContent>
</Tool>

