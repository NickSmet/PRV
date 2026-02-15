<script lang="ts">
	import { UnixPermissions } from '$ui/unix-permissions';
	import { cn } from '$lib/utils.js';

	type EntryLine = {
		kind: 'entry';
		size: string;
		name: string;
		permissions?: string;
		owner?: string;
		modified?: string;
		rawMeta?: string;
		isDirectory: boolean;
	};

	type BundleSection = {
		kind: 'root' | 'folder';
		headerText: string;
		headerName?: string;
		entries: EntryLine[];
	};

	let { contents }: { contents?: string } = $props();

	function trimHeaderToPvmRoot(text: string): string {
		const lines = text.split('\n');
		const firstPvmLineIndex = lines.findIndex((l) => l.includes('.pvm'));
		if (firstPvmLineIndex < 0) return text;

		const kept = lines.slice(firstPvmLineIndex);
		const nonEmpty = kept.filter((l) => l.trim().length > 0);
		const minIndent = nonEmpty.reduce((acc, l) => {
			const indent = (l.match(/^\s*/)?.[0]?.length ?? 0);
			return Math.min(acc, indent);
		}, Number.POSITIVE_INFINITY);

		return kept.map((l) => l.slice(minIndent)).join('\n').trimEnd();
	}

	function parseHeaderBlock(lines: string[], startIndex: number): { text: string; endIndex: number } {
		const collected: string[] = [];
		let i = startIndex;

		// `parseLsLr` emits a header that starts with `**` and ends with `**:`
		for (; i < lines.length; i++) {
			const line = lines[i];
			collected.push(line);
			if (line.includes('**:')) break;
		}

		const text = collected
			.join('\n')
			.replace(/\*\*/g, '')
			.replace(/^\n+/, '')
			.replace(/:\s*$/, ':')
			.trimEnd();

		return { text: trimHeaderToPvmRoot(text), endIndex: i };
	}

	function parseHeaderName(headerText: string): string | undefined {
		const lines = headerText
			.split('\n')
			.map((l) => l.trimEnd())
			.filter((l) => l.trim().length > 0);
		if (lines.length === 0) return undefined;

		const last = lines[lines.length - 1].replace(/:\s*$/, '');
		const cleaned = last.replace(/^[\s│├└─]+/, '').trim();
		return cleaned || undefined;
	}

	function parseEntryLine(line: string): EntryLine | null {
		// Example:
		// 376 KB **NVRAM.dat** _-rw-r--r--@ fullphase Jan  8 13:46:50 2026 _
		const re = /^(?<size>.+?)\s+\*\*(?<name>.+?)\*\*\s+_(?<meta>.+)_\s*$/;
		const match = re.exec(line);
		if (!match?.groups) return null;

		const size = match.groups.size.trim();
		const name = match.groups.name.trim();
		const rawMeta = match.groups.meta.trim();
		const metaTokens = rawMeta.split(/\s+/);

		const permissions = metaTokens[0];
		const owner = metaTokens.length > 1 ? metaTokens[1] : undefined;
		const modified = metaTokens.length > 2 ? metaTokens.slice(2).join(' ') : undefined;

		return {
			kind: 'entry',
			size,
			name,
			permissions,
			owner,
			modified,
			rawMeta,
			isDirectory: permissions.trim().startsWith('d')
		};
	}

	function parseSections(input: string | undefined): BundleSection[] {
		const value = input?.trimEnd() ?? '';
		if (!value) return [];

		const rawLines = value.split('\n');
		const sections: BundleSection[] = [{ kind: 'root', headerText: 'Root files', entries: [] }];
		let current = sections[0];

		for (let i = 0; i < rawLines.length; i++) {
			const line = rawLines[i];
			if (!line.trim()) continue;

			if (line.trim() === '**') {
				const header = parseHeaderBlock(rawLines, i);
				const headerName = parseHeaderName(header.text);
				current = { kind: 'folder', headerText: header.text, headerName, entries: [] };
				sections.push(current);
				i = header.endIndex;
				continue;
			}

			const entry = parseEntryLine(line);
			if (entry) {
				current.entries.push(entry);
				continue;
			}

			// Ignore unknown lines for robustness (we already preserve directory boundaries via header blocks).
		}

		return sections;
	}

	function arrangeSections(sections: BundleSection[]): BundleSection[] {
		if (sections.length <= 1) return sections;

		const root = sections[0];
		const rest = sections.slice(1);

		const harddisk = rest.filter((s) => s.headerName?.toLowerCase() === 'harddisk.hdd');
		const snapshots = rest.filter((s) => s.headerName?.toLowerCase() === 'snapshots');
		const other = rest.filter(
			(s) => !harddisk.includes(s) && !snapshots.includes(s)
		);

		return [root, ...harddisk, ...snapshots, ...other];
	}

	function pruneDirectories(section: BundleSection): BundleSection {
		return { ...section, entries: section.entries.filter((e) => !e.isDirectory) };
	}

	let sections = $derived(
		arrangeSections(parseSections(contents))
			.map(pruneDirectories)
			.filter((s) => s.kind === 'root' || s.entries.length > 0)
	);
</script>

<div class="rounded-md border border-border bg-background p-2">
	{#if sections.length === 0}
		<div class="p-2 text-xs text-muted-foreground">No bundle listing.</div>
	{:else}
		<div class="grid grid-cols-[max-content_minmax(0,1fr)_max-content_max-content_max-content] items-baseline gap-x-2 gap-y-0.5">
			<div class="col-span-5 mb-2 grid grid-cols-subgrid items-center gap-2 border-b border-border/60 pb-1 text-[10px] font-semibold uppercase tracking-wide text-foreground/50">
				<span class="justify-self-end font-mono normal-case">Size</span>
				<span>Name</span>
				<span>Permissions</span>
				<span>Owner</span>
				<span>Modified</span>
			</div>

			{#each sections as section, sectionIndex (sectionIndex)}
				{#if section.kind === 'root'}
					<div class="col-span-5 mt-1 text-[11px] font-semibold text-foreground/70">{section.headerText}</div>
					{#if section.entries.length === 0}
						<div class="col-span-5 text-xs text-muted-foreground">No files.</div>
					{/if}
				{:else}
					<pre class="col-span-5 my-2 whitespace-pre font-mono text-[11px] font-semibold text-foreground/70">{section.headerText}</pre>
				{/if}

				{#each section.entries as entry, entryIndex (entryIndex)}
					<span class="justify-self-end whitespace-nowrap font-mono text-[11px] text-foreground/80">
						{entry.size}
					</span>
					<span class="min-w-0 break-all font-semibold text-foreground">{entry.name}</span>
					<span class="whitespace-nowrap font-mono text-[11px] text-foreground/50">
						{#if entry.permissions}
							<UnixPermissions
								permissions={entry.permissions}
								variant="subtle"
								class="text-foreground/50 hover:text-foreground/70"
							/>
						{:else}
							—
						{/if}
					</span>
					<span
						class={cn(
							'whitespace-nowrap font-mono text-[11px] text-foreground/50',
							!entry.owner && 'opacity-0'
						)}
					>
						{entry.owner ?? '—'}
					</span>
					<span
						class={cn(
							'whitespace-nowrap font-mono text-[11px] text-foreground/50',
							!entry.modified && 'opacity-0'
						)}
					>
						{entry.modified ?? '—'}
					</span>
				{/each}

				{#if sectionIndex < sections.length - 1}
					<div class="col-span-5 h-3"></div>
				{/if}
			{/each}
		</div>
	{/if}
</div>
