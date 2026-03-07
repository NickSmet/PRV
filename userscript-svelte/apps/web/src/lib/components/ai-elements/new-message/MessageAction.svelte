<script lang="ts">
	import { cn } from "$lib/utils";
	import { Button, type ButtonSize, type ButtonVariant } from "$lib/components/ui/button/index";
	import * as Tooltip from "$lib/components/ui/tooltip/index";
	import type { Snippet } from "svelte";

	type Props = {
		tooltip?: string;
		label?: string;
		class?: string;
		children?: Snippet;
		variant?: ButtonVariant;
		size?: ButtonSize;
		// Allow passing through HTML/button attributes without trying to model the full union type.
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		[key: string]: any;
	};

	let {
		tooltip,
		label,
		variant = "ghost",
		size = "icon",
		class: className,
		children,
		...restProps
	}: Props = $props();
</script>

{#if tooltip}
	<Tooltip.Provider>
		<Tooltip.Root>
			<Tooltip.Trigger>
				{#snippet child({ props })}
					<Button
						{...props}
						{size}
						type="button"
						{variant}
						class={cn("size-7", className)}
						{...restProps}
					>
						{@render children?.()}
						<span class="sr-only">{label || tooltip}</span>
					</Button>
				{/snippet}
			</Tooltip.Trigger>
			<Tooltip.Content>
				<p>{tooltip}</p>
			</Tooltip.Content>
		</Tooltip.Root>
	</Tooltip.Provider>
{:else}
	<Button {size} type="button" {variant} class={cn("size-7", className)} {...restProps}>
		{@render children?.()}
		{#if label}
			<span class="sr-only">{label}</span>
		{/if}
	</Button>
{/if}
