// ==UserScript==
// @name     Parallels Reportus Viewer 
// @version            1.6.7.0
// @author 	Nikolai Smetannikov

// @updateURL    https://github.com/NickSmet/PRV/raw/master/ReportusVDeploy.user.js

// @include     https://reportus.prls.net/webapp/reports/*
// @include     https://reportus.prls.net/webapp/reports/*
// @include        https://security-monitors.prls.net/user_audit/api/mail.py*

// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js

// @resource    bootstrapCSS https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/css/bootstrap.min.css?5

// @require    https://raw.githubusercontent.com/pugetive/plist_parser/master/plist_parser.js?6

// @require    https://www.jsviews.com/download/jsrender.js?2

// @require    https://cdnjs.cloudflare.com/ajax/libs/elasticlunr/0.9.6/elasticlunr.min.js

// @require      https://fe.parallels.com/e787045f0b4d5f21296d5796181cf938/xml2json.js

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
    let updateButton
    GM_xmlhttpRequest({
    method: "GET",
    url: updateUrl,
    onload: function(response) {
        console.log(response.responseText)
    const newerVersion = response.responseText.match(/@version +([\d\.]+)/)[1]
    console.log({newerVersion})
    console.log({currentVersion})
    
    
    
    
    
    if(versionCompare(newerVersion, currentVersion)==1){

    updateButton = $(`<div
    style='margin:1em'>   Reports Viewer ver. ${currentVersion} <button
    onclick="window.location.href='${updateUrl}'" style = "font-family:Arial; margin-left: 1em;
    background-color: #f44336;">!!!Upgrade to ${newerVersion}!!!</button></div>`)
    
    }else{
        updateButton = $(`<div
    style='margin:1em'>   ver. ${currentVersion}</div>`)
    }
    
    updateButton.insertBefore($("#app"))


  }})


}

checkVersion(GM_info.script.version,GM_info.script.updateURL)


GM_addStyle(GM_getResourceText('feedbackCSS'));
GM_addStyle(GM_getResourceText('timelineCSS'));
GM_addStyle(GM_getResourceText('RvMainCSS'));
GM_addStyle(GM_getResourceText('bgtCSS'));

if (window.location.href.match(/(Report.aspx\?ReportId=|webapp\/reports\/\d)/)){
    GM_addStyle(GM_getResourceText('reportLightboxCSS'));
    GM_addStyle(GM_getResourceText('bootstrapCSS'));
}



