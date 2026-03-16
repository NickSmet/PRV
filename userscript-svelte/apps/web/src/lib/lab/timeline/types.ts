export type TimelineSeverity = 'info' | 'warn' | 'danger';

export type LogRowLocator = {
  sourceFile: string;
  rowId?: string;
  lineNo?: number;
  tsWallMs?: number;
};

export type TimelineEvent = {
  id: string;
  ruleId: string;
  sourceFile: string;
  category: string;
  severity: TimelineSeverity;
  start: Date;
  end?: Date;
  label: string;
  detail?: string;
  startRef: LogRowLocator | null;
  endRef?: LogRowLocator | null;
  rawRef?: { line: number };
};
