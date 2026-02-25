# `/mcp` (Embedded MCP Server) — HTTP Transport

## Goal

Expose the Parallels Desktop report analysis MCP server as a **first-class SvelteKit route** at `/mcp`, serving the `execute_report_code` tool over **MCP Streamable HTTP** without running a separate MCP process.

## Implementation

- Route: `apps/web/src/routes/mcp/+server.ts`
- Tool handler: `servers/mcp/src/executeReportCode.ts` (shared with stdio MCP server)
- Transport: `WebStandardStreamableHTTPServerTransport` (Web Fetch API — perfect for SvelteKit)

## Why this works in SvelteKit

SvelteKit route handlers receive a **Web Fetch `Request`** and return a **Web Fetch `Response`** — not Node `IncomingMessage/ServerResponse`.

So this route uses:
- `WebStandardStreamableHTTPServerTransport` from `@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js`

…which is the MCP server transport designed specifically for Web-standard request/response objects.

## Route Contract

`/mcp` implements **MCP Streamable HTTP** (JSON-RPC 2.0 requests over HTTP, with streaming responses supported via SSE).

- **Methods**: `GET`, `POST`, `DELETE`
- **Request content-type**: `application/json` (for `POST`)
- **Response content-types**:
  - `application/json` for non-stream responses
  - `text/event-stream` for streaming responses (SSE)

### Message Shape

Requests are **JSON-RPC 2.0** objects:
- `initialize` — handshake
- `tools/list` — list available tools
- `tools/call` — execute a tool

Responses are JSON-RPC result objects (or SSE-framed streaming equivalents).

### Sessions

This route is configured as **stateless**:
- `sessionIdGenerator: undefined`

Callers **do not need** to maintain `Mcp-Session-Id` for correctness.

### Accept Header Normalization

Some clients send `Accept: */*` (or omit SSE). MCP Streamable HTTP expects the client to explicitly accept **both**:
- `application/json`
- `text/event-stream`

This route patches compatibility by normalizing the `Accept` header for `POST` requests.

## Tool Exposed

### `execute_report_code`

**Single code-execution tool** — the AI writes JavaScript defining `main(data, report, ctx)` which runs in a sandbox with the full pre-loaded report data.

See `servers/mcp/SPEC.md` for full tool documentation.

**Input:**
- `reportId: string` — The numeric report ID
- `code: string` — JavaScript code defining `main(data, report, ctx)`
- `timeoutMs?: number` — Execution timeout in ms (default 30000, max 60000)
- `maxOutputChars?: number` — Max characters in returned JSON (default 50000, max 200000)

**Output:**
```json
{
  "result": <return value from main()>,
  "logs": ["console.log captured output", "..."]
}
```

## Testing with Curl

### Initialize
```bash
curl -i -sS -X POST "http://localhost:5173/mcp" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"curl","version":"0"}}}'
```

### List Tools
```bash
curl -sS -X POST "http://localhost:5173/mcp" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'
```

### Call execute_report_code
```bash
curl -sS -X POST "http://localhost:5173/mcp" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc":"2.0",
    "id":3,
    "method":"tools/call",
    "params":{
      "name":"execute_report_code",
      "arguments":{
        "reportId":"512022712",
        "code":"function main(data) { return { vmCount: data.vms.length, os: data.host.hardware?.system?.os }; }"
      }
    }
  }'
```

## Architecture

```
Client (HTTP MCP)
    ↓
GET/POST/DELETE /mcp
    ↓
handleMcpRequest (per-request)
    ↓
    ├─ new McpServer (fresh per request)
    │   └─ registerTool('execute_report_code', executeReportCodeHandler)
    │
    └─ new WebStandardStreamableHTTPServerTransport (fresh per request)
        ↓
        └─ connect + handleRequest
            ↓
            executeReportCodeHandler (module scope, shared)
                ↓
                1. Fetch report index + all nodes from Reportus
                2. Parse nodes → ReportModel
                3. Evaluate rules → markers
                4. Build ReportView (hierarchical, primitives-focused)
                5. Run agent code in sandbox
                6. Return { result, logs }
```

## Code Sharing

The `execute_report_code` handler is **shared** between:
- **stdio MCP server** (`servers/mcp/src/index.ts`) — for CLI/desktop use
- **HTTP MCP server** (`apps/web/src/routes/mcp/+server.ts`) — for web/API use

