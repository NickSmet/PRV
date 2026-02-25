/**
 * Sandbox execution engine for execute_report_code.
 *
 * Runs agent-supplied JavaScript in a Node.js `vm` context with:
 *   - `data`   — pre-loaded ReportView (synchronous)
 *   - `report` — API for raw file access (async)
 *   - `ctx`    — helpers (preview, etc.)
 *
 * Ported from Jira-MCP-Reader/src/sandbox/execute-jira-code.ts
 */

import vm from 'node:vm';
import { preview, schema, cloneIncludingHidden } from './ctxHelpers';

export interface SandboxOptions {
  timeoutMs: number;
  maxOutputChars: number;
}

export interface SandboxResult {
  result: unknown;
  logs: string[];
}

function stringifyLogArg(v: unknown): string {
  if (typeof v === 'string') return v;
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}

export async function executeReportCodeSandbox(
  code: string,
  data: unknown,
  report: unknown,
  options: SandboxOptions,
): Promise<SandboxResult> {
  const logs: string[] = [];

  const ctx = { preview, schema, raw: cloneIncludingHidden };

  const sandboxConsole = {
    log: (...args: unknown[]) => logs.push(args.map(stringifyLogArg).join(' ')),
    warn: (...args: unknown[]) => logs.push(args.map(stringifyLogArg).join(' ')),
    error: (...args: unknown[]) => logs.push(args.map(stringifyLogArg).join(' ')),
  };

  const context = vm.createContext({
    data,
    report,
    ctx,
    console: sandboxConsole,
    // Safe built-ins
    JSON,
    Math,
    Date,
    Array,
    Object,
    String,
    Number,
    Boolean,
    RegExp,
    Map,
    Set,
  });

  const wrapped = `
"use strict";
(function () {
${code}
  if (typeof main !== "function") {
    throw new Error("Sandbox code must define function main(data, report, ctx)");
  }
  return main(data, report, ctx);
})()
`.trim();

  const script = new vm.Script(wrapped, { filename: 'execute_report_code.vm.js' });
  const vmResult = script.runInContext(context, { timeout: options.timeoutMs });

  // Await in case main() is async (e.g., uses report.file())
  const result = await Promise.race([
    Promise.resolve(vmResult),
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error(`execute_report_code timeout after ${options.timeoutMs}ms`)),
        options.timeoutMs,
      ),
    ),
  ]);

  return { result, logs };
}
