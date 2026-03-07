/**
 * POST /api/chat/chat
 *
 * Send a message to the AI chat. Runs the full agentic loop server-side
 * (connects to MCP, calls OpenAI, invokes tools, returns final response).
 *
 * Body: { conversationId?: string, message: string, reportId: string }
 * Returns: { conversationId: string, response: string }
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { runChat } from '@prv/ai-chat';
import { getChatDeps } from '$lib/server/chat-deps';

export const POST: RequestHandler = async ({ request, url }) => {
  const body = await request.json();
  const { conversationId, message, reportId, history } = body as {
    conversationId?: string;
    message?: string;
    reportId?: string;
    history?: Array<{ role: string; content: string }>;
  };

  if (!message?.trim()) {
    return error(400, 'Missing message');
  }

  // Build MCP URL pointing to our own embedded server
  const mcpUrl = `${url.origin}/mcp`;
  const deps = getChatDeps(mcpUrl);

  // If reportId is provided, prepend it as context in the system prompt
  if (reportId) {
    deps.systemPrompt = (deps.systemPrompt ?? '') +
      `\n\nThe user is looking at report ID: ${reportId}. When using the execute_report_code tool, always pass this reportId.\n\nTool args must be JSON like: {"reportId":"${reportId}","code":"async function main(data, report, ctx) { /* ... */ }"} (never wrap code under "raw").`;
  }

  try {
    const result = await runChat(deps, { conversationId, message, history });
    return json(result);
  } catch (err) {
    console.error('[chat] Error:', err);
    const msg = err instanceof Error ? err.message : String(err);
    return json({ conversationId: conversationId ?? '', response: '', error: msg }, { status: 500 });
  }
};
