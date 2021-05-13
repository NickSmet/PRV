

let x2js = new X2JS();
let bigReportObj 
let params

let limitLogging = 'AdvancedVmInfo'
let currentlyProcessedNode 

function mention(whatTosSay, strict){
  if(strict){
    console.log(whatTosSay)
    return
  }
if (limitLogging){
  if(currentlyProcessedNode==limitLogging){console.log(whatTosSay)}
}

// if(!silence){
// }
}

//Костыльные переменные, чтобы работало на reportus (и там еще немного кода внутри функций)
let reportus
let reportsPrms = {'appendTo':'.reportList','nodeProperty':'href'}
let reportusPrms = {'appendTo':'.table-striped','nodeProperty':'Onclick'}

function getData(requestLink, tries){

  return new Promise (function(resolse, reject){

    $.ajaxSetup({
 
      error: function(xhr, status, error) {
        tries[requestLink]--
        if(tries[requestLink]>0){getData(requestLink, tries)}
           } 
          });
    
    $.get(requestLink, function ldd(data) {
      resolve(data)
    })

  })

}

function getXmlReport(requestLink){

    function sanitizeStringForXML(theString) {
      let NOT_SAFE_IN_XML_1_0 = /[^\x09\x0A\x0D\x20-\xFF\x85\xA0-\uD7FF\uE000-\uFDCF\uFDE0-\uFFFD]/gm;
    return theString.replace(NOT_SAFE_IN_XML_1_0, '');
}

return new Promise(function(resolve, reject){
  $.get(requestLink, function ldd(data) {
    data = sanitizeStringForXML(data)
    let xmlObj = strToXmlToJson(data)
    resolve(xmlObj)
})
})

}

function strToXmlToJson(data){
  if(!data){return}
  xmlDoc = $.parseXML( data );
  jsonObj = x2js.xml2json(xmlDoc);
  return jsonObj
}

