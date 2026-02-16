// PRV Prelude
// This file is meant to be loaded FIRST via userscript @require.
// In beta mode it prevents legacy PRV bootstrap from running (it attaches via window 'load' listener),
// while still allowing the legacy files to be loaded (so stable mode remains unchanged).

(function () {
  'use strict';

  const BETA_TOGGLE_KEY = 'prv_use_beta';
  const isMainReportRoute = (() => {
    try {
      if (location.hostname !== 'reportus.prls.net') return false;
      // Only: /webapp/reports/{id} (optional trailing slash). Query params allowed.
      return /^\/webapp\/reports\/\d+\/?$/.test(location.pathname);
    } catch {
      return false;
    }
  })();

  let useBeta = false;
  try {
    useBeta = typeof GM_getValue === 'function' ? !!GM_getValue(BETA_TOGGLE_KEY, false) : false;
  } catch {
    useBeta = false;
  }

  // Expose for debugging / main script
  try {
    window.__PRV_USE_BETA = useBeta;
  } catch {
    // ignore
  }

  // Only block legacy bootstrap on the main report route.
  // On sub-routes (e.g. /webapp/reports/{id}/files/...), we keep legacy PRV behavior even if beta is enabled.
  if (!useBeta || !isMainReportRoute) return;

  const origAdd = window.addEventListener.bind(window);

  // Block legacy bootstrap (RvMain.js uses window.addEventListener('load', ...))
  window.addEventListener = function (type, listener, options) {
    if (type === 'load') {
      try {
        console.debug('[PRV] beta enabled: blocked window load listener registration');
      } catch {
        // ignore
      }
      return;
    }
    return origAdd(type, listener, options);
  };
})();

