

let x2js = new X2JS();
let bigReportObj
let params
let niceReportObj = {
  getVmName: function(uuid){

   return niceReportObj.pd.vms.filter(obj => {
      return obj.UUID === uuid
    })[0]?.Name||uuid},
report:{},
pd:{
  netConfig:[],
  vms:[]
},
host:{},
virtHw:{},
guestOS:{
  adapters:[],
  networkDrives:[],
  networkAdapters:[]
}

}


let limitLogging = 'AdvancedVmInfo'
let currentlyProcessedNode

function mention(whatTosSay, force) {
  if (force) {
    console.log(whatTosSay)
    return
  }
  if (limitLogging) {
    if (currentlyProcessedNode == limitLogging) { console.log(whatTosSay) }
  }else{console.log(whatTosSay);}

  // if(!silence){
  // }
}

//Костыльные переменные, чтобы работало на reportus (и там еще немного кода внутри функций)
let reportus
let reportsPrms = { 'appendTo': '.reportList', 'nodeProperty': 'href' }
let reportusPrms = { 'appendTo': '.table-striped', 'nodeProperty': 'Onclick' }

function getXmlReport(requestLink) {
  //https://gist.github.com/john-doherty/b9195065884cdbfd2017a4756e6409cc
  function sanitizeStringForXML(str, removeDiscouragedChars=true) {
    // let NOT_SAFE_IN_XML_1_0 = /[^\x09\x0A\x0D\x20-\xFF\x85\xA0-\uD7FF\uE000-\uFDCF\uFDE0-\uFFFD];/gm;
    // let otherStuff = /[\0x1d]/gm
    // return theString.replace(NOT_SAFE_IN_XML_1_0, '').replace(otherStuff, '');

      // remove everything forbidden by XML 1.0 specifications, plus the unicode replacement character U+FFFD
      var regex = /((?:[\0-\x08\x0B\f\x0E-\x1F\uFFFD\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]))/g;


    // ensure we have a string
      str = String(str || '').replace(regex, '');
  
      if (removeDiscouragedChars) {
  
          // remove everything discouraged by XML 1.0 specifications
          regex = new RegExp(
              '([\\x7F-\\x84]|[\\x86-\\x9F]|[\\uFDD0-\\uFDEF]|(?:\\uD83F[\\uDFFE\\uDFFF])|(?:\\uD87F[\\uDF' +
              'FE\\uDFFF])|(?:\\uD8BF[\\uDFFE\\uDFFF])|(?:\\uD8FF[\\uDFFE\\uDFFF])|(?:\\uD93F[\\uDFFE\\uD' +
              'FFF])|(?:\\uD97F[\\uDFFE\\uDFFF])|(?:\\uD9BF[\\uDFFE\\uDFFF])|(?:\\uD9FF[\\uDFFE\\uDFFF])' +
              '|(?:\\uDA3F[\\uDFFE\\uDFFF])|(?:\\uDA7F[\\uDFFE\\uDFFF])|(?:\\uDABF[\\uDFFE\\uDFFF])|(?:\\' +
              'uDAFF[\\uDFFE\\uDFFF])|(?:\\uDB3F[\\uDFFE\\uDFFF])|(?:\\uDB7F[\\uDFFE\\uDFFF])|(?:\\uDBBF' +
              '[\\uDFFE\\uDFFF])|(?:\\uDBFF[\\uDFFE\\uDFFF])(?:[\\0-\\t\\x0B\\f\\x0E-\\u2027\\u202A-\\uD7FF\\' +
              'uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|' +
              '(?:[^\\uD800-\\uDBFF]|^)[\\uDC00-\\uDFFF]))', 'g');
  
          str = str.replace(regex, '');
      }
  
      return str;
  
  }

  return new Promise(function (resolve, reject) {
    $.get(requestLink, function ldd(data) {
      if(devenv){data = new XMLSerializer().serializeToString(data);}
      data = sanitizeStringForXML(data)
      let xmlObj = strToXmlToJson(data)
      resolve(xmlObj)
    })
  })

}

function strToXmlToJson(data) {
  if (!data) { return }
  try{
  xmlDoc = $.parseXML(data);}
  catch(e){
    console.log('XML Parsing error');
    console.log(e)
    console.log(data)
    return 'XML Parsing error'}
  jsonObj = x2js.xml2json(xmlDoc);
  return jsonObj
}



//https://stackoverflow.com/questions/26891846/is-there-an-equivalent-of-console-table-in-the-browser
function objArrayToTable(jsonArray, colorcolumn) {
  let cols = [];
  for (var index in jsonArray) {
    for (var c in jsonArray[index]) {
      if (cols.indexOf(c) === -1) cols.push(c);
    }
  }
  let html = `<table>
<colgroup>
<col colid=1>
<col colid=2>
<col colid=3>
</colgroup>
<tr>`+
    cols.map(function (c) { return '<th style="border:1px solid #ddd">' + c + '</th>' }).join('') +
    '</tr>';
  for (var l in jsonArray) {
    html += '<tr>' +
      cols.map(function (c) { return '<td style="border:1px solid #ddd">' + (jsonArray[l][c] || '') + '</td>' }).join('') +
      '</tr>';
  }
  html += '</table>';

  html = html.replace('' + colorcolumn, `${colorcolumn} style="background-color:#ff9b9b"`)
  return html
}

//Constrution of menu with bullets and log links
function buildMenu() {

  $('.headerMain').eq(1).append($(`<a href='https://reportus.prls.net/webapp/reports/${report_id}'>Open on Reportus</a>`))

  let appendto = params.appendTo//because it's different on reportus
  //Making the main informationpanel occupy half of the screen
  let doc_top_bar = $(appendto).first();
  $(doc_top_bar).css({
    "textAlign": "left"
  });
  doc_top_bar.find('tbody').css({
    "width": "45%",
    "display": "inline-block"
  })

  let bullet_container = $('<tbody/>')
    .attr("id", "doc_top_bar")
    .addClass("container")
    .css({
      "margin-left": "2.5em",
      "width": "50%",
      "display": "inline-block",
      'vertical-align': 'top'
    })
  doc_top_bar.append(bullet_container);

  constructNodeBullets(pinned_items, 'item', bullet_container)
  constructNodeBullets(pinned_logs, 'log', bullet_container)
}

/** @description  Creates bullets and arranges bullets into an array
 */
function constructNodeBullets(nodeNamesArray, nodesType, appendNodeBulletsTo) {
  let nodeBulletElement
  let nodeProperty = params.nodeProperty
  for (let i = 0; i < nodeNamesArray.length; i++) {
    //if the element is not present on page, will create a grayed out bullet (it's better to see that something is missing)
    if ($('a[' + nodeProperty + '*="' + nodeNamesArray[i] + '"]').length === 0 && !reportus) {
      nodeBulletElement = buildNodeBullet(nodeNamesArray[i], 'blank')
          }
    else {
      nodeBulletElement = buildNodeBullet(nodeNamesArray[i], nodesType)
    }
    $(nodeBulletElement).appendTo(appendNodeBulletsTo)


  }
}

