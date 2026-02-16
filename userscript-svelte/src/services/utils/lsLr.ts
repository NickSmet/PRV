/**
 * Shared parser utilities for `ls -lR` output.
 *
 * Used by:
 * - AdvancedVmInfo (`VmBundleFileList`)
 * - LaunchdInfo (`LaunchdInfo.txt`)
 *
 * NOTE: This intentionally avoids Node.js `path` APIs because these parsers run in the browser.
 */

export type LsEntryKind = 'file' | 'folder';

export interface LsEntryMeta {
  permissions?: string;
  hardLinks?: number;
  owner?: string;
  group?: string;
  flags?: string;
  sizeBytes?: number;
  sizeHuman?: string;
  modified?: {
    raw?: string;
    year?: number;
    month?: number; // 1-12
    day?: number;   // 1-31
    time?: string;  // "HH:MM:SS"
  };
}

export interface LsEntryBase {
  kind: LsEntryKind;
  name: string;
  /**
   * Best-effort absolute-ish path (for linking, copy, debugging).
   * For virtual roots, this may be undefined.
   */
  path?: string;
  meta?: LsEntryMeta;
}

export interface LsFolderEntry extends LsEntryBase {
  kind: 'folder';
  children: LsEntry[];
}

export interface LsFileEntry extends LsEntryBase {
  kind: 'file';
}

export type LsEntry = LsFolderEntry | LsFileEntry;

function monthToNumber(month: string): number | undefined {
  const map: Record<string, number> = {
    jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
    jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12
  };
  return map[month.trim().toLowerCase()];
}

function humanFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function parseLsMeta(line: string): { kind: LsEntryKind; name: string; meta: LsEntryMeta } | undefined {
  const trimmed = line.trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith('total ')) return undefined;
  if (trimmed === '.' || trimmed === '..') return undefined;
  if (trimmed.startsWith('com.apple.') || trimmed.startsWith('com.parallels.')) return undefined;

  const tokens = trimmed.split(/\s+/);
  if (tokens.length < 9) return undefined;

  const permissions = tokens[0];
  if (!/^[bcdlps\-][rwx\-+]{8,11}@?$/.test(permissions)) return undefined;

  const hardLinks = Number.parseInt(tokens[1], 10);
  const owner = tokens[2];
  const group = tokens[3];
  const flags = tokens[4];
  const sizeBytes = Number.parseInt(tokens[5], 10);

  const monthToken = tokens[6];
  const dayToken = tokens[7];
  const next = tokens[8];

  const month = monthToNumber(monthToken);
  const day = Number.parseInt(dayToken, 10);

  let time: string | undefined;
  let year: number | undefined;
  let nameStart = 9;

  if (next.includes(':')) {
    time = next;
    const yearToken = tokens[9];
    if (/^\d{4}$/.test(yearToken)) {
      year = Number.parseInt(yearToken, 10);
      nameStart = 10;
    }
  } else if (/^\d{4}$/.test(next)) {
    year = Number.parseInt(next, 10);
  }

  const name = tokens.slice(nameStart).join(' ').trim();
  if (!name || name === '.' || name === '..') return undefined;

  const rawParts = [monthToken, dayToken, time, year ? String(year) : undefined].filter(Boolean);
  const meta: LsEntryMeta = {
    permissions,
    hardLinks: Number.isFinite(hardLinks) ? hardLinks : undefined,
    owner: owner || undefined,
    group: group || undefined,
    flags: flags || undefined,
    sizeBytes: Number.isFinite(sizeBytes) ? sizeBytes : undefined,
    sizeHuman: Number.isFinite(sizeBytes) ? humanFileSize(sizeBytes) : undefined,
    modified: {
      raw: rawParts.join(' '),
      year,
      month,
      day: Number.isFinite(day) ? day : undefined,
      time
    }
  };

  const kind: LsEntryKind = permissions.startsWith('d') ? 'folder' : 'file';
  return { kind, name, meta };
}

function sortTree(node: LsFolderEntry) {
  node.children = node.children
    .slice()
    .sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === 'folder' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

  for (const child of node.children) {
    if (child.kind === 'folder') sortTree(child);
  }
}

function normalizeAbsPath(pathLike: string): string {
  const trimmed = pathLike.trim();
  if (!trimmed) return '';
  // Ensure leading slash and remove trailing slashes (except for root "/").
  const withLeading = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  const collapsed = withLeading.replace(/\/{2,}/g, '/');
  if (collapsed.length > 1 && collapsed.endsWith('/')) return collapsed.slice(0, -1);
  return collapsed;
}

