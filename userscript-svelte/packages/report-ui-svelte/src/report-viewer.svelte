<script lang="ts">
  import './styles.css';

  import Badge from './components/ui/badge.svelte';
  import Input from './components/ui/input.svelte';
  import NodeBody from './components/node/NodeBody.svelte';

  import type { Marker } from '@prv/report-core';
  import type { NodeModel } from '@prv/report-viewmodel';
  import { iconComponentForKey } from './icon';

  let {
    context = 'reportus',
    nodes,
    markers = []
  }: {
    context?: string;
    nodes: NodeModel[];
    markers?: Marker[];
  } = $props();

  let query = $state('');
  let open = $state(new Set<string>());
  let isWidened = $state(false);
  let subSectionStates = $state<Record<string, boolean>>({});

  function toggleNode(id: string) {
    if (open.has(id)) {
      open = new Set(Array.from(open).filter((x) => x !== id));
    } else {
      open = new Set([...Array.from(open), id]);
    }
  }
</script>

<div class={`rv-shell ${isWidened ? 'widened' : ''}`}>
  <header class="rv-header">
    <div>
      <p class="rv-title">Report Viewer</p>
      <Badge variant="default" class="text-xs">{context}</Badge>
    </div>
  </header>

  <Input
    type="search"
    placeholder="Search nodes, logs, assets..."
    bind:value={query}
    aria-label="Search nodes"
    class="mb-2.5"
  />

  <div class="rv-scroll">
    {#each nodes as node (node.id)}
      <div class="rv-node">
        <div
          class="rv-node-header"
          role="button"
          tabindex="0"
          onclick={() => toggleNode(node.id)}
          onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleNode(node.id)}
        >
          <div class="rv-node-title">
            <span>{node.title}</span>
            {#if node.badges.length}
              <span class="rv-tags">
                {#each node.badges as badge (badge.label)}
                  {@const variant =
                    badge.tone === 'danger'
                      ? 'destructive'
                      : badge.tone === 'warn'
                        ? 'default'
                        : 'outline'}
                  <Badge {variant} class="text-[11px] gap-1">
                    {@const IconComponent = iconComponentForKey(badge.iconKey)}
                    {#if IconComponent}
                      <IconComponent size={12} />
                    {/if}
                    {badge.label}
                  </Badge>
                {/each}
              </span>
            {/if}
          </div>
          <span>{open.has(node.id) ? '−' : '+'}</span>
        </div>

        {#if open.has(node.id)}
          <div class="rv-node-body">
            <NodeBody {node} {markers} query={query} subSectionStates={subSectionStates} />
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>
