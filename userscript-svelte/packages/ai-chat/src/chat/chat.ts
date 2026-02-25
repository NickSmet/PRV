import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import type { ResponseFunctionToolCall, ResponseInputItem } from 'openai/resources/responses/responses';
import { randomUUID } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { MCPPooledConnectionManager } from '../mcp/connection-manager.js';
import { planChat, isChatToolEnabled, buildChatSystemPrompt, type ChatDependencies } from './agent-config.js';
import { getOpenAIClient } from '../providers/openai-client.js';
import type { ConversationToolSelection } from '../catalog/selection.js';
import type { NewChatMessageRow } from '../persistence/types.js';
import { safeJsonStringify } from '../utils.js';

// ── Debug helpers ──────────────────────────────────────────

let debugSeq = 0;

/** Dump a full API request payload to /tmp for inspection. */
function debugDumpPayload(label: string, payload: unknown): string {
  const seq = ++debugSeq;
  const filename = `prv-chat-debug-${seq}-${label}.json`;
  const filepath = join(tmpdir(), filename);
  try {
    writeFileSync(filepath, JSON.stringify(payload, null, 2), 'utf-8');
    console.log(`[Chat Debug] Wrote ${filepath}`);
  } catch (err) {
    console.error(`[Chat Debug] Failed to write ${filepath}:`, err);
  }
  return filepath;
}

/** Log full details of an Azure/OpenAI API error. */
function debugLogApiError(label: string, err: unknown, payload: unknown): void {
  const apiErr = err as {
    status?: number; message?: string; code?: string; type?: string;
    error?: { message?: string; type?: string; code?: string; param?: string };
    headers?: { get?: (name: string) => string | null };
  };

  console.error(`[Chat Debug] ${label} — API Error Details:`);
  console.error(`  status: ${apiErr.status}`);
  console.error(`  type: ${apiErr.type ?? apiErr.error?.type}`);
  console.error(`  code: ${apiErr.code ?? apiErr.error?.code}`);
  console.error(`  message: ${apiErr.message ?? apiErr.error?.message}`);

  // Dump the headers if available
  if (apiErr.headers && typeof apiErr.headers.get === 'function') {
    const interesting = ['x-ms-rai-invoked', 'x-ms-region', 'x-ms-deployment-name', 'x-request-id'];
    for (const h of interesting) {
      const v = apiErr.headers.get(h);
      if (v) console.error(`  ${h}: ${v}`);
    }
  }

  // Dump the payload that caused the error
  debugDumpPayload(`${label}-error-payload`, payload);
}

function isResponseFunctionToolCall(item: unknown): item is ResponseFunctionToolCall {
  if (!item || typeof item !== 'object') return false;
  const it = item as Record<string, unknown>;
  if (it.type !== 'function_call') return false;
  return typeof it.name === 'string' && typeof it.arguments === 'string' && typeof it.call_id === 'string';
}

function extractResponseFunctionToolCalls(output: unknown): ResponseFunctionToolCall[] {
  if (!Array.isArray(output)) return [];
  return output.filter(isResponseFunctionToolCall);
}

