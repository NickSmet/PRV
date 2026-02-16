import type { DisplayInfo, GpuInfo } from '../../../services/parseMoreHostInfo';

export function resLabel(w: number, h: number): string {
  return `${w}×${h}`;
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

export function aspectRatio(w: number, h: number): string {
  if (!w || !h) return '—';
  const d = gcd(w, h);
  const aw = Math.round(w / d);
  const ah = Math.round(h / d);

  // Common simplifications (matching prototype vibe)
  if (aw === 64 && ah === 27) return '21:9';
  if (aw === 32 && ah === 9) return '32:9';
  if (aw === 16 && ah === 9) return '16:9';
  if (aw === 16 && ah === 10) return '16:10';
  if (aw === 756 && ah === 491) return '~3:2';

  if (aw > 20 && ah > 0) return `~${(aw / ah).toFixed(1)}:1`;
  return `${aw}:${ah}`;
}

export function scaleFactor(physical: number, logical: number): string | null {
  if (!physical || !logical) return null;
  const factor = physical / logical;
  if (Math.abs(factor - 2) < 0.1) return '2×';
  if (Math.abs(factor - 3) < 0.1) return '3×';
  if (Math.abs(factor - 1) < 0.05) return null;
  return `${factor.toFixed(1)}×`;
}

export function gpuTypeLabel(type?: GpuInfo['type']): string {
  if (type === 'integrated') return 'Integrated';
  if (type === 'discrete') return 'Discrete';
  return 'GPU';
}

export function gpuTypeBadgeClass(type?: GpuInfo['type']): string {
  if (type === 'discrete') return 'border-amber-200 bg-amber-50 text-amber-700';
  return 'border-border bg-muted/20 text-muted-foreground';
}

export function totalDisplays(gpus: GpuInfo[]): number {
  return gpus.reduce((s, g) => s + (g.displays?.length ?? 0), 0);
}

export type DisplayMini = DisplayInfo & { renderW: number; renderH: number };

export function computeDisplayMiniatures(displays: DisplayInfo[]): DisplayMini[] {
  const pixels = displays.map((d) => (d.logicalWidth || 0) * (d.logicalHeight || 0));
  const maxPixels = Math.max(...pixels, 1);
  const refWidth = 160;

  return displays.map((d) => {
    const ratio = d.logicalHeight ? d.logicalWidth / d.logicalHeight : 1;
    const areaRatio = ((d.logicalWidth || 0) * (d.logicalHeight || 0)) / maxPixels;
    const scale = Math.sqrt(Math.max(areaRatio, 0));
    const w = refWidth * scale * (ratio > 1 ? 1 : ratio);
    const h = ratio ? w / ratio : w;
    return {
      ...d,
      renderW: Math.max(w, 40),
      renderH: Math.max(h, 25)
    };
  });
}

