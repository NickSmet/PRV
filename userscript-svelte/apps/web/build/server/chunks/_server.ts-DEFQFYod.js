import { j as json } from './shared-server-sSGG17Df.js';
import { g as getReportusClient } from './reportus-mitmi8Tc.js';
import './index-BXzY6rwM.js';
import { c as createNodeMarker, a as createSubSectionMarker, b as createRowMarker, g as getNodeLevelMarkers } from './markers-DJqtn2GY.js';
import { e as ensureDomParser, f as fetchNodePayload, b as buildReportModelFromRawPayloads } from './runtime-BkNQ314W.js';

class TtlCache {
  constructor(ttlMs) {
    this.ttlMs = ttlMs;
  }
  #map = /* @__PURE__ */ new Map();
  get(key) {
    const entry = this.#map.get(key);
    if (!entry) return void 0;
    if (Date.now() > entry.expiresAt) {
      this.#map.delete(key);
      return void 0;
    }
    return entry.value;
  }
  set(key, value) {
    this.#map.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }
}
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
        iconKey: "hard-drive"
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
  // Cross-Node (RAM)
  tooMuchRamRule,
  unevenRamRule,
  // Chrome OS
  notPvmDefaultRule
];
const allRules = [
  ...currentVmRules
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
function humanFileSize(bytes, si) {
  const thresh = si ? 1e3 : 1024;
  if (!Number.isFinite(bytes)) return "—";
  if (Math.abs(bytes) < thresh) return `${bytes} B`;
  const units = si ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"] : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
  let u = -1;
  let value = bytes;
  do {
    value /= thresh;
    ++u;
  } while (Math.abs(value) >= thresh && u < units.length - 1);
  return `${value.toFixed(1)} ${units[u]}`;
}
function isNumericString(value) {
  return /^\d+(\.\d+)?$/.test(value.trim());
}
function formatMbytes(value, si = false) {
  const raw = value?.trim();
  if (!raw) return void 0;
  if (!isNumericString(raw)) return raw;
  const mbytes = Number(raw);
  if (!Number.isFinite(mbytes)) return raw;
  return humanFileSize(mbytes * 1024 * 1024, si);
}
function formatHddInterface(value) {
  const raw = value?.trim();
  if (!raw) return void 0;
  const map = {
    "0": "IDE",
    "1": "SCSI",
    "2": "SATA",
    "3": "NVMe"
  };
  if (!isNumericString(raw)) return raw;
  return map[raw] ?? raw;
}
function markerIconKeyToNodeIconKey(iconKey) {
  if (!iconKey) return void 0;
  switch (iconKey) {
    case "hard-drive":
      return "hdd";
    case "network":
    case "wifi-off":
      return "net";
    case "alert-triangle":
      return "warn";
    case "keyboard":
      return "keyboard";
    case "mouse":
      return "mouse";
    case "disc":
      return "disc";
    case "webcam":
      return "camera";
    case "bluetooth":
      return "bluetooth";
    case "usb":
      return "usb";
    case "printer":
      return "printer";
    case "cloud":
      return "cloud";
    case "folder-open":
      return "folder";
    case "clipboard":
      return "clipboard";
    case "clock":
      return "clock";
    case "shield":
      return "shield";
    case "cpu":
      return "cpu";
    default:
      return void 0;
  }
}
function markerSeverityToTone(severity) {
  if (severity === "danger") return "danger";
  if (severity === "warn") return "warn";
  return "info";
}
function applyNodeLevelMarkerBadges(node, markers) {
  const nodeLevel = getNodeLevelMarkers(markers, node.id);
  if (nodeLevel.length === 0) return node;
  const markerBadges = nodeLevel.map((m) => ({
    label: m.label,
    tone: markerSeverityToTone(m.severity),
    iconKey: markerIconKeyToNodeIconKey(m.iconKey)
  }));
  const seen = new Set(node.badges.map((b) => b.label));
  const merged = [...node.badges];
  for (const badge of markerBadges) {
    if (seen.has(badge.label)) continue;
    merged.push(badge);
    seen.add(badge.label);
  }
  return { ...node, badges: merged };
}
function buildNodesFromReport(report, markers = []) {
  const nodes = [
    buildCurrentVmNode(report.currentVm),
    buildGuestOsNode(report.guestOs),
    buildLicenseDataNode(report.license),
    buildNetConfigNode(report.network),
    buildAdvancedVmInfoNode(report.advancedVm),
    buildHostInfoNode(report.hostDevices),
    buildLoadedDriversNode(report.drivers),
    buildMountInfoNode(report.storage),
    buildAllProcessesNode(report.processes),
    buildMoreHostInfoNode(report.moreHostInfo),
    buildVmDirectoryNode(report.vmDirectory),
    buildGuestCommandsNode(report.guestCommands),
    buildAppConfigNode(report.appConfig),
    buildClientInfoNode(report.clientInfo),
    buildClientProxyInfoNode(report.proxy),
    buildInstalledSoftwareNode(report.installedSoftware),
    buildToolsLogNode(report.toolsLog),
    buildParallelsSystemLogNode(report.systemLog),
    buildLaunchdInfoNode(report.launchdInfo),
    buildAutoStatisticInfoNode(report.autoStatisticInfo),
    // TimeZone is rarely useful; keep it at the very end.
    buildTimeZoneNode(report.timezone)
  ];
  return nodes.map((n) => applyNodeLevelMarkerBadges(n, markers));
}
const maps = {
  hypervisor: { "0": "Parallels", "1": "Apple" },
  videoMode: { "0": "Scaled", "1": "Best for Retina", "2": "Best for external" },
  scaleToFit: { "0": "Off", "1": "Auto", "2": "Keep ratio", "3": "Stretch" },
  startAuto: {
    "0": "Never",
    "1": "When Mac Starts",
    "2": "—",
    "3": "When PD starts",
    "4": "When window opens",
    "5": "When user logs in"
  },
  startupView: { "0": "Same as last time", "1": "Window", "2": "Full Screen", "3": "Coherence", "4": "PiP", "5": "Headless" },
  onWindowClose: { "1": "Suspend", "4": "ShutDown", "0": "Force stop", "5": "Keep running", "2": "Ask" },
  onMacShutdown: { "0": "Stop", "1": "Suspend", "2": "Shut down" },
  onVmShutdown: { "0": "Keep window open", "1": "Close window", "3": "Quit PD" },
  keyboard: { "0": "Auto", "1": "Don't optimize", "2": "Optimize for games" },
  mouse: { "0": "Auto", "1": "Don't optimize", "2": "Optimize for games" }
};
function pushSection(sections, title, rows, extra) {
  const filtered = rows.filter((r) => r.value !== void 0 || r.badge !== void 0);
  const subSections = extra?.subSections ?? [];
  if (!filtered.length && !subSections.length) return;
  sections.push({ title, rows: filtered, ...extra });
}
function formatTimestamp(timestamp) {
  if (!timestamp) return void 0;
  const num = parseInt(timestamp, 10);
  if (isNaN(num)) return timestamp;
  if (timestamp.length === 13) {
    const date = new Date(num);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }
  return timestamp;
}
function toBadge(value, type = "enabled") {
  if (value === void 0) return {};
  const isOn = value === "1";
  if (type === "enabled") {
    return {
      badge: {
        label: isOn ? "Enabled" : "Disabled",
        variant: isOn ? "success" : "muted"
      }
    };
  }
  if (type === "yesNo") {
    return {
      badge: {
        label: isOn ? "Yes" : "No",
        variant: isOn ? "success" : "muted"
      }
    };
  }
  if (type === "onOff") {
    return {
      badge: {
        label: isOn ? "On" : "Off",
        variant: isOn ? "success" : "muted"
      }
    };
  }
  return {};
}
function buildCurrentVmNode(summary) {
  const badges = [];
  const sections = [];
  if (!summary) {
    return {
      id: "current-vm",
      title: "CurrentVm",
      badges: [{ label: "pending", tone: "info" }],
      sections: [{ title: "Info", rows: [{ label: "Status", value: "No data yet" }] }],
      openByDefault: false
    };
  }
  pushSection(sections, "Startup / Shutdown", [
    {
      label: "Start Automatically",
      value: maps.startAuto[summary.startAutomatically || ""] || summary.startAutomatically
    },
    { label: "Startup View", value: maps.startupView[summary.startupView || ""] || summary.startupView },
    ...summary.pauseAfter === "0" ? [{ label: "Pause After…", ...toBadge("0", "enabled") }] : [{
      label: "Pause After…",
      value: summary.pauseAfterTimeout ? `After ${summary.pauseAfterTimeout} sec.` : summary.pauseAfter
    }],
    { label: "Rollback Mode", ...toBadge(summary.rollbackMode, "enabled") },
    { label: "On Mac Shutdown", value: maps.onMacShutdown[summary.onMacShutdown || ""] || summary.onMacShutdown },
    { label: "On VM Shutdown", value: maps.onVmShutdown[summary.onVmShutdown || ""] || summary.onVmShutdown },
    { label: "On Window Close", value: maps.onWindowClose[summary.onWindowClose || ""] || summary.onWindowClose },
    { label: "Reclaim Disk Space", ...toBadge(summary.reclaimDiskSpace, "enabled") }
  ]);
  pushSection(sections, "General", [
    { label: "VM Name", value: summary.vmName },
    { label: "PVM Location", value: summary.vmHome, type: "path" },
    { label: "Creation Date", value: summary.creationDate, type: "datetime" },
    { label: "VM UUID", value: summary.vmUuid, type: "uuid" },
    { label: "Source UUID", value: summary.sourceVmUuid, type: "uuid" }
  ]);
  const hardwareRows = [
    { label: "CPUs", value: summary.cpuCount, iconKey: "cpu" },
    { label: "RAM (MB)", value: summary.ramMb, iconKey: "cpu" },
    { label: "VRAM", value: summary.vramMb === "0" ? "Auto" : summary.vramMb, iconKey: "monitor" },
    { label: "Resource Quota", value: summary.resourceQuota },
    { label: "Video Mode", value: maps.videoMode[summary.videoMode || ""] || summary.videoMode, iconKey: "monitor" },
    { label: "Scale To Fit Screen", value: maps.scaleToFit[summary.scaleToFit || ""] || summary.scaleToFit, iconKey: "monitor" },
    { label: "Mouse", value: maps.mouse[summary.mouse || ""] || summary.mouse, iconKey: "mouse" },
    { label: "Keyboard", value: maps.keyboard[summary.keyboard || ""] || summary.keyboard, iconKey: "keyboard" },
    { label: "Hypervisor", value: maps.hypervisor[summary.hypervisorType || ""] || summary.hypervisorType },
    { label: "Adaptive Hypervisor", value: summary.hypervisorType },
    { label: "Nested Virtualization", ...toBadge(summary.nestedVirtualization, "yesNo") },
    { label: "3D Acceleration", ...toBadge(summary.videoMode, "enabled"), iconKey: "monitor" }
  ];
  const hardwareSubSections = [];
  if (summary.netAdapters?.length) {
    const netRows = summary.netAdapters.flatMap((adapter, index) => [
      { label: "Type", value: adapter.adapterType, iconKey: "net" },
      { label: "Connected", ...toBadge(adapter.connected, "yesNo") },
      { label: "Mode", value: adapter.mode },
      { label: "Adapter name", value: adapter.adapterName },
      { label: "Mac", value: adapter.mac },
      { label: "Conditioner", ...toBadge(adapter.conditionerEnabled, "enabled") }
    ].filter((r) => r.value !== void 0 || r.badge !== void 0));
    hardwareSubSections.push({
      id: "networks",
      title: "Networks",
      iconKey: "net",
      rows: netRows
    });
  }
  const hddRows = summary.hdds?.length ? summary.hdds.flatMap((disk, index) => {
    const isExternalToBundle = typeof disk.location === "string" && (summary.externalVhddLocations ?? []).includes(disk.location);
    return [
      {
        label: "Location",
        value: disk.location,
        type: "path"
      },
      { label: "External to PVM", ...toBadge(isExternalToBundle ? "1" : "0", "yesNo") },
      { label: "Virtual Size", value: formatMbytes(disk.virtualSize) ?? disk.virtualSize },
      { label: "Actual Size", value: formatMbytes(disk.actualSize) ?? disk.actualSize },
      { label: "Interface", value: formatHddInterface(disk.interfaceType) ?? disk.interfaceType },
      { label: "Splitted", ...toBadge(disk.splitted === "0" ? "0" : "1", "yesNo") },
      { label: "Trim", ...toBadge(disk.trim, "enabled") },
      { label: "Expanding", ...toBadge(disk.expanding, "yesNo") }
    ].filter((r) => r.value !== void 0 || r.badge !== void 0);
  }) : [{ label: "No disks attached", badge: { label: "Empty", variant: "muted" } }];
  hardwareSubSections.push({
    id: "hdds",
    title: "HDDs",
    iconKey: "hdd",
    rows: hddRows
  });
  const cdRows = summary.cds?.length ? summary.cds.flatMap((cd, index) => [
    { label: "Location", value: cd.location, type: "path" },
    { label: "Interface", value: cd.interfaceType }
  ].filter((r) => r.value !== void 0)) : [{ label: "No CD/DVD drives", badge: { label: "Empty", variant: "muted" } }];
  hardwareSubSections.push({
    id: "cds",
    title: "CD / DVD",
    rows: cdRows
  });
  const usbRows = summary.usbDevices?.length ? summary.usbDevices.flatMap((usb, index) => {
    const formattedTimestamp = formatTimestamp(usb.timestamp);
    return [
      {
        label: usb.name || `USB Device ${index + 1}`,
        value: formattedTimestamp ? `Last connected: ${formattedTimestamp}` : void 0,
        iconKey: "usb",
        type: "datetime"
      }
    ];
  }).filter((r) => r.value !== void 0 || r.label) : [{ label: "No USB devices", badge: { label: "Empty", variant: "muted" } }];
  hardwareSubSections.push({
    id: "usbs",
    title: "USBs",
    iconKey: "usb",
    rows: usbRows
  });
  pushSection(sections, "Hardware", hardwareRows, {
    subSections: hardwareSubSections
  });
  pushSection(sections, "Sharing", [
    { label: "Isolated", ...toBadge(summary.isolated, "enabled"), iconKey: "shield" },
    { label: "Shared Profile", ...toBadge(summary.sharedProfile, "enabled"), iconKey: "folder" },
    { label: "Share Host Cloud", ...toBadge(summary.shareHostCloud, "enabled"), iconKey: "cloud" },
    { label: "Map Mac Volumes", ...toBadge(summary.mapMacVolumes, "enabled"), iconKey: "folder" },
    { label: "Access Guest from Host", ...toBadge(summary.accessGuestFromHost, "enabled"), iconKey: "net" },
    { label: "Share OneDrive with Host", ...toBadge(summary.shareOneDriveWithHost, "enabled"), iconKey: "cloud" },
    { label: "Share Guest Netw. Drives", ...toBadge(summary.shareGuestNetDrives, "enabled"), iconKey: "hdd" },
    { label: "Share Guest Extern. Drives", ...toBadge(summary.shareGuestExternDrives, "enabled"), iconKey: "hdd" },
    { label: "Shared Guest Apps", ...toBadge(summary.sharedGuestApps, "enabled") },
    { label: "Shared Host Apps", ...toBadge(summary.sharedHostApps, "enabled") },
    { label: "Clipboard", ...toBadge(summary.clipboardSync, "enabled"), iconKey: "clipboard" },
    { label: "Time Sync", ...toBadge(summary.timeSync, "enabled"), iconKey: "clock" }
  ]);
  pushSection(sections, "Other", [
    { label: "Smart Guard", ...toBadge(summary.smartGuard, "enabled"), iconKey: "shield" },
    { label: "Opt.TimeMachine", value: summary.smartGuardSchema, iconKey: "clock" },
    { label: "Boot Flags", value: summary.bootFlags },
    { label: "High-perf graphics", ...toBadge(summary.highPerfGraphics, "enabled"), iconKey: "monitor" }
  ], {
    subSections: summary.travelMode ? [
      {
        id: "travel",
        title: "Travel Mode",
        iconKey: "travel",
        rows: [
          {
            label: "Travel Mode",
            ...toBadge(summary.travelMode.enabled, "onOff")
          },
          {
            label: "Travel Enter",
            value: summary.travelMode.enterCode === "0" ? "Never" : summary.travelMode.enterCode === "1" ? "Always when on battery" : summary.travelMode.threshold ? `On battery below ${summary.travelMode.threshold}%` : summary.travelMode.enterCode
          },
          {
            label: "Travel Exit",
            value: summary.travelMode.quitCode === "0" ? "Never" : summary.travelMode.quitCode ? "On Connecting to Battery" : void 0
          }
        ]
      }
    ] : []
  });
  pushSection(sections, "Devices", [
    { label: "TPM", value: summary.tpm, iconKey: "shield" },
    { label: "Shared Bluetooth", ...toBadge(summary.sharedBluetooth, "enabled"), iconKey: "bluetooth" },
    { label: "Shared Camera", ...toBadge(summary.sharedCamera, "enabled"), iconKey: "camera" },
    { label: "USB 3.0", ...toBadge(summary.usb3, "enabled"), iconKey: "usb" },
    { label: "Shared CCID", ...toBadge(summary.sharedCCID, "enabled") },
    { label: "Share Host Printers", ...toBadge(summary.shareHostPrinters, "enabled"), iconKey: "printer" },
    { label: "Sync Default Printer", ...toBadge(summary.syncDefaultPrinter, "enabled"), iconKey: "printer" },
    { label: "Show Page Setup", ...toBadge(summary.showPageSetup, "enabled") }
  ]);
  if (summary.travelMode?.state === "1") badges.push({ label: "Travel Mode", tone: "warn", iconKey: "travel" });
  if (summary.macVm) badges.push({ label: "Mac VM", tone: "info", iconKey: "vm" });
  if (!summary.hdds?.length) badges.push({ label: "No HDD!!!", tone: "danger", iconKey: "hdd" });
  if (summary.netAdapters?.some((n) => n.connected === "0")) badges.push({ label: "NIC offline", tone: "warn", iconKey: "net" });
  return {
    id: "current-vm",
    title: "CurrentVm",
    badges,
    sections,
    openByDefault: true
  };
}
function buildGuestOsNode(summary) {
  const badges = [];
  const sections = [];
  if (!summary) {
    return {
      id: "guest-os",
      title: "GuestOs",
      badges: [{ label: "pending", tone: "info" }],
      sections: [{ title: "Info", rows: [{ label: "Status", value: "No data yet" }] }]
    };
  }
  const hasFriendlyName = !!summary.name && !!summary.version && summary.name !== summary.version;
  function releasedAgo(isoDate) {
    if (!isoDate) return void 0;
    const d = new Date(isoDate);
    if (!Number.isFinite(d.getTime())) return void 0;
    const now = Date.now();
    const ms = now - d.getTime();
    const days = Math.floor(ms / 864e5);
    if (!Number.isFinite(days)) return void 0;
    if (days < 0) return "in future";
    if (days < 1) return "today";
    if (days < 30) return `${days}d ago`;
    if (days < 365) return `${Math.floor(days / 30)}mo ago`;
    return `${Math.floor(days / 365)}y ago`;
  }
  const rel = summary.releaseDate ? `${summary.releaseDate}${releasedAgo(summary.releaseDate) ? ` (${releasedAgo(summary.releaseDate)})` : ""}` : void 0;
  pushSection(sections, "Guest OS", [
    { label: "Type", value: summary.type },
    { label: "Version", value: summary.name ?? summary.version },
    ...hasFriendlyName ? [{ label: "Version (raw)", value: summary.version }] : [],
    { label: "Released", value: rel },
    { label: "Kernel", value: summary.kernel }
  ]);
  return {
    id: "guest-os",
    title: "GuestOs",
    badges,
    sections
  };
}
function buildLicenseDataNode(summary) {
  const badges = [];
  const sections = [];
  if (!summary) {
    return {
      id: "license-data",
      title: "LicenseData",
      badges: [{ label: "pending", tone: "info" }],
      sections: [{ title: "Info", rows: [{ label: "Status", value: "No data yet" }] }]
    };
  }
  if (summary.isPirated) {
    badges.push({ label: "Pirated", tone: "danger" });
  }
  pushSection(sections, "License", [
    { label: "Type", value: summary.editionName },
    { label: "Expires", value: summary.expirationDate, type: "datetime" }
  ]);
  const propertyRows = [
    { label: "Auto renewable", ...toBadge(summary.isAutoRenewable ? "1" : "0", "yesNo") },
    { label: "Beta", ...toBadge(summary.isBeta ? "1" : "0", "yesNo") },
    { label: "Bytebot", ...toBadge(summary.isBytebot ? "1" : "0", "yesNo") },
    { label: "China", ...toBadge(summary.isChina ? "1" : "0", "yesNo") },
    { label: "Expired", ...toBadge(summary.isExpired ? "1" : "0", "yesNo") },
    { label: "Grace period", ...toBadge(summary.isGracePeriod ? "1" : "0", "yesNo") },
    { label: "NFR", ...toBadge(summary.isNfr ? "1" : "0", "yesNo") },
    { label: "Purchased online", ...toBadge(summary.isPurchasedOnline ? "1" : "0", "yesNo") },
    { label: "Sublicense", ...toBadge(summary.isSublicense ? "1" : "0", "yesNo") },
    { label: "Suspended", ...toBadge(summary.isSuspended ? "1" : "0", "yesNo") },
    { label: "Trial", ...toBadge(summary.isTrial ? "1" : "0", "yesNo") },
    { label: "Upgrade", ...toBadge(summary.isUpgrade ? "1" : "0", "yesNo") }
  ];
  pushSection(sections, "Properties", propertyRows);
  return {
    id: "license-data",
    title: "LicenseData",
    badges,
    sections
  };
}
function buildNetConfigNode(summary) {
  const badges = [];
  const sections = [];
  if (!summary) {
    return {
      id: "net-config",
      title: "NetConfig",
      badges: [{ label: "pending", tone: "info" }],
      sections: [{ title: "Info", rows: [{ label: "Status", value: "No data yet" }] }]
    };
  }
  if (summary.kextlessMode === "kextless") {
    badges.push({ label: "Kextless", tone: "info" });
  } else if (summary.kextlessMode === "kext") {
    badges.push({ label: "Kext", tone: "info" });
  }
  if (!summary.hasSharedNetwork || !summary.hasHostOnlyNetwork) {
    badges.push({ label: "Network missing", tone: "warn" });
  }
  pushSection(sections, "Network Configuration", [
    { label: "Kextless Mode", value: summary.kextlessMode }
  ]);
  const networkRowsRaw = summary.networks.flatMap(
    (net, index) => [
      { label: `Network ${index + 1}`, value: net.name },
      { label: "DHCP IP", value: net.dhcpIp },
      { label: "Net Mask", value: net.netMask },
      { label: "Host IP", value: net.hostIp },
      { label: "DHCP Enabled", ...toBadge(net.dhcpEnabled, "yesNo") },
      { label: "IPv6 DHCP Enabled", ...toBadge(net.dhcpV6Enabled, "yesNo") }
    ]
  );
  const networkRows = networkRowsRaw.filter((r) => r.value !== void 0 || r.badge !== void 0);
  pushSection(sections, "Virtual Networks", networkRows);
  return {
    id: "net-config",
    title: "NetConfig",
    badges,
    sections,
    data: summary
  };
}
function buildAdvancedVmInfoNode(summary) {
  const badges = [];
  const sections = [];
  if (!summary) {
    return {
      id: "advanced-vm-info",
      title: "AdvancedVmInfo",
      badges: [{ label: "pending", tone: "info" }],
      sections: [{ title: "Info", rows: [{ label: "Status", value: "No data yet" }] }]
    };
  }
  if (summary.snapshotCount === 0) {
    badges.push({ label: "No snapshots", tone: "info" });
  } else {
    badges.push({ label: `${summary.snapshotCount} snapshots`, tone: "info" });
  }
  if (summary.hasAclIssues) {
    badges.push({ label: "ACL issues", tone: "warn" });
  }
  if (summary.hasRootOwner) {
    badges.push({ label: "Root owner", tone: "warn" });
  }
  if (summary.hasDeleteSnapshotOp) {
    badges.push({ label: "Delete snapshot op", tone: "danger" });
  }
  if (summary.mainSnapshotMissing) {
    badges.push({ label: "Main snapshot missing", tone: "danger" });
  }
  const snapshotRows = summary.snapshots.length ? summary.snapshots.map((snap, index) => ({
    label: snap.name || `Snapshot ${index + 1}`,
    value: snap.dateTime,
    type: "datetime"
  })) : [{ label: "No snapshots", badge: { label: "Empty", variant: "muted" } }];
  pushSection(sections, "Snapshots", snapshotRows);
  const bundleRows = [];
  if (summary.pvmBundleTree?.path) {
    bundleRows.push({ label: "Root", value: summary.pvmBundleTree.path, type: "path" });
  } else {
    bundleRows.push({ label: "Status", value: "No PVM bundle file list" });
  }
  pushSection(sections, "PVM Bundle", bundleRows);
  return {
    id: "advanced-vm-info",
    title: "AdvancedVmInfo",
    badges,
    sections,
    data: summary
  };
}
function buildHostInfoNode(summary) {
  const badges = [];
  const sections = [];
  if (!summary) {
    return {
      id: "host-info",
      title: "HostInfo",
      badges: [{ label: "pending", tone: "info" }],
      sections: [{ title: "Info", rows: [{ label: "Status", value: "No data yet" }] }]
    };
  }
  const osName = summary.system.os.name ?? null;
  const osVersion = summary.system.os.version ?? null;
  const hostRamGb = summary.system.memory.hostRamGb ?? null;
  if (osName && osVersion) badges.push({ label: `${osName} ${osVersion}`, tone: "info" });
  else if (summary.system.os.displayString) badges.push({ label: summary.system.os.displayString, tone: "info" });
  if (hostRamGb !== null) badges.push({ label: `${hostRamGb}GB RAM`, tone: "info" });
  if (summary.flags.lowMemory) badges.push({ label: "High memory usage", tone: "warn", iconKey: "warn" });
  if (summary.flags.privacyRestricted) badges.push({ label: "Privacy restricted", tone: "warn", iconKey: "shield" });
  if (summary.hasDisplayLink) badges.push({ label: "DisplayLink", tone: "warn", iconKey: "vm" });
  if (summary.flags.hasExternalDisks) badges.push({ label: "External disk", tone: "info", iconKey: "hdd" });
  if (summary.flags.hasUsbCamera) badges.push({ label: "USB camera", tone: "info", iconKey: "camera" });
  if (summary.flags.hasBluetoothAudio) badges.push({ label: "BT audio", tone: "info", iconKey: "bluetooth" });
  return {
    id: "host-info",
    title: "HostInfo",
    badges,
    sections,
    data: summary
  };
}
function buildLoadedDriversNode(summary) {
  const badges = [];
  const sections = [];
  if (!summary) {
    return {
      id: "loaded-drivers",
      title: "LoadedDrivers",
      badges: [{ label: "pending", tone: "info" }],
      sections: [{ title: "Info", rows: [{ label: "Status", value: "No data yet" }] }]
    };
  }
  if (summary.isHackintosh) {
    badges.push({ label: "Hackintosh", tone: "danger" });
  } else if (summary.hasNonAppleKexts && !summary.hasPrlKexts) {
    badges.push({ label: "No PRL kexts", tone: "warn" });
  } else if (summary.onlyApple) {
    badges.push({ label: "Only Apple", tone: "info" });
  } else if (summary.hasNonAppleKexts) {
    badges.push({ label: "Non-Apple kexts", tone: "warn" });
  }
  const kextRows = [];
  if (summary.onlyApple) {
    kextRows.push({ label: "Status", value: "Only Apple kexts (as expected)" });
  } else {
    if (summary.nonAppleKexts.length > 0) {
      summary.nonAppleKexts.forEach((kext, index) => {
        const isBad = summary.badKexts.includes(kext);
        kextRows.push({
          label: `Kext ${index + 1}`,
          value: kext,
          badge: isBad ? { label: "Bad", variant: "destructive" } : void 0
        });
      });
    }
    if (!summary.hasPrlKexts && !summary.onlyApple) {
      kextRows.unshift({
        label: "Warning",
        value: "No Parallels kexts found",
        badge: { label: "Missing", variant: "destructive" }
      });
    }
  }
  pushSection(sections, "Loaded Drivers", kextRows.length > 0 ? kextRows : [
    { label: "Kexts", value: `${summary.kexts.length} loaded` }
  ]);
  return {
    id: "loaded-drivers",
    title: "LoadedDrivers",
    badges,
    sections
  };
}
function buildMountInfoNode(summary) {
  const badges = [];
  const sections = [];
  if (!summary) {
    return {
      id: "mount-info",
      title: "MountInfo",
      badges: [{ label: "pending", tone: "info" }],
      sections: [{ title: "Info", rows: [{ label: "Status", value: "No data yet" }] }]
    };
  }
  if (summary.hddFull) {
    badges.push({ label: "HDD FULL!", tone: "danger" });
  } else if (summary.lowStorage) {
    badges.push({ label: "Low storage", tone: "warn" });
  }
  if (summary.hasNtfsVolumes) {
    badges.push({ label: "NTFS detected", tone: "info" });
  }
  return {
    id: "mount-info",
    title: "MountInfo",
    badges,
    sections,
    data: summary
  };
}
function buildAllProcessesNode(summary) {
  const badges = [];
  const sections = [];
  if (!summary) {
    return {
      id: "all-processes",
      title: "AllProcesses",
      badges: [{ label: "pending", tone: "info" }],
      sections: [{ title: "Info", rows: [{ label: "Status", value: "No data yet" }] }]
    };
  }
  if (summary.hasBsdtarIssue) {
    badges.push({ label: "bsdtar", tone: "danger" });
  }
  const total = summary.items?.length ?? 0;
  const apps = summary.items?.filter(
    (p) => p.type === "macos-app" || p.type === "third-party-app" || p.type === "windows-store-app"
  ).length ?? 0;
  const services = summary.items?.filter((p) => p.type === "service").length ?? 0;
  const other = Math.max(0, total - apps - services);
  pushSection(sections, "Overview", [
    { label: "Processes parsed", value: String(total) },
    { label: "Apps", value: String(apps) },
    { label: "Services", value: String(services) },
    { label: "Other", value: String(other) },
    summary.top?.timestamp ? { label: "Top snapshot", value: summary.top.timestamp } : void 0,
    summary.top?.loadAvg?.one != null ? { label: "Load Avg", value: `${summary.top.loadAvg.one}, ${summary.top.loadAvg.five}, ${summary.top.loadAvg.fifteen}` } : void 0,
    summary.top?.cpu?.user != null ? { label: "CPU usage", value: `${summary.top.cpu.user}% user, ${summary.top.cpu.sys}% sys, ${summary.top.cpu.idle}% idle` } : void 0
  ].filter(Boolean));
  const topCpuRows = summary.topCpuProcesses.map((proc, index) => ({
    label: `${index + 1}. ${proc.name.substring(0, 40)}`,
    value: `${proc.cpu.toFixed(1)}% CPU (${proc.user})`
  }));
  pushSection(sections, "Top CPU Usage", topCpuRows);
  const topMemRows = summary.topMemProcesses.map((proc, index) => ({
    label: `${index + 1}. ${proc.name.substring(0, 40)}`,
    value: `${proc.mem.toFixed(1)}% Memory (${proc.user})`
  }));
  pushSection(sections, "Top Memory Usage", topMemRows);
  return {
    id: "all-processes",
    title: "AllProcesses",
    badges,
    sections,
    data: summary
  };
}
function buildMoreHostInfoNode(summary) {
  const badges = [];
  const sections = [];
  if (!summary) {
    return {
      id: "more-host-info",
      title: "MoreHostInfo",
      badges: [{ label: "pending", tone: "info" }],
      sections: [{ title: "Info", rows: [{ label: "Status", value: "No data yet" }] }]
    };
  }
  if (summary.hasNoDisplays) {
    badges.push({ label: "No displays", tone: "warn" });
  } else {
    badges.push({ label: `${summary.displayCount} displays`, tone: "info" });
  }
  pushSection(sections, "Overview", [
    { label: "GPUs", value: String(summary.gpus.length) },
    { label: "Displays", value: String(summary.displayCount) }
  ]);
  return {
    id: "more-host-info",
    title: "MoreHostInfo",
    badges,
    sections,
    data: summary
  };
}
function buildVmDirectoryNode(summary) {
  const badges = [];
  const sections = [];
  if (!summary) {
    return {
      id: "vm-directory",
      title: "VmDirectory",
      badges: [{ label: "pending", tone: "info" }],
      sections: [{ title: "Info", rows: [{ label: "Status", value: "No data yet" }] }]
    };
  }
  if (summary.vmCount > 0) {
    badges.push({ label: `${summary.vmCount} VMs`, tone: "info" });
  } else {
    badges.push({ label: "No VMs", tone: "warn" });
  }
  const vmRows = summary.vms.length > 0 ? summary.vms.flatMap((vm, index) => [
    { label: `VM ${index + 1}`, value: vm.name },
    { label: "Location", value: vm.location },
    { label: "UUID", value: vm.uuid, type: "uuid" },
    { label: "Registered", value: vm.registeredOn, type: "datetime" }
  ].filter((r) => r.value !== void 0)) : [{ label: "No VMs found", badge: { label: "Empty", variant: "muted" } }];
  pushSection(sections, "Virtual Machines", vmRows);
  return {
    id: "vm-directory",
    title: "VmDirectory",
    badges,
    sections,
    data: summary
  };
}
function buildGuestCommandsNode(summary) {
  const badges = [];
  const sections = [];
  if (!summary) {
    return {
      id: "guest-commands",
      title: "GuestCommands",
      badges: [{ label: "pending", tone: "info" }],
      sections: [{ title: "Info", rows: [{ label: "Status", value: "No data yet" }] }]
    };
  }
  if (summary.isLinux) {
    return {
      id: "guest-commands",
      title: "GuestCommands",
      badges: [{ label: "Linux", tone: "info" }],
      sections: [{ title: "Info", rows: [{ label: "Status", value: "It's Linux. Look inside." }] }],
      data: summary
    };
  }
  if (summary.isEmpty) {
    badges.push({ label: "Empty", tone: "warn" });
  }
  const systemRows = summary.system ? [
    { label: "Hostname", value: summary.system.hostname },
    { label: "Processor count", value: summary.system.processorCount?.toString() },
    { label: "Architecture", value: summary.system.architecture }
  ].filter((r) => r.value !== void 0) : [{ label: "No system info", badge: { label: "Empty", variant: "muted" } }];
  pushSection(sections, "System", systemRows);
  const adapters = summary.network?.adapters ?? [];
  const adapterRows = adapters.length > 0 ? adapters.flatMap((adapter) => [
    { label: "Adapter", value: adapter.name },
    { label: "Description", value: adapter.description },
    { label: "IPv4", value: adapter.ip },
    { label: "IPv6", value: adapter.ipv6 },
    { label: "Gateway", value: adapter.gateway },
    { label: "DHCP", value: adapter.dhcpEnabled === void 0 ? void 0 : adapter.dhcpEnabled ? "Enabled" : "Disabled" },
    { label: "DNS", value: adapter.dns?.join(", ") }
  ].filter((r) => r.value !== void 0)) : [{ label: "No adapters", badge: { label: "Empty", variant: "muted" } }];
  pushSection(sections, "Network Adapters", adapterRows);
  const drives = summary.network?.drives ?? [];
  const driveRows = drives.length > 0 ? drives.flatMap((drive) => [
    { label: "Drive", value: drive.letter ? `${drive.letter}:` : void 0 },
    { label: "Remote", value: drive.remotePath },
    { label: "Provider", value: drive.provider },
    { label: "Status", value: drive.status === "Other" ? drive.statusRaw ?? "Other" : drive.status }
  ].filter((r) => r.value !== void 0)) : [{ label: "No network drives", badge: { label: "Empty", variant: "muted" } }];
  pushSection(sections, "Network Volumes", driveRows);
  const processes = summary.processes ?? [];
  const totals = summary.totals;
  const processesPreview = processes.slice(0, 5);
  const processRows = processesPreview.length > 0 ? [
    ...totals?.cpuPercent !== void 0 || totals?.memoryKb !== void 0 ? [{
      label: "Totals",
      value: `${totals?.cpuPercent?.toFixed?.(2) ?? totals?.cpuPercent ?? "?"}% CPU, ${totals?.memoryKb ?? "?"} KB`
    }] : [],
    ...processesPreview.map((proc, index) => ({
      label: `${index + 1}.`,
      value: [
        proc.cpuPercent === void 0 ? void 0 : `${proc.cpuPercent.toFixed(2)}%`,
        proc.memoryKb === void 0 ? void 0 : `${proc.memoryKb} KB`,
        proc.pid === void 0 ? void 0 : `pid=${proc.pid}`,
        proc.architecture,
        proc.user,
        proc.path
      ].filter(Boolean).join(" ")
    }))
  ] : [{ label: "No processes", badge: { label: "Empty", variant: "muted" } }];
  pushSection(sections, "Processes", processRows);
  const powerRequests = summary.powerRequests ?? [];
  const powerRows = powerRequests.length > 0 ? powerRequests.map((req, index) => ({
    label: `${index + 1}. ${req.type ?? "Unknown"}`,
    value: [req.requestor, req.path].filter(Boolean).join(" ")
  })) : [{ label: "No power requests", badge: { label: "Empty", variant: "muted" } }];
  pushSection(sections, "Power Requests", powerRows);
  return {
    id: "guest-commands",
    title: "GuestCommands",
    badges,
    sections,
    data: summary
  };
}
function buildAppConfigNode(summary) {
  const badges = [];
  const sections = [];
  if (!summary) {
    return {
      id: "app-config",
      title: "AppConfig",
      badges: [{ label: "pending", tone: "info" }],
      sections: [{ title: "Info", rows: [{ label: "Status", value: "No data yet" }] }]
    };
  }
  if (summary.isUserDefinedOnDisconnectedServer) {
    return {
      id: "app-config",
      title: "AppConfig",
      badges: [{ label: "Disconnected", tone: "warn" }],
      sections: [{ title: "Info", rows: [{ label: "Status", value: "UserDefinedOnDisconnectedServer" }] }]
    };
  }
  if (summary.verboseLoggingEnabled) {
    badges.push({ label: "Verbose logging", tone: "info" });
  }
  if (summary.hasExternalVmFolder) {
    badges.push({ label: "External VM folder", tone: "info" });
  }
  if (summary.usbPermanentAssignments.length > 0) {
    badges.push({ label: "USB assignments", tone: "info" });
  }
  const settingsRows = [
    { label: "Verbose Logging", ...toBadge(summary.verboseLoggingEnabled ? "1" : "0", "yesNo") }
  ];
  pushSection(sections, "Settings", settingsRows);
  if (summary.defaultVmFolders.length > 0) {
    const folderRows = summary.defaultVmFolders.map((folder) => ({
      label: "Folder",
      value: folder,
      badge: folder.startsWith("/Volumes") ? { label: "External", variant: "secondary" } : void 0
    }));
    pushSection(sections, "Default VM Folders", folderRows);
  }
  if (summary.usbPermanentAssignments.length > 0) {
    const usbRows = summary.usbPermanentAssignments.flatMap((usb) => [
      { label: "Device", value: usb.friendlyName },
      { label: "ID", value: usb.systemName },
      { label: "Connect to", value: usb.connectTo }
    ].filter((r) => r.value !== void 0));
    pushSection(sections, "USB Permanent Assignments", usbRows);
  }
  return {
    id: "app-config",
    title: "AppConfig",
    badges,
    sections
  };
}
function buildClientInfoNode(summary) {
  const badges = [];
  const sections = [];
  if (!summary) {
    return {
      id: "client-info",
      title: "ClientInfo",
      badges: [{ label: "pending", tone: "info" }],
      sections: [{ title: "Info", rows: [{ label: "Status", value: "No data yet" }] }]
    };
  }
  if (summary.accountEmail) {
    pushSection(sections, "Account", [
      { label: "Email", value: summary.accountEmail }
    ]);
  }
  if (summary.pdPreferences.length > 0) {
    const prefRows = summary.pdPreferences.map((pref) => ({
      label: pref.name,
      value: pref.value
    }));
    pushSection(sections, "PD Preferences", prefRows);
  }
  if (summary.sharedAppsPreferences.length > 0) {
    const sharedAppsRows = summary.sharedAppsPreferences.flatMap(
      (vm) => vm.preferences.flatMap((pref) => [
        { label: "VM UUID", value: vm.vmUuid, type: "uuid" },
        { label: pref.name, value: pref.value }
      ])
    );
    pushSection(sections, "Shared Apps Preferences", sharedAppsRows);
  }
  return {
    id: "client-info",
    title: "ClientInfo",
    badges,
    sections
  };
}
function buildClientProxyInfoNode(summary) {
  const badges = [];
  const sections = [];
  if (!summary) {
    return {
      id: "client-proxy-info",
      title: "ClientProxyInfo",
      badges: [{ label: "pending", tone: "info" }],
      sections: [{ title: "Info", rows: [{ label: "Status", value: "No data yet" }] }]
    };
  }
  if (summary.httpProxyEnabled) {
    badges.push({ label: "HTTP proxy enabled", tone: "warn" });
  } else {
    badges.push({ label: "No proxy", tone: "info" });
  }
  pushSection(sections, "Proxy Settings", [
    { label: "HTTP Proxy", ...toBadge(summary.httpProxyEnabled ? "1" : "0", "yesNo") }
  ]);
  return {
    id: "client-proxy-info",
    title: "ClientProxyInfo",
    badges,
    sections
  };
}
function buildInstalledSoftwareNode(summary) {
  const badges = [];
  const sections = [];
  if (!summary) {
    return {
      id: "installed-software",
      title: "InstalledSoftware",
      badges: [{ label: "pending", tone: "info" }],
      sections: [{ title: "Info", rows: [{ label: "Status", value: "No data yet" }] }]
    };
  }
  badges.push({ label: `${summary.appCount} apps`, tone: "info" });
  const appRows = summary.apps.length > 0 ? summary.apps.map((app) => ({
    label: app.name,
    value: app.version
  })) : [{ label: "No apps", badge: { label: "Empty", variant: "muted" } }];
  pushSection(sections, "Installed Applications", appRows);
  return {
    id: "installed-software",
    title: "InstalledSoftware",
    badges,
    sections
  };
}
function buildTimeZoneNode(summary) {
  const badges = [];
  const sections = [];
  if (!summary) {
    return {
      id: "timezone",
      title: "TimeZone",
      badges: [{ label: "pending", tone: "info" }],
      sections: [{ title: "Info", rows: [{ label: "Status", value: "No data yet" }] }]
    };
  }
  pushSection(sections, "Timezone Information", [
    { label: "Timezone Offset", value: summary.timezoneOffsetStr }
  ]);
  return {
    id: "timezone",
    title: "TimeZone",
    badges,
    sections
  };
}
function buildToolsLogNode(summary) {
  const badges = [];
  const sections = [];
  if (!summary) {
    return {
      id: "tools-log",
      title: "tools.log",
      badges: [{ label: "pending", tone: "info" }],
      sections: [{ title: "Info", rows: [{ label: "Status", value: "No data yet" }] }]
    };
  }
  if (!summary.isWindows) {
    badges.push({ label: "Not Windows", tone: "info" });
  } else {
    if (summary.status === "success") {
      badges.push({ label: "Successful", tone: "info" });
    } else if (summary.status === "error") {
      badges.push({ label: "Failed", tone: "danger" });
    } else if (summary.status === "warning") {
      badges.push({ label: "Warning", tone: "warn" });
    } else if (summary.status === "empty") {
      badges.push({ label: "Empty", tone: "warn" });
    }
  }
  if (summary.hasCorruptRegistry) {
    badges.push({ label: "Corrupt Registry", tone: "danger" });
  }
  if (summary.hasPrlDdIssue && summary.kbArticle) {
    badges.push({ label: summary.kbArticle, tone: "danger" });
  }
  const logRows = summary.entries.length > 0 ? summary.entries.map((entry) => ({
    label: entry.timestamp,
    value: entry.message
  })) : [{ label: "No entries", badge: { label: "Empty", variant: "muted" } }];
  pushSection(sections, "Installation Log", logRows);
  if (summary.hasCorruptRegistry || summary.hasPrlDdIssue) {
    const issueRows = [];
    if (summary.hasCorruptRegistry) {
      issueRows.push({
        label: "Registry Database",
        badge: { label: "Corrupt", variant: "destructive" }
      });
    }
    if (summary.hasPrlDdIssue) {
      issueRows.push({
        label: "prl_dd.inf issue",
        value: summary.kbArticle,
        badge: { label: "KB125243", variant: "destructive" }
      });
    }
    pushSection(sections, "Detected Issues", issueRows);
  }
  return {
    id: "tools-log",
    title: "tools.log",
    badges,
    sections
  };
}
function buildParallelsSystemLogNode(summary) {
  const badges = [];
  const sections = [];
  if (!summary) {
    return {
      id: "parallels-system-log",
      title: "parallels-system.log",
      badges: [{ label: "pending", tone: "info" }],
      sections: [{ title: "Info", rows: [{ label: "Status", value: "No data yet" }] }]
    };
  }
  if (summary.hasCoherenceDump) {
    badges.push({ label: "Coherence dumps", tone: "warn" });
  }
  pushSection(sections, "System Log Analysis", [
    {
      label: "Coherence State Dumps",
      value: summary.hasCoherenceDump ? `${summary.coherenceDumpCount} found` : "None found",
      badge: summary.hasCoherenceDump ? { label: "Present", variant: "default" } : { label: "None", variant: "outline" }
    }
  ]);
  return {
    id: "parallels-system-log",
    title: "parallels-system.log",
    badges,
    sections
  };
}
function buildLaunchdInfoNode(summary) {
  const badges = [];
  const sections = [];
  if (!summary) {
    return {
      id: "launchd-info",
      title: "LaunchdInfo",
      badges: [{ label: "pending", tone: "info" }],
      sections: [{ title: "Info", rows: [{ label: "Status", value: "No data yet" }] }]
    };
  }
  if (summary.stats) {
    badges.push({ label: `${summary.stats.files} files`, tone: "info" });
    if (summary.stats.rootOwnedFiles > 0) {
      badges.push({ label: `${summary.stats.rootOwnedFiles} root-owned`, tone: "warn" });
    }
  }
  pushSection(sections, "Launchd Daemons & Agents", [
    { label: "Status", value: summary.tree ? "Parsed as tree" : "Parsed as listing" }
  ]);
  return {
    id: "launchd-info",
    title: "LaunchdInfo",
    badges,
    sections,
    data: summary
  };
}
function buildAutoStatisticInfoNode(summary) {
  const badges = [];
  const sections = [];
  if (!summary) {
    return {
      id: "auto-statistic-info",
      title: "AutoStatisticInfo",
      badges: [{ label: "pending", tone: "info" }],
      sections: [{ title: "Info", rows: [{ label: "Status", value: "No data yet" }] }]
    };
  }
  if (summary.installationCount > 0) {
    badges.push({ label: `${summary.installationCount} installations`, tone: "info" });
  }
  const installRows = summary.installations.length > 0 ? summary.installations.map((install) => ({
    label: install.version,
    value: install.date,
    type: "datetime"
  })) : [{ label: "No installations", badge: { label: "Empty", variant: "muted" } }];
  pushSection(sections, "PD Installation History", installRows);
  return {
    id: "auto-statistic-info",
    title: "AutoStatisticInfo",
    badges,
    sections
  };
}
const payloadCache = new TtlCache(10 * 60 * 1e3);
const defaultNodes = [
  "TimeZone",
  "CurrentVm",
  "GuestOs",
  "LicenseData",
  "NetConfig",
  "AdvancedVmInfo",
  "HostInfo",
  "LoadedDrivers",
  "MountInfo",
  "AllProcesses",
  "MoreHostInfo",
  "VmDirectory",
  "GuestCommands",
  "AppConfig",
  "ClientInfo",
  "ClientProxyInfo",
  "InstalledSoftware",
  "LaunchdInfo",
  "AutoStatisticInfo",
  "ToolsLog",
  "ParallelsSystemLog"
];
const GET = async ({ params }) => {
  ensureDomParser();
  const client = getReportusClient();
  const index = await client.getReportIndex(params.id);
  const raw = {};
  for (const nodeKey of defaultNodes) {
    const cacheKey = `${params.id}::${nodeKey}`;
    const cached = payloadCache.get(cacheKey);
    if (cached) {
      raw[nodeKey] = cached.text;
      continue;
    }
    const payload = await fetchNodePayload(client, params.id, index, nodeKey, { maxBytes: 2 * 1024 * 1024 });
    if (!payload) continue;
    payloadCache.set(cacheKey, { text: payload.text, truncated: payload.truncated });
    raw[nodeKey] = payload.text;
  }
  const { report } = buildReportModelFromRawPayloads(raw);
  const markers = evaluateRules(report);
  const nodes = buildNodesFromReport(report, markers);
  return json({ nodes, markers });
};

export { GET };
//# sourceMappingURL=_server.ts-DEFQFYod.js.map
