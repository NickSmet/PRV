export function parseTsRaw(
  tsRaw: string,
  baseYear: number
): number | null {
  const m = /^(\d\d)-(\d\d) (\d\d):(\d\d):(\d\d)\.(\d{3})$/.exec(tsRaw);
  if (!m) return null;

  const month = Number(m[1]);
  const day = Number(m[2]);
  const hh = Number(m[3]);
  const mm = Number(m[4]);
  const ss = Number(m[5]);
  const ms = Number(m[6]);

  if (
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    !Number.isFinite(hh) ||
    !Number.isFinite(mm) ||
    !Number.isFinite(ss) ||
    !Number.isFinite(ms)
  ) {
    return null;
  }

  const wallMs = Date.UTC(baseYear, month - 1, day, hh, mm, ss, ms);
  if (!Number.isFinite(wallMs)) return null;
  return wallMs;
}
