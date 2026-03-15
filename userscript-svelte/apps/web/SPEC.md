# Web App (SvelteKit) Specification

## Overview

`apps/web/` is a SvelteKit (adapter-node) web surface that:
- proxies the Reportus API server-side (so Basic Auth is never exposed to the browser)
- reuses shared parsing/model/rules from `packages/report-core`
- reuses shared NodeModel building from `packages/report-viewmodel`
- renders shared UI from `packages/report-ui-svelte`
- embeds an HTTP MCP server at `/mcp` (exposes `execute_report_code`)
- provides an **AI Chat** side panel that connects to the embedded MCP server via `@prv/ai-chat`
- includes several **lab routes** for prototyping parsing, timeline, and visualization ideas, alongside a promoted report logs workspace

**Key principle:** the browser never talks to `https://reportus.prls.net` directly — all calls go through SvelteKit routes.

This surface currently ships:
- **Reality-centered (mental-model) view**: `/{reportId}` (digits-only)
- **Report logs workspace**: `/{reportId}/logs` (digits-only)
- **Node-centered view**: `/nodes/{reportId}` (digits-only)
- **Legacy lab report alias**: `/lab/{reportId}`
- **Lab icon gallery**: `/lab/icons`
- **Lab timeline fixtures**: `/lab/timeline`
- **Lab log parser fixtures**: `/lab/logs`

The report page includes an optional **AI Chat panel** for asking questions about the report data.

## Architecture

```
Browser UI (Svelte 5)
  ├─ calls /api/reports/:id/*
  │   └─ SvelteKit server routes
  │       └─ packages/report-api      (Reportus HTTP client)
  │           └─ packages/report-core (node payload resolution + parsing + rules)
  │               └─ packages/report-viewmodel (NodeModel builders)
  │                   └─ packages/report-ui-svelte (render)
  │
  ├─ report log workspace
  │   └─ browser worker
  │       └─ parses current-VM logs to local browser state / IndexedDB substrate
  │
  ├─ future raw log durability
  │   └─ backend ingest
  │       └─ Azure Blob (raw log mirror for AI/MCP and efficient range reads)
  │
  ├─ calls /api/chat/*              (AI Chat)
  │   └─ @prv/ai-chat               (agentic loop + MCP client)
  │       ├─ OpenAI / Azure OpenAI   (LLM)
  │       └─ HTTP MCP client → /mcp  (tool execution)
  │
  └─ POST/GET /mcp                  (Embedded MCP Server)
      └─ servers/mcp (shared handler)
          └─ packages/report-ai      (ReportView + sandbox)
```

## Configuration

### Environment variables

These are **server-only** (do not prefix with `VITE_`).

| Variable | Purpose | Example |
|---|---|---|
| `REPORTUS_BASE_URL` | Reportus origin | `https://reportus.prls.net` |
| `REPORTUS_BASIC_AUTH` | Basic auth for Reportus API (full header value or base64 payload) | `Basic <base64>` |
| `REPORT_SOURCE_MODE` | Source selection for report-backed routes: `api`, `prefer_fixture`, or `fixture` (default `api`) | `prefer_fixture` |
| `AI_CHAT_PROVIDER` | LLM provider: `auto`, `openai`, or `azure` (default `auto`) | `auto` |
| `AI_CHAT_API_MODE` | OpenAI API mode: `responses` or `chat_completions` (default `responses`) | `responses` |
| `AI_CHAT_MODEL` | Model / Azure deployment name (default `gpt-4o-mini`) | `gpt-4o-mini` |
| `OPENAI_API_KEY` | OpenAI API key (required when provider is `openai` or `auto` without Azure) | `sk-...` |
| `OPENAI_BASE_URL` | Optional base URL override for OpenAI-compatible proxies | |
| `AZURE_OPENAI_API_KEY` | Azure OpenAI API key (required when provider is `azure` or `auto` with Azure) | |
| `AZURE_OPENAI_ENDPOINT` | Azure OpenAI resource endpoint | `https://X.openai.azure.com` |
| `AZURE_OPENAI_API_VERSION` | Azure API version | `2024-12-01-preview` |

Sample file: `apps/web/.env.example`

Runtime note: SvelteKit loads `apps/web/.env` for server-only env via `$env/dynamic/private`.

