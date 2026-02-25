# @prv/ai-chat

Reusable AI chat engine with MCP tool-calling support. Framework-agnostic server-side library — bring your own UI and persistence.

## Features

- **OpenAI & Azure OpenAI** — supports both Chat Completions and Responses API modes
- **MCP client** — connects to MCP servers via stdio or HTTP (Streamable HTTP) transport
- **Agentic tool-calling loop** — up to 10 iterations of LLM → tool call → result → LLM
- **Tool catalog & selection** — namespace-based tool registry with per-conversation enable/disable
- **Pluggable persistence** — `ChatPersistence` interface with in-memory implementation included

## Usage

```typescript
import {
  runChat,
  InMemoryChatPersistence,
  type ChatDependencies,
  type McpCatalog,
  type OpenAIConfig,
} from '@prv/ai-chat';

const deps: ChatDependencies = {
  persistence: new InMemoryChatPersistence(),
  catalog: {
    version: 1,
    servers: [{
      id: 'my-server',
      label: 'My MCP Server',
      namespace: 'myns',
      mode: 'server',
      transport: 'http',
      url: 'http://localhost:3000/mcp',
      defaultEnabled: true,
      tools: [],
    }],
  },
  openaiConfig: {
    provider: 'openai',
    apiMode: 'responses',
    chatModel: 'gpt-4o-mini',
    openaiApiKey: process.env.OPENAI_API_KEY,
  },
};

const result = await runChat(deps, {
  message: 'What does this report show?',
  conversationId: 'conv-123', // optional — auto-generated if omitted
});

console.log(result.response);       // assistant's final text
console.log(result.conversationId); // for continuing the conversation
```

## Architecture

```
runChat(deps, params)
  ├─ planChat()         — resolve enabled tools from catalog + selection
  ├─ buildChatSystemPrompt() — system prompt with tool descriptions
  ├─ MCPPooledConnectionManager
  │   ├─ connectHttp()  — StreamableHTTPClientTransport
  │   └─ connectStdio() — StdioClientTransport
  ├─ getOpenAIClient()  — cached OpenAI/Azure client
  └─ agentic loop (max 10 iterations)
      ├─ OpenAI call (Responses or Chat Completions)
      ├─ extract tool calls
      ├─ invokeTool() via MCP
      ├─ persist tool_call + tool_result rows
      └─ feed results back → next iteration
```

## Configuration

### OpenAIConfig

| Field | Type | Default | Description |
|---|---|---|---|
| `provider` | `'auto' \| 'openai' \| 'azure'` | `'auto'` | `auto` uses Azure if Azure key is set, else OpenAI |
| `apiMode` | `'responses' \| 'chat_completions'` | `'responses'` | OpenAI API mode |
| `chatModel` | `string` | — | Model name or Azure deployment |
| `openaiApiKey` | `string?` | — | OpenAI API key |
| `openaiBaseUrl` | `string?` | — | Override for proxies |
| `azureApiKey` | `string?` | — | Azure OpenAI API key |
| `azureEndpoint` | `string?` | — | Azure resource endpoint |
| `azureApiVersion` | `string?` | — | Azure API version |

### MCP Catalog

The `McpCatalog` defines which MCP servers to connect to and which tools are available. Tools are namespaced (`namespace.toolName`) to prevent collisions across servers.

### Persistence

The `ChatPersistence` interface allows swapping storage backends:

```typescript
interface ChatPersistence {
  saveMessage(msg: Omit<ChatMessageRow, 'id'>): Promise<void>;
  getConversationMessages(conversationId: string, limit?: number): Promise<ChatMessageRow[]>;
  getToolCallsWithResults(conversationId: string, opts?: { since?: number }): Promise<ToolCallEntry[]>;
  listConversations(): Promise<{ conversation_id: string; updated_at: number }[]>;
  deleteConversation(conversationId: string): Promise<void>;
}
```

`InMemoryChatPersistence` is included for development/prototyping (conversations lost on restart).

## Azure OpenAI Caveats

**Responses API not supported:** Azure OpenAI does not support the Responses API endpoint path (`/openai/v1`). If you set `apiMode: 'responses'` with an Azure provider, the system will:
1. Log a warning: `[OpenAI Client] WARNING: Responses API not well-supported on Azure yet`
2. Auto-force `chat_completions` mode in `runChat()` (see `chat.ts`)

**Recommendation:** Set `apiMode: 'chat_completions'` explicitly when using Azure to avoid the warning.

