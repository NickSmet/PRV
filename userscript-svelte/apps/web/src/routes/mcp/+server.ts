/**
 * `/mcp` — Embedded MCP Server (HTTP)
 *
 * Exposes the execute_report_code tool over MCP Streamable HTTP.
 * Uses WebStandardStreamableHTTPServerTransport (designed for SvelteKit).
 */

import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import {
  EXECUTE_REPORT_CODE_DESCRIPTION,
  EXECUTE_REPORT_CODE_SCHEMA,
  handleExecuteReportCode,
} from '../../../../../servers/mcp/src/executeReportCode';

// Tool handler (shared across all McpServer instances)
// Injects Reportus credentials from SvelteKit's $env at call time
const executeReportCodeHandler = async (args: {
  reportId: string;
  code: string;
  timeoutMs?: number;
  maxOutputChars?: number
}) => {
  const credentials = {
    baseUrl: env.REPORTUS_BASE_URL ?? 'https://reportus.prls.net',
    basicAuth: env.REPORTUS_BASIC_AUTH ?? '',
  };
  return await handleExecuteReportCode({ ...args, credentials });
};

// In stateless mode, SDK requires BOTH McpServer and transport to be per-request
// (McpServer can only connect to one transport; calling connect() twice throws error)
async function handleMcpRequest(request: Request): Promise<Response> {
  // Create fresh McpServer for this request
  const mcpServer = new McpServer(
    { name: 'prv-reportus', version: '0.1.0' },
    { capabilities: { tools: {} } }
  );

  // Register the single execute_report_code tool
  // Note: Cast to any due to deep type inference with Zod schemas (same pattern as stdio server)
  (mcpServer.registerTool as any)(
    'execute_report_code',
    {
      title: 'Execute Report Code',
      description: EXECUTE_REPORT_CODE_DESCRIPTION,
      inputSchema: EXECUTE_REPORT_CODE_SCHEMA,
      strict: true
    },
    executeReportCodeHandler
  );

  // Create fresh transport for this request (stateless mode requirement)
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined
  });

  await mcpServer.connect(transport);
  return transport.handleRequest(request);
}

// Accept header normalization (clients must accept JSON + SSE)
function normalizeStreamableHttpAccept(request: Request): Request {
  if (request.method !== 'POST') return request;

  const accept = request.headers.get('accept') ?? '';
  if (accept.includes('application/json') && accept.includes('text/event-stream')) return request;

  const headers = new Headers(request.headers);
  const required = 'application/json, text/event-stream';
  headers.set('accept', accept ? `${accept}, ${required}` : required);

  return new Request(request, { headers });
}

export const GET: RequestHandler = async ({ request }) => {
  return handleMcpRequest(request);
};

export const POST: RequestHandler = async ({ request }) => {
  const normalized = normalizeStreamableHttpAccept(request);
  return handleMcpRequest(normalized);
};

export const DELETE: RequestHandler = async ({ request }) => {
  return handleMcpRequest(request);
};
