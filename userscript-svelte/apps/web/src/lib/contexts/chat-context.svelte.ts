/**
 * Svelte 5 chat context — state management + polling for tool activity.
 *
 * Ported from my-ai-client's chat-context with simplifications:
 * - No sidebar/conversation list
 * - No tool selection UI (all tools enabled by default)
 * - Single conversation per report view
 */

import { getContext, setContext } from 'svelte';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
};

export type ToolCallEntry = {
  tool_call: {
    tool_call_id: string;
    tool_name: string;
    tool_args: string;
    timestamp: number;
  };
  tool_result?: {
    error_message?: string;
    timestamp: number;
    tool_result?: string | null;
    content?: string | null;
  };
};

export type ChatState = {
  status: 'idle' | 'loading' | 'error';
  messages: ChatMessage[];
  toolCalls: ToolCallEntry[];
  error?: string;
};

export type ChatContext = {
  conversationId: string;
  reportId: string;
  state: ChatState;
  sendMessage: (text: string) => Promise<void>;
  clearConversation: () => void;
};

const CHAT_CONTEXT_KEY = Symbol('chat-context');

export function setChatContext(ctx: ChatContext) {
  setContext(CHAT_CONTEXT_KEY, ctx);
}

export function getChatContext(): ChatContext {
  return getContext(CHAT_CONTEXT_KEY);
}

/**
 * Generate a stable message ID for deduplication.
 */
function messageId(role: string, timestamp: number, content: string): string {
  const rounded = Math.floor(timestamp / 1000);
  const hash = content.slice(0, 50).replace(/\s/g, '');
  return `${role}-${rounded}-${hash}`;
}

/**
 * Create a chat context for a given report.
 */
export function createChatContext(reportId: string): ChatContext {
  let conversationId = $state(crypto.randomUUID());
  let state = $state<ChatState>({
    status: 'idle',
    messages: [],
    toolCalls: [],
  });
  let pollingInterval: ReturnType<typeof setInterval> | null = null;
  let lastActivityTimestamp = 0;

  function startPolling() {
    if (pollingInterval) return;
    pollToolCalls();
    pollingInterval = setInterval(pollToolCalls, 1500);
  }

  function stopPolling() {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  }

  async function pollToolCalls() {
    try {
      const res = await fetch(
        `/api/chat/activity?conversationId=${encodeURIComponent(conversationId)}&since=${lastActivityTimestamp}`,
      );
      if (!res.ok) return;

      const data = (await res.json()) as { toolCalls: ToolCallEntry[] };
      if (data.toolCalls?.length > 0) {
        // Merge tool calls by tool_call_id
        const existing = new Map(
          state.toolCalls.map((tc) => [tc.tool_call.tool_call_id, tc]),
        );
        for (const newTc of data.toolCalls) {
          existing.set(newTc.tool_call.tool_call_id, newTc);
        }
        state = { ...state, toolCalls: Array.from(existing.values()) };
      }
    } catch {
      // Ignore polling errors
    }
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    // Optimistically add user message
    const userTimestamp = Date.now();
    const userMsg: ChatMessage = {
      id: messageId('user', userTimestamp, trimmed),
      role: 'user',
      content: trimmed,
      timestamp: new Date(userTimestamp),
    };
    state = {
      ...state,
      status: 'loading',
      messages: [...state.messages, userMsg],
      error: undefined,
    };

    lastActivityTimestamp = userTimestamp;
    startPolling();

    try {
      const res = await fetch('/api/chat/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          message: trimmed,
          reportId,
        }),
      });

      stopPolling();

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Request failed' }));
        const errMsg = (errData as { error?: string }).error || 'Request failed';
        state = { ...state, status: 'error', error: errMsg };
        return;
      }

      const data = (await res.json()) as {
        conversationId: string;
        response: string;
        error?: string;
      };

      if (data.conversationId) {
        conversationId = data.conversationId;
      }

      // Add assistant message
      const assistantTimestamp = Date.now();
      const assistantMsg: ChatMessage = {
        id: messageId('assistant', assistantTimestamp, data.response || ''),
        role: 'assistant',
        content: data.response || 'No response.',
        timestamp: new Date(assistantTimestamp),
      };

      // Final poll to catch any remaining tool calls
      await pollToolCalls();

      state = {
        ...state,
        status: 'idle',
        messages: [...state.messages, assistantMsg],
      };
    } catch (err) {
      stopPolling();
      const errMsg = err instanceof Error ? err.message : String(err);
      state = { ...state, status: 'error', error: errMsg };
    }
  }

  function clearConversation() {
    stopPolling();
    conversationId = crypto.randomUUID();
    state = { status: 'idle', messages: [], toolCalls: [] };
    lastActivityTimestamp = 0;
  }

  return {
    get conversationId() { return conversationId; },
    reportId,
    get state() { return state; },
    sendMessage,
    clearConversation,
  };
}
