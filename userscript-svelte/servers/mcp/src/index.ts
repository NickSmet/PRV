import 'dotenv/config';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  EXECUTE_REPORT_CODE_DESCRIPTION,
  EXECUTE_REPORT_CODE_SCHEMA,
  handleExecuteReportCode,
} from './executeReportCode';

const server = new McpServer({
  name: 'prv-reportus',
  version: '0.1.0'
});

// execute_report_code — single code-execution tool for AI report analysis
// Uses 4-arg form (name, description, schema, handler) for the rich tool description.
// Cast needed because McpServer's generic inference is too deep for TS.
(server.tool as Function)(
  'execute_report_code',
  EXECUTE_REPORT_CODE_DESCRIPTION,
  EXECUTE_REPORT_CODE_SCHEMA,
  async (args: { reportId: string; code: string; timeoutMs?: number; maxOutputChars?: number }) =>
    handleExecuteReportCode(args),
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
