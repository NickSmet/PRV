//Constrution of menu with bullets and log links
function upper_menu() {
//Making the main informationpanel occupy half of the screen
    var doc_top_bar = $(".reportList");
    $(doc_top_bar).css({
      "textAlign":"left"
  });
  doc_top_bar.find('tbody').css({
    "width":"45%",
    "display":"inline-block"
  })
  
    var bullet_container = $('<div/>')
    .attr("id", "doc_top_bar")
    .addClass("container")
    .css({
      "margin-left":"2.5em",
      "width":"50%",
      "display":"inline-block",
    })
    doc_top_bar.append(bullet_container);
    
  	ConstructBullets(pinned_items, 'item', bullet_container)
    ConstructBullets(pinned_logs, 'log', bullet_container)

    /*input prl report url, output -- 'data:image/png;base64' string*/
    }

/** @description  Creates bullets and arranges bullets into an array
 */
function ConstructBullets (elements_array, elements_type, append_to) {
    var i
    for (i = 0; i < elements_array.length; i++) {
        var item_element
        //if the element is not present on page, will create a greyed out bullet (it's better to see that something is missing)
        //console.log($('a[href*="' + elements_array[i] + '"]').text())
        if ($('a[href*="' + elements_array[i] + '"]').length===0) {
            var bulletElement = CreateBullet(elements_array[i], 'blank')
        }
        else {
            bulletElement = CreateBullet(elements_array[i], elements_type)

        }


        $(bulletElement).appendTo(append_to)

}
}

/** @description  Parse items with XML like structure
 * @param {string} data Xml-like string.
 * @param {string} element Name of the <element> whose subelements' values have to be returned (like "HardDisk" for a HDD in HostInfo).
 * @param {Object} parameters Object like {'Host_HDD_Name':'Name', 'Host_HDD_UUID':'Uuid'}, where key is what you want 
 * the parameter to be named, and value -- its element's name in the XML structure.
 * @param {Object} adjustments Object like {"Size":"bytes"} for parameters that need to be adjusted. 
 * (like time for TimZone or bytes to Kb/Mb for readability). Refer to AdjustSpec function for usage 
 * @param {Object} filter Object like {"NetworkType":"0"}. Bullet elements consistent with these
 * criteria will be skipped.  
 */
function parseXMLItem( data, element, parameters, adjustments={}, filter={}){
  //console.log(data)
  data = data.replace(/\<\-\>/,"")
  data = data.replace(/<\?xml[^>]*>/,"")
  data = data.replace(/\&/,"")

  xmlDoc = $.parseXML( data ),
  $xml = $( xmlDoc );

  var subBullet = ''

  var element = $xml.find(element)
  //console.log (element)
  element.each(function () {
    //console.log($(this))
    for (var key in filter){
      //console.log(filter[i])
      //console.log(key+value+$(this).find(key).first().text())
      var value_here = $(this).find(key).first().text()
      if (filter[key] == value_here || value_here.match(filter[key].toString())){return true}
    }
    
    var subBulletItem = ''
    for (var parameter in parameters){
        var paramValue = $.trim($(this).find(parameters[parameter]).first().text())
        if (parameter in adjustments){
            paramValue = adjustSpec(paramValue, adjustments[parameter])
        }
        if (paramValue){
        subBulletItem +='<u>'+parameter+'</u>: '+ paramValue+'\n'}
      
    }
    subBullet = subBullet+subBulletItem+'\n';  })
    if (subBullet.trim() == ''){subBullet='Nothing'}
return subBullet}




/** @description  Construction of individual bullet
 * @param {string} item_name Bullet's displayed name (don't use spaces).
 * @param {string} bullet_type 'Custom' by default, and that's what you need. 
 * @param {Object} data Bullet's data. What you want to see when it's expanded.
 * @param {Object} icon_url  
 */
function CreateBullet(item_name, bullet_type, data = '', icon_url, sublevel=0) {
  var sublevel_space = "    "
    
    //Here it's templating enginge syntax
    var collapsible_template = '<div>\
<button type="button" id={{:button_id}} class="btn btn-primary btn-xs" aria-pressed="true" data-toggle="collapse" data-target={{:item_target}}>\
➤\
</button>\
  <a style="text-decoration: none; text-decoration: none; background-color: unset !important;" href={{:item_link}}>{{:item_name}}</a>\
</div>\
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


    

    var type_to_link = {
      'item':'http://reports.prls.net/Reports/Xml.aspx?ReportId=' + report_id + '&NodeName=' + item_name,
      'log' : 'http://reports.prls.net/Reports/Log.aspx?ReportId=' + report_id + '&LogName=' + item_name,
        'blank' : ''
    };

    var item_data = data;
  	var item_link = type_to_link[bullet_type];
    
    var item_id = item_name.split(" ").join("");;
    if(bullet_type=='log'){
      item_id = item_name.replace('Log')
    }
    
    
    var button_id = "btn_" + item_id;
    var item_summary = "nothing yet";
    var item_target = '#' + item_id;


    var bullet_content = {
        item_data : item_data,
        item_link: item_link,
        item_name: item_name,
        item_id: item_id,
        item_summary: item_summary,
        item_target: item_target,
        button_id: button_id,
        icon_url : icon_url
    };

    collapsible_template = $.templates(collapsible_template);
    var bullet = collapsible_template.render(bullet_content)
    
    return bullet

}

