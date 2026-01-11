# Svelte 5 Userscript Setup Guide

## Overview
This guide documents the complete setup for using **Svelte 5** in a Tampermonkey/Violentmonkey userscript, including critical fixes for Shadow DOM compatibility.

---

## 1. Package Setup

### Required Dependencies

```json
{
  "devDependencies": {
    "@sveltejs/vite-plugin-svelte": "^5.0.3",
    "svelte": "^5.18.2",
    "typescript": "^5.7.3",
    "vite": "^6.0.1",
    "vite-plugin-monkey": "^7.1.5"
  }
}
```

### Key Version Notes

1. **Vite 6.x** - Required by `vite-plugin-monkey` v7+
2. **Svelte 5.x** - Uses new `mount()` API (not `new App()`)
3. **vite-plugin-monkey 7.x** - Latest userscript builder for Vite
4. **@sveltejs/vite-plugin-svelte 5.x** - Matches Svelte 5

### Installation

```bash
npm install --save-dev svelte@^5.18.2 \
  vite@^6.0.1 \
  @sveltejs/vite-plugin-svelte@^5.0.3 \
  vite-plugin-monkey@^7.1.5 \
  typescript@^5.7.3

# If peer dependency conflicts occur:
npm install --legacy-peer-deps
```

---

## 2. Vite Configuration

### Critical Settings for Shadow DOM + Svelte

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import monkey from 'vite-plugin-monkey';

export default defineConfig({
  plugins: [
    svelte({
      compilerOptions: {
        dev: false,
        // 🔥 CRITICAL: Bundle CSS into JS for Shadow DOM
        css: 'injected',
      },
    }),
    monkey({
      entry: 'src/main.ts',
      userscript: {
        name: 'Your Userscript Name',
        namespace: 'https://github.com/yourorg',
        version: '0.1.0',
        match: ['https://example.com/*'],
        grant: 'none',
      },
      build: {
        fileName: 'your-script.user.js',
      },
    }),
  ],
  
  // 🔥 CRITICAL: Force browser build (not SSR)
  resolve: {
    conditions: ['browser', 'default'],
  },
  
  // 🔥 CRITICAL: Explicitly set environment
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'import.meta.env.SSR': 'false',
  },
  
  build: {
    target: 'esnext',
    minify: false, // Easier debugging
    ssr: false,
  },
});
```

### Why These Settings Matter

| Setting | Purpose | What Breaks Without It |
|---------|---------|------------------------|
| `css: 'injected'` | Bundles Svelte component CSS into JS | Component styles are injected into `<head>` outside Shadow DOM → no styling |
| `resolve.conditions: ['browser', 'default']` | Forces browser-specific Svelte exports | Svelte tries to use SSR mode → `mount()` not available |
| `define: { 'process.env.NODE_ENV': 'production' }` | Explicitly sets browser mode | Svelte may use wrong entry point |
| `define: { 'import.meta.env.SSR': 'false' }` | Disables SSR mode | Runtime errors about server-only functions |

---

## 3. The CSS Problem & Solution

### Problem: Styles Not Applying in Shadow DOM

**Symptom**: Panel renders but has no background, buttons are unstyled (default browser appearance).

**Root Cause**: By default, Svelte injects component styles into `document.head`, which is **outside** the Shadow DOM. Shadow DOM has style encapsulation, so external styles don't affect its contents.

```typescript
// ❌ BAD: Without css: 'injected'
const shadowRoot = shadowHost.attachShadow({ mode: 'open' });
mount(App, { target: shadowRoot }); 
// Svelte injects styles into <head> → Shadow DOM can't see them
```

**Debug Evidence**:
```javascript
// With default Svelte config
shadowRoot.querySelectorAll('style').length; // → 1 (only app.css)
getComputedStyle(panel).backgroundColor; // → rgba(0, 0, 0, 0) (transparent!)
getComputedStyle(button).background; // → rgb(239, 239, 239) (browser default)
```

### Solution: `css: 'injected'` Compiler Option

```typescript
// ✅ GOOD: With css: 'injected'
svelte({
  compilerOptions: {
    css: 'injected', // Bundle CSS with component JS
  },
})
```

**How It Works**:
1. Svelte bundles each component's CSS **into its JavaScript module**
2. When the component mounts, it programmatically injects its styles into the **mount target's DOM**
3. Since we mount inside Shadow DOM, styles go inside Shadow DOM ✅

**Debug Evidence After Fix**:
```javascript
// With css: 'injected'
shadowRoot.querySelectorAll('style').length; // → 3+ (app.css + component styles)
getComputedStyle(panel).backgroundColor; // → rgb(247, 246, 244) ✅
getComputedStyle(button).background; // → linear-gradient(...) ✅
```

---

## 4. Main Entry Point Setup

### Svelte 5 Mount API

```typescript
// src/main.ts
import { mount } from 'svelte'; // ⬅️ Svelte 5 API
import App from './App.svelte';
import appStyles from './app.css?inline'; // Global CSS

