<script lang="ts">
  import { iconComponentForKey } from '../icon';

  let {
    iconKey,
    iconUrlByKey,
    size = 14,
    class: className
  }: {
    iconKey?: string;
    iconUrlByKey?: Record<string, string>;
    size?: number;
    class?: string;
  } = $props();

  const IconComponent = $derived(iconComponentForKey(iconKey));
  const imgUrl = $derived((iconKey ? iconUrlByKey?.[iconKey] : undefined) ?? null);
</script>

{#if imgUrl}
  <img
    src={imgUrl}
    alt=""
    style={`width:${size}px;height:${size}px;`}
    class={className}
    loading="lazy"
    decoding="async"
  />
{:else if IconComponent}
  <IconComponent size={size} class={className} />
{/if}

