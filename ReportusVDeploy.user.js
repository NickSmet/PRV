// ==UserScript==
// @name     Parallels Reportus Viewer 
// @version            1.7.0.1
// @author 	Nikolai Smetannikov

// @updateURL    https://raw.githubusercontent.com/NickSmet/PRV/master/ReportusVDeploy.user.js
// @downloadURL  https://raw.githubusercontent.com/NickSmet/PRV/master/ReportusVDeploy.user.js

// @include     https://reportus.prls.net/webapp/reports/*
// @include     https://reportus.prls.net/webapp/reports/*
// @include        https://security-monitors.prls.net/user_audit/api/mail.py*

// Must be first: beta toggle prelude (blocks legacy bootstrap when beta is enabled)
// @require    https://raw.githubusercontent.com/NickSmet/PRV/master/RvPrelude.js?1

// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js

// @resource    bootstrapCSS https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/css/bootstrap.min.css?5

// @require    https://raw.githubusercontent.com/pugetive/plist_parser/master/plist_parser.js?6

// @require    https://www.jsviews.com/download/jsrender.js?2

// @require    https://cdnjs.cloudflare.com/ajax/libs/elasticlunr/0.9.6/elasticlunr.min.js

// @require      https://raw.githubusercontent.com/abdolence/x2js/refs/heads/master/xml2json.js

// @require      https://visjs.github.io/vis-timeline/standalone/umd/vis-timeline-graph2d.min.js?9
// @resource     timelineCSS https://visjs.github.io/vis-timeline/styles/vis-timeline-graph2d.min.css?9

// @require    https://raw.githubusercontent.com/NickSmet/PRV/master/RvMain.js?14
// @require    https://raw.githubusercontent.com/NickSmet/PRV/master/NodeParser.js?14

// @require    https://raw.githubusercontent.com/NickSmet/PRV/master/feedback/feedback.js
// @resource   feedbackCSS  https://raw.githubusercontent.com/NickSmet/PRV/master/feedback/feedback.css?9

// @require    https://raw.githubusercontent.com/NickSmet/PRV/master/RVTimeline.js

// @resource   reportLightboxCSS https://raw.githubusercontent.com/NickSmet/PRV/master/lightbox.css


// @require    https://raw.githubusercontent.com/NickSmet/PRV/master/bugTemplate/bugTemplate.js?5
// @resource   bgtCSS  https://raw.githubusercontent.com/NickSmet/PRV/master/bugTemplate/bugTemplate.css?9

// @run-at       document-end

// @grant          GM_info
// @grant          GM_getResourceText
// @grant          GM_addStyle
// @grant          GM_xmlhttpRequest

// @grant          GM_setValue
// @grant          GM_getValue
// @grant          GM_setClipboard

// For update checks + beta bundle fetch
// @connect      github.com
// @connect      raw.githubusercontent.com
// @connect      objects.githubusercontent.com
// @connect      chatbotkbimages.blob.core.windows.net

// ==/UserScript==


//for security-monitors.prls.net. Completely separate feature.
if (window.location.href.match(/security-monitors.prls.net/)){
    let response
    if(JSON.parse($("pre").text()).events.length==0){
        response = "No recent events."
    }
    else
    {
        response = JSON.parse($("pre").text()).events.join("\n\n")
    }


    $("pre").text(response)
    
        }


function checkVersion(currentVersion, updateUrl){
    const isBeta = typeof GM_getValue === 'function' ? !!GM_getValue('prv_use_beta', false) : false
    const toggleLabel = isBeta ? 'Switch to stable' : 'TRY NEW VERSION (ALPHA)'

    function normalizeGitHubRawUrl(url) {
      try {
        const m = String(url || '').match(/^https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/raw\/([^\/]+)\/(.+)$/)
        if (m) return `https://raw.githubusercontent.com/${m[1]}/${m[2]}/${m[3]}/${m[4]}`
      } catch (e) {}
      return url
    }

    function renderHeader(newerVersion, usedUpdateUrl) {
      const $existing = $("#prv-loader-header")
      if ($existing.length) $existing.remove()

      const upgradePart = newerVersion && versionCompare(newerVersion, currentVersion)==1
        ? `<button onclick="window.location.href='${usedUpdateUrl}'" style="font-family:Arial; margin-left: 1em; background-color: #f44336;">
            !!!Upgrade to ${newerVersion}!!!
           </button>`
        : ''

      const html = `<div id="prv-loader-header" style="margin:1em">
        ${newerVersion ? `Reports Viewer ver. ${currentVersion}` : `ver. ${currentVersion}`}
        ${upgradePart}
        <button id="prv-beta-toggle" style="font-family:Arial; margin-left: 1em; background-color: #1976d2; color: white;">
          ${toggleLabel}
        </button>
      </div>`

      const $el = $(html)
      $el.insertBefore($("#app"))
      $("#prv-beta-toggle").on("click", function () {
        try { GM_setValue('prv_use_beta', !isBeta) } catch (e) {}
        window.location.reload()
      })
    }

    // Always render immediately (so button exists even if update check fails)
    const normalizedUrl = normalizeGitHubRawUrl(updateUrl)
    renderHeader(null, normalizedUrl)

    try {
      GM_xmlhttpRequest({
        method: "GET",
        url: normalizedUrl,
        onload: function(response) {
          try {
            const newerVersion = response.responseText.match(/@version +([\d\.]+)/)?.[1]
            if (newerVersion) renderHeader(newerVersion, normalizedUrl)
          } catch (e) {
            // keep the already-rendered header
            console.warn('[PRV] version parse failed', e)
          }
        },
        onerror: function (e) {
          console.warn('[PRV] update check failed', e)
        }
      })
    } catch (e) {
      console.warn('[PRV] update check exception', e)
    }


}

checkVersion(GM_info.script.version,GM_info.script.updateURL)

// If beta is enabled, legacy bootstrap is blocked by `RvPrelude.js`.
// Here we load the new Svelte userscript bundle in userscript context.
function isMainReportRoute() {
  try {
    if (location.hostname !== 'reportus.prls.net') return false
    // Only: /webapp/reports/{id} (optional trailing slash). Query params allowed.
    return /^\/webapp\/reports\/\d+\/?$/.test(location.pathname)
  } catch (e) {
    return false
  }
}

if (typeof GM_getValue === 'function' && GM_getValue('prv_use_beta', false) && isMainReportRoute()) {
  (function loadBetaBundle() {
    const url = 'https://chatbotkbimages.blob.core.windows.net/reportus-parser-new/rv-userscript-svelte.user.js'
    GM_xmlhttpRequest({
      method: "GET",
      url,
      onload: function (response) {
        try {
          // eslint-disable-next-line no-eval
          (0, eval)(`${response.responseText}\n//# sourceURL=${url}`)
        } catch (e) {
          console.error('[PRV] beta bundle eval failed', e)
        }
      },
      onerror: function (e) {
        console.error('[PRV] beta bundle load failed', e)
      }
    })
  })()
}


GM_addStyle(GM_getResourceText('feedbackCSS'));
GM_addStyle(GM_getResourceText('timelineCSS'));
GM_addStyle(GM_getResourceText('RvMainCSS'));
GM_addStyle(GM_getResourceText('bgtCSS'));

if (window.location.href.match(/(Report.aspx\?ReportId=|webapp\/reports\/\d)/)){
    GM_addStyle(GM_getResourceText('reportLightboxCSS'));
    GM_addStyle(GM_getResourceText('bootstrapCSS'));
}