/** @description  Construction of individual bullet
 * @param {string} item_name Bullet's displayed name (don't use spaces).
 * @param {string} bullet_type 'Custom' by default, and that's what you need. 
 * @param {Object} data Bullet's data. What you want to see when it's expanded.
 * @param {Object} icon_url  
 */
function buildNodeBullet(item_name, bullet_type, data, icon_url, sublevel = 0) {

  if(icon_url){icon_url=markBullet('returnIconUrl',icon_url)}
  //if(!data){return}
  let sublevel_space = "    "

  //Here it's templating enginge syntax
  let collapsible_template = '<div>\
<button type="button" id={{:button_id}} class="btn btn-primary btn-xs" aria-pressed="true" data-toggle="collapse" data-target={{:item_target}}>\
➤\
</button>\
  <a style="text-decoration: none; text-decoration: none; background-color: unset !important;" href={{:item_link}}>{{:item_name}}</a>\
<div id={{:item_id}} style="white-space: pre;" class="collapse">\
nothing yet</div>'

  if (pinned_collapsable.indexOf(item_name) == -1 && bullet_type != 'Custom') {
    collapsible_template = '<div>\
<button type="button" id={{:button_id}} class="btn btn-outline-secondary btn-xs" aria-pressed="true" data-toggle="collapse" data-target={{:item_target}}>\
➤\
</button>\
<a style="text-decoration: none; background-color: unset !important;" href={{:item_link}}>{{:item_name}}</a></div>'
  }

  if (bullet_type == 'Custom') {
    collapsible_template = '<div>' + sublevel_space.repeat(sublevel) + '\
{{if icon_url}}   <img src="{{:icon_url}}" style= "display: inline; height: 1.5em;">  {{else}}       {{/if}}\
<button type="button" id={{:button_id}} class="btn btn-info btn-xs" aria-pressed="true" data-toggle="collapse" data-target={{:item_target}}>\
➤\
</button>\
  <a style=" text-decoration: none; background-color: unset !important;">{{:item_name}}</a>\
</div>\
<div id={{:item_id}} style="white-space: pre ; height: 1.5em; border: 1px solid rgba(0, 0, 0, 0.23); border-radius: 4px;" class="collapse">\{{if item_data}}{{:item_data}}{{else}}Nothing yet.{{/if}}</div>'
  }


  if (bullet_type == 'blank') {
    collapsible_template = '<div>' + sublevel_space.repeat(sublevel) + '\
{{if icon_url}}   <img src="{{:icon_url}}" style= "display: inline; height: 1.5em; filter: saturate(0%);">  {{else}}       {{/if}}\
<button type="button" id={{:button_id}} class="btn btn-outline-secondary btn-xs" aria-pressed="true" data-toggle="collapse" data-target={{:item_target}}>\
➤\
</button>\
  <a style="text-decoration: none; background-color: unset !important; color:lightgray">\
{{:item_name}}</a>\
</div>'
  }




  let type_to_link
  if (!reportus) {
    type_to_link = {
      'item': 'https://reports.prls.net/Reports/Xml.aspx?ReportId=' + report_id + '&NodeName=' + item_name,
      'log': 'https://reports.prls.net/Reports/Log.aspx?ReportId=' + report_id + '&LogName=' + item_name,
      'blank': ''
    }
  } else if (reportus) {
    type_to_link = {
      'item': 'https://reportus.prls.net/webapp/reports/' + report_id + '/report_xml/subtree/' + item_name,
      'log': $('a[href*="' + item_name + '"]').attr('href'),
      'blank': ''
    }
  }




  let item_data = data;
  var item_link = type_to_link[bullet_type];

  let item_id = item_name.split(" ").join("").replace(/\./g,'');
  // if (bullet_type == 'log') {
  //   item_id = item_name.replace('Log')
  // }


  let button_id = "btn_" + item_id;
  let item_summary = "nothing yet";
  let item_target = '#' + item_id


  let bullet_content = {
    item_data: item_data,
    item_link: item_link,
    item_name: item_name,
    item_id: item_id,
    item_summary: item_summary,
    item_target: item_target,
    button_id: button_id,
    icon_url: icon_url,
  };

  collapsible_template = $.templates(collapsible_template);
  let bullet = collapsible_template.render(bullet_content)

  return bullet

}

/** @description  Parse items with XML like structure
 * @param {string} data Xml-like string.
 * @param {string} element Name of the <element> whose subelements' values have to be returned (like "HardDisk" for a HDD in HostInfo).
 * @param {Object} parameters Object like {'Host_HDD_Name':'Name', 'Host_HDD_UUID':'Uuid'}, where key is what you want 
 * the parameter to be named, and value -- its element's name in the XML structure.
 * @param {Object} adjustments Object like {"Size":"bytes"} for parameters that need to be adjusted. 
 * (like time for TimZone or bytes to Kb/Mb for readability). Refer to AdjustSpec function for usage 
 * @param {Object} exclude Object like {"NetworkType":"0"}. Bullet elements consistent with these
 * criteria will be skipped.  
 */
function parseXMLItem(data, elementName, parameters, adjustments = {}, exclude = {}, count = false, addToNiceReportObj) {
  //mention(data)
  data = data.replace(/\<\-\>/g, "")
  data = data.replace(/<\?xml[^>]*>/g, "")
  data = data.replace(/\&/g, "")
  data = data.replace(/[&]]/g, "")


  

  try {xmlDoc = $.parseXML(data)}catch{
    console.log(data)
    return("XML parsing error.")
    }

    $xml = $(xmlDoc)

  let subBullet = ''

  let element = $xml.find(elementName)
  //mention (element)
  element.each(function () {
    //mention($(this))
    for (let key in exclude) {
      //mention(exclude[i])
      //mention(key+value+$(this).find(key).first().text())
      let value_here = $(this).find(key).first().text()
      if (exclude[key] == value_here || value_here.match(exclude[key].toString())) { return true }
    }

    let subBulletItem = ''
    let niceReportSubObject = {}

    for (let parameter in parameters) {

      if (elementName == 'HardDisk' || elementName == 'SavedStateItem') {//long story
        let paramValue = $.trim($(this).find(parameters[parameter]).first().text())
        if (parameter in adjustments) {
          paramValue = adjustSpec(paramValue, adjustments[parameter])
        }
        if (paramValue) {
          subBulletItem += '<u>' + parameter + '</u>: ' + paramValue + '\n'
        }

      }
      else {

        $(this).find(parameters[parameter]).each(function () {

          let paramValue = $.trim(($(this).text()))
          if (parameter in adjustments) {
            paramValue = adjustSpec(paramValue, adjustments[parameter])
          }
          if (paramValue) {
            subBulletItem += '<u>' + parameter + '</u>: ' + paramValue + '\n'

            if(addToNiceReportObj){
              niceReportSubObject[parameter]=paramValue}
          }
        })
      }

    }
    if(addToNiceReportObj){
      ObjByString(niceReportObj,addToNiceReportObj).push(niceReportSubObject)
    }
    subBullet = subBullet + subBulletItem + '\n';
  })
  if (subBullet.trim() == '') { subBullet = 'Nothing' }

  return subBullet
}


