<script lang="ts">
  import { Badge } from '$lib/components/ui/badge';
  type AnyComponent = new (...args: any[]) => any;

  let { title, count = null, Icon = null }: { title: string; count?: number | null; Icon?: AnyComponent | null } =
    $props();
</script>

<div class="flex items-center gap-2 pt-2">
  {#if Icon}
    <span class="text-muted-foreground"><Icon class="size-4" /></span>
  {/if}
  <div class="text-[13px] font-semibold text-foreground">{title}</div>
  {#if count !== null}
    <Badge variant="muted" class="text-[10px]">{count}</Badge>
  {/if}
  <div class="ml-auto h-px flex-1 bg-border/60"></div>
</div>
