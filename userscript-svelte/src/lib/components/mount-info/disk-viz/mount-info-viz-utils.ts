export function fmtGi(gi: number): string {
  if (!Number.isFinite(gi)) return '—';
  if (gi >= 1024) return `${(gi / 1024).toFixed(1)} TB`;
  if (gi >= 1) return `${Math.round(gi)} GB`;
  if (gi >= 0.001) return `${Math.round(gi * 1024)} MB`;
  return `${Math.round(gi * 1024 * 1024)} KB`;
}

export function statusColor(pct: number): { bg: string; text: string; dot: string; bar: string } {
  if (pct >= 90) return { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500', bar: 'bg-red-500' };
  if (pct >= 70) return { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500', bar: 'bg-amber-500' };
  return { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500', bar: 'bg-blue-500' };
}