Both use the same:
- Tool definition: `EXECUTE_REPORT_CODE_DESCRIPTION`
- Tool schema: `EXECUTE_REPORT_CODE_SCHEMA`
- Handler: `handleExecuteReportCode()`
- Sandbox: `executeReportCodeSandbox()`
- Data model: `buildReportView()` from `@prv/report-ai`

## Consumers

### AI Chat (internal)

The web app's AI Chat feature (`/api/chat/*`) uses `@prv/ai-chat` to connect to this `/mcp` route as an MCP client:
- Transport: `StreamableHTTPClientTransport` (HTTP, same-origin `{origin}/mcp`)
- The chat agent loop calls `execute_report_code` to analyze reports on behalf of the user
- See `apps/web/src/lib/server/chat-deps.ts` for the MCP catalog wiring

### External MCP clients

Any MCP-compatible client (Postman, Claude Desktop, custom agents) can connect to `/mcp` using MCP Streamable HTTP — no API key required beyond network access.

## Credential Flow

```
SvelteKit route (+server.ts)
  │
  ├─ import { env } from '$env/dynamic/private'   ← reads apps/web/.env
  │
  ├─ executeReportCodeHandler(args)
  │   └─ credentials: { baseUrl: env.REPORTUS_BASE_URL, basicAuth: env.REPORTUS_BASIC_AUTH }
  │
  └─ handleExecuteReportCode({ ...args, credentials })
      └─ resolveCredentials(creds?)
          ├─ if creds provided → use them (SvelteKit path)
          └─ else → fall back to process.env (stdio MCP server path)
```

**Why this matters:** SvelteKit does **not** populate `process.env` from `.env` files. The `/mcp` route must use `$env/dynamic/private` and pass credentials explicitly. The shared handler (`executeReportCode.ts`) accepts an optional `credentials` parameter so it works in both contexts:
- **HTTP MCP** (SvelteKit route): credentials injected from `$env/dynamic/private`
- **stdio MCP** (`servers/mcp/`): credentials from `process.env` (loaded via `dotenv`)

## Operational Notes

- **Per-request instances**: In stateless mode, SDK requires **both `McpServer` and `WebStandardStreamableHTTPServerTransport` to be created fresh for each request**:
  1. Transport cannot be reused (prevents message ID collisions between clients)
  2. McpServer cannot connect to multiple transports (throws "Already connected" error if reused)
  3. Tool registration is fast (just wiring up handler references defined at module scope)
- **Shared handler**: The `executeReportCodeHandler` function is defined once at module scope and reused across all request-scoped McpServer instances
- **Streaming**: MCP may stream results via SSE; callers must support `text/event-stream`
- **Return format**: The handler must return a `CallToolResult` object: `{ content: [{ type: 'text', text: '...' }] }`. Returning a plain string will cause MCP error -32602 (`Invalid tools/call result: expected object, received string`).

## Troubleshooting

### "Missing REPORTUS_BASIC_AUTH"

SvelteKit routes don't see `.env` values in `process.env`. Ensure:
1. `REPORTUS_BASIC_AUTH` is set in `apps/web/.env`
2. The route uses `import { env } from '$env/dynamic/private'` (not `process.env`)
3. Credentials are passed explicitly to `handleExecuteReportCode({ ...args, credentials })`

### "Invalid tools/call result: expected object, received string" (MCP -32602)

The `registerTool` callback must return a `CallToolResult` object:
```typescript
// CORRECT — handleExecuteReportCode already returns this shape
return await handleExecuteReportCode({ ...args, credentials });
// Returns: { content: [{ type: 'text', text: '{"result":...,"logs":[]}' }] }

// WRONG — don't unwrap the content
return (await handleExecuteReportCode({ ...args, credentials })).content[0].text;
// Returns: string — causes MCP -32602 error
```

### "Already connected to a transport"

Both `McpServer` and transport must be created fresh per request. Check that `handleMcpRequest()` creates `new McpServer(...)` + `new WebStandardStreamableHTTPServerTransport(...)` inside the function body, not at module scope.

### Accept header issues

Some clients (e.g., Postman) send `Accept: */*` instead of the required `application/json, text/event-stream`. The route includes `normalizeStreamableHttpAccept()` to patch this for POST requests.

## Status

**Production-ready** — Single-tool HTTP MCP server using the proven Web Fetch transport pattern. Handler logic is battle-tested from the stdio MCP server. Full type safety via shared imports.