function BulletData(item_id, option) {
  if (tries[item_id]){tries[item_id]--}else{tries[item_id]=tries['tries']}
    var bullet_parsed_data = 'nothing yet';

    if (pinned_collapsibles.includes(item_id)){$('#' + item_id).text('loading...');}

    //console.log(item_id);
    var theerror = ''
    
    
    
    var request_link = 'http://reports.prls.net/Reports/Xml.aspx?ReportId=' + report_id + '&NodeName=' + item_id
    if (item_id.match('.log')){request_link = 'http://reports.prls.net/Reports/Log.aspx?ReportId=' + report_id + '&LogName=' + item_id
  }
  
    $.ajaxSetup({
 
      error: function(xhr, status, error) {

        if(tries[item_id]>0){BulletData(item_id, option)}
           } 
          });
    
    $.get(request_link, function ldd(data) {
;
        var bullet_all_data = $('pre', data).eq(0).text()

        if(!bullet_all_data){
          bullet_parsed_data = "Some kind of (likely server) error"
          return
        }


      bullet_all_data = bullet_all_data.replace('<?xml version="1.0" encoding="UTF-8"?>','')

        eval("bullet_parsed_data=parse"+item_id.replace('.log','Log')+"(bullet_all_data)")
        //console.log(bullet_parsed_data)

        if(typeof option === "undefined") {
        $('#' + item_id).html(bullet_parsed_data);
        return
        }
        else if (option == 'time') {
            timediff = bullet_parsed_data
//need to rewrite the bit below (and maybe FitTime to aligh with it)
            correcttime = fixTime (timediff)
            var gmt_string = $( ".reportList:first tbody:first tr:nth-child(3) script" ).text()
            //console.log(gmt_string)
            var gmt_regex = /\(\"([\d\-T\:]*)\"\)/
            var gmt_substr = gmt_string.match(gmt_regex)[1];
            var gmt_time = Date.parse(gmt_substr);
            //console.log(gmt_time)
            var time_seconds = gmt_time/1000;
            //console.log(time_seconds)
            var correct_time1 = new Date(0);
          //console.log(correct_time)
            //console.log(timediff)
            correct_time1.setUTCSeconds(time_seconds+10800)
            gmt_time = correct_time1.toString().substring(4,24)
        $( ".reportList:first tbody:first tr:nth-child(3) :nth-child(3)" ).html("Customer: "+correcttime+"</br> Moscow:&nbsp;&nbsp;&thinsp;&thinsp;"+gmt_time)

        }


    })}

function parseCurrentVm(item_all_data) {
    xmlDoc = $.parseXML( item_all_data ),
    $xml = $( xmlDoc );

    //var hdds_regex = /\<Hdd[^\>]*\>[^$]*<\/CommandName>/g


    var ParamVMHDDs = {'Location':'SystemName', 'Virtual Size':'Size', 'Actual Size':'SizeOnDisk', 'Interface':'InterfaceType', 'Splitted':'Splitted', 'Trim':'OnlineCompactMode'}
    var AdjustsVMHDDs = {'Interface':'hddtype', 'Actual Size': 'appleMbytes','Virtual Size':'mbytes'}
    var iconVMHDDs = "https://image.flaticon.com/icons/svg/1689/1689016.svg"

    var VMHDDs_data = parseXMLItem ( item_all_data, element = "Hdd", ParamVMHDDs,AdjustsVMHDDs)
    var VMHDDs = CreateBullet('HDDs','Custom', VMHDDs_data, iconVMHDDs)
    


    var ParamVMUSBs = {'Name':'SystemName', 'Last connected':'Timestamp'}
    var AdjustsVMUSBs = {'Last connected':'time'}
    var iconVMUSBs = "https://image.flaticon.com/icons/svg/1689/1689028.svg"

    var VMUSBs_data = parseXMLItem ( item_all_data, element = "USBPort", ParamVMUSBs,AdjustsVMUSBs)
    var VMUSBs = CreateBullet('USBs','Custom', VMUSBs_data, iconVMUSBs)

    if(VMHDDs.match(/<u>Trim<\/u>: 1/)){markBullet('CurrentVm', 'trim')}
    if(VMHDDs.match(/<u>Splitted<\/u>: 1/)){markBullet('CurrentVm', 'splitted')}

  //console.log(guestUSB)

    var specs_regex = {
        'Section5':'Startup',
        'AutoStart': $xml.find('AutoStart').text(),
        'OnVmWindowClose': $xml.find('OnVmWindowClose').text(),
        'Pause When Possible': $xml.find('Coherence > PauseIdleVM').text(),

        'Section0':'General',
        'PVM Location': $xml.find('VmHome').text().replace("\/config.pvs",''),
        'Creation date': $xml.find('VmCreationDate').text(),
        'This VM UUID': $xml.find('VmUuid').text(),
        'Source   UUID': $xml.find('SourceVmUuid').text(), 
        
        'Section1':'Hardware',
        'Cpus': $xml.find('Hardware > Cpu > Number').text(),
        'Ram': $xml.find('Hardware > Memory > RAM').text(),
        'VRam': $xml.find('Video > VideoMemorySize').text(),
        'Video Mode': parseInt($xml.find('EnableHiResDrawing').text()) + parseInt($xml.find('NativeScalingInGuest').text()),
        'Scale To Fit Screen':$xml.find('FullScreen > ScaleViewMode').text(),
        '3D Acceleration': $xml.find('Video > Enable3DAcceleration').text(),
        'Lan Adapter': $xml.find('AdapterType').text(),
        'Network': $xml.find('NetworkAdapter > EmulatedType').text(),
        'Subbullet2':VMHDDs,
        
        'Hypervisor': $xml.find('HypervisorType').text(),
        'Adaptive Hypervisor': $xml.find('EnableAdaptiveHypervisor').text(),
        'Nested Virtualization': $xml.find('VirtualizedHV').text(),
        'Section2':'Sharing',
        'Isolated': $xml.find('IsolatedVm').text(),
        'Shared profile': $xml.find('SharedProfile > Enabled').text(),
        'Win>Mac Sharing': $xml.find('FromWinToMac').text(),
        'Mac>Win Sharing': $xml.find('FromMacToWin').text(),
        'Clipboard Sync': $xml.find('ClipboardSync > Enabled').text(),
        'Time Sync': $xml.find('TimeSync > Enabled').text(),
        'Section3':'Other',
      'SmartGuard': $xml.find('Autoprotect > Enabled').text(),
      'Opt.TimeMachine': $xml.find('Autoprotect > Schema').text(),
      '<b>Boot Flags</b>': $xml.find('SystemFlags').text(),
		'Graphic Switching':$xml.find('OptimizePowerConsumptionMode').text(),
    'Enter Travel Mode':$xml.find('TravelOptions > Condition > Enter').text(),
    'Section':'Devices',
    'Share Host Printers':$xml.find('VirtualPrintersInfo > UseHostPrinters').text(),
    'Sync Default Printer':$xml.find('VirtualPrintersInfo > SyncDefaultPrinter').text(),
    'Show Page Setup':$xml.find('VirtualPrintersInfo > ShowHostPrinterUI').text(),
    'Shared Camera':$xml.find('SharedCamera > Enabled').text(),

    'Shared CCID':$xml.find('SharedCCID > Enabled').text(),
    'Shared Bluetooth':$xml.find('SharedBluetooth > Enabled').text(),
    'Enter Travel Mode':$xml.find('TravelOptions > Condition > Enter').text(),
    'USB 3.0': $xml.find('XhcEnabled').text(),
    'Subbullet1': VMUSBs
    };
    var all_specs = '';

    //check if VM ram is not more than 1/2 of Host.
    var hostram = $("table.reportList > tbody > tr:nth-child(17) > td:nth-child(2)").text()
    
    var vmram = specs_regex['Ram']

    if (vmram>hostram/2){
      specs_regex['Ram']+='<b style="color:red">!!!!! Too Much</b>',
      markBullet("CurrentVm",'bad')
    }
    if((vmram % 256) != 0){
      specs_regex['Ram']+='<b style="color:orange">! Uneven amount </b>',
      markBullet("CurrentVm",'warning')
    }

    //Setting readable string for videomode.
    // var scaleToFitMode = parseInt($xml.find('EnableHiResDrawing').text()) + parseInt($xml.find('NativeScalingInGuest').text())
    // var scaleToFitModes = {0:'Scaled',1:'Best for Retina',2:'Best for external displays'}
    // specs_regex['Video Mode'] = videomodes[scaleToFitMode]


    // var videomode = parseInt($xml.find('EnableHiResDrawing').text()) + parseInt($xml.find('NativeScalingInGuest').text())
    // var videomodes = {0:'Scaled',1:'Best for Retina',2:'Best for external displays'}
    // specs_regex['Video Mode'] = videomodes[videomode]

    //Setting correct value for vram
    if (specs_regex['VRam']=="0"){specs_regex['VRam']="Auto"}

    //Identifying if VM was copied
    if (specs_regex['Source   UUID']!=specs_regex['This VM UUID'])
    {markBullet("CurrentVm",'copied vm')}

    //Identifying if VM is on an external volumes
    if (specs_regex['PVM Location'].match(/^\/Volumes/)){markBullet("CurrentVm","external drive")}

    //Identifying AppleHV and marking bullet accordingly
    if (specs_regex['Hypervisor']==1)
    {markBullet("CurrentVm","AppleHV")}

 //Identifying Nested Virtualization and marking bullet accordingly
    if (specs_regex['Nested Virtualization']==1)
    {markBullet("CurrentVm","Nested")}

    //Identifying if headless and marking bullet accordingly
    if (specs_regex['AutoStart']==1 || specs_regex['AutoStart']==5 || specs_regex['AutoStart']==3)
    {markBullet("CurrentVm","headless")} 
    else
    {//markBullet("CurrentVm",'not headless')
  }

    //Identifying if Isolated and marking bullet accordingly
    if (specs_regex['Isolated']=='1'){markBullet("CurrentVm","isolated")}

    //Identifying if has bootflags and marking bullet accordingly
    if (specs_regex['<b>Boot Flags</b>']!=''){markBullet("CurrentVm","flags")}
    var specs_to_name = {
      'Lan Adapter':{0: 'Legacy',1 :'RealTek RTL8029AS',2: 'Intel(R) PRO/1000MT',3:'Virtio', 4:'Intel(R) Gigabit CT (82574l)'},
      'Network':{1: 'Shared',2 :'Bridged'},
      'Opt.TimeMachine':{1: 'On',2 :'Off'},
      'Graphic Switching':{1:'Off',0:'On'},
      'Hypervisor':{0:'Parallels', 1:'Apple'},
      'Video Mode':{0:'Scaled',1:'Best for Retina',2:'Best for external displays'},
      'Scale To Fit Screen':{0:'Off',1:'Auto',2:'Keep ratio',3:'Stretch'}
    }


    keysWithIcons = {'Share Host Printers':'printers','Scale To Fit Screen':'fullscreen'}
    

    for (var key in specs_regex) {//я немного запутался, но оно рабоатет
      var spec
       var specName = key
       var specValue = specs_regex[key];
       
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

  
  var networkParams = {
    'Name':'Description',
    'DHCP IP':'DhcpIPAddress',
    'Net Mask':'IPNetMask',
    'Host IP':'HostIPAddress',
    'DHCP Enabled':'DHCPServer > Enabled',
    'IPv6 DHCP Ehabled':'DHCPv6Server > Enabled',
    'NetworkType':'NetworkType'
  }
  var networkFilter = {'NetworkType':0}
  var network = parseXMLItem(item_all_data, "VirtualNetwork", networkParams,{}, networkFilter)
  //console.log(network)

  //var networkBullet = CreateBullet('Networks', 'Custom', savedStates, 'https://image.flaticon.com/icons/svg/387/387157.svg')



     return network;}


     function 	parseClientProxyInfo(item_all_data) {

      proxies_regex = /\<dictionary\> {[^}]*}([^}]*)}/gm

      var proxies = item_all_data.match(proxies_regex)[0]

      if (proxies.match(/HTTPEnable : 1/)){markBullet("ClientProxyInfo","bad")}else{markBullet("ClientProxyInfo",'all good')}
    
    
         return ;

}

