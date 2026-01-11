import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import monkey from 'vite-plugin-monkey';
import path from 'path';

export default defineConfig({
  plugins: [
    svelte({
      compilerOptions: {
        css: 'injected',
        dev: false
      }
    }),
    monkey({
      entry: 'src/main-google.ts',
      userscript: {
        name: 'RV Userscript (Google POC)',
        namespace: 'https://github.com/alludo',
        version: '0.0.1',
        match: ['https://www.google.com/*'],
        grant: 'none'
      },
      build: {
        fileName: 'rv-userscript-svelte-google.user.js'
      }
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
  build: {
    target: 'esnext',
    minify: false,
    ssr: false
  }
});