export async function runChat(
  deps: ChatDependencies,
  params: {
    conversationId?: string | null;
    message: string;
    selection?: ConversationToolSelection | null;
  },
): Promise<{ conversationId: string; response: string }> {
  const conversationId = params.conversationId || randomUUID();
  const { persistence, catalog, openaiConfig } = deps;

  const message = params.message?.trim();
  if (!message) throw new Error('Missing message');

  const plan = planChat({ catalog, selection: params.selection });

  // Persist user message immediately.
  const userMsg: NewChatMessageRow = {
    conversation_id: conversationId,
    timestamp: Date.now(),
    role: 'user',
    type: 'message',
    content: message,
    tool_call_id: null,
    tool_name: null,
    tool_args: null,
    tool_result: null,
    error_message: null,
  };
  await persistence.saveMessage(userMsg);

  if (plan.serverConfigs.length === 0) {
    const text = 'No tools are enabled. Enable at least one tool.';
    await persistence.saveMessage({
      conversation_id: conversationId,
      timestamp: Date.now(),
      role: 'assistant',
      type: 'message',
      content: text,
      tool_call_id: null,
      tool_name: null,
      tool_args: null,
      tool_result: null,
      error_message: null,
    });
    return { conversationId, response: text };
  }

  const mcp = new MCPPooledConnectionManager();
  try {
    for (const cfg of plan.serverConfigs) {
      await mcp.connect(cfg);
    }

    const allTools = mcp.getToolsForOpenAI();
    const tools = allTools.filter((t) => isChatToolEnabled({ toolName: t.function.name, enabledToolNames: plan.enabledToolNames }));
    const allResponseTools = mcp.getToolsForOpenAIResponses();
    const responseTools = allResponseTools.filter((t) => isChatToolEnabled({ toolName: t.name, enabledToolNames: plan.enabledToolNames }));

    const systemPrompt = buildChatSystemPrompt({ catalog, plan, basePrompt: deps.systemPrompt });
    const history = await persistence.getConversationMessages(conversationId, 50);

    // Load only non-empty message rows. Intermediate assistant messages from tool-calling
    // loops (which have empty content) must be excluded — they break the alternating
    // user/assistant pattern required by Chat Completions API.
    const historyMessages = history
      .filter((m) => m.type === 'message' && typeof m.content === 'string' && m.content.trim() !== '')
      .map((m) => ({ role: m.role, content: m.content! }));

    const openai = getOpenAIClient(openaiConfig);
    const model = openaiConfig.chatModel;
    let apiMode = openaiConfig.apiMode;

    // Azure doesn't support Responses API yet - force chat_completions
    const provider = openaiConfig.provider === 'auto'
      ? (openaiConfig.azureApiKey && openaiConfig.azureEndpoint ? 'azure' : 'openai')
      : openaiConfig.provider;

    if (provider === 'azure' && apiMode === 'responses') {
      console.log('[Chat] Azure detected - forcing chat_completions mode (Responses API not supported)');
      apiMode = 'chat_completions';
    }

    if (apiMode === 'responses') {
      return await runResponsesLoop({
        conversationId, persistence, mcp, plan, openai, model, systemPrompt,
        historyMessages, responseTools,
      });
    }

    // Default: Chat Completions loop
    return await runCompletionsLoop({
      conversationId, persistence, mcp, plan, openai, model, systemPrompt,
      historyMessages, tools,
    });
  } finally {
    await mcp.disconnectAll();
  }
}

// ---------- Responses API loop ----------

async function runResponsesLoop(ctx: {
  conversationId: string;
  persistence: ChatDependencies['persistence'];
  mcp: MCPPooledConnectionManager;
  plan: ReturnType<typeof planChat>;
  openai: ReturnType<typeof getOpenAIClient>;
  model: string;
  systemPrompt: string;
  historyMessages: Array<{ role: string; content: string }>;
  responseTools: ReturnType<MCPPooledConnectionManager['getToolsForOpenAIResponses']>;
}): Promise<{ conversationId: string; response: string }> {
  const { conversationId, persistence, mcp, plan, openai, model, systemPrompt, historyMessages, responseTools } = ctx;

  const responsesInput: ResponseInputItem[] = historyMessages.map(
    (m) => ({ type: 'message', role: m.role as 'user' | 'assistant', content: m.content } as ResponseInputItem),
  );

  const requestPayload = {
    model,
    instructions: systemPrompt,
    input: responsesInput,
    tools: responseTools.length > 0 ? responseTools : undefined,
    tool_choice: 'auto',
    max_output_tokens: 8000,
  };

  console.log('[Chat] Responses API request:', {
    model,
    toolCount: responseTools.length,
    inputCount: responsesInput.length,
    systemPromptLength: systemPrompt.length,
  });

  let response = await openai.responses.create(requestPayload);

  let iterations = 0;
  const maxIterations = 10;

  while (true) {
    const toolCalls = extractResponseFunctionToolCalls((response as unknown as { output?: unknown }).output);
    const assistantText = typeof (response as { output_text?: unknown }).output_text === 'string' ? response.output_text : '';

    if (toolCalls.length === 0) {
      const finalText = (assistantText || '').trim() || 'No response generated.';
      // Only persist the final assistant response (not intermediate tool-calling responses).
      await persistence.saveMessage({
        conversation_id: conversationId,
        timestamp: Date.now(),
        role: 'assistant',
        type: 'message',
        content: finalText,
        tool_call_id: null,
        tool_name: null,
        tool_args: null,
        tool_result: null,
        error_message: null,
      });
      return { conversationId, response: finalText };
    }

    if (iterations >= maxIterations) {
      const errText = `Tool loop detected (exceeded ${maxIterations} tool iterations).`;
      await persistence.saveMessage({
        conversation_id: conversationId,
        timestamp: Date.now(),
        role: 'assistant',
        type: 'message',
        content: errText,
        tool_call_id: null,
        tool_name: null,
        tool_args: null,
        tool_result: null,
        error_message: null,
      });
      return { conversationId, response: errText };
    }

    iterations++;

    const toolOutputs: ResponseInputItem[] = [];
    for (const toolCall of toolCalls) {
      const toolName = toolCall.name;
      const result = await executeToolCall({
        conversationId, persistence, mcp, plan,
        toolCallId: toolCall.call_id, toolName, rawArgs: toolCall.arguments,
      });
      toolOutputs.push({
        type: 'function_call_output',
        call_id: toolCall.call_id,
        output: result,
      } as ResponseInputItem);
    }

    const continuePayload = {
      model,
      instructions: systemPrompt,
      previous_response_id: response.id,
      input: toolOutputs,
      tools: responseTools.length > 0 ? responseTools : undefined,
      tool_choice: 'auto',
      max_output_tokens: 8000,
    };

    console.log('[Chat] Responses API continue request (iteration', iterations, '):', {
      previousResponseId: response.id,
      toolOutputsCount: toolOutputs.length,
    });

    response = await openai.responses.create(continuePayload);
  }
}

