// ==UserScript==
// @name     Parallels ReportViewer 
// @version            1.0.4.6
// @author 	Nikolai Smetannikov

// @updateURL    https://github.com/NickSmet/PRV/raw/master/RvDeploy.user.js

// @include     https://reportus.prls.net/webapp/reports/*
// @include     http://reportus.prls.net/webapp/reports/*

// @include     https://reports.prls.net/*/Report.aspx?ReportId=*
// @include      https://reports.parallels.com/*/Report.aspx?ReportId=*

// @include      http://reports.prls.net/*/Report.aspx?ReportId=*
// @include      http://reports.parallels.com/*/Report.aspx?ReportId=*

// @include      https://reports.prls.net/*/Log.aspx?ReportId=*&LogName=*
// @include      https://reports.parallels.com/*/Log.aspx?ReportId=*&LogName=*

// @include      http://reports.prls.net/*/Log.aspx?ReportId=*&LogName=*
// @include      http://reports.parallels.com/*/Log.aspx?ReportId=*&LogName=*

// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js

// @require      https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/js/bootstrap.min.js
// @resource    bootstrapCSS https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/css/bootstrap.min.css?5

// @require    https://raw.githubusercontent.com/pugetive/plist_parser/master/plist_parser.js?6

// @require    https://www.jsviews.com/download/jsrender.js?2

// @require    https://cdnjs.cloudflare.com/ajax/libs/elasticlunr/0.9.6/elasticlunr.min.js

// @require      https://cdn.rawgit.com/abdmob/x2js/master/xml2json.js

// @require      https://visjs.github.io/vis-timeline/standalone/umd/vis-timeline-graph2d.min.js?9
// @resource     timelineCSS https://visjs.github.io/vis-timeline/styles/vis-timeline-graph2d.min.css?9

// @require    https://raw.githubusercontent.com/NickSmet/PRV/master/RvMain.js?14

// @require    https://raw.githubusercontent.com/NickSmet/PRV/master/feedback/feedback.js
// @resource   feedbackCSS  https://raw.githubusercontent.com/NickSmet/PRV/master/feedback/feedback.css?9

// @require    https://raw.githubusercontent.com/NickSmet/PRV/master/RVTimeline.js

// @resource   reportLightboxCSS https://raw.githubusercontent.com/NickSmet/PRV/master/lightbox.css


// @require    https://raw.githubusercontent.com/NickSmet/PRV/master/bugTemplate/bugTemplate.js?5
// @resource   bgtCSS  https://raw.githubusercontent.com/NickSmet/PRV/master/bugTemplate/bugTemplate.css?9

// @run-at       document-end

// @grant          GM_getResourceText
// @grant          GM_addStyle
// @grant          GM_xmlhttpRequest

// @grant          GM_setValue
// @grant          GM_getValue
// @grant          GM_setClipboard

// ==/UserScript==

$('<div><a style = "font-family:Arial; margin-left: 1em;" href="https://github.com/NickSmet/PRV/raw/master/RvDeploy.user.js">↻ Check for updates</a></div>').insertBefore($(".headerMain:eq(1)"))

GM_addStyle(GM_getResourceText('feedbackCSS'));
GM_addStyle(GM_getResourceText('timelineCSS'));
GM_addStyle(GM_getResourceText('RvMainCSS'));
GM_addStyle(GM_getResourceText('bgtCSS'));

if (window.location.href.match(/(Report.aspx\?ReportId=|webapp\/reports\/\d)/)){
    GM_addStyle(GM_getResourceText('reportLightboxCSS'));
    GM_addStyle(GM_getResourceText('bootstrapCSS'));
}