function parseLsLr(raw){
  let lsFileRegex = /(?<permissions>[\w-+]{9,11}@?) +(?<hardLinks>\d+) +(?<ownerName>[\(\)\_\{\}\-\w\.]+) +(?<owneGroup>\w+) +(?<type>[\w-]+)? +(?<size>\d+) +(?<modified>(?<month>\w{3}) +(?<day>\d{1,2}) +(?<time>(\d\d\:){1,2}\d\d)? (?<year>\d{4} )?)(?<fileName>[\(\)\_ \{\}\-\w\.]+)/g
  let lsFolderRegex = /(\/[\w ]+\.pvm)?\/(?<location>[^:\n]*):$/gm //the .pvm part is for cases when showing list of files inside .pvm

  let bundleContents = ''

  let bundleLines = raw.split('\n')

  for (let index = 0; index < bundleLines.length; index++) {

    const line = bundleLines[index];
    let folderProperties = lsFolderRegex.exec(line)?.groups
    let filesProperties = lsFileRegex.exec(line)?.groups


    if (line.match(lsFileRegex) && filesProperties.fileName != "." && filesProperties.fileName != "..") {
      if(filesProperties.ownerName.match(/root|\_unknown/)) {filesProperties.ownerName= `<b><font color="red">${filesProperties.ownerName}</font></b>`}
      bundleContents += `${humanFileSize(filesProperties.size)} <b>${filesProperties.fileName}</b> <span style="color: #999999;">${filesProperties.permissions} ${filesProperties.ownerName} ${filesProperties.modified}</span>\n `
    } else
      if (folderProperties) {
        folderLocation = folderProperties.location
 

        //makind output look more like a folder structure
        if(folderLocation.match(/\//g)){
          folderLocationArr=folderLocation.split("\/")
          folderLocation=''
          for (let index = 0; index < folderLocationArr.length; index++) {
            const folder = folderLocationArr[index];
            folderLocation+="\n"+" ".repeat(index*5)+"└──"+folder
          }
        // for (let index = 0; index < folderLocation.match(/\//g).length; index++) {


        //   folderLocation.replace(RegExp("(" + "\/" + ")"), x => x.replace(RegExp("\/" + "$"), "\n"+index*" "+"└──"));
        //   //folderLocation.replace(RegExp("\/{" + index + "}","g"),  "\n"+index*" "+"└──")
        // }
      }
        bundleContents += `\n<b>${folderLocation}</b>:</span>\n`
      }

  }
  return bundleContents
}

//https://stackoverflow.com/questions/26891846/is-there-an-equivalent-of-console-table-in-the-browser
function objArrayToTable(jsonArray, colorcolumn){
  let cols = [];
for (var index in jsonArray) {
  for (var c in jsonArray[index]) {
    if (cols.indexOf(c)===-1) cols.push(c);
  }
}
let html = `<table>
<colgroup>
<col colid=1>
<col colid=2>
<col colid=3>
</colgroup>
<tr>`+
    cols.map(function(c){ return '<th style="border:1px solid #ddd">'+c+'</th>' }).join('')+
    '</tr>';
for (var l in jsonArray) {
  html += '<tr>'+
      cols.map(function(c){ return '<td style="border:1px solid #ddd">'+(jsonArray[l][c]||'')+'</td>' }).join('')+
      '</tr>';
}
html += '</table>';

html=html.replace(''+colorcolumn,`${colorcolumn} style="background-color:#ff9b9b"`)
return html
}

//Constrution of menu with bullets and log links
function buildMenu() {

  $('.headerMain').eq(1).append($(`<a href='http://reportus.prls.net/webapp/reports/${report_id}'>Open on Reportus</a>`))
  
  let appendto = params.appendTo//because it's different on reportus
//Making the main informationpanel occupy half of the screen
    let doc_top_bar = $(appendto).first();
    $(doc_top_bar).css({
      "textAlign":"left"
  });
  doc_top_bar.find('tbody').css({
    "width":"45%",
    "display":"inline-block"
  })
  
    let bullet_container = $('<tbody/>')
    .attr("id", "doc_top_bar")
    .addClass("container")
    .css({
      "margin-left":"2.5em",
      "width":"50%",
      "display":"inline-block",
      'vertical-align':'top'
    })
    doc_top_bar.append(bullet_container);
    
  	ConstructNodeBullets(pinned_items, 'item', bullet_container)
    ConstructNodeBullets(pinned_logs, 'log', bullet_container)
    }

/** @description  Creates bullets and arranges bullets into an array
 */
function ConstructNodeBullets (nodeNamesArray, nodesType, appendNodeBulletsTo) {
    let nodeBulletElement
    let nodeProperty = params.nodeProperty
    for (let i = 0; i < nodeNamesArray.length; i++) {   
        //if the element is not present on page, will create a grayed out bullet (it's better to see that something is missing)
        if ($('a['+nodeProperty+'*="' + nodeNamesArray[i] + '"]').length===0&&!reportus) {
            nodeBulletElement = buildNodeBullet(nodeNamesArray[i], 'blank')
            // if(['GuestCommands','GuestOs','CurrentVm'].includes(nodeNamesArray[i])&&reportus){nodeBulletElement = CreateBullet(nodeNamesArray[i], nodesType)}//reportus
        }
        else {
            nodeBulletElement = buildNodeBullet(nodeNamesArray[i], nodesType)
        }
        $(nodeBulletElement).appendTo(appendNodeBulletsTo)


}
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
function parseXMLItem( data, elementName, parameters, adjustments={}, exclude={}, count=false){
  //mention(data)
  data = data.replace(/\<\-\>/g,"")
  data = data.replace(/<\?xml[^>]*>/g,"")
  data = data.replace(/\&/g,"")
  data = data.replace(/[&]]/g,"")


  xmlDoc = $.parseXML( data ),
  $xml = $( xmlDoc );

  let subBullet = ''

  let element = $xml.find(elementName)
  //mention (element)
  element.each(function () {
    //mention($(this))
    for (let key in exclude){
      //mention(exclude[i])
      //mention(key+value+$(this).find(key).first().text())
      let value_here = $(this).find(key).first().text()
      if (exclude[key] == value_here || value_here.match(exclude[key].toString())){return true}
    }
    
    let subBulletItem = ''


    for (let parameter in parameters){
  
      if(elementName=='HardDisk'||elementName=='SavedStateItem'){//long story
        let paramValue = $.trim($(this).find(parameters[parameter]).first().text())
        if (parameter in adjustments){
            paramValue = adjustSpec(paramValue, adjustments[parameter])
        }
        if (paramValue){
        subBulletItem +='<u>'+parameter+'</u>: '+ paramValue+'\n'}
      
    }else{
      $(this).find(parameters[parameter]).each(function(){
        
        let paramValue = $.trim(($(this).text()))
        if (parameter in adjustments){
            paramValue = adjustSpec(paramValue, adjustments[parameter])
        }
        if (paramValue){
        subBulletItem +='<u>'+parameter+'</u>: '+ paramValue+'\n'}
      })
    }
  
  }
    subBullet = subBullet+subBulletItem+'\n';  })
    if (subBullet.trim() == ''){subBullet='Nothing'}
    
return subBullet}


/** @description  Adds icon before a bullet that signifies that contend has been checked and evaluated, 
 * Example with LoadedDrivers: they can be either OK (e.g. when only apple and prl kexts are loaded), 
 * semi-ok (e.g. when some extra kexts are loaded) 
 * or bad (e.g. LittleSnitch or Hackintosh)
 * @param {object} itemObject Data that needs to be parsed into a subBullet
 * @param {object} parameters Obj defining what data to pull from object and how to name it; format {human_name:key_in_data_object} (e.g. 'Actual Size':'SizeOnDisk')
 * @param {object} adjustments  Obj like {"Size":"bytes"} for parameters that need to be adjusted. (like time for TimZone or bytes to Kb/Mb for readability). Refer to AdjustSpec function for usage 
 * @param {object} exclude Obj defining what values that should be passed to "adjustSpec" function, e.g. passing items to ignore based on some key-value pair in them; format {key_in_data_object:value} (e.g. {'NetworkType':0} will in netw adapters will cause it to skip all adapters that have NetworkType 0)
 */
function parseJsonItem(itemObject, parameters={}, adjustments={}, exclude={}){
  if(!itemObject){return}
  let subBullet = ''
 
  //it's either "CdRom:{Enabled:0,Connected:1...}" or CdRom:{0:{Enabled:0,Connected:1...},1:{Enabled:0,Connected:1...}}
 if(itemObject[0]){
  loopItems:
   for (const item in itemObject) {
  loopSubItems:
    for (const property in exclude) {
      if(itemObject[item][property]==exclude[property]){continue loopItems}
    }
    
     let subItem = CreateSubItem(itemObject[item])
     subBullet = subItem ? subBullet+CreateSubItem(itemObject[item])+'\n' : subBullet ;}}else{
     subBullet=CreateSubItem(itemObject)+'\n'
   }
 function CreateSubItem(itemObject){
   let subItem = ''
   for (const property in parameters) {
   let id = parameters[property]
   let hName = property
   let value = ObjByString(itemObject,id)
     
   if (hName in adjustments){value = adjustSpec(value, adjustments[hName])}
     subItem +='<u>'+hName+'</u>: '+ value+'\n'
      //mention(`${hName}: ${value}`);
 }
 return subItem
 }
 
 return subBullet}


/** @description  Construction of individual bullet
 * @param {string} item_name Bullet's displayed name (don't use spaces).
 * @param {string} bullet_type 'Custom' by default, and that's what you need. 
 * @param {Object} data Bullet's data. What you want to see when it's expanded.
 * @param {Object} icon_url  
 */
function buildNodeBullet(item_name, bullet_type, data, icon_url, sublevel=0) {
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

    if (pinned_collapsibles.indexOf(item_name) == -1 && bullet_type!='Custom'){
        collapsible_template = '<div>\
<button type="button" id={{:button_id}} class="btn btn-outline-secondary btn-xs" aria-pressed="true" data-toggle="collapse" data-target={{:item_target}}>\
➤\
</button>\
<a style="text-decoration: none; background-color: unset !important;" href={{:item_link}}>{{:item_name}}</a></div>'
}    

    if (bullet_type=='Custom'){
      collapsible_template = '<div>'+sublevel_space.repeat(sublevel)+'\
{{if icon_url}}   <img src="{{:icon_url}}" style= "display: inline; height: 1.5em;">  {{else}}       {{/if}}\
<button type="button" id={{:button_id}} class="btn btn-info btn-xs" aria-pressed="true" data-toggle="collapse" data-target={{:item_target}}>\
➤\
</button>\
  <a style=" text-decoration: none; background-color: unset !important;">{{:item_name}}</a>\
</div>\
<div id={{:item_id}} style="white-space: pre ; height: 1.5em; border: 1px solid rgba(0, 0, 0, 0.23); border-radius: 4px;" class="collapse">\{{if item_data}}{{:item_data}}{{else}}Nothing yet.{{/if}}</div>'
}


    if (bullet_type=='blank'){
    collapsible_template = '<div>'+sublevel_space.repeat(sublevel)+'\
{{if icon_url}}   <img src="{{:icon_url}}" style= "display: inline; height: 1.5em; filter: saturate(0%);">  {{else}}       {{/if}}\
<button type="button" id={{:button_id}} class="btn btn-outline-secondary btn-xs" aria-pressed="true" data-toggle="collapse" data-target={{:item_target}}>\
➤\
</button>\
  <a style="text-decoration: none; background-color: unset !important; color:lightgray">\
{{:item_name}}</a>\
</div>'
    }


    

    let type_to_link 
    if (!reportus){type_to_link={
      'item':'https://reports.prls.net/Reports/Xml.aspx?ReportId=' + report_id + '&NodeName=' + item_name,
      'log' : 'https://reports.prls.net/Reports/Log.aspx?ReportId=' + report_id + '&LogName=' + item_name,
        'blank' : ''
    }}else if (reportus){
      type_to_link={
        'item':'https://reportus.prls.net/webapp/reports/' + report_id + '/report_xml/subtree/' + item_name,
        'log' : $('a[href*="' + item_name + '"]').attr('href'),
          'blank' : ''
      }
    }
   



    let item_data = data;
  	var item_link = type_to_link[bullet_type];
    
    let item_id = item_name.split(" ").join("");;
    if(bullet_type=='log'){
      item_id = item_name.replace('Log')
    }
    
    
    let button_id = "btn_" + item_id;
    let item_summary = "nothing yet";
    let item_target = '#' + item_id.replaceAll('\.','\\\.');


    let bullet_content = {
        item_data : item_data,
        item_link: item_link,
        item_name: item_name,
        item_id: item_id,
        item_summary: item_summary,
        item_target: item_target,
        button_id: button_id,
        icon_url : icon_url,
    };

    collapsible_template = $.templates(collapsible_template);
    let bullet = collapsible_template.render(bullet_content)
    
    return bullet

}



function BulletData(item_id, option) {
  let bullet_parsed_data
  let panic

  currentlyProcessedNode =  item_id
  mention({currentlyProcessedNode})

  let extractedFromReportXml  = {
  'CurrentVm':bigReportObj.ParallelsProblemReport.CurrentVm,
  'LoadedDrivers':bigReportObj.ParallelsProblemReport.LoadedDrivers,
  'AllProcesses':bigReportObj.ParallelsProblemReport.AllProcesses,
  'GuestCommands':bigReportObj.ParallelsProblemReport.GuestCommands,
  'GuestOs':bigReportObj.ParallelsProblemReport.GuestOs,
  'MountInfo':bigReportObj.ParallelsProblemReport.MountInfo,
  'HostInfo':bigReportObj.ParallelsProblemReport.HostInfo,
  'ClientProxyInfo':bigReportObj.ParallelsProblemReport.ClientProxyInfo,
  'MoreHostInfo':bigReportObj.ParallelsProblemReport.MoreHostInfo,
  'VmDirectory':bigReportObj.ParallelsProblemReport.VmDirectory,
  'InstalledSoftware':bigReportObj.ParallelsProblemReport.InstalledSoftware,
  // 'AdvancedVmInfo':bigReportObj.ParallelsProblemReport.AdvancedVmInfo,
  'LaunchdInfo':bigReportObj.ParallelsProblemReport.LaunchdInfo,
  // 'AutoStatisticInfo':bigReportObj.ParallelsProblemReport.AutoStatisticInfo,
  'AppConfig':bigReportObj.ParallelsProblemReport.AppConfig,
  'NetConfig':bigReportObj.ParallelsProblemReport.NetConfig,
  'LicenseData':bigReportObj.ParallelsProblemReport.LicenseData,

}


let haveJsonFormat = ['GuestCommands']

  if (item_id in extractedFromReportXml ){
    
    bullet_all_data = extractedFromReportXml [item_id]
    mention(`Processing ${item_id} the new way. Data is ${typeof bullet_all_data}`);

    if(extractedFromReportXml [item_id]) {
      if(haveJsonFormat.includes(item_id)){AddNodeToSearch(bullet_all_data, item_id)}else{AddNodeToSearch(bullet_all_data, item_id)}
      eval("bullet_parsed_data=parse"+item_id.replace('.log','Log')+"(bullet_all_data)")
    }
    
    if (!bullet_parsed_data){return}//if corresponding function already set the bullet data manually without returning anything (like parseLoadedDrivers)
    $('#' + item_id.replaceAll('\.','\\\.')).html(bullet_parsed_data);
    return
  }

  if (tries[item_id]){tries[item_id]--}else{tries[item_id]=tries['tries']}
    bullet_parsed_data = 'nothing yet';

    if (pinned_collapsibles.includes(item_id)){$('#' + item_id.replaceAll('\.','\\\.')).text('loading...');}
    
    
    let request_link = 'https://reports.prls.net/Reports/Xml.aspx?ReportId=' + report_id + '&NodeName=' + item_id
    if (reportus){request_link = 'https://reportus.prls.net/webapp/reports/' + report_id + '/report_xml/subtree/' + item_id;}

if (item_id.match('[^c].log')){
      request_link = 'https://reports.prls.net/Reports/Log.aspx?ReportId=' + report_id + '&LogName=' + item_id
  }else if (item_id.match('panic.log')){
    request_link='https://reports.prls.net/Reports/Log.aspx?ReportId=+'+report_id+'+&LogName=panic.log&DownloadOrig=True&DownloadName=panic.log'
  panic=true
  }
  
  if (reportus&&item_id.match('\.log')){request_link=$('a[href*="' + item_id + '"]').attr('href')
}

  
    $.ajaxSetup({
 
      error: function(xhr, status, error) {

        if(tries[item_id]>0){BulletData(item_id, option)}
           } 
          });
    
    $.get(request_link, function ldd(data) {
      
      
        let bullet_all_data
        if (panic==true){
          data=JSON.parse(data)
          bullet_all_data=data["log_path"]+"\n\n"+data["panic_string"]}
        else{
          if (!reportus) {bullet_all_data = $('pre', data).eq(0).text().replace('<?xml version="1.0" encoding="UTF-8"?>','')}
          else {bullet_all_data=data.replace('<\!\[CDATA\[\<\?xml version="1\.0" encoding="UTF-8"\?\>','').replace('\]\]>','').replace('\<\!\[CDATA\[','')
        }
         
        }
        if(!bullet_all_data){
          bullet_parsed_data = "Some kind of (likely server) error"
          return
        }

        AddNodeToSearch(bullet_all_data, item_id) // AddNodeToSearch(bullet_all_data, item_id.replace('.log','Log'))
        eval("bullet_parsed_data=parse"+item_id.replace('.log','Log')+"(bullet_all_data)")
        mention("PARSING "+item_id)

        if (!bullet_parsed_data){return}//if corresponding function already set the bullet data manually without returning anything (like parseLoadedDrivers)
        if(typeof option === "undefined") {
        $('#' + item_id.replaceAll('\.','\\\.')).html(bullet_parsed_data);
        return
        }
        else if (option == 'time') {
            timediff = bullet_parsed_data
//need to rewrite the bit below (and maybe FitTime to aligh with it)
            correcttime = fixTime (timediff)

            let timeElementPath = reportus ? "b:contains('Creation Time')" : "body > div:nth-child(2) > table.reportList > tbody > tr:nth-child(3) > td:nth-child(3)"
            let gmtElement = reportus ? $(timeElementPath).parent().next() : $(timeElementPath)
          

            let gmt_string = reportus ? gmtElement.text() : $(".reportList:first tbody:first tr:nth-child(3) script").text()

            let gmt_regex = reportus ? /(.*)/ : /\(\"([\d\-T\:]*)\"\)/
            let gmt_substr =  gmt_string.match(gmt_regex)[1];
            let gmt_time = Date.parse(gmt_substr);
            //mention(gmt_time)
            let time_seconds = gmt_time/1000;
            //mention(time_seconds)
            let correct_time1 = new Date(0);
          //mention(correct_time)
            //mention(timediff)
            correct_time1.setUTCSeconds(time_seconds+10800)
            gmt_time = correct_time1.toString().substring(4,24)
            $(gmtElement).html("Customer: "+correcttime+"</br> Moscow:&nbsp;&nbsp;&thinsp;&thinsp;"+gmt_time)

        }


    })}

function bulletSubItem(parameter, paramValue){
return '<u>'+parameter+'</u>: '+ paramValue+'\n'
}

function parsepanicLog(item_all_data){
let panicDateRegex = /^.*panic-full-(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})-(?<hour>\d{2})(?<min>\d{2})(?<sec>\d{2}).*/u
let panicDateRegex2 = /\/Library\/Logs\/DiagnosticReports\/Kernel.(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})-(?<hour>\d{2})(?<min>\d{2})(?<sec>\d{2}).*/u
let panicCreationString = ""
if(item_all_data.match(panicDateRegex))
{panicCreationString = item_all_data.match(panicDateRegex)[0]}
else if(item_all_data.match(panicDateRegex2)
){
panicCreationString = item_all_data.match(panicDateRegex2)[0]
panicDateRegex = panicDateRegex2
}

mention({panicCreationString})

let dateString = panicCreationString.replace(panicDateRegex,"$<month>-$<day>-$<year> $<hour>:$<min>:$<sec>")

panicTime=Date.parse(dateString)
let time_seconds = panicTime/1000;
let correct_time = new Date(0);
correct_time.setUTCSeconds(time_seconds)
panicTime = correct_time.toString().substring(4,24)


item_all_data = item_all_data.replace(panicCreationString, "<b>Panic time: "+dateString+"</b>")
item_all_data = item_all_data.replaceAll(/(last loaded kext)/g, "<b><u>$1</u></b>")
item_all_data = item_all_data.replaceAll(/(Kernel Extensions in backtrace)/g, "<b><u>$1</u></b>")
//item_all_data = item_all_data.replaceAll(/(backtrace|loaded)/,"<b>$1</b>")

return item_all_data
}