function parseJsonItem(itemObject, parameters = {}, adjustments = {}, exclude = {}, addToNiceReportObj) {
  if (!itemObject) { return }
  
  let subBullet = ''
  //it's either "CdRom:{Enabled:0,Connected:1...}" or CdRom:{0:{Enabled:0,Connected:1...},1:{Enabled:0,Connected:1...}}
  if (Array.isArray(itemObject)) {
    loopItems:
    for (const item in itemObject) {
      loopSubItems:
      for (const property in exclude) {
        if (itemObject[item][property] == exclude[property]) { continue loopItems }
      }
      let subItem = CreateSubItem(itemObject[item])
      subBullet = subItem ? subBullet + subItem + '\n' : subBullet;
    }
  } else {
    subBullet = CreateSubItem(itemObject) + '\n'
  }

  function CreateSubItem(itemObject) {
    niceReportSubObject = {}
    let subItem = ''
    for (const property in parameters) {
      let id = parameters[property]
      let hName = property
      let value = ObjByString(itemObject, id)

      if (hName in adjustments) { value = adjustSpec(value, adjustments[hName]) }
      subItem += '<u>' + hName + '</u>: ' + value + '\n'
      if(addToNiceReportObj){niceReportSubObject[hName]=value}
      //mention(`${hName}: ${value}`);
    }
    if(addToNiceReportObj){
      ObjByString(niceReportObj,addToNiceReportObj).push(niceReportSubObject)
    }
    return subItem
  }

  return subBullet
}


function BulletData(nodeName, option) {

  //should totally get rid of this
  function fixDisplayedTime(timediff){
    
      //need to rewrite the bit below (and maybe FitTime to aligh with it)
      correcttime = fixTime(timediff)


      let timeElementPath = reportus ? "b:contains('Creation Time')" : "table.reportList>tbody:nth-child(1)>tr:nth-child(3)>td:nth-child(3)"
      let gmtElement = reportus ? $(timeElementPath).parent().next() : $(timeElementPath)


      let gmt_string = reportus ? gmtElement.text() : $(".reportList:first tbody:first tr:nth-child(3) script").text()

          //if(devenv){gmt_string='dbDate2LocalAndTableCell("2020-09-05T17:49:54");'}

      let gmt_regex = reportus ? /(.*)/ : /\(\"([\d\-T\:]*)\"\)/
      let gmt_substr = gmt_string.match(gmt_regex)[1];
      let gmt_time = Date.parse(gmt_substr);
      //mention(gmt_time)
      let time_seconds = gmt_time / 1000;
      //mention(time_seconds)
      let correct_time1 = new Date(0);
      //mention(correct_time)
      //mention(timediff)
      correct_time1.setUTCSeconds(time_seconds + 10800)
      gmt_time = correct_time1.toString().substring(4, 24)

      

      

      $(gmtElement).html("Customer: " + correcttime + "</br> Moscow:&nbsp;&nbsp;&thinsp;&thinsp;" + gmt_time)

  }

  let item_id = nodeName.replace(/\./g,"")

  let bullet_parsed_data
  let panic

  let nodesObj = bigReportObj.ParallelsProblemReport

  let excludeFromSearch = ['TimeZone']
  let process


  if (typeof nodesObj[nodeName] == 'string' || typeof nodesObj[nodeName] == 'object') {
  
    bullet_all_data = nodesObj[nodeName] 

      eval(`bullet_parsed_data=parse${item_id}(bullet_all_data)`)

      if (!excludeFromSearch.includes(nodeName)){
    searchNodes.addNodeToSearch(bullet_all_data, nodeName)
    searchNodes.addSearchButton(nodeName,`#btn_${item_id}`)}

    if (!bullet_parsed_data) { return }//if corresponding function already set the bullet data manually without returning anything (like parseLoadedDrivers)
    if (option == 'time') {
 
      fixDisplayedTime(bullet_parsed_data)
    }
    $(`#${item_id}`).html(bullet_parsed_data);
    return
  }

  if (tries[item_id]) { tries[item_id]-- } else { tries[item_id] = tries['tries'] }
  bullet_parsed_data = 'nothing yet';

  if (pinned_collapsable.includes(nodeName)) {$('#' + nodeName.replaceAll('\.', '\\\.')).text('loading...'); }


  let request_link = 'https://reports.prls.net/Reports/Xml.aspx?ReportId=' + report_id + '&NodeName=' + nodeName
  if (reportus) { request_link = 'https://reportus.prls.net/webapp/reports/' + report_id + '/report_xml/subtree/' + nodeName; }


  if (item_id.match('[^c].log')) {


    if(devenv){return}


    request_link = 'https://reports.prls.net/Reports/Log.aspx?ReportId=' + report_id + '&LogName=' + nodeName
  } else if (item_id.match('panic.log')) {
    request_link = 'https://reports.prls.net/Reports/Log.aspx?ReportId=+' + report_id + '+&LogName=panic.log&DownloadOrig=True&DownloadName=panic.log'
    panic = true
  }

  if (reportus && item_id.match('\.log')) {
    request_link = $('a[href*="' + nodeName + '"]').attr('href')
  }


  $.ajaxSetup({

    error: function (xhr, status, error) {

      if (tries[item_id] > 0) { BulletData(nodeName, option) }
    }
  });

  $.get(request_link, function ldd(data) {

    let bullet_all_data
    if (panic == true) {
      data = JSON.parse(data)
      bullet_all_data = data["log_path"] + "\n\n" + data["panic_string"]
    }
    else {
      if (!reportus) { bullet_all_data = $('pre', data).eq(0).text().replace('<?xml version="1.0" encoding="UTF-8"?>', '') }
      else {
        bullet_all_data = data.replace('<\!\[CDATA\[\<\?xml version="1\.0" encoding="UTF-8"\?\>', '').replace('\]\]>', '').replace('\<\!\[CDATA\[', '')
      }

    }
    if (!bullet_all_data) {
      bullet_parsed_data = "Some kind of (likely server) error"
      return
    }

    searchNodes.addNodeToSearch(bullet_all_data, nodeName)
    searchNodes.addSearchButton(nodeName,`#btn_${item_id}`)

  
    eval("bullet_parsed_data=parse" + nodeName.replace(/\.|\d|gz/g, '') + "(bullet_all_data)")//because there are things like "system.0.gz.log"
    mention("PARSING " + nodeName)
  

    if (!bullet_parsed_data) { return }//if corresponding function already set the bullet data manually without returning anything (like parseLoadedDrivers)
    if (typeof option === "undefined") {
      $('#' + nodeName.replaceAll('\.', '\\\.')).html(bullet_parsed_data);
      return
    }
    else if (option == 'time') {
      timediff = bullet_parsed_data
      //need to rewrite the bit below (and maybe FitTime to aligh with it)
      correcttime = fixTime(timediff)

      let timeElementPath = reportus ? "b:contains('Creation Time')" : "body > div:nth-child(2) > table.reportList > tbody > tr:nth-child(3) > td:nth-child(3)"
      let gmtElement = reportus ? $(timeElementPath).parent().next() : $(timeElementPath)


      let gmt_string = reportus ? gmtElement.text() : $(".reportList:first tbody:first tr:nth-child(3) script").text()

      let gmt_regex = reportus ? /(.*)/ : /\(\"([\d\-T\:]*)\"\)/
      let gmt_substr = gmt_string.match(gmt_regex)[1];
      let gmt_time = Date.parse(gmt_substr);
      //mention(gmt_time)
      let time_seconds = gmt_time / 1000;
      //mention(time_seconds)
      let correct_time1 = new Date(0);
      //mention(correct_time)
      //mention(timediff)
      correct_time1.setUTCSeconds(time_seconds + 10800)
      gmt_time = correct_time1.toString().substring(4, 24)
      $(gmtElement).html("Customer: " + correcttime + "</br> Moscow:&nbsp;&nbsp;&thinsp;&thinsp;" + gmt_time)

    }


  })
}

function bulletSubItem(parameter, paramValue) {
  return '<u>' + parameter + '</u>: ' + paramValue + '\n'
}

function parsepaniclog(item_all_data) {
  let panicDateRegex = /^.*panic-full-(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})-(?<hour>\d{2})(?<min>\d{2})(?<sec>\d{2}).*/u
  let panicDateRegex2 = /\/Library\/Logs\/DiagnosticReports\/Kernel.(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})-(?<hour>\d{2})(?<min>\d{2})(?<sec>\d{2}).*/u
  let panicCreationString = ""
  if (item_all_data.match(panicDateRegex)) { panicCreationString = item_all_data.match(panicDateRegex)[0] }
  else if (item_all_data.match(panicDateRegex2)
  ) {
    panicCreationString = item_all_data.match(panicDateRegex2)[0]
    panicDateRegex = panicDateRegex2
  }

  mention({ panicCreationString })

  let dateString = panicCreationString.replace(panicDateRegex, "$<month>-$<day>-$<year> $<hour>:$<min>:$<sec>")

  panicTime = Date.parse(dateString)
  let time_seconds = panicTime / 1000;
  let correct_time = new Date(0);
  correct_time.setUTCSeconds(time_seconds)
  panicTime = correct_time.toString().substring(4, 24)


  item_all_data = item_all_data.replace(panicCreationString, "<b>Panic time: " + dateString + "</b>")
  item_all_data = item_all_data.replaceAll(/(last loaded kext)/g, "<b><u>$1</u></b>")
  item_all_data = item_all_data.replaceAll(/(Kernel Extensions in backtrace)/g, "<b><u>$1</u></b>")
  //item_all_data = item_all_data.replaceAll(/(backtrace|loaded)/,"<b>$1</b>")

  return item_all_data
}

