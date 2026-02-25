// MCP client
export type {
  MCPServerConfig,
  MCPTool,
  MCPToolWithNamespace,
  MCPToolInvocation,
  MCPToolResult,
  MCPConnectionStatus,
  MCPServerConnection,
  MCPTransportType,
} from './mcp/types.js';
export { MCPServerRegistry } from './mcp/types.js';
export { MCPPooledConnectionManager } from './mcp/connection-manager.js';

// Catalog & selection
export type {
  McpCatalog,
  McpServerConfigUser,
  McpToolConfig,
  McpServerMode,
} from './catalog/types.js';
export { getServerById, getExposedAvailableTools } from './catalog/types.js';
export type {
  ConversationToolSelection,
  EnabledToolInfo,
} from './catalog/selection.js';
export {
  defaultSelectionFromCatalog,
  sanitizeSelection,
  getEnabledToolsByServer,
} from './catalog/selection.js';

// OpenAI provider
export type { OpenAIConfig } from './providers/openai-client.js';
export { getOpenAIClient } from './providers/openai-client.js';

// Persistence
export type { ChatMessageRow, ChatPersistence, ToolCallEntry } from './persistence/types.js';
export { InMemoryChatPersistence } from './persistence/in-memory.js';

// Chat
export type { ChatDependencies, ChatPlan } from './chat/agent-config.js';
export { planChat, isChatToolEnabled, buildChatSystemPrompt } from './chat/agent-config.js';
export { runChat } from './chat/chat.js';

// Shared types
export type { ChatMessage } from './types.js';

// Utilities
export { safeJsonStringify } from './utils.js';
