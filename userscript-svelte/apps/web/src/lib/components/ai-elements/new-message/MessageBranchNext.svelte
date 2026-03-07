<script lang="ts">
	import { cn } from "$lib/utils";
	import { getMessageBranchContext } from "./message-context.svelte";
	import { Button, type ButtonSize, type ButtonVariant } from "$lib/components/ui/button/index";
	import ChevronRight from "@lucide/svelte/icons/chevron-right";
	import type { Snippet } from "svelte";

	type Props = {
		class?: string;
		children?: Snippet;
		variant?: ButtonVariant;
		size?: ButtonSize;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		[key: string]: any;
	};

	let { class: className, children, ...restProps }: Props = $props();

	const branchContext = getMessageBranchContext();

	let isDisabled = $derived(branchContext.totalBranches <= 1);
</script>

<Button
	aria-label="Next branch"
	disabled={isDisabled}
	onclick={() => branchContext.goToNext()}
	size="icon"
	type="button"
	variant="ghost"
	class={cn("size-7", className)}
	{...restProps}
>
	{#if children}
		{@render children()}
	{:else}
		<ChevronRight class="size-3.5" />
	{/if}
</Button>
