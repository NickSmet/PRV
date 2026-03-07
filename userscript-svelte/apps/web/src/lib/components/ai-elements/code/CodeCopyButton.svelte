<script lang="ts">
	import { CopyButton } from "$lib/components/ai-elements/copy-button/index";
	import { cn } from "$lib/utils";
	import { useCodeCopyButton } from "./code.svelte.js";
	import type { CodeCopyButtonProps } from "./types";
	import { Button } from "$lib/components/ui/button/index";
	import WrapText from "@lucide/svelte/icons/wrap-text";

	let {
		ref = $bindable(null),
		variant = "ghost",
		size = "icon",
		class: className,
		showCharCount = true,
		showWrapToggle = true,
		...rest
	}: CodeCopyButtonProps = $props();

	const copyButton = useCodeCopyButton();

	let charLabel = $derived(`${copyButton.charCount.toLocaleString()} chars`);
</script>

<div class={cn("absolute top-2 right-2 flex items-center gap-1.5", className)}>
	{#if showCharCount}
		<span class="pointer-events-none select-none text-[10px] leading-none text-muted-foreground tabular-nums">
			{charLabel}
		</span>
	{/if}

	{#if showWrapToggle}
		<Button
			type="button"
			variant="ghost"
			size="icon"
			class={cn("h-7 w-7", copyButton.isWrapped && "text-primary")}
			onclick={() => copyButton.toggleWrap()}
			title={copyButton.isWrapped ? "Disable wrapping" : "Enable wrapping"}
		>
			<WrapText class="size-4" />
			<span class="sr-only">Toggle wrapping</span>
		</Button>
	{/if}

	<CopyButton
		bind:ref
		text={copyButton.code}
		{variant}
		{size}
		{...rest}
	/>
</div>
