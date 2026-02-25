import type { MCPServerConfig } from '../mcp/types.js';
import type { McpCatalog, McpServerConfigUser, McpToolConfig } from '../catalog/types.js';
import type { ConversationToolSelection, EnabledToolInfo } from '../catalog/selection.js';
import { defaultSelectionFromCatalog, sanitizeSelection, getEnabledToolsByServer } from '../catalog/selection.js';
import type { ChatPersistence } from '../persistence/types.js';
import type { OpenAIConfig } from '../providers/openai-client.js';

export type ChatDependencies = {
  persistence: ChatPersistence;
  catalog: McpCatalog;
  openaiConfig: OpenAIConfig;
  systemPrompt?: string;
};

export type ChatPlan = {
  selection: ConversationToolSelection;
  enabledByServer: EnabledToolInfo[];
  enabledToolNames: Set<string>;
  serverConfigs: MCPServerConfig[];
  serverNames: string[];
};

export function planChat(params: { catalog: McpCatalog; selection?: ConversationToolSelection | null }): ChatPlan {
  const baseSelection = params.selection ?? defaultSelectionFromCatalog(params.catalog);
  const selection = sanitizeSelection(baseSelection, params.catalog);
  const enabledByServer = getEnabledToolsByServer(params.catalog, selection);

  const enabledToolNames = new Set<string>();
  for (const s of enabledByServer) for (const t of s.toolNames) enabledToolNames.add(t);

  const serverConfigs: MCPServerConfig[] = [];
  const serverNames: string[] = [];

  for (const enabled of enabledByServer) {
    const server = params.catalog.servers.find((s) => s.id === enabled.serverId);
    if (!server) continue;
    serverConfigs.push(toMcpServerConfig(server));
    serverNames.push(server.id);
  }

  return { selection, enabledByServer, enabledToolNames, serverConfigs, serverNames };
}

export function isChatToolEnabled(params: { toolName: string; enabledToolNames: Set<string> }): boolean {
  return params.enabledToolNames.has(params.toolName);
}

function toolByNamespacedName(server: McpServerConfigUser, namespacedName: string): McpToolConfig | undefined {
  return server.tools.find((t) => t.namespacedName === namespacedName);
}

export function buildChatSystemPrompt(params: {
  catalog: McpCatalog;
  plan: Pick<ChatPlan, 'enabledByServer' | 'serverNames'>;
  basePrompt?: string;
}): string {
  // Always start with the default prompt (contains analysis guidelines + formatting rules).
  // The caller's basePrompt is appended as additional context, not a replacement.
  const basePrompt = params.basePrompt
    ? DEFAULT_SYSTEM_PROMPT + '\n\n' + params.basePrompt
    : DEFAULT_SYSTEM_PROMPT;

  const enabledLines: string[] = [];
  const usageBlocks: string[] = [];

  for (const entry of params.plan.enabledByServer) {
    const server = params.catalog.servers.find((s) => s.id === entry.serverId);
    if (!server) continue;

    enabledLines.push(`- ${entry.serverLabel}: ${entry.toolNames.map((n) => `\`${n}\``).join(', ')}`);

    const serverHint = (server.description ?? '').trim();
    if (serverHint) {
      usageBlocks.push(`**${server.label}**\n${serverHint}`);
    }

    const toolHints: string[] = [];
    for (const toolName of entry.toolNames) {
      const toolCfg = toolByNamespacedName(server, toolName);
      const hint = (toolCfg?.usageHint ?? '').trim();
      if (!hint) continue;
      toolHints.push(`**${toolCfg?.label ?? toolName}**\n${hint}`);
    }
    if (toolHints.length > 0) usageBlocks.push(toolHints.join('\n\n'));
  }

  const enabledToolsBlock =
    enabledLines.length > 0 ? `\n\n**Enabled tools:**\n${enabledLines.join('\n')}` : `\n\n**Enabled tools:** (none)`;

  let prompt = basePrompt + enabledToolsBlock;

  if (params.plan.serverNames.length > 0) {
    prompt += `\n\n---\n\n**Enabled MCP servers:** ${params.plan.serverNames.map((s) => `\`${s}\``).join(', ')}`;
  }

  const usage = usageBlocks.filter(Boolean).join('\n\n---\n\n');
  if (usage) prompt += `\n\n---\n\n${usage}`;

  return prompt;
}

function toMcpServerConfig(server: McpServerConfigUser): MCPServerConfig {
  return {
    name: server.id,
    displayName: server.label,
    description: server.description,
    namespace: server.namespace,
    transport: server.transport,
    command: server.command,
    args: server.args,
    env: server.env,
    url: server.url,
    enabled: true,
  };
}

const DEFAULT_SYSTEM_PROMPT = `You are a helpful assistant that analyzes Parallels Desktop technical reports. You have access to tools that can inspect report data programmatically.

When analyzing a report:
1. Use the available tools to examine the report data
2. Provide clear, actionable insights based on your findings
3. If you find issues (markers/warnings), explain what they mean and suggest solutions
4. Be concise but thorough

You can write JavaScript code that runs in a sandbox with access to the full parsed report data. The code should define a \`main(data, report, ctx)\` function.

**TOOL STRATEGY:**
- Prefer ONE tool call per user question.
- In that single call, gather all fields you need and return one compact JSON object.
- Only make a follow-up tool call if the first result proves something required is missing (e.g., a file path is absent).

**CRITICAL FORMATTING RULES:**
- Always respond in standard Markdown text
- For diagrams/visualizations: use Markdown tables, bulleted lists, or simple indented text descriptions
- NEVER use Unicode box-drawing characters (e.g. characters in the Unicode "Box Drawing" block, U+2500-U+257F), even if the user asks for "ASCII art" or "ASCII diagram"
- If asked for ASCII diagrams, use Markdown tables or simple text with dashes/pipes instead: \`| VM | -- Shared Net -- | Host |\`
- Do NOT use special Unicode symbols or extended ASCII characters
- Plain ASCII letters, numbers, basic punctuation, and Markdown syntax only`;
