import type { HostAudioDeviceType, HostInputRole, HostInputTransport, HostUsbSpeed } from '@prv/report-core';

export function fmtBytes(bytes: number | null): string {
  if (bytes === null) return '—';
  if (bytes === 0) return '0 B';
  const k = 1024;
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'] as const;
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(k)));
  const value = bytes / Math.pow(k, i);
  return `${value.toFixed(i >= 3 ? 2 : 0)} ${units[i]}`;
}

export function fmtMb(mb: number | null): string {
  if (mb === null) return '—';
  if (mb >= 1024) return `${Math.round(mb / 1024)} GB`;
  return `${mb} MB`;
}

export function usbSpeedLabel(speed: HostUsbSpeed): string {
  switch (speed) {
    case 'low':
      return '1.5 Mbps';
    case 'full':
      return '12 Mbps';
    case 'high':
      return '480 Mbps';
    case 'super':
      return '5 Gbps';
    default:
      return speed;
  }
}

export function usbSpeedVariant(speed: HostUsbSpeed): 'muted' | 'outline' | 'secondary' | 'default' {
  switch (speed) {
    case 'super':
      return 'secondary';
    case 'high':
      return 'default';
    case 'full':
      return 'outline';
    case 'low':
    case 'unknown':
    default:
      return 'muted';
  }
}

export function transportVariant(transport: HostInputTransport): 'muted' | 'outline' | 'secondary' | 'default' {
  switch (transport) {
    case 'USB':
      return 'outline';
    case 'Bluetooth':
    case 'Bluetooth Low Energy':
      return 'secondary';
    case 'FIFO':
    case 'SPI':
    case 'unknown':
    default:
      return 'muted';
  }
}

export function audioVariant(type: HostAudioDeviceType): 'muted' | 'outline' | 'secondary' | 'default' {
  switch (type) {
    case 'builtin':
      return 'outline';
    case 'bluetooth':
      return 'secondary';
    case 'virtual':
      return 'default';
    case 'usb':
      return 'secondary';
    case 'continuity':
      return 'secondary';
    case 'monitor':
      return 'outline';
    case 'mute':
      return 'muted';
    default:
      return 'muted';
  }
}

export function roleLabel(role: HostInputRole): string {
  switch (role) {
    case 'combo':
      return 'KB+Mouse';
    case 'keyboard':
      return 'Keyboard';
    case 'mouse':
      return 'Mouse';
    case 'gamepad':
      return 'Gamepad';
    default:
      return 'Unknown';
  }
}
