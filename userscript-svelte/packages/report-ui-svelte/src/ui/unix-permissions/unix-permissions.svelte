<script lang="ts">
	import * as Tooltip from '../../components/ui/tooltip';
	import { cn } from '../../utils';
	import CheckIcon from '@lucide/svelte/icons/check';
	import MinusIcon from '@lucide/svelte/icons/minus';
	import type { UnixPermissionsParsed, UnixPermissionsProps, UnixPermissionsTriad } from './types';

	let { permissions = null, variant = 'rich', class: className }: UnixPermissionsProps = $props();

	type TriadKind = 'owner' | 'group' | 'others';

	const TRIAD_UI: Record<
		TriadKind,
		{
			container: string;
			activeText: string;
			labelCell: string;
			labelText: string;
		}
	> = {
		owner: {
			container: 'bg-blue-100 border-blue-500',
			activeText: 'text-blue-900',
			labelCell: 'bg-blue-50 border-blue-500',
			labelText: 'text-blue-900'
		},
		group: {
			container: 'bg-emerald-100 border-emerald-500',
			activeText: 'text-emerald-900',
			labelCell: 'bg-emerald-50 border-emerald-500',
			labelText: 'text-emerald-900'
		},
		others: {
			container: 'bg-amber-100 border-amber-500',
			activeText: 'text-amber-900',
			labelCell: 'bg-amber-50 border-amber-500',
			labelText: 'text-amber-900'
		}
	};

	function parseTriad(raw: string): UnixPermissionsTriad {
		const r = raw[0] ?? '-';
		const w = raw[1] ?? '-';
		const x = raw[2] ?? '-';

		return {
			raw: `${r}${w}${x}`,
			read: r === 'r',
			write: w === 'w',
			// Treat `s`/`t` as "execute on" (setuid/sticky etc). Keep `S`/`T` as not-executable.
			execute: x === 'x' || x === 's' || x === 't'
		};
	}

	function triadToOctal(triad: UnixPermissionsTriad): number {
		return (triad.read ? 4 : 0) + (triad.write ? 2 : 0) + (triad.execute ? 1 : 0);
	}

	function parsePermissionsString(input: string | null): UnixPermissionsParsed | null {
		const raw = input?.trim() ?? '';
		if (raw.length < 10) return null;

		const fileType = raw[0] ?? '?';
		const owner = parseTriad(raw.slice(1, 4));
		const group = parseTriad(raw.slice(4, 7));
		const others = parseTriad(raw.slice(7, 10));
		const suffix = raw.slice(10);
		const octal = `${triadToOctal(owner)}${triadToOctal(group)}${triadToOctal(others)}`;

		return { raw, fileType, owner, group, others, octal, suffix };
	}

	function permCharClass(active: boolean, activeTextClass: string): string {
		return cn(
			'font-mono text-xs leading-none',
			active ? cn(activeTextClass, 'font-semibold opacity-100') : 'text-slate-300 font-normal opacity-50'
		);
	}

	function iconCell(allowed: boolean) {
		if (allowed) return { Icon: CheckIcon, class: 'text-emerald-600' };
		return { Icon: MinusIcon, class: 'text-slate-300' };
	}

	let parsed = $derived(parsePermissionsString(permissions));
	let legendRows = $derived(
		parsed
			? ([
					{ key: 'owner', label: 'Owner', perms: parsed.owner, ui: TRIAD_UI.owner },
					{ key: 'group', label: 'Group', perms: parsed.group, ui: TRIAD_UI.group },
					{ key: 'others', label: 'Others', perms: parsed.others, ui: TRIAD_UI.others }
				] as const)
			: ([] as const)
	);
</script>

