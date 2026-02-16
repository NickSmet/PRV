import { c as createNodeMarker, a as createSubSectionMarker, b as createRowMarker } from "./markers.js";
const NODE_ID = "current-vm";
const macVmRule = (report) => {
  if (report.currentVm?.macVm) {
    return [
      createNodeMarker("macvm", NODE_ID, "info", "Mac VM", {
        tooltip: "This is a macOS virtual machine",
        iconKey: "apple"
      })
    ];
  }
  return [];
};
const noHddRule = (report) => {
  const vm = report.currentVm;
  if (!vm?.hdds?.length && !vm?.macVm) {
    return [
      createNodeMarker("no-hdd", NODE_ID, "danger", "No HDD", {
        tooltip: "No HDD attached to VM!",
        iconKey: "alert-triangle"
      }),
      createSubSectionMarker("no-hdd-subsection", NODE_ID, "Hardware", "hdds", "danger", "Empty", {
        tooltip: "No HDD attached to VM!"
      })
    ];
  }
  return [];
};
const bootCampRule = (report) => {
  if (report.currentVm?.isBootCamp) {
    return [
      createNodeMarker("boot-camp", NODE_ID, "info", "Boot Camp", {
        tooltip: "This VM uses a Boot Camp partition",
        iconKey: "hard-drive"
      })
    ];
  }
  return [];
};
const trimEnabledRule = (report) => {
  if (report.currentVm?.hasTrimEnabled && !report.currentVm?.isBootCamp) {
    return [
      createNodeMarker("trim-enabled", NODE_ID, "info", "TRIM", {
        tooltip: "TRIM is enabled on virtual disk",
        iconKey: "hard-drive"
      })
    ];
  }
  return [];
};
const splittedDiskRule = (report) => {
  if (report.currentVm?.hasSplittedDisk && !report.currentVm?.isBootCamp) {
    return [
      createNodeMarker("splitted-disk", NODE_ID, "info", "Splitted", {
        tooltip: "Virtual disk is split into multiple files",
        iconKey: "hard-drive"
      })
    ];
  }
  return [];
};
const plainDiskRule = (report) => {
  if (report.currentVm?.isPlainDisk) {
    return [
      createNodeMarker("plain-disk", NODE_ID, "info", "Plain Disk", {
        tooltip: "Non-expanding (pre-allocated) virtual disk",
        iconKey: "hard-drive"
      })
    ];
  }
  return [];
};
const externalVhddRule = (report) => {
  if (report.meta.productName?.includes("Chrome OS")) return [];
  if (report.currentVm?.isExternalVhdd) {
    const externalCount = report.currentVm.externalVhddLocations?.length ?? 0;
    const externalSample = (report.currentVm.externalVhddLocations ?? []).slice(0, 2).map((p) => p.split("/").filter(Boolean).pop() ?? p).join(", ");
    return [
      createNodeMarker("external-vhdd", NODE_ID, "warn", externalCount > 1 ? `External vHDD (${externalCount})` : "External vHDD", {
        tooltip: externalCount > 0 ? `Virtual HDD is located outside the PVM bundle (${externalCount} disk${externalCount === 1 ? "" : "s"}).${externalSample ? ` Example: ${externalSample}` : ""}` : "Virtual HDD is located outside the PVM bundle",
        iconKey: "hard-drive"
      }),
      createSubSectionMarker("external-vhdd-subsection", NODE_ID, "Hardware", "hdds", "warn", "External", {
        tooltip: "Virtual HDD is located outside the PVM bundle"
      })
    ];
  }
  return [];
};
const rollbackModeRule = (report) => {
  if (report.currentVm?.rollbackMode === "1") {
    return [
      createNodeMarker("rollback-mode", NODE_ID, "warn", "Rollback Mode", {
        tooltip: "Rollback Mode is enabled - changes are discarded on shutdown",
        iconKey: "rotate-ccw"
      })
    ];
  }
  return [];
};
const sharedNetworkRule = (report) => {
  if (report.currentVm?.isSharedNetwork) {
    return [
      createNodeMarker("shared-network", NODE_ID, "info", "Shared", {
        tooltip: "Using Shared Networking mode",
        iconKey: "network"
      })
    ];
  }
  return [];
};
const bridgedNetworkRule = (report) => {
  if (report.currentVm?.isBridgedNetwork) {
    return [
      createNodeMarker("bridged-network", NODE_ID, "info", "Bridged", {
        tooltip: "Using Bridged Networking mode",
        iconKey: "network"
      })
    ];
  }
  return [];
};
const disconnectedAdapterRule = (report) => {
  if (report.currentVm?.hasDisconnectedAdapter) {
    return [
      createNodeMarker("disconnected-adapter", NODE_ID, "warn", "NIC Offline", {
        tooltip: "One or more network adapters are disconnected",
        iconKey: "wifi-off"
      }),
      createSubSectionMarker("disconnected-adapter-subsection", NODE_ID, "Hardware", "networks", "warn", "Disconnected", {
        tooltip: "Network adapter is disconnected"
      })
    ];
  }
  return [];
};
const networkConditionerRule = (report) => {
  if (report.currentVm?.hasNetworkConditioner) {
    const isLimited = report.currentVm?.hasNetworkConditionerLimited;
    return [
      createNodeMarker(
        "network-conditioner",
        NODE_ID,
        isLimited ? "warn" : "info",
        isLimited ? "Net Limited" : "Net Conditioner",
        {
          tooltip: isLimited ? "Network Conditioner is limiting bandwidth" : "Network Conditioner is enabled (full speed)",
          iconKey: "activity"
        }
      )
    ];
  }
  return [];
};
const copiedVmRule = (report) => {
  if (report.currentVm?.isCopied) {
    return [
      createNodeMarker("copied-vm", NODE_ID, "warn", "Copied VM", {
        tooltip: "This VM was copied from another VM (Source UUID differs from VM UUID)",
        iconKey: "copy"
      }),
      createRowMarker("copied-vm-detail", NODE_ID, "General.Source UUID", "warn", "Copied", {
        tooltip: "Source UUID differs from VM UUID"
      })
    ];
  }
  return [];
};
const importedVmRule = (report) => {
  if (report.currentVm?.isImported) {
    return [
      createNodeMarker("imported-vm", NODE_ID, "warn", "Imported", {
        tooltip: "VM creation date looks bogus (1751-12-31) — this usually indicates an imported VM.",
        iconKey: "clock"
      }),
      createRowMarker("imported-vm-date", NODE_ID, "General.Creation Date", "warn", "Imported", {
        tooltip: "Bogus creation date (1751-12-31) is a known indicator of imported VM."
      })
    ];
  }
  return [];
};
const externalDriveRule = (report) => {
  if (report.currentVm?.isOnExternalVolume) {
    return [
      createNodeMarker("external-drive", NODE_ID, "warn", "External Drive", {
        tooltip: "VM is located on an external volume (/Volumes/...)",
        iconKey: "hard-drive"
      })
    ];
  }
  return [];
};
const linkedCloneRule = (report) => {
  if (report.currentVm?.isLinkedClone) {
    return [
      createNodeMarker("linked-clone", NODE_ID, "info", "Linked Clone", {
        tooltip: "This is a linked clone VM",
        iconKey: "link"
      })
    ];
  }
  return [];
};
const appleHvRule = (report) => {
  const vm = report.currentVm;
  if (vm?.hypervisorType === "1" && !vm?.macVm) {
    return [
      createNodeMarker("apple-hv", NODE_ID, "info", "Apple HV", {
        tooltip: "Using Apple Hypervisor Framework",
        iconKey: "cpu"
      })
    ];
  }
  return [];
};
const nestedVirtRule = (report) => {
  if (report.currentVm?.nestedVirtualization === "1") {
    return [
      createNodeMarker("nested-virt", NODE_ID, "info", "Nested", {
        tooltip: "Nested Virtualization is enabled",
        iconKey: "layers"
      })
    ];
  }
  return [];
};
const headlessModeRule = (report) => {
  const vm = report.currentVm;
  const isHeadless = vm?.startAutomatically === "5" || vm?.startAutomatically === "1" || vm?.onWindowClose === "5";
  if (isHeadless) {
    return [
      createNodeMarker("headless", NODE_ID, "info", "Headless", {
        tooltip: "VM runs in headless mode (no window)",
        iconKey: "monitor-off"
      })
    ];
  }
  return [];
};
const travelModeRule = (report) => {
  if (report.currentVm?.travelMode?.enabled === "1") {
    return [
      createNodeMarker("travel-mode", NODE_ID, "warn", "Travel Mode", {
        tooltip: "Travel Mode is enabled",
        iconKey: "plane"
      })
    ];
  }
  return [];
};
const isolatedVmRule = (report) => {
  if (report.currentVm?.isolated === "1") {
    return [
      createNodeMarker("isolated", NODE_ID, "info", "Isolated", {
        tooltip: "VM is running in isolated mode",
        iconKey: "shield"
      })
    ];
  }
  return [];
};
const noTimeSyncRule = (report) => {
  if (report.currentVm?.timeSync === "0") {
    return [
      createNodeMarker("no-time-sync", NODE_ID, "warn", "No Time Sync", {
        tooltip: "Time synchronization with host is disabled",
        iconKey: "clock"
      })
    ];
  }
  return [];
};
const bootFlagsRule = (report) => {
  if (report.currentVm?.bootFlags && report.currentVm.bootFlags.trim() !== "") {
    return [
      createNodeMarker("boot-flags", NODE_ID, "warn", "Boot Flags", {
        tooltip: `Boot flags set: ${report.currentVm.bootFlags}`,
        iconKey: "flag"
      })
    ];
  }
  return [];
};
const resourceQuotaRule = (report) => {
  const quota = parseInt(report.currentVm?.resourceQuota || "100");
  if (quota < 100) {
    return [
      createNodeMarker("resource-quota", NODE_ID, "warn", `Quota ${quota}%`, {
        tooltip: `Resource quota is limited to ${quota}%`,
        iconKey: "gauge"
      })
    ];
  }
  return [];
};
const smartGuardRule = (report) => {
  if (report.currentVm?.smartGuard === "1") {
    return [
      createNodeMarker("smart-guard", NODE_ID, "info", "Smart Guard", {
        tooltip: "Smart Guard (automatic snapshots) is enabled",
        iconKey: "shield"
      })
    ];
  }
  return [];
};
const tpmRule = (report) => {
  const tpm = report.currentVm?.tpm;
  if (tpm && tpm !== "0") {
    return [
      createNodeMarker("tpm", NODE_ID, "info", "TPM", {
        tooltip: `TPM ${tpm} is enabled`,
        iconKey: "key"
      })
    ];
  }
  return [];
};
const missingGuestCommandsOnRunningVmReportRule = (report) => {
  const type = report.meta.reportType ?? "";
  const t = type.toLowerCase();
  const isRunningVmReport = type === "UserDefinedOnRunningVmReport" || t.includes("runningvmreport") || t.includes("running");
  const isLinux = report.guestOs?.type ? /linux/i.test(report.guestOs.type) : false;
  const guestCommandsEmpty = !report.guestCommands || report.guestCommands.isEmpty;
  if (isRunningVmReport && !isLinux && guestCommandsEmpty) {
    return [
      createNodeMarker("guest-commands-missing", NODE_ID, "warn", "No GuestCommands", {
        tooltip: type === "UserDefinedOnRunningVmReport" ? "GuestCommands is empty for a running VM report; this often indicates Parallels Tools is not working." : `GuestCommands is empty for report type "${type}"; this often indicates Parallels Tools is not working.`,
        iconKey: "alert-triangle"
      })
    ];
  }
  return [];
};
const tooMuchRamRule = (report) => {
  const vmRam = parseInt(report.currentVm?.ramMb || "0");
  const hostRam = report.host?.ramMb || 0;
  if (hostRam > 0 && vmRam > hostRam / 2 && hostRam - vmRam < 6144) {
    return [
      createNodeMarker("too-much-ram", NODE_ID, "danger", "Too Much RAM", {
        tooltip: `VM has ${vmRam}MB but host only has ${hostRam}MB (less than 6GB left for host)`,
        iconKey: "memory-stick"
      }),
      createRowMarker("too-much-ram-detail", NODE_ID, "Hardware.RAM (MB)", "danger", "!!", {
        tooltip: "VM RAM exceeds safe limits"
      })
    ];
  }
  return [];
};
const unevenRamRule = (report) => {
  const vmRam = parseInt(report.currentVm?.ramMb || "0");
  if (vmRam > 0 && vmRam % 256 !== 0) {
    return [
      createNodeMarker("uneven-ram", NODE_ID, "warn", "Uneven RAM", {
        tooltip: `RAM (${vmRam}MB) is not a multiple of 256MB`,
        iconKey: "memory-stick"
      })
    ];
  }
  return [];
};
const notPvmDefaultRule = (report) => {
  if (report.meta.productName?.includes("Chrome OS") && report.currentVm?.vmName && !/PvmDefault/i.test(report.currentVm.vmName)) {
    return [
      createNodeMarker("not-pvmdefault", NODE_ID, "warn", "Not PvmDefault", {
        tooltip: "VM name is not PvmDefault (unexpected for Chrome OS)",
        iconKey: "alert-triangle"
      })
    ];
  }
  return [];
};
const currentVmRules = [
  // VM Type
  macVmRule,
  // Storage
  noHddRule,
  bootCampRule,
  trimEnabledRule,
  splittedDiskRule,
  plainDiskRule,
  externalVhddRule,
  rollbackModeRule,
  // Network
  sharedNetworkRule,
  bridgedNetworkRule,
  disconnectedAdapterRule,
  networkConditionerRule,
  // Identity
  copiedVmRule,
  importedVmRule,
  externalDriveRule,
  linkedCloneRule,
  // Hypervisor
  appleHvRule,
  nestedVirtRule,
  // Runtime Mode
  headlessModeRule,
  travelModeRule,
  isolatedVmRule,
  // Configuration Warnings
  noTimeSyncRule,
  bootFlagsRule,
  resourceQuotaRule,
  smartGuardRule,
  tpmRule,
  missingGuestCommandsOnRunningVmReportRule,
  // Cross-Node (RAM)
  tooMuchRamRule,
  unevenRamRule,
  // Chrome OS
  notPvmDefaultRule
];
const LICENSE_NODE = "license-data";
const NETCONFIG_NODE = "net-config";
const ADV_NODE = "advanced-vm-info";
const HOST_NODE = "host-info";
const MORE_HOST_NODE = "more-host-info";
const DRIVERS_NODE = "loaded-drivers";
const STORAGE_NODE = "mount-info";
const PROCESSES_NODE = "all-processes";
const PROXY_NODE = "client-proxy-info";
const TOOLS_NODE = "tools-log";
const SYSLOG_NODE = "parallels-system-log";
const VMDIR_NODE = "vm-directory";
const GUEST_COMMANDS_NODE = "guest-commands";
const APP_CONFIG_NODE = "app-config";
const INSTALLED_SOFTWARE_NODE = "installed-software";
const LAUNCHD_NODE = "launchd-info";
const AUTOSTAT_NODE = "auto-statistic-info";
const licenseRules = [
  (report) => {
    if (report.license?.isPirated) {
      return [
        createNodeMarker("license.pirated", LICENSE_NODE, "danger", "Pirated", {
          tooltip: "License expiration is far in the future (suspicious / likely pirated)",
          iconKey: "alert-triangle"
        })
      ];
    }
    return [];
  }
];
const netConfigRules = [
  (report) => {
    const s = report.network;
    if (!s) return [];
    const out = [];
    if (s.kextlessMode === "kextless") {
      out.push(
        createNodeMarker("netconfig.kextless", NETCONFIG_NODE, "info", "Kextless", {
          tooltip: "Virtual networking is running in kextless mode",
          iconKey: "network"
        })
      );
    } else if (s.kextlessMode === "kext") {
      out.push(
        createNodeMarker("netconfig.kext", NETCONFIG_NODE, "info", "Kext", {
          tooltip: "Virtual networking uses kernel extensions",
          iconKey: "network"
        })
      );
    }
    if (!s.hasSharedNetwork || !s.hasHostOnlyNetwork) {
      out.push(
        createNodeMarker("netconfig.network-missing", NETCONFIG_NODE, "warn", "Network missing", {
          tooltip: "Shared or Host-Only virtual network is missing",
          iconKey: "alert-triangle"
        })
      );
    }
    return out;
  }
];
const clientProxyRules = [
  (report) => {
    const s = report.proxy;
    if (!s) return [];
    if (s.httpProxyEnabled) {
      return [
        createNodeMarker("proxy.http-enabled", PROXY_NODE, "warn", "HTTP proxy enabled", {
          tooltip: "HTTP proxy is enabled in client settings",
          iconKey: "alert-triangle"
        })
      ];
    }
    return [
      createNodeMarker("proxy.none", PROXY_NODE, "info", "No proxy", {
        tooltip: "No HTTP proxy detected in client settings",
        iconKey: "network"
      })
    ];
  }
];
const advancedVmInfoRules = [
  (report) => {
    const s = report.advancedVm;
    if (!s) return [];
    const out = [];
    if (s.snapshotCount === 0) out.push(createNodeMarker("adv.no-snapshots", ADV_NODE, "info", "No snapshots"));
    if ((s.snapshotCount ?? 0) > 0) out.push(createNodeMarker("adv.snapshots", ADV_NODE, "info", `${s.snapshotCount} snapshots`));
    if (s.hasAclIssues) out.push(createNodeMarker("adv.acl", ADV_NODE, "warn", "ACL issues", { iconKey: "alert-triangle" }));
    if (s.hasRootOwner) out.push(createNodeMarker("adv.root-owner", ADV_NODE, "warn", "Root owner", { iconKey: "alert-triangle" }));
    if (s.hasDeleteSnapshotOp) out.push(createNodeMarker("adv.delete-snapshot", ADV_NODE, "danger", "Delete snapshot op", { iconKey: "alert-triangle" }));
    if (s.mainSnapshotMissing) out.push(createNodeMarker("adv.main-snapshot-missing", ADV_NODE, "danger", "Main snapshot missing", { iconKey: "alert-triangle" }));
    return out;
  }
];
const hostInfoRules = [
  (report) => {
    const s = report.hostDevices;
    if (!s) return [];
    const out = [];
    if (s.flags.lowMemory) out.push(createNodeMarker("host.low-memory", HOST_NODE, "warn", "High memory usage", { iconKey: "alert-triangle" }));
    if (s.flags.privacyRestricted) out.push(createNodeMarker("host.privacy", HOST_NODE, "warn", "Privacy restricted", { iconKey: "shield" }));
    if (s.hasDisplayLink) out.push(createNodeMarker("host.displaylink", HOST_NODE, "warn", "DisplayLink", { iconKey: "monitor" }));
    if (s.flags.hasExternalDisks) out.push(createNodeMarker("host.external-disk", HOST_NODE, "info", "External disk", { iconKey: "hard-drive" }));
    if (s.flags.hasUsbCamera) out.push(createNodeMarker("host.usb-camera", HOST_NODE, "info", "USB camera", { iconKey: "webcam" }));
    if (s.flags.hasBluetoothAudio) out.push(createNodeMarker("host.bt-audio", HOST_NODE, "info", "BT audio", { iconKey: "bluetooth" }));
    return out;
  }
];
const moreHostInfoRules = [
  (report) => {
    const s = report.moreHostInfo;
    if (!s) return [];
    if (s.hasNoDisplays) {
      return [createNodeMarker("morehost.no-displays", MORE_HOST_NODE, "warn", "No displays", { iconKey: "alert-triangle" })];
    }
    return [createNodeMarker("morehost.displays", MORE_HOST_NODE, "info", `${s.displayCount} displays`, { iconKey: "monitor" })];
  }
];
const loadedDriversRules = [
  (report) => {
    const s = report.drivers;
    if (!s) return [];
    const out = [];
    if (s.isHackintosh) out.push(createNodeMarker("drivers.hackintosh", DRIVERS_NODE, "danger", "Hackintosh", { iconKey: "alert-triangle" }));
    if (s.hasNonAppleKexts && !s.hasPrlKexts && !s.isHackintosh) out.push(createNodeMarker("drivers.no-prl", DRIVERS_NODE, "warn", "No PRL kexts", { iconKey: "alert-triangle" }));
    if (s.onlyApple) out.push(createNodeMarker("drivers.only-apple", DRIVERS_NODE, "info", "Only Apple", { iconKey: "shield" }));
    if (s.hasNonAppleKexts && !s.onlyApple && !s.isHackintosh) out.push(createNodeMarker("drivers.non-apple", DRIVERS_NODE, "warn", "Non-Apple kexts", { iconKey: "alert-triangle" }));
    return out;
  }
];
const mountInfoRules = [
  (report) => {
    const s = report.storage;
    if (!s) return [];
    const out = [];
    if (s.hddFull) out.push(createNodeMarker("storage.full", STORAGE_NODE, "danger", "HDD FULL!", { iconKey: "alert-triangle" }));
    if (!s.hddFull && s.lowStorage) out.push(createNodeMarker("storage.low", STORAGE_NODE, "warn", "Low storage", { iconKey: "alert-triangle" }));
    if (s.hasNtfsVolumes) out.push(createNodeMarker("storage.ntfs", STORAGE_NODE, "info", "NTFS detected", { iconKey: "hard-drive" }));
    return out;
  }
];
const allProcessesRules = [
  (report) => {
    const s = report.processes;
    if (!s) return [];
    if (s.hasBsdtarIssue) {
      return [
        createNodeMarker("processes.bsdtar", PROCESSES_NODE, "danger", "bsdtar", {
          tooltip: "Known bsdtar issue detected in process list",
          iconKey: "alert-triangle"
        })
      ];
    }
    return [];
  }
];
const toolsLogRules = [
  (report) => {
    const s = report.toolsLog;
    if (!s) return [];
    const out = [];
    if (!s.isWindows) out.push(createNodeMarker("tools.not-windows", TOOLS_NODE, "info", "Not Windows"));
    if (s.isWindows) {
      if (s.status === "success") out.push(createNodeMarker("tools.success", TOOLS_NODE, "info", "Successful"));
      if (s.status === "warning") out.push(createNodeMarker("tools.warning", TOOLS_NODE, "warn", "Warning", { iconKey: "alert-triangle" }));
      if (s.status === "error") out.push(createNodeMarker("tools.failed", TOOLS_NODE, "danger", "Failed", { iconKey: "alert-triangle" }));
      if (s.status === "empty") out.push(createNodeMarker("tools.empty", TOOLS_NODE, "warn", "Empty", { iconKey: "alert-triangle" }));
    }
    if (s.hasCorruptRegistry) out.push(createNodeMarker("tools.corrupt-reg", TOOLS_NODE, "danger", "Corrupt Registry", { iconKey: "alert-triangle" }));
    if (s.hasPrlDdIssue && s.kbArticle) out.push(createNodeMarker("tools.kb", TOOLS_NODE, "danger", s.kbArticle, { iconKey: "alert-triangle" }));
    return out;
  }
];
const systemLogRules = [
  (report) => {
    const s = report.systemLog;
    if (!s) return [];
    if (s.hasCoherenceDump) {
      return [
        createNodeMarker("syslog.coherence", SYSLOG_NODE, "warn", "Coherence dumps", {
          tooltip: `Coherence state dumps found (${s.coherenceDumpCount})`,
          iconKey: "alert-triangle"
        })
      ];
    }
    return [];
  }
];
const vmDirectoryRules = [
  (report) => {
    const s = report.vmDirectory;
    if (!s) return [];
    if (s.vmCount > 0) {
      return [createNodeMarker("vmdir.count", VMDIR_NODE, "info", `${s.vmCount} VMs`)];
    }
    return [createNodeMarker("vmdir.none", VMDIR_NODE, "warn", "No VMs", { iconKey: "alert-triangle" })];
  }
];
const guestCommandsRules = [
  (report) => {
    const s = report.guestCommands;
    if (!s) return [];
    if (s.isLinux) {
      return [createNodeMarker("guestcmd.linux", GUEST_COMMANDS_NODE, "info", "Linux")];
    }
    if (s.isEmpty) {
      return [createNodeMarker("guestcmd.empty", GUEST_COMMANDS_NODE, "warn", "Empty", { iconKey: "alert-triangle" })];
    }
    return [];
  }
];
const appConfigRules = [
  (report) => {
    const s = report.appConfig;
    if (!s) return [];
    const out = [];
    if (s.isUserDefinedOnDisconnectedServer) {
      out.push(createNodeMarker("appcfg.disconnected", APP_CONFIG_NODE, "warn", "Disconnected", { iconKey: "alert-triangle" }));
      return out;
    }
    if (s.verboseLoggingEnabled) out.push(createNodeMarker("appcfg.verbose", APP_CONFIG_NODE, "info", "Verbose logging"));
    if (s.hasExternalVmFolder) out.push(createNodeMarker("appcfg.external-vm-folder", APP_CONFIG_NODE, "info", "External VM folder"));
    if ((s.usbPermanentAssignments?.length ?? 0) > 0) out.push(createNodeMarker("appcfg.usb-assign", APP_CONFIG_NODE, "info", "USB assignments"));
    return out;
  }
];
const installedSoftwareRules = [
  (report) => {
    const s = report.installedSoftware;
    if (!s) return [];
    return [createNodeMarker("software.count", INSTALLED_SOFTWARE_NODE, "info", `${s.appCount} apps`)];
  }
];
const launchdRules = [
  (report) => {
    const s = report.launchdInfo;
    if (!s?.stats) return [];
    const out = [createNodeMarker("launchd.files", LAUNCHD_NODE, "info", `${s.stats.files} files`)];
    if (s.stats.rootOwnedFiles > 0) out.push(createNodeMarker("launchd.root-owned", LAUNCHD_NODE, "warn", `${s.stats.rootOwnedFiles} root-owned`, { iconKey: "alert-triangle" }));
    return out;
  }
];
const autoStatisticRules = [
  (report) => {
    const s = report.autoStatisticInfo;
    if (!s) return [];
    if (s.installationCount > 0) {
      return [createNodeMarker("autostat.count", AUTOSTAT_NODE, "info", `${s.installationCount} installations`)];
    }
    return [];
  }
];
const otherNodeRules = [
  ...licenseRules,
  ...netConfigRules,
  ...clientProxyRules,
  ...advancedVmInfoRules,
  ...hostInfoRules,
  ...moreHostInfoRules,
  ...loadedDriversRules,
  ...mountInfoRules,
  ...allProcessesRules,
  ...toolsLogRules,
  ...systemLogRules,
  ...vmDirectoryRules,
  ...guestCommandsRules,
  ...appConfigRules,
  ...installedSoftwareRules,
  ...launchdRules,
  ...autoStatisticRules
];
const allRules = [
  ...currentVmRules,
  ...otherNodeRules
  // Future: add more rule sets here
  // ...advancedVmRules,
  // ...hostInfoRules,
  // ...driverRules,
  // ...storageRules,
];
function evaluateRules(report) {
  const markers = [];
  for (const rule of allRules) {
    try {
      const ruleMarkers = rule(report);
      markers.push(...ruleMarkers);
    } catch (error) {
      console.warn("[PRV] Rule evaluation error:", error);
    }
  }
  return markers;
}
export {
  evaluateRules as e
};
