import type { LogSourceRecord } from '$lib/lab/log-index/types';
import type { WorkerProgressMessage } from '$lib/lab/log-viewer/types';
import type { LogWorkspaceFile } from '$lib/lab/log-workspace/types';

export type IngestManagerConfig = {
	reportId: () => string;
	sourceKind: () => 'api' | 'fixture';
	downloadMode: string;
	maxBytes: number;
	maxLines: number;
	parseVersion: string;
	timezoneOffsetSeconds: () => number | null;
	yearHint: () => number | null;
	isFileSelected: (filename: string) => boolean;
	/** Called when a selected file's ingest reaches a parsing milestone (≥1000 rows). */
	onParsingMilestone: (filename: string) => void;
	/** Called when ingest completes for a selected file. */
	onIngestComplete: (filename: string) => void;
	/** Called on fatal worker error. */
	onError: (message: string) => void;
};

export class IngestManager {
	readonly #config: IngestManagerConfig;

	sourceRecords = $state<Record<string, LogSourceRecord>>({});
	progressByFile = $state<Record<string, string>>({});
	activeWorkers = $state<Record<string, Worker>>({});
	activeJobIds = $state<Record<string, number>>({});
	rowsWrittenByFile = $state<Record<string, number>>({});

	#nextJobId = 0;

	constructor(config: IngestManagerConfig) {
		this.#config = config;
	}

	// ---------------------------------------------------------------------------
	// Worker lifecycle
	// ---------------------------------------------------------------------------

	stopWorker(sourceFile: string) {
		const worker = this.activeWorkers[sourceFile];
		if (worker) worker.terminate();

		if (sourceFile in this.activeWorkers) {
			const nextWorkers = { ...this.activeWorkers };
			delete nextWorkers[sourceFile];
			this.activeWorkers = nextWorkers;
		}

		if (sourceFile in this.progressByFile) {
			const nextProgress = { ...this.progressByFile };
			delete nextProgress[sourceFile];
			this.progressByFile = nextProgress;
		}

		if (sourceFile in this.activeJobIds) {
			const nextJobIds = { ...this.activeJobIds };
			delete nextJobIds[sourceFile];
			this.activeJobIds = nextJobIds;
		}
	}

	stopAllWorkers() {
		for (const worker of Object.values(this.activeWorkers)) worker.terminate();
		this.activeWorkers = {};
		this.progressByFile = {};
		this.activeJobIds = {};
	}

	// ---------------------------------------------------------------------------
	// Ingest checks
	// ---------------------------------------------------------------------------

	needsIngest(file: LogWorkspaceFile, record: LogSourceRecord | null): boolean {
		if (!record) return true;
		if (record.status !== 'complete') return true;
		if (record.filePath !== file.filePath) return true;
		if (record.fileSize !== file.size) return true;
		if (record.downloadMode !== this.#config.downloadMode) return true;
		if (record.maxBytes !== this.#config.maxBytes) return true;
		if ((record.maxLines ?? null) !== this.#config.maxLines) return true;
		if (record.parseVersion !== this.#config.parseVersion) return true;
		return false;
	}

	// ---------------------------------------------------------------------------
	// Start ingest
	// ---------------------------------------------------------------------------

	startIngest(file: LogWorkspaceFile) {
		this.stopWorker(file.filename);

		const worker = new Worker(new URL('$lib/lab/log-index/worker.ts', import.meta.url), {
			type: 'module'
		});
		const jobId = ++this.#nextJobId;

		this.activeWorkers = { ...this.activeWorkers, [file.filename]: worker };
		this.activeJobIds = { ...this.activeJobIds, [file.filename]: jobId };
		this.progressByFile = { ...this.progressByFile, [file.filename]: 'Indexing…' };

		worker.addEventListener('message', (event: MessageEvent<WorkerProgressMessage>) => {
			if (this.activeJobIds[file.filename] !== jobId) return;

			if (event.data.type === 'progress') {
				this.progressByFile = { ...this.progressByFile, [file.filename]: event.data.message };
				if (event.data.phase === 'parsing') {
					this.rowsWrittenByFile = {
						...this.rowsWrittenByFile,
						[file.filename]: event.data.rowsWritten
					};
					if (event.data.rowsWritten >= 1000 && this.#config.isFileSelected(file.filename)) {
						this.#config.onParsingMilestone(file.filename);
					}
				}
				return;
			}

			this.stopWorker(file.filename);

			if (event.data.type === 'complete') {
				this.sourceRecords = { ...this.sourceRecords, [file.filename]: event.data.source };
				this.rowsWrittenByFile = { ...this.rowsWrittenByFile, [file.filename]: 0 };
				if (this.#config.isFileSelected(file.filename)) {
					this.#config.onIngestComplete(file.filename);
				}
				return;
			}

			this.#config.onError(event.data.message);
		});

		worker.addEventListener('error', (event) => {
			if (this.activeJobIds[file.filename] !== jobId) return;
			this.stopWorker(file.filename);
			this.#config.onError(event.message || 'Worker failed');
		});

		worker.postMessage({
			type: 'ingest',
			jobId,
			reportId: this.#config.reportId(),
			sourceFile: file.filename,
			filePath: file.filePath,
			fileSize: file.size,
			sourceUrl: this.#buildSourceUrl(file),
			downloadMode: this.#config.downloadMode,
			maxBytes: this.#config.maxBytes,
			maxLines: this.#config.maxLines,
			timezoneOffsetSeconds: this.#config.timezoneOffsetSeconds(),
			yearHint: this.#config.yearHint(),
			nowYear: new Date().getUTCFullYear()
		});
	}

	// ---------------------------------------------------------------------------
	// Helpers
	// ---------------------------------------------------------------------------

	#encodeFilePath(filePath: string) {
		return filePath
			.split('/')
			.map(encodeURIComponent)
			.join('/');
	}

	#buildSourceUrl(file: LogWorkspaceFile) {
		const reportId = this.#config.reportId();
		if (this.#config.sourceKind() === 'api') {
			return `/api/reports/${encodeURIComponent(reportId)}/files/${this.#encodeFilePath(file.filePath)}?mode=${this.#config.downloadMode}&maxBytes=${this.#config.maxBytes}`;
		}
		return `/lab/fixtures/${encodeURIComponent(reportId)}/files/${encodeURIComponent(file.filePath)}?mode=${this.#config.downloadMode}&maxBytes=${this.#config.maxBytes}`;
	}

	// ---------------------------------------------------------------------------
	// Lifecycle
	// ---------------------------------------------------------------------------

	destroy() {
		this.stopAllWorkers();
	}
}