let ObjByString = function(o, s) {
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

function parseCurrentVm(CurrentVmData) {

    mention(CurrentVmData)

    // xmlDoc = $.parseXML( item_all_data );
    // //$xml = $( xmlDoc );
    // let jsonObj = x2js.xml2json(xmlDoc);
    // theBigReportObject['vm'] = jsonObj

    //$xml = $(x2js.json2xml(theBigReportObject['vm']['CurrentVm']))

    //var hdds_regex = /\<Hdd[^\>]*\>[^$]*<\/CommandName>/g

    let vmObj = strToXmlToJson(CurrentVmData).ParallelsVirtualMachine


    let ParamVMHDDs = {'Location':'SystemName', 'Virtual Size':'Size', 'Actual Size':'SizeOnDisk', 'Interface':'InterfaceType', 'Splitted':'Splitted', 'Trim':'OnlineCompactMode', 'Expanding':'DiskType'}
    let AdjustsVMHDDs = {'Interface':'hddtype', 'Actual Size': 'appleMbytes','Virtual Size':'mbytes'}
    let iconVMHDDs = icons.hdds

    let VMHDDs_data = parseJsonItem (vmObj.Hardware.Hdd, ParamVMHDDs,AdjustsVMHDDs)
    //var VMHDDs_data = parseXMLItem (item_all_data,element = "Hdd",ParamVMHDDs,AdjustsVMHDDs)

    let VMHDDs = buildNodeBullet('HDDs','Custom', VMHDDs_data, iconVMHDDs)

    let ParamVMCDs = {'Location':'SystemName','Interface':'InterfaceType'}
    let AdjustsVMCDs = {'Interface':'hddtype'}
    let iconVMCDs = icons.cd
    let CdExclude = {'Connected':'0'}

    let VMCDs_data = parseJsonItem (vmObj.Hardware.CdRom, ParamVMCDs,AdjustsVMCDs,CdExclude)
    //var VMCDs_data = parseXMLItem (item_all_data,element = "Hdd",ParamVMCDs,AdjustsVMCDs)

    let VMCDs = buildNodeBullet('CDs','Custom', VMCDs_data, iconVMCDs)
    
    let ParamVMNETWORKs = {'Type':'AdapterType', 'Mode':'EmulatedType', 'Adapter name':'AdapterName', "Mac":'MAC', 'Conditioner':'LinkRateLimit.Enable'}
    let AdjustsVMNETWORKs = {'Type':'networkAdapter', 'Mode':'networkMode','Mac':'networkMac'}
    let iconVMNETWORKs = icons.networkAdapter

    //var VMNETWORKs_data = parseXMLItem (item_all_data, element = "NetworkAdapter", ParamVMNETWORKs, AdjustsVMNETWORKs)
    networkAdapters = vmObj.Hardware.NetworkAdapter
    let VMNETWORKs_data = parseJsonItem ( networkAdapters, ParamVMNETWORKs, AdjustsVMNETWORKs)
    let VMNETWORKs = buildNodeBullet('Networks','Custom', VMNETWORKs_data, iconVMNETWORKs)

    
    if(VMNETWORKs.match('Shared')){markBullet('CurrentVm','shared')}
    if(VMNETWORKs.match('Bridged')){markBullet('CurrentVm','bridged')}

    let ParamVMUSBs = {'Name':'SystemName', 'Last connected':'Timestamp'}
    let AdjustsVMUSBs = {'Last connected':'time'}
    let iconVMUSBs = "https://image.flaticon.com/icons/svg/1689/1689028.svg"

    usbObj = vmObj.Hardware.UsbConnectHistory?.USBPort
    let VMUSBs_data = parseJsonItem (usbObj, ParamVMUSBs,AdjustsVMUSBs)
    //var VMUSBs_data = parseXMLItem ( item_all_data, element = "USBPort", ParamVMUSBs,AdjustsVMUSBs)
    let VMUSBs = buildNodeBullet('USBs','Custom', VMUSBs_data, iconVMUSBs)

    let currentVmSpecs = {
      'Section5':'Startup',
      'AutoStart': vmObj.Settings.Startup.AutoStart,
      'OnVmWindowClose': vmObj.Settings.Shutdown.OnVmWindowClose,
      'Pause When Possible': vmObj.Settings.Tools.Coherence.PauseIdleVM,

      'Section0':'General',
      
      'VM Name': vmObj.Identification.VmName,
      'PVM Location': vmObj.Identification.VmHome.replace(/\/config.pvsp?/,''),
      'Creation date': vmObj.Identification.VmCreationDate,
      'This VM UUID': vmObj.Identification.VmUuid,
      'Source   UUID': vmObj.Identification.SourceVmUuid, 
      
      'Section1':'Hardware',
      'Cpus': vmObj.Hardware.Cpu.Number,
      'Ram': vmObj.Hardware.Memory.RAM,
      'VRam': vmObj.Hardware.Video.VideoMemorySize,
      'Resource Quota': vmObj.Settings.Runtime.ResourceQuota,
      'Video Mode': parseInt(vmObj.Hardware.Video.EnableHiResDrawing) + parseInt(vmObj.Hardware.Video.NativeScalingInGuest),
      'Scale To Fit Screen': vmObj.Settings.Runtime.FullScreen.ScaleViewMode,
      '3D Acceleration': vmObj.Hardware.Video.Enable3DAcceleration,
      'Keyboard': vmObj.Settings.Runtime.OptimizeModifiers,
      'Mouse': parseInt(vmObj.Settings.Tools.SmartMouse.Enabled)+parseInt(vmObj.Settings.Tools.MouseSync.Enabled),
      //'Lan Adapter': $xml.find('AdapterType').text(),
      //'Networks': $xml.find('NetworkAdapter > EmulatedType').text(),
      'Subbullet3': VMNETWORKs,
      'Subbullet2':VMHDDs,
      'Subbullet4':VMCDs,
      
      'Hypervisor': vmObj.Settings.Runtime.HypervisorType,
      'Adaptive Hypervisor': vmObj.Settings.Runtime.EnableAdaptiveHypervisor,
      'Nested Virtualization': vmObj.Hardware.Cpu.VirtualizedHV,
      'Section2':'Sharing',
      'Isolated': vmObj.Settings.Tools.IsolatedVm,
      'Shared profile': vmObj.Settings.Tools.SharedProfile.Enabled,
      'Share Host Cloud': vmObj.Settings.Tools.SharedFolders.HostSharing.SharedCloud,
      'Map Mac Volumes' : vmObj.Settings.Tools.SharedVolumes.Enabled,
      'Access Guest from Host' : vmObj.Settings.Tools.SharedFolders.GuestSharing.Enabled,
      'Share OneDrive with Host' : vmObj.Settings.Tools.SharedFolders.GuestSharing.AutoMountCloudDrives,
      'Share Guest Netw. Drives': vmObj.Settings.Tools.SharedFolders.GuestSharing.AutoMountNetworkDrives,
      'Share Guest Extern. Drives': vmObj.Settings.Tools.SharedFolders.GuestSharing.ShareRemovableDrives,
      'Shared Guest Apps': vmObj.Settings.Tools.SharedApplications.FromWinToMac,
      'Shared Host Apps': vmObj.Settings.Tools.SharedApplications.FromMacToWin,
      
      // 'Win>Mac Sharing': FromWinToMac, NEED TO REWORK SHARING
      // 'Mac>Win Sharing': FromMacToWin,
      'Clipboard': vmObj.Settings.Tools.ClipboardSync.Enabled,
      'Time Sync': vmObj.Settings.Tools.TimeSync.Enabled,
      'Section3':'Other',
    'Smart Guard': vmObj.Settings.Autoprotect.Enabled,
    'Opt.TimeMachine': vmObj.Settings.Autoprotect.Schema,
    '<b>Boot Flags</b>': vmObj.Settings.Runtime.SystemFlags,
  'Graphic Switching': vmObj.Settings.Runtime.OptimizePowerConsumptionMode,
  'Enter Travel Mode': vmObj.Settings.TravelOptions.Condition.Enter,
  'Section':'Devices',
  'Share Host Printers': vmObj.Settings.VirtualPrintersInfo.UseHostPrinters,
  'Sync Default Printer': vmObj.Settings.VirtualPrintersInfo.SyncDefaultPrinter,
  'Show Page Setup': vmObj.Settings.VirtualPrintersInfo.ShowHostPrinterUI,
  'Shared Camera': vmObj.Settings.SharedCamera.Enabled,

  'Shared CCID': vmObj.Settings.SharedCCID?.Enabled,
  'Shared Bluetooth': vmObj.Settings.SharedBluetooth.Enabled,
  'Enter Travel Mode': vmObj.Settings.TravelOptions.Condition.Enter,
  'USB 3.0': vmObj.Settings.UsbController.XhcEnabled,
  'TPM': vmObj.Hardware.TpmChip?.Type,
  'Subbullet1': VMUSBs
  };

  if(VMHDDs.match(/<u>Expanding<\/u>: 0/)&&VMHDDs.match(/<u>Actual Size<\/u>: 0 B/)){markBullet('CurrentVm', 'Boot Camp')}
  else{//if it's Boot Camp, we don't care about the rest of vHDD info.
    if(VMHDDs.match(/<u>Trim<\/u>: 1/)){markBullet('CurrentVm', 'trim')}
    if(VMHDDs.match(/<u>Splitted<\/u>: 1/)){markBullet('CurrentVm', 'splitted')}
    if(VMHDDs.match(/<u>Expanding<\/u>: 0/)){markBullet('CurrentVm', icons["plain vHDD"])}
  }
  
  let externalVhddRegex = RegExp('(<u>Location</u>: ((?!'+currentVmSpecs['PVM Location'].replace(/\(/g,"\\(").replace(/\)/g,"\\)")+').)+)','gm') //chckse if there are vHDDs with "Location" outside of PVM
  
  if(VMHDDs.match(externalVhddRegex)&&bigReportObj.ParallelsProblemReport.ProductName!='Parallels Desktop for Chrome OS'){markBullet('CurrentVm', icons["external vHDD"])}


function markConditioner(adapter){

    if (adapter.LinkRateLimit.Enable == 0) {
      return
    } //для наглядности
    if (
      adapter.LinkRateLimit.Enable == 1 &&
      adapter.LinkRateLimit.TxBps +
        adapter.LinkRateLimit.RxBps +
        adapter.LinkRateLimit.TxLossPpm +
        adapter.LinkRateLimit.RxLossPpm +
        adapter.LinkRateLimit.TxDelayMs +
        adapter.LinkRateLimit.RxDelayMs !=
        0
    ) {
      markBullet('CurrentVm', icons['network conditioner limited']) 
      return
    }

    if (adapter.LinkRateLimit.Enable == 1) {
      markBullet('CurrentVm', icons['network conditioner fullspeed'])
    }
  }



  if (Array.isArray(networkAdapters)) {
    for (key in networkAdapters){
      let adapter = networkAdapters[key]
      markConditioner(adapter)}
  }
  else{markConditioner(networkAdapters)}
  
  // if(VMNETWORKs.match(/<u>Conditioner<\/u>: 1/)){

  //   markBullet('CurrentVm', icons["network conditioner"])
  // }

  
  if(bigReportObj.ParallelsProblemReport.ProductName=='Parallels Desktop for Chrome OS' && !currentVmSpecs["VM Name"].match(/PvmDefault/i)){markBullet('CurrentVm','not PvmDefault')}
    
    let all_specs = '';

    //check if VM ram is not more than 1/2 of Host.
    let hostram = reportus ? $("body > table:nth-child(7) > tbody > tr:nth-child(14) > td:nth-child(2)") : $("table.reportList > tbody > tr:nth-child(17) > td:nth-child(2)").text()
    
    let vmram = currentVmSpecs['Ram']

    if (vmram>hostram/2&&hostram-vmram<6144){
      currentVmSpecs['Ram']+='<b style="color:red">!!!!! Too Much</b>',
      markBullet("CurrentVm",'bad')
    }
    if((vmram % 256) != 0){
      currentVmSpecs['Ram']+='<b style="color:orange">! Uneven amount </b>',
      markBullet("CurrentVm",'warning')
    }

    //Setting correct value for vram
    if (currentVmSpecs['VRam']=="0"){currentVmSpecs['VRam']="Auto"}

    //Identifying if VM was copied
    if (currentVmSpecs['Source   UUID']!=currentVmSpecs['This VM UUID'])
    {markBullet("CurrentVm",'copied vm')}

    //Identifying if VM is on an external volumes
    if (currentVmSpecs['PVM Location'].match(/^\/Volumes/)){markBullet("CurrentVm","external drive")}

    //Identifying AppleHV and marking bullet accordingly
    if (currentVmSpecs['Hypervisor']==1)
    {markBullet("CurrentVm","AppleHV")}

 //Identifying Nested Virtualization and marking bullet accordingly
    if (currentVmSpecs['Nested Virtualization']==1)
    {markBullet("CurrentVm","Nested")}

    //Identifying if headless and marking bullet accordingly
    if (currentVmSpecs['AutoStart']==5 || currentVmSpecs['AutoStart']==1 || currentVmSpecs['OnVmWindowClose']==5)
    {markBullet("CurrentVm","headless")} 
    else
    {//markBullet("CurrentVm",'not headless')
  }

      //Identifying if Timesync is off
      if (currentVmSpecs['Time Sync']==0){markBullet("CurrentVm","noTimeSync")}

    //Identifying if Isolated and marking bullet accordingly
    if (currentVmSpecs['Isolated']=='1'){markBullet("CurrentVm","isolated")}

    //Identifying if has bootflags and marking bullet accordingly
    if (currentVmSpecs['<b>Boot Flags</b>']!=''){markBullet("CurrentVm","flags")}
    let specs_to_name = {
      'Lan Adapter':{0: 'Legacy',1 :'RealTek RTL8029AS',2: 'Intel(R) PRO/1000MT',3:'Virtio', 4:'Intel(R) Gigabit CT (82574l)'},
      'Network':{1: 'Shared',2 :'Bridged'},
      'Opt.TimeMachine':{1: 'On',2 :'Off'},
      'Graphic Switching':{1:'Off',0:'On'},
      'Hypervisor':{0:'Parallels', 1:'Apple'},
      'Video Mode':{0:'Scaled',1:'Best for Retina',2:'Best for external displays'},
      'Scale To Fit Screen':{0:'Off',1:'Auto',2:'Keep ratio',3:'Stretch'},
      'Keyboard':{0:'Don\'t optimize for games',1:'Optimize for games',2:'WTF?',3:'Auto'},
      'Mouse':{0:'Optimize for games',1:'Don\'t optimize for games',2:'Auto',3:'WTF?'}

    }


    if (currentVmSpecs['TPM']!=0&&currentVmSpecs['TPM']){
      markBullet("CurrentVm",icons.TPM)
    }

    if(vmObj.Identification.LinkedVmUuid!=''){markBullet('CurrentVm', icons["linked clone"])}

    if (currentVmSpecs['Smart Guard']==1)
    {markBullet("CurrentVm","smart guard")}


    if (currentVmSpecs['Resource Quota']<100)
    {markBullet("CurrentVm","resource quota")}

    keysWithIcons = {
      'Share Host Printers':'printers',
      'Scale To Fit Screen':'fullscreen',
    'Smart Guard':'smart guard',
    'Keyboard':'keyboard',
    'Mouse':'mouse',
    'Share Guest Extern. Drives':'usb',
    'Share Guest Netw. Drives':'network folder',
    'Share OneDrive with Host':'onedrive'
  }
    

    for (var key in currentVmSpecs) {//я немного запутался, но оно рабоатет
      let spec
       let specName = key
       let specValue = currentVmSpecs[key] || 0

       
       if (key in specs_to_name) {
        specValue = specs_to_name[key][specValue]
           spec = '<u>'+specName+'</u>'+ ': ' + specValue + '\n';
        }

        if (key in keysWithIcons) {
          icon = markBullet('this',keysWithIcons[key])
          specName = icon.concat(specName)
       }

        
      if (key.match('Section')) {
        spec = '\n<strong>⫸'+specValue+'⫷</strong>\n'
     } else if (key.match('Subbullet')) {
      spec = specValue }  else {
      spec = '<u>'+specName+'</u>' + ': ' + specValue + '\n';
     }

     
        all_specs = all_specs + spec}



        return all_specs;


}

function parseNetConfig(item_all_data) {

  let xmlDoc = $.parseXML( item_all_data );
  let jsonObj = x2js.xml2json(xmlDoc);
 
  bigReportObj['ParallelsProblemReport']['NetConfig'] = jsonObj

  let HostInfo = strToXmlToJson(bigReportObj['ParallelsProblemReport']['HostInfo'])



  let netCfgObj = jsonObj.ParallelsNetworkConfig

  let kextless = netCfgObj.UseKextless

  let macOS = HostInfo.ParallelsHostInfo.OsVersion.Major

  
  networkParams = {
    'Name':'Description',
    'DHCP IP':'HostOnlyNetwork.DhcpIPAddress',
    'Net Mask':'HostOnlyNetwork.IPNetMask',
    'Host IP':'HostOnlyNetwork.HostIPAddress',
    'DHCP Enabled':'HostOnlyNetwork.DHCPServer.Enabled',
    'IPv6 DHCP Ehabled':'HostOnlyNetwork.DHCPv6Server.Enabled'
  }
  let networkExclude = {'NetworkType':0}
  let network = parseJsonItem(netCfgObj.VirtualNetworks.VirtualNetwork, networkParams,{}, networkExclude)
  
  if (macOS<11){return network}

  network = "<u>Kextless</u>: "+kextless+"\n\n"+network

  let kextlessMark
 

  switch (kextless) {//NEED TO TAKE INTO ACCOUNT MACOS
    case '1':
    case '-1':
    case undefined:
      kextlessMark="kextless"
      break
    case '0':
      kextlessMark="kext"
      break
    default:
      kextlessMark='warning'
    
  }

  markBullet("NetConfig", kextlessMark)

  //var networkBullet = CreateBullet('Networks', 'Custom', savedStates, 'https://image.flaticon.com/icons/svg/387/387157.svg')

     return network;
    }

function 	parseClientProxyInfo(item_all_data) {

      proxies_regex = /\<dictionary\> {[^}]*}([^}]*)}/gm

      let proxies = item_all_data.match(proxies_regex) ? item_all_data.match(proxies_regex)[0] : ''

      if (proxies.match(/HTTPEnable : 1/)){markBullet("ClientProxyInfo","bad")}else{markBullet("ClientProxyInfo",'all good')}
    
    
         return ;

}

