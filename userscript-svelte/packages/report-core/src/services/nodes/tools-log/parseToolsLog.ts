/**
 * Parse tools.log (Windows Parallels Tools installation log)
 *
 * Extracts key installation events, detects issues, and identifies KB article references.
 */

export interface ToolsLogEntry {
  timestamp: string;
  message: string;
}

export interface ToolsLogSummary {
  isWindows: boolean;
  status: 'success' | 'warning' | 'error' | 'empty';
  entries: ToolsLogEntry[];
  hasCorruptRegistry?: boolean;
  hasPrlDdIssue?: boolean;
  kbArticle?: string; // KB125243 for prl_dd.inf issue
}

/**
 * Parse tools.log for Windows Parallels Tools installation diagnostics
 */
export function parseToolsLog(textData: string, guestOsType?: string): ToolsLogSummary | null {
  const isWindows = guestOsType ? /Windows/i.test(guestOsType) : true;

  if (!textData || textData.trim().length === 0) {
    return {
      isWindows,
      status: 'empty',
      entries: []
    };
  }

  try {
    const lines = textData.split('\n');

    // Check last 1000 chars for overall status
    const last1000chars = textData.slice(textData.length - 1000);
    let status: 'success' | 'warning' | 'error' = 'warning';
    let toolsSuccess = false;

    if (last1000chars.match(/successful/i)) {
      status = 'success';
      toolsSuccess = true;
    } else if (last1000chars.match(/FatalError/i)) {
      status = 'error';
    }

    // Parse log entries
    const entries: ToolsLogEntry[] = [];
    const lineRegex = /(?<dateString>\d\d-\d\d \d\d:\d\d:\d\d).*WIN_TOOLS_SETUP\](?<message>.*)/;

    // Message interpretation rules
    const linesInterpreter: Record<string, string> = {
      '.*Installation type ([A-Z]+) detected': '$1',
      ' Installer exited with error code 3010: The requested operation is successful.*':
        'Installation successful!',
      ' Setup finished with code 3010 \\(0xbc2\\)': 'Installation successful!',
      ' The requested operation is successful': 'Installation successful!',
      ' Setup finished with code 0 \\(0x0\\)': 'Installation successful!',
      ' Setup finished with code 1641 \\(0x669\\)': 'Installation successful!',
      ' \\*{14} Setup mode: UPDATE from version (\\d\\d\\.\\d\\.\\d\\.\\d{5})': 'Updating from $1',
      ' \\*{14} Setup mode: EXPRESS INSTALL.': 'Original installation.',
      ' \\*{14} Setup mode: INSTALL.': 'Manual installation.',
      ' \\*{14} Setup mode: REINSTALL': 'Reinstalling.',
      ' Setup completed with code 1603': 'Installation failed.'
    };

    for (const line of lines) {
      const lineMatch = lineRegex.exec(line);
      if (!lineMatch?.groups) continue;

      const { dateString, message } = lineMatch.groups;
      let interpretedMessage = message;

      // Apply interpretation rules
      for (const [regexPattern, replacement] of Object.entries(linesInterpreter)) {
        const re = new RegExp(regexPattern);
        if (interpretedMessage.match(re)) {
          interpretedMessage = interpretedMessage.replace(re, replacement);
          entries.push({
            timestamp: dateString,
            message: interpretedMessage
          });
          break;
        }
      }
    }

    // Check for specific KB article issues
    const last300Lines = lines.slice(-300).join('\n');
    const last30Lines = lines.slice(-30).join('\n');

    const hasCorruptRegistry = /configuration registry database is corrupt/i.test(last300Lines);
    const hasPrlDdIssue = /prl_dd\.inf/i.test(last30Lines) && !toolsSuccess;

    return {
      isWindows,
      status,
      entries,
      hasCorruptRegistry,
      hasPrlDdIssue,
      kbArticle: hasPrlDdIssue ? 'KB125243' : undefined
    };
  } catch (error) {
    console.error('[parseToolsLog] Parse error:', error);
    return null;
  }
}
