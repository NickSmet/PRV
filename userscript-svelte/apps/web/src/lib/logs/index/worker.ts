import type { LogRow, LogSourceRecord } from './types';
import { createLogParser } from './parse';
import { chooseBaseYear, inferTimestampYears } from './year';
import { putRowBatch, putSourceRecord, resetSourceForIngest } from './db';

const PARSE_VERSION = 'log-index-v2';
const BATCH_SIZE = 1000;

type IngestRequest = {
  type: 'ingest';
  jobId: number;
  reportId: string;
  sourceFile: string;
  filePath: string;
  fileSize: number | null;
  sourceUrl: string;
  downloadMode: 'head' | 'tail';
  maxBytes: number;
  maxLines: number | null;
  timezoneOffsetSeconds: number | null;
  reportReceivedAt: string | null;
  yearHint: number | null | undefined;
  nowYear: number;
};

type WorkerResponse =
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

function postMessageSafe(message: WorkerResponse) {
  (self as DedicatedWorkerGlobalScope).postMessage(message);
}

function clampMaxLines(n: number | null): number | null {
  if (n == null) return null;
  if (!Number.isFinite(n)) return null;
  const v = Math.trunc(n);
  if (v <= 0) return null;
  return Math.min(v, 200_000);
}

function sliceTextByLines(
  text: string,
  mode: 'head' | 'tail',
  maxLines: number | null
): { text: string; sliced: boolean } {
  if (!maxLines) return { text, sliced: false };
  const n = clampMaxLines(maxLines);
  if (!n) return { text, sliced: false };

  if (mode === 'head') {
    let count = 0;
    for (let i = 0; i < text.length; i += 1) {
      if (text.charCodeAt(i) === 10) {
        count += 1;
        if (count >= n) return { text: text.slice(0, i), sliced: true };
      }
    }
    return { text, sliced: false };
  }

  let count = 0;
  for (let i = text.length - 1; i >= 0; i -= 1) {
    if (text.charCodeAt(i) === 10) {
      count += 1;
      if (count >= n) return { text: text.slice(i + 1), sliced: true };
    }
  }
  return { text, sliced: false };
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

async function runIngest(request: IngestRequest) {
  postMessageSafe({
    type: 'progress',
    jobId: request.jobId,
    phase: 'fetching',
    rowsWritten: 0,
    message: 'Fetching log payload…'
  });

  const response = await fetch(request.sourceUrl);
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(body || `HTTP ${response.status}`);
  }

  const truncated = response.headers.get('x-prv-truncated') === 'true';
  const trimmedFirstLine = response.headers.get('x-prv-trimmed-first-line') === 'true';
  const text = await response.text();

  const sliced = sliceTextByLines(text, request.downloadMode, request.maxLines);
  const lines = sliced.text.split(/\r?\n/);
  if (lines.length > 0 && lines[lines.length - 1] === '') lines.pop();

  const { baseYear, yearInferredFrom, warnings } = chooseBaseYear({
    text: lines.join('\n'),
    reportReceivedAt: request.reportReceivedAt,
    timezoneOffsetSeconds: request.timezoneOffsetSeconds,
    yearHint: request.yearHint,
    nowYear: request.nowYear
  });

  if (sliced.sliced) {
    warnings.push(
      `Line cap applied: parsed ${request.downloadMode === 'tail' ? 'last' : 'first'} ${clampMaxLines(request.maxLines)!.toLocaleString()} lines.`
    );
  }

  let source = await resetSourceForIngest({
    reportId: request.reportId,
    sourceFile: request.sourceFile,
    filePath: request.filePath,
    fileSize: request.fileSize,
    downloadMode: request.downloadMode,
    maxBytes: request.maxBytes,
    maxLines: request.maxLines,
    truncated,
    trimmedFirstLine,
    baseYear,
    yearInferredFrom,
    timezoneOffsetSeconds: request.timezoneOffsetSeconds,
    parseVersion: PARSE_VERSION,
    status: 'parsing',
    warnings,
    lastJobId: request.jobId
  });

  const parser = createLogParser({
    reportId: request.reportId,
    sourceFile: request.sourceFile,
    baseYear,
    yearInferredFrom,
    lineYears: inferTimestampYears(lines, baseYear)
  });

  let batch: LogRow[] = [];
  let rowsWritten = 0;

  const flushBatch = async () => {
    if (batch.length === 0) return;
    await putRowBatch(request.reportId, request.sourceFile, batch);
    rowsWritten += batch.length;
    batch = [];
    postMessageSafe({
      type: 'progress',
      jobId: request.jobId,
      phase: 'parsing',
      rowsWritten,
      message: `Indexed ${rowsWritten.toLocaleString()} rows…`
    });
  };

  // Incremental parse + IndexedDB writes to:
  // - avoid giant in-memory arrays
  // - keep IDB transactions short so query reads can proceed
  // - emit progress early (enables UI to render after first 1k rows)
  for (const line of lines) {
    batch.push(parser.pushLine(line));
    if (batch.length >= BATCH_SIZE) {
      // eslint-disable-next-line no-await-in-loop
      await flushBatch();
    }
  }

  await flushBatch();

  const finalized = parser.finalize();
  source = {
    ...source,
    baseYear: finalized.baseYear,
    yearInferredFrom: finalized.yearInferredFrom,
    status: 'complete',
    warnings,
    rowCount: finalized.stats.totalRows,
    stats: finalized.stats,
    updatedAt: Date.now(),
    lastJobId: request.jobId
  };

  await putSourceRecord(source);
  postMessageSafe({ type: 'complete', jobId: request.jobId, source });
}

self.onmessage = (event: MessageEvent<IngestRequest>) => {
  if (event.data?.type !== 'ingest') return;

  void runIngest(event.data).catch(async (error) => {
    const message = toErrorMessage(error);
    try {
      const source = await resetSourceForIngest({
        reportId: event.data.reportId,
        sourceFile: event.data.sourceFile,
        filePath: event.data.filePath,
        fileSize: event.data.fileSize,
        downloadMode: event.data.downloadMode,
        maxBytes: event.data.maxBytes,
        maxLines: event.data.maxLines,
        truncated: false,
        trimmedFirstLine: false,
        baseYear: null,
        yearInferredFrom: null,
        timezoneOffsetSeconds: event.data.timezoneOffsetSeconds,
        parseVersion: PARSE_VERSION,
        status: 'error',
        warnings: [message],
        lastJobId: event.data.jobId
      });
      await putSourceRecord({ ...source, status: 'error', warnings: [message], updatedAt: Date.now() });
    } catch {
      // ignore IndexedDB failure after the primary error
    }

    postMessageSafe({ type: 'error', jobId: event.data.jobId, message });
  });
};
