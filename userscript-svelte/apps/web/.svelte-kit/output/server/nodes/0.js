

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const imports = ["_app/immutable/nodes/0.Cio4WjF1.js","_app/immutable/chunks/0tib0vb6.js","_app/immutable/chunks/C4VK0hGy.js","_app/immutable/chunks/CwPng9Zb.js"];
export const stylesheets = ["_app/immutable/assets/0.CO6QqlUi.css"];
export const fonts = [];
