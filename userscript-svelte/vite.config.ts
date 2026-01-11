import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import monkey from 'vite-plugin-monkey';
import path from 'path';

export default defineConfig({
  plugins: [
    tailwindcss(),
    svelte({
      compilerOptions: { css: 'injected', dev: false }
    }),
    monkey({
      entry: 'src/main.ts',
      userscript: {
        name: 'RV Userscript (Svelte)',
        namespace: 'https://github.com/alludo',
        version: '0.0.1',
        match: [
          'https://reportus.prls.net/webapp/reports/*',
          'https://security-monitors.prls.net/user_audit/api/mail.py*'
        ],
        grant: [
          'GM_xmlhttpRequest',
          'GM_setValue',
          'GM_getValue',
          'GM_setClipboard',
          'GM_info'
        ],
        runAt: 'document-end'
      },
      build: { fileName: 'rv-userscript-svelte.user.js' }
    })
  ],
  resolve: {
    conditions: ['browser', 'default'],
    alias: {
      $lib: path.resolve('./src/lib'),
      $ui: path.resolve('./src/ui')
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'import.meta.env.SSR': 'false'
  },
  build: { target: 'esnext', minify: false, ssr: false }
});