const ObjByString = function (o, s) {
  s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
  s = s.replace(/^\./, '');           // strip a leading dot
  let a = s.split('.');
  for (var i = 0, n = a.length; i < n; ++i) {
    let k = a[i];
    if (k in o) {
      o = o[k];
    } else {
      return;
    }
  }
  return o;
}


//Extra functions

//
/** @description  This one appemds Mac's specs next to the Model (gets them from Google sheet)
 */

function computerModel(macDatabase) {

  let macElement = $('td:contains("Computer Model")').next();
  let macModel = bigReportObj.ParallelsProblemReport.ComputerModel

  if (!macModel.match(/MacBook|iMac|Macmini|MacPro/)) { return }

  let mac_cpu = strToXmlToJson(bigReportObj.ParallelsProblemReport.HostInfo).ParallelsHostInfo.Cpu.Model

  mac_cpu = mac_cpu.toUpperCase().match(/ ([^ ]*) CPU/) ? mac_cpu.toUpperCase().match(/ ([^ ]*) CPU/)[1] : mac_cpu

  // console.log(mac_cpu)

  let mac_url = 'http://everymac.com/ultimate-mac-lookup/?search_keywords=' + macModel

  let mac_model_linked = $('<td id="macmodel"> <a href=' + mac_url + '>' + macModel + '</a></td>')
  $('td:contains("Computer Model")').next().replaceWith(mac_model_linked)

  let macID = macModel.concat(mac_cpu)

  let macSpecs = macDatabase[macID]

  let formattedSpecs = ['</br>',
    "Model: ", macSpecs.model, '</br>',
    "Storage: ", macSpecs.storage, '</br>',
    "Ram:", macSpecs.ram, '</br>',
    "Vram:", macSpecs.vram, '</br>',
    "Year: ", macSpecs.prodStart, " - ", macSpecs.prodEnd]

  if (macSpecs) {
    $('td:contains("Computer Model")').next().append(formattedSpecs);
    //macElement.append(macSpecs)

  } else {
    //no longer works due to captcha, so DB is in google sheets now and I'm maintaining it

    // $("#macmodel").append($('<button type="button"  style="border-color:black" class="btn btn-outline-secondary btn-sm" id=loadMacSpecs>Load specs</button>'))
    // $('#loadMacSpecs').click(function() {
    // loadMacSpecs(mac_url, mac_cpu, macElement, macID)
    // this.remove()
    // });
  }

}

