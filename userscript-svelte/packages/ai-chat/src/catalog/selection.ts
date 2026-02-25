import type { McpCatalog, McpServerConfigUser } from './types.js';
import { getExposedAvailableTools } from './types.js';

export type ConversationToolSelection = {
  version: 1;
  servers: Record<string, boolean | undefined>;
  tools: Record<string, boolean | undefined>;
};

export type EnabledToolInfo = {
  serverId: string;
  serverLabel: string;
  toolNames: string[];
};

export function defaultSelectionFromCatalog(catalog: McpCatalog): ConversationToolSelection {
  const servers: Record<string, boolean> = {};
  const tools: Record<string, boolean> = {};

  for (const server of catalog.servers) {
    if (server.mode === 'server') {
      servers[server.id] = Boolean(server.defaultEnabled);
      continue;
    }

    const exposed = getExposedAvailableTools(server);
    for (const tool of exposed) {
      tools[tool.namespacedName] = Boolean(tool.defaultEnabled);
    }
  }

  return { version: 1, servers, tools };
}

export function sanitizeSelection(selection: ConversationToolSelection, catalog: McpCatalog): ConversationToolSelection {
  const next: ConversationToolSelection = { version: 1, servers: {}, tools: {} };

  const toolIndex = new Map<string, { serverId: string; server: McpServerConfigUser; tool: { namespacedName: string } }>();
  for (const server of catalog.servers) {
    for (const tool of server.tools) {
      toolIndex.set(tool.namespacedName, { serverId: server.id, server, tool });
    }
  }

  for (const server of catalog.servers) {
    if (server.mode !== 'server') continue;
    next.servers[server.id] = Boolean(selection.servers?.[server.id] ?? server.defaultEnabled ?? false);
  }

  for (const [namespacedName, enabled] of Object.entries(selection.tools ?? {})) {
    if (!enabled) continue;
    const entry = toolIndex.get(namespacedName);
    if (!entry) continue;
    if (entry.server.mode !== 'tools') continue;

    const toolCfg = entry.server.tools.find((t) => t.namespacedName === namespacedName);
    if (!toolCfg?.available || !toolCfg.exposed) continue;

    next.tools[namespacedName] = true;
  }

  // Ensure defaults for tool-mode servers are applied when missing
  for (const server of catalog.servers) {
    if (server.mode !== 'tools') continue;
    for (const tool of getExposedAvailableTools(server)) {
      if (typeof next.tools[tool.namespacedName] === 'boolean') continue;
      next.tools[tool.namespacedName] = Boolean(selection.tools?.[tool.namespacedName] ?? tool.defaultEnabled ?? false);
    }
  }

  return next;
}

export function getEnabledToolsByServer(catalog: McpCatalog, selection: ConversationToolSelection): EnabledToolInfo[] {
  const sanitized = sanitizeSelection(selection, catalog);
  const out: EnabledToolInfo[] = [];

  for (const server of catalog.servers) {
    if (server.mode === 'server') {
      const enabled = Boolean(sanitized.servers[server.id]);
      if (!enabled) continue;

      const tools = getExposedAvailableTools(server).map((t) => t.namespacedName);
      if (tools.length === 0) continue;

      out.push({ serverId: server.id, serverLabel: server.label, toolNames: tools });
      continue;
    }

    const tools = getExposedAvailableTools(server)
      .map((t) => t.namespacedName)
      .filter((n) => Boolean(sanitized.tools[n]));
    if (tools.length === 0) continue;

    out.push({ serverId: server.id, serverLabel: server.label, toolNames: tools });
  }

  return out;
}