function initialize() {
  // 1. Create Shadow Host
  const shadowHost = document.createElement('div');
  shadowHost.id = 'my-userscript';
  shadowHost.style.cssText = `
    position: fixed !important;
    top: 0 !important;
    right: 0 !important;
    z-index: 99999999 !important;
    pointer-events: none !important;
  `;
  
  // 2. Attach Shadow DOM
  const shadowRoot = shadowHost.attachShadow({ mode: 'open' });
  
  // 3. Inject global CSS (if needed)
  const styleSheet = document.createElement('style');
  styleSheet.textContent = appStyles;
  shadowRoot.appendChild(styleSheet);
  
  // 4. Create app container
  const appContainer = document.createElement('div');
  appContainer.style.cssText = 'pointer-events: auto;';
  shadowRoot.appendChild(appContainer);
  
  // 5. Append to page
  document.body.appendChild(shadowHost);
  
  // 6. Mount Svelte app (Svelte 5 syntax)
  mount(App, { target: appContainer }); // ⬅️ NOT new App()
}

// Wait for DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}
```

### Key Changes from Svelte 4

| Svelte 4 | Svelte 5 |
|----------|----------|
| `new App({ target })` | `mount(App, { target })` |
| `app.$destroy()` | `unmount(app)` |
| Import from `'./App.svelte'` | Import `mount` from `'svelte'` |

---

## 5. Shadow DOM Positioning

### Host Element Styling

The shadow host must be positioned with inline styles (`:host` CSS selector doesn't work reliably):

```typescript
// ✅ GOOD: Inline styles on host element
shadowHost.style.cssText = `
  position: fixed !important;
  top: 0 !important;
  right: 0 !important;
  pointer-events: none !important; // Let clicks pass through
`;
```

```css
/* ❌ BAD: :host in component CSS - unreliable */
:host {
  position: fixed;
  top: 0;
  right: 0;
}
```

### Component Positioning Inside Shadow DOM

```svelte
<!-- App.svelte -->
<style>
  .toggle-btn {
    /* position: fixed works inside Shadow DOM! */
    position: fixed;
    top: 15px;
    right: 15px;
  }
  
  .main-panel {
    position: fixed;
    top: 70px;
    right: 15px;
    background: #F7F6F4; /* Will work with css: 'injected' */
  }
</style>
```

---

## 6. Build Scripts

```json
{
  "scripts": {
    "dev": "vite build --watch",
    "build": "vite build",
    "build:google": "vite build --config vite.config.google.ts"
  }
}
```

---

## 7. Debugging Checklist

### If Svelte Fails to Initialize

```javascript
console.log('🔍 Environment check:');
console.log('  process.env.NODE_ENV:', process.env.NODE_ENV);
console.log('  import.meta.env.SSR:', import.meta.env.SSR);
console.log('  mount available:', typeof mount);
```

**Expected Output**:
- `process.env.NODE_ENV: "production"`
- `import.meta.env.SSR: false`
- `mount available: "function"`

### If Styles Are Missing

```javascript
const shadowRoot = /* your shadow root */;

