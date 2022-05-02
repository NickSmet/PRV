
function parseLsLr(raw) {
    let lsFileRegex = /(?<permissions>[\w\-\+]{9,11}@?) +(?<hardLinks>\d+) +(?<ownerName>[\(\)\_\{\}\-\w\.]+) +(?<owneGroup>[\w\\]+) +(?<type>[\w\-]+)? +(?<size>\d+) +(?<modified>(?<month>\w{3}) +(?<day>\d{1,2}) +(?<time>(\d\d\:){1,2}\d\d)? (?<year>\d{4} )?)(?<fileName>[\(\)\_ \{\}\-\w\.]+)/g
    let lsFolderRegex = /(\/[\w ]+\.pvm)?\/(?<location>[^:\n]*):$/gm //the .pvm part is for cases when showing list of files inside .pvm

    let bundleContents = ''

    let bundleLines = raw.split('\n')

    for (let index = 0; index < bundleLines.length; index++) {

        const line = bundleLines[index];
        let folderProperties = lsFolderRegex.exec(line)?.groups
        let filesProperties = lsFileRegex.exec(line)?.groups


        if (line.match(lsFileRegex) && filesProperties.fileName != "." && filesProperties.fileName != "..") {
            if (filesProperties.ownerName.match(/root|\_unknown/)) { filesProperties.ownerName = `<b><font color="red">${filesProperties.ownerName}</font></b>` }
            bundleContents += `${humanFileSize(filesProperties.size)} <b>${filesProperties.fileName}</b> <span style="color: #999999;">${filesProperties.permissions} ${filesProperties.ownerName} ${filesProperties.modified}</span>\n `
        } else
        if (folderProperties) {
            folderLocation = folderProperties.location


            //makind output look more like a folder structure
            if (folderLocation.match(/\//g)) {
                folderLocationArr = folderLocation.split("\/")
                folderLocation = ''
                for (let index = 0; index < folderLocationArr.length; index++) {
                    const folder = folderLocationArr[index];
                    folderLocation += "\n" + " ".repeat(index * 5) + "└──" + folder
                }
            }
            bundleContents += `\n<b>${folderLocation}</b>:</span>\n`
        }

    }
    return bundleContents
}

function parseCurrentVm(CurrentVmData) {

    let vmObj = strToXmlToJson(CurrentVmData).ParallelsVirtualMachine

    niceReportObj.currentVM = vmObj


    let ParamVMHDDs = { 'Location': 'SystemName', 'Virtual Size': 'Size', 'Actual Size': 'SizeOnDisk', 'Interface': 'InterfaceType', 'Splitted': 'Splitted', 'Trim': 'OnlineCompactMode', 'Expanding': 'DiskType' }
    let AdjustsVMHDDs = { 'Interface': 'hddtype', 'Actual Size': 'appleMbytes', 'Virtual Size': 'mbytes' }
    let iconVMHDDs = icons.hdds

    if(!vmObj.Hardware.Hdd){markBullet('CurrentVm','bad','','No HDD attached to VM!')}

    let VMHDDs_data = parseJsonItem(vmObj.Hardware.Hdd, ParamVMHDDs, AdjustsVMHDDs)
    //var VMHDDs_data = parseXMLItem (item_all_data,element = "Hdd",ParamVMHDDs,AdjustsVMHDDs)

    let VMHDDs = buildNodeBullet('HDDs', 'Custom', VMHDDs_data, iconVMHDDs)

    let ParamVMCDs = { 'Location': 'SystemName', 'Interface': 'InterfaceType' }
    let AdjustsVMCDs = { 'Interface': 'hddtype' }
    let iconVMCDs = icons.cd
    let CdExclude = { 'Connected': '0' }

    let VMCDs_data = parseJsonItem(vmObj.Hardware.CdRom, ParamVMCDs, AdjustsVMCDs, CdExclude)
    //var VMCDs_data = parseXMLItem (item_all_data,element = "Hdd",ParamVMCDs,AdjustsVMCDs)

    let VMCDs = buildNodeBullet('CDs', 'Custom', VMCDs_data, iconVMCDs)

    let ParamVMNETWORKs = { 'Type': 'AdapterType', 'Connected':'Connected' , 'Mode': 'EmulatedType', 'Adapter name': 'AdapterName', "Mac": 'MAC', 'Conditioner': 'LinkRateLimit.Enable'}
    let AdjustsVMNETWORKs = { 'Type': 'networkAdapter', 'Mode': 'networkMode', 'Mac': 'networkMac','Connected':'networkConnected' }
    let iconVMNETWORKs = icons.networkAdapter

    //var VMNETWORKs_data = parseXMLItem (item_all_data, element = "NetworkAdapter", ParamVMNETWORKs, AdjustsVMNETWORKs)
    let networkAdapters = vmObj.Hardware.NetworkAdapter
    let VMNETWORKs_data = parseJsonItem(networkAdapters, ParamVMNETWORKs, AdjustsVMNETWORKs)


    if(VMNETWORKs_data){
    if(VMNETWORKs_data.match(/<u>Connected<\/u>: <b><u style="color:red">0!<\/u><\/b>/)){iconVMNETWORKs=icons.adapterNotConnected}}

    let VMNETWORKs = buildNodeBullet('Networks', 'Custom', VMNETWORKs_data, iconVMNETWORKs)


    if (VMNETWORKs.match('Shared')) { markBullet('CurrentVm', 'shared') }
    if (VMNETWORKs.match('Bridged')) { markBullet('CurrentVm', 'bridged') }

    let travelOptions = vmObj.Settings.TravelOptions

    let travelModeObj =
        {'State': function(){return travelOptions.Enabled == '0' ? 'Off' : 'On'},
        Enter: function(){
            return travelOptions.Condition.Enter == '0' ? 'Never'
                : travelOptions.Condition.Enter == '1' ? 'Always when on battery'
                : `On battery below ${travelOptions.Condition.EnterBetteryThreshold}%`},
        Exit: function(){return travelOptions.Condition.Quit == 0 ? 'Never'
                : 'On Connecting to Battery'}}

    let travelModeData = `<u>Travel Mode</u>: ${travelModeObj.State()}\n<u>Enter</u>: ${travelModeObj.Enter()}\n<u>Exit</u>: ${travelModeObj.Exit()}`

    if(travelModeObj.State()==='On'){markBullet('CurrentVm', icons.travelMode,'','Travel Mode')}

    let TravelMode = buildNodeBullet('Travel Mode', 'Custom', travelModeData, 'travelMode')

    let ParamVMUSBs = { 'Name': 'SystemName', 'Last connected': 'Timestamp' }
    let AdjustsVMUSBs = { 'Last connected': 'time' }
    let iconVMUSBs = icons['usb']

    usbObj = vmObj.Hardware.UsbConnectHistory?.USBPort
    let VMUSBs_data = parseJsonItem(usbObj, ParamVMUSBs, AdjustsVMUSBs)
    //var VMUSBs_data = parseXMLItem ( item_all_data, element = "USBPort", ParamVMUSBs,AdjustsVMUSBs)
    let VMUSBs = buildNodeBullet('USBs', 'Custom', VMUSBs_data, iconVMUSBs)

    let currentVmSpecs = {
        'Section5': 'Startup/Shutdown',
        'Start Automatically': vmObj.Settings.Startup.AutoStart,
        'Startup View' : vmObj.Settings.Startup.WindowMode,
        'Pause After...': vmObj.Settings.Tools.Coherence.PauseIdleVM,
        'Rollback Mode': vmObj.Settings.Runtime.UndoDisks,
        'On Mac Shutdown': vmObj.Settings.Shutdown.AutoStop,
        'On VM Shutdown': vmObj.Settings.Runtime.ActionOnStop,
        'On Window close': vmObj.Settings.Shutdown.OnVmWindowClose,
        'Reclaim disk space on shutdown': vmObj.Settings.Shutdown.ReclaimDiskSpace,

        'Section0': 'General',

        'VM Name': vmObj.Identification.VmName,
        'PVM Location': vmObj.Identification.VmHome?.replace(/\/config.pvsp?/, ''),
        'Creation date': vmObj.Identification.VmCreationDate,
        'This VM UUID': vmObj.Identification.VmUuid,
        'Source   UUID': vmObj.Identification.SourceVmUuid,

        'Section1': 'Hardware',
        'Cpus': vmObj.Hardware.Cpu.Number,
        'Ram': vmObj.Hardware.Memory.RAM,
        'VRam': vmObj.Hardware.Video.VideoMemorySize,
        'Resource Quota': vmObj.Settings.Runtime.ResourceQuota,
        'Video Mode': parseInt(vmObj.Hardware.Video.EnableHiResDrawing) + parseInt(vmObj.Hardware.Video.NativeScalingInGuest),
        'Scale To Fit Screen': vmObj.Settings.Runtime.FullScreen.ScaleViewMode,
        'All Disaplays in Full Screen': vmObj.Settings.Runtime.FullScreen.UseAllDisplays,
        '3D Acceleration': vmObj.Hardware.Video.Enable3DAcceleration,
        'Keyboard': vmObj.Settings.Runtime.OptimizeModifiers,
        'Mouse': parseInt(vmObj.Settings.Tools.SmartMouse.Enabled) + parseInt(vmObj.Settings.Tools.MouseSync.Enabled),
        //'Lan Adapter': $xml.find('AdapterType').text(),
        //'Networks': $xml.find('NetworkAdapter > EmulatedType').text(),
        'Subbullet3': VMNETWORKs,
        'Subbullet2': VMHDDs,
        'Subbullet4': VMCDs,

        'Hypervisor': vmObj.Settings.Runtime.HypervisorType,
        'Adaptive Hypervisor': vmObj.Settings.Runtime.EnableAdaptiveHypervisor,
        'Nested Virtualization': vmObj.Hardware.Cpu.VirtualizedHV,

        'Section2': 'Sharing',
        'Isolated': vmObj.Settings.Tools.IsolatedVm,
        'Shared profile': vmObj.Settings.Tools.SharedProfile.Enabled,
        'Share Host Cloud': vmObj.Settings.Tools.SharedFolders.HostSharing.SharedCloud,
        'Map Mac Volumes': vmObj.Settings.Tools.SharedVolumes.Enabled,
        'Access Guest from Host': vmObj.Settings.Tools.SharedFolders.GuestSharing.Enabled,
        'Share OneDrive with Host': vmObj.Settings.Tools.SharedFolders.GuestSharing.AutoMountCloudDrives,
        'Share Guest Netw. Drives': vmObj.Settings.Tools.SharedFolders.GuestSharing.AutoMountNetworkDrives,
        'Share Guest Extern. Drives': vmObj.Settings.Tools.SharedFolders.GuestSharing.ShareRemovableDrives,
        'Shared Guest Apps': vmObj.Settings.Tools.SharedApplications.FromWinToMac,
        'Shared Host Apps': vmObj.Settings.Tools.SharedApplications.FromMacToWin,

        // 'Win>Mac Sharing': FromWinToMac, NEED TO REWORK SHARING
        // 'Mac>Win Sharing': FromMacToWin,
        'Clipboard': vmObj.Settings.Tools.ClipboardSync.Enabled,
        'Time Sync': vmObj.Settings.Tools.TimeSync.Enabled,
        'Section3': 'Other',
        'Smart Guard': vmObj.Settings.Autoprotect.Enabled,
        'Opt.TimeMachine': vmObj.Settings.Autoprotect.Schema,
        '<b>Boot Flags</b>': vmObj.Settings.Runtime.SystemFlags,
        'Graphic Switching': vmObj.Settings.Runtime.OptimizePowerConsumptionMode,
        'Section': 'Devices',
        'Share Host Printers': vmObj.Settings.VirtualPrintersInfo.UseHostPrinters,
        'Sync Default Printer': vmObj.Settings.VirtualPrintersInfo.SyncDefaultPrinter,
        'Show Page Setup': vmObj.Settings.VirtualPrintersInfo.ShowHostPrinterUI,
        'Shared Camera': vmObj.Settings.SharedCamera.Enabled,


        'Subbullet5': TravelMode,
        'Shared CCID': vmObj.Settings.SharedCCID?.Enabled,
        'Shared Bluetooth': vmObj.Settings.SharedBluetooth.Enabled,
        'USB 3.0': vmObj.Settings.UsbController.XhcEnabled,
        'TPM': vmObj.Hardware.TpmChip?.Type,
        'Subbullet1': VMUSBs
    };

    let specs_to_name = {
        'Lan Adapter': { 0: 'Legacy', 1: 'RealTek RTL8029AS', 2: 'Intel(R) PRO/1000MT', 3: 'Virtio', 4: 'Intel(R) Gigabit CT (82574l)' },
        'Network': { 1: 'Shared', 2: 'Bridged' },
        'Opt.TimeMachine': { 1: 'On', 2: 'Off' },
        'Graphic Switching': { 1: 'Off', 0: 'On' },
        'Hypervisor': { 0: 'Parallels', 1: 'Apple' },
        'Video Mode': { 0: 'Scaled', 1: 'Best for Retina', 2: 'Best for external displays' },
        'Scale To Fit Screen': { 0: 'Off', 1: 'Auto', 2: 'Keep ratio', 3: 'Stretch' },
        'Keyboard': { 0: 'Don\'t optimize for games', 1: 'Optimize for games', 2: 'WTF?', 3: 'Auto' },
        'Mouse': { 0: 'Optimize for games', 1: 'Don\'t optimize for games', 2: 'Auto', 3: 'WTF?' },
        'On Window close' : {1 : 'Suspend', 4 : 'ShutDown', 0 : 'Force to stop', 5 : 'Keep running in background', 2 : 'Ask me what to do' },
        'On Mac Shutdown' : {0 : 'Stop', 1 : 'Suspend', 3 : 'Shut down'},
        'On VM Shutdown' : {0 : 'Keep window open', 1 : 'Close window', 3 : 'Quit Parallels Desktop'},
        'Startup View' : {0 : 'Same as last time', 1 : 'Window', 2 : 'Full Screen', 3 : 'Coherence', 4 : 'Picture in Picture', 5 : 'Headless'},
        'Start Automatically' : {0 : 'Never', 1 : 'When Mac Starts', 2 : '' ,
            3 : `When Parallels Desktop starts, after ${vmObj.Settings.Startup.AutoStartDelay} sec.`,
            4 : `When window opens, after ${vmObj.Settings.Startup.AutoStartDelay} sec.`,
            5: `When user logs in, after ${vmObj.Settings.Startup.AutoStartDelay} sec.`},

        'Pause After...':{0:'Disabled', 1: (vmObj.Settings.Tools.Coherence.PauseIdleVMTimeout) ? `After ${vmObj.Settings.Tools.Coherence.PauseIdleVMTimeout} sec.` : 'Yes'}



    }

    if (VMHDDs.match(/<u>Expanding<\/u>: 0/) && VMHDDs.match(/<u>Actual Size<\/u>: 0 B/)) { markBullet('CurrentVm', 'Boot Camp') }
    else {//if it's Boot Camp, we don't care about the rest of vHDD info.
        if (VMHDDs.match(/<u>Trim<\/u>: 1/)) { markBullet('CurrentVm', 'trim') }
        if (VMHDDs.match(/<u>Splitted<\/u>: 1/)) { markBullet('CurrentVm', 'splitted') }
        if (VMHDDs.match(/<u>Expanding<\/u>: 0/)) { markBullet('CurrentVm', icons["plain vHDD"]) }
    }

    let externalVhddRegex = RegExp('(<u>Location</u>: ((?!' + currentVmSpecs['PVM Location']?.replace(/\(/g, "\\(").replace(/\)/g, "\\)") + ').)+)', 'gmi') //checks if there are vHDDs with "Location" outside of PVM

    if (VMHDDs.match(externalVhddRegex) && bigReportObj.ParallelsProblemReport.ProductName != 'Parallels Desktop for Chrome OS') { markBullet('CurrentVm', icons["external vHDD"]) }
    console.log(externalVhddRegex);
    console.log(VMHDDs);
    if(vmObj.Settings.Runtime.UndoDisks=='1'){markBullet('CurrentVm', icons.rollbackMode, '','Rollback Mode')}

    function markConditioner(adapter) {

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


if(networkAdapters) {
    if (Array.isArray(networkAdapters)) {
        for (key in networkAdapters) {
            let adapter = networkAdapters[key]
            markConditioner(adapter)
        }
    }
    else { markConditioner(networkAdapters) }
}
    // if(VMNETWORKs.match(/<u>Conditioner<\/u>: 1/)){

    //   markBullet('CurrentVm', icons["network conditioner"])
    // }


    if (bigReportObj.ParallelsProblemReport.ProductName == 'Parallels Desktop for Chrome OS' && !currentVmSpecs["VM Name"].match(/PvmDefault/i)) { markBullet('CurrentVm', 'not PvmDefault') }

    let all_specs = '';

    //check if VM ram is not more than 1/2 of Host.
    let hostram = reportus ? $("body > table:nth-child(7) > tbody > tr:nth-child(14) > td:nth-child(2)") : $("table.reportList > tbody > tr:nth-child(17) > td:nth-child(2)").text()

    let vmram = currentVmSpecs['Ram']

    if (vmram > hostram / 2 && hostram - vmram < 6144) {
        currentVmSpecs['Ram'] += '<b style="color:red">!!!!! Too Much</b>',
            markBullet("CurrentVm", 'bad')
    }
    if ((vmram % 256) != 0) {
        currentVmSpecs['Ram'] += '<b style="color:orange">! Uneven amount </b>',
            markBullet("CurrentVm", 'warning')
    }

    //Setting correct value for vram
    if (currentVmSpecs['VRam'] == "0") { currentVmSpecs['VRam'] = "Auto" }

    //Identifying if VM was copied
    if (currentVmSpecs['Source   UUID'] != currentVmSpecs['This VM UUID']) { markBullet("CurrentVm", 'copied vm') }

    //Identifying if VM is on an external volumes
    if (currentVmSpecs['PVM Location'].match(/^\/Volumes/)) { markBullet("CurrentVm", "external drive") }

    //Identifying AppleHV and marking bullet accordingly
    if (currentVmSpecs['Hypervisor'] == 1) { markBullet("CurrentVm", "AppleHV") }

    //Identifying Nested Virtualization and marking bullet accordingly
    if (currentVmSpecs['Nested Virtualization'] == 1) { markBullet("CurrentVm", "Nested") }

    //Identifying if headless and marking bullet accordingly
    if (currentVmSpecs['Start Automatically'] == 5 || currentVmSpecs['Start Automatically'] == 1 || currentVmSpecs['On Window close'] == 5) { markBullet("CurrentVm", "headless") }
    else {//markBullet("CurrentVm",'not headless')
    }

    //Identifying if Timesync is off
    if (currentVmSpecs['Time Sync'] == 0) { markBullet("CurrentVm", "noTimeSync") }

    //Identifying if Isolated and marking bullet accordingly
    if (currentVmSpecs['Isolated'] == '1') { markBullet("CurrentVm", "isolated") }

    //Identifying if has bootflags and marking bullet accordingly
    if (currentVmSpecs['<b>Boot Flags</b>'] != '') { markBullet("CurrentVm", "flags") }



    if (currentVmSpecs['TPM'] != 0 && currentVmSpecs['TPM']) {
        markBullet("CurrentVm", icons.TPM)
    }

    if (vmObj.Identification.LinkedVmUuid != '') { markBullet('CurrentVm', icons["linked clone"]) }

    if (currentVmSpecs['Smart Guard'] == 1) { markBullet("CurrentVm", "smart guard") }


    if (currentVmSpecs['Resource Quota'] < 100) { markBullet("CurrentVm", "resource quota") }

    keysWithIcons = {
        'Share Host Printers': 'printers',
        'Scale To Fit Screen': 'fullscreen',
        'Smart Guard': 'smart guard',
        'Keyboard': 'keyboard',
        'Mouse': 'mouse',
        'Share Guest Extern. Drives': 'usb',
        'Share Guest Netw. Drives': 'network folder',
        'Share OneDrive with Host': 'onedrive'
    }


    for (var key in currentVmSpecs) {//я немного запутался, но оно рабоатет
        let spec
        let specName = key
        let specValue = currentVmSpecs[key] || 0


        if (key in specs_to_name) {
            specValue = specs_to_name[key][specValue]
            spec = '<u>' + specName + '</u>' + ': ' + specValue + '\n';
        }

        if (key in keysWithIcons) {
            icon = markBullet('returnIcon', keysWithIcons[key])
            specName = icon.concat(specName)
        }


        if (key.match('Section')) {
            spec = `\n<strong>⫸${specValue}⫷</strong>\n`
        } else if (key.match('Subbullet')) {
            spec = specValue
        } else {
            spec = '<u>' + specName + '</u>' + ': ' + specValue + '\n';
        }


        all_specs = all_specs + spec
    }



    return all_specs;


}


function parseNetConfig(item_all_data) {

    let xmlDoc = $.parseXML(item_all_data);
    let jsonObj = x2js.xml2json(xmlDoc);

    bigReportObj['ParallelsProblemReport']['NetConfig'] = jsonObj

    let HostInfo = strToXmlToJson(bigReportObj['ParallelsProblemReport']['HostInfo'])



    let netCfgObj = jsonObj.ParallelsNetworkConfig

    let kextless = netCfgObj.UseKextless

    let macOS = HostInfo.ParallelsHostInfo.OsVersion.Major


    networkParams = {
        'Name': 'Description',
        'DHCP IP': 'HostOnlyNetwork.DhcpIPAddress',
        'Net Mask': 'HostOnlyNetwork.IPNetMask',
        'Host IP': 'HostOnlyNetwork.HostIPAddress',
        'DHCP Enabled': 'HostOnlyNetwork.DHCPServer.Enabled',
        'IPv6 DHCP Ehabled': 'HostOnlyNetwork.DHCPv6Server.Enabled'
    }
    let networkExclude = { 'NetworkType': 0 }
    let network = parseJsonItem(netCfgObj.VirtualNetworks.VirtualNetwork, networkParams, {}, networkExclude, 'pd.netConfig')

    

    if(!network.match('Host Only Networking')||!network.match('Shared Networking')){markBullet('NetConfig','noNetwork','','Something missing!')}//good enough

    if (macOS < 11) { return network }

    network = "<u>Kextless</u>: " + kextless + "\n\n" + network

    let kextlessMark


    switch (kextless) {
        case '1':
        case '-1':
        case undefined:
            kextlessMark = "kextless"
            break
        case '0':
            kextlessMark = "kext"
            break
        default:
            kextlessMark = 'warning'

    }

    markBullet("NetConfig", kextlessMark)

    return network;
}

function parseClientInfo(item_all_data) {

    let clientSettings = item_all_data.ClientInfo.ClientSettings.split('\n')

    if(!clientSettings){return "Nothing."}

    let accountRegex = /(AccountConsentGroup|AccountLocaleUpdated)(\/| -- )(?<email>[\w @.]+)/
    let pdPreferencesRegex = /Application preferences\/(?<prefName>[\w ]+) \-\- (?<prefValue>[\d\w]+)/
    let sharedAppsPrefsRegex = /Shared Applications\/(?<uuid>{[\w\d\-]+})\/(?<prefName>[\w ]+) -- (?<prefValue>[\w\d]+)/

    let account
    let pdPrefs = ''
    let sharedAppsPrefs = ''


    clientSettings.forEach((line)=>{
        account = account || accountRegex.exec(clientSettings)?.groups?.email
        pdPrefs += pdPreferencesRegex.exec(line)?
            `${pdPreferencesRegex.exec(line)?.groups.prefName}: ${pdPreferencesRegex.exec(line)?.groups.prefValue}\n` : ''

        if(sharedAppsPrefsRegex.exec(line)){
            let uuid = sharedAppsPrefsRegex.exec(line)?.groups.uuid

            let vm = niceReportObj.getVmName(uuid)

            let prefName = sharedAppsPrefsRegex.exec(line)?.groups.prefName
            let prefValue = sharedAppsPrefsRegex.exec(line)?.groups.prefValue

            sharedAppsPrefs += `<u>VM</u>: ${vm}\n<u>${prefName}</u>: ${prefValue}\n`
        }
    })




   return `<u><b>Account</b></u>: ${account}\n\n<u><b>PD Preferences</b></u>:\n${pdPrefs}\n<u><b>Shared Apps Prefs</b></u>:\n${sharedAppsPrefs}`


}

function parseClientProxyInfo(item_all_data) {

    proxies_regex = /\<dictionary\> {[^}]*}([^}]*)}/gm

    let proxies = item_all_data.match(proxies_regex) ? item_all_data.match(proxies_regex)[0] : ''

    if (proxies.match(/HTTPEnable : 1/)) { markBullet("ClientProxyInfo", "bad") } else { markBullet("ClientProxyInfo", 'all good') }


    return;

}

