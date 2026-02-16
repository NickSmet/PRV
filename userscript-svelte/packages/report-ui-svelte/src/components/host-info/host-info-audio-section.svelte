<script lang="ts">
  import { Badge } from '../ui/badge';
  import Volume2 from '@lucide/svelte/icons/volume-2';
  import VolumeX from '@lucide/svelte/icons/volume-x';
  import Monitor from '@lucide/svelte/icons/monitor';
  import Headphones from '@lucide/svelte/icons/headphones';
  import MessageCircle from '@lucide/svelte/icons/message-circle';
  import Mic from '@lucide/svelte/icons/mic';
  import Smartphone from '@lucide/svelte/icons/smartphone';

  import type { HostAudioDeviceType, HostInfoSummary } from '@prv/report-core';
  import { audioVariant } from './host-info-utils';

  let { audio, withHeader = true }: { audio: HostInfoSummary['audio']; withHeader?: boolean } = $props();

  function iconFor(type: HostAudioDeviceType) {
    switch (type) {
      case 'monitor':
        return Monitor;
      case 'bluetooth':
        return Headphones;
      case 'virtual':
        return MessageCircle;
      case 'usb':
        return Mic;
      case 'continuity':
        return Smartphone;
      case 'mute':
        return VolumeX;
      case 'builtin':
      case 'other':
      default:
        return Volume2;
    }
  }
</script>

{#if withHeader}
  <div class="flex items-center gap-1.5 mb-1">
    <span class="text-[12px] font-semibold text-foreground">Audio</span>
    <Badge variant="dim" class="text-[9px]">{audio.outputs.length} out</Badge>
    <Badge variant="dim" class="text-[9px]">{audio.inputs.length} in</Badge>
  </div>
{/if}

<div class="grid grid-cols-2 gap-3">
  <!-- Output column -->
  <div>
    <div class="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground mb-0.5">Output</div>
    {#if audio.outputs.length === 0}
      <div class="text-[11px] text-muted-foreground">None</div>
    {:else}
      {#each audio.outputs as d, idx (d.id ?? d.name + ':' + idx)}
        {@const Icon = iconFor(d.type)}
        <div class="flex items-center gap-1.5 py-[3px] border-b border-slate-50 last:border-b-0">
          <Icon class="size-3 text-muted-foreground shrink-0 opacity-60" />
          <span class="min-w-0 flex-1 truncate text-[11px] text-foreground">{d.name}</span>
          <Badge variant={audioVariant(d.type)} class="text-[9px] shrink-0">{d.type}</Badge>
        </div>
      {/each}
    {/if}
  </div>

  <!-- Input column -->
  <div>
    <div class="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground mb-0.5">Input</div>
    {#if audio.inputs.length === 0}
      <div class="text-[11px] text-muted-foreground">None</div>
    {:else}
      {#each audio.inputs as d, idx (d.id ?? d.name + ':' + idx)}
        {@const Icon = iconFor(d.type)}
        <div class="flex items-center gap-1.5 py-[3px] border-b border-slate-50 last:border-b-0">
          <Icon class="size-3 text-muted-foreground shrink-0 opacity-60" />
          <span class="min-w-0 flex-1 truncate text-[11px] text-foreground">{d.name}</span>
          <Badge variant={audioVariant(d.type)} class="text-[9px] shrink-0">{d.type}</Badge>
        </div>
      {/each}
    {/if}
  </div>
</div>
