<script lang="ts">
  import { builtinSectionIcons, reportusParserIcons } from '$lib/reportusIcons';

  type IconRow = { key: string; url: string };

  const builtins: IconRow[] = [
    { key: 'builtin.hostApple', url: builtinSectionIcons.hostApple },
    { key: 'builtin.parallels', url: builtinSectionIcons.parallels },
    { key: 'builtin.vm', url: builtinSectionIcons.vm }
  ];

  const legacy: IconRow[] = Object.entries(reportusParserIcons).map(([key, url]) => ({ key, url }));

  let filter = $state('');

  let filteredBuiltins = $derived(
    builtins.filter((i) => i.key.toLowerCase().includes(filter.trim().toLowerCase()))
  );
  let filteredLegacy = $derived(
    legacy.filter((i) => i.key.toLowerCase().includes(filter.trim().toLowerCase()))
  );

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore (some browsers disallow clipboard without permissions)
    }
  }
</script>

<main class="p-4 max-w-6xl">
  <div class="mb-3 flex items-center justify-between gap-2 flex-wrap">
    <div class="text-[14px] font-bold">Icon gallery (lab)</div>
    <a class="text-[12px] underline underline-offset-2 text-muted-foreground" href="/">
      Back
    </a>
  </div>

  <div class="mb-4 flex items-center gap-2 flex-wrap">
    <input
      class="rv-search max-w-sm"
      placeholder="Filter (e.g. gpu, usb, warning)"
      bind:value={filter}
    />
    <div class="text-[12px] text-muted-foreground">{filteredLegacy.length} legacy icons</div>
  </div>

  <section class="mb-6">
    <div class="text-[12px] uppercase tracking-wide text-muted-foreground font-bold mb-2">Builtins</div>
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
      {#each filteredBuiltins as it (it.key)}
        <div class="rounded-lg border border-border bg-background p-2 hover:bg-muted/20">
          <div class="flex items-center gap-2">
            <button type="button" class="shrink-0" onclick={() => copy(it.url)} title="Copy URL">
              <img src={it.url} alt={it.key} class="w-7 h-7" />
            </button>
            <button
              type="button"
              class="text-left text-[12px] font-mono break-all"
              onclick={() => copy(it.key)}
              title="Copy key"
            >
              {it.key}
            </button>
          </div>
        </div>
      {/each}
    </div>
  </section>

  <section>
    <div class="text-[12px] uppercase tracking-wide text-muted-foreground font-bold mb-2">
      Legacy set (Reportus parser icons)
    </div>
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
      {#each filteredLegacy as it (it.key)}
        <div class="rounded-lg border border-border bg-background p-2 hover:bg-muted/20">
          <div class="flex items-center gap-2">
            <button type="button" class="shrink-0" onclick={() => copy(it.url)} title="Copy URL">
              <img src={it.url} alt={it.key} class="w-7 h-7" />
            </button>
            <button
              type="button"
              class="text-left text-[12px] font-mono break-all"
              onclick={() => copy(it.key)}
              title="Copy key"
            >
              {it.key}
            </button>
          </div>
        </div>
      {/each}
    </div>
  </section>
</main>