function parseAdvancedVmInfo(item_all_data) {


    
    if(typeof item_all_data!='string'){
        snapshotsString = item_all_data.AdvancedVmInfo['Snapshots']
        
        item_all_data=JSON.stringify(item_all_data).escapeSpecialChars()
    }
   
    let snapshots

    //Here we're just fixing the XML structure. For some resong for AdvancedVmInfo it's a bit off. Need to clean this up later.
    regex1 = /<\/AdvancedVmInfo[^>]*>\n<\/AdvancedVmInfo>/gm
    regex2 = /(<ParallelsSavedStates>|<\/DiskInfo>|<\/Hdd>)/gm
    regex3 = /(<DiskInfo>|<Hdd[^>]*>)/gm
    regex4 = /<AdvancedVmInfo[^>]*>\n *<AdvancedVmInfo[^>]*>/gm
    regex5 = /<\?xml version='1\.0' encoding='UTF-8'\?>/
    regex6 = /<Description><\!\[CDATA\[\]\]>/
    regex7 = /<SavedStateItem[^>]*?guid=\"\"[^>]*?>/
    regex8 = /<\n/

    item_all_data = item_all_data.replace(regex1, '</AdvancedVmInfo>');
    item_all_data = item_all_data.replace(regex2, "")
    item_all_data = item_all_data.replace(regex3, "")
    item_all_data = item_all_data.replace(regex4, '<AdvancedVmInfo>')
    item_all_data = item_all_data.replace(regex5, '')
    item_all_data = item_all_data.replace(regex6, '')
    if(reportus){item_all_data = item_all_data.replace(regex7, '')}
    item_all_data = item_all_data.replace(regex8, '')

    var bundleData = parseLsLr(item_all_data)

    if(!item_all_data.match(/^<AdvancedVmInfo>/)) {item_all_data = '<AdvancedVmInfo>'+item_all_data}

    //console.log(item_all_data);

    let AdvancedVmInfoContents = ''

    if (item_all_data.match(/writeattr/)) {
        markBullet('AdvancedVmInfo', icons.ACL)
    }

    if (item_all_data.match(/Operation="DeleteSnaphot"/)) {
        markBullet('AdvancedVmInfo', icons.bad,'','Operation=DeleteSnaphot')
    }

    if (item_all_data.match(/ root |\_unknown/)) {
        markBullet('AdvancedVmInfo', 'root or unknown owner')
    }


    console.log(bundleData);
    
    if (bundleData.length>1 && bundleData.match(/860e329aab41}\.hds/)==null) {
        console.log("WHAAAAA");
        markBullet('AdvancedVmInfo', 'bad',"","Main '860e329aab41}.hds' snapshot missing!")
    }
    
    let number_of_snapshots = !item_all_data.match(/SavedStateItem/g) ? 0 : reportus ? (item_all_data.match(/SavedStateItem/g).length / 2 ) : item_all_data.match(/SavedStateItem/g).length / 2 - 1;
   
    if (number_of_snapshots < 1) {
        markBullet("AdvancedVmInfo", "no_snapshots")
        AdvancedVmInfoContents += "No snapshots\n"
    } else {
        markBullet("AdvancedVmInfo", "snapshots")
        markBullet("AdvancedVmInfo", "CustomHtml", '<a>' + number_of_snapshots + '* </a>')
        let snapshotList = {
            'Name': 'Name',
            'Created on': 'DateTime'
        }



        snapshots = parseXMLItem(item_all_data, "SavedStateItem", snapshotList)

        
        let snapshotBullet = buildNodeBullet('Snapshots', 'Custom', snapshots, icons['snapshots'])
        AdvancedVmInfoContents += snapshotBullet
    }



    let bundleBullet = buildNodeBullet('PVM Bundle', 'Custom', bundleData, icons['pvm'])
    AdvancedVmInfoContents += bundleBullet

    return AdvancedVmInfoContents;


}

