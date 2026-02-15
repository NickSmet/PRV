import { mount } from 'svelte';
import App from './App.svelte';
import appStyles from '@prv/report-ui-svelte/styles.css?inline';
import { bootstrap } from './lib/bootstrap';
import { loadReportFromXML, loadFullReport } from './lib/reportLoader';

const HOST_ID = 'rv-userscript';
const WRAPPER_ID = 'rv-userscript-wrapper';

function injectStyles(root: Document | ShadowRoot) {
  if (root instanceof ShadowRoot) {
    const styleTag = root.querySelector<HTMLStyleElement>('style[data-app-styles]');
    if (!styleTag) {
      const injected = document.createElement('style');
      injected.dataset.appStyles = 'true';
      injected.textContent = appStyles;
      root.appendChild(injected);
    }
  } else {
    if (!document.head.querySelector('style[data-app-styles]')) {
      const injected = document.createElement('style');
      injected.dataset.appStyles = 'true';
      injected.textContent = appStyles;
      document.head.appendChild(injected);
    }
  }
}

function cleanup() {
  const wrapper = document.getElementById(WRAPPER_ID);
  if (wrapper) {
    wrapper.remove();
  }
  const floatingHost = document.getElementById(HOST_ID);
  if (floatingHost && floatingHost.parentElement === document.body) {
    floatingHost.remove();
  }
}

function createInlinePanelHost(): HTMLElement | null {
  const host = location.hostname;
  const reportus = host.includes('reportus.prls.net');

  const existingPanel = document.getElementById(HOST_ID);
  if (existingPanel) {
    return existingPanel;
  }

  // Try to find the main content container
  // Look for #app, main, or fallback to body
  let contentContainer = document.querySelector<HTMLElement>('#app')
    || document.querySelector<HTMLElement>('main')
    || document.body;

  // For reportus, try to find a better container
  if (reportus) {
    const reportContent = document.querySelector<HTMLElement>('.container-fluid, .container');
    if (reportContent) {
      contentContainer = reportContent;
    }
  }

  if (!contentContainer) {
    console.warn('[PRV] createInlinePanelHost: content container not found, falling back to floating panel');
    return null;
  }

  let wrapper = document.getElementById(WRAPPER_ID);
  if (!wrapper) {
    wrapper = document.createElement('div');
    wrapper.id = WRAPPER_ID;
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'stretch';
    wrapper.style.gap = '16px';
    wrapper.style.width = '100%';
    wrapper.style.minHeight = '100vh';

    // Move all existing children into wrapper
    const children = Array.from(contentContainer.children);
    const leftColumn = document.createElement('div');
    leftColumn.style.flex = '0 0 35%'; // Fixed 50% for left content
    leftColumn.style.minWidth = '0';

    children.forEach(child => {
      leftColumn.appendChild(child);
    });

    wrapper.appendChild(leftColumn);
    contentContainer.appendChild(wrapper);
  }

  const panel = document.createElement('div');
  panel.id = HOST_ID;
  panel.style.flex = '0 0 65%'; // Fixed 65% width sidebar
  panel.style.minWidth = '0';

  wrapper.appendChild(panel);

  return panel;
}

function initialize() {
  cleanup();

  const inlineHost = createInlinePanelHost();

  if (inlineHost) {
    injectStyles(document);
    mount(App, { target: inlineHost, props: { context: 'reportus' } });
    return;
  }

  // Fallback: use floating Shadow/non-Shadow host (e.g., if layout probing fails)
  const { root } = bootstrap(App, { props: { context: 'reportus' }, useShadow: false, id: HOST_ID });
  injectStyles(root);
}

// Expose report loader functions globally for dev server and testing
(window as any).loadReportFromXML = loadReportFromXML;
(window as any).loadFullReport = loadFullReport;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}
