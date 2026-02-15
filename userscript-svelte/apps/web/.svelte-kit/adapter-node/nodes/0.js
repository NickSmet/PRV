

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const imports = ["_app/immutable/nodes/0.DWX4Dc_l.js","_app/immutable/chunks/CWO55960.js","_app/immutable/chunks/DtKEd5CY.js","_app/immutable/chunks/M0Xgmw8O.js"];
export const stylesheets = ["_app/immutable/assets/0.DKuSuft3.css"];
export const fonts = [];
