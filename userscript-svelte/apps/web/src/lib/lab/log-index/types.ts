export type LogKind = 'entry' | 'continuation' | 'repeat' | 'meta' | 'unknown';

export type LogLevel = 'F' | 'W' | 'I' | 'D';

export type YearInferredFrom =
  | 'parallels-build'
  | 'parallels-daily'
  | 'tools-inner'
  | 'hint'
  | 'default'
  | 'clamped';

export type LogRow = {
  id: string; // `${sourceFile}:${lineNo}`
  reportId: string;
  sourceFile: string;
  lineNo: number; // 1-based within parsed payload

  kind: LogKind;

  tsWallMs: number | null;
  tsRaw: string | null;

  level: LogLevel | null;
  component: string | null;
  pid: number | null;
  ctx: string | null;

  raw: string;
  message: string;
  tags: string[];

  parentId: string | null;
  repeatCount: number | null;

  fields: Record<string, string | number | boolean | null> | null;
};

export type ParseStats = {
  totalRows: number;
  kindCounts: Record<LogKind, number>;
  entryWithTs: number;
  unknownRate: number; // 0..1
  topComponents: Array<{ component: string; count: number }>;
  topTags: Array<{ tag: string; count: number }>;
};

export type ParseResult = {
  rows: LogRow[];
  stats: ParseStats;
  baseYear: number;
  yearInferredFrom: YearInferredFrom;
  warnings: string[];
};

export type LogSourceStatus = 'pending' | 'parsing' | 'complete' | 'error';

export type LogSourceRecord = {
  sourceKey: string;
  reportId: string;
  sourceFile: string;
  filePath: string;
  fileSize: number | null;
  downloadMode: 'head' | 'tail';
  maxBytes: number;
  maxLines: number | null;
  truncated: boolean;
  trimmedFirstLine: boolean;
  baseYear: number | null;
  yearInferredFrom: YearInferredFrom | null;
  timezoneOffsetSeconds: number | null;
  parseVersion: string;
  status: LogSourceStatus;
  warnings: string[];
  rowCount: number;
  stats: ParseStats;
  createdAt: number;
  updatedAt: number;
  lastJobId: number;
};

export type StoredLogRow = LogRow & {
  rowKey: string;
  sourceKey: string;
};
