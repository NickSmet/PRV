import type { ChatMessageRow, NewChatMessageRow, ToolCallEntry, ChatPersistence } from './types.js';

export class InMemoryChatPersistence implements ChatPersistence {
  private messages = new Map<string, ChatMessageRow[]>();
  private nextId = 1;

  async saveMessage(msg: NewChatMessageRow): Promise<void> {
    const row: ChatMessageRow = { ...msg, id: this.nextId++ };
    const list = this.messages.get(msg.conversation_id) ?? [];
    list.push(row);
    this.messages.set(msg.conversation_id, list);
  }

  async getConversationMessages(conversationId: string, limit = 50): Promise<ChatMessageRow[]> {
    const all = this.messages.get(conversationId) ?? [];
    const filtered = all.filter((m) => m.type === 'message' && typeof m.content === 'string');
    return filtered.slice(-limit);
  }

  async getToolCallsWithResults(conversationId: string, opts?: { since?: number }): Promise<ToolCallEntry[]> {
    const all = this.messages.get(conversationId) ?? [];
    const since = opts?.since ?? 0;

    // Find tool_call entries after the timestamp
    const toolCallRows = all.filter((m) => m.type === 'tool_call' && m.timestamp >= since);

    return toolCallRows.map((tc) => {
      // Find matching tool_result
      const result = all.find(
        (m) => m.type === 'tool_result' && m.tool_call_id === tc.tool_call_id,
      );

      const entry: ToolCallEntry = {
        tool_call: {
          tool_call_id: tc.tool_call_id!,
          tool_name: tc.tool_name!,
          tool_args: tc.tool_args ?? '{}',
          timestamp: tc.timestamp,
        },
      };

      if (result) {
        entry.tool_result = {
          error_message: result.error_message ?? undefined,
          timestamp: result.timestamp,
          tool_result: result.tool_result,
          content: result.content,
        };
      }

      return entry;
    });
  }

  async listConversations(): Promise<Array<{ conversation_id: string; updated_at: number }>> {
    const result: Array<{ conversation_id: string; updated_at: number }> = [];
    for (const [id, msgs] of this.messages) {
      if (msgs.length === 0) continue;
      const lastTimestamp = msgs[msgs.length - 1]!.timestamp;
      result.push({ conversation_id: id, updated_at: lastTimestamp });
    }
    return result.sort((a, b) => b.updated_at - a.updated_at);
  }

  async deleteConversation(conversationId: string): Promise<void> {
    this.messages.delete(conversationId);
  }
}
