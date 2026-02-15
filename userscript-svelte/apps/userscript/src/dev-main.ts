/**
 * Dev Server Entry Point
 *
 * Standalone Svelte app for testing the Report Viewer with real XML data.
 * This is NOT a userscript - it's a normal web app.
 */

import { mount } from 'svelte';
import App from './App.svelte';
import { loadReportFromXML } from './lib/reportLoader';

// Get report ID from URL or environment
const reportId = new URLSearchParams(window.location.search).get('reportId') || 'dev';

// Fetch and load the XML
async function loadXML() {
  console.log('[PRV DEV] Fetching Report.xml...');

  const response = await fetch('/api/report.xml');
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const xmlText = await response.text();
  console.log(`[PRV DEV] Loaded XML (${xmlText.length} bytes)`);

  // Extract all data into window.__prv_* globals
  loadReportFromXML(xmlText);

  return xmlText;
}

// Fetch and load the XML, then mount the app
async function init() {
  try {
    await loadXML();

    // Now mount the app - it will find the existing globals
    console.log('[PRV DEV] Mounting App component...');
    const appContainer = document.getElementById('app');
    if (!appContainer) {
      throw new Error('#app container not found');
    }

    mount(App, {
      target: appContainer,
      props: { context: 'dev' }
    });

    console.log('[PRV DEV] App mounted successfully');

    // Listen for XML file changes via HMR
    if (import.meta.hot) {
      import.meta.hot.on('xml-reload-with-scroll', () => {
        console.log('[PRV DEV] Report.xml changed, reloading page with scroll preservation...');
        // Save scroll position before reload
        const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
        sessionStorage.setItem('prv:xmlReloadScrollY', String(scrollY));
        console.log(`[PRV DEV] Saved scroll position: ${scrollY}px`);
        // Trigger full page reload
        location.reload();
      });
    }

    // Restore scroll position after XML reload
    const savedScrollY = sessionStorage.getItem('prv:xmlReloadScrollY');
    if (savedScrollY) {
      const scrollPos = parseInt(savedScrollY, 10);
      console.log(`[PRV DEV] Restoring scroll position: ${scrollPos}px`);
      // Wait for content to render before scrolling
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollPos);
        sessionStorage.removeItem('prv:xmlReloadScrollY');
      });
    }
  } catch (error) {
    console.error('[PRV DEV] Initialization failed:', error);
    const appContainer = document.getElementById('app');
    if (appContainer) {
      appContainer.innerHTML = `<div style="padding: 20px; color: red;">Error: ${error.message}</div>`;
    }
  }
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
