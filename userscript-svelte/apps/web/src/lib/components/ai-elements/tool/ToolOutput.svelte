<script lang="ts">
	import { cn } from "$lib/utils";
	import * as Code from "$lib/components/ai-elements/code/index";
	import type { SupportedLanguage } from "../code/shiki";
	import { formatForInspection, shouldUseInspectionFormat } from "./inspect-format";

	interface ToolOutputProps {
		class?: string;
		output?: unknown;
		errorText?: string;
		[key: string]: unknown;
	}

	let {
		class: className = "",
		output,
		errorText,
		...restProps
	}: ToolOutputProps = $props();

	let shouldRender = $derived.by(() => {
		return !!(output || errorText);
	});
	type OutputComp = {
		type: "code" | "text";
		content: string;
		language: SupportedLanguage;
	};

	let outputComponent: OutputComp | null = $derived.by(() => {
		if (!output) return null;

		if (typeof output === "object") {
			if (shouldUseInspectionFormat(output)) {
				return {
					type: "code",
					content: formatForInspection(output),
					language: "typescript",
				};
			}

			return {
				type: "code",
				content: JSON.stringify(output, null, 2),
				language: "json",
			};
		} else if (typeof output === "string") {
			const hasActualNewline = output.includes("\n");
			const withNewlinesAndQuotes = (hasActualNewline
				? output
				: output.replaceAll("\\r\\n", "\n").replaceAll("\\n", "\n")
			).replaceAll('\\"', '"');

			return {
				type: "code",
				content: withNewlinesAndQuotes,
				language: "text",
			};
		} else {
			return {
				type: "text",
				content: String(output),
				language: "text",
			};
		}
	});

	let id = $props.id();
</script>

{#if shouldRender}
	<div {id} class={cn("space-y-2 p-4", className)} {...restProps}>
		<h4 class="text-muted-foreground text-xs font-medium tracking-wide uppercase">
			{errorText ? "Error" : "Result"}
		</h4>
		<div
			class={cn(
				"overflow-x-auto rounded-md text-xs [&_table]:w-full",
				errorText ? "bg-destructive/10 text-destructive" : "bg-muted/50 text-foreground"
			)}
		>
			{#if errorText}
				<div class="p-3">{errorText}</div>
			{/if}

			{#if outputComponent}
				{#if outputComponent.type === "code"}
					<Code.Root
						class={cn("max-h-[420px]", errorText && "bg-transparent")}
						code={outputComponent.content}
						lang={outputComponent.language}
						hideLines
					>
						<Code.CopyButton />
					</Code.Root>
				{:else}
					<div class="p-3">{outputComponent.content}</div>
				{/if}
			{/if}
		</div>
	</div>
{/if}