function parseHostInfo(item_all_data) {
    //mention(item_all_data)


    let ParamUSBs = { 'Name': 'Name', 'UUID': 'Uuid' }
    let iconUSBs = icons['usb']

    let ParamHDDs = { 'Name': 'Name', 'UUID': 'Uuid', "Size": "Size" }
    let AdjustsHdd = { "Size": "bytes" }
    let HddFilter = { 'Name': 'AppleAPFSMedia' }
    let iconHDDS = icons['hdds']

    let paramCameras = { 'Name': 'Name', 'UUID': 'Uuid' }

    let ParamNetwork = { 'Name': 'Name', 'UUID': 'Uuid', "MAC": "MacAddress", "IP": 'NetAddress' }
    let iconNetwork = icons['networkAdapter']
    let networkFilter = {}

    let ParamInputs = { 'Name': 'Name', 'UUID': 'Uuid' }
    let iconInputs = icons['inputDevice']
    
    let ParamPrinters = { 'Name': 'Name', 'UUID': 'Uuid' }
    let iconPrinters = icons['printers']

    let ParamCCIDs = { 'Name': 'Name', 'UUID': 'Uuid' }
    let iconCCIDS = icons['CCID']

    let USBs_data = parseXMLItem(item_all_data, element = "UsbDevice", ParamUSBs)
    let Network_data = parseXMLItem(item_all_data, element = "NetworkAdapter", ParamNetwork, {}, networkFilter)
    let HDDs_data = parseXMLItem(item_all_data, element = "HardDisk", ParamHDDs, AdjustsHdd, HddFilter)
    let Inputs_data = parseXMLItem(item_all_data, element = "HIDDevice", ParamInputs)
    let Printers_data = parseXMLItem(item_all_data, element = "Printer", ParamPrinters)
    let CCIDs_data = parseXMLItem(item_all_data, element = "SmartCardReaders", ParamCCIDs)
    let camerasData = parseXMLItem(item_all_data, element = "Camera", paramCameras)

    //that's definitely super-repetative; but ok for now
    let specs_definition = {
        'Subbullet1': (USBs_data == 'Nothing') ? buildNodeBullet('Host_USBs', 'blank', USBs_data, iconUSBs) : buildNodeBullet('Host_USBs', 'Custom', USBs_data, iconUSBs),
        'Subbullet2': (Network_data == 'Nothing') ? buildNodeBullet('Host_Nets', 'blank', Network_data, iconNetwork) : buildNodeBullet('Host_Nets', 'Custom', Network_data, iconNetwork),
        'Subbullet3': (HDDs_data == 'Nothing') ? buildNodeBullet('Host_HDDs', 'blank', HDDs_data, iconHDDS) : buildNodeBullet('Host_HDDs', 'Custom', HDDs_data, iconHDDS),
        'Subbullet4': (camerasData == 'Nothing') ? buildNodeBullet('Host_Cams', 'blank', camerasData, icons.webcam) : buildNodeBullet('Host_Cams', 'Custom', camerasData, icons.webcam),
        'Subbullet5': (Inputs_data == 'Nothing') ? buildNodeBullet('Host_Input_Devices', 'blank', Inputs_data, iconInputs) : buildNodeBullet('Host_Input_Devices', 'Custom', Inputs_data, iconInputs),
        'Subbullet6': (Printers_data == 'Nothing') ? buildNodeBullet('Host_Printers', 'blank', Printers_data, iconPrinters) : buildNodeBullet('Host_Printers', 'Custom', Printers_data, iconPrinters),
        'Subbullet7': (CCIDs_data == 'Nothing') ? buildNodeBullet('Host_CCIDs', 'blank', CCIDs_data, iconCCIDS) : buildNodeBullet('Host_CCIDs', 'Custom', CCIDs_data, iconCCIDS),

    };

    if (item_all_data.match('DisplayLink')) { markBullet('HostInfo', 'DisplayLink device!') }


    let all_specs = '';

    let specs_to_name = {
        'Lan Adapter': { 0: 'Legacy', 1: 'RealTek RTL8029AS', 2: 'Intel(R) PRO/1000MT', 3: 'Virtio', 4: 'Intel(R) Gigabit CT (82574l)' },
        'Network': { 1: 'Shared', 2: 'Bridged' },
        'Opt.TimeMachine': { 1: 'On', 2: 'Off' }
    };

    for (var key in specs_definition) {
        //if (item_all_data.match(specs_regex[key]) == null){continue}
        let spec
        let spec_value = specs_definition[key];
        if (key in specs_to_name) {
            spec_value = specs_to_name[key][spec_value]
            spec = '<u>' + key + '</u>' + ': ' + spec_value + '\n';
        }
        else if (key.match('Section')) {
            spec = '\n<strong>⫸' + spec_value + '⫷</strong>\n'
        } else if (key.match('Subbullet')) {
            spec = spec_value
        } else {
            spec = '<u>' + key + '</u>' + ': ' + spec_value + '\n\n';
        }

        all_specs += spec
    }

    return all_specs;


}

