/**
 * GET /api/chat/activity?conversationId=X&since=Y
 *
 * Poll for tool call activity during agentic loops.
 * Returns tool calls that occurred after the `since` timestamp.
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getChatPersistence } from '$lib/server/chat-deps';

export const GET: RequestHandler = async ({ url }) => {
  const conversationId = url.searchParams.get('conversationId');
  if (!conversationId) {
    return error(400, 'Missing conversationId');
  }

  const sinceParam = url.searchParams.get('since');
  const since = sinceParam ? Number(sinceParam) : undefined;

  const persistence = getChatPersistence();
  const toolCalls = await persistence.getToolCallsWithResults(conversationId, { since });

  return json({ toolCalls });
};
