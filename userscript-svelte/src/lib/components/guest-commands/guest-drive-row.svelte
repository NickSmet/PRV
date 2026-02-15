<script lang="ts">
  import { Badge } from '$lib/components/ui/badge';
  import { CopyButton } from '$ui/copy-button';
  import type { GuestNetworkDrive } from '../../../services/parseGuestCommands';
  import { driveStatusBadge, driveStatusColor } from './guest-commands-utils';

  let { drive }: { drive: GuestNetworkDrive } = $props();

  const dot = $derived(driveStatusColor(drive.status));
  const badge = $derived(driveStatusBadge(drive.status, drive.statusRaw));
  const letter = $derived(drive.letter ? `${drive.letter}:` : '—');
</script>

<div class="flex items-center gap-3 py-2 border-b border-border/40 last:border-b-0 text-[13px]">
  <span class={`size-2 rounded-full ${dot}`}></span>

  <span class="w-9 font-mono text-[13px] font-bold text-foreground">{letter}</span>
  <span class="text-muted-foreground">→</span>

  <div class="min-w-0 flex-1">
    {#if drive.remotePath}
      <CopyButton
        text={drive.remotePath}
        size="sm"
        variant="ghost"
        class="h-auto min-h-6 px-2 font-mono text-[12px] text-muted-foreground hover:text-foreground whitespace-normal break-all text-left"
      >
        {drive.remotePath}
      </CopyButton>
    {:else}
      <span class="font-mono text-[12px] text-muted-foreground">—</span>
    {/if}

    {#if drive.provider}
      <div class="mt-0.5 text-[11px] text-muted-foreground/80">{drive.provider}</div>
    {/if}
  </div>

  <Badge variant="outline" class={`shrink-0 text-[10px] ${badge.classes}`}>
    {badge.label}
  </Badge>
</div>