function parseAdvancedVmInfo(item_all_data) {
  
  if (item_all_data.match(/writeattr/)){
    markBullet('AdvancedVmInfo','ACL')
  }

  var number_of_snapshots = item_all_data.match(/SavedStateItem/g) ? item_all_data.match(/SavedStateItem/g).length/2-1 : 0;
  
  
  if(number_of_snapshots<1){
    markBullet("AdvancedVmInfo", "no_snapshots")
    return ("No snapshots")
  } else 
    {
  markBullet("AdvancedVmInfo", "snapshots")
  markBullet("AdvancedVmInfo", "Custom", '<a>'+number_of_snapshots+'* </a>')
    }

  //Here we're just fixing the XML structure. For some resong for AdvancedVmInfo it's off.
  regex1 = /\<\/AdvancedVmInfo\>\n\<\/AdvancedVmInfo\>/gm,
  regex2 = /(<ParallelsSavedStates>|<\/DiskInfo>|<\/Hdd>)/gm
  regex3 = /(<DiskInfo>|<Hdd[^>]*>)/gm

  //regex3 = /<Parallels_disk_image[^>]*>/
  item_all_data = item_all_data.replace(regex1, '</AdvancedVmInfo>');
  item_all_data = item_all_data.replace(regex2, "")
  item_all_data = item_all_data.replace(regex3, "")
  //item_all_data = item_all_data.replace(regex3,"")

  savedStatesParams = {
    'Name':'Name',
    'Created on':'DateTime'
  }
  var savedStates = parseXMLItem(item_all_data, "SavedStateItem", savedStatesParams)
  var savedStatesBullet = CreateBullet('Snapshots', 'Custom', savedStates, 'https://image.flaticon.com/icons/svg/387/387157.svg')
  
  



      return savedStatesBullet;


}

