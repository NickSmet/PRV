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

  let { audio }: { audio: HostInfoSummary['audio'] } = $props();

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

<div class="space-y-2">
  <div class="flex items-center gap-2">
    <div class="text-[13px] font-semibold text-foreground">Audio</div>
    <Badge variant="muted" class="text-[10px]">{audio.outputs.length} out</Badge>
    <Badge variant="muted" class="text-[10px]">{audio.inputs.length} in</Badge>
  </div>

  <div class="overflow-hidden rounded-xl border border-border bg-background">
    <div class="px-4 py-3">
      <div class="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Output</div>
      {#if audio.outputs.length === 0}
        <div class="mt-1 text-[12px] text-muted-foreground">No output devices.</div>
      {:else}
        <div class="mt-2 space-y-1">
          {#each audio.outputs as d, idx (d.id ?? d.name + ':' + idx)}
            {@const Icon = iconFor(d.type)}
            <div class="flex items-center gap-2 rounded-md border border-border/50 bg-muted/10 px-3 py-2">
              <Icon class="size-4 text-muted-foreground" />
              <span class="min-w-0 flex-1 truncate text-[12px] font-medium text-foreground">{d.name}</span>
              <Badge variant={audioVariant(d.type)} class="text-[10px]">{d.type}</Badge>
            </div>
          {/each}
        </div>
      {/if}

      <div class="mt-4 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Input</div>
      {#if audio.inputs.length === 0}
        <div class="mt-1 text-[12px] text-muted-foreground">No input devices.</div>
      {:else}
        <div class="mt-2 space-y-1">
          {#each audio.inputs as d, idx (d.id ?? d.name + ':' + idx)}
            {@const Icon = iconFor(d.type)}
            <div class="flex items-center gap-2 rounded-md border border-border/50 bg-muted/10 px-3 py-2">
              <Icon class="size-4 text-muted-foreground" />
              <span class="min-w-0 flex-1 truncate text-[12px] font-medium text-foreground">{d.name}</span>
              <Badge variant={audioVariant(d.type)} class="text-[10px]">{d.type}</Badge>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>