function dirnamePosix(absPath: string): string {
  const p = normalizeAbsPath(absPath);
  if (p === '/' || p === '') return '/';
  const idx = p.lastIndexOf('/');
  if (idx <= 0) return '/';
  return p.slice(0, idx);
}

function basenamePosix(absPath: string): string {
  const p = normalizeAbsPath(absPath);
  if (p === '/' || p === '') return '/';
  const idx = p.lastIndexOf('/');
  return idx >= 0 ? p.slice(idx + 1) : p;
}

function inferRootPvmPathFromHeaders(lines: string[]): string | undefined {
  for (const line of lines) {
    const match = /^\/([^:\r\n]+):\s*$/.exec(line.trim());
    if (!match) continue;
    const fullPath = `/${match[1]}`;
    const idx = fullPath.lastIndexOf('.pvm');
    if (idx < 0) continue;
    return fullPath.slice(0, idx + 4);
  }
  return undefined;
}

export type ParseLsLrTreeOptions = {
  /**
   * If provided, the tree is anchored at this absolute path and only includes entries under it.
   * If omitted, a virtual root is created and *all* headers are included.
   */
  rootPath?: string;
  /**
   * Used only for virtual roots (when `rootPath` is not provided/inferred).
   */
  rootName?: string;
};

/**
 * Parse `ls -lR` output into a structured tree.
 *
 * - For `.pvm` listings we can anchor to the inferred `.pvm` root.
 * - For "multi-root" listings (LaunchdInfo) we create a virtual root and attach all folders under it.
 */
export function parseLsLrTree(rawLs: string, options?: ParseLsLrTreeOptions): LsFolderEntry | undefined {
  if (!rawLs || rawLs.trim().length === 0) return undefined;

  const lines = rawLs.split(/\r?\n/);
  const inferredRootPath = inferRootPvmPathFromHeaders(lines);
  const rootPath = options?.rootPath ? normalizeAbsPath(options.rootPath) : (inferredRootPath ? normalizeAbsPath(inferredRootPath) : undefined);

  const root: LsFolderEntry = {
    kind: 'folder',
    name: rootPath ? basenamePosix(rootPath) : (options?.rootName ?? 'root'),
    path: rootPath,
    children: []
  };

  const folderByPath = new Map<string, LsFolderEntry>();
  const childKeysByFolderPath = new Map<string, Set<string>>();

  const rootKey = rootPath ?? '/';
  folderByPath.set(rootKey, root);

  const ensureFolder = (folderPathAbs: string): LsFolderEntry => {
    const abs = normalizeAbsPath(folderPathAbs);
    const key = rootPath ? abs : abs; // still unique by abs path under virtual root

    const existing = folderByPath.get(key);
    if (existing) return existing;

    const created: LsFolderEntry = { kind: 'folder', name: basenamePosix(abs), path: abs, children: [] };
    folderByPath.set(key, created);

    // Attach to parent (either real rootPath or virtual root).
    const parentPath = dirnamePosix(abs);
    const shouldAttachToVirtualRoot = !rootPath;
    const shouldAttachUnderRootPath = rootPath && abs.startsWith(rootPath) && abs !== rootPath;

    if (shouldAttachToVirtualRoot || shouldAttachUnderRootPath) {
      const parentKey = rootPath
        ? (parentPath && parentPath.startsWith(rootPath) ? parentPath : rootPath)
        : (parentPath || '/');

      const parent = ensureFolder(parentKey);
      const keys = childKeysByFolderPath.get(parentKey) ?? new Set<string>();
      if (!childKeysByFolderPath.has(parentKey)) childKeysByFolderPath.set(parentKey, keys);

      if (!keys.has(key)) {
        keys.add(key);
        parent.children.push(created);
      }
    }

    return created;
  };

  let currentDir: string | undefined = rootPath;

  for (const rawLine of lines) {
    const line = rawLine.replace(/\r$/, '');
    if (!line.trim()) continue;
    if (line.startsWith('\t')) continue;

    const header = /^\/([^:\r\n]+):\s*$/.exec(line.trim());
    if (header) {
      currentDir = normalizeAbsPath(`/${header[1]}`);
      if (rootPath) {
        if (currentDir.startsWith(rootPath)) ensureFolder(currentDir);
      } else {
        ensureFolder(currentDir);
      }
      continue;
    }

    if (!currentDir) continue;
    if (rootPath && !currentDir.startsWith(rootPath)) continue;

    const parsed = parseLsMeta(line);
    if (!parsed) continue;

    const parent = ensureFolder(currentDir);
    const entryPath = normalizeAbsPath(`${currentDir}/${parsed.name}`);

    const keys = childKeysByFolderPath.get(currentDir) ?? new Set<string>();
    if (!childKeysByFolderPath.has(currentDir)) childKeysByFolderPath.set(currentDir, keys);
    if (keys.has(entryPath)) continue;
    keys.add(entryPath);

    if (parsed.kind === 'folder') {
      const folder = ensureFolder(entryPath);
      folder.meta = parsed.meta;
      parent.children.push(folder);
    } else {
      const file: LsFileEntry = {
        kind: 'file',
        name: parsed.name,
        path: entryPath,
        meta: parsed.meta
      };
      parent.children.push(file);
    }
  }

  if (root.children.length === 0) return undefined;
  sortTree(root);
  return root;
}