<Tooltip.Provider delayDuration={100} skipDelayDuration={0} disableHoverableContent={true}>
	<Tooltip.Root>
		<Tooltip.Trigger type={undefined}>
			{#snippet child({ props })}
				{#if variant === 'subtle'}
					<span
						{...props}
						role="button"
						tabindex="0"
						class={cn(
							'inline-flex cursor-help items-center rounded-sm font-mono text-[11px] text-slate-500',
							'hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-slate-400/40',
							className
						)}
					>
						{permissions?.trim() || '—'}
					</span>
				{:else}
					<span
						{...props}
						role="button"
						tabindex="0"
						class={cn(
							'inline-flex cursor-help items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-xs text-slate-800 shadow-none outline-none',
							'hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-slate-400/40',
							className
						)}
					>
						{#if parsed}
							<span class="text-slate-500 pr-1">{parsed.fileType}</span>

							<span
								class={cn(
									'inline-flex items-center gap-[1px] rounded-[3px] px-1 py-0.5 border-b-2',
									TRIAD_UI.owner.container
								)}
							>
								<span class={permCharClass(parsed.owner.read, TRIAD_UI.owner.activeText)}>{parsed.owner.raw[0]}</span>
								<span class={permCharClass(parsed.owner.write, TRIAD_UI.owner.activeText)}>{parsed.owner.raw[1]}</span>
								<span class={permCharClass(parsed.owner.execute, TRIAD_UI.owner.activeText)}>{parsed.owner.raw[2]}</span>
							</span>

							<span
								class={cn(
									'inline-flex items-center gap-[1px] rounded-[3px] px-1 py-0.5 border-b-2',
									TRIAD_UI.group.container
								)}
							>
								<span class={permCharClass(parsed.group.read, TRIAD_UI.group.activeText)}>{parsed.group.raw[0]}</span>
								<span class={permCharClass(parsed.group.write, TRIAD_UI.group.activeText)}>{parsed.group.raw[1]}</span>
								<span class={permCharClass(parsed.group.execute, TRIAD_UI.group.activeText)}>{parsed.group.raw[2]}</span>
							</span>

							<span
								class={cn(
									'inline-flex items-center gap-[1px] rounded-[3px] px-1 py-0.5 border-b-2',
									TRIAD_UI.others.container
								)}
							>
								<span class={permCharClass(parsed.others.read, TRIAD_UI.others.activeText)}>{parsed.others.raw[0]}</span>
								<span class={permCharClass(parsed.others.write, TRIAD_UI.others.activeText)}>{parsed.others.raw[1]}</span>
								<span class={permCharClass(parsed.others.execute, TRIAD_UI.others.activeText)}>{parsed.others.raw[2]}</span>
							</span>

							<span class="ml-2 text-[11px] font-semibold text-slate-400">{parsed.octal}</span>

							{#if parsed.suffix}
								<span class="ml-0.5 text-[11px] font-semibold text-slate-400">{parsed.suffix}</span>
							{/if}
						{:else}
							<span class="text-slate-500">{permissions?.trim() || '—'}</span>
						{/if}
					</span>
				{/if}
			{/snippet}
		</Tooltip.Trigger>

		{#if parsed}
			<Tooltip.Content
				side="bottom"
				sideOffset={8}
				arrowClasses="bg-white"
				class="bg-white text-slate-800 border border-slate-200 p-0 shadow-xl"
			>
				<table class="min-w-72 w-full border-collapse text-sm">
					<thead>
						<tr class="bg-slate-50 text-slate-600">
							<th class="px-3 py-2 text-left font-semibold"></th>
							<th class="px-3 py-2 text-center font-semibold">Read</th>
							<th class="px-3 py-2 text-center font-semibold">Write</th>
							<th class="px-3 py-2 text-center font-semibold">Execute</th>
						</tr>
					</thead>
					<tbody>
						{#each legendRows as row (row.key)}
							{@const r = iconCell(row.perms.read)}
							{@const w = iconCell(row.perms.write)}
							{@const x = iconCell(row.perms.execute)}
							{@const ReadIcon = r.Icon}
							{@const WriteIcon = w.Icon}
							{@const ExecIcon = x.Icon}

							<tr>
								<td
									class={cn('px-3 py-2 text-left font-medium border-l-4', row.ui.labelCell, row.ui.labelText)}
								>
									{row.label}
								</td>
								<td class="px-3 py-2 text-center">
									<ReadIcon class={cn('inline-block size-4', r.class)} />
								</td>
								<td class="px-3 py-2 text-center">
									<WriteIcon class={cn('inline-block size-4', w.class)} />
								</td>
								<td class="px-3 py-2 text-center">
									<ExecIcon class={cn('inline-block size-4', x.class)} />
								</td>
							</tr>
						{/each}
					</tbody>
				</table>

				<div class="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
					<span>r=4, w=2, x=1</span>
					<span class="rounded bg-slate-200 px-2 py-0.5 font-mono font-semibold text-slate-700">
						chmod {parsed.octal}
					</span>
				</div>
			</Tooltip.Content>
		{/if}
	</Tooltip.Root>
</Tooltip.Provider>
