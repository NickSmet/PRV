import type { TimelineOptions } from 'vis-timeline/standalone';

export type VisGroup = Record<string, unknown> & {
  id: string | number;
  /** vis-timeline DataGroup requires content; can be empty string. */
  content: string;
};

export type VisItem = Record<string, unknown> & {
  id: string | number;
  /** vis-timeline DataItem requires content; can be empty string for "invisible" items. */
  content: string;
  start: Date | string | number;
  end?: Date | string | number;
};

export type TimelinePayload = {
  groups: VisGroup[];
  items: VisItem[];
  options?: TimelineOptions;
  initialWindow?: { start: string | number | Date; end: string | number | Date };
};

/** Window info emitted by the Timeline component. */
export type TimelineWindowEvent = {
  start: Date;
  end: Date;
  startMs: number;
  endMs: number;
  spanMs: number;
  source: 'init' | 'rangechange' | 'rangechanged';
};