**Auth normalization contract:** `REPORTUS_BASIC_AUTH` may be either:
- `Basic <base64>` (full header value), or
- `<base64>` (payload only; `packages/report-api` will prefix with `Basic `).

## Server routes

### Report API

All routes are under `apps/web/src/routes/api/reports/`.

| Route | Purpose |
|---|---|
| `GET /api/reports/:id` | Fetch report index (`/api/reports/{id}`) |
| `GET /api/reports/:id/files/[...filePath]` | Download raw attachment/log content as **text** (truncated) |
| `GET /api/reports/:id/files-raw/[...filePath]` | Download raw attachment/log content as **bytes** (truncated; used for images/binaries) |
| `GET /api/reports/:id/nodes/:nodeKey` | Fetch a node payload via filename hints + parse to a summary |
| `GET /api/reports/:id/model` | Build a default `ReportModel`, evaluate markers, return `{ report, markers, nodes }` |
| `GET /api/reports/:id/mental-model` | Build the mental-model page payload (RealityModel + nodes + markers + raw list + per-VM discovery) |
| `GET /api/reports/:id/raw/node/:nodeKey` | Raw node payload for modal (text/plain; includes truncation headers) |

These routes are part of the **main application contract** and should remain stable unless a shared parser/model contract changes.

### Lab routes

These routes are intentionally experimental and may use fixtures or temporary UI contracts.

| Route | Purpose |
|---|---|
| `GET /:reportId/logs` | Main report logs workspace: shared timeline + log viewer for current-VM logs. Uses one browser-local log session, shared selection state, and click-to-jump from timeline events into the log viewer. |
| `GET /lab/:reportId` | Lab report view / experiments on a report payload |
| `GET /lab/icons` | Icon experiments |
| `GET /lab/timeline` | Fixture picker for timeline experiments |
| `GET /lab/timeline/:reportId` | Grouped timeline prototype over selected fixture logs |
| `GET /lab/timeline/:reportId/compact` | Legacy redirect to `/:reportId/logs` |
| `GET /lab/logs` | Fixture picker for log parsing experiments |
| `GET /lab/logs/:reportId` | Single-file log parsing debug UI |
| `GET /lab/logs/:reportId/viewer` | Tight, end-user oriented log viewer over IndexedDB |
| `GET /lab/fixtures/:reportId/files/[...filePath]` | Fixture file endpoint for lab UIs |

Lab routes are allowed to evolve quickly and are not part of the stable product API.

### Planned log-ingest routes (not implemented yet)

These are the likely next backend-facing additions once log parsing moves beyond the lab:

- ingest/report metadata endpoints for browser-side log indexing
- query endpoints over derived events or cached manifests
- Blob-backed raw log retrieval endpoints for MCP / AI access

They should be designed around the storage contract in `docs/work-in-progress/log-workspace/LOG-INGEST-AND-STORAGE-SPEC.md`, not around fixture-only lab behavior.

### MCP Server

| Route | Purpose |
|---|---|
| `POST /mcp` | MCP Streamable HTTP endpoint (JSON-RPC 2.0) — exposes `execute_report_code` tool |
| `GET /mcp` | MCP SSE endpoint |
| `DELETE /mcp` | MCP session cleanup |

See `apps/web/src/routes/mcp/SPEC.md` for full protocol details.

### AI Chat API

All routes are under `apps/web/src/routes/api/chat/`. The chat backend is powered by `@prv/ai-chat` and connects to the embedded `/mcp` server via HTTP to invoke `execute_report_code`.

| Route | Method | Purpose |
|---|---|---|
| `/api/chat/chat` | `POST` | Send a user message and receive the assistant's response. Starts/continues a conversation. |
| `/api/chat/activity` | `GET` | Poll tool-call activity during an in-progress agentic loop (`?conversationId=X&since=Y`). |
| `/api/chat/conversations` | `GET` | List all conversations (in-memory; lost on restart). |
| `/api/chat/conversations` | `DELETE` | Delete a conversation by ID (`?conversationId=X`). |

**Chat flow:**
1. Client sends `POST /api/chat/chat` with `{ message, conversationId? }`
2. Server injects report context into the system prompt, connects to `/mcp` via HTTP MCP client
3. Agentic loop: OpenAI calls → tool invocations via MCP → results fed back (max 10 iterations)
4. Client polls `GET /api/chat/activity` during the loop to show tool-call cards in real time
5. Final assistant response returned in the POST response

