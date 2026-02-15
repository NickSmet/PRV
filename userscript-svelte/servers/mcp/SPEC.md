# MCP Server (stdio) Specification

## Overview

`servers/mcp/` is an MCP server (stdio transport) that exposes Reportus report retrieval + parsing as tools for agents.

**Key principle:** MCP tools reuse the same backend client + parsing code as the web app:
- HTTP calls: `packages/report-api`
- parsing/model/rules: `packages/report-core`
- agent shaping: `packages/report-ai`

## Configuration

### Environment variables

| Variable | Purpose | Example |
|---|---|---|
| `REPORTUS_BASE_URL` | Reportus origin | `https://reportus.prls.net` |
| `REPORTUS_BASIC_AUTH` | Basic auth for Reportus API (full header or base64 payload) | `Basic <base64>` |

Sample file: `servers/mcp/.env.example`
Runtime note: `servers/mcp/src/index.ts` loads `servers/mcp/.env` automatically via `dotenv` when started with `npm run mcp:dev`.

## Tools

Implemented in `servers/mcp/src/index.ts`.

| Tool | Input | Output |
|---|---|---|
| `report_index` | `reportId` | Report index JSON |
| `get_file_text` | `reportId`, `filePath`, `maxBytes?`, `maxChars?` | Raw text (truncated) |
| `parse_node` | `reportId`, `nodeKey`, `maxBytes?` | Parsed node summary JSON |
| `build_model` | `reportId`, `nodes?`, `maxBytes?` | `{ report, markers, nodes }` |
| `markers` | `reportId`, `nodes?`, `maxBytes?` | `{ markers }` |
| `agent_summary` | `reportId`, `nodes?`, `maxBytes?` | `packages/report-ai` summary |

## Constraints

- Size limits are enforced via `maxBytes` (download truncation) and `maxChars` (string shaping).
- Never log auth values.

## Status

**Outline** — initial tool set is implemented; tool schemas and outputs should remain stable as the parser/model evolves.
