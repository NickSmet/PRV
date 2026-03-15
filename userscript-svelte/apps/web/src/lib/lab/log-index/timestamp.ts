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
    !Number.isFinite(ms) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    hh < 0 ||
    hh > 23 ||
    mm < 0 ||
    mm > 59 ||
    ss < 0 ||
    ss > 59 ||
    ms < 0 ||
    ms > 999
  ) {
    return null;
  }

  const wallMs = Date.UTC(baseYear, month - 1, day, hh, mm, ss, ms);
  if (!Number.isFinite(wallMs)) return null;
  const wallDate = new Date(wallMs);
  if (
    wallDate.getUTCFullYear() !== baseYear ||
    wallDate.getUTCMonth() !== month - 1 ||
    wallDate.getUTCDate() !== day ||
    wallDate.getUTCHours() !== hh ||
    wallDate.getUTCMinutes() !== mm ||
    wallDate.getUTCSeconds() !== ss ||
    wallDate.getUTCMilliseconds() !== ms
  ) {
    return null;
  }
  return wallMs;
}
