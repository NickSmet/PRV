import { a as attr } from "../../chunks/attributes.js";
function _page($$renderer) {
  let reportId = "";
  $$renderer.push(`<main class="p-4"><div class="mb-3 flex items-center gap-2"><input class="rv-search max-w-xs" placeholder="Report ID (e.g. 512022712)"${attr("value", reportId)}/> <button class="px-3 py-2 rounded-lg border border-border bg-background text-[13px]">Mental view</button> <button class="px-3 py-2 rounded-lg border border-border bg-background text-[13px]">Mental view (lab icons)</button> <button class="px-3 py-2 rounded-lg border border-border bg-background text-[13px]">Node view</button> <a class="px-3 py-2 rounded-lg border border-border bg-background text-[13px]" href="/lab/icons">Icon gallery</a></div></main>`);
}
export {
  _page as default
};
