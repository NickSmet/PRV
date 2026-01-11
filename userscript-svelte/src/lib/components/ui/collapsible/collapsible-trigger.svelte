<script lang="ts">
  import { getContext } from 'svelte';
  import { cn } from "$lib/utils";
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";

  let {
    class: className,
    children,
    ...restProps
  }: HTMLButtonAttributes & {
    children?: Snippet;
  } = $props();

  const ctx = getContext<{ toggle: () => void }>('collapsible');

  function handleClick(e: MouseEvent) {
    ctx.toggle();
    restProps.onclick?.(e);
  }
</script>

<button
  type="button"
  class={cn("", className)}
  onclick={handleClick}
  {...restProps}
>
  {@render children?.()}
</button>
