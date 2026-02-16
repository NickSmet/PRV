<script lang="ts">
  import * as TreeView from '$lib/components/ui/tree-view';
  import { UnixPermissions } from '$ui/unix-permissions';
  import type { LsEntry } from '../../../services/utils/lsLr';
  import LaunchdInfoTreeNode from './launchd-info-tree-node.svelte';

  let { node }: { node: LsEntry } = $props();

  let owner = $derived(node.meta?.owner);
  let size = $derived(node.meta?.sizeHuman ?? (node.meta?.sizeBytes !== undefined ? `${node.meta.sizeBytes} B` : undefined));
  let modified = $derived(node.meta?.modified?.raw);
  let permissions = $derived(node.meta?.permissions);
</script>

{#if node.kind === 'folder'}
  <TreeView.Folder name={node.name}>
    {#snippet meta({ name, open })}
      <div class="min-w-0 text-right font-mono text-[10px] text-muted-foreground">
        {#if owner}
          <span class={owner === 'root' || owner === '_unknown' ? 'text-destructive' : ''}>{owner}</span>
        {/if}
      </div>
    {/snippet}

    {#snippet children()}
      {#each node.children as child (child.path ?? `${node.name}:${child.name}`)}
        <LaunchdInfoTreeNode node={child} />
      {/each}
    {/snippet}
  </TreeView.Folder>
{:else}
  <TreeView.File name={node.name} type="button">
    {#snippet meta({ name })}
      <div class="grid min-w-0 grid-cols-[max-content_max-content_1fr] items-center justify-end gap-x-2 text-right font-mono text-[10px] text-muted-foreground">
        <span class="whitespace-nowrap">{size ?? '—'}</span>
        <span class="whitespace-nowrap">
          {#if permissions}
            <UnixPermissions permissions={permissions} variant="subtle" />
          {:else}
            —
          {/if}
        </span>
        <span class="min-w-0 truncate whitespace-nowrap">
          {#if owner}
            <span class={owner === 'root' || owner === '_unknown' ? 'text-destructive' : ''}>{owner}</span>
          {:else}
            —
          {/if}
          {#if modified}
            <span class="opacity-70"> {modified}</span>
          {/if}
        </span>
      </div>
    {/snippet}
  </TreeView.File>
{/if}