function parseHostInfo(item_all_data) {
  //console.log(item_all_data)
 

var ParamUSBs = {'Name':'Name', 'UUID':'Uuid'}
var iconUSBs = "https://image.flaticon.com/icons/svg/1689/1689028.svg"

var ParamHDDs = {'Name':'Name', 'UUID':'Uuid', "Size":"Size"}
var AdjustsHdd = {"Size":"bytes"}
var HddFilter = {'Name':'AppleAPFSMedia'}
var iconHDDS = 'https://image.flaticon.com/icons/svg/1689/1689016.svg'

var paramCameras = {'Name':'Name', 'UUID':'Uuid'}

var ParamNetwork = {'Name':'Name','UUID':'Uuid', "MAC":"MacAddress","IP":'NetAddress'}
var iconNetwork = "https://image.flaticon.com/icons/svg/969/969345.svg"
var networkFilter = {}

var ParamInputs = {'Name':'Name', 'UUID':'Uuid'}
var iconInputs = "https://image.flaticon.com/icons/svg/1689/1689025.svg"

var ParamPrinters = {'Name':'Name', 'UUID':'Uuid'}
var iconPrinters = "https://image.flaticon.com/icons/svg/2489/2489670.svg"

var ParamCCIDs = {'Name':'Name', 'UUID':'Uuid'}
var iconCCIDS = "https://image.flaticon.com/icons/svg/908/908765.svg"

  var USBs_data = parseXMLItem( item_all_data, element = "UsbDevice", ParamUSBs)
  var Network_data = parseXMLItem( item_all_data, element = "NetworkAdapter", ParamNetwork,{},networkFilter)
  var HDDs_data = parseXMLItem( item_all_data, element = "HardDisk", ParamHDDs, AdjustsHdd,HddFilter)
  var Inputs_data = parseXMLItem( item_all_data, element = "HIDDevice", ParamInputs)
  var Printers_data = parseXMLItem( item_all_data, element = "Printer", ParamPrinters)
  var CCIDs_data = parseXMLItem( item_all_data, element = "SmartCardReaders", ParamCCIDs)
  var camerasData = parseXMLItem( item_all_data, element = "Cameras", paramCameras)
  
//that's definitely super-repetative; but ok for now
  var specs_definition = {
  'Subbullet1': (USBs_data=='Nothing') ? CreateBullet('Host_USBs','blank', USBs_data, iconUSBs) : CreateBullet('Host_USBs','Custom', USBs_data, iconUSBs),
  'Subbullet2': (Network_data=='Nothing') ? CreateBullet('Host_Nets','blank', Network_data, iconNetwork) : CreateBullet('Host_Nets','Custom', Network_data, iconNetwork),
  'Subbullet3': (HDDs_data=='Nothing') ? CreateBullet('Host_HDDs','blank', HDDs_data, iconHDDS) : CreateBullet('Host_HDDs','Custom', HDDs_data, iconHDDS),
  'Subbullet4': (camerasData=='Nothing') ? CreateBullet('Host_Cams','blank', camerasData, icons.webcam) : CreateBullet('Host_Cams','Custom', camerasData, icons.webcam),
  'Subbullet5': (Inputs_data=='Nothing') ? CreateBullet('Host_Input_Devices','blank', Inputs_data, iconInputs) : CreateBullet('Host_Input_Devices','Custom', Inputs_data, iconInputs),
  'Subbullet6': (Printers_data=='Nothing') ? CreateBullet('Host_Printers','blank', Printers_data, iconPrinters) : CreateBullet('Host_Printers','Custom', Printers_data, iconPrinters),
  'Subbullet7': (CCIDs_data=='Nothing') ?CreateBullet('Host_CCIDs','blank', CCIDs_data, iconCCIDS) : CreateBullet('Host_CCIDs','Custom', CCIDs_data, iconCCIDS),

  };
  var all_specs = '';

  var specs_to_name = {
    'Lan Adapter':{0: 'Legacy',1 :'RealTek RTL8029AS',2: 'Intel(R) PRO/1000MT',3:'Virtio', 4:'Intel(R) Gigabit CT (82574l)'},
    'Network':{1: 'Shared',2 :'Bridged'},
    'Opt.TimeMachine':{1: 'On',2 :'Off'}
  };

  for (var key in specs_definition) {
     //if (item_all_data.match(specs_regex[key]) == null){continue}
     var spec
     var spec_value = specs_definition[key];
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

    regex = /(\<More[^$]*dtd\"\>|\<\=|\<\/MoreHostInfo>)/gm
    item_all_data = item_all_data.replace(regex, '');
    
    var jsonString = PlistParser.parse(item_all_data);
    var top_el
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
    var number_of_displays = 0
    var gpus_bullet = ''
    var gpuNames=[]
    for (var i in graphics_subel){
        
        var gpu = graphics_subel[i]
        var gpu_name = (gpu['sppci_model'])
        if (gpuNames.includes(gpu_name)){gpu_name+="_"+i}
        gpuNames.push(gpu_name)
        var displays = []
        for (var i in gpu['spdisplays_ndrvs']){
            number_of_displays++
            var display_subel = gpu['spdisplays_ndrvs']
            display = 
                "\n<u>Display</u>: "+display_subel[i]['_name']+"\
                \n<u>Phys resolution</u>: "+display_subel[i]['_spdisplays_pixels']+"\
                \n<u>Logical resolution</u>: "+display_subel[i]['_spdisplays_resolution']+"\n"
            
            displays += display
            //CreateBullet(item_name, bullet_type, data = '', icon_url)
        } 
        var bulletType
        if (displays==""){
          bulletType = 'blank'
        }else{bulletType = 'Custom'}
        var gpu_bullet = CreateBullet(gpu_name, bulletType, displays, icons.gpu,1)
        gpus_bullet += gpu_bullet
        }
        //console.log(gpus_bullet)

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

    var non_apple_regex = /^((?!com.apple|LoadedDrivers|com.parallels).)*$/gm;
    var non_apple_arr = item_all_data.match(non_apple_regex);
    if (non_apple_arr == null) {
        $('#LoadedDrivers').text("Only apple+prl");
        markBullet('LoadedDrivers','all good')
        return;
    }
    var kext
    var hasBadKexts = false
    var drv_name_regex = / (\w+\.[^ ]*)/gm;
    var i
    for (i = 0; i < non_apple_arr.length; i++) {
        kext = non_apple_arr[i].match(drv_name_regex)
        non_apple_arr[i] = kext
        //console.log(kext[0].trim())
        if (bad_kexts.indexOf(kext[0].trim()) > -1){
          hasBadKexts = true
        }
    }
    
    var non_apple_str = non_apple_arr.join('\r\n');
    
    if (hasBadKexts==false){
      markBullet('LoadedDrivers', 'warning')}
      else{
        markBullet('LoadedDrivers','bad')}
      
    return non_apple_str


}

function parseAllProcesses(item_all_data) {
    var bsdtar_regex = /toolbox_report\.xml\.tar\.gz/
    var bdstar_marker = "<u><b>bdstar</b></u>"
    var apps_regex = /\s\/Applications\/((?!Parallels Desktop.app|\/).)*\//gm;/*the \s at the beginning is important, 
    because we're eliminating apps inside of Apps (mainly Toolbox apps). Maybe should just create an exclusion list. 
    */
    var app_regex = /\/Applications\/([^\/]+)\//;
    var apps = item_all_data.match(apps_regex);
    if (item_all_data.match(bsdtar_regex)){
      markBullet('AllProcesses','bad')
      markBullet('AllProcesses','Custom',bdstar_marker)
      
    }
    if (!apps){
      return "Looks like no apps running (better check)."
    } 

  	var apps_all = []
    var i
  	for (i = 0; i < apps.length; i++) {
      var app = apps[i].match(app_regex)[1]
       if (apps_all.indexOf(app) == -1){
    apps_all.push(app)
    }


    }
 	var apps_export = apps_all.join('\r\n');
  //console.log (apps_all);

  return apps_export

}

function parseMountInfo(item_all_data) {

    var mountinfo_regex = /^.*(Gi|Filesystem|Ti).*$/gm;
    var mountinfo = item_all_data.match(mountinfo_regex);
 //console.log (mountinfo);


    var drive_regex = /^([^ ]* +){5}/gm;
    var i
    for (i = 0; i < mountinfo.length; i++) {
        mountinfo[i] = mountinfo[i].match(drive_regex)
    }

    var mountinfo_all = mountinfo.join('\r\n');


    return mountinfo_all


}

function parseGuestOs(item_all_data) {

  xmlDoc = $.parseXML( item_all_data ),
  $xml = $( xmlDoc );
  var ToolsParams = {'Name':'ToolName', 'Version':'ToolVersion','Last updated':'ToolDate','Status':'ToolUpdateStatus'}
  var ToolsAdjust = {'Last updated':'Time'}
  var ToolsFilter = {'ToolUpdateStatus':'UpToDate','ToolVersion':'0.0.0.0'}
  result = parseXMLItem(item_all_data, 'GuestToolInfo', ToolsParams,ToolsAdjust,ToolsFilter);
  //console.log(result)
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

  if(item_all_data.length<100){return "Nothing"} //instead of matching empty guest commands, just ignoring when it's very small

  var guest_commands_results = []

    function ExtractCommandOutput(command) {
      //console.log(command)
        var command_result_regex = new RegExp ('\<CommandName\>'+command+'<\/CommandName>\n +\<CommandResult\>([^]*?)<\/CommandResult\>')
        if (item_all_data.match(command_result_regex)){
        var command_result = item_all_data.match(command_result_regex)[1]
        return command_result}
    }

  var net_use="net use"
  var ipconfig = "ipconfig /all"
  var cpu_usage = "prl_cpuusage --sort-cpu-desc --time 4000"

  function parseNetuse(command_result) {
    if(!command_result){return}
   var net_volumes_regex = /[A-Z]\: +\\\\Mac\\\w+/g
   var net_volumes = command_result.match(net_volumes_regex)
   if(net_volumes!== null){
   net_volumes.unshift("_Network volumes:_")
   net_volumes = net_volumes.join('\r\n');

    return net_volumes}

  }
  function parseIpconfig(command_result) {
    
    var adapters_regex = /\n[ \w][^\n\:]*:\n\n( +[^\n]*\n){1,}/gi
    var adapters = command_result.match(adapters_regex)

    if (adapters!== null){

    var adapters_output = ["\n"]


    var i
    for (i = 0; i < adapters.length; i++) {
      var adapter = []

    try {
      var adapter_name = (i+1+".")+adapters[i].match(/\n([ \w][^\n\:]*)\:/)[1]
      //console.log(adapter_name)
      adapter.push(adapter_name)
    } catch(e) {}

      try {
    var adapter_discr = adapters[i].match(/\n[ \w][^\n\:]*\:[^$]*?:[^$]*?:([^\n]*?)\n/)[1]
    adapter.push(adapter_discr)
    } catch(e) {} // If func1 throws error, try func2

     try {
      var adapter_ip = "IP: "+adapters[i].match(/IPv4[^$]*?: (\d{1,3}(\.\d{1,3}){3})/)[1]
       adapter.push(adapter_ip)
      } catch(e) {} // If func2 throws error, try func3

      adapter = adapter.join('\r\n');
      //console.log(adapter)
      adapters_output.push(adapter)

    }
    adapters_output.unshift("_Netw. Adapters:_")
    adapters_output = adapters_output.join('\r\n');
    return adapters_output}

  }
  function parseCpuUsage(command_result) {
    //console.log(command_result)

    var cpu_usage_regex = /\d+\.\d\d% +\d+ C:[\\\w \(\)\-]+\.exe/g
    var cpu_usage = command_result.match(cpu_usage_regex) //get cpu usage % and process locations
    if (cpu_usage!== null) {
    cpu_usage = cpu_usage.slice(0,5) //get first 3 processes
    cpu_usage.unshift("_Top processes:_")
    cpu_usage = cpu_usage.join('\r\n');

    //console.log(cpu_usage)
    return cpu_usage}

  }

  var net_use_results = parseNetuse(ExtractCommandOutput(net_use))
  var ipconfig_results = parseIpconfig(ExtractCommandOutput(ipconfig))
  var cpu_usage_results = parseCpuUsage(ExtractCommandOutput(cpu_usage))

  guest_commands_results.push(ipconfig_results, net_use_results, cpu_usage_results)

  guest_commands_results=guest_commands_results.join('\r\n\n');

  return guest_commands_results
  //console.log(net_use_results)

}

function parseVmDirectory(item_all_data) {
  //counts number of VMs and marks bullet accordingly
  var numberofvms = item_all_data.match(/VmName/g).length/2
  if(numberofvms>0){
    markBullet("VmDirectory", "vms")
    markBullet("VmDirectory", "Custom", '<a>'+numberofvms+'* </a>')
      }

  xmlDoc = $.parseXML( item_all_data ),
  $xml = $( xmlDoc );
  var VMParams = {'Name':'VmName', 'Location':'VmHome','UUID':'Uuid','Registered on':'RegistrationDateTime',}
return parseXMLItem(item_all_data, 'VirtualMachine', VMParams);


function parseCpuUsage(command_result) {
    //console.log(command_result)

    var cpu_usage_regex = /\d+\.\d\d% +\d+ C:[\\\w \(\)\-]+\.exe/g
    var cpu_usage = command_result.match(cpu_usage_regex) //get cpu usage % and process locations
    if (cpu_usage!== null) {
    cpu_usage = cpu_usage.slice(0,5) //get first 3 processes
    cpu_usage.unshift("_Top processes:_")
    cpu_usage = cpu_usage.join('\r\n');

    //console.log(cpu_usage)
    return cpu_usage}

  }

  var net_use_results = parseNetuse(ExtractCommandOutput(net_use))
  var ipconfig_results = parseIpconfig(ExtractCommandOutput(ipconfig))
  var cpu_usage_results = parseCpuUsage(ExtractCommandOutput(cpu_usage))

  guest_commands_results.push(ipconfig_results, net_use_results, cpu_usage_results)

  guest_commands_results=guest_commands_results.join('\r\n\n');

  return guest_commands_results
  //console.log(net_use_results)

}

function parseTimeZone(item_all_data) {
  //console.log(item_all_data)
    var timezone_regex = /<TimeZone>(.*)?<\/TimeZone>/;
    var timezone = item_all_data.match(timezone_regex)[1]
    var timediff = parseInt(timezone)
    //console.log(timediff)
    return timediff


}

function parsetoolsLog(item_all_data) {
  var last1000chars = item_all_data.slice(item_all_data.length -1000)
  if(last1000chars.match(/successfully/)){
  markBullet('tools.log','all good')}
  else if(last1000chars.match(/FatalError/)) {markBullet('tools.log','bad')}
  
  else {markBullet('tools.log','warning')}
}



//Extra functions

//
/** @description  This one appemds Mac's specs next to the Model (gets them at everymac.com)
 */
function loadMacSpecs(mac_url, mac_cpu, macelement) {

  function ExtractSpecs(allmacs, cpu, mac_element){
    var mac = allmacs.find('td:contains("'+cpu+'")').parents().eq(2).next()
     if(mac.length==0){mac = allmacs.find("table:nth-child(3)")}//if I can't parce CPU correctly, then just taking the 1st model
    var mac_type = mac.find('tbody > tr > td.detail_info > table > tbody > tr:nth-child(3) > td:nth-child(2)').text()
    var produced_from = mac.find('tbody > tr > td.detail_info > table > tbody > tr:nth-child(1) > td:nth-child(2)').text()
    var produced_till = mac.find('tbody > tr > td.detail_info > table > tbody > tr:nth-child(1) > td:nth-child(4)').text()
    var ram = mac.find('tbody > tr > td.detail_info > table > tbody > tr:nth-child(4) > td:nth-child(2)').text()
    var vram = mac.find('tbody > tr > td.detail_info > table > tbody > tr:nth-child(4) > td:nth-child(4)').text()
    var storage = mac.find ('tbody > tr > td.detail_info > table > tbody > tr:nth-child(5) > td:nth-child(2)').text()
    
    mac_element.append('</br>',
                        "Model: ", mac_type,'</br>',
                        "Storage: ", storage, '</br>',
                        "Ram:",ram,'</br>', 
                        "Vram:",vram,'</br>',
                        "Year: ", produced_from, " - ", produced_till)
}

//https://stackoverflow.com/questions/11377191/how-to-use-gm-xmlhttprequest-in-injected-code
function GetMacsModel (fetchURL, cpu, mac_element) {
        GM_xmlhttpRequest ( {
            method:     'GET',
            url:        fetchURL,
            onload:     function (responseDetails) {
                            // DO ALL RESPONSE PROCESSING HERE...
                                
                                var cool = responseDetails.responseText.match(/<center>[^$]*<\/center>/)[0]
                                //var allmacs = $('center', cool)
                                var allmacs = $(cool)
                                ExtractSpecs(allmacs, cpu, mac_element)
                            
                        }
        } );
    }

    GetMacsModel(mac_url, mac_cpu, macelement)
   
    

}

function computerModel(){

  var computer_model = $('td:contains("Computer Model")');
  if (computer_model == null){return}

  var mac_model = computer_model.next();
  try{var mac_cpu = $('#form1 > table.reportList > tbody > tr:nth-child(14) > td:nth-child(2)').text().toUpperCase().match(/ ([^ ]*) CPU/)[1]}
  catch(e){var mac_cpu = ""}
  console.log(mac_cpu)
  var mac_url = 'http://0s.mv3gk4tznvqwgltdn5wq.nblz.ru/ultimate-mac-lookup/?search_keywords='+mac_model.text()//at some point everymac banned my IP. So opening through anonymizer.
  var mac_model_linked = $('<td> <a href='+mac_url+'>'+mac_model.text()+'</a><button type="button" class="btn btn-outline-secondary" id=loadMacSpecs>Load specs</button></td>')
  mac_model.replaceWith(mac_model_linked)

  var macelement = computer_model.next();
  $('#loadMacSpecs').click(function() {
    loadMacSpecs(mac_url, mac_cpu, macelement)
    this.remove()
  });
 
}

/** @description  Appends customer time im addition to server's local
 */
function fixTime(timediff, time = '') {
    var gmt_string = $( ".reportList:first tbody:first tr:nth-child(3) script" ).text()
    //console.log(gmt_string)
    var gmt_regex = /\(\"([\d\-T\:]*)\"\)/
    var gmt_substr = gmt_string.match(gmt_regex)[1];
  ///if time is not defined 
    var gmt_time = Date.parse(gmt_substr);
    if (time!=''){ 
      gmt_time = parseInt(time)
    }
    //console.log(gmt_time)
    var time_seconds = gmt_time/1000;
    var correct_time = new Date(0);
   //console.log(correct_time)
    //console.log(timediff)
    correct_time.setUTCSeconds(time_seconds+timediff)
    return correct_time.toString().substring(4,24)
}

//Adjusts time, converts values etc. Where for example we get bytes but want to render gb/tb
function adjustSpec(spec_value, adjustment){
  switch (adjustment) { 
      case 'time': 
      spec_value = fixTime(timediff, spec_value)
          break;
      case 'bytes': 
      console.log("it's bytes!!!")
      spec_value = humanFileSize(spec_value, true);
      break;
      case 'hddtype': 
      var hddtypes = {0: 'IDE', 1: 'SCSI', 2: 'SATA', 3: 'NVMe'}
      spec_value = hddtypes[spec_value]
      break;
      case 'mbytes':
      spec_value = humanFileSize(spec_value*1024*1024, false)
      break;
      case 'appleMbytes':
      spec_value = humanFileSize(spec_value*1024*1024, true)//because for Apple kilo is actually 1000 :) 
}


return spec_value}

//https://stackoverflow.com/users/65387/mpen
function humanFileSize(bytes, si) {
  var thresh = si ? 1000 : 1024;
  if(Math.abs(bytes) < thresh) {
      return bytes + ' B';
  }
  var units = si
      ? ['kB','MB','GB','TB','PB','EB','ZB','YB']
      : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];
  var u = -1;
  do {
      bytes /= thresh;
      ++u;
  } while(Math.abs(bytes) >= thresh && u < units.length - 1);
  return bytes.toFixed(1)+' '+units[u];
}

/** @description  Converst all links to attached screenshots to clickable thumbnails
 */
function screenshots(){
  function CreateScreenshot(id, url){
    $.get(url, function (data) {
      var img = ( $('pre > img', data).eq(0).attr('src'))
      AddScreenshotHtml(id, img)
  })
}

  function AddScreenshotHtml(id, image){
  var mypiclink =     '<a href="#img'+id+'">\
    <img src='+image+' class="thumbnail">\
  </a>'
  
  var mypic =   '<a href="#_" class="lightbox" id="img'+id+'">\
    <img src='+image+'>\
  </a>'
  $(mypiclink).appendTo('.container')
  
  $(mypic).appendTo('form')
    
}
var screens_el = $('span:contains("Screenshots")').next()
screens_el.clone().appendTo('.container') 
var screenID = 1
screens_el.find("a").each(function() {
  CreateScreenshot(screenID, this.href)
  screenID++

  })
}

/** @description  Appends Bug IDs to found signatures (if a signature has a bug)
 */
function signatureBugs(){

  function GetBugId(signatureObject){
    var loading_bug_message = $('</br><span id="loadingBug">Loading bug info...</span></br>')
    loading_bug_message.insertAfter(signatureObject)
    $.get(signatureObject.href, function (data) {

      var bug = ($('div.headerMain > h2:nth-child(6) > span > a', data)).clone()
      

      if (bug.length!=0){
        bug.append("</br>")
        bug.insertAfter(signatureObject)
        $('</br><span>Bug: </span>').insertAfter(signatureObject)}
      else {
        $('<a>No bug yet </br></a>').insertAfter(signatureObject)
        $('</br><span>Bug: </span>').insertAfter(signatureObject)
      }
      loading_bug_message.remove()
      
  })
}

$('a[href*="Signature"]').each(function() {
  $(this).appendTo(".container")
  GetBugId(this)
  })

}

/** @description  Adds icon before a bullet that signifies that contend has been checked and evaluated, 
 * Example with LoadedDrivers: they can be either OK (e.g. when only apple and prl kexts are loaded), 
 * semi-ok (e.g. when some extra kexts are loaded) 
 * or bad (e.g. LittleSnitch or Hackintosh)
 * @param {string} bullet_name Actual name (text in <div></div> ) of the bullet.
 * @param {string} color What color to mark the aforementioned bullet. For now it's 'all good', 'warning','bad'
 * if color is set to 'custom, then the appended element is defined by
 * @param {string} html if color is 'custom', this defines element to be appended as a mark
 */
function markBullet(bullet_name, color,html){  
  
if (color.match(/^no_/))
{console.log(color)
  var img = '<img src="'+icons[color.match(/^no_(.*)/)[1]]+'" style= "display: linline; height: 1.5em; filter: saturate(0%);"> '
}
else
{
  var img = '<img src="'+icons[color]+'" title = "'+color+'" style= "display: linline; height: 1.5em";> '
}
  
  
  if (color=='Custom'){
    img = html
  }
  if(bullet_name=='this'){return img}
  else
  {$('.container > div > a:contains("'+bullet_name+'")').prepend($(img))}}


//all report items for which bullets will be constructed in the bullet container
const pinned_items = ["CurrentVm", "LoadedDrivers", 'AllProcesses','GuestCommands','GuestOs',"MountInfo", 'HostInfo', 'ClientProxyInfo', 'AdvancedVmInfo', 'MoreHostInfo', 'VmDirectory', 'NetConfig'];
//report log links that will be cloned to the bullet container
const pinned_logs = ["parallels-system.log","system.log","vm.log","dmesg.log","tools.log"];
//pinned_items that will have a collapsible with parsed info
const pinned_collapsibles = ["CurrentVm", "LoadedDrivers", 'AllProcesses','GuestCommands','GuestOs',"MountInfo", 'HostInfo', 'AdvancedVmInfo', 'MoreHostInfo', 'VmDirectory', 'NetConfig'];

const process_immediately = ['CurrentVm','LoadedDrivers','tools.log','GuestOs','GuestCommands','AllProcesses','AdvancedVmInfo','MoreHostInfo','VmDirectory','ClientProxyInfo']

const bad_kexts = ['as.vit9696.Lilu',
'as.vit9696.WhateverGreen',
'as.lvs1974.NvidiaGraphicsFixup',
'org.netkas.driver.FakeSMC',
'as.vit9696.AppleALC',
'org.vulgo.NoVPAJpeg',
'as.vit9696.WhateverGreen',
'org.hwsensors.driver.CPUSensors',
'com.parrotgeek.SIPManager',
'AAA.LoadEarly.MouSSE',
'com.usboverdrive.driver.hid',
'com.squirrels.airparrot.framebuffer',
'com.squirrels.driver.AirParrotSpeakers',
'com.github.osxfuse.filesystems.osxfuse']

const vpn_kexts = ['at.obdev.nke.LittleSnitch',]


//Filling bullet content with appropriate data.
var tries={"tries":3}//When "get" request fails, BulletData() reruns itself (see $.ajaxSetup). This var stores number of tries left for each item.
// If item is not present in this dict, it's added with counter set to 3 and then goes down with each run of the function. 

//needed for correting times for time zone
var timediff

var current_url = window.location.href;
var report_id = current_url.match(/\d{7,9}/);


function doReportOverview() {
  
  upper_menu();
  screenshots();
  BulletData('TimeZone','time');
  computerModel();
  signatureBugs();
  
      for (var item in process_immediately){
        console.log(process_immediately[item]+' ran right away.')
            BulletData(process_immediately[item])
        
      }
      $(".btn").click(function(){
      $(this).text(function(i,old){
        return old=='➤' ?  '▼' : '➤';//took it here: https://stackoverflow.com/questions/16224636/twitter-bootstrap-collapse-change-display-of-toggle-button
    })})
  
      $(".btn").one("click", (function() {
          var item_id = this.id.replace("btn_", "");
          //console.log(item_id)
          if(process_immediately.indexOf(item_id) == -1) {BulletData(item_id)} 
      }));
  }

window.addEventListener("load", function(event) {
  if (curr_url.match(/Report.aspx\?ReportId=/)){
    doReportOverview()
  }
});


const icons = {
  'printers':'https://image.flaticon.com/icons/svg/2489/2489670.svg',
  'all good':'https://image.flaticon.com/icons/png/128/1828/1828520.png',
  'warning' : 'https://image.flaticon.com/icons/svg/497/497738.svg',
  'bad': 'https://image.flaticon.com/icons/svg/1672/1672451.svg',
  'headless':'https://image.flaticon.com/icons/png/128/1089/1089503.png',
  'not headless':'https://cdn0.iconfinder.com/data/icons/people-and-lifestyle-1/64/people-male-man-head-512.png',
'isolated':'https://cdn4.iconfinder.com/data/icons/real-estate-1/512/prison-512.png',
'flags':'https://cdn3.iconfinder.com/data/icons/seo-and-digital-marketing-5-3/48/211-512.png',
'nosnapshots':'https://image.flaticon.com/icons/svg/2803/2803253.svg',
'snapshots':'https://image.flaticon.com/icons/svg/502/502559.svg',
'screens':'https://getdrawings.com/free-icon/desktop-pc-icon-54.png',
'vms':'https://insmac.org/uploads/posts/2017-08/1503641514_parallels.png',
'vpn':'https://image.flaticon.com/icons/png/128/1451/1451546.png',
'external drive':"http://www.icons101.com/icon_png/size_32/id_81556/External_Drive.png",
'copied vm':'https://www.subrosasoft.com/wp-content/uploads/2016/03/DiskCopyIcon.png',
'AppleHV':'https://cdn2.iconfinder.com/data/icons/metro-uinvert-dock/256/OS_Apple.png',
'Nested':'https://cdn2.iconfinder.com/data/icons/russia-8/64/matryoshka-doll-russian-mother-russia-512.png',
'splitted':'https://cdn4.iconfinder.com/data/icons/web-and-mobile-ui/24/UI-03-512.png',
'trim':'https://i.ibb.co/XpVhPZ9/unnamed.png',
'webcam':'https://image.flaticon.com/icons/png/128/179/179879.png',
'gpu':"https://image.flaticon.com/icons/svg/2302/2302939.svg",
'ACL':'https://findicons.com/files/icons/2796/metro_uinvert_dock/128/security_denied.png',
'fullscreen':'https://cdn3.iconfinder.com/data/icons/mos-basic-user-interface-pack/24/aspect_rasio-512.png'}