function parseAdvancedVmInfo(item_all_data) {


  //Here we're just fixing the XML structure. For some resong for AdvancedVmInfo it's a bit off. Need to clean this up later.
  regex1 = /\<\/AdvancedVmInfo\>\n\<\/AdvancedVmInfo\>/gm,
    regex2 = /(<ParallelsSavedStates>|<\/DiskInfo>|<\/Hdd>)/gm
  regex3 = /(<DiskInfo>|<Hdd[^>]*>)/gm
  regex4 = /\<AdvancedVmInfo\>\n\<AdvancedVmInfo[^>]*\>/gm,
  regex5= /<\?xml[^>]*>/gm

 item_all_data = item_all_data.replace(regex1, '</AdvancedVmInfo>');
  item_all_data = item_all_data.replace(regex2, "")
  item_all_data = item_all_data.replace(regex3, "")
  item_all_data = item_all_data.replace(regex4, '<AdvancedVmInfo>')
  //item_all_data = item_all_data.replace(regex5, '')
  //item_all_data = item_all_data.replace(regex3,"")

  mention(item_all_data);

  let AdvancedVmInfoContents = ''

  if (item_all_data.match(/writeattr/)) {
    markBullet('AdvancedVmInfo', 'ACL')
  }

  if (item_all_data.match(/ root |\_unknown/)) {
    markBullet('AdvancedVmInfo', 'root or unknown owner')
  }

  let number_of_snapshots = item_all_data.match(/SavedStateItem/g) ? item_all_data.match(/SavedStateItem/g).length / 2 - 1 : 0;


  if (number_of_snapshots < 1) {
    markBullet("AdvancedVmInfo", "no_snapshots")
    AdvancedVmInfoContents += "No snapshots\n"
  } else {
    markBullet("AdvancedVmInfo", "snapshots")
    markBullet("AdvancedVmInfo", "Custom", '<a>' + number_of_snapshots + '* </a>')
    snapshotList = {
      'Name': 'Name',
      'Created on': 'DateTime'
    }
    let snapshots = parseXMLItem(item_all_data, "SavedStateItem", snapshotList)
    let snapshotBullet = buildNodeBullet('Snapshots', 'Custom', snapshots, 'https://image.flaticon.com/icons/svg/387/387157.svg')
    AdvancedVmInfoContents += snapshotBullet
  }


  bundleData = parseLsLr(item_all_data)
  
  let bundleBullet = buildNodeBullet('PVM Bundle', 'Custom', bundleData, 'https://fileinfo.com/img/icons/files/128/pvm-3807.png')
  AdvancedVmInfoContents += bundleBullet

  return AdvancedVmInfoContents;


}

function parseHostInfo(item_all_data) {
  //mention(item_all_data)
 

let ParamUSBs = {'Name':'Name', 'UUID':'Uuid'}
let iconUSBs = "https://image.flaticon.com/icons/svg/1689/1689028.svg"

let ParamHDDs = {'Name':'Name', 'UUID':'Uuid', "Size":"Size"}
let AdjustsHdd = {"Size":"bytes"}
let HddFilter = {'Name':'AppleAPFSMedia'}
let iconHDDS = 'https://image.flaticon.com/icons/svg/1689/1689016.svg'

let paramCameras = {'Name':'Name', 'UUID':'Uuid'}

let ParamNetwork = {'Name':'Name','UUID':'Uuid', "MAC":"MacAddress","IP":'NetAddress'}
let iconNetwork = "https://image.flaticon.com/icons/svg/969/969345.svg"
let networkFilter = {}

let ParamInputs = {'Name':'Name', 'UUID':'Uuid'}
let iconInputs = "https://image.flaticon.com/icons/svg/1689/1689025.svg"

let ParamPrinters = {'Name':'Name', 'UUID':'Uuid'}
let iconPrinters = "https://image.flaticon.com/icons/svg/2489/2489670.svg"

let ParamCCIDs = {'Name':'Name', 'UUID':'Uuid'}
let iconCCIDS = "https://image.flaticon.com/icons/svg/908/908765.svg"

  let USBs_data = parseXMLItem( item_all_data, element = "UsbDevice", ParamUSBs)
  let Network_data = parseXMLItem( item_all_data, element = "NetworkAdapter", ParamNetwork,{},networkFilter)
  let HDDs_data = parseXMLItem( item_all_data, element = "HardDisk", ParamHDDs, AdjustsHdd,HddFilter)
  let Inputs_data = parseXMLItem( item_all_data, element = "HIDDevice", ParamInputs)
  let Printers_data = parseXMLItem( item_all_data, element = "Printer", ParamPrinters)
  let CCIDs_data = parseXMLItem( item_all_data, element = "SmartCardReaders", ParamCCIDs)
  let camerasData = parseXMLItem( item_all_data, element = "Camera", paramCameras)
  
//that's definitely super-repetative; but ok for now
  let specs_definition = {
  'Subbullet1': (USBs_data=='Nothing') ? buildNodeBullet('Host_USBs','blank', USBs_data, iconUSBs) : buildNodeBullet('Host_USBs','Custom', USBs_data, iconUSBs),
  'Subbullet2': (Network_data=='Nothing') ? buildNodeBullet('Host_Nets','blank', Network_data, iconNetwork) : buildNodeBullet('Host_Nets','Custom', Network_data, iconNetwork),
  'Subbullet3': (HDDs_data=='Nothing') ? buildNodeBullet('Host_HDDs','blank', HDDs_data, iconHDDS) : buildNodeBullet('Host_HDDs','Custom', HDDs_data, iconHDDS),
  'Subbullet4': (camerasData=='Nothing') ? buildNodeBullet('Host_Cams','blank', camerasData, icons.webcam) : buildNodeBullet('Host_Cams','Custom', camerasData, icons.webcam),
  'Subbullet5': (Inputs_data=='Nothing') ? buildNodeBullet('Host_Input_Devices','blank', Inputs_data, iconInputs) : buildNodeBullet('Host_Input_Devices','Custom', Inputs_data, iconInputs),
  'Subbullet6': (Printers_data=='Nothing') ? buildNodeBullet('Host_Printers','blank', Printers_data, iconPrinters) : buildNodeBullet('Host_Printers','Custom', Printers_data, iconPrinters),
  'Subbullet7': (CCIDs_data=='Nothing') ?buildNodeBullet('Host_CCIDs','blank', CCIDs_data, iconCCIDS) : buildNodeBullet('Host_CCIDs','Custom', CCIDs_data, iconCCIDS),

  };

  if(item_all_data.match('DisplayLink')){markBullet('HostInfo','DisplayLink device!')}


  let all_specs = '';

  let specs_to_name = {
    'Lan Adapter':{0: 'Legacy',1 :'RealTek RTL8029AS',2: 'Intel(R) PRO/1000MT',3:'Virtio', 4:'Intel(R) Gigabit CT (82574l)'},
    'Network':{1: 'Shared',2 :'Bridged'},
    'Opt.TimeMachine':{1: 'On',2 :'Off'}
  };

  for (var key in specs_definition) {
     //if (item_all_data.match(specs_regex[key]) == null){continue}
     let spec
     let spec_value = specs_definition[key];
     if (key in specs_to_name) {
         spec_value = specs_to_name[key][spec_value]
         spec = '<u>'+key+'</u>'+ ': ' + spec_value + '\n';
      }
      else if (key.match('Section')) {
      spec = '\n<strong>⫸'+spec_value+'⫷</strong>\n'
   } else if (key.match('Subbullet')) {
    spec = spec_value }  else {
    spec = '<u>'+key+'</u>' + ': ' + spec_value + '\n\n';
   }

      all_specs += spec}

      return all_specs;


}