**Dependencies:** `@prv/ai-chat` (chat logic), embedded `/mcp` route (MCP server), OpenAI/Azure API (LLM).

### Data source note (fixtures vs real API)

This web app always retrieves report content from the **Reportus API** via `packages/report-api`.
Local `fixtures/` are used only by:

- the CLI parser harness (`npm run parse:node`)
- lab routes under `/lab/*`

They are not part of the main report surface.

For log-heavy workflows, the intended path is:

- current implementation phase: `Reportus API -> web proxy -> browser worker -> IndexedDB`
- future durable raw storage phase: `Reportus API -> backend ingest -> Azure Blob`

Blob is the planned source for later AI/MCP log access because Reportus does not provide efficient range reads in practice.

See `docs/work-in-progress/log-workspace/LOG-INGEST-AND-STORAGE-SPEC.md`.

The important boundary is:

- **main report routes** continue to read from Reportus-derived parsers/viewmodels
- **log indexing routes** will build a browser-local query substrate
- **AI/MCP raw log access** should target Blob once that mirror exists

### Caching and size limits

- Server-side TTL caches are used for node payloads and file downloads to reduce repeated Reportus calls.
- Default `maxBytes` is **2 MiB** for logs/payloads; callers may request larger sizes (the UI offers “Show more”) up to a hard cap.
- Reportus file downloads should be treated as **non-rangeable**; callers cannot assume `206 Partial Content` or efficient tail/window reads from the upstream server.

### Log timestamp contract

For log-derived views, the web app should preserve the **customer-visible wall clock** from the raw log.

That means:

- infer missing year when necessary
- do **not** shift timestamps using report timezone offset
- encode sortable values using UTC-shaped dates/numbers
- format them in UTC mode in the UI so the shown clock matches the raw log text

The report timezone can still be recorded as metadata, but it must not change the displayed log time.

### Azure Functions note (WIP)

When deployed on Azure Static Web Apps (Azure Functions backend), **in-memory caches are not reliable** across cold starts/scale-out.

Planned feature: **Report Snapshot Cache** backed by **Azure Blob Storage** to materialize report-derived UI/AI payloads once per report version and serve future requests without repeatedly calling Reportus.

Spec: `apps/web/src/lib/server/report-snapshot/SPEC.md`

Important distinction:

- **snapshot blobs** cache derived UI/AI payloads
- **raw log blobs** are a separate planned subsystem for durable raw log access and later AI/MCP range reads

### Error handling contract

- HTTP errors from Reportus are forwarded as SvelteKit endpoint errors (e.g. Reportus `404` → endpoint `404`).
- Auth values must never be returned to the browser or logged.

## UI

### Report Page (`/{reportId}`)

The report page renders a `RealityViewer` (mental-model view) with an optional **AI Chat side panel**.

- **Chat toggle:** Fixed button in the bottom-right corner. Opens a 400px collapsible panel on the right.
- **Chat panel:** `ChatPanel.svelte` — message list, tool-call cards (interleaved by timestamp), loading indicator, input field.
- **Components:** `ChatMessage.svelte`, `ChatInput.svelte`, `ToolCallCard.svelte` in `src/lib/components/chat/`.
- **State:** Svelte 5 context (`src/lib/contexts/chat-context.svelte.ts`) — manages `conversationId`, messages, tool calls, polling.
- **Polling:** During agentic loops, client polls `/api/chat/activity` every 1.5s to render tool-call cards in real time.

### Persistence

Chat persistence is **in-memory only** (conversations lost on server restart). The `@prv/ai-chat` package defines a `ChatPersistence` interface — swap in a database-backed implementation when needed.

### Lab UIs

Lab routes are allowed to:

- use fixture-only sources
- use temporary view models
- iterate quickly on parsing and visualization

But they should still prefer:

- shared parsing contracts when possible
- browser workers for heavy log parsing
- evolution paths that can be promoted into the main app later

#### Tight log viewer (`/lab/logs/:reportId/viewer`)

This route is a “performance-first” prototype of the eventual end-user log viewer:

