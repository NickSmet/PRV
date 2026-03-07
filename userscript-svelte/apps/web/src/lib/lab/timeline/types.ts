export type TimelineSeverity = 'info' | 'warn' | 'danger';

export type TimelineEvent = {
  id: string;
  sourceFile: string;
  category: string;
  severity: TimelineSeverity;
  start: Date;
  end?: Date;
  label: string;
  detail?: string;
  rawRef?: { line: number };
};

