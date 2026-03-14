export const VIEWER_FONTS = {
  sans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  mono: "'SF Mono', Consolas, monospace"
};

export const VIEWER_COLORS = {
  bg: '#FFFFFF',
  panelBg: '#FAFBFC',
  headerBg: '#F8FAFC',
  b0: '#F1F5F9',
  b1: '#E2E8F0',
  b2: '#E4E4E7',
  t0: '#0F172A',
  t1: '#1E293B',
  t2: '#64748B',
  t3: '#94A3B8',
  t4: '#A1A1AA',
  sel: '#EFF6FF',
  selBorder: '#3B82F6'
};

export const LOG_COLORS = [
  { fg: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', dot: '#3B82F6' },
  { fg: '#7C3AED', bg: '#F3E8FF', border: '#DDD6FE', dot: '#8B5CF6' },
  { fg: '#059669', bg: '#ECFDF5', border: '#A7F3D0', dot: '#10B981' }
];

export const LEVEL_META: Record<string, { label: string; color: string; bg: string }> = {
  F: { label: 'F', color: '#DC2626', bg: '#FEE2E2' },
  E: { label: 'E', color: '#DC2626', bg: '#FEE2E2' },
  W: { label: 'W', color: '#D97706', bg: '#FEF3C7' },
  I: { label: 'I', color: '#2563EB', bg: '#EFF6FF' },
  D: { label: 'D', color: '#64748B', bg: '#F1F5F9' },
  T: { label: 'T', color: '#94A3B8', bg: '#F8FAFC' }
};

export function fmtSize(bytes: number): string {
  const kb = 1024;
  const mb = kb * 1024;
  if (bytes >= mb) return `${(bytes / mb).toFixed(1)} MiB`;
  if (bytes >= kb) return `${Math.round(bytes / kb)} KiB`;
  return `${bytes} B`;
}

export function sourceLabel(sourceFile: string): string {
  if (sourceFile === 'parallels-system.log') return 'prl-sys.log';
  return sourceFile;
}

export function sourceIndex(sourceFile: string): number {
  if (sourceFile === 'vm.log') return 0;
  if (sourceFile === 'parallels-system.log') return 1;
  return 2;
}

export function colorForSource(sourceFile: string) {
  return LOG_COLORS[sourceIndex(sourceFile)] ?? LOG_COLORS[0]!;
}

export function levelMeta(level: string | null): { label: string; color: string; bg: string } {
  if (!level) return LEVEL_META.I;
  return LEVEL_META[level] ?? LEVEL_META.I;
}
