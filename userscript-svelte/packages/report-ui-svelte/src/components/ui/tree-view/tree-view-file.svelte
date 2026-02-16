<script lang="ts">
	import FileIcon from '@lucide/svelte/icons/file';
	import { cn } from '../../../utils.js';
	import type { TreeViewFileProps } from './types';

	let { name, icon, meta, type = 'button', class: className, children, ...rest }: TreeViewFileProps = $props();
	let hasMeta = $derived(!!meta);
</script>

<button
	{type}
	class={cn(
		'grid w-full items-start gap-x-3 pl-[3px]',
		hasMeta ? 'grid-cols-[minmax(0,1fr)_var(--tv-meta-width)]' : 'grid-cols-[minmax(0,1fr)]',
		className
	)}
	{...rest}
>
	<span class="inline-flex min-w-0 items-center gap-1">
		{#if icon}
			{@render icon({ name })}
		{:else}
			<FileIcon class="size-4" />
		{/if}
		<span class="min-w-0 break-all">{name}</span>
	</span>

	{#if meta}
		<div class="min-w-0">
			{@render meta({ name })}
		</div>
	{/if}

	{@render children?.()}
</button>
