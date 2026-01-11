<script lang="ts">
  import { cn } from "$lib/utils";
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Variant = "default" | "secondary" | "destructive" | "outline" | "muted" | "success";

  let {
    class: className,
    variant = "default",
    children,
    ...restProps
  }: HTMLAttributes<HTMLDivElement> & {
    variant?: Variant;
    children?: Snippet;
  } = $props();

  const variantClasses = {
    default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
    secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
    outline: "text-foreground",
    muted: "border-transparent text-muted-foreground hover:bg-muted/80",
    success: "border-transparent text-success-foreground hover:bg-success/80"
  };

  const variantStyles: Record<typeof variant, string> = {
    default: "",
    secondary: "",
    destructive: "",
    outline: "",
    muted: "background-color: hsl(220 14% 85%); color: hsl(220 10% 40%);",
    success: "background-color: hsl(142 60% 50%); color: hsl(0 0% 100%);"
  };
</script>

<div
  class={cn(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    variantClasses[variant],
    className
  )}
  style={variantStyles[variant]}
  {...restProps}
>
  {@render children?.()}
</div>
