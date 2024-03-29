function editItemStyle(item, styleDict){
    var style = document.createElement('style');
    var item_style = '.vis-item.'+item+' '+JSON.stringify(styleDict).split('",').join('";').split('"').join("")+'\n'
    style.innerHTML += item_style
    document.head.appendChild(style);
  }
  
  function buildRange(start, stop, step) {
    if (typeof stop == 'undefined') {
        // one param defined
        stop = start;
        start = 0;
    }
  
    if (typeof step == 'undefined') {
        step = 1;
    }
  
    if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) {
        return [];
    }
  
    var result = [];
    for (var i = start; step > 0 ? i < stop : i > stop; i += step) {
        result.push(i);
    }
  
    return result;
  };
  
  function buildTimeline(daysBack){
    options.zoomMax = daysBack*24*60*60*1000
    timeline.setOptions(options);
    timeline.setGroups(groups);
    timeline.setItems(items);
    timeline.on('click', (properties) => {
    var moment = items.get(properties.item).line_content
    window.find(moment, false, false, true, false, false, false)
     //$("window").scrollTop($("*:contains('"+items.get(properties.item)+"'):eq(1)").offset().top);
    });
  
  

    // Create a DataSet (allows two way data-binding)
    
  }
  
  function setUpTimeline()
  {
    for (item in all_items){
      editItemStyle(item,all_items[item]['style'])
    }



var head = $("body");
head.prepend($('<div id="visualization"></div>'))

$("#visualization").css({
  'box-sizing': 'border-box',
  'width': '95%',
  'min-height': '500px',
  //'position': '-webkit-sticky', /* Safari */
  //'position': 'sticky',
  'top': '0'
});
var container = document.getElementById('visualization');
timeline = new vis.Timeline(container);

head.prepend($(' <button id="restore" >Restore Hidden</button>'))

$("#restore").click(function(){
  groups.forEach(function (group) {
    groups.update({ id: group.id, visible: true });
  });
});

  for (let key in curr_groups) {
    var curr_id = global_id
    global_id++
    var nested = buildRange(global_id,global_id+Object.keys(curr_groups[key]).length)
  
    groups.add([{id:curr_id, content:key, nestedGroups:nested, showNested:true}])
    groupIds[key]=curr_id
  
    for (var skey in curr_groups[key]) {
      var scurr_id = global_id
      global_id++
      groups.add([{id:scurr_id, content:skey}])
      groupIds[skey]=scurr_id
      }
    }}
    
    function getLineDate(line) {
  
    let line_date_string = line.match(line_message_regex)[1]
    //console.log(line_date_str)
    let currentYear = new Date().getFullYear();
    let datetime_string = currentYear+"-" + line_date_string /*there is not year in log, so setting to
    current year by default and process_log_date adjusts it to previous year where needed */
    let line_date = Date.parse(datetime_string)
      
      let lineDate = new Date(0); // The 0 there is the key, which sets the date to the epoch
      lineDate.setUTCSeconds(line_date / 1000);

      if (lineDate > new Date(new Date()+24*3600*1000)) { lineDate.setFullYear(lineDate.getFullYear() - 1); }
 
      return lineDate
  }
  
  function processLines(data, days) {
      var last_line_date = "undefined"
      var period = 60 * 60 * 1000 * 24 * days; /* in ms */
  
      var lines = data.split("\n").reverse()
  
  
      for (i = 0; i < lines.length; i++) {
          prev_line_content = lines[i+1]
          curr_line_content = lines[i]
          next_line_content = lines[i-1]

          
          try{var line_message = curr_line_content.match(line_message_regex)[2]
} //if line doesn't start with datetime, we skip it 
          catch{continue}
          //console.log(line_content)
          var line_date = getLineDate(curr_line_content)
          var datetime_string = line_date.toTimeString()
          if (line_date=="Invalid Date"){continue} //we should be safe by having done regex check earlier, but just in case.
          if (last_line_date == "undefined") { 

              createItem('Report_collected','vm.log','End of report', line_date, curr_line_content)

              last_line_date = new Date(line_date.getTime())
              options.end = last_line_date.setMinutes(last_line_date.getMinutes() + 3 )

              options.start = last_line_date - period/240
              
      }
          
          if (line_date < last_line_date - period) { 
            console.log("done at line "+i+" "+line_message)
            break; 
          } //stops when date is longer than 10 days before report's collection date
  
  
          for (var item in all_items){  
            if (line_message.match(all_items[item].regex)){


              var item_time = line_date
              var item_class = item
              var item_group = all_items[item].group



              var item_name = all_items[item].name.match(/\$\d/) ? curr_line_content.replace(all_items[item].regex,all_items[item].name) : all_items[item].name
              var item_rule = all_items[item].rule

              let item_label = all_items[item].label ? all_items[item].label : datetime_string


             
  
  
              if (!item_rule){
                createItem(item_class,item_group,item_name,item_time,curr_line_content,0,item_label)

              }
                else {
                  rule_result = checkRule(item, line_message, prev_line_content, next_line_content,item_time, item.style, item_label) 

                  if (!rule_result){continue}
                  else {createItem(item_class,item_group,rule_result.value,item_time,curr_line_content,rule_result.style,item_label)}
                }
  
                
                
                
          }}
  
  }
  
  }
  
  function createItem(item, group, content, datetime, line_content, style, label){
    if(!label){label = datetime}


    items.add({
      id: global_id,
      group: groupIds[group],
      content: content,
      start: datetime,
      title: label,
      style: style,
      className: item,
      line_content:line_content
    });
    global_id++
  }
  
  // function to make all groups visible again
  function showAllGroups() {
  
    groups.update({ id: group.id, visible: true });
    groups.forEach(function (group) {
      groups.update({ id: group.id, visible: true });
    });
  }
  
  function getLogData()
  {
    
    const log = reportus ? $("#file_data").text() : $('pre').text()

    return log
  }
  
  function doTimeline(daysBack)
  {
  if(!daysBack){daysBack = $("#TimelineDays").val()}
  setUpTimeline()
  processLines(getLogData(), daysBack)
  buildTimeline(daysBack)
  $('#timelineGui').remove()
  }

  
  var curr_url
  var timeline
  var groupIds
  var items
  var groups  
  var global_id
  var all_items

  var options


  curr_url = window.location.href;
  groupIds = {}
  groups = new vis.DataSet();  
  items = new vis.DataSet();
  global_id = 1

  function setupVars(page){
    switch (page) {
      case 'parallels-system.log':
        curr_groups = all_prl_syslog_groups
        all_items = prl_syslog_items
        checkRule = checkRulePrlSysLog
      return
      case 'system.log':
      curr_groups = all_syslog_groups
      all_items = syslog_items
      checkRule = checkRuleSysLog
      break
      case 'vm.log':
      case 'vm.1.gz.log':
      curr_groups = all_vm_groups
      all_items = vmlog_all_items
      checkRule = checkRuleVmLog
      break     
}
  }




  window.addEventListener("load", function() {

    let vmLogParsingInstructionsUrl = 'https://docs.google.com/spreadsheets/d/1C1cBrvXMm6qbCO3_wC8jZNEMqKHHOXLaNxhfJVNPwVo/gviz/tq?tqx=out:csv&sheet=testvmlog'

    $.get(vmLogParsingInstructionsUrl).then(function (data) {
      let vmlog = googleCsv2JsonTimeLine(data)
      vmlog_all_items = vmlog
  
     page = curr_url.match(url_regex) || '---'
    setupVars(page[0])
    
    if (curr_url.match(page[0])&&curr_groups){

      var head = $("body");
      head.prepend('<p id=timelineGui><p>')
      var Gui = $("#timelineGui");
      Gui.prepend($('<br><button id="Generate" >Generate Timeline</button>'))
      Gui.prepend($(' <a> days</a>'))
      Gui.prepend($(' <button id="100days" >100</button>'))
      Gui.prepend($(' <button id="20days" >20</button>'))
      Gui.prepend($(' <button id="3days" >3</button>'))
      Gui.prepend($('<form><label for="TimelineDays" style="display: block">How far back(days):</label>\
      <input type="number" id="TimelineDays" name="TimelineDays" value="7"></form>      '))
      $( "#TimelineDays" ).keyup(function(event) {
        if ( event.which == 13 ) {
          doTimeline()
        }
      });
      $("#3days").click(function(){doTimeline(3)});
      $("#20days").click(function(){doTimeline(20)});
      $("#100days").click(function(){doTimeline(100)});
      $("#Generate").click(function(){
      doTimeline()
    });
    }

    })



    
  });


