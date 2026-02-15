import type { ProcessItem, ProcessType } from '../../../services/parseAllProcesses';

export type SortKey = 'name' | 'cpu' | 'mem' | 'user';
export type SortDir = 'asc' | 'desc';
export type TypeFilter = 'all' | ProcessType;

export function cpuColor(v: number): string {
  if (v >= 30) return '#EF4444';
  if (v >= 10) return '#F59E0B';
  if (v >= 1) return '#3B82F6';
  return '#94A3B8';
}

export function memColor(v: number): string {
  if (v >= 4) return '#EF4444';
  if (v >= 2) return '#F59E0B';
  if (v >= 0.5) return '#3B82F6';
  return '#94A3B8';
}

export function typeLabel(t: ProcessType): string {
  switch (t) {
    case 'parallels-tools':
      return 'Parallels Tools';
    case 'windows-store-app':
      return 'Windows App';
    case 'microsoft-component':
      return 'Microsoft';
    case 'third-party-app':
      return 'Third‑party App';
    case 'macos-app':
      return 'macOS App';
    case 'system':
      return 'System';
    case 'service':
      return 'Service';
    default:
      return 'Other';
  }
}

export function typeBadgeClasses(t: ProcessType): string {
  // Tailwind-ish palette inspired by the mock.
  switch (t) {
    case 'parallels-tools':
      return 'border-cyan-200 bg-cyan-50 text-cyan-800';
    case 'windows-store-app':
      return 'border-indigo-200 bg-indigo-50 text-indigo-700';
    case 'microsoft-component':
      return 'border-blue-200 bg-blue-50 text-blue-700';
    case 'third-party-app':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    case 'macos-app':
      return 'border-sky-200 bg-sky-50 text-sky-700';
    case 'system':
      return 'border-slate-200 bg-slate-50 text-slate-700';
    case 'service':
      return 'border-violet-200 bg-violet-50 text-violet-700';
    default:
      return 'border-border bg-muted/20 text-muted-foreground';
  }
}

export function typeCounts(items: ProcessItem[]): Record<TypeFilter, number> {
  const c: Record<TypeFilter, number> = {
    all: items.length,
    'parallels-tools': 0,
    'windows-store-app': 0,
    'microsoft-component': 0,
    'macos-app': 0,
    'third-party-app': 0,
    system: 0,
    service: 0,
    other: 0
  };

  for (const it of items) {
    c[it.type] = (c[it.type] || 0) + 1;
  }

  return c;
}

export function sortItems(items: ProcessItem[], key: SortKey, dir: SortDir): ProcessItem[] {
  const list = [...items];

  list.sort((a, b) => {
    const mul = dir === 'desc' ? -1 : 1;
    if (key === 'cpu') return (a.cpu - b.cpu) * mul;
    if (key === 'mem') return (a.mem - b.mem) * mul;
    if (key === 'user') return a.user.localeCompare(b.user) * mul;
    // name
    return a.displayName.localeCompare(b.displayName) * mul;
  });

  return list;
}

