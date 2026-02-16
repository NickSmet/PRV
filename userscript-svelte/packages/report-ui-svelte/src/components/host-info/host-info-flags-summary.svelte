<script lang="ts">
  import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
  import ShieldAlert from '@lucide/svelte/icons/shield-alert';
  import HardDrive from '@lucide/svelte/icons/hard-drive';
  import Monitor from '@lucide/svelte/icons/monitor';
  import Camera from '@lucide/svelte/icons/camera';
  import Headphones from '@lucide/svelte/icons/headphones';

  import type { HostInfoSummary } from '@prv/report-core';

  let { flags, hasDisplayLink }: { flags: HostInfoSummary['flags']; hasDisplayLink: boolean } = $props();

  const items = $derived.by(() => {
    const out: Array<{ key: string; tone: 'danger' | 'warn' | 'info'; text: string; Icon: any }> = [];
    if (flags.lowMemory) out.push({ key: 'lowMemory', tone: 'warn', text: 'High mem usage', Icon: TriangleAlert });
    if (flags.privacyRestricted)
      out.push({ key: 'privacy', tone: 'warn', text: 'Privacy restricted', Icon: ShieldAlert });
    if (hasDisplayLink) out.push({ key: 'displaylink', tone: 'warn', text: 'DisplayLink', Icon: Monitor });
    if (flags.hasExternalDisks) out.push({ key: 'external', tone: 'info', text: 'External disk', Icon: HardDrive });
    if (flags.hasUsbCamera) out.push({ key: 'camera', tone: 'info', text: 'USB cam', Icon: Camera });
    if (flags.hasBluetoothAudio) out.push({ key: 'btaudio', tone: 'info', text: 'BT audio', Icon: Headphones });
    return out;
  });

  function toneClass(tone: 'danger' | 'warn' | 'info') {
    if (tone === 'danger') return 'border-red-200 bg-red-50/80 text-red-700';
    if (tone === 'warn') return 'border-amber-200 bg-amber-50/80 text-amber-700';
    return 'border-sky-100 bg-sky-50/60 text-sky-700';
  }
</script>

{#if items.length > 0}
  <div class="flex flex-wrap items-center gap-1 py-1 px-0.5">
    {#each items as item (item.key)}
      <span class={`inline-flex items-center gap-1 rounded-[3px] border px-1.5 py-[1px] text-[10px] font-medium ${toneClass(item.tone)}`}>
        <item.Icon class="size-2.5" />
        {item.text}
      </span>
    {/each}
  </div>
{/if}
