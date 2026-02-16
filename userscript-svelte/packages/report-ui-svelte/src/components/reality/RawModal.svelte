<script lang="ts">
  import Badge from '../ui/badge.svelte';
  import { Button } from '../ui/button';
  import Input from '../ui/input.svelte';
  import { X, Copy, Download, WrapText, Loader2 } from '@lucide/svelte';

  type ModalItem =
    | { kind: 'node'; nodeKey: string; title: string }
    | { kind: 'file'; filePath: string; filename: string; title: string };

  let {
    reportId,
    open,
    item,
    onClose
  }: {
    reportId: string;
    open: boolean;
    item: ModalItem | null;
    onClose: () => void;
  } = $props();

  const DEFAULT_MAX_BYTES = 2 * 1024 * 1024;
  const MAX_MAX_BYTES = 10 * 1024 * 1024;

  let loading = $state(false);
  let error = $state<string | null>(null);
  let truncated = $state(false);
  let source = $state<string | null>(null);

  let maxBytes = $state(DEFAULT_MAX_BYTES);
  let text = $state<string | null>(null);
  let imageUrl = $state<string | null>(null);
  let imageType = $state<string | null>(null);
  let wrap = $state(true);

  function encodeFilePath(filePath: string): string {
    return filePath.split('/').map(encodeURIComponent).join('/');
  }

  function isImageFile(filename: string): boolean {
    const lower = filename.toLowerCase();
    return lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.gif');
  }

  function contentTypeForFilename(filename: string): string {
    const lower = filename.toLowerCase();
    if (lower.endsWith('.png')) return 'image/png';
    if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
    if (lower.endsWith('.gif')) return 'image/gif';
    return 'application/octet-stream';
  }

  async function fetchText(url: string): Promise<{ text: string; truncated: boolean; source: string | null }> {
    const res = await fetch(url);
    const t = res.headers.get('x-prv-truncated') === 'true';
    const srcFile = res.headers.get('x-prv-source-file');
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status}${body ? `: ${body.slice(0, 200)}` : ''}`);
    }
    return { text: await res.text(), truncated: t, source: srcFile };
  }

  async function fetchBytes(url: string): Promise<{ bytes: Uint8Array; truncated: boolean }> {
    const res = await fetch(url);
    const t = res.headers.get('x-prv-truncated') === 'true';
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status}${body ? `: ${body.slice(0, 200)}` : ''}`);
    }
    const ab = await res.arrayBuffer();
    return { bytes: new Uint8Array(ab), truncated: t };
  }

  async function load() {
    if (!open || !item) return;

    loading = true;
    error = null;
    truncated = false;
    source = null;
    text = null;
    imageType = null;

    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
      imageUrl = null;
    }

    try {
      if (item.kind === 'node') {
        const url = `/api/reports/${encodeURIComponent(reportId)}/raw/node/${encodeURIComponent(item.nodeKey)}?maxBytes=${maxBytes}`;
        const res = await fetchText(url);
        text = res.text;
        truncated = res.truncated;
        source = res.source;
        return;
      }

      if (isImageFile(item.filename)) {
        const url = `/api/reports/${encodeURIComponent(reportId)}/files-raw/${encodeFilePath(item.filePath)}?maxBytes=${maxBytes}`;
        const res = await fetchBytes(url);
        imageType = contentTypeForFilename(item.filename);
        imageUrl = URL.createObjectURL(new Blob([res.bytes], { type: imageType }));
        truncated = res.truncated;
        return;
      }

      const url = `/api/reports/${encodeURIComponent(reportId)}/files/${encodeFilePath(item.filePath)}?maxBytes=${maxBytes}`;
      const res = await fetchText(url);
      text = res.text;
      truncated = res.truncated;
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    } finally {
      loading = false;
    }
  }

  $effect(() => {
    void load();
  });

  async function copyToClipboard() {
    if (!text) return;
    await navigator.clipboard.writeText(text);
  }

  function downloadText() {
    if (!text || !item) return;
    const filename = item.kind === 'node' ? `${item.nodeKey}.txt` : item.filename;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 250);
  }

  async function downloadFile() {
    if (!item || item.kind !== 'file') return;
    const url = `/api/reports/${encodeURIComponent(reportId)}/files-raw/${encodeFilePath(item.filePath)}?maxBytes=${MAX_MAX_BYTES}`;
    const res = await fetch(url);
    if (!res.ok) return;
    const ab = await res.arrayBuffer();
    const blob = new Blob([ab], { type: res.headers.get('content-type') ?? 'application/octet-stream' });
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = href;
    a.download = item.filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(href), 250);
  }
