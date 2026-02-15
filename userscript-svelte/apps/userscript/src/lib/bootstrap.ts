import { mount } from 'svelte';

type MountableComponent = typeof import('svelte').SvelteComponent;

interface BootstrapOptions {
  id?: string;
  hostStyles?: string;
  props?: Record<string, unknown>;
  useShadow?: boolean;
}

export function bootstrap(App: MountableComponent, options: BootstrapOptions = {}) {
  const { id = 'rv-userscript', hostStyles, props = {}, useShadow = false } = options;

  const host = document.createElement('div');
  host.id = id;
  host.className = 'rv-userscript-host';
  host.style.cssText = `
    position: fixed !important;
    top: 72px !important;
    right: 12px !important;
    z-index: 99999999 !important;
    pointer-events: none !important;
  `;

  if (hostStyles) {
    host.style.cssText += hostStyles;
  }

  let container: HTMLElement;
  let root: ShadowRoot | Document;

  if (useShadow) {
    const shadowRoot = host.attachShadow({ mode: 'open' });
    container = document.createElement('div');
    container.style.cssText = 'pointer-events: auto;';
    shadowRoot.appendChild(container);
    root = shadowRoot;
  } else {
    container = document.createElement('div');
    container.style.cssText = 'pointer-events: auto;';
    host.appendChild(container);
    root = document;
  }

  document.body.appendChild(host);

  const app = mount(App, { target: container, props });

  return { app, root, host };
}
