/**
 * Dev Server for Report Viewer Testing
 *
 * Simple Express server that:
 * - Serves the built Svelte app
 * - Loads Report.xml from disk
 * - Provides hot reload during development
 * - Focuses on XML parsing/rendering (no attachments)
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chokidar from 'chokidar';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Path to your Report.xml file (adjust as needed)
const REPORT_XML_PATH = process.env.REPORT_XML_PATH || path.join(__dirname, '../../Report.xml');

// Serve static files from dist with proper MIME types
app.use('/dist', express.static(path.join(__dirname, 'dist'), {
  setHeaders: (res, filepath) => {
    if (filepath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (filepath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  },
  index: false,
  fallthrough: true
}));

// Serve static files from src (for CSS, etc)
app.use('/src', express.static(path.join(__dirname, 'src')));

// Serve node_modules for imports
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));

// API endpoint to get report XML
app.get('/api/report.xml', (req, res) => {
  try {
    const xmlContent = fs.readFileSync(REPORT_XML_PATH, 'utf-8');
    res.set('Content-Type', 'application/xml');
    res.send(xmlContent);
  } catch (error) {
    console.error('Error reading Report.xml:', error.message);
    res.status(500).json({
      error: 'Failed to read Report.xml',
      message: error.message,
      path: REPORT_XML_PATH
    });
  }
});

// Main test page
app.get('/', (req, res) => {
  const cacheBuster = Date.now();
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Report Viewer Dev Server</title>
  <link rel="stylesheet" href="/dist/prv-dev.css?v=${cacheBuster}">
  <style>
    /* Reset only for dev server wrapper, not the app */
    body, .dev-header, .dev-status, .sidebar {
      margin: 0;
      padding: 0;
    }

    body {
      box-sizing: border-box;
      font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #f3f4f6;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .dev-header {
      background: #111827;
      color: white;
      padding: 12px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .dev-header h1 {
      font-size: 18px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .dev-status {
      display: flex;
      align-items: center;
      gap: 15px;
      font-size: 13px;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 6px;
      background: rgba(255,255,255,0.1);
      font-size: 12px;
    }

    .status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .status-indicator.loading {
      background: #f59e0b;
    }

    .status-indicator.error {
      background: #ef4444;
    }

    .app-container {
      flex: 1;
      display: flex;
      padding: 20px;
      gap: 20px;
      overflow: hidden;
    }

    .sidebar {
      flex: 0 0 300px;
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      overflow-y: auto;
    }

    .sidebar h2 {
      font-size: 14px;
      font-weight: 700;
      color: #111827;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e5e7eb;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 13px;
      border-bottom: 1px solid #f3f4f6;
    }

    .info-label {
      color: #6b7280;
      font-weight: 600;
    }

    .info-value {
      color: #111827;
      font-family: 'Monaco', monospace;
      font-size: 12px;
    }

    .panel-container {
      flex: 1;
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    #app {
      flex: 1;
      overflow: auto;
    }

    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #6b7280;
      font-size: 14px;
    }

    /* Scope button styles to dev server header only */
    .dev-header button {
      background: #2563eb;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
    }

    .dev-header button:hover {
      background: #1d4ed8;
    }
  </style>
</head>
<body>
  <div class="dev-header">
    <h1>
      🧪 Report Viewer Dev Server
    </h1>
    <div class="dev-status">
      <div class="status-badge">
        <div class="status-indicator" id="statusIndicator"></div>
        <span id="statusText">Loading...</span>
      </div>
      <button onclick="location.reload()">Reload</button>
    </div>
  </div>

  <div class="app-container">
    <div class="sidebar">
      <h2>📊 Debug Info</h2>
      <div class="info-row">
        <span class="info-label">Report XML:</span>
        <span class="info-value" id="xmlStatus">-</span>
      </div>
      <div class="info-row">
        <span class="info-label">Size:</span>
        <span class="info-value" id="xmlSize">-</span>
      </div>
      <div class="info-row">
        <span class="info-label">Nodes Extracted:</span>
        <span class="info-value" id="nodesCount">-</span>
      </div>
      <div class="info-row">
        <span class="info-label">Build Time:</span>
        <span class="info-value" id="buildTime">-</span>
      </div>

      <h2 style="margin-top: 20px;">🌐 Globals</h2>
      <div id="globalsList" style="font-size: 11px; margin-top: 10px;">
        <div class="loading">Loading...</div>
      </div>
    </div>

    <div class="panel-container">
      <div id="app"></div>
    </div>
  </div>

  <!-- Load the standalone dev app - it handles everything -->
  <script type="module" src="/dist/prv-dev.js?v=${cacheBuster}"></script>

  <!-- Monitor for app load and update sidebar -->
  <script>
    function updateSidebar() {
      // Update globals list
      const globals = Object.keys(window)
        .filter(k => k.startsWith('__prv_'))
        .filter(k => window[k] !== undefined);

      const container = document.getElementById('globalsList');
      if (container && globals.length > 0) {
        container.innerHTML = globals
          .sort()
          .map(key => {
            const value = window[key];
            const preview = value ? \`\${value.length} chars\` : 'undefined';
            return \`
              <div class="info-row" style="font-size: 11px;">
                <span class="info-label" style="font-size: 11px;">\${key.replace('__prv_', '')}</span>
                <span class="info-value">\${preview}</span>
              </div>
            \`;
          })
          .join('');

        document.getElementById('nodesCount').textContent = globals.length;
        document.getElementById('xmlStatus').textContent = 'Loaded';

        const statusIndicator = document.getElementById('statusIndicator');
        const statusText = document.getElementById('statusText');
        if (statusIndicator && statusText) {
          statusIndicator.className = 'status-indicator ready';
          statusText.textContent = \`Ready (\${globals.length} nodes)\`;
        }
      }
    }

    // Check periodically for globals to appear
    const checkInterval = setInterval(() => {
      const globals = Object.keys(window).filter(k => k.startsWith('__prv_'));
      if (globals.length > 0) {
        updateSidebar();
        clearInterval(checkInterval);
      }
    }, 100);

    // Also check for XML size
    fetch('/api/report.xml')
      .then(res => res.text())
      .then(xml => {
        const size = xml.length;
        const k = 1024;
        const sizes = ['B', 'KB', 'MB'];
        const i = Math.floor(Math.log(size) / Math.log(k));
        document.getElementById('xmlSize').textContent =
          Math.round(size / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
      });
  </script>
</body>
</html>
  `);
});

// Watch for changes to dist files and log
if (process.env.NODE_ENV !== 'production') {
  const watcher = chokidar.watch(path.join(__dirname, 'dist'), {
    ignored: /(^|[\/\\])\../,
    persistent: true
  });

  watcher.on('change', (filePath) => {
    console.log(`[DEV] File changed: ${path.relative(__dirname, filePath)}`);
    console.log('[DEV] Refresh browser to see changes');
  });
}

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('🧪 Report Viewer Dev Server');
  console.log('================================');
  console.log(`Server: http://localhost:${PORT}`);
  console.log(`Report: ${REPORT_XML_PATH}`);
  console.log('');
  console.log('📝 Instructions:');
  console.log('1. Run `npm run watch:dev` in another terminal');
  console.log(`2. Open http://localhost:${PORT} in your browser`);
  console.log('3. Edit code, save, refresh browser');
  console.log('');

  // Check if Report.xml exists
  if (!fs.existsSync(REPORT_XML_PATH)) {
    console.error('⚠️  ERROR: Report.xml not found at:', REPORT_XML_PATH);
    console.log('');
    console.log('Set REPORT_XML_PATH environment variable:');
    console.log('  REPORT_XML_PATH=/path/to/Report.xml npm run dev:server');
    console.log('');
  }
});
