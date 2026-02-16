import type { GuestNetworkAdapter, GuestNetworkDrive } from '@prv/report-core';

export type GuestAdapterRole = 'primary' | 'vpn' | 'other';

export function adapterRole(adapter: GuestNetworkAdapter): GuestAdapterRole {
  const desc = (adapter.description || '').toLowerCase();

  if (desc.includes('fortinet') || desc.includes('vpn')) return 'vpn';
  if (desc.includes('parallels') || desc.includes('virtio') || desc.includes('prl')) return 'primary';

  return 'other';
}

export function roleLabel(role: GuestAdapterRole): string {
  if (role === 'vpn') return 'VPN';
  if (role === 'primary') return 'PRIMARY';
  return 'ADAPTER';
}

export function roleBadgeClasses(role: GuestAdapterRole): string {
  if (role === 'vpn') return 'border-amber-200 bg-amber-50 text-amber-700';
  if (role === 'primary') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  return 'border-border bg-muted/20 text-muted-foreground';
}

export function driveStatusColor(status?: GuestNetworkDrive['status']): string {
  if (status === 'OK' || !status) return 'bg-emerald-500';
  if (status === 'Disconnected' || status === 'Unavailable') return 'bg-rose-500';
  if (status === 'Reconnecting') return 'bg-amber-500';
  return 'bg-slate-300';
}

export function driveStatusBadge(status?: GuestNetworkDrive['status'], raw?: string): {
  label: string;
  classes: string;
} {
  const s = status ?? 'Other';
  if (s === 'OK') return { label: 'OK', classes: 'border-emerald-200 bg-emerald-50 text-emerald-700' };
  if (s === 'Disconnected') return { label: 'Disconnected', classes: 'border-rose-200 bg-rose-50 text-rose-700' };
  if (s === 'Unavailable') return { label: 'Unavailable', classes: 'border-rose-200 bg-rose-50 text-rose-700' };
  if (s === 'Reconnecting') return { label: 'Reconnecting', classes: 'border-amber-200 bg-amber-50 text-amber-700' };
  return { label: raw || 'Other', classes: 'border-border bg-muted/20 text-muted-foreground' };
}

