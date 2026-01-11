<script lang="ts">
  import { getContext } from 'svelte';
  import { cn } from "$lib/utils";
  import { slide } from 'svelte/transition';
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  let {
    class: className,
    children,
    ...restProps
  }: HTMLAttributes<HTMLDivElement> & {
    children?: Snippet;
  } = $props();

  const ctx = getContext<{ open: boolean }>('collapsible');
</script>

{#if ctx.open}
  <div
    transition:slide={{ duration: 200 }}
    class={cn("overflow-hidden", className)}
    {...restProps}
  >
    {@render children?.()}
  </div>
{/if}
