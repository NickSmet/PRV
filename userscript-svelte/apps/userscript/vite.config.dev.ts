import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';
import fs from 'fs';
import chokidar from 'chokidar';

const REPORT_XML_PATH = process.env.REPORT_XML_PATH || path.join(process.env.HOME || process.cwd(), 'Downloads/Report.xml');

export default defineConfig({
  plugins: [
    tailwindcss(),
    svelte({
      compilerOptions: { css: 'injected', dev: true }
    }),
    {
      name: 'report-xml-hmr',
      configureServer(server) {
        // Serve the XML file
        server.middlewares.use('/api/report.xml', (req, res) => {
          try {
            const xmlContent = fs.readFileSync(REPORT_XML_PATH, 'utf-8');
            res.setHeader('Content-Type', 'application/xml');
            res.end(xmlContent);
          } catch (error: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              error: 'Failed to read Report.xml',
              message: error.message,
              path: REPORT_XML_PATH
            }));
          }
        });

        // Watch the XML file for changes and trigger full reload
        if (fs.existsSync(REPORT_XML_PATH)) {
          const watcher = chokidar.watch(REPORT_XML_PATH, {
            ignoreInitial: true
          });

          watcher.on('change', () => {
            console.log('[vite] Report.xml changed, triggering full reload...');
            // Send custom event for scroll-preserving reload
            server.ws.send({
              type: 'custom',
              event: 'xml-reload-with-scroll'
            });
          });

          server.httpServer?.on('close', () => {
            watcher.close();
          });

          console.log(`[vite] Watching ${REPORT_XML_PATH} for changes...`);
        } else {
          console.warn(`[vite] Report.xml not found at: ${REPORT_XML_PATH}`);
        }
      }
    }
  ],
  resolve: {
    conditions: ['browser', 'default'],
    alias: {
      $lib: path.resolve('./src/lib')
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('development'),
    'import.meta.env.SSR': 'false'
  },
  root: '.',
  publicDir: 'public',
  server: {
    port: 3000,
    open: false
  },
  build: {
    target: 'esnext',
    minify: false,
    lib: {
      entry: path.resolve(__dirname, 'src/dev-main.ts'),
      name: 'PRVDev',
      formats: ['es'],
      fileName: 'prv-dev'
    },
    outDir: 'dist',
    emptyOutDir: false
  }
});
