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
  
  function buildTimeline(){
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
  'height': '500px',
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

  for (var key in curr_groups) {
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
  
    var line_date_string = line.match(line_message_regex)[1]
    //console.log(line_date_str)
    var datetime_string = "2020-" + line_date_string /*there is not year in log, so setting to
    current year by default and process_log_date adjusts it to previous year where needed */
    var line_date = Date.parse(datetime_string)
      
      var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
      d.setUTCSeconds(line_date / 1000);
      if (d > new Date()+24*3600*1000) { d.setFullYear(d.getFullYear() - 1); }
 
      return d
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
            console.log("done at line "+1)
            break; 
          } //stops when date is longer than 10 days before report's collection date
  
  
          for (var item in all_items){  
            if (line_message.match(all_items[item].regex)){


              var item_time = line_date
              var item_class = item
              var item_group = all_items[item].group
              var item_name = all_items[item].name
              var item_rule = all_items[item].rule
              var item_label = datetime_string
  
  
              if (!item_rule){
                createItem(item_class,item_group,item_name,item_time,curr_line_content)

              }
                else {
                  rule_result = checkRule(item, line_message, prev_line_content, next_line_content,item_time)

                  if (!rule_result){continue}
                  else {createItem(item_class,item_group,rule_result.value,item_time,curr_line_content,rule_result.style)}
                }
  
                
                
                
          }}
  
  }
  
  }
  
  function createItem(item, group, content, datetime, line_content, style, customTime){
    if(!customTime){time = datetime}

    console.log(style)
    items.add({
      id: global_id,
      group: groupIds[group],
      content: content,
      start: datetime,
      title: time,
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
    return $('pre').text()
  }
  
  function doTimeline()
  {
  setUpTimeline()
  processLines(getLogData(), 7)
  buildTimeline()
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
      return
      case 'system.log':
      curr_groups = all_syslog_groups
      all_items = syslog_items
      break
      case 'vm.log':
      curr_groups = all_vm_groups
      all_items = vmlog_all_items
      checkRule = checkRuleVmLog
      break     
}
  }




  window.addEventListener("load", function() {
    page = curr_url.match(url_regex)[0]
    setupVars(page)

    if (curr_url.match(page)&&curr_groups){
      console.log(curr_groups)
      var head = $("body");
      head.prepend($(' <button id="Generate" >Generate Timeline</button>'))
      $("#Generate").click(function(){
      doTimeline()
    });
    }
  });


//The below stuff is what I'm regularly editing


  var vmlog_regex = /vm\.log|system.log/
  var testenv_regex = /(vm\.log\.html|)/
  
  url_regex=vmlog_regex

  var checkRule


  function  checkRuleVmLog(item, line_message, prev_line, next_line, item_time){
    
    var result = {value:all_items[item].name}
    
    switch (item) { 
      case 'crash'://need a rule that works in case there are some more lines after 'VM process exiting with code 0'
      if(!prev_line){return}
      if (!prev_line.match(/VM process exiting with code 0|VM state\(VmStateNone\): enqueued 'VmLocalCmdStart'\(20001\) command/)&&line_message.match(/===========================================================/))
      {return result}else{return false
      }

      case 'app_launched': 
      
      if (line_message.match(regular_win_apps)){return false}
      var glregex = /(OpenGL\.\d{3})\.\d{3}\.[^\n]*\\(.*\.exe|.*\.EXE).*/
      var d3dregex = /(D3D\d+\.\d+): C:.*\\(.*\.exe|.*\.EXE).*/
      if(line_message.match(glregex)){
        var video_regex =  glregex}
      else if (line_message.match(d3dregex)){
        var video_regex =  d3dregex
      } else {return false}

        var exe = line_message.match(video_regex)[2]
        var version = line_message.match(video_regex)[1]
        result.value = exe+'\n ('+version+')'
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

    case 'app_launched': 
    
    if (line_message.match(regular_win_apps)){return false}
    var glregex = /(OpenGL\.\d{3})\.\d{3}\.[^\n]*\\(.*\.exe|.*\.EXE).*/
    var d3dregex = /(D3D\d+\.\d+): C:.*\\(.*\.exe|.*\.EXE).*/
    if(line_message.match(glregex)){
      var video_regex =  glregex}
    else if (line_message.match(d3dregex)){
      var video_regex =  d3dregex
    } else {return false}

      var exe = line_message.match(video_regex)[2]
      var version = line_message.match(video_regex)[1]
      result.value = exe+'\n ('+version+')'
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
    }


return result
}


  
  options = {

    align:'left',
    maxHeight:"500px",
    zoomMax: 7*24*60*60*1000, //7 ways
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
  (/(\\Dwm\.exe|explorer\.exe|consent\.exe|wwahost|WindowsApps|SkypeApp|StartMenuExperienceHost|SystemSettings|LogonUI|ShellExperienceHost|WindowsInternal|taskhostw|SearchUI|WinStore|GameBar|CredentialUIBroker|LockApp|Explorer\.EXE|YourPhone|dwm\.exe)/)
  
  var rule_vars = {'tools_outdated':{'last_seen':undefined},'vm_exited':{'last_seen':undefined}}//dynamic conditions for checkRule()
    
  var curr_groups
  var all_items

  const all_groups = {
    'vm.log':{'Pause/Resume':{},'Stop/Shutdown/Restart':{},'VM_Errors':{},'VM_Device':{},'VM_Apps':{}},
    'parallels-system.log':{'Prl_Errors':{}},
  }

  const all_vm_groups = {
    'vm.log':{'Pause/Resume':{},'Stop/Shutdown/Restart':{},'VM_Errors':{},'VM_Device':{},'VM_Apps':{}}
  }

  const all_syslog_groups = {
    'system.log':{'Pause/Resume':{},'Stop/Shutdown/Restart':{},'VM_Errors':{},'VM_Device':{},'VM_Apps':{}}
  }
  
  const vmlog_all_items = {
    "Report_collected":{'style':{'background-color':'rgb(179, 156, 123)'}},
    "shutdown":{'regex':/SHUTDOWN: type 0x21/,"group":"Stop/Shutdown/Restart","name":"shutdown",'style':{'background-color':'rgb(179, 156, 123)'}},
    "start":{'regex':/VM state\(VmState((?!Paused).)*?\): enqueued 'VmLocalCmdStart'\(\d+\)/,"group":"Stop/Shutdown/Restart","name":"start",'style':{'background-color':'rgb(127, 219, 181)'}},
    "stop":{'regex':/VM state\(VmStateSuspending\): changed to VmStateStopped/,"group":"Stop/Shutdown/Restart","name":"stopped",'style':{'background-color':'rgb(161, 13, 50)'}},
    "reset":{'regex':/("VM state\(VmStateStopped\): changed to VmStateInit"|System reset via stop\-start)/,"group":"Stop/Shutdown/Restart","name":"reset",'style':{'background-color':'rgb(181, 40, 113)'}},
    
    "resume":{'regex':/VM state\((VmStatePaused|f)\): enqueued 'VmLocalCmdStart'/,"group":'Pause/Resume',"name":"resume",'style':{'background-color':'rgb(127, 219, 181)'}},
    "pause":{'regex':/VM state\(VmStateRunning\): enqueued 'VmLocalCmdPause'/,"group":'Pause/Resume',"name":"pause",'style':{'background-color':'rgb(182, 217, 184)'}},
   

    "crash":{'regex':/(=============================================================|VM process exiting with code 0)/,"group":"Stop/Shutdown/Restart","name":"сrash(host?)",'style':{'background-color':'rgb(161, 13, 50)'},'rule':true},
  
    "video_crash":{'regex':/Caught Abort trap\(.+\) in video device thread/,"group":"Stop/Shutdown/Restart","name":"video crash",'style':{'background-color':'rgb(161, 13, 50)'}},
   
    "hw_reset":{'regex':/VM state\(VmStateRunning\): enqueued 'VmLocalCmdHardwareReset'\(20007\) command/,"group":"Stop/Shutdown/Restart","name":"reset(WIN)",'style':{'background-color':'rgb(181, 40, 113)'}},
    "guest_hibernate":{'regex':/SHUTDOWN: type 0x74/,"group":"Stop/Shutdown/Restart","name":"hibern(WIN)",'style':{'background-color':'rgb(181, 40, 113)'}},
    "PDFM_96373":{'regex':/while io_cnt is not zero\!/,"group":'VM_Device',"name":"PDFM-96373(ish)",'style':{'background-color':'rgb(230, 163, 186)'}},
  
    'tools_outdated':{'regex':/\[PTIAHOST\] Guest tools started: outdated/,"group":'VM_Apps',"name":"Tools outdated",'style':{'background-color':'rgb(109, 163, 117)'}, 'rule':true},
    'tools_update':{'regex':/\[PTIA_GUEST\] Start installation:/,"group":'VM_Apps',"name":"Tools upd",'style':{'background-color':'rgb(80, 242, 131)'}},
    
  
    "snapshot":{'regex':/VM state(VmStateRunning): enqueued 'DspCmdVmCreateSnapshot'/,"group":"Stop/Shutdown/Restart","name":"reset(WIN)",'style':{'background-color':'rgb(181, 40, 113)'}},
    //'paused':{'regex':/VM state\(VmStatePaused\): completed pending 'VmLocalCmdPause'\(20002\) command with result 0x0/,"group":'Pause/Resume',"name":"paused",'color':'rgb(185, 199, 189)'},
    //'unpaused':{'regex':/VCPU0 state\(VcpuStatePaused\): changed to VcpuStateUnpausing/,"group":'Pause/Resume',"name":"unpaused",'color':'rgb(183, 235, 197)'},
    "closed_incorrectly":{'regex':/OpenDisk\(\) returned error PRL_ERR_DISK_INCORRECTLY_CLOSED/,"group":"VM_Errors","name":"INCORRECTLY_CLOSED",'style':{'background-color':'rgb(130, 14, 16)'}},
    
    
  
    "app_launched":{'regex':/(\.exe|\.EXE)/,"group":"VM_Apps","name":"App",'style':{'background-color':'#4b95ef','font-size':'0.8em'},'rule':true}
    //add suspend,unsuspend
  }


  const syslog_items = {
    "shutdown":{'regex':/SHUTDOWN_TIME/,"group":"Stop/Shutdown/Restart","name":"shutdown",'style':{'background-color':'rgb(179, 156, 123)'}},
    "start":{'regex':/BOOT_TIME/,"group":"Stop/Shutdown/Restart","name":"start",'style':{'background-color':'rgb(127, 219, 181)'}},
  }
  
  const special_item_styles = {}
 
  var line_message_regex = /(\w{3,4} \d\d \d\d:\d\d:\d\d|\d\d\-\d\d \d\d:\d\d:\d\d)(.*)/