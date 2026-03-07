<script lang="ts">
	import { cn } from "$lib/utils";
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	interface Props extends HTMLAttributes<HTMLDivElement> {
		class?: string;
		children: Snippet;
	}

	let { class: className, children, ...restProps }: Props = $props();
</script>

<div
	class={cn(
		"is-user:dark flex w-fit flex-col gap-2 overflow-hidden text-sm",
		"group-[.is-user]:bg-gray-100 group-[.is-user]:text-foreground group-[.is-user]:ml-auto group-[.is-user]:rounded-2xl group-[.is-user]:px-4 group-[.is-user]:py-2 group-[.is-user]:leading-snug group-[.is-user]",
		"group-[.is-user]:border group-[.is-user]:border-gray-200",
		"group-[.is-assistant]:text-foreground",
		className
	)}
	{...restProps}
>
	{@render children()}
</div>
