import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  ssr: {
    // Workspace packages export TS/Svelte source. Ensure Vite transforms them for SSR
    // instead of letting Node try to import `.ts` directly.
    noExternal: [
      '@prv/report-api',
      '@prv/report-core',
      '@prv/report-viewmodel',
      '@prv/report-ui-svelte',
      '@prv/report-ai'
    ]
  }
});