// ---------- Chat Completions loop ----------

async function runCompletionsLoop(ctx: {
  conversationId: string;
  persistence: ChatDependencies['persistence'];
  mcp: MCPPooledConnectionManager;
  plan: ReturnType<typeof planChat>;
  openai: ReturnType<typeof getOpenAIClient>;
  model: string;
  systemPrompt: string;
  historyMessages: Array<{ role: string; content: string }>;
  tools: ReturnType<MCPPooledConnectionManager['getToolsForOpenAI']>;
}): Promise<{ conversationId: string; response: string }> {
  const { conversationId, persistence, mcp, plan, openai, model, systemPrompt, historyMessages, tools } = ctx;

  const DEFAULT_MAX_COMPLETION_TOKENS = 8192;
  const RETRY_MAX_COMPLETION_TOKENS = 2048;

  const openaiMessages: ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...historyMessages.map((m) => ({ role: m.role, content: m.content } as ChatCompletionMessageParam)),
  ];

  const requestPayload = {
    model,
    messages: openaiMessages,
    tools: tools.length > 0 ? tools : undefined,
    tool_choice: 'auto' as const,
    max_completion_tokens: DEFAULT_MAX_COMPLETION_TOKENS,
  };

  console.log('[Chat] Chat Completions request:', {
    model,
    toolCount: tools.length,
    messageCount: openaiMessages.length,
    systemPromptLength: systemPrompt.length,
  });

  debugDumpPayload('initial-request', requestPayload);

  let response: Awaited<ReturnType<typeof openai.chat.completions.create>>;
  try {
    response = await openai.chat.completions.create(requestPayload);
  } catch (err) {
    debugLogApiError('initial-request', err, requestPayload);
    throw err;
  }

  console.log('[Chat] Initial response:', {
    finishReason: response.choices[0]?.finish_reason,
    hasContent: !!response.choices[0]?.message?.content,
    contentLength: response.choices[0]?.message?.content?.length ?? 0,
    toolCallCount: response.choices[0]?.message?.tool_calls?.length ?? 0,
  });

  let iterations = 0;
  const maxIterations = 10;

  while (response.choices[0]?.finish_reason === 'tool_calls' && iterations < maxIterations) {
    iterations++;

    const assistantMessage = response.choices[0]?.message;
    // Note: Do NOT persist intermediate assistant messages during tool loops.
    // They have empty content and break history reconstruction on the next turn
    // (consecutive assistant messages without tool calls → "invalid content" from Azure).
    // Tool calls themselves are persisted separately via executeToolCall().

    openaiMessages.push({
      role: 'assistant',
      content: assistantMessage?.content ?? '',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tool_calls: (assistantMessage?.tool_calls as any) ?? undefined,
    } as ChatCompletionMessageParam);

    const toolCalls = assistantMessage?.tool_calls ?? [];
    for (const toolCall of toolCalls) {
      if (toolCall.type !== 'function') continue;

      const result = await executeToolCall({
        conversationId, persistence, mcp, plan,
        toolCallId: toolCall.id, toolName: toolCall.function.name, rawArgs: toolCall.function.arguments,
      });
      openaiMessages.push({ role: 'tool', tool_call_id: toolCall.id, content: result });
    }

    const continuePayload = {
      model,
      messages: openaiMessages,
      tools: tools.length > 0 ? tools : undefined,
      tool_choice: 'auto' as const,
      max_completion_tokens: DEFAULT_MAX_COMPLETION_TOKENS,
    };

    // Log full message structure for debugging
    console.log('[Chat] Chat Completions continue request (iteration', iterations, '):');
    for (let i = 0; i < openaiMessages.length; i++) {
      const msg = openaiMessages[i]!;
      const info: Record<string, unknown> = { role: msg.role };
      if ('content' in msg && msg.content) info.contentLength = typeof msg.content === 'string' ? msg.content.length : JSON.stringify(msg.content).length;
      if ('tool_calls' in msg && msg.tool_calls) {
        info.toolCallCount = msg.tool_calls.length;
        // Log the actual tool call details
        for (const tc of msg.tool_calls) {
          if (tc.type === 'function') {
            console.log(`    tool_call: id=${tc.id} fn=${tc.function.name} argsLen=${tc.function.arguments.length}`);
          }
        }
      }
      if ('tool_call_id' in msg) info.tool_call_id = (msg as { tool_call_id?: string }).tool_call_id;
      console.log(`  [${i}]`, info);
    }

    const dumpPath = debugDumpPayload(`continue-iter${iterations}`, continuePayload);

    try {
      response = await openai.chat.completions.create(continuePayload);
      console.log('[Chat] Continue response (iteration', iterations, '):', {
        finishReason: response.choices[0]?.finish_reason,
        hasContent: !!response.choices[0]?.message?.content,
        contentLength: response.choices[0]?.message?.content?.length ?? 0,
        toolCallCount: response.choices[0]?.message?.tool_calls?.length ?? 0,
      });
    } catch (apiErr) {
      debugLogApiError(`continue-iter${iterations}`, apiErr, continuePayload);

      // Check if this is "model produced invalid content" (likely content filter)
      const isModelError = (apiErr as { type?: string }).type === 'model_error'
        || (apiErr as { error?: { type?: string } }).error?.type === 'model_error';

      if (isModelError) {
        console.log('[Chat] Model error detected — likely Azure content filter. Retrying with plain-text instruction...');

        // Retry: append a system message asking for plain text only
        const retryMessages: ChatCompletionMessageParam[] = [
          ...openaiMessages,
          { role: 'system', content: 'IMPORTANT: Your previous response was rejected by Azure filters. Do NOT call any tools. Respond using only plain ASCII Markdown (letters, numbers, basic punctuation). No Unicode, no box-drawing characters, no special symbols. If you need a diagram, use dashes and pipes like: | VM | -- network --> | Host |' },
        ];

        const retryPayload = {
          model,
          messages: retryMessages,
          // On Azure, model_error frequently comes from malformed tool-call JSON or filtered content.
          // Disabling tools forces a plain-text answer and avoids repeated failures.
          tools: undefined,
          tool_choice: 'none' as const,
          max_completion_tokens: RETRY_MAX_COMPLETION_TOKENS,
        };

        debugDumpPayload(`retry-iter${iterations}`, retryPayload);

        try {
          response = await openai.chat.completions.create(retryPayload);
          console.log('[Chat] Retry succeeded:', {
            finishReason: response.choices[0]?.finish_reason,
            contentLength: response.choices[0]?.message?.content?.length ?? 0,
          });
        } catch (retryErr) {
          debugLogApiError(`retry-iter${iterations}`, retryErr, retryPayload);
          // Surface the original error — payload is dumped for inspection
          console.error(`[Chat] Retry also failed. See debug payloads at ${dumpPath}`);
          throw apiErr;
        }
      } else {
        throw apiErr;
      }
    }
  }

  if (response.choices[0]?.finish_reason === 'tool_calls' && iterations >= maxIterations) {
    const errText = `Tool loop detected (exceeded ${maxIterations} tool iterations).`;
    await persistence.saveMessage({
      conversation_id: conversationId,
      timestamp: Date.now(),
      role: 'assistant',
      type: 'message',
      content: errText,
      tool_call_id: null,
      tool_name: null,
      tool_args: null,
      tool_result: null,
      error_message: null,
    });
    return { conversationId, response: errText };
  }

  const finalText = response.choices[0]?.message?.content || 'No response generated.';
  await persistence.saveMessage({
    conversation_id: conversationId,
    timestamp: Date.now(),
    role: 'assistant',
    type: 'message',
    content: finalText,
    tool_call_id: null,
    tool_name: null,
    tool_args: null,
    tool_result: null,
    error_message: null,
  });

  return { conversationId, response: finalText };
}

