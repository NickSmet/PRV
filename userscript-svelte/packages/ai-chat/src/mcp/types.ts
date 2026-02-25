export type MCPTransportType = 'stdio' | 'http';

export interface MCPServerConfig {
  name: string;
  displayName?: string;
  description?: string;
  namespace: string;
  transport: MCPTransportType;
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  url?: string;
  enabled?: boolean;
}

export interface MCPTool {
  name: string;
  description?: string;
  inputSchema: Record<string, unknown>;
}

export interface MCPToolWithNamespace extends MCPTool {
  originalName: string;
  namespace: string;
  serverName: string;
  namespacedName: string;
}

export interface MCPToolInvocation {
  toolName: string;
  arguments: Record<string, unknown>;
}

export interface MCPToolResult {
  success: boolean;
  serverName: string;
  data?: unknown;
  error?: string;
  executionTime?: number;
}

export type MCPConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface MCPServerConnection {
  config: MCPServerConfig;
  status: MCPConnectionStatus;
  tools: MCPToolWithNamespace[];
  lastError?: string;
  connectedAt?: Date;
  handle?: unknown;
}

export class MCPServerRegistry {
  private servers = new Map<string, MCPServerConfig>();

  register(config: MCPServerConfig): void {
    if (this.servers.has(config.name)) throw new Error(`Server already registered: ${config.name}`);
    this.servers.set(config.name, config);
  }

  get(name: string): MCPServerConfig | undefined {
    return this.servers.get(name);
  }

  getAll(): MCPServerConfig[] {
    return Array.from(this.servers.values());
  }

  getEnabled(): MCPServerConfig[] {
    return this.getAll().filter((s) => s.enabled !== false);
  }
}
