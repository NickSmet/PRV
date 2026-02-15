import type { VirtualNetwork } from '@prv/report-core';

export type NetTypeShort = 'Shared' | 'Host-Only' | 'Bridged' | 'Unknown';

export function netTypeShort(net: VirtualNetwork): NetTypeShort {
  const name = (net.name || '').toLowerCase();

  if (name.includes('shared')) return 'Shared';
  if (name.includes('host only') || name.includes('host-only') || name.includes('hostonly')) return 'Host-Only';
  if (name.includes('bridged')) return 'Bridged';
  return 'Unknown';
}

export function netTypeLong(short: NetTypeShort): string {
  switch (short) {
    case 'Shared':
      return 'Shared Networking';
    case 'Host-Only':
      return 'Host Only Networking';
    case 'Bridged':
      return 'Bridged Networking';
    default:
      return 'Unknown';
  }
}

export function maskSuffix(mask?: string): string | null {
  if (!mask) return null;
  const parts = mask.split('.');
  if (parts.length === 4) return parts[3] || null;
  return mask;
}

export function isEnabled(v?: string): boolean | null {
  if (v == null) return null;
  const s = v.trim().toLowerCase();
  if (s === '1' || s === 'true' || s === 'yes') return true;
  if (s === '0' || s === 'false' || s === 'no') return false;
  return null;
}

