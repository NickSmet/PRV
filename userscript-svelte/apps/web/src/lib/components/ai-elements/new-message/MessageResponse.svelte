	<script lang="ts">
		import { cn } from "$lib/utils";
		import { linkifyMarkdownUrls } from "$lib/utils/markdown-linkify";
		import { Streamdown, type StreamdownProps } from "svelte-streamdown";
		import type { HTMLAttributes } from "svelte/elements";

		type Props = {
			content: string;
		class?: string;
	} & Omit<StreamdownProps, "content" | "class"> &
		Omit<HTMLAttributes<HTMLDivElement>, "content">;

		let { content: rawContent, class: className, ...restProps }: Props = $props();
		let content = $derived(linkifyMarkdownUrls(rawContent));

		const shikiTheme = $derived.by(() => {
			// Keep this deterministic in SSR.
			if (typeof document === "undefined") return "github-light";
			return document.documentElement.classList.contains("dark")
				? "github-dark"
				: "github-light";
		});
	</script>

	<div class={cn("size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0", className)}>
		<Streamdown
			{content}
			shikiTheme={shikiTheme}
			baseTheme="shadcn"
			{...restProps}
		>
			{#snippet link({ children, token })}
			<a
				href={token.href}
				target="_blank"
				rel="noopener noreferrer"
				title={token.title || undefined}
				class="text-blue-600 underline underline-offset-2 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
			>
				{@render children()}
			</a>
		{/snippet}
	</Streamdown>
</div>
