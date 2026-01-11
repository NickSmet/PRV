<script lang="ts">
  import { setContext } from 'svelte';
  import { cn } from "$lib/utils";
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  let {
    class: className,
    open = $bindable(false),
    children,
    ...restProps
  }: HTMLAttributes<HTMLDivElement> & {
    open?: boolean;
    children?: Snippet;
  } = $props();

  function toggle() {
    open = !open;
  }

  setContext('collapsible', {
    get open() { return open; },
    toggle
  });
</script>

<div class={cn("", className)} {...restProps}>
  {@render children?.()}
</div>