export function countLsTree(root: LsFolderEntry): { files: number; folders: number } {
  let files = 0;
  let folders = 0;
  const stack: LsEntry[] = [root];
  while (stack.length) {
    const node = stack.pop()!;
    if (node.kind === 'folder') {
      folders += 1;
      for (const child of node.children) stack.push(child);
    } else {
      files += 1;
    }
  }
  return { files, folders };
}

export function countOwner(root: LsFolderEntry, owner: string): number {
  const target = owner.trim();
  if (!target) return 0;
  let count = 0;
  const stack: LsEntry[] = [root];
  while (stack.length) {
    const node = stack.pop()!;
    if (node.kind === 'folder') {
      for (const child of node.children) stack.push(child);
    } else {
      if (node.meta?.owner === target) count += 1;
    }
  }
  return count;
}

export function treeContainsFileName(root: LsFolderEntry | undefined, needle: string): boolean {
  if (!root) return false;
  const n = needle.trim();
  if (!n) return false;
  const stack: LsEntry[] = [root];
  while (stack.length > 0) {
    const node = stack.pop()!;
    if (node.kind === 'file' && node.name.includes(n)) return true;
    if (node.kind === 'folder') {
      for (const child of node.children) stack.push(child);
    }
  }
  return false;
}

/**
 * Legacy formatter used by `AdvancedVmInfoBundleContents` (parses markdown-ish output).
 *
 * This keeps existing UI stable while we move parsers to a structured tree representation.
 */
export function parseLsLr(raw: string): string {
  const lsFileRegex =
    /(?<permissions>[\w\-\+]{9,11}@?) +(?<hardLinks>\d+) +(?<ownerName>[\(\)\_\{\}\-\w\.]+) +(?<owneGroup>[\w\\]+) +(?<type>[\w\-]+)? +(?<size>\d+) +(?<modified>(?<month>\w{3}) +(?<day>\d{1,2}) +(?<time>(\d\d\:){1,2}\d\d)? (?<year>\d{4} )?)(?<fileName>.+)/g;
  const lsFolderRegex = /(\/[\w ]+\.pvm)?\/(?<location>[^:\n]*):$/gm;

  let bundleContents = '';
  const bundleLines = raw.split('\n');

  for (let index = 0; index < bundleLines.length; index++) {
    const line = bundleLines[index];
    lsFolderRegex.lastIndex = 0; // Reset regex
    lsFileRegex.lastIndex = 0;   // Reset regex

    const folderMatch = lsFolderRegex.exec(line);
    const fileMatch = lsFileRegex.exec(line);

    if (fileMatch?.groups && fileMatch.groups.fileName !== '.' && fileMatch.groups.fileName !== '..') {
      const { size, fileName, permissions, ownerName, modified } = fileMatch.groups;
      let owner = ownerName;

      // Highlight problematic owners
      if (ownerName?.match(/root|\_unknown/)) {
        owner = `**${ownerName}** (!)`;
      }

      const humanSize = humanFileSize(parseInt(size, 10));
      bundleContents += `${humanSize} **${fileName}** _${permissions} ${owner} ${modified}_\n`;
    } else if (folderMatch?.groups) {
      let folderLocation = folderMatch.groups.location;

      // Make output look more like a folder structure
      if (folderLocation?.match(/\//g)) {
        const folderLocationArr = folderLocation.split('/');
        folderLocation = '';
        for (let i = 0; i < folderLocationArr.length; i++) {
          folderLocation += '\n' + ' '.repeat(i * 5) + '└──' + folderLocationArr[i];
        }
      }
      bundleContents += `\n**${folderLocation}**:\n`;
    }
  }

  return bundleContents;
}

