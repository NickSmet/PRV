export function shortHomePath(path?: string): string {
  if (!path) return '—';
  // /Users/<name>/... -> ~/
  return path.replace(/^\/Users\/[^/]+\//, '~/');
}

export function parseRegisteredDate(input?: string): Date | null {
  if (!input) return null;
  // Common report format: "YYYY-MM-DD HH:mm:ss" (local)
  const isoish = input.includes('T') ? input : input.replace(' ', 'T');
  const d = new Date(isoish);
  return Number.isFinite(d.getTime()) ? d : null;
}

export function timeAgo(input?: string, now = new Date()): string | null {
  const d = parseRegisteredDate(input);
  if (!d) return null;

  const ms = now.getTime() - d.getTime();
  const days = Math.floor(ms / 86_400_000);

  if (!Number.isFinite(days)) return null;
  if (days < 0) return 'in future';
  if (days < 1) return 'today';
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

