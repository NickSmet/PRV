import fs from 'node:fs/promises';
import path from 'node:path';

import { env } from '$env/dynamic/private';
import { fetchNodePayload, type NodeKey, ensureDomParser } from '@prv/report-core';
import type { ReportId, ReportusClient, ReportusFileEntry, ReportusReportIndex } from '@prv/report-api';
import { ReportusHttpError } from '@prv/report-api';

import { getFixtureReportDir } from '$lib/server/fixtures';
import { getReportusClient } from '$lib/server/reportus';

export type ReportSourceMode = 'api' | 'prefer_fixture' | 'fixture';
export type ResolvedReportSourceKind = 'api' | 'fixture';

type FixtureManifest = {
	reportId: string;
	fixtureDir: string;
	reportXmlPath: string;
	filePathByRelativePath: Map<string, string>;
	filePathByFilename: Map<string, string[]>;
	index: ReportusReportIndex;
};

export type ResolvedReportSource = {
	reportId: string;
	sourceKind: ResolvedReportSourceKind;
	mode: ReportSourceMode;
	index: ReportusReportIndex;
	client: ReportusClient;
	fixtureDir?: string;
	fetchNodePayload: (
		nodeKey: NodeKey,
		opts?: { maxBytes?: number }
	) => Promise<{ text: string; truncated: boolean; sourceFile?: ReportusFileEntry } | null>;
};

export class ReportSourceError extends Error {
	readonly status: number;

	constructor(status: number, message: string) {
		super(message);
		this.name = 'ReportSourceError';
		this.status = status;
	}
}

const REPORT_XML_CANDIDATES = ['Report.xml', 'report.xml', 'Report (1).xml'] as const;

function normalizeRelativePath(filePath: string): string {
	return filePath.replace(/\\/g, '/').replace(/^\.\/+/, '').replace(/^\/+/, '');
}

function decodeBytesToText(bytes: Uint8Array): string {
	return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
}

function extractTagText(xml: string, tagName: string): string | null {
	const match = new RegExp(`<${tagName}(\\s[^>]*)?>([\\s\\S]*?)</${tagName}>`, 'i').exec(xml);
	if (!match) return null;
	const inner = match[2] ?? '';
	const cdata = /<!\[CDATA\[([\s\S]*?)\]\]>/i.exec(inner);
	const value = (cdata ? cdata[1] : inner).trim();
	return value.length > 0 ? value : null;
}

function parseFixtureIndexMetadata(reportId: string, reportXml: string): Partial<ReportusReportIndex> {
	return {
		report_id: Number(reportId),
		report_type: extractTagText(reportXml, 'Type'),
		report_reason: extractTagText(reportXml, 'ReportReason'),
		product: extractTagText(reportXml, 'ProductName'),
		product_version: extractTagText(reportXml, 'ServerVersion') ?? extractTagText(reportXml, 'ClientVersion'),
		problem_description: extractTagText(reportXml, 'ProblemDescription'),
		computer_model: extractTagText(reportXml, 'ComputerModel'),
		server_uuid: extractTagText(reportXml, 'ServerUuid') ?? undefined
	};
}

async function findFixtureReportXmlPath(fixtureDir: string): Promise<string | null> {
	for (const candidate of REPORT_XML_CANDIDATES) {
		const fullPath = path.join(fixtureDir, candidate);
		try {
			const stat = await fs.stat(fullPath);
			if (stat.isFile()) return fullPath;
		} catch {
			// ignore
		}
	}

	return null;
}

async function buildFixtureManifest(reportId: string): Promise<FixtureManifest | null> {
	const fixtureDir = await getFixtureReportDir(reportId);
	if (!fixtureDir) return null;

	const reportXmlPath = await findFixtureReportXmlPath(fixtureDir);
	if (!reportXmlPath) return null;

	const filePathByRelativePath = new Map<string, string>();
	const filePathByFilename = new Map<string, string[]>();
	const files: ReportusFileEntry[] = [];

	async function walk(currentDir: string): Promise<void> {
		const entries = await fs.readdir(currentDir, { withFileTypes: true });
		for (const entry of entries) {
			if (entry.name.startsWith('.')) continue;
			const fullPath = path.join(currentDir, entry.name);
			if (entry.isDirectory()) {
				await walk(fullPath);
				continue;
			}
			if (!entry.isFile()) continue;

			const stat = await fs.stat(fullPath).catch(() => null);
			if (!stat) continue;

			const relativePath = normalizeRelativePath(path.relative(fixtureDir, fullPath));
			filePathByRelativePath.set(relativePath, fullPath);

			const manifestFilename = fullPath === reportXmlPath ? 'Report.xml' : entry.name;

			const byFilename = filePathByFilename.get(manifestFilename) ?? [];
			byFilename.push(relativePath);
			filePathByFilename.set(manifestFilename, byFilename);

			files.push({
				filename: manifestFilename,
				path: relativePath,
				size: stat.size,
				offset: 0
			});
		}
	}

	await walk(fixtureDir);
	files.sort((a, b) => a.path.localeCompare(b.path));

	const reportXml = await fs.readFile(reportXmlPath, 'utf8');
	const metadata = parseFixtureIndexMetadata(reportId, reportXml);

	return {
		reportId,
		fixtureDir,
		reportXmlPath,
		filePathByRelativePath,
		filePathByFilename,
		index: {
			_id: `fixture-${reportId}`,
			filename: path.basename(reportXmlPath),
			files,
			...metadata
		}
	};
}

