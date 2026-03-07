/**
 * Svelte 5 chat context — state management + polling for tool activity.
 *
 * Ported from my-ai-client's chat-context with simplifications:
 * - No sidebar/conversation list
 * - No tool selection UI (all tools enabled by default)
 * - Single conversation per report view
 */

import { getContext, setContext } from 'svelte';
import { browser } from '$app/environment';

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
const STORAGE_VERSION = 1;
const MAX_STORED_MESSAGES = 200;
const HISTORY_LIMIT = 8;
const TOOL_CALL_TIMEOUT_MS = 2 * 60 * 1000;

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

type StoredChat = {
  version: number;
  conversationId: string;
  messages: Array<{ id?: string; role: ChatMessage['role']; content: string; timestamp: number }>;
};

function storageKey(reportId: string): string {
  return `prv:web:chat:${reportId}`;
}

function safeParseStoredChat(raw: string | null): StoredChat | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredChat;
    if (!parsed || typeof parsed !== 'object') return null;
    if (parsed.version !== STORAGE_VERSION) return null;
    if (typeof parsed.conversationId !== 'string' || !parsed.conversationId) return null;
    if (!Array.isArray(parsed.messages)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function createWelcomeMessage(): ChatMessage {
  const timestamp = Date.now();
  const content = 'Ask a question about this report. The AI will analyze report data to answer.';
  return {
    id: messageId('system', timestamp, content),
    role: 'system',
    content,
    timestamp: new Date(timestamp),
  };
}

function normalizeForStorage(messages: ChatMessage[]): StoredChat['messages'] {
  // Keep the earliest system message if present, then cap to MAX_STORED_MESSAGES.
  const system = messages.find((m) => m.role === 'system');
  const rest = messages.filter((m) => m.role !== 'system');
  const cappedRest = rest.slice(-MAX_STORED_MESSAGES);
  const final = system ? [system, ...cappedRest] : cappedRest;

  return final.map((m) => ({
    id: m.id,
    role: m.role,
    content: m.content,
    timestamp: m.timestamp.getTime(),
  }));
}

function synthesizeTimedOutToolCalls(entries: ToolCallEntry[]): ToolCallEntry[] {
  const now = Date.now();
  return entries.map((tc) => {
    if (tc.tool_result) return tc;
    if (now - tc.tool_call.timestamp <= TOOL_CALL_TIMEOUT_MS) return tc;
    return {
      ...tc,
      tool_result: {
        error_message: 'Tool call timed out',
        timestamp: now,
        tool_result: null,
        content: null,
      },
    };
  });
}

/**
 * Create a chat context for a given report.
 */
export function createChatContext(reportId: string): ChatContext {
  const key = storageKey(reportId);

  let persisted: StoredChat | null = null;
  if (browser) {
    persisted = safeParseStoredChat(localStorage.getItem(key));
  }

  let conversationId = $state<string>(persisted?.conversationId ?? crypto.randomUUID());
  const initialMessages = (() => {
    if (!browser) return [createWelcomeMessage()];

    if (persisted?.messages?.length) {
      const restored: ChatMessage[] = [];
      for (const m of persisted.messages) {
        if (!m || typeof m !== 'object') continue;
        if (!['user', 'assistant', 'system'].includes(m.role)) continue;
        if (typeof m.content !== 'string') continue;
        if (typeof m.timestamp !== 'number') continue;
        const id =
          typeof m.id === 'string' && m.id ? m.id : messageId(m.role, m.timestamp, m.content);
        restored.push({
          id,
          role: m.role,
          content: m.content,
          timestamp: new Date(m.timestamp),
        });
      }
      if (restored.length > 0) return restored;
    }

    return [createWelcomeMessage()];
  })();

  let state = $state<ChatState>({
    status: 'idle',
    messages: initialMessages,
    toolCalls: [],
    error: undefined,
  });
  let pollingInterval: ReturnType<typeof setInterval> | null = null;
  let lastActivityTimestamp = 0;
  let persistTimer: ReturnType<typeof setTimeout> | null = null;

  function schedulePersist() {
    if (!browser) return;
    if (persistTimer) clearTimeout(persistTimer);
    persistTimer = setTimeout(() => {
      try {
        const stored: StoredChat = {
          version: STORAGE_VERSION,
          conversationId,
          messages: normalizeForStorage(state.messages),
        };
        localStorage.setItem(key, JSON.stringify(stored));
      } catch {
        // Ignore storage errors (quota/blocked)
      }
    }, 250);
  }

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
        const merged = Array.from(existing.values());
        state = { ...state, toolCalls: synthesizeTimedOutToolCalls(merged) };
        const maxTs = Math.max(...merged.map((t) => t.tool_call.timestamp));
        if (Number.isFinite(maxTs)) lastActivityTimestamp = Math.max(lastActivityTimestamp, maxTs);
        return;
      }

      // Even if no new tool calls arrived, mark any stuck ones as timed out.
      const withTimeouts = synthesizeTimedOutToolCalls(state.toolCalls);
      const didChange = withTimeouts.some((tc, i) => tc.tool_result !== state.toolCalls[i]?.tool_result);
      if (didChange) {
        state = { ...state, toolCalls: withTimeouts };
      }
    } catch {
      // Ignore polling errors
    }
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const history = state.messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .slice(-HISTORY_LIMIT)
      .map((m) => ({ role: m.role, content: m.content }));

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
    schedulePersist();

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
          history,
        }),
      });

      stopPolling();

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Request failed' }));
        const errMsg = (errData as { error?: string }).error || 'Request failed';
        state = { ...state, status: 'error', error: errMsg };
        schedulePersist();
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
      schedulePersist();
    } catch (err) {
      stopPolling();
      const errMsg = err instanceof Error ? err.message : String(err);
      state = { ...state, status: 'error', error: errMsg };
      schedulePersist();
    }
  }

  function clearConversation() {
    stopPolling();
    conversationId = crypto.randomUUID();
    state = { status: 'idle', messages: [createWelcomeMessage()], toolCalls: [] };
    lastActivityTimestamp = 0;
    schedulePersist();
  }

  return {
    get conversationId() { return conversationId; },
    reportId,
    get state() { return state; },
    sendMessage,
    clearConversation,
  };
}
