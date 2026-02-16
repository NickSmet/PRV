<script lang="ts">
  let { open = false }: { open: boolean } = $props();
</script>

<svg
  width="10"
  height="10"
  viewBox="0 0 16 16"
  fill="none"
  class={`transition-transform duration-100 shrink-0 opacity-40 ${open ? 'rotate-90' : ''}`}
>
  <path
    d="M6 4l4 4-4 4"
    stroke="currentColor"
    stroke-width="2.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</svg>