</script>

{#if open && item}
  <div class="fixed inset-0 z-50">
    <div
      class="absolute inset-0 bg-black/40"
      role="button"
      tabindex="0"
      onclick={onClose}
      onkeydown={(e) => (e.key === 'Escape' ? onClose() : null)}
    ></div>

    <div class="absolute inset-3 md:inset-8 rounded-xl border border-border shadow-2xl overflow-hidden flex flex-col bg-white text-slate-900">
      <div class="flex items-center justify-between gap-2 px-4 py-3 border-b border-border">
        <div class="min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <div class="font-semibold truncate">{item.title}</div>
            {#if truncated}
              <Badge variant="default" class="text-[10px]">truncated</Badge>
            {/if}
            {#if source}
              <Badge variant="outline" class="text-[10px]">from {source}</Badge>
            {/if}
          </div>
          <div class="text-[11px] text-muted-foreground">
            maxBytes: {maxBytes.toLocaleString()}
          </div>
        </div>

        <div class="flex items-center gap-2">
          {#if text}
            <Button variant="outline" size="sm" onclick={copyToClipboard} title="Copy to clipboard">
              <Copy class="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onclick={downloadText} title="Download">
              <Download class="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onclick={() => (wrap = !wrap)} title="Toggle wrap">
              {#if wrap}
                <WrapText class="h-4 w-4" />
              {:else}
                <WrapText class="h-4 w-4" />
              {/if}
            </Button>
          {:else if imageUrl}
            <Button variant="outline" size="sm" onclick={downloadFile} title="Download">
              <Download class="h-4 w-4" />
            </Button>
          {/if}

          <Button variant="ghost" size="sm" onclick={onClose} title="Close">
            <X class="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div class="px-4 py-3 border-b border-border flex items-center gap-2">
        <Input
          class="max-w-[220px]"
          type="number"
          min={0}
          max={MAX_MAX_BYTES}
          value={String(maxBytes)}
          oninput={(e) => {
            const v = Number((e.currentTarget as HTMLInputElement).value);
            if (!Number.isFinite(v)) return;
            maxBytes = Math.max(0, Math.min(MAX_MAX_BYTES, v));
          }}
        />
        <Button variant="outline" size="sm" onclick={() => load()}>
          Reload
        </Button>
        {#if truncated && maxBytes < MAX_MAX_BYTES}
          <Button
            variant="outline"
            size="sm"
            onclick={() => {
              maxBytes = Math.min(MAX_MAX_BYTES, Math.max(maxBytes * 2, DEFAULT_MAX_BYTES));
            }}
          >
            Show more
          </Button>
        {/if}
      </div>

      <div class="flex-1 overflow-auto bg-white">
        {#if loading}
          <div class="p-8 text-sm text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 class="h-4 w-4 animate-spin" />
            Fetching…
          </div>
        {:else if error}
          <div class="p-6 text-sm text-red-600">{error}</div>
        {:else if imageUrl}
          <div class="p-4 flex items-center justify-center bg-black/5">
            <img src={imageUrl} alt={item.title} class="max-h-[80vh] max-w-full object-contain rounded-md" />
          </div>
        {:else if text !== null}
          <pre class={`p-4 text-[12px] font-mono bg-slate-50 ${wrap ? 'whitespace-pre-wrap' : 'whitespace-pre'} break-words`}>{text}</pre>
        {:else}
          <div class="p-6 text-sm text-muted-foreground">No content</div>
        {/if}
      </div>
    </div>
  </div>
{/if}
