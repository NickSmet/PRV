function unquote(v: string): string {
  const s = v.trim();
  if (s.length >= 2 && s.startsWith('"') && s.endsWith('"')) return s.slice(1, -1);
  if (s.length >= 2 && s.startsWith("'") && s.endsWith("'")) return s.slice(1, -1);
  return s;
}

export function extractLeadingBracketTags(message: string): { tags: string[]; rest: string } {
  let rest = message.trimStart();
  const tags: string[] = [];

  while (rest.startsWith('[')) {
    const end = rest.indexOf(']');
    if (end <= 1) break;
    const tag = rest.slice(1, end).trim();
    if (!tag) break;
    tags.push(tag);
    rest = rest.slice(end + 1).trimStart();
  }

  return { tags, rest };
}

export function extractDiffFields(message: string): Record<string, string> | null {
  const m = /(?:^| )(?:diff:|VmCfgCommitDiff:|VmCfgAtomicEditDiff:)\s*Key:\s*'([^']+)'\s*,\s*New value:\s*'([^']*)'\s*,\s*Old value:\s*'([^']*)'/.exec(
    message
  );
  if (!m) return null;
  return { diffKey: m[1], newValue: m[2], oldValue: m[3] };
}

// Parse `Message data: Key=Value; Key2="Value with spaces"; ...`
export function extractGuiMessageDataFields(message: string): Record<string, string> | null {
  const prefix = 'Message data:';
  const idx = message.indexOf(prefix);
  if (idx < 0) return null;

  const payload = message.slice(idx + prefix.length).trim();
  if (!payload) return null;

  const whitelist = new Set(['Code', 'Type', 'IssuerId', 'Short', 'Long', 'Answers']);
  const out: Record<string, string> = {};

  const re = /\b([A-Za-z][A-Za-z0-9_]*)=("(?:[^"\\]|\\.)*"|\{[^}]*\}|[^;]*)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(payload))) {
    const key = match[1];
    if (!whitelist.has(key)) continue;
    const rawVal = match[2] ?? '';
    const val = unquote(rawVal).trim();
    if (key === 'Code') out.guiCode = val;
    else if (key === 'Type') out.guiType = val;
    else if (key === 'IssuerId') out.guiIssuerId = val;
    else if (key === 'Short') out.guiShort = val;
    else if (key === 'Long') out.guiLong = val;
    else if (key === 'Answers') out.guiAnswers = val;
  }

  return Object.keys(out).length ? out : null;
}

