export type McpTransportType = 'stdio' | 'http';
export type McpServerMode = 'server' | 'tools';

export type McpToolConfig = {
  name: string;
  namespacedName: string;
  description?: string;
  inputSchema?: Record<string, unknown>;
  available: boolean;
  exposed: boolean;
  label?: string;
  usageHint?: string;
  defaultEnabled?: boolean;
};

export type McpServerConfigUser = {
  id: string;
  label: string;
  namespace: string;
  description?: string;
  mode: McpServerMode;
  transport: McpTransportType;
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  url?: string;
  defaultEnabled?: boolean;
  tools: McpToolConfig[];
};

export type McpCatalog = {
  version: 1;
  servers: McpServerConfigUser[];
};

export function getServerById(catalog: McpCatalog, id: string): McpServerConfigUser | undefined {
  return catalog.servers.find((s) => s.id === id);
}

export function getExposedAvailableTools(server: McpServerConfigUser): McpToolConfig[] {
  return server.tools.filter((t) => t.exposed && t.available);
}
