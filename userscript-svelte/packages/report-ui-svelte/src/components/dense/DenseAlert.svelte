<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    variant = 'amber',
    children
  }: {
    variant?: 'amber' | 'red';
    children: Snippet;
  } = $props();

  const styles = {
    amber: 'bg-amber-50 border-amber-200 text-amber-800',
    red: 'bg-red-50 border-red-200 text-red-900'
  };
</script>

<div class={`px-2 py-0.5 rounded-[3px] text-[11px] font-medium border ${styles[variant]}`}>
  {@render children()}
</div>
