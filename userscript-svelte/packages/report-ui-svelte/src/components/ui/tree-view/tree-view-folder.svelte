<script lang="ts">
	import * as Collapsible from '../collapsible';
	import FolderIcon from '@lucide/svelte/icons/folder';
	import FolderOpenIcon from '@lucide/svelte/icons/folder-open';
	import { cn } from '../../../utils.js';
	import type { TreeViewFolderProps } from './types';

	let {
		name,
		open = $bindable(true),
		class: className,
		icon,
		meta,
		children
	}: TreeViewFolderProps = $props();

	let hasMeta = $derived(!!meta);
</script>

<Collapsible.Root bind:open>
	<div
		class={cn(
			'grid w-full items-start gap-x-3',
			hasMeta ? 'grid-cols-[minmax(0,1fr)_var(--tv-meta-width)]' : 'grid-cols-[minmax(0,1fr)]',
			className
		)}
	>
		<Collapsible.Trigger class="inline-flex min-w-0 items-center gap-1">
			{#if icon}
				{@render icon({ name, open })}
			{:else if open}
				<FolderOpenIcon class="size-4" />
			{:else}
				<FolderIcon class="size-4" />
			{/if}
			<span class="min-w-0 break-all">{name}</span>
		</Collapsible.Trigger>
		{#if meta}
			<div class="min-w-0">
				{@render meta({ name, open })}
			</div>
		{/if}
	</div>
	<Collapsible.Content class="mx-2 border-l">
		<div class="relative flex w-full items-start">
			<div class="bg-border mx-2 h-full w-px"></div>
			<div class="flex min-w-0 flex-1 flex-col">
				{@render children?.()}
			</div>
		</div>
	</Collapsible.Content>
</Collapsible.Root>