console.log('🎨 Style debug:');
console.log('  Style elements:', shadowRoot.querySelectorAll('style').length);
shadowRoot.querySelectorAll('style').forEach((style, i) => {
  console.log(`  Style ${i} length:`, style.textContent.length);
});

const panel = shadowRoot.querySelector('.main-panel');
if (panel) {
  const computed = getComputedStyle(panel);
  console.log('  Panel background:', computed.backgroundColor);
  console.log('  Panel position:', computed.position);
}
```

**Expected Output**:
- `Style elements: 2+` (global CSS + component CSS)
- `Panel background: rgb(247, 246, 244)` (not transparent)
- `Panel position: fixed`

---

## 8. Common Pitfalls

### ❌ Pitfall 1: Using Svelte 4 Syntax

```typescript
// ❌ WRONG (Svelte 4)
import App from './App.svelte';
const app = new App({ target: container });

// ✅ CORRECT (Svelte 5)
import { mount } from 'svelte';
import App from './App.svelte';
const app = mount(App, { target: container });
```

### ❌ Pitfall 2: Forgetting `css: 'injected'`

Without this option, component styles go to `<head>`, and Shadow DOM won't see them.

```typescript
// ❌ WRONG
svelte() // Uses default: styles to <head>

// ✅ CORRECT
svelte({
  compilerOptions: {
    css: 'injected', // Styles bundled with JS
  },
})
```

### ❌ Pitfall 3: Using Global CSS Resets in Shadow DOM

```css
/* ❌ BAD in app.css */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
```

This affects **all** elements inside Shadow DOM, breaking layout. Use targeted resets:

```css
/* ✅ GOOD in app.css */
button {
  box-sizing: border-box;
  font-family: inherit;
}

div {
  box-sizing: border-box;
}
```

---

## 9. Summary

### Must-Have Configuration

```typescript
// vite.config.ts - MINIMAL WORKING SETUP
export default defineConfig({
  plugins: [
    svelte({
      compilerOptions: {
        css: 'injected', // ⬅️ CRITICAL
      },
    }),
    monkey({
      entry: 'src/main.ts',
      userscript: { /* ... */ },
    }),
  ],
  resolve: {
    conditions: ['browser', 'default'], // ⬅️ CRITICAL
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'), // ⬅️ CRITICAL
  },
});
```

### Key Takeaways

1. **Svelte 5** requires `mount()` API, not `new App()`
2. **Shadow DOM** + Svelte requires `css: 'injected'` compiler option
3. **Browser mode** must be forced via `resolve.conditions` and `define`
4. **Host positioning** must use inline styles, not `:host` CSS
5. **Component positioning** can use `position: fixed` inside Shadow DOM

---

## 10. Testing Your Setup

Create a minimal test to verify everything works:

```typescript
// src/main-test.ts
import { mount } from 'svelte';
import App from './App.svelte';

const shadowHost = document.createElement('div');
shadowHost.style.cssText = 'position: fixed; top: 0; right: 0; z-index: 999999;';
const shadowRoot = shadowHost.attachShadow({ mode: 'open' });
const container = document.createElement('div');
shadowRoot.appendChild(container);
document.body.appendChild(shadowHost);

mount(App, { target: container });

// Debug
setTimeout(() => {
  console.log('✅ Styles in shadow:', shadowRoot.querySelectorAll('style').length);
  const panel = shadowRoot.querySelector('.main-panel');
  if (panel) {
    console.log('✅ Panel background:', getComputedStyle(panel).backgroundColor);
  }
}, 1000);
```

**Expected**: 
- `✅ Styles in shadow: 2+`
- `✅ Panel background: rgb(247, 246, 244)` (not transparent)

---

## References

- [Svelte 5 Migration Guide](https://svelte.dev/docs/svelte/v5-migration-guide)
- [vite-plugin-monkey Documentation](https://github.com/lisonge/vite-plugin-monkey)
- [Shadow DOM MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM)
- [Svelte CSS Compiler Options](https://svelte.dev/docs/svelte/compiler-options#css)

---

**Last Updated**: 2025-11-23  
**Project**: ADP CV Evaluation Service - Userscript Migration to Svelte 5

