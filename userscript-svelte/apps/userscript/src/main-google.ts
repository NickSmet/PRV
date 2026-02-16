import App from './App.svelte';
import appStyles from '@prv/report-ui-svelte/styles.css?inline';
import { bootstrap } from './lib/bootstrap';

const HOST_ID = 'rv-userscript-google';

function injectStyles(root: ShadowRoot | Document) {
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
  const existing = document.getElementById(HOST_ID);
  if (existing) {
    existing.remove();
  }
}

function initialize() {
  cleanup();
  const { root } = bootstrap(App, { props: { context: 'google' }, id: HOST_ID, useShadow: true });
  injectStyles(root);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}