// ---------- Shared tool execution ----------

async function executeToolCall(ctx: {
  conversationId: string;
  persistence: ChatDependencies['persistence'];
  mcp: MCPPooledConnectionManager;
  plan: ReturnType<typeof planChat>;
  toolCallId: string;
  toolName: string;
  rawArgs: string;
}): Promise<string> {
  const { conversationId, persistence, mcp, plan, toolCallId, toolName, rawArgs } = ctx;

  let toolArgs: Record<string, unknown> = {};
  try {
    toolArgs = JSON.parse(rawArgs || '{}') as Record<string, unknown>;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const toolPayload = { error: `Invalid tool arguments JSON: ${msg}` };

    await persistence.saveMessage({
      conversation_id: conversationId, timestamp: Date.now(),
      role: 'assistant', type: 'tool_call', content: null,
      tool_call_id: toolCallId, tool_name: toolName, tool_args: rawArgs,
      tool_result: null, error_message: null,
    });
    await persistence.saveMessage({
      conversation_id: conversationId, timestamp: Date.now(),
      role: 'tool', type: 'tool_result', content: null,
      tool_call_id: toolCallId, tool_name: toolName, tool_args: null,
      tool_result: safeJsonStringify(toolPayload), error_message: toolPayload.error,
    });

    return safeJsonStringify(toolPayload);
  }

  if (!isChatToolEnabled({ toolName, enabledToolNames: plan.enabledToolNames })) {
    const toolPayload = { error: `Tool '${toolName}' is not enabled for the current selection.` };

    await persistence.saveMessage({
      conversation_id: conversationId, timestamp: Date.now(),
      role: 'assistant', type: 'tool_call', content: null,
      tool_call_id: toolCallId, tool_name: toolName, tool_args: safeJsonStringify(toolArgs),
      tool_result: null, error_message: null,
    });
    await persistence.saveMessage({
      conversation_id: conversationId, timestamp: Date.now(),
      role: 'tool', type: 'tool_result', content: null,
      tool_call_id: toolCallId, tool_name: toolName, tool_args: null,
      tool_result: safeJsonStringify(toolPayload), error_message: toolPayload.error,
    });

    return safeJsonStringify(toolPayload);
  }

  // Persist tool call
  await persistence.saveMessage({
    conversation_id: conversationId, timestamp: Date.now(),
    role: 'assistant', type: 'tool_call', content: null,
    tool_call_id: toolCallId, tool_name: toolName, tool_args: safeJsonStringify(toolArgs),
    tool_result: null, error_message: null,
  });

  // Invoke tool via MCP
  const result = await mcp.invokeTool({ toolName, arguments: toolArgs });

  // Extract text content from MCP CallToolResult.
  // MCP returns { content: [{ type: 'text', text: '...' }] } — we need just the text for OpenAI.
  let toolResultText: string;
  if (result.success) {
    const mcpResult = result.data as { content?: Array<{ type: string; text?: string }> } | undefined;
    const textParts = (mcpResult?.content ?? [])
      .filter((c) => c.type === 'text' && typeof c.text === 'string')
      .map((c) => c.text!);
    toolResultText = textParts.length > 0 ? textParts.join('\n') : safeJsonStringify(result.data);
  } else {
    toolResultText = safeJsonStringify({ error: result.error });
  }

  // Truncate very large tool results to avoid "model produced invalid content" errors.
  // Azure OpenAI has limits on individual message sizes within the conversation.
  const MAX_TOOL_RESULT_CHARS = 30000;
  const originalToolResultLen = toolResultText.length;
  if (originalToolResultLen > MAX_TOOL_RESULT_CHARS) {
    toolResultText =
      toolResultText.slice(0, MAX_TOOL_RESULT_CHARS)
      + `\n\n/* ...truncated (was ${originalToolResultLen} chars) */`;
  }

  console.log('[Chat] Tool result:', {
    toolName,
    success: result.success,
    resultLength: toolResultText.length,
    preview: toolResultText.slice(0, 300),
  });

  await persistence.saveMessage({
    conversation_id: conversationId, timestamp: Date.now(),
    role: 'tool', type: 'tool_result', content: null,
    tool_call_id: toolCallId, tool_name: toolName, tool_args: null,
    tool_result: toolResultText, error_message: result.success ? null : result.error || 'Tool error',
  });

  return toolResultText;
}
