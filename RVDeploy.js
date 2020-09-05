// ==UserScript==
// @name     Parallels ReportViewer 
// @version            0.9.9.2
// @author 	Nikolai Smetannikov

// @updateURL    https://gist.github.com/NickSmet/e64f7f26520be1402f3a624071419ad7/raw/reportViewer.user.js

// @include      http://reports.prls.net/Reports/Report.aspx?ReportId=*
// @include      http://reports.parallels.com/Reports/Report.aspx?ReportId=*

// @include      http://reports.prls.net/Reports/Log.aspx?ReportId=*&LogName=*
// @include      http://reports.parallels.com/Reports/Log.aspx?ReportId=*&LogName=*

// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js

// @require      https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/js/bootstrap.min.js
// @resource    bootstrapCSS https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/css/bootstrap.min.css?4

// @require    https://raw.githubusercontent.com/pugetive/plist_parser/master/plist_parser.js?4

// @require    https://www.jsviews.com/download/jsrender.js?2

// @require      https://visjs.github.io/vis-timeline/standalone/umd/vis-timeline-graph2d.min.js?4
// @resource     timelineCSS https://visjs.github.io/vis-timeline/styles/vis-timeline-graph2d.min.css?4

// @require    https://cdn.jsdelivr.net/gh/NickSmet/PRV@master/RVTimeline.js?5

// @require    https://cdn.jsdelivr.net/gh/NickSmet/PRV@master/feedback/feedback.js?2
// @resource   feedbackCSS  https://cdn.jsdelivr.net/gh/NickSmet/PRV@master/feedback/feedback.css?2

// @require    https://cdn.jsdelivr.net/gh/NickSmet/PRV@master/RvMain.js?4

// @resource   reportLightboxCSS https://cdn.jsdelivr.net/gh/NickSmet/PRV@master/lightbox.css

// @run-at       document-start

// @grant          GM_getResourceText
// @grant          GM_addStyle
// @grant          GM_xmlhttpRequest

// @grant          GM_setValue
// @grant          GM_getValue
// @grant          GM_setClipboard

// ==/UserScript==

GM_addStyle(GM_getResourceText('feedbackCSS'));
GM_addStyle(GM_getResourceText('timelineCSS'));
GM_addStyle(GM_getResourceText('RvMainCSS'));

if (window.location.href.match(/Report.aspx\?ReportId=/)){
    GM_addStyle(GM_getResourceText('reportLightboxCSS'));
    GM_addStyle(GM_getResourceText('bootstrapCSS'));}