- IndexedDB-backed ingestion (browser worker), windowed querying, and virtualized rendering
- fixed ingest parameters: `tail`, `2 MiB`, `20,000` lines
- scoped log selector: `vm.log`, `parallels-system.log`, `tools.log` (when present)
- tight viewer display policy: hides non-timestamped rows and rows with empty messages
- chunked window policy: advance in `150`-row steps while retaining up to `500` rows around the viewport
- editor-style search UX: case-insensitive find over cached rows with `N of M` count and previous/next navigation, without filtering the dataset; enters find mode after a short idle debounce and immediately reveals the active match centered in the viewport when possible
- the viewer is designed to be embeddable inside the shared timeline workspace
- row navigation can be driven externally by a row locator / timeline event click

#### Shared log workspace

The intended final arrangement for timeline + viewer work is a shared browser-local workspace:

- app-local orchestration, not shared package UI
- shared current-VM log selection
- viewer + compact timeline consume the same indexed row substrate
- timeline selection navigates the viewer by event start row

Conceptual app-local modules:

- `logs/viewer`
- `logs/timeline`
- `logs/workspace`

#### Logs workspace (`/{reportId}/logs`)

This route is the main orchestration surface for the shared timeline+viewer experience:

- shared log selection for current-VM logs
- compact grouped timeline over extracted events
- event details pane
- click timeline event → viewer jump to event start row
- auto-select event source log if needed
- partial events allowed during ingest
- no separate raw-log fetch/parse path inside the timeline presentation component

Behavior requirements and parsing substrate are specified in (WIP):

- `docs/work-in-progress/log-workspace/LOG-INGEST-AND-STORAGE-SPEC.md`
- `docs/work-in-progress/log-workspace/LOG-LINE-INDEXING-SPEC.md`

## Testing Pipeline

### Prerequisites

1. Ensure `apps/web/.env` has valid `REPORTUS_BASE_URL` + `REPORTUS_BASIC_AUTH`
2. For AI Chat, also set OpenAI or Azure credentials (see `.env.example`)
3. Start the dev server: `cd apps/web && npm run dev` (typically runs on port 5173)

### Test the embedded MCP server

```bash
# 1. Initialize (handshake)
curl -sS -X POST "http://localhost:5173/mcp" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"curl","version":"0"}}}'

# 2. List tools (should return execute_report_code)
curl -sS -X POST "http://localhost:5173/mcp" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'

# 3. Call execute_report_code (replace 512022712 with a valid report ID)
curl -sS -X POST "http://localhost:5173/mcp" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc":"2.0","id":3,"method":"tools/call",
    "params":{
      "name":"execute_report_code",
      "arguments":{"reportId":"512022712","code":"function main(data) { return { vmCount: data.vms.length, product: data.meta.productVersion }; }"}
    }
  }'
```

Expected: step 3 returns `{ "content": [{ "type": "text", "text": "{\"result\":{\"vmCount\":2,...},\"logs\":[]}" }] }`

### Test the AI Chat API (end-to-end)

```bash
# Send a question — this triggers the full pipeline:
# OpenAI → tool call → MCP HTTP → Reportus API → sandbox → result → OpenAI → response
curl -sS -X POST "http://localhost:5173/api/chat/chat" \
  -H "Content-Type: application/json" \
  -d '{"message":"How many VMs are in report 512022712?"}'

# Expected: { "conversationId": "...", "response": "The report contains 2 virtual machines..." }
```

```bash
# Continue a conversation (pass conversationId from previous response)
curl -sS -X POST "http://localhost:5173/api/chat/chat" \
  -H "Content-Type: application/json" \
  -d '{"conversationId":"<id-from-above>","message":"What is the host OS and CPU?"}'
```

```bash
# Poll tool activity (during an in-progress chat)
curl -sS "http://localhost:5173/api/chat/activity?conversationId=<id>&since=0"

# List conversations
curl -sS "http://localhost:5173/api/chat/conversations"

# Delete a conversation
curl -sS -X DELETE "http://localhost:5173/api/chat/conversations?conversationId=<id>"
```

### Test from the UI

1. Open `http://localhost:5173/<reportId>` in the browser
2. Click the "Chat" button (bottom-right) to open the side panel
3. Type a question about the report and press Enter
4. Observe: tool-call cards appear in real-time (polling), then the final answer renders

