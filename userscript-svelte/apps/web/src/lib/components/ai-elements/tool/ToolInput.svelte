<script lang="ts">
	import { cn } from "$lib/utils";
	import * as Code from "$lib/components/ai-elements/code/index";
	import { formatForInspection, shouldUseInspectionFormat } from "./inspect-format";

	interface ToolInputProps {
		class?: string;
		input: unknown;
		[key: string]: unknown;
	}

	let { class: className = "", input, ...restProps }: ToolInputProps = $props();

	let formattedInput = $derived.by(() => {
		if (shouldUseInspectionFormat(input)) return formatForInspection(input);
		return JSON.stringify(input, null, 2);
	});

	let id = $props.id();
</script>

<div {id} class={cn("space-y-2 overflow-hidden p-4", className)} {...restProps}>
	<h4 class="text-muted-foreground text-xs font-medium tracking-wide uppercase">Parameters</h4>
	<div class="bg-muted/50 rounded-md">
		<Code.Root
			class="max-h-[320px]"
			code={formattedInput}
			lang={shouldUseInspectionFormat(input) ? "typescript" : "json"}
			hideLines
		>
			<Code.CopyButton />
		</Code.Root>
	</div>
</div>
