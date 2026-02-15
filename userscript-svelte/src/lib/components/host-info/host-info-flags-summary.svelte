<script lang="ts">
  import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
  import ShieldAlert from '@lucide/svelte/icons/shield-alert';
  import HardDrive from '@lucide/svelte/icons/hard-drive';
  import Monitor from '@lucide/svelte/icons/monitor';
  import Camera from '@lucide/svelte/icons/camera';
  import Headphones from '@lucide/svelte/icons/headphones';

  import type { HostInfoSummary } from '../../../services/parseHostInfo';

  let { flags, hasDisplayLink }: { flags: HostInfoSummary['flags']; hasDisplayLink: boolean } = $props();

  const items = $derived.by(() => {
    const out: Array<{ key: string; tone: 'danger' | 'warn' | 'info'; text: string; Icon: any }> = [];
    if (flags.lowMemory) out.push({ key: 'lowMemory', tone: 'warn', text: 'High memory usage (active+wired)', Icon: TriangleAlert });
    if (flags.privacyRestricted)
      out.push({ key: 'privacy', tone: 'warn', text: 'Privacy restrictions may block devices', Icon: ShieldAlert });
    if (hasDisplayLink) out.push({ key: 'displaylink', tone: 'warn', text: 'DisplayLink detected', Icon: Monitor });
    if (flags.hasExternalDisks) out.push({ key: 'external', tone: 'info', text: 'External disk connected', Icon: HardDrive });
    if (flags.hasUsbCamera) out.push({ key: 'camera', tone: 'info', text: 'USB camera present', Icon: Camera });
    if (flags.hasBluetoothAudio) out.push({ key: 'btaudio', tone: 'info', text: 'Bluetooth audio present', Icon: Headphones });
    return out;
  });

  function toneClass(tone: 'danger' | 'warn' | 'info') {
    if (tone === 'danger') return 'border-red-200 bg-red-50/60 text-red-800';
    if (tone === 'warn') return 'border-amber-200 bg-amber-50/60 text-amber-800';
    return 'border-sky-200 bg-sky-50/60 text-sky-800';
  }
</script>

{#if items.length > 0}
  <div class="space-y-2">
    {#each items as item (item.key)}
      <div class={`flex items-center gap-2 rounded-xl border px-3 py-2 text-[12px] ${toneClass(item.tone)}`}>
        <item.Icon class="size-4" />
        <span class="font-medium">{item.text}</span>
      </div>
    {/each}
  </div>
{/if}