async function readFixtureFileBytes(
	manifest: FixtureManifest,
	filePath: string,
	opts?: { maxBytes?: number; mode?: 'head' | 'tail' }
): Promise<{ bytes: Uint8Array; truncated: boolean }> {
	const maxBytes = Math.max(0, opts?.maxBytes ?? 2 * 1024 * 1024);
	const mode = opts?.mode === 'tail' ? 'tail' : 'head';
	const normalized = normalizeRelativePath(filePath);
	const exactPath = manifest.filePathByRelativePath.get(normalized);
	const basenameMatches = manifest.filePathByFilename.get(path.basename(normalized)) ?? [];
	const fallbackRelativePath = normalized.includes('/') ? null : basenameMatches[0] ?? null;
	const resolvedRelativePath = exactPath ? normalized : fallbackRelativePath;
	if (!resolvedRelativePath) {
		throw new ReportSourceError(404, `Fixture file not found: ${filePath}`);
	}

	const absolutePath = manifest.filePathByRelativePath.get(resolvedRelativePath);
	if (!absolutePath) {
		throw new ReportSourceError(404, `Fixture file not found: ${filePath}`);
	}

	const stat = await fs.stat(absolutePath).catch(() => null);
	if (!stat?.isFile()) {
		throw new ReportSourceError(404, `Fixture file not found: ${filePath}`);
	}

	if (maxBytes === 0) {
		return { bytes: new Uint8Array(0), truncated: stat.size > 0 };
	}

	const fh = await fs.open(absolutePath, 'r');
	try {
		const start = mode === 'tail' ? Math.max(0, stat.size - maxBytes) : 0;
		const length = Math.min(stat.size, maxBytes);
		const buffer = Buffer.alloc(length);
		const { bytesRead } = await fh.read(buffer, 0, length, start);
		return {
			bytes: new Uint8Array(buffer.subarray(0, bytesRead)),
			truncated: stat.size > maxBytes
		};
	} finally {
		await fh.close();
	}
}

function createFixtureClient(manifest: FixtureManifest): ReportusClient {
	return {
		async getReportIndex(reportId: ReportId): Promise<ReportusReportIndex> {
			if (String(reportId) !== manifest.reportId) {
				throw new ReportSourceError(404, `Fixture report not found: ${reportId}`);
			}
			return manifest.index;
		},
		async downloadFileBytes(
			reportId: ReportId,
			filePath: string,
			opts?: { maxBytes?: number; mode?: 'head' | 'tail' }
		): Promise<{ bytes: Uint8Array; truncated: boolean }> {
			if (String(reportId) !== manifest.reportId) {
				throw new ReportSourceError(404, `Fixture report not found: ${reportId}`);
			}
			return await readFixtureFileBytes(manifest, filePath, opts);
		},
		async downloadFileText(
			reportId: ReportId,
			filePath: string,
			opts?: { maxBytes?: number; mode?: 'head' | 'tail' }
		): Promise<{ text: string; truncated: boolean }> {
			const { bytes, truncated } = await this.downloadFileBytes(reportId, filePath, opts);
			return { text: decodeBytesToText(bytes), truncated };
		}
	};
}

function readReportSourceMode(modeOverride?: ReportSourceMode): ReportSourceMode {
	const raw = (modeOverride ?? env.REPORT_SOURCE_MODE ?? 'api').trim().toLowerCase();
	if (raw === 'api' || raw === 'prefer_fixture' || raw === 'fixture') {
		return raw;
	}
	throw new ReportSourceError(500, `Invalid REPORT_SOURCE_MODE: ${raw}`);
}

export async function resolveReportSource(
	reportId: string,
	options?: { modeOverride?: ReportSourceMode }
): Promise<ResolvedReportSource> {
	ensureDomParser();

	const mode = readReportSourceMode(options?.modeOverride);
	const fixtureManifest = mode === 'api' ? null : await buildFixtureManifest(reportId);

	if (mode === 'fixture') {
		if (!fixtureManifest) {
			throw new ReportSourceError(404, `Fixture report not found: ${reportId}`);
		}
		const client = createFixtureClient(fixtureManifest);
		return {
			reportId,
			mode,
			sourceKind: 'fixture',
			index: fixtureManifest.index,
			client,
			fixtureDir: fixtureManifest.fixtureDir,
			fetchNodePayload: (nodeKey, opts) => fetchNodePayload(client, reportId, fixtureManifest.index, nodeKey, opts)
		};
	}

	if (mode === 'prefer_fixture' && fixtureManifest) {
		const client = createFixtureClient(fixtureManifest);
		return {
			reportId,
			mode,
			sourceKind: 'fixture',
			index: fixtureManifest.index,
			client,
			fixtureDir: fixtureManifest.fixtureDir,
			fetchNodePayload: (nodeKey, opts) => fetchNodePayload(client, reportId, fixtureManifest.index, nodeKey, opts)
		};
	}

	let client: ReportusClient;
	try {
		client = getReportusClient();
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Failed to configure Reportus source';
		throw new ReportSourceError(500, message);
	}
	let index: ReportusReportIndex;
	try {
		index = await client.getReportIndex(reportId);
	} catch (error) {
		if (error instanceof ReportusHttpError) throw error;
		if (error instanceof ReportSourceError) throw error;
		const message = error instanceof Error ? error.message : 'Failed to resolve Reportus source';
		throw new ReportSourceError(500, message);
	}

	return {
		reportId,
		mode,
		sourceKind: 'api',
		index,
		client,
		fetchNodePayload: (nodeKey, opts) => fetchNodePayload(client, reportId, index, nodeKey, opts)
	};
}