## Troubleshooting

### "Missing REPORTUS_BASIC_AUTH" when calling /mcp or /api/chat

**Cause:** SvelteKit does **not** populate `process.env` from `.env` files. Only `$env/dynamic/private` has access to `.env` values in server routes.

**Fix:** The MCP route (`/mcp`) and chat deps (`chat-deps.ts`) both use `import { env } from '$env/dynamic/private'` and pass credentials explicitly to the shared handler. If you see this error, verify that `REPORTUS_BASIC_AUTH` is set in `apps/web/.env` (not just a shell export).

### Azure: "API version not supported" / "Responses API not supported"

**Cause:** Azure OpenAI does **not** support the Responses API (`/openai/v1` endpoint path). The `openai` npm package's `AzureOpenAI` client attempts this path when `apiMode` is `'responses'`.

**Fix:** The system auto-detects Azure and forces `chat_completions` mode (see `chat.ts` line ~98 and `openai-client.ts` line ~85). Set `AI_CHAT_API_MODE=chat_completions` explicitly in `.env` to avoid the warning log.

### "The model produced invalid content" (500 from Azure/OpenAI)

**Cause 1:** Tool results sent back to OpenAI must be **plain text strings**, not MCP wrapper objects. The MCP `client.callTool()` returns `{ content: [{ type: 'text', text: '...' }] }` — if the entire wrapper is JSON-serialized as the tool result, OpenAI rejects it.

**Fix:** `chat.ts` extracts `.content[].text` from the MCP result before sending to OpenAI (see `executeToolCall()` around line 440).

**Cause 2:** Very large tool results (50KB+) exceed Azure's per-message size limits.

**Fix:** Tool results are truncated to 30,000 characters (see `MAX_TOOL_RESULT_CHARS` in `chat.ts` line 452).

### "Invalid tools/call result: expected object, received string" (MCP error -32602)

**Cause:** The `registerTool` handler in the MCP server must return a `CallToolResult` object (`{ content: [{ type: 'text', text: '...' }] }`), not a plain string.

**Fix:** The handler returns `handleExecuteReportCode()` directly — it already returns the correct shape. Do **not** unwrap `.content[0].text` before returning.

### "Already connected to a transport" (MCP server error)

**Cause:** In stateless mode, both `McpServer` and `WebStandardStreamableHTTPServerTransport` must be created **fresh per request**. Reusing either across requests causes this error.

**Fix:** The `/mcp` route creates both `new McpServer(...)` and `new WebStandardStreamableHTTPServerTransport(...)` inside `handleMcpRequest()` (called per request).

## Debug Logging

The following `console.log` prefixes are available in server logs during dev:

| Prefix | File | What it shows |
|---|---|---|
| `[OpenAI Client]` | `openai-client.ts` | Provider resolution, config received, client creation details |
| `[Chat]` | `chat.ts` | Request payloads (model, tool count, message count), per-iteration message structure, tool results (name, success, length, preview) |
| `[Chat] Azure detected` | `chat.ts` | When Azure forces chat_completions mode |

To see full message payloads sent to OpenAI, check the `[Chat] Chat Completions continue request` logs — they list every message index with role, content length, and tool call IDs.

## Dependencies

- **SvelteKit surface**: `apps/web` (Svelte 5)
- **Reportus proxy + parsing/model**: `packages/report-api`, `packages/report-core`
- **Viewmodels + UI**: `packages/report-viewmodel`, `packages/report-ui-svelte`
- **Embedded MCP server**: `apps/web/src/routes/mcp/+server.ts` + `servers/mcp`
- **AI Chat**: `@prv/ai-chat` (server routes under `apps/web/src/routes/api/chat/*`)

## Related docs

- Mental-model UX contract: `docs/features/MENTAL-MODEL-VIEW.md`
- Log workspace (WIP): `docs/work-in-progress/log-workspace/`
- Embedded MCP server: `apps/web/src/routes/mcp/SPEC.md`
- MCP stdio server: `servers/mcp/SPEC.md`
- AI shaping layer: `packages/report-ai/SPEC.md`

## Status

**Outline** — routes + shared rendering are implemented; AI chat is functional with in-memory persistence. Caching policy can evolve without changing shared parser contracts.
