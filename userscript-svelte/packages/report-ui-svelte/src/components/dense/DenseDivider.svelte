<script lang="ts">
  let { label }: { label: string } = $props();
</script>

<div class="flex items-center gap-1.5 py-1 px-2 pl-[18px]">
  <span class="text-[9px] font-bold uppercase tracking-wider text-zinc-400 whitespace-nowrap">
    {label}
  </span>
  <div class="flex-1 h-px bg-zinc-200"></div>
</div>
