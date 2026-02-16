<script lang="ts">
  import { cn } from "../../utils";
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Variant =
    | "default" | "secondary" | "destructive" | "outline" | "muted" | "success"
    | "gold" | "dim" | "green" | "blue" | "purple" | "amber";

  let {
    class: className,
    variant = "default",
    children,
    ...restProps
  }: HTMLAttributes<HTMLDivElement> & {
    variant?: Variant;
    children?: Snippet;
  } = $props();

  const variantClasses: Record<Variant, string> = {
    default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
    secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
    outline: "text-foreground",
    muted: "border-transparent text-muted-foreground hover:bg-muted/80",
    success: "border-transparent text-success-foreground hover:bg-success/80",
    // Dense layout variants
    gold: "border-yellow-300 bg-yellow-50 text-yellow-800",
    dim: "border-slate-200 bg-slate-50 text-slate-500",
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    purple: "border-violet-200 bg-purple-50 text-violet-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700"
  };

  const variantStyles: Record<Variant, string> = {
    default: "",
    secondary: "",
    destructive: "",
    outline: "",
    // NOTE: In userscript mode, host pages sometimes ship aggressive CSS resets with `!important`.
    // Inline styles normally win, but `!important` in page CSS can override them — so we mark our
    // critical pill colors as `!important` to keep badges readable.
    muted:
      "background-color: hsl(220 14% 85%) !important; color: hsl(220 10% 40%) !important; border-color: transparent !important;",
    success:
      "background-color: hsl(142 60% 50%) !important; color: hsl(0 0% 100%) !important; border-color: transparent !important;",
    gold: "",
    dim: "",
    green: "",
    blue: "",
    purple: "",
    amber: ""
  };
</script>

<div
  class={cn(
    "inline-flex items-center rounded-[3px] border px-1.5 h-[18px] text-[10px] font-semibold whitespace-nowrap leading-none transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    variantClasses[variant],
    className
  )}
  style={variantStyles[variant]}
  {...restProps}
>
  {@render children?.()}
</div>