//The below stuff is what I'm regularly editing


  var prod_regex = /vm\.1\.gz\.log|vm\.log|system.log|parallels-system.log/
  var testenv_regex = /(vm\.log\.html|)/
  
  var url_regex=prod_regex

  var checkRule


  function  checkRulePrlSysLog(item, line_message, prev_line, next_line, item_time){
    
    var result = {value:all_items[item].name}
    
    switch (item) { 
      case 'settings'://
      let settingsToSkip = /BlockSize|.SizeOnDisk|PackingOptions|InternalVmInfo|.Profile.Custom|HibernateState|BootingOrder|UserFriendlyName|SystemName|AppVersion/
      if(line_message.match(settingsToSkip)){return}
      let settings = line_message.match(/VmCfgCommitDiff: Key: '.*\.(.*)', New value: ('.*'), Old value: ('.*')/)
      let parameter = settings[1]
      let oldVal = settings[3]
      let newVal = settings[2]

      result.value = parameter+': '+oldVal+' > '+newVal

      if (parameter == "SystemFlags"){result.style='background-color:grey'}

      

      return result
      case 'PDFM_100983': 

      if(!rule_vars.PDFM_100983){rule_vars['PDFM_100983']={'last_seen':undefined}}

     var last_seen = rule_vars.PDFM_100983.last_seen
        if(!last_seen||last_seen-item_time>200000){
          //"tools outdated" messagesusually go in pairs, of it the last one was seen 200 sec apart or more, we skip it.
          rule_vars.PDFM_100983.last_seen = item_time
          return result
          }else{return false}
        
      
      case '---': {
        var last_seen = rule_vars.tools_outdated.last_seen
        if(!last_seen||last_seen-item_time>200000){
          //"tools outdated" messagesusually go in pairs, of it the last one was seen 200 sec apart or more, we skip it.
          rule_vars.tools_outdated.last_seen = item_time
          return result
          }else{return false}
      }
      }


  return result
}


  function  checkRuleVmLog(item, line_message, prev_line, next_line, item_time){
    
    var result = {value:all_items[item].name}
    
    switch (item) { 
      case 'crash'://need a rule that works in case there are some more lines after 'VM process exiting with code 0'
      if(!prev_line){return}
      if (!prev_line.match(/Vm will be stopped|BattWatcher|Encryption plugin|Terminating VM Process \.\.\.|VM process exiting with code 0|VM state\(VmStateNone\): enqueued 'VmLocalCmdStart'\(20001\) command/)&&line_message.match(/===========================================================/))
      {return result}else{return false
      }

      case 'app_launched': 
    
      if (line_message.match(regular_win_apps)){return false}
      var glregex = /(OpenGL\.\d{3}\.\d{3})\.[^\n]*\\(.*\.exe|.*\.EXE).*/
      var d3dregex = /(D3D\d+\.\d+): C:.*\\(.*\.exe|.*\.EXE).*/
      if(line_message.match(glregex)){
        var video_regex =  glregex}
      else if (line_message.match(d3dregex)){
        var video_regex =  d3dregex
      } else {return false}
  
        var exe = line_message.match(video_regex)[2]
        var version = line_message.match(video_regex)[1]
        
        result.value = exe+'\n ('+version+')'
        if(result.value.match(/210\.330/)){
          result.value+="!"
          result.style='background-color:rgb(255, 89, 103)' 
        }//because this profile causes issues
        //if (result.value.includes('Dropbox')){result.style='background-color:black'} // this is not to forget that we can do styles conditionally
        return result
        
        
      
      case 'tools_outdated': {
        var last_seen = rule_vars.tools_outdated.last_seen
        if(!last_seen||last_seen-item_time>200000){
          //"tools outdated" messagesusually go in pairs, of it the last one was seen 200 sec apart or more, we skip it.
          rule_vars.tools_outdated.last_seen = item_time
          return result
          }else{return false}
      }
      case "PD_Version": {
        let pdVersionRegex = /Parallels Desktop (\d\d\.\d\.\d)/
        result.value = 'PD '+line_message.match(pdVersionRegex)[1]
      }
      }


  return result
}

  function  checkRuleSysLog(item, line_message, prev_line, next_line, item_time){
    
  var result = {value:all_items[item].name}
  
  switch (item) { 
    case 'crash'://need a rule that works in case there are some more lines after 'VM process exiting with code 0'
    if (!prev_line.match(/'VM process exiting with code 0|VM state\(VmStateNone\): enqueued 'VmLocalCmdStart'\(20001\) command/)&&line_message.match(/===========================================================/))
    {return result}else{return false
    }
    
    case 'tools_outdated': {
      var last_seen = rule_vars.tools_outdated.last_seen
      if(!last_seen||last_seen-item_time>200000){
        //"tools outdated" messagesusually go in pairs, of it the last one was seen 200 sec apart or more, we skip it.
        rule_vars.tools_outdated.last_seen = item_time
        return result
        }else{return false}
    }
    }


return result
}


  
  options = {

    align:'left',
    maxHeight:"900px",
    margin: {
      item: 5
    },
      //stack:false,
      //cluster: true,
      groupTemplate: function (group) {
        var container = document.createElement("div");
        var label = document.createElement("span");
        label.innerHTML = group.content + " ";
        container.insertAdjacentElement("afterBegin", label);
        var hide = document.createElement("button");
        hide.innerHTML = "-";
        hide.style.fontSize = "small";
        hide.addEventListener("click", function () {
          groups.update({ id: group.id, visible: false });
        });
        container.insertAdjacentElement("afterBegin", hide);
        return container;
      },
      start: new Date(2020, 5, 5)
    
    };
  
  const regular_win_apps = //apps that will be ignored from the timeline
  (/(\\TextInputHost\.exe|mstsc.exe|HxOutlook.exe|AcrobatNotification|Cortana.exe|Adobe Desktop Service\.exe|Microsoft\.AAD\.BrokerPlugin\.exe|FirstLogonAnim\.exe|rundll32\.exe|SearchApp\.exe|msedge\.exe|svchost\.exe|Dwm\.exe|explorer\.exe|consent\.exe|wwahost|Microsoft\.Photos\.exe|SkypeApp|StartMenuExperienceHost|SystemSettings|LogonUI|ShellExperienceHost|WindowsInternal|taskhostw|SearchUI|WinStore|GameBar|CredentialUIBroker|LockApp|Explorer\.EXE|YourPhone|dwm\.exe)/)
  
  var rule_vars = {'tools_outdated':{'last_seen':undefined},'vm_exited':{'last_seen':undefined}}//dynamic conditions for checkRule()
    
  var curr_groups
  var all_items

//master
  const all_prl_syslog_groups = {'VM_Errors':{}, 'System_Errors':{}, 'PRL_Errors':{},"PD":{}}
//-
  const all_vm_groups = {
    'vm.log':{
    'Host_Issues':{},  
    'Pause/Un-pause':{},
    'Stop/Shutdown/Restart':{},
    'VM_Errors':{},
    'VM_Device':{},
    'VM_Apps':{},
    'VM_Network':{}}
  }

  const all_syslog_groups = {
    'system.log':{'Pause/Un-pause':{},'Stop/Shutdown/Restart':{},'VM_Errors':{},'VM_Device':{},'VM_Apps':{}}
  }
  
  let vmlog_all_items = {
    "PD_Version":{'regex':/Parallels Desktop (\d\d)\.(\d)\.(\d)/,"group":"vm.log","name":"PD_Version",'style':{'background-color':'rgb(252, 148, 3)','font-size':'0.8em'},'rule':true},
    "Report_collected":{'style':{'background-color':'rgb(179, 156, 123)'}},
    "Started_report_collection":{'regex':/VM state\(VmStateProblemReport\)\: started/,"group":"vm.log","name":"Collecting report",'style':{'background-color':'rgb(179, 12, 123)'}},
    "shutdown":{'regex':/SHUTDOWN: type 0x21/,"group":"Stop/Shutdown/Restart","name":"shutdown",'style':{'background-color':'rgb(179, 156, 123)'}},
    "start":{'regex':/VM state\(VmStateInitFinish\): changed to VmStateRunning/,"group":"Stop/Shutdown/Restart","name":"start",'style':{'background-color':'rgb(127, 219, 181)'}},
    "suspend":{'regex':/VM state\(VmStateSuspending\): changed to VmStateStopped/,"group":"Stop/Shutdown/Restart","name":"Suspended",'style':{'background-color':'rgb(71, 164, 166)'}},
    "resume":{'regex':/VM state\(VmStateInitFinish\): changed to VmStateResuming/,"group":"Stop/Shutdown/Restart","name":"Resume",'style':{'background-color':'rgb(68, 201, 173)'}},
    
    "reset":{'regex':/("VM state\(VmStateStopped\): changed to VmStateInit"|System reset via stop\-start)/,"group":"Stop/Shutdown/Restart","name":"reset",'style':{'background-color':'rgb(181, 40, 113)'}},
    
    "unpause":{'regex':/VM state\((VmStatePaused|f)\): enqueued 'VmLocalCmdStart'/,"group":'Pause/Un-pause',"name":"unpause",'style':{'background-color':'rgb(127, 219, 181)'}},
    "pause":{'regex':/VM state\(VmStateRunning\): enqueued 'VmLocalCmdPause'/,"group":'Pause/Un-pause',"name":"pause",'style':{'background-color':'rgb(182, 217, 184)'}},
   

    "crash":{'regex':/(=============================================================|VM process exiting with code 0)/,"group":"Stop/Shutdown/Restart","name":"сrash(host?)",'style':{'background-color':'rgb(161, 13, 50)'},'rule':true},
  
    "video_crash":{'regex':/Caught Abort trap\(.+\) in video device thread/,"group":"Stop/Shutdown/Restart","name":"video crash",'style':{'background-color':'rgb(161, 13, 50)'}},
    
    "PDFM-111627'ish":{'regex':/Error retrieve information about guest displays/,"group":"VM_Device","name":"PDFM-111627'ish",'style':{'background-color':'rgb(161, 13, 50)'}},
   


    "hw_reset":{'regex':/VM state\(VmStateRunning\): enqueued 'VmLocalCmdHardwareReset'\(20007\) command/,"group":"Stop/Shutdown/Restart","name":"reset(WIN)",'style':{'background-color':'rgb(181, 40, 113)'},'label':'VM reset initiated by guest OS<br>(e.g., via Windows GUI).'},
    "guest_hibernate":{'regex':/SHUTDOWN: type 0x74/,"group":"Stop/Shutdown/Restart","name":"hibern(WIN)",'style':{'background-color':'rgb(181, 40, 113)'}},
    "PDFM_96373":{'regex':/while io_cnt is not zero\!/,"group":'VM_Device',"name":"PDFM-96373(ish)",'style':{'background-color':'rgb(230, 163, 186)'}},
  
    'tools_outdated':{'regex':/\[PTIAHOST\] Guest tools started: outdated/,"group":'VM_Apps',"name":"Tools outdated",'style':{'background-color':'rgb(109, 163, 117)'}, 'rule':true},
    'tools_update':{'regex':/\[PTIA_GUEST\] Start installation:/,"group":'VM_Apps',"name":"Updating tools",'style':{'background-color':'rgb(80, 242, 131)'}},
    'tools_update_failed':{'regex':/\[PTIA_GUEST\] Tools installation failed./,"group":'VM_Apps',"name":"Tools upd failed",'style':{'background-color':'rgb(230, 163, 186)'}},
    
  
    "snapshot":{'regex':/VM state(VmStateRunning): enqueued 'DspCmdVmCreateSnapshot'/,"group":"Stop/Shutdown/Restart","name":"Creating Snapshot",'style':{'background-color':'rgb(181, 40, 113)'}},
   
    "closed_incorrectly":{'regex':/OpenDisk\(\) returned error PRL_ERR_DISK_INCORRECTLY_CLOSED/,"group":"VM_Errors","name":"INCORRECTLY_CLOSED",'style':{'background-color':'rgb(130, 14, 16)'}},
    
    
  
    "app_launched":{'regex':/(\.exe|\.EXE)/,"group":"VM_Apps","name":"App",'style':{'background-color':'#4b95ef','font-size':'0.8em'},'rule':true},



    "hostHddError":{'regex':/(Error writing\/reading HDD sectors|DIO ERROR)/,"group":'Host_Issues',"name":"Host HDD issues",'style':{'background-color':'rgb(143, 59, 74)'}},


    "PDFM_98595":{'regex':/Failed to setup bind-mode virtual netif/,"group":'VM_Network',"name":"PDFM-98595",'style':{'background-color':'rgb(230, 163, 186)'}},

    "kexts_not_loaded":{'regex':/USB Connect Service not found\!/,"group":'VM_Errors',"name":"need kext-consent",'style':{'background-color':'rgb(234, 40, 40)'}},

    "PDFM_97737":{'regex':/\[Tpm2\] TVNS \- invalid signature/,"group":'VM_Device',"name":"PDFM-97737",'style':{'background-color':'rgb(234, 40, 40)'}},


  

  }


  const prl_syslog_items = {
    "closed_incorrectly":{'regex':/Image was incorrectly closed/,"group":"VM_Errors","name":"INCORRECTLY_CLOSED",'style':{'background-color':'rgb(130, 14, 16)'}}, 
    "bad_internet":{'regex':/Updater lost connection timeout expired/,"group":"System_Errors","name":"Bad internet",'style':{'background-color':'rgb(212, 28, 129)'}},
    "font_not_found":{'regex':/not found, using Courier/,"group":"System_Errors","name":"Font missing",'style':{'background-color':'rgb(255, 102, 102)'}},
    'settings':{'regex':/VmCfgCommitDiff/,"group":'PD',"name":"Settings changed",'style':{'background-color':'rgb(109, 163, 117)'}, 'rule':true},
    'PDFM_100983':{'regex':/KMErrorDomain Code\=1/,"group":'System_Errors',"name":"PDFM-100983",'style':{'background-color':'rgb(230, 0, 0)'}, 'rule':true},
    'PDFM-102106':{'regex':/PRL_NET_PRLNET_OPEN_FAILED/,"group":'System_Errors',"name":"~PDFM-102106",'style':{'background-color':'rgb(230, 111, 0)'}},
    'PDFM-102112':{'regex':/Converter message: \(null\)/,"group":'System_Errors',"name":"~PDFM-102112",'style':{'background-color':'rgb(64, 85, 143)'}},
    'msg':{'regex':/.*Showing message box. Type = \[.* ([^\]]*)\].*/,"group":'System_Errors',"name":"PD Message: $1",'style':{'background-color':'rgb(178, 182, 194)'}}
  }

  const syslog_items = {
    "shutdown":{'regex':/SHUTDOWN_TIME/,"group":"Stop/Shutdown/Restart","name":"shutdown",'style':{'background-color':'rgb(179, 156, 123)'}},
    "start":{'regex':/BOOT_TIME/,"group":"Stop/Shutdown/Restart","name":"start",'style':{'background-color':'rgb(127, 219, 181)'}},
  }
  
  const special_item_styles = {}
 
  var line_message_regex = /(\w{3,4} \d\d \d\d:\d\d:\d\d|\d\d\-\d\d \d\d:\d\d:\d\d)(.*)/




  function googleCsv2JsonTimeLine (csv) {
    //that is a very dumb function, but it works.
  
    csv = csv
      .replace(/\"\,\"/gm, ';')
      .replace(/\"\"/gm, '"')
      .replace(/(\]\n|\}\n)/g, '$1delimiter')
      .replace(/}"|"{/gm,"")
  
    let headers = csv.split('\n')[0].substring(1, csv.split('\n')[0].length - 1).split(';')
  
    csv = csv.substring(csv.indexOf('\n') + 1)
  
    let lines = csv.split('\n')

    let result = {}

    let validSpec
  
    lines.forEach(line => {
      validSpec = 1
      let currentline = line
      .substring(1, line.length - 1)//removing quotes from both sides


      if(currentline.match(/\{(.*)}/)){currentline = currentline.replace(/\{(.*)}/, currentline.match(/\{(.*)}/)[0].replace(/;/gm,","))

      currentline = currentline.replace(/\{(.*)}/,"{$1}".replace(";",",")).split(';')}
      
      entityId = currentline[0]
  
      let specs = {}

      headers.forEach((header, index) => {


        let spec = currentline[index]
  
        if(spec.match(/\{(.*)\}/)){
          spec = JSON.parse(spec)}

        if (header == 'regex'){spec = new RegExp(spec)}
        if (header == 'rule'){spec = parseInt(spec)}



        if (header == 'Enabled' && spec == "FALSE"){
          validSpec = 0
          return }
        
        specs[header] = spec

      })
  
      if (validSpec) {result[entityId] = specs}
    })
  
   return result;  //JS Obj
  }


