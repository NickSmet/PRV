import type { TimelineEvent } from './types';
type TimelineOptions = Record<string, unknown>;

type VisGroup = Record<string, unknown> & { id: string; content: string; nestedGroups?: string[]; showNested?: boolean; className?: string };
type VisItem = Record<string, unknown> & {
  id: string;
  group: string;
  start: Date;
  end?: Date;
  content: string;
  className?: string;
};

export type BuiltTimeline = {
  groups: VisGroup[];
  items: VisItem[];
  options: TimelineOptions;
  initialWindow?: { start: Date; end: Date };
};

function categoryKey(category: string): string {
  const c = category.trim().toLowerCase();
  if (c.includes('app')) return 'apps';
  if (c.includes('gui')) return 'gui';
  if (c.includes('config')) return 'config';
  return c.replace(/\s+/g, '-');
}

function cssSafeFileKey(filename: string): string {
  return filename
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9._-]/g, '-');
}

export function buildVisTimeline(events: TimelineEvent[]): BuiltTimeline {
  const POINT_AS_RANGE_MS = 1000;
  const groups: VisGroup[] = [];
  const items: VisItem[] = [];

  const byFile = new Map<string, TimelineEvent[]>();
  for (const ev of events) {
    const arr = byFile.get(ev.sourceFile) ?? [];
    arr.push(ev);
    byFile.set(ev.sourceFile, arr);
  }

  const fileKeys = Array.from(byFile.keys()).sort((a, b) => a.localeCompare(b));
  for (const file of fileKeys) {
    const fileId = `file:${file}`;
    const fileClass = `prv-tl-group prv-tl-group--file prv-tl-group--${cssSafeFileKey(file)}`;

    const fileEvents = byFile.get(file) ?? [];
    const byCategory = new Map<string, TimelineEvent[]>();
    for (const ev of fileEvents) {
      const arr = byCategory.get(ev.category) ?? [];
      arr.push(ev);
      byCategory.set(ev.category, arr);
    }

    const nested: string[] = [];
    const categories = Array.from(byCategory.keys()).sort((a, b) => a.localeCompare(b));
    for (const cat of categories) {
      const catId = `${fileId}:${categoryKey(cat)}`;
      nested.push(catId);
      groups.push({
        id: catId,
        content: cat,
        className: `prv-tl-group prv-tl-group--cat prv-tl-group--${categoryKey(cat)}`
      });

      for (const ev of (byCategory.get(cat) ?? [])) {
        const startMs = ev.start.getTime();
        const rawEnd = ev.end ?? null;
        const endMs = rawEnd ? rawEnd.getTime() : startMs;
        const end = rawEnd && endMs > startMs ? rawEnd : new Date(startMs + POINT_AS_RANGE_MS);
        items.push({
          id: ev.id,
          group: catId,
          start: ev.start,
          end,
          content: ev.label,
          className: `prv-tl-item prv-tl-item--${ev.severity} prv-tl-item--${categoryKey(ev.category)}`,
        });
      }
    }

    groups.push({
      id: fileId,
      content: file,
      nestedGroups: nested,
      showNested: true,
      className: fileClass
    });
  }

  // Initial window: fit to events with padding
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (const ev of events) {
    const s = ev.start.getTime();
    const e = (ev.end ?? ev.start).getTime();
    if (s < min) min = s;
    if (e > max) max = e;
  }

  const padMs = 5 * 60 * 1000;
  const initialWindow =
    Number.isFinite(min) && Number.isFinite(max) && max > min
      ? { start: new Date(min - padMs), end: new Date(max + padMs) }
      : undefined;

  const options: TimelineOptions = {
    stack: true,
    zoomKey: 'ctrlKey',
    multiselect: true,
    tooltip: { followMouse: true },
    orientation: 'top',
    groupOrder: 'content'
  };

  return { groups, items, options, initialWindow };
}