**AzureOpenAI constructor:** Uses `{ endpoint, deployment, apiVersion, apiKey }` — not a custom `baseURL`. The `deployment` defaults to `chatModel` if `azureDeployment` is not set.

**OpenAI package version:** Uses the `openai` npm package (v6+) with its built-in `AzureOpenAI` class — not the separate `@azure/openai` package.

## MCP Tool Result Pipeline

Understanding how tool results flow from MCP to OpenAI is critical for debugging:

```
1. AI model requests tool call
   → { name: 'report.execute_report_code', arguments: '{"reportId":"...","code":"..."}' }

2. invokeTool() calls MCP client.callTool()
   → MCP returns CallToolResult: { content: [{ type: 'text', text: '{"result":...,"logs":[]}' }] }

3. executeToolCall() extracts text from MCP wrapper
   → textParts = mcpResult.content.filter(c => c.type === 'text').map(c => c.text)
   → toolResultText = textParts.join('\n')

4. Truncation applied (MAX_TOOL_RESULT_CHARS = 30,000)
   → If toolResultText.length > 30000, it's sliced with a truncation notice

5. Plain text string sent back to OpenAI as tool result
   → Chat Completions: { role: 'tool', tool_call_id: '...', content: toolResultText }
   → Responses API: { type: 'function_call_output', call_id: '...', output: toolResultText }
```

**Key rule:** OpenAI expects tool results to be **plain text strings**. If you accidentally send the raw MCP wrapper object `{ content: [{ type: 'text', text }] }` as the tool result, OpenAI will respond with `"The model produced invalid content"` (500 error).

## SvelteKit Integration Notes

When using this package inside SvelteKit server routes:

- **Environment variables:** SvelteKit does NOT populate `process.env` from `.env` files. Use `import { env } from '$env/dynamic/private'` and pass values via `OpenAIConfig` / `ChatDependencies`.
- **MCP credentials:** The shared MCP tool handler (`executeReportCode.ts`) accepts an optional `credentials` parameter. SvelteKit routes must inject credentials from `$env/dynamic/private`; the handler falls back to `process.env` for non-SvelteKit contexts (stdio MCP server).
- **Vite SSR config:** Add `'@prv/ai-chat'` to `vite.config.ts` → `ssr.noExternal` so Vite transforms the package for SSR instead of letting Node import `.ts` directly.

## Troubleshooting

### "The model produced invalid content" (500 from OpenAI/Azure)

1. **Check tool result extraction:** Ensure `executeToolCall()` in `chat.ts` extracts `.content[].text` from the MCP `CallToolResult` wrapper (not passing the raw wrapper to OpenAI).
2. **Check tool result size:** Azure has per-message size limits. Results over ~50KB cause this error. The `MAX_TOOL_RESULT_CHARS` (30,000) truncation should prevent this.
3. **Check server logs:** Look for `[Chat] Tool result:` logs which show `resultLength` and a preview.

### "Tool not found: \<toolName\>"

The tool name must match either the namespaced name (`namespace.toolName`) or the original name (`toolName`). Check that the MCP server connected successfully and tools were listed — look for `[Chat] Chat Completions request: { toolCount: N }` in logs.

### Azure: "API version not supported"

The Responses API path is not supported on Azure. See "Azure OpenAI Caveats" above. The auto-detection should handle this, but if you see the error, set `apiMode: 'chat_completions'` explicitly.

## Debug Logging

The package emits `console.log` messages with these prefixes:

| Prefix | Location | Information |
|---|---|---|
| `[OpenAI Client]` | `openai-client.ts` | Config received, provider resolution, client creation params, cache hits |
| `[Chat]` | `chat.ts` | Request payloads (model, tool/message counts), per-iteration message structure, tool results |
| `[Chat] Azure detected` | `chat.ts` | When Azure auto-forces chat_completions mode |
| `[Chat] Tool result:` | `chat.ts` | Tool name, success/failure, result length, first 300 chars preview |
| `[Chat] Chat Completions continue request` | `chat.ts` | Full message-by-message breakdown (role, content length, tool call IDs) |

## Exports

- **MCP client:** `MCPPooledConnectionManager`, `MCPServerRegistry`, MCP types
- **Catalog:** `McpCatalog`, `McpServerConfigUser`, selection utilities
- **Provider:** `OpenAIConfig`, `getOpenAIClient()`
- **Persistence:** `ChatPersistence`, `ChatMessageRow`, `ToolCallEntry`, `InMemoryChatPersistence`
- **Chat:** `runChat()`, `ChatDependencies`, `planChat()`, `buildChatSystemPrompt()`
- **Types:** `ChatMessage` (for UI layer)
