import type { LogRow, LogSourceRecord } from '$lib/lab/log-index/types';
import type { LogRowLocator } from '$lib/lab/timeline/types';
import type { LogWorkspaceFile, LogWorkspacePageData } from '$lib/lab/log-workspace/types';

export type LogViewerFile = LogWorkspaceFile;

export type LogViewerPageData = LogWorkspacePageData;

export type WorkerProgressMessage =
  | {
      type: 'progress';
      jobId: number;
      phase: 'fetching' | 'parsing';
      rowsWritten: number;
      message: string;
    }
  | {
      type: 'complete';
      jobId: number;
      source: LogSourceRecord;
    }
  | {
      type: 'error';
      jobId: number;
      message: string;
    };

export type QueryMessage =
  | {
      type: 'result';
      jobId: number;
      result: { totalRows: number; totalMatches: number; clipped: boolean; windowStart: number; rows: LogRow[] };
    }
  | {
      type: 'find';
      jobId: number;
      result: {
        query: string;
        /** Capped at MAX_FIND_HIGHLIGHTS — use totalMatchCount for the display total. */
        matchIndexes: number[];
        /** Capped at MAX_FIND_HIGHLIGHTS — parallel to matchIndexes. */
        matchRowIds: string[];
        /** Active match ordinal in the full (uncapped) match list. */
        activeOrdinal: number;
        /** Global ordinal of matchIndexes[0] within the full match list. */
        windowStartOrdinal: number;
        /** True total count before the cap is applied. */
        totalMatchCount: number;
      };
    }
  | {
      type: 'locate';
      jobId: number;
      result: { rowIndex: number; row: LogRow | null; locator?: LogRowLocator };
    }
  | { type: 'error'; jobId: number; message: string };

export type ViewerStats = Record<string, number>;

export type ViewerVirtualState = {
  total: number;
  start: number;
  end: number;
  rows: LogRow[];
  topPad: number;
  bottomPad: number;
};

export type ViewerPlaceholderState = {
  start: number;
  end: number;
  count: number;
  topPad: number;
  bottomPad: number;
} | null;