function parseMoreHostInfo(item_all_data) {

      if(item_all_data.length>120&&item_all_data.length<250)
      {return item_all_data}else if(item_all_data.length<121){return "Empty"}

    regex = /(\<More[^$]*dtd\"\>|\<\=|\<\/MoreHostInfo>)/gm
    item_all_data = item_all_data.replace(regex, '');
    
    let jsonString = PlistParser.parse(item_all_data);
    let top_el
    for (var i in jsonString){
    if (jsonString[i]!=null){
        if (jsonString[i]['_SPCommandLineArguments']!=undefined){
            top_el = jsonString
            break
        } else {
        top_el = jsonString[i]
        break}
    }}
    
    for (var i in top_el){
        if (top_el[i]['_dataType']=="SPDisplaysDataType"){
            graphics_subel = top_el[i]['_items']
            break
        }

    }
    let number_of_displays = 0
    let gpus_bullet = ''
    let gpuNames=[]
    for (var i in graphics_subel){
        
        let gpu = graphics_subel[i]
        let gpu_name = (gpu['sppci_model'])
        if (gpuNames.includes(gpu_name)){gpu_name+="_"+i}
        gpuNames.push(gpu_name)
        let displays = []
        for (var i in gpu['spdisplays_ndrvs']){
            number_of_displays++
            let display_subel = gpu['spdisplays_ndrvs']
            display = 
                "\n<u>Display</u>: "+display_subel[i]['_name']+"\
                \n<u>Phys resolution</u>: "+display_subel[i]['_spdisplays_pixels']+"\
                \n<u>Logical resolution</u>: "+display_subel[i]['_spdisplays_resolution']+"\n"
            
            displays += display
            //CreateBullet(item_name, bullet_type, data = '', icon_url)
        } 
        let bulletType
        if (displays==""){
          bulletType = 'blank'
        }else{bulletType = 'Custom'}
        let gpu_bullet = buildNodeBullet(gpu_name, bulletType, displays, icons.gpu,1)
        gpus_bullet += gpu_bullet
        }
        //mention(gpus_bullet)

        if(number_of_displays>0){
        markBullet("MoreHostInfo", 'screens')
        markBullet("MoreHostInfo", "Custom", '<a>'+number_of_displays+'* </a>')
          }
          else {
            markBullet("MoreHostInfo", 'no_screens')
          }
      
        
        return gpus_bullet
        

  }

function parseLoadedDrivers(item_all_data) {

  GM_xmlhttpRequest({
    method: "GET",
    url: "https://gist.githubusercontent.com/NickSmet/53b6d6b947372cbf59f791cff0dcc046/raw/kexts.json",
    synchronous:    true,
    onload: function(xhr) {
      let data = JSON.parse( xhr.responseText)
     bad_kexts = Object.keys(data)
     $('#LoadedDrivers').html(GetDriverList(bad_kexts));
     
     
   }
 });
 

    function GetDriverList(bad_kexts){
    let non_apple_regex = /^((?!com.apple|LoadedDrivers|Linked Against|com.parallels).)+$/gm;//filter out non apple/non parallels kexts+extra lines
    let prl_arr = item_all_data.match(/com.parallels/gm)

    let non_apple_arr = item_all_data.match(non_apple_regex);
    
    if (non_apple_arr == null && prl_arr != null) {
        $('#LoadedDrivers').text("Only apple+prl");
        markBullet('LoadedDrivers','all good')
        return;
    }

    if (non_apple_arr == null && prl_arr == null) {
      $('#LoadedDrivers').html('Only apple, <b style="color:red">no prl(!)</b>');
      markBullet('LoadedDrivers','serious warning')
      return;
  }


    let kext
    let hasBadKexts = false
    let drv_name_regex = / (\w+\.[^ ]*)/gm;

//Don't remember why, but seems to work.
    for (let i = 0; i < non_apple_arr.length; i++) {
        kext = non_apple_arr[i].match(drv_name_regex) || '-----'
        mention({kext});
        non_apple_arr[i] = kext
        if (bad_kexts.indexOf(kext[0].trim()) > -1){
          hasBadKexts = true
        }
    }
    
    if(prl_arr == null){
      non_apple_arr.unshift('<b style="color:red"> no prl(!)</b>');
      markBullet('LoadedDrivers','serious warning')
    }

    let non_apple_str = non_apple_arr.join('\r\n');

    
    
    if (hasBadKexts==false){
      markBullet('LoadedDrivers', 'warning')}
      else{
        markBullet('LoadedDrivers','bad')}
      
    return non_apple_str

      }

}

function parseAllProcesses(item_all_data) {
    let bsdtar_regex = /toolbox_report\.xml\.tar\.gz/
    let bdstar_marker = "<u><b>bdstar</b></u>"
    if (item_all_data.match(bsdtar_regex)){
      markBullet('AllProcesses','bad')
      markBullet('AllProcesses','Custom',bdstar_marker)
    }

    function runningApps(){

      let runningAppsRegex = /\s\/Applications\/((?!Parallels Desktop.app|\/).)*\//gm;/*the \s at the beginning is important, 
      because we're eliminating apps inside of Apps (mainly Toolbox apps). Maybe should just create an exclusion list. 
      */
      let appRegex = /\/Applications\/([^\/]+)\//;
      let runningAppsList = item_all_data.match(runningAppsRegex);
  
      if (!runningAppsList){
        return "Looks like no apps running (better check)."
      } 
  
      let runningApps = []
      let i
      for (i = 0; i < runningAppsList.length; i++) {
        let app = runningAppsList[i].match(appRegex)[1]
         if (runningApps.indexOf(app) == -1){
          runningApps.push(app)
      }
  
  
      }
      runningApps = runningApps.join('\r\n');
    //mention (apps_all);
  
    return runningApps

    }

    function parsePsAux(){
      let processRegex = /^(?<user>[^ ]+) +(?<pid>[\d.]+) +(?<cpu>[\d.]+) +(?<mem>[\d.]+) +(?<vsz>[\d]+) +(?<rss>[\d]+) +(?<tt>[\w\?]+) +(?<stat>[\w]+) +(?<started>[\d\:\.\w]+) +(?<timeRunning>[\d\:\.]+) +\/(?<name>[^\n]*)$/gm
    
      let processesArray = item_all_data.split('\n')

      let processObjArray = []
    
      for (let index = 0; index < processesArray.length; index++) {
        let line = processesArray[index]
        if(!line.match(processRegex)){continue}

        let processProperties = processRegex.exec(line)?.groups
        processObjArray.push({'user':processProperties.user,'CPU(%)':parseFloat(processProperties.cpu),'Mem(%)':parseFloat(processProperties.mem),'name':processProperties.name})
      }

      let top5cpu = objArrayToTable(processObjArray.sort((a, b) =>  b['CPU(%)'] - a['CPU(%)']).slice(0, 5),2)
      let top5mem = objArrayToTable(processObjArray.sort((a, b) =>  b['Mem(%)'] - a['Mem(%)']).slice(0, 5),3)


      return `<div style="overflow-x: scroll; max-width: 70em; max-height: 70em;">
<div style="width: 10000px; ">
<b>TOP CPU USAGE</b>\n${top5cpu}\n\r<b>TOP MEMORY USAGE</b>\n${top5mem}
</div>
</div>`

    }

    let runningAppsSubbullet = buildNodeBullet('Running Apps','Custom',runningApps(),icons.apps)

    let topProcessesSubbullet = buildNodeBullet('Top Processes','Custom',parsePsAux(),icons.hotcpu)
    
    return topProcessesSubbullet+runningAppsSubbullet
}

function parseMountInfo(item_all_data) {

    let lowStorage = false

    let fileSystemRegex = /^(?<id>[\w\/]*) on [^\(]* \((?<filesystem>[^,]+)/

    let mountInfoRegex = /(?<id>(map |\/dev|\/\/|devfs)[\w\/\-@\.]*)  +(?<Size>[\d\.]*(Gi|Ti|Bi|Ki|Mi)) +(?<Used>[\d\.]*(Gi|Ti|Bi|Ki|Mi)) +(?<Avail>[\d\.]*(Gi|Ti|Bi|Ki|Mi) +)(?<Capacity>\d+\%) +(?<iused>\d+) +(?<ifree>\d+) +(?<iused2>\d+\%) +(?<MountedOn>\/.*)(\n|$)/ 
    
    let mountInfoLinesArray = item_all_data.split('\n')

    let hostinfoObjArray = []

    let fs = {}
  
    for (let index = 0; index < mountInfoLinesArray.length; index++) {
      let line = mountInfoLinesArray[index]

      if(line.match(fileSystemRegex)){
        diskProperties = fileSystemRegex.exec(line)?.groups
        fs[diskProperties.id] = diskProperties.filesystem.replace('ntfs','<b><u>ntfs</u></b>')
      }

      if(!line.match(mountInfoRegex)){continue}

      let volumeProperties = mountInfoRegex.exec(line)?.groups
      
      let identifier = volumeProperties.id

      if(identifier.match(/(map|devfs)/)){continue}

      let capacity = parseInt(volumeProperties.Capacity.match(/^(\d+)\%/)[1])

      if(volumeProperties.MountedOn.match(/\/System\/Volumes\//)&&capacity>90){
        volumeProperties.Capacity = `<a style="color:Tomato;"><b>${volumeProperties.Capacity}</b><a>`
      }

      if(volumeProperties.MountedOn.match(/\/System\/Volumes\//)&&capacity>90&&!lowStorage){
        markBullet('MountInfo','Low storage')
        lowStorage=true
      }


      hostinfoObjArray.push({'Identifier':volumeProperties.id, 'Mounted on':volumeProperties.MountedOn,'Size':volumeProperties.Size,'Free':volumeProperties.Avail, 'Capacity':volumeProperties.Capacity, 'File System':fs[volumeProperties.id]})

      

      

//       return `<div style="overflow-x: scroll; max-width: 70em; max-height: 70em;">
// <div style="width: 10000px; ">
// <b>TOP CPU USAGE</b>\n${top5cpu}\n\r<b>TOP MEMORY USAGE</b>\n${top5mem}
// </div>
// </div>`

    }

    
    let drives = objArrayToTable(hostinfoObjArray.sort((a, b) => a.Identifier.localeCompare(b.Identifier)))


    return drives


}

function parseGuestOs(item_all_data) {


  let guestOsVersion = strToXmlToJson(item_all_data).GuestOsInformation.RealOsVersion.replace(/(,$)/g, "") || '--' //removing trailing comma


  $("table.reportList>tbody>tr:nth-child(19)>td:nth-child(2)").append(` (${guestOsVersion})`)

  let ToolsParams = {'Name':'ToolName', 'Version':'ToolVersion','Last updated':'ToolDate','Status':'ToolUpdateStatus'}
  let ToolsAdjust = {'Last updated':'Time'}
  let ToolsFilter = {'ToolUpdateStatus':'UpToDate','ToolVersion':'0.0.0.0'}
  result = parseXMLItem(item_all_data, 'GuestToolInfo', ToolsParams,ToolsAdjust,ToolsFilter);
  //mention(result)
  if (result=='Nothing'){
    markBullet('GuestOs','all good')
    return 'All good!'
  }
  else{
    markBullet('GuestOs','warning')
    return result
  }
}

function parseGuestCommands(item_all_data) {
  
  if(!item_all_data['GuestCommand']){return}

  guestCommandsObj = {}

  for (const [key, value] of Object.entries(item_all_data['GuestCommand'])) {

    let command = value['CommandName']

    let commandValue = value['CommandResult']
    guestCommandsObj[command]=commandValue
  }
  
  if(item_all_data.length<100){return "Nothing"} //instead of matching empty guest commands, just ignoring when it's very small

  let guest_commands_results = []

    function ExtractCommandOutput(command) {
      
        let command_result_regex = reportus ? new RegExp ('\<CommandName\>\<\!\\\[CDATA\\\['+command+'\\\]\\\]\>\<\/CommandName\>\n +\<CommandResult\>\<\!\\\[CDATA\\\[([^$]*?)\\\]\\\]\>\<\/CommandResult\>') : new RegExp ('\<CommandName\>'+command+'<\/CommandName>\n +\<CommandResult\>([^$]*?)\<\/CommandResult\>')
        
        
        if (item_all_data.match(command_result_regex)){
        let command_result = item_all_data.match(command_result_regex)[1]
        
        return command_result}
    }

  let net_use=guestCommandsObj["net use"] || ''
  let ipconfig = guestCommandsObj["ipconfig \/all"] || ''
  let cpu_usage = guestCommandsObj["prl_cpuusage --sort-cpu-desc --time 4000"] || ''



  function parseNetuse(command_result) {

   let net_volumes_regex = /[A-Z]\: +\\\\Mac\\\w+/g
   let net_volumes = command_result.match(net_volumes_regex)
   if(net_volumes!== null){
   net_volumes.unshift("_Network volumes:_")
   net_volumes = net_volumes.join('\r\n');

    return net_volumes}

  }
  function parseIpconfig(command_result) {
    //lots of weird regexes to make it parse regardless of the language.
    let adapters_regex = /\n[ \w][^\n\:]*\:[\r\n]+( +[^\n]*\n){1,}/gi
    let adapters = command_result.match(adapters_regex)

    if (adapters!== null){

    let adapters_output = ["\n"]


    let i
    for (i = 0; i < adapters.length; i++) {
      let adapter = []

    try {
      let adapter_name = (i+1+".")+adapters[i].match(/\n([ \w][^\n\:]*)\:/)[1]
      //mention(adapter_name)
      adapter.push(adapter_name)
    } catch(e) {}

      try {
    let adapter_discr = adapters[i].match(/\n[ \w][^\n\:]*\:[^$]*?:[^$]*?:([^\n]*?)\n/)[1]
    adapter.push(adapter_discr)
    } catch(e) {} // If func1 throws error, try func2

     try {
      let adapter_ip = "IP: "+adapters[i].match(/IPv4[^$]*?: (\d{1,3}(\.\d{1,3}){3})/)[1]
       adapter.push(adapter_ip)
      } catch(e) {} // If func2 throws error, try func3

      adapter = adapter.join('\r\n');
      //mention(adapter)
      adapters_output.push(adapter)

    }
    adapters_output.unshift("_Netw. Adapters:_")
    adapters_output = adapters_output.join('\r\n');
    return adapters_output}

  }
  function parseCpuUsage(command_result) {
    //mention(command_result)

    let cpu_usage_regex = /\d+\.\d\d% +\d+ C:[\\\w \(\)\-\{\} \.\_]+\.exe/g
    let cpu_usage = command_result.match(cpu_usage_regex) //get cpu usage % and process locations
    if (cpu_usage!== null) {
    cpu_usage = cpu_usage.slice(0,5) //get first 3 processes
    cpu_usage.unshift("_Top processes:_")
    cpu_usage = cpu_usage.join('\r\n');

    //mention(cpu_usage)
    return cpu_usage}

  }

  let net_use_results = parseNetuse(net_use)
  let ipconfig_results = parseIpconfig(ipconfig)
  let cpu_usage_results = parseCpuUsage(cpu_usage)

  guest_commands_results.push(ipconfig_results, net_use_results, cpu_usage_results)

  guest_commands_results=guest_commands_results.join('\r\n\n');

  return guest_commands_results
  //mention(net_use_results)

}

function parseVmDirectory(item_all_data) {
  item_all_data = item_all_data.replace(/&/g, "_") //cuz & in xml causes parsing issues
  //counts number of VMs and marks bullet accordingly
  let numberofvms = item_all_data.match(/VmName/g) ? item_all_data.match(/VmName/g).length/2 : 0
  if(numberofvms>0){
    markBullet("VmDirectory", "vms")
    markBullet("VmDirectory", "Custom", '<a>'+numberofvms+'* </a>')
      }

  xmlDoc = $.parseXML( item_all_data ),
  $xml = $( xmlDoc );
  let VMParams = {'Name':'VmName', 'Location':'VmHome','UUID':'Uuid','Registered on':'RegistrationDateTime',}
return parseXMLItem(item_all_data, 'VirtualMachine', VMParams);


function parseCpuUsage(command_result) {
    //mention(command_result)

    let cpu_usage_regex = /\d+\.\d\d% +\d+ C:[\\\w \(\)\-]+\.exe/g
    let cpu_usage = command_result.match(cpu_usage_regex) //get cpu usage % and process locations
    if (cpu_usage!== null) {
    cpu_usage = cpu_usage.slice(0,5) //get first 3 processes
    cpu_usage.unshift("_Top processes:_")
    cpu_usage = cpu_usage.join('\r\n');

    //mention(cpu_usage)
    return cpu_usage}

  }

  let net_use_results = parseNetuse(ExtractCommandOutput(net_use))
  let ipconfig_results = parseIpconfig(ExtractCommandOutput(ipconfig))
  let cpu_usage_results = parseCpuUsage(ExtractCommandOutput(cpu_usage))

  guest_commands_results.push(ipconfig_results, net_use_results, cpu_usage_results)

  guest_commands_results=guest_commands_results.join('\r\n\n');

  return guest_commands_results
  //mention(net_use_results)

}

function parseTimeZone(item_all_data) {
//this function is redundant. still keeping it


    // let timezone_regex = /<TimeZone>(.*)?<\/TimeZone>/;
    // let timezone = item_all_data.match(timezone_regex)[1]
    // let timediff = parseInt(timezone)

    return parseInt(item_all_data.match(bigReportObj.ParallelsProblemReport.TimeZone))


}

function parsetoolsLog(item_all_data) {
  let last1000chars = item_all_data.slice(item_all_data.length -1000)
  if(last1000chars.match(/successfully/)){
  markBullet('tools.log','all good')}
  else if(last1000chars.match(/FatalError/)) {markBullet('tools.log','bad')}
  
  else {markBullet('tools.log','warning')}
}

function parseLicenseData(item_all_data){
  let licenseData = JSON.parse(item_all_data)
  let expirationDate = Date.parse(licenseData['license']['main_period_ends_at'])
  if(expirationDate-Date.now()>5*365*24*3600*1000){markBullet('LicenseData','pirated')}
  return "Expires: "+licenseData['license']['main_period_ends_at']

}

function parseAppConfig(item_all_data){

let externalVmFolder = false

let appConfigContents = ''

let AppConfigJson = strToXmlToJson(item_all_data).ParallelsPreferences

if(!AppConfigJson){return "It's <b>UserDefinedOnDisconnectedServer</b>"}

let verboseLoggingEnabled = AppConfigJson.ServerSettings.CommonPreferences.Debug.VerboseLogEnabled

if (verboseLoggingEnabled==1){markBullet('AppConfig','verbose logging')}
appConfigContents += bulletSubItem('Verbose logging', verboseLoggingEnabled)

//there could be many users, and all kinds of situations, so it's easier and more reliable to just locate default VM folders using regex
let defaultVmFolderRegex = /<UserDefaultVmFolder>([^<]+)<\/UserDefaultVmFolder>/gm
let defaultVmFolder
while ((defaultVmFolder = defaultVmFolderRegex.exec(item_all_data)) !== null) {
  appConfigContents += bulletSubItem('Default VM Folder', defaultVmFolder[1])
  if(defaultVmFolder[1].match(/^\/Volumes/)&&!externalVmFolder){markBullet('AppConfig', 'External Default VM folder')}//to avoid marking it a second time in case there are multiple such volumes
}







//appConfigContents += bulletSubItem('VM Home', AppConfigJson.ServerSettings.UsersPreferences.ParallelsUser.UserWorkspace.UserHomeFolder)

return appConfigContents
}

function parseInstalledSoftware(item_all_data){
markBullet('InstalledSoftware','installedApps')
item_all_data = item_all_data.replaceAll(/\<\/?InstalledSoftware\>/g,'')

let uniqueAppList
let appRegex = /\/Applications\/(?<appName>[^.]*\.app)[^:]*\: (?<version>[\d. ()]*)/g

let formattedAppList = item_all_data.replaceAll(appRegex,'$<appName>: $<version>').split("\n");

uniqueAppList = Array.from(new Set(formattedAppList)).sort().join('\r\n')

return uniqueAppList
}

function parseLaunchdInfo(item_all_data){
  markBullet('LaunchdInfo','service')
  return parseLsLr(item_all_data)
  }

function parseAutoStatisticInfo(item_all_data){
  mention(item_all_data);
  markBullet('AutoStatisticInfo','install')

  let installationHistory = 'PD Installations:\n'

  $(item_all_data).find('PDInstallationHistory').each(function(){
    installationHistory+=`<u>${$(this).find("installedversionname").text()}</u>  ${$(this).find("installedversiondate").text()}\n`
  })

  return installationHistory

}

//Extra functions

//
/** @description  This one appemds Mac's specs next to the Model (gets them at everymac.com)
 */

function computerModel(macDatabase){

  // let computer_model = $('td:contains("Computer Model")');
  // if (computer_model == null){return}

  let macElement = $('td:contains("Computer Model")').next();
  let macModel = bigReportObj.ParallelsProblemReport.ComputerModel

  if (!macModel.match(/MacBook|iMac|Macmini|MacPro/)){return}

  // let cpuElementPath = reportus ? $("body > table:nth-child(7) > tbody > tr:nth-child(11) > td:nth-child(2)") : $('#form1 > table.reportList > tbody > tr:nth-child(14) > td:nth-child(2)')
  
  let mac_cpu = strToXmlToJson(bigReportObj.ParallelsProblemReport.HostInfo).ParallelsHostInfo.Cpu.Model

  mac_cpu = mac_cpu.toUpperCase().match(/ ([^(CPU)]*) CPU/) ? mac_cpu.toUpperCase().match(/ ([^(CPU)]*) CPU/)[1] : mac_cpu
  
  mention(mac_cpu)
  
  let mac_url = 'http://everymac.com/ultimate-mac-lookup/?search_keywords='+macModel

  let mac_model_linked = $('<td id="macmodel"> <a href='+mac_url+'>'+macModel+'</a></td>')
  $('td:contains("Computer Model")').next().replaceWith(mac_model_linked)

  let macID = macModel.concat(mac_cpu)

  mention(macID);

  mention(macDatabase);
  
  let macSpecs = macDatabase[macID]  

  let formattedSpecs = ['</br>',
  "Model: ", macSpecs.model,'</br>',
  "Storage: ", macSpecs.storage, '</br>',
  "Ram:",macSpecs.ram,'</br>', 
  "Vram:",macSpecs.vram,'</br>',
  "Year: ", macSpecs.prodStart, " - ", macSpecs.prodEnd]

  if (macSpecs){
    $('td:contains("Computer Model")').next().append(formattedSpecs);
    //macElement.append(macSpecs)

  }else
  {
    //no longer works due to captcha, so DB is in google sheets now and I'm maintaining it

    // $("#macmodel").append($('<button type="button"  style="border-color:black" class="btn btn-outline-secondary btn-sm" id=loadMacSpecs>Load specs</button>'))
    // $('#loadMacSpecs').click(function() {
    // loadMacSpecs(mac_url, mac_cpu, macElement, macID)
    // this.remove()
  // });
}
 
}

// function googleCsv2JsonMacModels(csv){
//   //that is a very dumb function, but it works. Won't touch it for now
// mention();

// csv = csv.replace(/\"\,\"/gm,";").replace(/(\"\n\")/gm,"$1delimiter").replace(/(\]\n|\}\n)/g,"$1delimiter")


// let headers=csv.split("\n")[0].split(";");


// mention({headers});
// csv = csv.substring(csv.indexOf("\n") + 1)

// let lines=csv.split('delimiter');

// let result = [];

// for(var i=1;i<lines.length-1;i++){

//    let obj = {};
//    let currentline=lines[i].split(";");

//    //mention(currentline);

//    result[currentline[1].replace(/\"\n\"/gm,'')]=currentline[0].replace(/(\[[^\<]*|\n +]$)/gm,'').replace(/\"/gm,'').split(/\,\n +/)
   

// }
// mention(result);
// //return result; //JavaScript object
// return result; //JSON
// }

function googleCsv2JsonMacModels(csv){
  //that is a very dumb function, but it works. 


csv = csv.replace(/\"\,\"/gm,";").replace(/\"/gm,"").replace(/(\]\n|\}\n)/g,"$1delimiter")


let headers=csv.split("\n")[0].split(";");


csv = csv.substring(csv.indexOf("\n") + 1)


let lines=csv.split('\n');

let result = [];


for(var i=0;i<lines.length-1;i++){

   let macObj = {};
   

   let currentline=lines[i].split(";");
   macID = currentline[0]
   //mention(currentline);
   let specs = {};
   for(var spec=0;spec<headers.length;spec++){
    specs[headers[spec]] = currentline[spec]
   }
   result[macID]=specs

   //result.push(macObj);

}

//return result; //JavaScript object
return result; //JSON
}

/** @description  Appends customer time im addition to server's local
 */
function fixTime(timediff, time = '') {
    let gmt_string = $( ".reportList:first tbody:first tr:nth-child(3) script" ).text()
    if (reportus) gmt_string = $("b:contains('Creation Time')").parent().next().text()
    
    let gmt_regex = reportus ? /(.*)/ : /\(\"([\d\-T\:]*)\"\)/
    let gmt_substr = gmt_string.match(gmt_regex)[1];
  ///if time is not defined 
    let gmt_time = Date.parse(gmt_substr);
    if (time!=''){ 
      gmt_time = parseInt(time)
    }
    //mention(gmt_time)
    let time_seconds = gmt_time/1000;
    let correct_time = new Date(0);
   //mention(correct_time)
    //mention(timediff)
    correct_time.setUTCSeconds(time_seconds+timediff)
    return correct_time.toString().substring(4,24)
}

//Adjusts time, converts values etc. Where for example we get bytes but want to render gb/tb
function adjustSpec(spec_value, adjustment){
spec_value=spec_value||"---"
  switch (adjustment) { 
      case 'time': 
      spec_value = fixTime(timediff, spec_value)
      break;
      case 'bytes': 
      spec_value = humanFileSize(spec_value, true);
      break;
      case 'hddtype': 
      let hddtypes = {0: 'IDE', 1: 'SCSI', 2: 'SATA', 3: 'NVMe'}
      spec_value = hddtypes[spec_value]
      break;
      case 'mbytes':
      spec_value = humanFileSize(spec_value*1024*1024, false)
      break;
      case 'appleMbytes':
      spec_value = humanFileSize(spec_value*1024*1024, true)//because for Apple kilo is actually 1000 :)
      break; 
      case 'networkAdapter':
      let networkAdapters = {0: 'Legacy',1 :'RealTek RTL8029AS',2: 'Intel(R) PRO/1000MT',3:'Virtio', 4:'Intel(R) Gigabit CT (82574l)'}
      spec_value = networkAdapters[spec_value]
      break;
      case 'networkMode':
      let networkTypes = {0: 'Host-Only', 1: 'Shared',2 :'Bridged'}
      spec_value = networkTypes[spec_value]
      break;
      case 'networkMac':
      spec_value = spec_value.replace(/(\w\w)(\w\w)(\w\w)(\w\w)(\w\w)(\w\w)/,'$1:$2:$3:$4:$5:$6')
      // // break;
}
return spec_value}

//https://stackoverflow.com/users/65387/mpen
function humanFileSize(bytes, si) {
  let thresh = si ? 1000 : 1024;
  if(Math.abs(bytes) < thresh) {
      return bytes + ' B';
  }
  let units = si
      ? ['kB','MB','GB','TB','PB','EB','ZB','YB']
      : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];
  let u = -1;
  do {
      bytes /= thresh;
      ++u;
  } while(Math.abs(bytes) >= thresh && u < units.length - 1);
  return bytes.toFixed(1)+' '+units[u];
}

/** @description  Converst all links to attached screenshots to clickable thumbnails
 */
function getScreenshots(){
  function CreateScreenshot(id, url){
    $.get(url, function (data) {
      let img = ( $('pre > img', data).eq(0).attr('src'))
      AddScreenshotHtml(id, img)
  })
}

  function AddScreenshotHtml(id, image){
  let mypiclink =     '<a href="#img'+id+'">\
    <img src='+image+' class="thumbnail">\
  </a>'
  
  let mypic =   '<a href="#_" class="lightbox" id="img'+id+'">\
    <img src='+image+'>\
  </a>'
  $(mypiclink).appendTo('.container')
  
  $(mypic).appendTo('body')
    
}

if(reportus){$('h4:contains("Screenshots")').next().clone().appendTo('.container') 
return}

let screens_el = $('span:contains("Screenshots")').next()
screens_el.clone().appendTo('.container') 
let screenID = 1
screens_el.find("a").each(function() {
  CreateScreenshot(screenID, this.href)
  screenID++

  })
}

/** @description  Appends Bug IDs to found signatures (if a signature has a bug)
 */
function signatureBugs () {
  function setBugId (signatureObject, bugJiraId) {
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
 * @param {string} color What icon to mark the aforementioned bullet. For now it's 'all good', 'warning','bad'
 * if icon is set to 'custom, then the appended element is defined by
 * @param {string} html if icon is 'custom', this defines element to be appended as a mark
 */
function markBullet(bullet_name, icon,html){  
  let icon_name
  let icon_url
  let img


//if icon is url
if(icon.match(/https\:/)){
    icon_name = Object.keys(icons).find(key => icons[key] === icon);
    icon_url = icon
    img = '<img src="'+icon_url+'" title = "'+icon_name+'" style= "display: linline; height: 1.5em";> '
}
//if icon is name from
else if (icon.match(/^no_/))
{
  icon_name = icon
  icon_url = icons[icon.match(/^no_(.*)/)[1]]
  img = '<img src="'+icon_url+'" title = "'+icon_name+'" style= "display: linline; height: 1.5em; filter: saturate(0%);"> '
}
else
{
  icon_name = icon
  icon_url = icons[icon]
  img = '<img src="'+icons[icon]+'" title = "'+icon_name+'" style= "display: linline; height: 1.5em";> '
}

  
  
  if (icon=='Custom'){
    img = html
  }
  if(bullet_name=='this'){return img}
  else
  {
    $(`button#btn_${bullet_name}`).next().filter(function(){
      return $(this).text() === bullet_name ? true : false;
  }).prepend($(img));
    
  //   $('.container > div > a:contains("'+bullet_name+'")').filter(function(){
  //     return $(this).text() === bullet_name ? true : false;
  // }).prepend($(img));
    
    
    //('.container > div > a:contains("'+bullet_name+'")').prepend($(img))
  }}


  function setupSearch(){
    $("#doc_top_bar").prepend($(`
    <div id=nodeSearch style="margin-left:-24em;margin-top:-10%">
    
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
 `))

 $("#searchField").attr('autocomplete', 'off');

 $("#previewBtns").hide()

 $("#expandDown").on('click', function(e) {
  changePreviewLength(10,0)
});

$("#expandUp").on('click', function(e) {
  changePreviewLength(0,10)
});

$("#resetPreview").on('click', function(e) {
  changePreviewLength(-1000000000000000,-10000000000)
});

$("#clearSearch").on('click', function(e) {
  changePreviewLength(-1000000,-100000)
  $("#searchField").val('')
  updateResults()
});

$("#next").on('click', function(e) {
  updateResults(this.id)
});

$("#previous").on('click', function(e) {
  updateResults(this.id)
});

$("#nodeselector").change(function(){
  doSearch()
})

$("#searchField").on('keyup', function (e) {
  if (e.key === 'Enter' || e.keyCode === 13) {
    updateResults('next')
  }else{doSearch()}
});



//  $("#searchField").on('input', function(e) {
   
//     doSearch()
//  });
 }

 function focusOnSearch(nodeName){
  $("#nodeselector").val(nodeName)
  $("#searchField").focus()
  doSearch()
 }

 function AddNodeToSearch(nodeAllData, nodeName){
   let excludeFromSearch = ['TimeZone']
   if(excludeFromSearch.includes(nodeName)){return}
   if(nodeContents[nodeName]){return}
    $("#nodeselector").append($('<option value="'+nodeName+'">'+nodeName+'</option>'))

  
  if(typeof nodeAllData == "object"){nodeAllData=JSON.stringify(nodeAllData,null,'\t').replace('\\\r\\\n','\n')};
  let nodelines=nodeAllData.split("\n")
 
  
  //if((typeof nodeAllData)!="string"){return}
  let node = {'lines':nodelines,
    'curr_index':0,
    'curr_indexes':[]
  }
  nodeContents[nodeName]=node
  
  let searchIcon = `<img src="${icons.docSearch}" 
  id=`+nodeName+`_searchFocus
  title="search" 
  style="display: linline; height: 1.5em; margin-left:-1.5em; cursor: pointer; opacity: 0.7;">`
  
let nodeID = nodeName.replaceAll('\.','\\\.')

  $("#btn_"+nodeID).parent().prepend($(searchIcon))

  $("#"+nodeID+"_searchFocus").click(function(){
    mention(nodeName)
    focusOnSearch(nodeName)
  })

  
}

 function doSearch(){

  thequery=$("#searchField").val()

  // if (thequery ==''){
  //   $("#searchResults").html('')
  //   return
  // }

  nodeName=$("#nodeselector").val()

  //if (thequery.length<3){return}
  let lines = nodeContents[nodeName]['lines']
  nodeContents[nodeName]['curr_index']=0
  nodeContents[nodeName]['curr_indexes']=[]
  
  for (let i = 0; i < lines.length; i++)
  {
  if(lines[i].match(new RegExp(thequery, 'i'))){nodeContents[nodeName]['curr_indexes'].push(i)}
  }
  updateResults()
  }

  function changePreviewLength(down, up){
    let currUp = GM_getValue("previewUp", 2)
    let currDown = GM_getValue("previewDown", 6)
    let newUp = currUp+up
    let newDown = currDown+down
    if(newDown<6){newDown=6}
    if(newUp<2){newUp=2}
    GM_setValue("previewUp", newUp)
    GM_setValue("previewDown", newDown)
    updateResults()
  }

  function updateResults(direction){
    let previewDown = GM_getValue("previewDown",6)
    let previewUp = GM_getValue("previewUp",2)

    
    if (direction=='next'){
      if(nodeContents[nodeName]['curr_index']==nodeContents[nodeName]['curr_indexes'].length-1){nodeContents[nodeName]['curr_index']=0}else{nodeContents[nodeName]['curr_index']++}
    }else if (direction=='previous'){
      if(nodeContents[nodeName]['curr_index']==0){nodeContents[nodeName]['curr_index']=nodeContents[nodeName]['curr_indexes'].length-1}else{nodeContents[nodeName]['curr_index']--}
    }


    thequery=$("#searchField").val()
   
    
    if (thequery ==''){
      $("#previewBtns").hide()
      $("#searchResults").html('')
      $("#resultCounter").html('')
      return
    }
    $("#previewBtns").show()

    nodeName=$("#nodeselector").val()
    
    let lines = nodeContents[nodeName]['lines']
    let curr_index = nodeContents[nodeName]['curr_index']
    let curr_indexes = nodeContents[nodeName]['curr_indexes']

    

    let result_line = curr_indexes[curr_index]

    let searchCounterCurrent = parseInt([curr_index])+1
    let searchCounterTotal = curr_indexes.length

    $("#resultCounter").html(searchCounterCurrent+"/"+searchCounterTotal)

    if (searchCounterTotal==0){
      $("#searchResults").html('<a style="color:red; font-width:600">Nothing.</a>')
      $("#resultCounter").html('-/-')
    return}

    let match = lines[result_line].match(new RegExp(thequery, 'i'))[0];
    
    let startLine
    let endLine
  
    if (result_line-previewUp<0){startLine=result_line}else{startLine=result_line-previewUp}
    if (result_line+previewDown>lines.length){endLine=lines.length}else{endLine=result_line+previewDown}


//I will clean this up, honestly

    
    let resultPreview = [].concat(lines.slice(startLine,result_line),lines[result_line].replaceAll(match, '<u>'+match+"</u>"),lines.slice(result_line+1,endLine)).join("\r\n").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('&lt;u&gt;'+match+'&lt;/u&gt;','<u style="color:red; font-weigh:600">'+match+'</u>').replaceAll(match,"<mark>"+match+"</mark>")
    
    //$("#header").text(nodeName)
    $("#searchResults").html(resultPreview)

    }
     


//all report items for which bullets will be constructed in the bullet container
const pinned_items = ["CurrentVm", "LoadedDrivers", 'AllProcesses','GuestCommands','GuestOs',"MountInfo", 'HostInfo', 'ClientProxyInfo', 'AdvancedVmInfo', 'MoreHostInfo', 'VmDirectory', 'NetConfig','AppConfig','LicenseData','InstalledSoftware', 'LaunchdInfo','AutoStatisticInfo'];
//report log links that will be cloned to the bullet container
const pinned_logs = ["parallels-system.log","system.log","system.0.gz.log","vm.log", "vm.1.gz.log", "dmesg.log", 'install.log','tools.log', 'panic.log', ];
//pinned_items that will have a collapsible with parsed info
const pinned_collapsibles = ["CurrentVm", "LoadedDrivers", 'AllProcesses','GuestCommands','GuestOs','MountInfo', 'HostInfo', 'AdvancedVmInfo', 'MoreHostInfo', 'VmDirectory', 'NetConfig','AppConfig','LicenseData','InstalledSoftware','AutoStatisticInfo', 'LaunchdInfo','panic.log'];

const process_immediately = ['CurrentVm','LoadedDrivers','tools.log','GuestOs','GuestCommands','AllProcesses','AdvancedVmInfo','MoreHostInfo','VmDirectory','ClientProxyInfo','LicenseData', 'system.log', 'MountInfo', 'HostInfo', 'InstalledSoftware', 'LaunchdInfo','AutoStatisticInfo','dmesg.log','parallels-system.log',"vm.log",'NetConfig', 'AppConfig','install.log','panic.log',"system.0.gz.log", "vm.1.gz.log"]

let nodeContents = {}//it't almost raw data. Mostly for the search function.

let theBigReportObject = {//this is the Grand Refactoring bit
  'customer':{},//email, timezone, LicenseData
  'report':{},// creation time, timezone
  'PD':{
    'NetConfig':{}
  },//NetConfig, AppConfig...
  'vm':{},//CurrentVm
  'guestos':{},//GuestCommands,
  'host':{},//HostInfo, MountInfo, MoreHostInfo, 
  'hostos':{},//AllProcesses, ClientProxyInfo, LoadedDrivers, 
  'logs':{},//not sure if populate with events or just what's in 'nodeContents'. Anyway, I think it should be separate
}


//Filling bullet content with appropriate data.
let tries={"tries":3}//When "get" request fails, BulletData() reruns itself (see $.ajaxSetup). This let stores number of tries left for each item.
// If item is not present in this dict, it's added with counter set to 3 and then goes down with each run of the function. 

//needed for correting times for time zone
let timediff

let current_url = window.location.href;
let report_id = current_url.match(/\d{7,9}/);
let index

let getMacSpecsDatabase = new Promise (function(resolve,reject){
  let macDataBaseUrl = "https://docs.google.com/spreadsheets/d/1lmcn0aRxolP5eXfsuaekRFcMl7dAFjxTe9ItQEUOarM/gviz/tq?tqx=out:csv&sheet=Database"
  $.get(macDataBaseUrl, function ldd(data) {
    resolve(data)
    })
})

function doReportOverview() {

  getMacSpecsDatabase.then(function(data){
    let macDatabase = googleCsv2JsonMacModels(data)
    computerModel(macDatabase);
  })
  
  // changed callback to a promise -- leaving this just in case
  // let macDataBaseUrl = "https://docs.google.com/spreadsheets/d/1lmcn0aRxolP5eXfsuaekRFcMl7dAFjxTe9ItQEUOarM/gviz/tq?tqx=out:csv&sheet=Database"
  // $.get(macDataBaseUrl, function ldd(data) {

  //   mention(data);
  //   let macDatabase = googleCsv2JsonMacModels(data)
   
  //   computerModel(macDatabase);
    
  //   })
  
  signatureBugs();
  BulletData('TimeZone','time');//should fix it later to get data from the bigJson
 
      //$("#form1").replaceWith("<div>" + $("#form1").html() + "</div>"); //it's a form that messes up my forms (I don't understand why it's needed. Nothing breaks when replacing it with div)
    
      $("#form1").replaceWith(function(){
        return $("<div />").append($(this).contents());
    });
    let timeout = 80
    for (let item in process_immediately){
      setTimeout(BulletData(process_immediately[item]),timeout)
      timeout=+80
            
        
      }
      $(".btn").click(function(){
      $(this).text(function(i,old){
        return old=='➤' ?  '▼' : '➤';//took it here: https://stackoverflow.com/questions/16224636/twitter-bootstrap-collapse-change-display-of-toggle-button
    })})
  
    //used to be necessary when some items were loaded manually
      // $(".btn").one("click", (function() {
      //     let item_id = this.id.replace("btn_", "");
      //     //mention(item_id)
      //     if(process_immediately.indexOf(item_id) == -1) {BulletData(item_id)} 
      // }));
  }

window.addEventListener("load", function(event) {
  let curr_url = window.location.href

  if(!curr_url.match(/Report.aspx\?ReportId=|webapp\/reports/)){return}

  let id = curr_url.match(/(\d{9})/)[1]

  if ($('Title').text().match('Waiting')){
   $("#form1 > div:nth-child(4) > big > big > b").append('</br></br><div><a href=https://reportus.prls.net/webapp/reports/'+id+'>OPEN AT REPORTUS</a></div>')

    return
   }

  if (curr_url.match(/Report.aspx\?ReportId=/)){
   reportus = false
  }else if (curr_url.match(/webapp\/reports/)){
  reportus = true
  }
  params = reportus ? reportusPrms : reportsPrms

  let xmlUrl =  reportus ? 'https://reportus.prls.net/webapp/reports/'+id+'/report_xml/download?filepath=Report.xml' : 'https://reports.prls.net/Reports/Xml.aspx?ReportId='+id

  buildMenu();
  getScreenshots();
  setupSearch()

  getXmlReport(xmlUrl).then(function(xmlData){
    bigReportObj=xmlData
    doReportOverview()
  })
  
});

//note to self -- start hosting those somewhere (github even?)
const icons = {
  'Low storage':'https://uxwing.com/wp-content/themes/uxwing/download/16-business-and-finance/90-percent.svg',
  'DisplayLink device!':'https://image.flaticon.com/icons/png/128/3273/3273973.png',
  'onedrive':'https://image.flaticon.com/icons/png/128/2335/2335410.png',
  'network folder':'https://image.flaticon.com/icons/png/128/1930/1930805.png',
  'usb':'https://image.flaticon.com/icons/svg/1689/1689028.svg',
  'keyboard':'https://image.flaticon.com/icons/png/128/2293/2293934.png',
  'mouse':'https://image.flaticon.com/icons/png/128/2817/2817912.png',
  'printers':'https://image.flaticon.com/icons/svg/2489/2489670.svg',
  'all good':'https://image.flaticon.com/icons/png/128/1828/1828520.png',
  'warning' : 'https://image.flaticon.com/icons/svg/497/497738.svg',
  'serious warning':'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/OOjs_UI_icon_alert-warning.svg/1200px-OOjs_UI_icon_alert-warning.svg.png',
  'bad': 'https://image.flaticon.com/icons/svg/1672/1672451.svg',
  'headless':'https://image.flaticon.com/icons/png/128/1089/1089503.png',
  'not headless':'https://cdn0.iconfinder.com/data/icons/people-and-lifestyle-1/64/people-male-man-head-128.png',
'isolated':'https://cdn4.iconfinder.com/data/icons/real-estate-1/512/prison-128.png',
'flags':'https://cdn3.iconfinder.com/data/icons/seo-and-digital-marketing-5-3/48/211-128.png',
'nosnapshots':'https://image.flaticon.com/icons/svg/2803/2803253.svg',
'snapshots':'https://image.flaticon.com/icons/svg/502/502559.svg',
'screens':'https://user-images.githubusercontent.com/10322311/96313515-5cf7ca00-1016-11eb-87d7-4eb1784e6eab.png',
'vms':'https://insmac.org/uploads/posts/2017-08/1503641514_parallels.png',
'vpn':'https://image.flaticon.com/icons/png/128/1451/1451546.png',
'external drive':"https://cdn4.iconfinder.com/data/icons/computer-58/64/external-hard-disk-drive-storage-64.png",
'copied vm':'https://cdn2.iconfinder.com/data/icons/small-color-v5/512/clone_copy_document_duplicate_files-128.png',
'AppleHV':'https://cdn2.iconfinder.com/data/icons/metro-uinvert-dock/256/OS_Apple.png',
'Nested':'https://cdn2.iconfinder.com/data/icons/russia-8/64/matryoshka-doll-russian-mother-russia-128.png',
'splitted':'https://cdn4.iconfinder.com/data/icons/web-and-mobile-ui/24/UI-03-32.png',
'trim':'https://i.ibb.co/XpVhPZ9/unnamed.png',
'webcam':'https://image.flaticon.com/icons/png/128/179/179879.png',
'gpu':"https://image.flaticon.com/icons/svg/2302/2302939.svg",
'ACL':'https://findicons.com/files/icons/2796/metro_uinvert_dock/128/security_denied.png',
'fullscreen':'https://cdn3.iconfinder.com/data/icons/mos-basic-user-interface-pack/24/aspect_rasio-128.png',
'noTimeSync':'https://cdn2.iconfinder.com/data/icons/watch-4/64/death_clock-broken-breakdown-fail-128.png',
'hdds':"https://image.flaticon.com/icons/svg/1689/1689016.svg",
'cd':'https://image.flaticon.com/icons/png/128/2606/2606574.png',
'networkAdapter':'https://image.flaticon.com/icons/svg/969/969356.svg',
'TPM':'https://cdn3.iconfinder.com/data/icons/imageres-dll/512/imageres-dll_TPM-ship-128.png',
'network conditioner fullspeed':'https://icon-library.com/images/data-funnel-icon/data-funnel-icon-5.jpg',
'network conditioner limited':'https://user-images.githubusercontent.com/10322311/118004041-c728e100-b351-11eb-9018-516a78e18a28.png',
'plain vHDD':'https://cdn0.iconfinder.com/data/icons/computer-93/64/7._hard_disk_hdd_data_information_computer_technology-128.png',
'external vHDD':'https://1001freedownloads.s3.amazonaws.com/icon/thumb/371132/External-Drive-Red-icon.png',
'linked clone':'https://cdn4.iconfinder.com/data/icons/materia-flat-design-vol-1/24/034_038_layers_front_copy_clone-128.png',
'smart guard': 'https://www.seekpng.com/png/full/595-5952790_download-svg-download-png-shield-icon-png.png',
'Boot Camp':'https://user-images.githubusercontent.com/10322311/96314275-97616700-1016-11eb-9990-8b2e92d49052.png',
'root or unknown owner':'https://user-images.githubusercontent.com/10322311/100492918-868e3000-3142-11eb-9ee6-44826cd637c7.png',
'resource quota':'https://cdn2.iconfinder.com/data/icons/flat-pack-1/64/Gauge-128.png',
'pirated':'https://cdn1.iconfinder.com/data/icons/social-messaging-ui-color-shapes-2/128/death2-circle-red-64.png',
'kext':'https://cdn2.iconfinder.com/data/icons/gaming-color-icons/104/17-gaming-puzzle-piece-lego-128.png',
'kextless':'https://cdn3.iconfinder.com/data/icons/internet-2-10/48/54-128.png',
'verbose logging':'https://cdn3.iconfinder.com/data/icons/information-notification-black/3/17-128.png',
'pvm':'https://fileinfo.com/img/icons/files/128/pvm-3807.png',
'shared':'https://cdn2.iconfinder.com/data/icons/handcraft-1px/16/lan-connection-128.png',
'bridged':'https://cdn3.iconfinder.com/data/icons/flat-design-hardware-network-set-2/24/ethernet-plug-64.png',
'install':'https://static.thenounproject.com/png/2756717-200.png',
'service':'https://i.pinimg.com/originals/71/d1/77/71d177d628bca6aff2813176cba0c18f.png',
'apps':'https://cdn2.iconfinder.com/data/icons/engineering-butterscotch-vol-1/512/Applications-128.png',
'installedApps':'https://icons.iconarchive.com/icons/mcdo-design/smooth-leopard/256/Applications-Folder-Blue-icon.png',
'hotcpu':'https://cdn4.iconfinder.com/data/icons/it-components-2/24/microchip_processor_chip_cpu_hot_burn-128.png',
'docSearch':'https://image.flaticon.com/icons/png/128/3126/3126554.png',
'External Default VM folder':'https://image.flaticon.com/icons/png/128/3637/3637372.png',
'not PvmDefault':'https://image.flaticon.com/icons/png/128/983/983874.png'

}
