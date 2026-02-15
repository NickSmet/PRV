import type { ProcessType } from './parseAllProcesses';

export function detectAppNameFromCommand(command: string): string | null {
  // Covers:
  // - /Applications/Foo.app/Contents/MacOS/Foo
  // - /System/Applications/Foo.app/Contents/MacOS/Foo
  // - /System/Library/CoreServices/Foo.app/Contents/MacOS/Foo
  const m = command.match(
    /\/(?:Applications|System\/Applications|System\/Library\/CoreServices)\/([^/]+\.app)\//
  );
  return m?.[1] ?? null;
}

export function isHelperCommand(command: string): boolean {
  return /Helper\s*\(/.test(command) || /\/Frameworks\//.test(command);
}

/**
 * Host (macOS) process type classification based on the command path.
 *
 * NOTE: This is used by the ps aux parser only. Guest (Windows) classification
 * lives in the GuestCommands UI layer.
 */
export function classifyHostProcessType(command: string, appName: string | null): ProcessType {
  if (appName) {
    if (command.startsWith('/System/Applications/') || command.startsWith('/System/Library/CoreServices/')) {
      return 'macos-app';
    }
    if (command.startsWith('/Applications/')) {
      return 'third-party-app';
    }
    return 'third-party-app';
  }

  // Split "system" vs "service" roughly like the prototype.
  if (command.startsWith('/System/')) return 'system';
  if (command.startsWith('/sbin/')) return 'system';
  if (command.startsWith('/usr/libexec/') || command.startsWith('/usr/sbin/') || command.startsWith('/usr/bin/')) {
    return 'service';
  }
  if (command.includes(' -daemon')) return 'service';

  return 'other';
}

export function extractShortNameFromCommand(command: string): string {
  const appMatch = command.match(/\/([^/]+)\.app\b/);
  if (appMatch?.[1]) return appMatch[1];

  const firstToken = command.trim().split(/\s+/)[0] || command;
  const parts = firstToken.split('/').filter(Boolean);
  return parts[parts.length - 1] || firstToken;
}

export function displayNameFor(command: string, type: ProcessType, appName: string | null): string {
  if ((type === 'macos-app' || type === 'third-party-app') && appName) return appName;

  const firstToken = command.trim().split(/\s+/)[0] || command;
  if (firstToken.startsWith('/')) {
    const base = firstToken.split('/').filter(Boolean).pop();
    if (base) return base;
  }

  return firstToken;
}

