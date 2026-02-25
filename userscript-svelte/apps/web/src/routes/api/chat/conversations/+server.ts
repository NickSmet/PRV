/**
 * GET  /api/chat/conversations — List conversations
 * DELETE /api/chat/conversations?id=X — Delete a conversation
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getChatPersistence } from '$lib/server/chat-deps';

export const GET: RequestHandler = async () => {
  const persistence = getChatPersistence();
  const conversations = await persistence.listConversations();
  return json({ conversations });
};

export const DELETE: RequestHandler = async ({ url }) => {
  const id = url.searchParams.get('id');
  if (!id) return error(400, 'Missing id');

  const persistence = getChatPersistence();
  await persistence.deleteConversation(id);
  return json({ ok: true });
};
