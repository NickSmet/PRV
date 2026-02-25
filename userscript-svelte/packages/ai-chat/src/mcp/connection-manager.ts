import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import type {
  MCPServerConfig,
  MCPServerConnection,
  MCPToolWithNamespace,
  MCPToolInvocation,
  MCPToolResult,
  MCPConnectionStatus,
} from './types.js';

import { env } from '$env/dynamic/private';

export class MCPPooledConnectionManager {
  private connections = new Map<string, MCPServerConnection>();

  async connect(config: MCPServerConfig): Promise<void> {
    if (this.connections.has(config.name)) throw new Error(`Already connected: ${config.name}`);

    const connection: MCPServerConnection = { config, status: 'connecting', tools: [] };
    this.connections.set(config.name, connection);

    try {
      if (config.transport === 'stdio') {
        await this.connectStdio(config, connection);
      } else if (config.transport === 'http') {
        await this.connectHttp(config, connection);
      } else {
        throw new Error(`Unsupported transport: ${config.transport}`);
      }

      connection.status = 'connected';
      connection.connectedAt = new Date();
    } catch (err) {
      connection.status = 'error';
      connection.lastError = err instanceof Error ? err.message : String(err);
      throw err;
    }
  }

  private async connectStdio(config: MCPServerConfig, connection: MCPServerConnection): Promise<void> {
    if (!config.command) throw new Error('stdio transport requires command');

    const transport = new StdioClientTransport({
      command: config.command,
      args: config.args || [],
      env: config.env ? { ...env, ...config.env } as Record<string, string> : undefined,
    });

    const client = new Client({ name: 'prv-ai-chat', version: '0.1.0' }, { capabilities: {} });
    await client.connect(transport);

    // Give servers a moment to finish boot logging and tool setup.
    await new Promise((r) => setTimeout(r, 150));

    const list = await client.listTools();
    connection.tools = list.tools.map((tool) => this.addNamespace(tool, config));
    connection.handle = client;
  }

  private async connectHttp(config: MCPServerConfig, connection: MCPServerConnection): Promise<void> {
    if (!config.url) throw new Error('http transport requires url');

    const transport = new StreamableHTTPClientTransport(new URL(config.url));
    const client = new Client({ name: 'prv-ai-chat', version: '0.1.0' }, { capabilities: {} });
    await client.connect(transport);

    const list = await client.listTools();
    connection.tools = list.tools.map((tool) => this.addNamespace(tool, config));
    connection.handle = client;
  }

  private addNamespace(
    tool: { name: string; description?: string; inputSchema?: Record<string, unknown> },
    config: MCPServerConfig,
  ): MCPToolWithNamespace {
    return {
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema ?? { type: 'object', properties: {} },
      originalName: tool.name,
      namespace: config.namespace,
      serverName: config.name,
      namespacedName: `${config.namespace}.${tool.name}`,
    };
  }

  async disconnectAll(): Promise<void> {
    const names = Array.from(this.connections.keys());
    await Promise.all(names.map((n) => this.disconnect(n)));
  }

  async disconnect(serverName: string): Promise<void> {
    const conn = this.connections.get(serverName);
    if (!conn) return;
    try {
      const client = conn.handle as Client | undefined;
      if (client?.close) await client.close();
    } finally {
      this.connections.delete(serverName);
    }
  }

  getStatus(serverName: string): MCPConnectionStatus {
    return this.connections.get(serverName)?.status || 'disconnected';
  }

  getAllTools(): MCPToolWithNamespace[] {
    const tools: MCPToolWithNamespace[] = [];
    for (const conn of this.connections.values()) {
      if (conn.status === 'connected') tools.push(...conn.tools);
    }
    return tools;
  }

  getToolsForOpenAI(): Array<{
    type: 'function';
    function: { name: string; description?: string; parameters: Record<string, unknown>; strict?: boolean };
  }> {
    return this.getAllTools().map((tool) => ({
      type: 'function' as const,
      function: {
        name: tool.namespacedName,
        description: tool.description || `MCP tool: ${tool.namespacedName}`,
        parameters: tool.inputSchema || { type: 'object', properties: {} },
        strict: false,
      },
    }));
  }

  getToolsForOpenAIResponses(): Array<{
    type: 'function';
    name: string;
    description?: string | null;
    parameters: Record<string, unknown> | null;
    strict: boolean | null;
  }> {
    return this.getAllTools().map((tool) => ({
      type: 'function' as const,
      name: tool.namespacedName,
      description: tool.description || `MCP tool: ${tool.namespacedName}`,
      parameters: tool.inputSchema || { type: 'object', properties: {} },
      strict: false,
    }));
  }

  private findTool(toolName: string): MCPToolWithNamespace | undefined {
    return (
      this.getAllTools().find((t) => t.namespacedName === toolName) ??
      this.getAllTools().find((t) => t.originalName === toolName)
    );
  }

  async invokeTool(invocation: MCPToolInvocation): Promise<MCPToolResult> {
    const start = Date.now();
    try {
      const tool = this.findTool(invocation.toolName);
      if (!tool) {
        return { success: false, serverName: 'unknown', error: `Tool not found: ${invocation.toolName}`, executionTime: Date.now() - start };
      }

      const conn = this.connections.get(tool.serverName);
      if (!conn || conn.status !== 'connected') {
        return { success: false, serverName: tool.serverName, error: `Server not connected: ${tool.serverName}`, executionTime: Date.now() - start };
      }

      const client = conn.handle as Client | undefined;
      if (!client) {
        return { success: false, serverName: tool.serverName, error: `No client handle for server: ${tool.serverName}`, executionTime: Date.now() - start };
      }

      const result = await client.callTool({ name: tool.originalName, arguments: invocation.arguments });
      return { success: true, serverName: tool.serverName, data: result, executionTime: Date.now() - start };
    } catch (err) {
      return { success: false, serverName: 'unknown', error: err instanceof Error ? err.message : String(err), executionTime: Date.now() - start };
    }
  }

  getConnectionInfo(): Array<{ name: string; status: string; toolCount: number; namespace: string }> {
    return Array.from(this.connections.entries()).map(([name, conn]) => ({
      name,
      status: conn.status,
      toolCount: conn.tools.length,
      namespace: conn.config.namespace,
    }));
  }
}
