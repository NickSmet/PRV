/**
 * Unit formatting helpers (ported from legacy RV userscript conventions).
 *
 * Goals:
 * - Keep parsers mostly string-in/string-out.
 * - Convert numeric fields to human-friendly strings at the builder/UI layer.
 */

export function humanFileSize(bytes: number, si: boolean): string {
  const thresh = si ? 1000 : 1024;
  if (!Number.isFinite(bytes)) return '—';
  if (Math.abs(bytes) < thresh) return `${bytes} B`;

  const units = si
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];

  let u = -1;
  let value = bytes;
  do {
    value /= thresh;
    ++u;
  } while (Math.abs(value) >= thresh && u < units.length - 1);

  return `${value.toFixed(1)} ${units[u]}`;
}

function isNumericString(value: string): boolean {
  return /^\d+(\.\d+)?$/.test(value.trim());
}

/**
 * Convert a "MB" numeric string to a human-readable size.
 * In CurrentVm, disk sizes are commonly reported as megabytes.
 */
export function formatMbytes(value: string | undefined, si = false): string | undefined {
  const raw = value?.trim();
  if (!raw) return undefined;
  if (!isNumericString(raw)) return raw; // already human-readable (e.g. "64 GB")

  const mbytes = Number(raw);
  if (!Number.isFinite(mbytes)) return raw;
  return humanFileSize(mbytes * 1024 * 1024, si);
}

/**
 * CurrentVm HDD interface mapping.
 * Legacy: { 0:'IDE', 1:'SCSI', 2:'SATA', 3:'NVMe' }
 */
export function formatHddInterface(value: string | undefined): string | undefined {
  const raw = value?.trim();
  if (!raw) return undefined;

  const map: Record<string, string> = {
    '0': 'IDE',
    '1': 'SCSI',
    '2': 'SATA',
    '3': 'NVMe'
  };

  // If already a name (e.g. "NVMe"), keep it.
  if (!isNumericString(raw)) return raw;
  return map[raw] ?? raw;
}

