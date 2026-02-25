export interface ChatMessageRow {
  id: number;
  conversation_id: string;
  timestamp: number;
  role: 'user' | 'assistant' | 'system' | 'tool';
  type: 'message' | 'tool_call' | 'tool_result';
  content: string | null;
  tool_call_id: string | null;
  tool_name: string | null;
  tool_args: string | null;
  tool_result: string | null;
  error_message: string | null;
}

export type NewChatMessageRow = Omit<ChatMessageRow, 'id'>;

export interface ToolCallEntry {
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
}

export interface ChatPersistence {
  saveMessage(msg: NewChatMessageRow): Promise<void>;
  getConversationMessages(conversationId: string, limit?: number): Promise<ChatMessageRow[]>;
  getToolCallsWithResults(conversationId: string, opts?: { since?: number }): Promise<ToolCallEntry[]>;
  listConversations(): Promise<Array<{ conversation_id: string; updated_at: number }>>;
  deleteConversation(conversationId: string): Promise<void>;
}