function googleCsv2JsonMacModels(csv) {
  //that is a very dumb function, but it works. 


  csv = csv.replace(/\"\,\"/gm, ";").replace(/\"/gm, "").replace(/(\]\n|\}\n)/g, "$1delimiter")

  let headers = csv.split("\n")[0].split(";");

  csv = csv.substring(csv.indexOf("\n") + 1)

  let lines = csv.split('\n');

  let result = [];

  lines.forEach((line) => {

    let currentline = line.split(";");
    macID = currentline[0]

    let specs = {};
    headers.forEach((header, index) => specs[header] = currentline[index])

    result[macID] = specs
    
  })

  return result; //JSON
}

/** @description  Appends customer time im addition to server's local
 */
function fixTime(timediff, time = '') {
  let gmt_string = $(".reportList:first tbody:first tr:nth-child(3) script").text()


  if (reportus) gmt_string = $("b:contains('Creation Time')").parent().next().text()

  //if(devenv){gmt_string='dbDate2LocalAndTableCell("2020-09-05T17:49:54");'}

  let gmt_regex = reportus ? /(.*)/ : /\(\"([\d\-T\:]*)\"\)/
  let gmt_substr = gmt_string.match(gmt_regex)[1];
  ///if time is not defined 
  let gmt_time = Date.parse(gmt_substr);
  if (time != '') {
    gmt_time = parseInt(time)
  }
  mention(gmt_time)
  let time_seconds = gmt_time / 1000;
  let correct_time = new Date(0);
  mention(correct_time)
  mention(timediff)
  correct_time.setUTCSeconds(time_seconds + timediff)
  return correct_time.toString().substring(4, 24)
}

//Adjusts time, converts values etc. Where for example we get bytes but want to render gb/tb
function adjustSpec(spec_value, adjustment) {
  spec_value = spec_value || "---"
  switch (adjustment) {
    case 'time':
      spec_value = fixTime(timediff, spec_value)
      break;
    case 'bytes':
      spec_value = humanFileSize(spec_value, true);
      break;
    case 'hddtype':
      let hddtypes = { 0: 'IDE', 1: 'SCSI', 2: 'SATA', 3: 'NVMe' }
      spec_value = hddtypes[spec_value]
      break;
    case 'mbytes':
      spec_value = humanFileSize(spec_value * 1024 * 1024, false)
      break;
    case 'appleMbytes':
      spec_value = humanFileSize(spec_value * 1024 * 1024, true)//because for Apple kilo is actually 1000 :)
      break;
    case 'networkAdapter':
      let networkAdapters = { 0: 'Legacy', 1: 'RealTek RTL8029AS', 2: 'Intel(R) PRO/1000MT', 3: 'Virtio', 4: 'Intel(R) Gigabit CT (82574l)' }
      spec_value = networkAdapters[spec_value]
      break;
    case 'networkMode':
      let networkTypes = { 0: 'Host-Only', 1: 'Shared', 2: 'Bridged' }
      spec_value = networkTypes[spec_value]
      break;
    case 'networkMac':
      spec_value = spec_value.replace(/(\w\w)(\w\w)(\w\w)(\w\w)(\w\w)(\w\w)/, '$1:$2:$3:$4:$5:$6')
    case 'networkConnected':
      if(spec_value=='0'){spec_value=`<b><u style="color:red">0!</u></b>`}
      markBullet('Networks','warning','','Disconnected adapter!')
    // // break;
  }
  return spec_value
}

//https://stackoverflow.com/users/65387/mpen
function humanFileSize(bytes, si) {
  let thresh = si ? 1000 : 1024;
  if (Math.abs(bytes) < thresh) {
    return bytes + ' B';
  }
  let units = si
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  do {
    bytes /= thresh;
    ++u;
  } while (Math.abs(bytes) >= thresh && u < units.length - 1);
  return bytes.toFixed(1) + ' ' + units[u];
}

/** @description  Converst all links to attached screenshots to clickable thumbnails
 */
function getScreenshots() {

  function CreateScreenshot(id, url) {
    $.get(url, function (data) {
      let img = ($('pre > img', data).eq(0).attr('src'))
      AddScreenshotHtml(id, img)
    })
  }

  function AddScreenshotHtml(id, image) {
    let mypiclink = '<a href="#img' + id + '">\
    <img src='+ image + ' class="thumbnail">\
  </a>'

    let mypic = '<a href="#_" class="lightbox" id="img' + id + '">\
    <img src='+ image + '>\
  </a>'
    $(mypiclink).appendTo('.container')

    $(mypic).appendTo('body')

  }

  if (reportus) {
    $('h4:contains("Screenshots")').next().clone().appendTo('.container')
    return
  }

  let screens_el = $('span:contains("Screenshots")').next()
  screens_el.clone().appendTo('.container')
  let screenID = 1
  screens_el.find("a").each(function () {
    CreateScreenshot(screenID, this.href)
    screenID++
  })
}

/** @description  Appends Bug IDs to found signatures (if a signature has a bug)
 */
function signatureBugs() {
  function setBugId(signatureObject, bugJiraId) {
    $(`</br><span>Bug: </span><a href="https://jira.prls.net/browse/${bugJiraId}">${bugJiraId}</a></br>`).insertAfter(signatureObject)
  }

  let signatures = $('a[href*="Signature"]')

  signatures.each(function () {
    $(this).appendTo('.container')

    let signatureObject = this
    let signatureName = this.text
    let bugJiraId = GM_getValue(signatureName)

    if (!bugJiraId || bugJiraId == 'No bug yet ') {
      let loadingMessage = $('</br><span id="loadingBug">Loading bug info...</span></br>')

      loadingMessage.insertAfter(this)
      console.log(signatureObject)
      $.get(signatureObject.href, function (data) {
        bugJiraId = $('div.headerMain > h2:nth-child(6) > span > a', data).text()

        if (bugJiraId.length == 0) {
          bugJiraId = 'No bug yet '
        }
        GM_setValue(signatureName, bugJiraId)
        setBugId(signatureObject, bugJiraId)
        loadingMessage.remove()
      })
    } else {
      setBugId(signatureObject, bugJiraId)
    }
  })
}

/** @description  Adds icon before a bullet that signifies that contend has been checked and evaluated, 
 * Example with LoadedDrivers: they can be either OK (e.g. when only apple and prl kexts are loaded), 
 * semi-ok (e.g. when some extra kexts are loaded) 
 * or bad (e.g. LittleSnitch or Hackintosh)
 * @param {string} bullet_name Actual name (text in <div></div> ) of the bullet.
 * @param {string} icon 
 * @param {string} html if icon is 'custom', this defines element to be appended as a mark
 */
function markBullet(bullet_name, icon, html, title) {


  let icon_url
  let img

  //heluva spaghetti by now. Need to rethink. Probably.

  if(!title&&!icon.match(/https?\:/)){title = icon}else if(!title&&icon.match(/https?\:/)){title = Object.keys(icons).find(key => icons[key] === icon) || '-'}

  if(typeof icon!='string'){
    mention(`${{icon}} is not a string. Please check.`)
    return
  }


  //this means that it's a string name of existing icon from 'icons' object.   
  //Adding desaturated icon (e.g. 'no_snapshots') 
  if (icon.match(/^no_/)) {
    icon_url = icon.match(/^no_(.*)/) ? icons[icon.match(/^no_(.*)/)[1]] : console.log(`Icon "${icon}" is not present in icons object`)
    img = `<img src="${icon_url}" title = "${title}" style= "display: linline; height: 1.5em; filter: saturate(0%);">`
  }else if (icon.match(/https?\:/)) {
    icon_url = icon
    img = `<img src="${icon_url}" title = "${title}" style= "display: linline; height: 1.5em";>`
  }
  
  //when 'CustomHtml', we manually set HTML for the element.  
  else if (icon == 'CustomHtml') {
    img = html ? html : console.log(`HTML for ${icon} not defined`)
    } else 
    
    //rest of cases -- string that must be in 'icons' obj (e.g. 'snapshots')
    {
    icon_url = icons[icon]? icons[icon] : console.log(`Icon "${icon}" is not present in icons object`)
    img = `<img src="${icon_url}" title = "${title}" style= "display: linline; height: 1.5em";>`
  }

  //normally the function adds HTML to bullet, but sometimes we just want it to return the HTML element with the needed icon
  if (bullet_name == 'returnIcon') { return img }
  if (bullet_name == 'returnIconUrl') { return icon_url }

  
  $(`button#btn_${bullet_name}`).next().filter(function () {
    return $(this).text() === bullet_name ? true : false;
  }).prepend($(img))

  }

  //rewrite all that search stuff into a class - DONE
  class Searchable {
    constructor (id, prependTo) {
      this.prependTo = prependTo
      this.id = id
  
      this.thequery
      this.nodeName
      this.nodeContents = {}
      this.previewUp = 2
      this.previewDown = 6
  
      $(this.prependTo).prepend(
        $(`
        <div id=${id} style="">
        <div class="button dropdown"> 
        <select id="nodeselector">
        </select>
        </div>
        <input id="searchField">
        <button id="previous">Prev.</button><button id="next">Next\></button><a id="resultCounter"style="color:#ff7f50;  font-weight: bold; background-color: unset !important; padding:3px; text-decoration: none;"></a>
        <span style="*/float: right/*" id="previewBtns">
        <button id="clearSearch" >clear 🞩</button>
        <button id="resetPreview" >⟳</button>
        <button id="expandDown" >expand ▽</button>
        <button id="expandUp" >expand △</button>
        </span>
        <pre id="searchResults" style="padding:0; border:0px; white-space:pre-wrap; */max-height:90em/*"></pre>
        </div>
         `)
      )
  
      this.$el = $(prependTo)
        .children()
        .first()
      this.text = $(this.$el).text()
  
      $(this.$el)
        .find('#searchField')
        .attr('autocomplete', 'off')
  
      $(this.$el)
        .find('#previewBtns')
        .hide()
  
      $(this.$el)
        .find('#expandDown')
        .on('click', e => {
          this.changePreviewLength(10, 0)
        })
  
      $(this.$el)
        .find('#expandUp')
        .on('click', e => {
          this.changePreviewLength(0, 10)
        })
  
      $(this.$el)
        .find('#resetPreview')
        .on('click', e => {
          this.changePreviewLength(-1000000000000000, -10000000000)
        })
  
      $(this.$el)
        .find('#clearSearch')
        .on('click', e => {
          this.changePreviewLength(-1000000, -100000)
          $(this.$el)
            .find('#searchField')
            .val('')
          this.updateResults()
        })
  
      $(this.$el)
        .find('#next')
        .on('click', e => {
          this.updateResults('next')
        })
  
      $(this.$el)
        .find('#previous')
        .on('click', e => {
          this.updateResults('previous')
        })
  
      $(this.$el)
        .find('#nodeselector')
        .change(() => {
          this.doSearch()
        })
  
      $(this.$el)
        .find('#searchField')
        .on('keyup', e => {
          if (e.key === 'Enter' || e.keyCode === 13) {
            this.updateResults('next')
          } else {
            this.doSearch()
          }
        })
    }
  
    addNodeToSearch (nodeAllData, nodeName) {
      if (this.nodeContents[nodeName]) {
        return
      }
  
      $(this.$el)
        .find('#nodeselector')
        .append($('<option value="' + nodeName + '">' + nodeName + '</option>'))
  
      if (typeof nodeAllData == 'object') {
        nodeAllData = JSON.stringify(nodeAllData, null, '\t').replace(
          '\\\r\\\n',
          '\n'
        )
      }
      let nodelines = nodeAllData.split('\n')
  
      //if((typeof nodeAllData)!="string"){return}
      let node = {
        lines: nodelines,
        curr_index: 0,
        curr_indexes: []
      }
      this.nodeContents[nodeName] = node
  
     
    }
  
    addSearchButton(nodeName, prependTo) {
      let searchIcon =
      `<img src="https://image.flaticon.com/icons/png/128/3126/3126554.png" 
    id=${this.id}${nodeName}_searchFocus
    title="search" 
    style="display: inline; height: 1.5em; margin-left:-1.5em; cursor: pointer; opacity: 0.7;">`
  
    let nodeID = nodeName.replaceAll('.', '\\.')
  
    $(prependTo).parent().prepend($(searchIcon))
  
    $(`#${this.id}${nodeID}_searchFocus`).click(() => {
        this.focusOnSearch(nodeName)
      })
    }
  
    focusOnSearch (nodeName) {
      $(this.$el).find('#nodeselector').val(nodeName)
      $(this.$el).find('#searchField').focus()
      this.doSearch()
    }
  
    doSearch () {
      //if(!this.thequery){return}
      this.thequery = $(this.$el)
        .find('#searchField')
        .val()
      this.nodeName = $(this.$el).find('#nodeselector').val()
  
      let lines = this.nodeContents[this.nodeName]['lines']
      this.nodeContents[this.nodeName]['curr_index'] = 0
      this.nodeContents[this.nodeName]['curr_indexes'] = []
  
      lines.forEach((line, index) => {
        if (line.match(new RegExp(this.thequery, 'i'))) {
          this.nodeContents[this.nodeName]['curr_indexes'].push(index)
        }
      })
  
      this.updateResults()
    }
  
    changePreviewLength (down, up) {
      let currUp = this.previewUp
      let currDown = this.previewDown
      let newUp = currUp + up
      let newDown = currDown + down
      if (newDown < 6) {
        newDown = 6
      }
      if (newUp < 2) {
        newUp = 2
      }
      this.previewUp = newUp
      this.previewDown = newDown
      this.updateResults()
    }
  
    updateResults (direction) {
      let previewDown = this.previewDown
      let previewUp = this.previewUp
  
      if (direction == 'next') {
        if (
          this.nodeContents[this.nodeName]['curr_index'] ==
          this.nodeContents[this.nodeName]['curr_indexes'].length - 1
        ) {
          this.nodeContents[this.nodeName]['curr_index'] = 0
        } else {
          this.nodeContents[this.nodeName]['curr_index']++
        }
      } else if (direction == 'previous') {
        if (this.nodeContents[this.nodeName]['curr_index'] == 0) {
          this.nodeContents[this.nodeName]['curr_index'] =
            this.nodeContents[this.nodeName]['curr_indexes'].length - 1
        } else {
          this.nodeContents[this.nodeName]['curr_index']--
        }
      }
  
      this.thequery = $(this.$el)
        .find('#searchField')
        .val()
  
      if (this.thequery == '') {
        $(this.$el).find('#previewBtns').hide()
        $(this.$el).find('#searchResults').html('')
        $(this.$el).find('#resultCounter').html('')
        return
      }
      $(this.$el).find('#previewBtns').show()
  
      this.nodeName = $(this.$el).find('#nodeselector').val()
  
      let lines = this.nodeContents[this.nodeName]['lines']
      let curr_index = this.nodeContents[this.nodeName]['curr_index']
      let curr_indexes = this.nodeContents[this.nodeName]['curr_indexes']
  
      let result_line = curr_indexes[curr_index]
  
      let searchCounterCurrent = parseInt([curr_index]) + 1
      let searchCounterTotal = curr_indexes.length
  
      $(this.$el).find('#resultCounter').html(searchCounterCurrent + '/' + searchCounterTotal)
  
      if (searchCounterTotal == 0) {
        $(this.$el).find('#searchResults').html(
          '<a style="color:red; font-width:600">Nothing.</a>'
        )
        $(this.$el).find('#resultCounter').html('-/-')
        return
      }
  
      let match = lines[result_line].match(new RegExp(this.thequery, 'i'))[0]
  
      let startLine
      let endLine
  
      if (result_line - previewUp < 0) {
        startLine = result_line
      } else {
        startLine = result_line - previewUp
      }
      if (result_line + previewDown > lines.length) {
        endLine = lines.length
      } else {
        endLine = result_line + previewDown
      }
  
      //I will clean this up, honestly
  
      let resultPreview = []
        .concat(
          lines.slice(startLine, result_line),
          lines[result_line].replaceAll(match, '<u>' + match + '</u>'),
          lines.slice(result_line + 1, endLine)
        )
        .join('\r\n')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll(
          '&lt;u&gt;' + match + '&lt;/u&gt;',
          '<u style="color:red; font-weigh:600">' + match + '</u>'
        )
        .replaceAll(match, '<mark>' + match + '</mark>')
  
      $(this.$el).find('#searchResults').html(resultPreview)
    }
  }

const pinned_items = ["CurrentVm", "LoadedDrivers", 'AllProcesses', 'GuestCommands', 'GuestOs', "MountInfo", 'HostInfo', 'ClientInfo', 'ClientProxyInfo', 'AdvancedVmInfo', 'MoreHostInfo', 'VmDirectory', 'NetConfig', 'AppConfig', 'LicenseData', 'InstalledSoftware', 'LaunchdInfo', 'AutoStatisticInfo'];
//report log links that will be cloned to the bullet container
const pinned_logs = ["parallels-system.log", "system.log", "system.0.gz.log", "vm.log", "vm.1.gz.log", "dmesg.log", 'install.log', 'tools.log', 'panic.log',];
//pinned_items that will have a collapsible with parsed info
const pinned_collapsable = ["CurrentVm", "LoadedDrivers", 'AllProcesses', 'GuestCommands', 'GuestOs', 'MountInfo', 'HostInfo', 'AdvancedVmInfo','ClientInfo', 'MoreHostInfo', 'VmDirectory', 'NetConfig', 'AppConfig', 'LicenseData', 'InstalledSoftware', 'AutoStatisticInfo', 'LaunchdInfo', 'panic.log'];

const process_immediately = ['VmDirectory', 'CurrentVm', 'LoadedDrivers', 'tools.log', 'GuestOs', 'GuestCommands', 'AllProcesses', 'AdvancedVmInfo', 'MoreHostInfo', 'ClientInfo', 'ClientProxyInfo', 'LicenseData', "vm.log", "vm.1.gz.log",'system.log', "system.0.gz.log", 'MountInfo', 'HostInfo', 'InstalledSoftware', 'LaunchdInfo', 'AutoStatisticInfo', 'dmesg.log', 'parallels-system.log', 'NetConfig', 'AppConfig', 'install.log', 'panic.log']

let nodeContents = {}//it't almost raw data. Mostly for the search function.

let theBigReportObject = {//this is the Grand Refactoring bit
  'customer': {},//email, timezone, LicenseData
  'report': {},// creation time, timezone
  'PD': {
    'NetConfig': {}
  },//NetConfig, AppConfig...
  'vm': {},//CurrentVm
  'guestos': {},//GuestCommands,
  'host': {},//HostInfo, MountInfo, MoreHostInfo, 
  'hostos': {},//AllProcesses, ClientProxyInfo, LoadedDrivers, 
  'logs': {},//not sure if populate with events or just what's in 'nodeContents'. Anyway, I think it should be separate
}


//Filling bullet content with appropriate data.
let tries = { "tries": 3 }//When "get" request fails, BulletData() reruns itself (see $.ajaxSetup). This let stores number of tries left for each item.
// If item is not present in this dict, it's added with counter set to 3 and then goes down with each run of the function. 

//needed for correting times for time zone
let timediff

let current_url = window.location.href;
let report_id = current_url.match(/\d{7,9}/);
let index

let macDataBaseUrl = "https://docs.google.com/spreadsheets/d/1lmcn0aRxolP5eXfsuaekRFcMl7dAFjxTe9ItQEUOarM/gviz/tq?tqx=out:csv&sheet=Database"

//let getMacSpecsDatabase = $.get(macDataBaseUrl, () => {})

function doReportOverview() {
  //console.log(getMacSpecsDatabase);
  $.get(macDataBaseUrl).then(function (data) {
    let macDatabase = googleCsv2JsonMacModels(data)
    computerModel(macDatabase);
  })

  signatureBugs();
  BulletData('TimeZone', 'time');//should fix it later to get data from the bigJson

  $("#form1").replaceWith(function () {
    return $("<div />").append($(this).contents());
  });
  let timeout = 80
  for (let item in process_immediately) {
    setTimeout(BulletData(process_immediately[item]), timeout)
    timeout = +80
  }

  performChecks()

  $(".btn").click(function () {
    $(this).text(function (i, old) {
      return old === '➤' ? '▼' : '➤';//took it here: https://stackoverflow.com/questions/16224636/twitter-bootstrap-collapse-change-display-of-toggle-button
    })
  })

}

devenv = false

window.addEventListener("load", function (event) {

  let curr_url = window.location.href

  if(curr_url.match('localhost')){devenv=true}

  if(devenv){id='348939757'}else

  {if (!curr_url.match(/Report.aspx\?ReportId=|webapp\/reports/)) { return }

  id = curr_url.match(/(\d{9})/)[1]}

  if ($('Title').text().match('Waiting')) {
    $("#form1 > div:nth-child(4) > big > big > b").append('</br></br><div><a href=https://reportus.prls.net/webapp/reports/' + id + '>OPEN AT REPORTUS</a></div>')

    return
  }

  if (curr_url.match(/Report.aspx\?ReportId=/)) {
    reportus = false
  } else if (curr_url.match(/webapp\/reports/)) {
    reportus = true
  }
  params = reportus ? reportusPrms : reportsPrms

  let xmlUrl = reportus ? 'https://reportus.prls.net/webapp/reports/' + id + '/report_xml/download?filepath=Report.xml' : 'https://reports.prls.net/Reports/Xml.aspx?ReportId=' + id

  if(devenv){xmlUrl = "http://localhost:63342/PRV/testPage/reportxml.xml"}

  buildMenu();
  getScreenshots();
  //setupSearch()

  searchNodes = new Searchable('searchNodes', '#doc_top_bar')

  getXmlReport(xmlUrl).then(function (xmlData) {
    bigReportObj = xmlData
    doReportOverview()
  })

});

//note to self -- start hosting those somewhere (github even?)
const icons = {
  'rollbackMode':'https://user-images.githubusercontent.com/10322311/121571351-9230ac80-ca2b-11eb-91e7-bd75ea4f6ae4.png',
  'adapterNotConnected':'https://image.flaticon.com/icons/png/128/2183/2183366.png',
  'noNetwork':'https://image.flaticon.com/icons/png/128/2313/2313811.png',
  'apipa':'https://image.flaticon.com/icons/png/128/2333/2333550.png',
  'Low storage': 'https://uxwing.com/wp-content/themes/uxwing/download/16-business-and-finance/90-percent.svg',
  'DisplayLink device!': 'https://image.flaticon.com/icons/png/128/3273/3273973.png',
  'onedrive': 'https://image.flaticon.com/icons/png/128/2335/2335410.png',
  'network folder': 'https://image.flaticon.com/icons/png/128/1930/1930805.png',
  'usb': 'https://image.flaticon.com/icons/svg/1689/1689028.svg',
  'keyboard': 'https://image.flaticon.com/icons/png/128/2293/2293934.png',
  'mouse': 'https://image.flaticon.com/icons/png/128/2817/2817912.png',
  'printers': 'https://image.flaticon.com/icons/svg/2489/2489670.svg',
  'all good': 'https://image.flaticon.com/icons/png/128/1828/1828520.png',
  'warning': 'https://image.flaticon.com/icons/svg/497/497738.svg',
  'serious warning': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/OOjs_UI_icon_alert-warning.svg/1200px-OOjs_UI_icon_alert-warning.svg.png',
  'bad': 'https://image.flaticon.com/icons/svg/1672/1672451.svg',
  'headless': 'https://image.flaticon.com/icons/png/128/1089/1089503.png',
  'not headless': 'https://cdn0.iconfinder.com/data/icons/people-and-lifestyle-1/64/people-male-man-head-128.png',
  'isolated': 'https://cdn4.iconfinder.com/data/icons/real-estate-1/512/prison-128.png',
  'flags': 'https://cdn3.iconfinder.com/data/icons/seo-and-digital-marketing-5-3/48/211-128.png',
  'nosnapshots': 'https://image.flaticon.com/icons/svg/2803/2803253.svg',
  'snapshots': 'https://image.flaticon.com/icons/svg/502/502559.svg',
  'screens': 'https://user-images.githubusercontent.com/10322311/96313515-5cf7ca00-1016-11eb-87d7-4eb1784e6eab.png',
  'vms': 'https://insmac.org/uploads/posts/2017-08/1503641514_parallels.png',
  'vpn': 'https://image.flaticon.com/icons/png/128/1451/1451546.png',
  'external drive': "https://cdn4.iconfinder.com/data/icons/computer-58/64/external-hard-disk-drive-storage-64.png",
  'copied vm': 'https://cdn2.iconfinder.com/data/icons/small-color-v5/512/clone_copy_document_duplicate_files-128.png',
  'AppleHV': 'https://cdn2.iconfinder.com/data/icons/metro-uinvert-dock/256/OS_Apple.png',
  'Nested': 'https://cdn2.iconfinder.com/data/icons/russia-8/64/matryoshka-doll-russian-mother-russia-128.png',
  'splitted': 'https://cdn4.iconfinder.com/data/icons/web-and-mobile-ui/24/UI-03-32.png',
  'trim': 'https://i.ibb.co/XpVhPZ9/unnamed.png',
  'webcam': 'https://image.flaticon.com/icons/png/128/179/179879.png',
  'gpu': "https://image.flaticon.com/icons/svg/2302/2302939.svg",
  'ACL': 'https://findicons.com/files/icons/2796/metro_uinvert_dock/128/security_denied.png',
  'fullscreen': 'https://cdn3.iconfinder.com/data/icons/mos-basic-user-interface-pack/24/aspect_rasio-128.png',
  'noTimeSync': 'https://cdn2.iconfinder.com/data/icons/watch-4/64/death_clock-broken-breakdown-fail-128.png',
  'hdds': "https://image.flaticon.com/icons/svg/1689/1689016.svg",
  'cd': 'https://image.flaticon.com/icons/png/128/2606/2606574.png',
  'networkAdapter': 'https://image.flaticon.com/icons/svg/969/969356.svg',
  'TPM': 'https://cdn3.iconfinder.com/data/icons/imageres-dll/512/imageres-dll_TPM-ship-128.png',
  'network conditioner fullspeed': 'https://icon-library.com/images/data-funnel-icon/data-funnel-icon-5.jpg',
  'network conditioner limited': 'https://user-images.githubusercontent.com/10322311/118004041-c728e100-b351-11eb-9018-516a78e18a28.png',
  'plain vHDD': 'https://cdn0.iconfinder.com/data/icons/computer-93/64/7._hard_disk_hdd_data_information_computer_technology-128.png',
  'external vHDD': 'https://1001freedownloads.s3.amazonaws.com/icon/thumb/371132/External-Drive-Red-icon.png',
  'linked clone': 'https://cdn4.iconfinder.com/data/icons/materia-flat-design-vol-1/24/034_038_layers_front_copy_clone-128.png',
  'smart guard': 'https://www.seekpng.com/png/full/595-5952790_download-svg-download-png-shield-icon-png.png',
  'Boot Camp': 'https://user-images.githubusercontent.com/10322311/96314275-97616700-1016-11eb-9990-8b2e92d49052.png',
  'root or unknown owner': 'https://user-images.githubusercontent.com/10322311/100492918-868e3000-3142-11eb-9ee6-44826cd637c7.png',
  'resource quota': 'https://cdn2.iconfinder.com/data/icons/flat-pack-1/64/Gauge-128.png',
  'pirated': 'https://cdn1.iconfinder.com/data/icons/social-messaging-ui-color-shapes-2/128/death2-circle-red-64.png',
  'kext': 'https://cdn2.iconfinder.com/data/icons/gaming-color-icons/104/17-gaming-puzzle-piece-lego-128.png',
  'kextless': 'https://cdn3.iconfinder.com/data/icons/internet-2-10/48/54-128.png',
  'verbose logging': 'https://cdn3.iconfinder.com/data/icons/information-notification-black/3/17-128.png',
  'pvm': 'https://fileinfo.com/img/icons/files/128/pvm-3807.png',
  'shared': 'https://cdn2.iconfinder.com/data/icons/handcraft-1px/16/lan-connection-128.png',
  'bridged': 'https://cdn3.iconfinder.com/data/icons/flat-design-hardware-network-set-2/24/ethernet-plug-64.png',
  'install': 'https://static.thenounproject.com/png/2756717-200.png',
  'service': 'https://i.pinimg.com/originals/71/d1/77/71d177d628bca6aff2813176cba0c18f.png',
  'apps': 'https://cdn2.iconfinder.com/data/icons/engineering-butterscotch-vol-1/512/Applications-128.png',
  'installedApps': 'https://icons.iconarchive.com/icons/mcdo-design/smooth-leopard/256/Applications-Folder-Blue-icon.png',
  'hotcpu': 'https://cdn4.iconfinder.com/data/icons/it-components-2/24/microchip_processor_chip_cpu_hot_burn-128.png',
  'docSearch': 'https://image.flaticon.com/icons/png/128/3126/3126554.png',
  'External Default VM folder': 'https://image.flaticon.com/icons/png/128/3637/3637372.png',
  'not PvmDefault': 'https://image.flaticon.com/icons/png/128/983/983874.png',
  'travelMode':'https://user-images.githubusercontent.com/10322311/121824353-5ceabf80-ccb4-11eb-9120-b5cbd15e31e9.png'

}



function performChecks(){
  //if(niceReportObj.guestOS.adapters[0].ip='192.168.1.159'){markBullet('GuestCommands','warning','','sobaaaaaad!')}

}