function parseMoreHostInfo(item_all_data) {

    if (item_all_data.length > 120 && item_all_data.length < 250) { return item_all_data } else if (item_all_data.length < 121) { return "Empty" }

    regex = /(\<More[^$]*dtd\"\>|\<\=|\<\/MoreHostInfo>)/gm
    item_all_data = item_all_data.replace(regex, '');

    let jsonString = PlistParser.parse(item_all_data);
    let top_el
    for (var i in jsonString) {
        if (jsonString[i] != null) {
            if (jsonString[i]['_SPCommandLineArguments'] != undefined) {
                top_el = jsonString
                break
            } else {
                top_el = jsonString[i]
                break
            }
        }
    }

    for (var i in top_el) {
        if (top_el[i]['_dataType'] == "SPDisplaysDataType") {
            graphics_subel = top_el[i]['_items']
            break
        }

    }
    let number_of_displays = 0
    let gpus_bullet = ''
    let gpuNames = []
    for (var i in graphics_subel) {

        let gpu = graphics_subel[i]
        let gpu_name = (gpu['sppci_model'])
        if (gpuNames.includes(gpu_name)) { gpu_name += "_" + i }
        gpuNames.push(gpu_name)
        let displays = []
        for (var i in gpu['spdisplays_ndrvs']) {
            number_of_displays++
            let display_subel = gpu['spdisplays_ndrvs']
            display =
                "\n<u>Display</u>: " + display_subel[i]['_name'] + "\
                \n<u>Phys resolution</u>: "+ display_subel[i]['_spdisplays_pixels'] + "\
                \n<u>Logical resolution</u>: "+ display_subel[i]['_spdisplays_resolution'] + "\n"

            displays += display
            //CreateBullet(item_name, bullet_type, data = '', icon_url)
        }
        let bulletType
        if (displays == "") {
            bulletType = 'blank'
        } else { bulletType = 'Custom' }
        let gpu_bullet = buildNodeBullet(gpu_name, bulletType, displays, icons.gpu, 1)
        gpus_bullet += gpu_bullet
    }
    //mention(gpus_bullet)

    if (number_of_displays > 0) {
        markBullet("MoreHostInfo", 'screens')
        markBullet("MoreHostInfo", "CustomHtml", '<a>' + number_of_displays + '* </a>')
    }
    else {
        markBullet("MoreHostInfo", 'no_screens')
    }


    return gpus_bullet


}

function parseLoadedDrivers(item_all_data) {


    $.get("https://gist.githubusercontent.com/NickSmet/53b6d6b947372cbf59f791cff0dcc046/raw/kexts.json", function ldd(data) {

        data = JSON.parse(data)
        bad_kexts = Object.keys(data)
        $('#LoadedDrivers').html(GetDriverList(bad_kexts));


    })

    function GetDriverList(bad_kexts) {
        let non_apple_regex = /^((?!com.apple|LoadedDrivers|Linked Against|com.parallels).)+$/gm;//filter out non apple/non parallels kexts+extra lines
        let prl_arr = item_all_data.match(/com.parallels/gm)

        let non_apple_arr = item_all_data.match(non_apple_regex);

        if (non_apple_arr == null && prl_arr != null) {
            $('#LoadedDrivers').text("Only apple+prl");
            markBullet('LoadedDrivers', 'all good')
            return;
        }


        //need to make some object to put all this into
        let HostInfo = strToXmlToJson(bigReportObj['ParallelsProblemReport']['HostInfo'])
        let CPU = HostInfo.ParallelsHostInfo.Cpu.Model

        if (non_apple_arr == null && prl_arr == null && CPU!='Apple M1') {
            $('#LoadedDrivers').html('Only apple, <b style="color:red">no prl(!)</b>');
            markBullet('LoadedDrivers', 'serious warning')
            return;
        }


        let kext
        let hasBadKexts = false
        let drv_name_regex = / (\w+\.[^ ]*)/gm;

        //Don't remember why, but seems to work.
        for (let i = 0; i < non_apple_arr.length; i++) {
            kext = non_apple_arr[i].match(drv_name_regex) || '-----'
            mention({ kext });
            non_apple_arr[i] = kext
            if (bad_kexts.indexOf(kext[0].trim()) > -1) {
                hasBadKexts = true
            }
        }

        if (prl_arr == null&&CPU!='Apple M1') {
            non_apple_arr.unshift('<b style="color:red"> no prl(!)</b>');
            markBullet('LoadedDrivers', 'serious warning')
        }

        let non_apple_str = non_apple_arr.join('\r\n');



        if (hasBadKexts == false) {
            markBullet('LoadedDrivers', 'warning')
        }
        else {
            markBullet('LoadedDrivers', 'bad')
        }

        return non_apple_str

    }

}

function parseAllProcesses(item_all_data) {
    let bsdtar_regex = /toolbox_report\.xml\.tar\.gz/
    let bdstar_marker = "<u><b>bdstar</b></u>"
    if (item_all_data.match(bsdtar_regex)) {
        markBullet('AllProcesses', 'bad')
        markBullet('AllProcesses', 'CustomHtml', bdstar_marker)
    }

    function runningApps() {

        let runningAppsRegex = /\s\/Applications\/((?!Parallels Desktop.app|\/).)*\//gm;/*the \s at the beginning is important,
      because we're eliminating apps inside of Apps (mainly Toolbox apps). Maybe should just create an exclusion list.
      */
        let appRegex = /\/Applications\/([^\/]+)\//;
        let runningAppsList = item_all_data.match(runningAppsRegex);

        if (!runningAppsList) {
            return "Looks like no apps running (better check)."
        }

        let runningApps = []
        let i
        for (i = 0; i < runningAppsList.length; i++) {
            let app = runningAppsList[i].match(appRegex)[1]
            if (runningApps.indexOf(app) == -1) {
                runningApps.push(app)
            }


        }
        runningApps = runningApps.join('\r\n');
        //mention (apps_all);

        return runningApps

    }

    function parsePsAux() {
        let processRegex = /^(?<user>[^ ]+) +(?<pid>[\d.]+) +(?<cpu>[\d.]+) +(?<mem>[\d.]+) +(?<vsz>[\d]+) +(?<rss>[\d]+) +(?<tt>[\w\?]+) +(?<stat>[\w]+) +(?<started>[\d\:\.\w]+) +(?<timeRunning>[\d\:\.]+) +\/(?<name>[^\n]*)$/gm

        let processesArray = item_all_data.split('\n')

        let processObjArray = []

        for (let index = 0; index < processesArray.length; index++) {
            let line = processesArray[index]
            if (!line.match(processRegex)) { continue }

            let processProperties = processRegex.exec(line)?.groups
            processObjArray.push({ 'user': processProperties.user, 'CPU(%)': parseFloat(processProperties.cpu), 'Mem(%)': parseFloat(processProperties.mem), 'name': processProperties.name })
        }

        let top5cpu = objArrayToTable(processObjArray.sort((a, b) => b['CPU(%)'] - a['CPU(%)']).slice(0, 5), 2)
        let top5mem = objArrayToTable(processObjArray.sort((a, b) => b['Mem(%)'] - a['Mem(%)']).slice(0, 5), 3)


        return `<div style="overflow-x: scroll; max-width: 70em; max-height: 70em;">
<div style="width: 10000px; ">
<b>TOP CPU USAGE</b>\n${top5cpu}\n\r<b>TOP MEMORY USAGE</b>\n${top5mem}
</div>
</div>`

    }

    let runningAppsSubbullet = buildNodeBullet('Running Apps', 'Custom', runningApps(), icons.apps)

    let topProcessesSubbullet = buildNodeBullet('Top Processes', 'Custom', parsePsAux(), icons.hotcpu)

    return topProcessesSubbullet + runningAppsSubbullet
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

        if (line.match(fileSystemRegex)) {
            diskProperties = fileSystemRegex.exec(line)?.groups
            fs[diskProperties.id] = diskProperties.filesystem.replace('ntfs', '<b><u>ntfs</u></b>')
        }

        if (!line.match(mountInfoRegex)) { continue }

        let volumeProperties = mountInfoRegex.exec(line)?.groups

        let identifier = volumeProperties.id

        if (identifier.match(/(map|devfs)/)) { continue }

        let capacity = parseInt(volumeProperties.Capacity.match(/^(\d+)\%/)[1])

        if (volumeProperties.MountedOn.match(/\/System\/Volumes\//) && capacity > 90) {
            if(capacity > 99){volumeProperties.Capacity = `<u><a style="color:Red;"><b>${volumeProperties.Capacity}</b></a></u>`}else{
            volumeProperties.Capacity = `<a style="color:Tomato;"><b>${volumeProperties.Capacity}</b><a>`}
        }

        if (volumeProperties.MountedOn.match(/\/System\/Volumes\//) && capacity > 90) {
            
            if(capacity > 99){markBullet('MountInfo', 'bad',"","HDD FULL!")}
            if(!lowStorage)markBullet('MountInfo', 'Low storage')
            lowStorage = true
        }


        hostinfoObjArray.push({ 'Identifier': volumeProperties.id, 'Mounted on': volumeProperties.MountedOn, 'Size': volumeProperties.Size, 'Free': volumeProperties.Avail, 'Capacity': volumeProperties.Capacity, 'File System': fs[volumeProperties.id] })


    }


    let drives = objArrayToTable(hostinfoObjArray.sort((a, b) => a.Identifier.localeCompare(b.Identifier)))


    return drives


}

function parseGuestOs(item_all_data) {

    let guestOsJson = strToXmlToJson(item_all_data)

    const guestOsVersion = guestOsJson.GuestOsInformation?.RealOsVersion?.replace(/(,$)/g, "") || '--' //removing trailing comma
    const guestOsType = guestOsJson.GuestOsInformation?.ConfOsType
    const kernelVersion = guestOsJson.GuestOsInformation?.OsKernelVersion

    niceReportObj.guestOS.version = guestOsVersion
    niceReportObj.guestOS.type = guestOsType
    niceReportObj.guestOS.kernel = kernelVersion

    $("table.reportList>tbody>tr:nth-child(19)>td:nth-child(2)").append(` (${guestOsVersion})`)

    // let ToolsParams = { 'Name': 'ToolName', 'Version': 'ToolVersion', 'Last updated': 'ToolDate', 'Status': 'ToolUpdateStatus' }
    // let ToolsAdjust = { 'Last updated': 'Time' }
    // let ToolsFilter = { 'ToolUpdateStatus': 'UpToDate', 'ToolVersion': '0.0.0.0' }
    //result = parseXMLItem(item_all_data, 'GuestToolInfo', ToolsParams, ToolsAdjust, ToolsFilter);

    let result = `${guestOsType} ${guestOsVersion}`


    if (kernelVersion){result += `\nKernel: ${kernelVersion}`}

    return result
    // if (result == 'Nothing') {
    //     markBullet('GuestOs', 'all good')
    //     return 'All good!'
    // }
    // else {
    //     markBullet('GuestOs', 'warning')
    //     return result
    // }
}

function parseGuestCommands(item_all_data) {

    if (!item_all_data['GuestCommand']||item_all_data.length < 100) {
        markBullet('GuestCommands',icons.warning)
        return 'GuestCommands empty'}

    guestCommandsObj = {}

    for (const [key, value] of Object.entries(item_all_data['GuestCommand'])) {

        let command = value['CommandName']

        let commandValue = value['CommandResult']
        guestCommandsObj[command] = commandValue
    }

    let guest_commands_results = []


    let net_use = guestCommandsObj["net use"] || ''
    let ipconfig = guestCommandsObj["ipconfig \/all"] || ''
    let cpu_usage = guestCommandsObj["prl_cpuusage --sort-cpu-desc --time 4000"] || ''



    function parseNetuse(command_result) {

        let net_volumes_regex = /[A-Z]\: +\\\\Mac\\\w+/g
        let net_volumes = command_result.match(net_volumes_regex)
        if (net_volumes !== null) {
            net_volumes.unshift("_Network volumes:_")
            net_volumes = net_volumes.join('\r\n');

            return net_volumes
        }

    }
    function parseIpconfig(command_result) {
        //lots of weird regexes to make it parse regardless of the language.
        let adapters_regex = /\n[ \w][^\n\:]*\:[\r\n]+( +[^\n]*\n){1,}/gi
        let adapters = command_result.match(adapters_regex)

        if (adapters !== null) {

            let adapters_output = ["\n"]


            let i
            for (i = 0; i < adapters.length; i++) {
                let adapter = []
                let adapterObj = {}

                try {
                    let adapter_name = (i + 1 + ".") + adapters[i].match(/\n([ \w][^\n\:]*)\:/)[1]
                    adapter.push(adapter_name)
                    adapterObj['name'] = adapters[i].match(/\n([ \w][^\n\:]*)\:/)[1]
                } catch (e) { }

                try {
                    let adapter_discr = adapters[i].match(/\n[ \w][^\n\:]*\:[^$]*?:[^$]*?:([^\n]*?)\n/)[1]
                    adapter.push(adapter_discr)
                    adapterObj['discriptor'] = adapter_discr
                } catch (e) { }
                try {
                    let adapter_ip = "IP: " + adapters[i].match(/IPv4[^$]*?: (\d{1,3}(\.\d{1,3}){3})/)[1]
                    adapter.push(adapter_ip)
                    adapterObj['ip'] = adapters[i].match(/IPv4[^$]*?: (\d{1,3}(\.\d{1,3}){3})/)[1]
                } catch (e) { }

                adapter = adapter.join('\r\n');
                //mention(adapter)

                adapters_output.push(adapter)

                niceReportObj.guestOS.adapters.push(adapterObj)

            }
            adapters_output.unshift("_Netw. Adapters:_")
            adapters_output = adapters_output.join('\r\n');
            return adapters_output
        }

    }
    function parseCpuUsage(command_result) {
        //mention(command_result)

        let cpu_usage_regex = /\d+\.\d\d% +\d+ C:[\\\w \(\)\-\{\} \.\_]+\.exe/g
        let cpu_usage = command_result.match(cpu_usage_regex) //get cpu usage % and process locations
        if (cpu_usage !== null) {
            cpu_usage = cpu_usage.slice(0, 5) //get first 3 processes
            cpu_usage.unshift("_Top processes:_")
            cpu_usage = cpu_usage.join('\r\n');

            //mention(cpu_usage)
            return cpu_usage
        }

    }

    let net_use_results = parseNetuse(net_use)
    let ipconfig_results = parseIpconfig(ipconfig)
    let cpu_usage_results = parseCpuUsage(cpu_usage)

    guest_commands_results.push(ipconfig_results, net_use_results, cpu_usage_results)

    guest_commands_results = guest_commands_results.join('\r\n\n');

    return guest_commands_results
    //mention(net_use_results)

}

function parseVmDirectory(item_all_data) {
    item_all_data = item_all_data.replace(/&/g, "_") //cuz & in xml causes parsing issues
    //counts number of VMs and marks bullet accordingly
    let numberofvms = item_all_data.match(/VmName/g) ? item_all_data.match(/VmName/g).length / 2 : 0
    if (numberofvms > 0) {
        markBullet("VmDirectory", "vms")
        markBullet("VmDirectory", "CustomHtml", '<a>' + numberofvms + '* </a>')
    }

    xmlDoc = $.parseXML(item_all_data),
        $xml = $(xmlDoc);
    let VMParams = { 'Name': 'VmName', 'Location': 'VmHome', 'UUID': 'Uuid', 'Registered on': 'RegistrationDateTime', }

    return parseXMLItem(item_all_data, 'VirtualMachine', VMParams, undefined,undefined,undefined,'pd.vms');


    function parseCpuUsage(command_result) {
        //mention(command_result)

        let cpu_usage_regex = /\d+\.\d\d% +\d+ C:[\\\w \(\)\-]+\.exe/g
        let cpu_usage = command_result.match(cpu_usage_regex) //get cpu usage % and process locations
        if (cpu_usage !== null) {
            cpu_usage = cpu_usage.slice(0, 5) //get first 3 processes
            cpu_usage.unshift("_Top processes:_")
            cpu_usage = cpu_usage.join('\r\n');

            //mention(cpu_usage)
            return cpu_usage
        }

    }

}

function parseTimeZone(item_all_data) {

    return parseInt(item_all_data.match(bigReportObj.ParallelsProblemReport.TimeZone))


}

function parsetoolslog(item_all_data) {
    //console.log(item_all_data);
    let result = ""
    let last1000chars = item_all_data.slice(item_all_data.length - 1000)
    if (last1000chars.match(/successfully/)) {
        markBullet('tools.log', 'all good')
    }
    else if (last1000chars.match(/FatalError/)) { markBullet('tools.log', 'bad') }

    else { markBullet('tools.log', 'warning') }

    var lines = item_all_data.split("\n")

    let lineRegex = /(?<dateString>\d\d-\d\d \d\d:\d\d:\d\d).*WIN_TOOLS_SETUP\](?<message>.*)/
    let successfulInstallRegex = /Setup finished with code 3010 \(0xbc2\)/
    let linesInterpreter = {
        " Setup finished with code 3010 \\(0xbc2\\)":"Installation successful!",
        " Setup finished with code 0 \\(0x0\\)":"Installation successful!",
        " Setup finished with code 1641 \\(0x669\\)":"Installation successful!",
        " \\*{14} Setup mode: UPDATE from version (\\d\\d\\.\\d\\.\\d\\.\\d{5})":"Updating from <b>$1</b>",
        " \\*{14} Setup mode: EXPRESS INSTALL.":"Original installation.",
        " \\*{14} Setup mode: INSTALL.":"Manual installation.",
        " \\*{14} Setup mode: REINSTALL":"Reinstalling.",
        " Setup completed with code 1603":"<b>Installation failed.</b>"
        
    }

 
    for (let i = 0; i < lines.length; i++) {

        const line = lines[i];
        if(line.match(/(\w{3,4} \d\d \d\d:\d\d:\d\d|\d\d\-\d\d \d\d:\d\d:\d\d)(.*)/)){

            let lineMatch = lineRegex.exec(line);
            
            var lineDateTime = getLineDate(line)
            var lineTimeString = lineMatch.groups.dateString
            var line_message = lineMatch.groups.message

            
            for (const regEx in linesInterpreter) {
                const re = new RegExp(regEx)
                const replaceWith = linesInterpreter[regEx]

                if(line_message.match(re)){
                    console.log(line_message);
                    line_message=line_message.replace(re, replaceWith);
                    result += `${lineTimeString}: ${line_message}\n`
                }
              }
        }

    }
    
    return result



}

function parseLicenseData(item_all_data) {
    const licType = {
        1:"STD",
        2:"PDB",
        3:"Pro"
    }

    

    try{JSON.parse(item_all_data)}catch(e){
        console.log(e);
        return}

    let licenseData = JSON.parse(item_all_data)
    let expirationDate = Date.parse(licenseData['license']['main_period_ends_at'])
    if (expirationDate - Date.now() > 5 * 365 * 24 * 3600 * 1000) { markBullet('LicenseData', 'pirated') }


    let result = `<u>Type</u>: ${licType[licenseData['license']['edition']]}
<u>Expires</u>: ${licenseData['license']['main_period_ends_at']}`


    const other_properties_ref = {
        'is_auto_renewable': false,
        'is_beta': false,
        'is_bytebot': false,
        'is_china': false,
        'is_expired': false,
        'is_grace_period': false,
        'is_nfr': false,
        'is_purchased_online': true,
        'is_sublicense': false,
        'is_suspended': false,
        'is_trial': false,
        'is_upgrade': false}
    
    const other_properties = Object.keys(other_properties_ref)

        result += "\n\n<u>Other properties:</u>"
    
    for (let i = 0; i < other_properties.length; i++) {
        const property = other_properties[i];

        const prop_value = licenseData['license'][property] == other_properties_ref[property] ? `${property}: ${licenseData['license'][property]}`: `<u><b>${property}: ${licenseData['license'][property]}</b></u>`;

        result += `\n${prop_value}`
    }

    return result
}

function parseAppConfig(item_all_data) {

    let externalVmFolder = false

    let appConfigContents = ''

    let AppConfigJson = strToXmlToJson(item_all_data).ParallelsPreferences

    if (!AppConfigJson) { return "It's <b>UserDefinedOnDisconnectedServer</b>" }

    let verboseLoggingEnabled = AppConfigJson.ServerSettings.CommonPreferences.Debug.VerboseLogEnabled


    let permanentAssignments = ''

    let usbDevices = AppConfigJson.ServerSettings.CommonPreferences.UsbPreferences.UsbIdentity
    if(usbDevices){
        if(!Array.isArray(usbDevices)){usbDevices=[usbDevices]}
        usbDevices.forEach(usbDevice => {
        if (usbDevice.AssociationsNew?.Association){
            let connectTo
            if (usbDevice.AssociationsNew.Association.Action==1){connectTo=niceReportObj.getVmName(usbDevice.AssociationsNew.Association.VmUuid)}else{connectTo='This Mac'}
            permanentAssignments += `<u>Name</u>: ${usbDevice.FriendlyName}\n<u>ID</u>: ${usbDevice.SystemName}\n<u>Connect to</u>: ${connectTo}\n\n`
        };
    })}

    if(permanentAssignments.length>10){permanentAssignments = buildNodeBullet('Perm. Assignments', 'Custom', permanentAssignments, icons.usb)
        markBullet('AppConfig','usb', '','Perm. Assignments')}
    else{permanentAssignments = buildNodeBullet('Perm. Assignments', 'blank', permanentAssignments, icons.usb)}


    if (verboseLoggingEnabled == 1) { markBullet('AppConfig', 'verbose logging') }
    appConfigContents += bulletSubItem('Verbose logging', verboseLoggingEnabled)

    //there could be many users, and all kinds of situations, so it's easier and more reliable to just locate default VM folders using regex
    let defaultVmFolderRegex = /<UserDefaultVmFolder>([^<]+)<\/UserDefaultVmFolder>/gm
    let defaultVmFolder
    while ((defaultVmFolder = defaultVmFolderRegex.exec(item_all_data)) !== null) {
        appConfigContents += bulletSubItem('Default VM Folder', defaultVmFolder[1])
        if (defaultVmFolder[1].match(/^\/Volumes/) && !externalVmFolder) { markBullet('AppConfig', 'External Default VM folder') }//to avoid marking it a second time in case there are multiple such volumes
    }

    appConfigContents += permanentAssignments

    return appConfigContents
}

function parseInstalledSoftware(item_all_data) {
    markBullet('InstalledSoftware', 'installedApps')
    item_all_data = item_all_data.replaceAll(/\<\/?InstalledSoftware\>/g, '')

    let uniqueAppList
    let appRegex = /\/Applications\/(?<appName>[^.]*\.app)[^:]*\: (?<version>[\d. ()]*)/g

    let formattedAppList = item_all_data.replaceAll(appRegex, '$<appName>: $<version>').split("\n");

    uniqueAppList = Array.from(new Set(formattedAppList)).sort().join('\r\n')

    return uniqueAppList
}

function parseLaunchdInfo(item_all_data) {
    markBullet('LaunchdInfo', 'service')
    return parseLsLr(item_all_data)
}

function parseAutoStatisticInfo(item_all_data) {
    markBullet('AutoStatisticInfo', 'install')

    if(!item_all_data.InstallationsData){return "Looks like empty xml."}

    let installationHistory = item_all_data.InstallationsData.PDInstallationHistoryes.PDInstallationHistory

    let installationHistoryParsed = 'PD Installations:\n'

    if(!Array.isArray(installationHistory)){installationHistory = [installationHistory]} //because it's either an array of objects or a single object

    installationHistory.forEach(installationEntry => {
        installationHistoryParsed += `<u>${installationEntry.InstalledVersionName}</u>  ${installationEntry.InstalledVersionDate}\n`
    })

    return installationHistoryParsed

}