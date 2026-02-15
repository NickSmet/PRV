import { p as parseHTML, f as fxpExports } from './index-BXzY6rwM.js';

function monthToNumber(month) {
  const map = {
    jan: 1,
    feb: 2,
    mar: 3,
    apr: 4,
    may: 5,
    jun: 6,
    jul: 7,
    aug: 8,
    sep: 9,
    oct: 10,
    nov: 11,
    dec: 12
  };
  return map[month.trim().toLowerCase()];
}
function humanFileSize$1(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
}
function parseLsMeta(line) {
  const trimmed = line.trim();
  if (!trimmed) return void 0;
  if (trimmed.startsWith("total ")) return void 0;
  if (trimmed === "." || trimmed === "..") return void 0;
  if (trimmed.startsWith("com.apple.") || trimmed.startsWith("com.parallels.")) return void 0;
  const tokens = trimmed.split(/\s+/);
  if (tokens.length < 9) return void 0;
  const permissions = tokens[0];
  if (!/^[bcdlps\-][rwx\-+]{8,11}@?$/.test(permissions)) return void 0;
  const hardLinks = Number.parseInt(tokens[1], 10);
  const owner = tokens[2];
  const group = tokens[3];
  const flags = tokens[4];
  const sizeBytes = Number.parseInt(tokens[5], 10);
  const monthToken = tokens[6];
  const dayToken = tokens[7];
  const next = tokens[8];
  const month = monthToNumber(monthToken);
  const day = Number.parseInt(dayToken, 10);
  let time;
  let year;
  let nameStart = 9;
  if (next.includes(":")) {
    time = next;
    const yearToken = tokens[9];
    if (/^\d{4}$/.test(yearToken)) {
      year = Number.parseInt(yearToken, 10);
      nameStart = 10;
    }
  } else if (/^\d{4}$/.test(next)) {
    year = Number.parseInt(next, 10);
  }
  const name = tokens.slice(nameStart).join(" ").trim();
  if (!name || name === "." || name === "..") return void 0;
  const rawParts = [monthToken, dayToken, time, year ? String(year) : void 0].filter(Boolean);
  const meta = {
    permissions,
    hardLinks: Number.isFinite(hardLinks) ? hardLinks : void 0,
    owner: owner || void 0,
    group: group || void 0,
    flags: flags || void 0,
    sizeBytes: Number.isFinite(sizeBytes) ? sizeBytes : void 0,
    sizeHuman: Number.isFinite(sizeBytes) ? humanFileSize$1(sizeBytes) : void 0,
    modified: {
      raw: rawParts.join(" "),
      year,
      month,
      day: Number.isFinite(day) ? day : void 0,
      time
    }
  };
  const kind = permissions.startsWith("d") ? "folder" : "file";
  return { kind, name, meta };
}
function sortTree(node) {
  node.children = node.children.slice().sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === "folder" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  for (const child of node.children) {
    if (child.kind === "folder") sortTree(child);
  }
}
function normalizeAbsPath(pathLike) {
  const trimmed = pathLike.trim();
  if (!trimmed) return "";
  const withLeading = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  const collapsed = withLeading.replace(/\/{2,}/g, "/");
  if (collapsed.length > 1 && collapsed.endsWith("/")) return collapsed.slice(0, -1);
  return collapsed;
}
function dirnamePosix(absPath) {
  const p = normalizeAbsPath(absPath);
  if (p === "/" || p === "") return "/";
  const idx = p.lastIndexOf("/");
  if (idx <= 0) return "/";
  return p.slice(0, idx);
}
function basenamePosix(absPath) {
  const p = normalizeAbsPath(absPath);
  if (p === "/" || p === "") return "/";
  const idx = p.lastIndexOf("/");
  return idx >= 0 ? p.slice(idx + 1) : p;
}
function inferRootPvmPathFromHeaders(lines) {
  for (const line of lines) {
    const match = /^\/([^:\r\n]+):\s*$/.exec(line.trim());
    if (!match) continue;
    const fullPath = `/${match[1]}`;
    const idx = fullPath.lastIndexOf(".pvm");
    if (idx < 0) continue;
    return fullPath.slice(0, idx + 4);
  }
  return void 0;
}
function parseLsLrTree(rawLs, options) {
  if (!rawLs || rawLs.trim().length === 0) return void 0;
  const lines = rawLs.split(/\r?\n/);
  const inferredRootPath = inferRootPvmPathFromHeaders(lines);
  const rootPath = options?.rootPath ? normalizeAbsPath(options.rootPath) : inferredRootPath ? normalizeAbsPath(inferredRootPath) : void 0;
  const root = {
    kind: "folder",
    name: rootPath ? basenamePosix(rootPath) : options?.rootName ?? "root",
    path: rootPath,
    children: []
  };
  const folderByPath = /* @__PURE__ */ new Map();
  const childKeysByFolderPath = /* @__PURE__ */ new Map();
  const rootKey = rootPath ?? "/";
  folderByPath.set(rootKey, root);
  const ensureFolder = (folderPathAbs) => {
    const abs = normalizeAbsPath(folderPathAbs);
    const key = rootPath ? abs : abs;
    const existing = folderByPath.get(key);
    if (existing) return existing;
    const created = { kind: "folder", name: basenamePosix(abs), path: abs, children: [] };
    folderByPath.set(key, created);
    const parentPath = dirnamePosix(abs);
    const shouldAttachToVirtualRoot = !rootPath;
    const shouldAttachUnderRootPath = rootPath && abs.startsWith(rootPath) && abs !== rootPath;
    if (shouldAttachToVirtualRoot || shouldAttachUnderRootPath) {
      const parentKey = rootPath ? parentPath && parentPath.startsWith(rootPath) ? parentPath : rootPath : parentPath || "/";
      const parent = ensureFolder(parentKey);
      const keys = childKeysByFolderPath.get(parentKey) ?? /* @__PURE__ */ new Set();
      if (!childKeysByFolderPath.has(parentKey)) childKeysByFolderPath.set(parentKey, keys);
      if (!keys.has(key)) {
        keys.add(key);
        parent.children.push(created);
      }
    }
    return created;
  };
  let currentDir = rootPath;
  for (const rawLine of lines) {
    const line = rawLine.replace(/\r$/, "");
    if (!line.trim()) continue;
    if (line.startsWith("	")) continue;
    const header = /^\/([^:\r\n]+):\s*$/.exec(line.trim());
    if (header) {
      currentDir = normalizeAbsPath(`/${header[1]}`);
      if (rootPath) {
        if (currentDir.startsWith(rootPath)) ensureFolder(currentDir);
      } else {
        ensureFolder(currentDir);
      }
      continue;
    }
    if (!currentDir) continue;
    if (rootPath && !currentDir.startsWith(rootPath)) continue;
    const parsed = parseLsMeta(line);
    if (!parsed) continue;
    const parent = ensureFolder(currentDir);
    const entryPath = normalizeAbsPath(`${currentDir}/${parsed.name}`);
    const keys = childKeysByFolderPath.get(currentDir) ?? /* @__PURE__ */ new Set();
    if (!childKeysByFolderPath.has(currentDir)) childKeysByFolderPath.set(currentDir, keys);
    if (keys.has(entryPath)) continue;
    keys.add(entryPath);
    if (parsed.kind === "folder") {
      const folder = ensureFolder(entryPath);
      folder.meta = parsed.meta;
      parent.children.push(folder);
    } else {
      const file = {
        kind: "file",
        name: parsed.name,
        path: entryPath,
        meta: parsed.meta
      };
      parent.children.push(file);
    }
  }
  if (root.children.length === 0) return void 0;
  sortTree(root);
  return root;
}
function countLsTree(root) {
  let files = 0;
  let folders = 0;
  const stack = [root];
  while (stack.length) {
    const node = stack.pop();
    if (node.kind === "folder") {
      folders += 1;
      for (const child of node.children) stack.push(child);
    } else {
      files += 1;
    }
  }
  return { files, folders };
}
function countOwner(root, owner) {
  const target = owner.trim();
  if (!target) return 0;
  let count = 0;
  const stack = [root];
  while (stack.length) {
    const node = stack.pop();
    if (node.kind === "folder") {
      for (const child of node.children) stack.push(child);
    } else {
      if (node.meta?.owner === target) count += 1;
    }
  }
  return count;
}
function treeContainsFileName(root, needle) {
  if (!root) return false;
  const n = needle.trim();
  if (!n) return false;
  const stack = [root];
  while (stack.length > 0) {
    const node = stack.pop();
    if (node.kind === "file" && node.name.includes(n)) return true;
    if (node.kind === "folder") {
      for (const child of node.children) stack.push(child);
    }
  }
  return false;
}
function parseLsLr(raw) {
  const lsFileRegex = /(?<permissions>[\w\-\+]{9,11}@?) +(?<hardLinks>\d+) +(?<ownerName>[\(\)\_\{\}\-\w\.]+) +(?<owneGroup>[\w\\]+) +(?<type>[\w\-]+)? +(?<size>\d+) +(?<modified>(?<month>\w{3}) +(?<day>\d{1,2}) +(?<time>(\d\d\:){1,2}\d\d)? (?<year>\d{4} )?)(?<fileName>.+)/g;
  const lsFolderRegex = /(\/[\w ]+\.pvm)?\/(?<location>[^:\n]*):$/gm;
  let bundleContents = "";
  const bundleLines = raw.split("\n");
  for (let index = 0; index < bundleLines.length; index++) {
    const line = bundleLines[index];
    lsFolderRegex.lastIndex = 0;
    lsFileRegex.lastIndex = 0;
    const folderMatch = lsFolderRegex.exec(line);
    const fileMatch = lsFileRegex.exec(line);
    if (fileMatch?.groups && fileMatch.groups.fileName !== "." && fileMatch.groups.fileName !== "..") {
      const { size, fileName, permissions, ownerName, modified } = fileMatch.groups;
      let owner = ownerName;
      if (ownerName?.match(/root|\_unknown/)) {
        owner = `**${ownerName}** (!)`;
      }
      const humanSize = humanFileSize$1(parseInt(size, 10));
      bundleContents += `${humanSize} **${fileName}** _${permissions} ${owner} ${modified}_
`;
    } else if (folderMatch?.groups) {
      let folderLocation = folderMatch.groups.location;
      if (folderLocation?.match(/\//g)) {
        const folderLocationArr = folderLocation.split("/");
        folderLocation = "";
        for (let i = 0; i < folderLocationArr.length; i++) {
          folderLocation += "\n" + " ".repeat(i * 5) + "└──" + folderLocationArr[i];
        }
      }
      bundleContents += `
**${folderLocation}**:
`;
    }
  }
  return bundleContents;
}
function extractCdata(xml, tagName) {
  const re = new RegExp(`<${tagName}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${tagName}>`, "i");
  const match = re.exec(xml);
  return match?.[1];
}
function parseAdvancedVmInfo(data, isBootCamp, guestOsType, productName) {
  if (!data) {
    console.warn("[parseAdvancedVmInfo] No data provided");
    return null;
  }
  let xmlData = data;
  if (!data.includes("<AdvancedVmInfo")) {
    xmlData = "<AdvancedVmInfo>" + data;
  }
  const snapshotsXml = extractCdata(xmlData, "Snapshots") ?? xmlData;
  const snapshotRegex = /<Name>(?<name>[^<]*)<\/Name>\s*<DateTime>(?<dateTimeString>[^<]*)<\/DateTime>/g;
  const snapshots = [];
  for (const match of snapshotsXml.matchAll(snapshotRegex)) {
    if (!match.groups?.dateTimeString) continue;
    snapshots.push({
      name: match.groups.name || "",
      dateTime: match.groups.dateTimeString
    });
  }
  const bundleList = extractCdata(xmlData, "VmBundleFileList") ?? data;
  const pvmBundleContents = parseLsLr(bundleList);
  const pvmBundleTree = parseLsLrTree(bundleList);
  const hasAclIssues = data.includes("writeattr");
  const hasRootOwner = data.match(/ root |\_unknown/) !== null;
  const hasDeleteSnapshotOp = data.includes('Operation="DeleteSnaphot"');
  let mainSnapshotMissing = false;
  const hasSnapshotData = !!pvmBundleTree || pvmBundleContents.length > 1;
  const hasMissingMainSnapshot = !treeContainsFileName(pvmBundleTree, "860e329aab41}.hds");
  const isNotChromeOS = true;
  const isNotMacvm = guestOsType !== "macvm";
  if (hasSnapshotData && hasMissingMainSnapshot && isNotChromeOS && true && isNotMacvm) {
    mainSnapshotMissing = true;
  }
  return {
    snapshots,
    snapshotCount: snapshots.length,
    pvmBundleContents,
    pvmBundleTree,
    hasAclIssues,
    hasRootOwner,
    hasDeleteSnapshotOp,
    mainSnapshotMissing
  };
}
function detectAppNameFromCommand(command) {
  const m = command.match(
    /\/(?:Applications|System\/Applications|System\/Library\/CoreServices)\/([^/]+\.app)\//
  );
  return m?.[1] ?? null;
}
function isHelperCommand(command) {
  return /Helper\s*\(/.test(command) || /\/Frameworks\//.test(command);
}
function classifyHostProcessType(command, appName) {
  if (appName) {
    if (command.startsWith("/System/Applications/") || command.startsWith("/System/Library/CoreServices/")) {
      return "macos-app";
    }
    if (command.startsWith("/Applications/")) {
      return "third-party-app";
    }
    return "third-party-app";
  }
  if (command.startsWith("/System/")) return "system";
  if (command.startsWith("/sbin/")) return "system";
  if (command.startsWith("/usr/libexec/") || command.startsWith("/usr/sbin/") || command.startsWith("/usr/bin/")) {
    return "service";
  }
  if (command.includes(" -daemon")) return "service";
  return "other";
}
function extractShortNameFromCommand(command) {
  const appMatch = command.match(/\/([^/]+)\.app\b/);
  if (appMatch?.[1]) return appMatch[1];
  const firstToken = command.trim().split(/\s+/)[0] || command;
  const parts = firstToken.split("/").filter(Boolean);
  return parts[parts.length - 1] || firstToken;
}
function displayNameFor(command, type, appName) {
  if ((type === "macos-app" || type === "third-party-app") && appName) return appName;
  const firstToken = command.trim().split(/\s+/)[0] || command;
  if (firstToken.startsWith("/")) {
    const base = firstToken.split("/").filter(Boolean).pop();
    if (base) return base;
  }
  return firstToken;
}
function parseAllProcesses(textData) {
  if (!textData || textData.trim().length === 0) {
    return null;
  }
  const hasBsdtarIssue = /toolbox_report\.xml\.tar\.gz/.test(textData);
  const psAuxSection = extractSection(textData, "ps aux");
  const topSection = extractSection(textData, "top -i 1 -l 3 -o cpu -S -d");
  const items = psAuxSection ? parsePsAuxSection(psAuxSection) : [];
  const runningApps = Array.from(
    new Set(
      items.filter((p) => (p.type === "macos-app" || p.type === "third-party-app") && p.appName).map((p) => p.appName)
    )
  ).sort();
  const { topCpuProcesses, topMemProcesses } = deriveTopLists(items);
  const top = topSection ? parseTopSnapshot(topSection) : void 0;
  return {
    items,
    runningApps,
    topCpuProcesses,
    topMemProcesses,
    top,
    hasBsdtarIssue
  };
}
function extractSection(textData, name) {
  const marker = `======= ${name} =======`;
  const start = textData.indexOf(marker);
  if (start === -1) return null;
  const after = start + marker.length;
  const nextMarkerIdx = textData.indexOf("=======", after);
  const end = nextMarkerIdx === -1 ? textData.length : nextMarkerIdx;
  return textData.slice(after, end).trim();
}
function parseNum(s) {
  return Number.parseFloat(s.replace(",", "."));
}
function prettyCommand(cmd) {
  return cmd.startsWith("/") ? cmd.slice(1) : cmd;
}
function parsePsAuxSection(section) {
  const lines = section.split("\n").map((l) => l.trimEnd());
  const out = [];
  const headerIdx = lines.findIndex((l) => l.startsWith("USER") && l.includes("COMMAND"));
  const startIdx = headerIdx === -1 ? 0 : headerIdx + 1;
  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    if (line.startsWith("=======")) break;
    const parts = line.trim().split(/\s+/);
    if (parts.length < 11) continue;
    const user = parts[0] ?? "";
    const pid = parts[1] ?? "";
    const cpuRaw = parts[2] ?? "0";
    const memRaw = parts[3] ?? "0";
    const command = parts.slice(10).join(" ");
    if (!user || !pid || !command) continue;
    const appName = detectAppNameFromCommand(command);
    const type = classifyHostProcessType(command, appName);
    const displayName = displayNameFor(command, type, appName);
    const shortName = appName ? appName.replace(/\.app$/, "") : extractShortNameFromCommand(command);
    const isHelper = isHelperCommand(command);
    out.push({
      user,
      pid,
      cpu: parseNum(cpuRaw),
      mem: parseNum(memRaw),
      command,
      type,
      appName: appName ?? void 0,
      isHelper,
      shortName,
      displayName
    });
  }
  return out;
}
function deriveTopLists(items) {
  function toProcessInfo(it) {
    return {
      user: it.user,
      pid: it.pid,
      cpu: it.cpu,
      mem: it.mem,
      name: prettyCommand(it.command)
    };
  }
  const topCpuProcesses = [...items].sort((a, b) => b.cpu - a.cpu).slice(0, 5).map(toProcessInfo);
  const topMemProcesses = [...items].sort((a, b) => b.mem - a.mem).slice(0, 5).map(toProcessInfo);
  return { topCpuProcesses, topMemProcesses };
}
function parseTopSnapshot(section) {
  const snapshot = {};
  const lines = section.split("\n").map((l) => l.trim());
  for (const line of lines) {
    if (!line) continue;
    const procMatch = line.match(/Processes:\s+(\d+)\s+total,\s+(\d+)\s+running,\s+(\d+)\s+sleeping,\s+(\d+)\s+threads/i);
    if (procMatch) {
      snapshot.processesTotal = Number(procMatch[1]);
      snapshot.running = Number(procMatch[2]);
      snapshot.sleeping = Number(procMatch[3]);
      snapshot.threads = Number(procMatch[4]);
      continue;
    }
    if (/^\d{4}\/\d{2}\/\d{2}\s+\d{1,2}:\d{2}:\d{2}$/.test(line)) {
      snapshot.timestamp = line;
      continue;
    }
    const loadMatch = line.match(/Load Avg:\s*([\d.]+),\s*([\d.]+),\s*([\d.]+)/i);
    if (loadMatch) {
      snapshot.loadAvg = {
        one: parseNum(loadMatch[1]),
        five: parseNum(loadMatch[2]),
        fifteen: parseNum(loadMatch[3])
      };
      continue;
    }
    const cpuMatch = line.match(/CPU usage:\s*([\d.]+)%\s*user,\s*([\d.]+)%\s*sys,\s*([\d.]+)%\s*idle/i);
    if (cpuMatch) {
      snapshot.cpu = {
        user: parseNum(cpuMatch[1]),
        sys: parseNum(cpuMatch[2]),
        idle: parseNum(cpuMatch[3])
      };
      continue;
    }
  }
  return snapshot;
}
function parseXml$4(xml) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "application/xml");
    const parseError = doc.querySelector("parsererror");
    if (parseError) {
      console.error("[xmlUtils] XML parsing error:", parseError.textContent);
      return null;
    }
    return doc;
  } catch (e) {
    console.error("[xmlUtils] Failed to parse XML:", e);
    return null;
  }
}
function getText$3(parent, selector) {
  const el = parent.querySelector(selector);
  return el?.textContent?.trim() || void 0;
}
function parseAppConfig(xmlData) {
  if (!xmlData || xmlData.trim().length === 0) {
    return null;
  }
  try {
    const doc = parseXml$4(xmlData);
    if (!doc) {
      return null;
    }
    const rootEl = doc.documentElement;
    if (!rootEl || rootEl.getElementsByTagName("ParallelsPreferences").length === 0) {
      return {
        verboseLoggingEnabled: void 0,
        defaultVmFolders: [],
        usbPermanentAssignments: [],
        isUserDefinedOnDisconnectedServer: true
      };
    }
    const verboseLogEl = doc.querySelector("ServerSettings CommonPreferences Debug VerboseLogEnabled");
    const verboseLoggingText = verboseLogEl?.textContent?.trim();
    const verboseLoggingEnabled = verboseLoggingText === "1";
    const defaultVmFolderRegex = /<UserDefaultVmFolder>([^<]+)<\/UserDefaultVmFolder>/gm;
    const defaultVmFolders = [];
    let hasExternalVmFolder = false;
    let match;
    while ((match = defaultVmFolderRegex.exec(xmlData)) !== null) {
      const folder = match[1];
      defaultVmFolders.push(folder);
      if (folder.startsWith("/Volumes")) {
        hasExternalVmFolder = true;
      }
    }
    const usbPermanentAssignments = [];
    const usbIdentityElements = doc.querySelectorAll("UsbPreferences UsbIdentity");
    for (const usbEl of Array.from(usbIdentityElements)) {
      const friendlyName = getText$3(usbEl, "FriendlyName");
      const systemName = getText$3(usbEl, "SystemName");
      const associationEl = usbEl.querySelector("AssociationsNew Association");
      if (associationEl) {
        const action = getText$3(associationEl, "Action");
        const vmUuid = getText$3(associationEl, "VmUuid");
        usbPermanentAssignments.push({
          friendlyName,
          systemName,
          connectTo: action === "1" ? "VM" : "This Mac",
          vmUuid,
          action: action ? parseInt(action) : void 0
        });
      }
    }
    return {
      verboseLoggingEnabled,
      defaultVmFolders,
      usbPermanentAssignments,
      hasExternalVmFolder,
      isUserDefinedOnDisconnectedServer: false
    };
  } catch (error) {
    console.error("[parseAppConfig] Parse error:", error);
    return null;
  }
}
function parseAutoStatisticInfo(xmlData) {
  if (!xmlData || xmlData.trim().length === 0) {
    return null;
  }
  try {
    const doc = parseXml$4(xmlData);
    if (!doc) return null;
    const installationElements = doc.querySelectorAll("PDInstallationHistory");
    if (installationElements.length === 0) {
      return {
        installations: [],
        installationCount: 0
      };
    }
    const installations = [];
    installationElements.forEach((el) => {
      const version = getText$3(el, "InstalledVersionName");
      const date = getText$3(el, "InstalledVersionDate");
      if (version && date) {
        installations.push({ version, date });
      }
    });
    return {
      installations,
      installationCount: installations.length
    };
  } catch (error) {
    console.error("[parseAutoStatisticInfo] Parse error:", error);
    return null;
  }
}
function parseClientInfo(textData) {
  if (!textData || textData.trim().length === 0) {
    return null;
  }
  try {
    const lines = textData.split("\n");
    const accountRegex = /(AccountConsentGroup|AccountLocaleUpdated)(\/| -- )(?<email>\w[^@]+@[.\w]+)/;
    const pdPreferencesRegex = /Application preferences\/(?<prefName>[\w ]+) -- (?<prefValue>[\d\w]+)/;
    const sharedAppsPrefsRegex = /Shared Applications\/(?<uuid>{[\w\d-]+})\/(?<prefName>[\w ]+) -- (?<prefValue>[\w\d]+)/;
    let accountEmail;
    const pdPreferences = [];
    const sharedAppsMap = /* @__PURE__ */ new Map();
    for (const line of lines) {
      if (!accountEmail) {
        const accountMatch = accountRegex.exec(line);
        if (accountMatch?.groups?.email) {
          accountEmail = accountMatch.groups.email;
        }
      }
      const pdPrefMatch = pdPreferencesRegex.exec(line);
      if (pdPrefMatch?.groups) {
        pdPreferences.push({
          name: pdPrefMatch.groups.prefName,
          value: pdPrefMatch.groups.prefValue
        });
      }
      const sharedAppMatch = sharedAppsPrefsRegex.exec(line);
      if (sharedAppMatch?.groups) {
        const uuid = sharedAppMatch.groups.uuid;
        const prefName = sharedAppMatch.groups.prefName;
        const prefValue = sharedAppMatch.groups.prefValue;
        if (!sharedAppsMap.has(uuid)) {
          sharedAppsMap.set(uuid, []);
        }
        sharedAppsMap.get(uuid).push({
          name: prefName,
          value: prefValue
        });
      }
    }
    const sharedAppsPreferences = Array.from(sharedAppsMap.entries()).map(
      ([uuid, preferences]) => ({
        vmUuid: uuid,
        preferences
      })
    );
    return {
      accountEmail,
      pdPreferences,
      sharedAppsPreferences
    };
  } catch (error) {
    console.error("[parseClientInfo] Parse error:", error);
    return null;
  }
}
function parseClientProxyInfo(textData) {
  if (!textData || textData.trim().length === 0) {
    return null;
  }
  try {
    const proxiesRegex = /<dictionary> {[^}]*}([^}]*)}/gm;
    const match = textData.match(proxiesRegex);
    const proxySettings = match ? match[0] : "";
    const httpProxyEnabled = /HTTPEnable : 1/.test(proxySettings);
    return {
      httpProxyEnabled,
      proxySettings: proxySettings || void 0
    };
  } catch (error) {
    console.error("[parseClientProxyInfo] Parse error:", error);
    return null;
  }
}
function parseXml$3(xml) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "application/xml");
    const parserError = doc.querySelector("parsererror");
    if (parserError) {
      console.warn("[PRV] XML parsererror in parseCurrentVm:", parserError.textContent?.slice(0, 200));
    }
    return doc;
  } catch {
    console.warn("[PRV] parseXml threw while parsing CurrentVm XML");
    return null;
  }
}
function extractVmFragment(xml) {
  if (!xml.includes("<ParallelsVirtualMachine")) {
    console.warn("[PRV] parseCurrentVm: input XML does not contain <ParallelsVirtualMachine>");
    return null;
  }
  const match = xml.match(/<ParallelsVirtualMachine[\s\S]*?<\/ParallelsVirtualMachine>/);
  if (!match) {
    console.warn("[PRV] parseCurrentVm: failed to extract <ParallelsVirtualMachine> fragment");
    return null;
  }
  return match[0];
}
function text(doc, selector) {
  return doc.querySelector(selector)?.textContent?.trim() || void 0;
}
function toArray(nodes, mapper) {
  return Array.from(nodes).map(mapper).filter(Boolean);
}
function parseDisks(doc) {
  const nodes = doc.querySelectorAll("ParallelsVirtualMachine > Hardware > Hdd");
  return toArray(nodes, (el) => ({
    location: text(el, "SystemName"),
    virtualSize: text(el, "Size"),
    actualSize: text(el, "SizeOnDisk"),
    interfaceType: text(el, "InterfaceType"),
    trim: text(el, "OnlineCompactMode"),
    expanding: text(el, "DiskType"),
    splitted: text(el, "Splitted")
  }));
}
function parseCds(doc) {
  const nodes = doc.querySelectorAll("ParallelsVirtualMachine > Hardware > CdRom");
  return toArray(nodes, (el) => ({
    location: text(el, "SystemName"),
    interfaceType: text(el, "InterfaceType"),
    connected: text(el, "Connected")
  }));
}
function parseNets(doc) {
  const nodes = doc.querySelectorAll("ParallelsVirtualMachine > Hardware > NetworkAdapter");
  return toArray(nodes, (el) => ({
    adapterType: text(el, "AdapterType"),
    mode: text(el, "EmulatedType"),
    adapterName: text(el, "AdapterName"),
    mac: text(el, "MAC"),
    connected: text(el, "Connected"),
    conditionerEnabled: text(el, "LinkRateLimit > Enable")
  }));
}
function parseTravelMode(doc) {
  const base = doc.querySelector("ParallelsVirtualMachine > Settings > TravelOptions");
  if (!base) return void 0;
  return {
    enabled: text(base, "Enabled"),
    enterCode: text(base, "Condition > Enter"),
    threshold: text(base, "Condition > EnterBetteryThreshold"),
    quitCode: text(base, "Condition > Quit"),
    state: text(base, "Enabled")
  };
}
function parseUsbDevices(doc) {
  const nodes = doc.querySelectorAll("ParallelsVirtualMachine > Hardware > UsbConnectHistory > USBPort");
  return toArray(nodes, (el) => ({
    name: text(el, "SystemName"),
    timestamp: text(el, "Timestamp")
  }));
}
function parseCurrentVm(xml) {
  if (!xml) {
    console.warn("[PRV] parseCurrentVm called with empty XML");
    return null;
  }
  const fragment = extractVmFragment(xml);
  if (!fragment) {
    return null;
  }
  const doc = parseXml$3(fragment);
  if (!doc) return null;
  const root = doc.querySelector("ParallelsVirtualMachine");
  if (!root) {
    console.warn("[PRV] parseCurrentVm: <ParallelsVirtualMachine> element not found after parsing");
    return null;
  }
  const vmHome = text(doc, "ParallelsVirtualMachine > Identification > VmHome");
  const macVm = !!vmHome?.match(/\.macvm/i);
  return {
    vmName: text(root, "Identification > VmName"),
    vmHome,
    creationDate: text(root, "Identification > VmCreationDate"),
    vmUuid: text(root, "Identification > VmUuid"),
    sourceVmUuid: text(root, "Identification > SourceVmUuid"),
    macVm,
    startAutomatically: text(root, "Settings > Startup > AutoStart"),
    startupView: text(root, "Settings > Startup > WindowMode"),
    pauseAfter: text(root, "Settings > Tools > Coherence > PauseIdleVM"),
    pauseAfterTimeout: text(root, "Settings > Tools > Coherence > PauseIdleVMTimeout"),
    onMacShutdown: text(root, "Settings > Shutdown > AutoStop"),
    onVmShutdown: text(root, "Settings > Runtime > ActionOnStop"),
    onWindowClose: text(root, "Settings > Shutdown > OnVmWindowClose"),
    reclaimDiskSpace: text(root, "Settings > Shutdown > ReclaimDiskSpace"),
    cpuCount: text(root, "Hardware > Cpu > Number"),
    ramMb: text(root, "Hardware > Memory > RAM"),
    vramMb: text(root, "Hardware > Video > VideoMemorySize"),
    hypervisorType: text(root, "Settings > Runtime > HypervisorType"),
    nestedVirtualization: text(root, "Hardware > Cpu > VirtualizedHV"),
    resourceQuota: text(root, "Settings > Runtime > ResourceQuota"),
    videoMode: text(root, "Hardware > Video > EnableHiResDrawing"),
    scaleToFit: text(root, "Settings > Runtime > FullScreen > ScaleViewMode"),
    mouse: text(root, "Settings > Tools > MouseSync > Enabled"),
    keyboard: text(root, "Settings > Runtime > OptimizeModifiers"),
    travelMode: parseTravelMode(doc),
    tpm: text(root, "Hardware > TpmChip > Type"),
    sharedBluetooth: text(root, "Settings > SharedBluetooth > Enabled"),
    sharedCamera: text(root, "Settings > SharedCamera > Enabled"),
    usb3: text(root, "Settings > UsbController > XhcEnabled"),
    rollbackMode: text(root, "Settings > Runtime > UndoDisks"),
    isolated: text(root, "Settings > Tools > IsolatedVm"),
    sharedProfile: text(root, "Settings > Tools > SharedProfile > Enabled"),
    shareHostCloud: text(root, "Settings > Tools > SharedFolders > HostSharing > SharedCloud"),
    mapMacVolumes: text(root, "Settings > Tools > SharedVolumes > Enabled"),
    accessGuestFromHost: text(root, "Settings > Tools > SharedFolders > GuestSharing > Enabled"),
    shareOneDriveWithHost: text(root, "Settings > Tools > SharedFolders > GuestSharing > AutoMountCloudDrives"),
    shareGuestNetDrives: text(root, "Settings > Tools > SharedFolders > GuestSharing > AutoMountNetworkDrives"),
    shareGuestExternDrives: text(root, "Settings > Tools > SharedFolders > GuestSharing > ShareRemovableDrives"),
    sharedGuestApps: text(root, "Settings > Tools > SharedApplications > FromWinToMac"),
    sharedHostApps: text(root, "Settings > Tools > SharedApplications > FromMacToWin"),
    clipboardSync: text(root, "Settings > Tools > ClipboardSync > Enabled"),
    timeSync: text(root, "Settings > Tools > TimeSync > Enabled"),
    smartGuard: text(root, "Settings > Autoprotect > Enabled"),
    smartGuardSchema: text(root, "Settings > Autoprotect > Schema"),
    bootFlags: text(root, "Settings > Runtime > SystemFlags"),
    highPerfGraphics: text(root, "Settings > Runtime > OptimizePowerConsumptionMode"),
    shareHostPrinters: text(root, "Settings > VirtualPrintersInfo > UseHostPrinters"),
    syncDefaultPrinter: text(root, "Settings > VirtualPrintersInfo > SyncDefaultPrinter"),
    showPageSetup: text(root, "Settings > VirtualPrintersInfo > ShowHostPrinterUI"),
    sharedCCID: text(root, "Settings > SharedCCID > Enabled"),
    hdds: parseDisks(doc),
    cds: parseCds(doc),
    netAdapters: parseNets(doc),
    usbDevices: parseUsbDevices(doc)
  };
}
function parseGuestCommands(data, guestOsType) {
  const isLinux = guestOsType ? /linux/i.test(guestOsType) : void 0;
  if (!data || data.trim().length < 10) {
    return {
      guestType: guestOsType,
      isLinux,
      isEmpty: true,
      system: void 0,
      network: { adapters: [], drives: [] },
      processes: [],
      totals: void 0,
      powerRequests: []
    };
  }
  try {
    const trimmed = data.trim();
    let commands = {};
    if (trimmed.startsWith("<") && trimmed.includes("<GuestCommands")) {
      commands = parseGuestCommandsXml(trimmed);
    } else if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      const parsed = JSON.parse(trimmed);
      const guestCommands = parsed?.GuestCommand;
      if (!guestCommands) {
        return {
          guestType: guestOsType,
          isLinux,
          isEmpty: true,
          system: void 0,
          network: { adapters: [], drives: [] },
          processes: [],
          totals: void 0,
          powerRequests: []
        };
      }
      if (Array.isArray(guestCommands)) {
        for (const cmd of guestCommands) {
          const name = cmd?.CommandName;
          const result = cmd?.CommandResult;
          if (name && result) {
            commands[String(name).trim().toLowerCase()] = String(result);
          }
        }
      } else {
        for (const value of Object.values(guestCommands)) {
          if (typeof value === "object" && value !== null) {
            const cmdName = value.CommandName;
            const cmdResult = value.CommandResult;
            if (cmdName && cmdResult) {
              commands[String(cmdName).trim().toLowerCase()] = String(cmdResult);
            }
          }
        }
      }
    } else {
      return {
        guestType: guestOsType,
        isLinux,
        isEmpty: true,
        system: void 0,
        network: { adapters: [], drives: [] },
        processes: [],
        totals: void 0,
        powerRequests: []
      };
    }
    const envSet = commands["cmd /c set"] || "";
    const netUse = commands["net use"] || "";
    const ipconfig = commands["ipconfig /all"] || "";
    const cpuUsage = commands["prl_cpuusage --sort-cpu-desc --time 4000"] || "";
    const powerRequests = commands["powercfg -requests"] || "";
    const cpu = parseCpuUsage(cpuUsage);
    return {
      guestType: guestOsType,
      isLinux,
      isEmpty: Object.keys(commands).length === 0,
      system: parseCmdSet(envSet),
      network: {
        adapters: parseIpconfig(ipconfig),
        drives: parseNetUse(netUse)
      },
      processes: cpu.processes,
      totals: cpu.totals,
      powerRequests: parsePowercfgRequests(powerRequests)
    };
  } catch (error) {
    console.error("[parseGuestCommands] Parse error:", error);
    return null;
  }
}
function getXmlText(value) {
  if (value === null || value === void 0) return void 0;
  if (typeof value === "string") return value.trim() || void 0;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map(getXmlText).filter(Boolean).join("");
  if (typeof value === "object") {
    const record = value;
    if (typeof record.__cdata === "string") return record.__cdata.trim() || void 0;
    if (typeof record.__text === "string") return record.__text.trim() || void 0;
  }
  return void 0;
}
function parseGuestCommandsXml(xml) {
  const parser = new fxpExports.XMLParser({
    ignoreAttributes: true,
    cdataPropName: "__cdata",
    textNodeName: "__text",
    parseTagValue: false,
    trimValues: false,
    processEntities: false
  });
  const parsed = parser.parse(xml);
  const root = parsed?.GuestCommands;
  const guestCommands = root?.GuestCommand;
  const list = Array.isArray(guestCommands) ? guestCommands : guestCommands ? [guestCommands] : [];
  const commands = {};
  for (const cmd of list) {
    const name = getXmlText(cmd?.CommandName);
    const result = getXmlText(cmd?.CommandResult);
    if (!name || result === void 0) continue;
    commands[name.trim().toLowerCase()] = result;
  }
  return commands;
}
function parseNetUse(output) {
  const drives = [];
  const seenLetters = /* @__PURE__ */ new Set();
  const lines = output.split(/\r?\n/);
  let inTable = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (/^-{5,}$/.test(trimmed)) {
      inTable = true;
      continue;
    }
    if (!inTable) continue;
    if (/^the command completed/i.test(trimmed)) break;
    if (/^status\s+local\s+remote\s+network/i.test(trimmed)) continue;
    const columns = trimmed.split(/\s{2,}/).map((c) => c.trim()).filter(Boolean);
    if (columns.length < 3) continue;
    let statusRaw;
    let local;
    let remotePath;
    let provider;
    if (columns.length === 3) {
      local = columns[0];
      remotePath = columns[1];
      provider = columns[2];
    } else {
      statusRaw = columns[0];
      local = columns[1];
      remotePath = columns[2];
      provider = columns.slice(3).join(" ");
    }
    const letterMatch = /^([A-Z]):$/.exec(local ?? "");
    const letter = letterMatch ? letterMatch[1] : void 0;
    if (letter) {
      if (seenLetters.has(letter)) continue;
      seenLetters.add(letter);
    }
    const normalized = (statusRaw ?? "").trim();
    const lower = normalized.toLowerCase();
    const status = normalized === "" ? "OK" : lower === "ok" ? "OK" : lower === "disconnected" ? "Disconnected" : lower === "unavailable" ? "Unavailable" : lower === "reconnecting" ? "Reconnecting" : "Other";
    drives.push({
      letter,
      remotePath,
      status,
      statusRaw: status === "Other" ? statusRaw ?? void 0 : void 0,
      provider
    });
  }
  return drives;
}
function parseCmdSet(output) {
  if (!output || output.trim().length === 0) return void 0;
  let hostname;
  let processorCount;
  let architecture;
  for (const line of output.split(/\r?\n/)) {
    const idx = line.indexOf("=");
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim().toUpperCase();
    const value = line.slice(idx + 1).trim();
    if (key === "COMPUTERNAME") {
      hostname = value || void 0;
    } else if (key === "NUMBER_OF_PROCESSORS") {
      const num = Number.parseInt(value, 10);
      processorCount = Number.isFinite(num) ? num : void 0;
    } else if (key === "PROCESSOR_ARCHITECTURE") {
      architecture = normalizeArchitecture(value);
    }
  }
  if (!hostname && !processorCount && !architecture) return void 0;
  return { hostname, processorCount, architecture };
}
function normalizeArchitecture(value) {
  const upper = value.trim().toUpperCase();
  if (upper === "ARM64") return "ARM64";
  if (upper === "X86") return "x86";
  if (upper === "X64" || upper === "AMD64") return "x64";
  return "unknown";
}
function isGlobalIpv6(ipv6) {
  const normalized = ipv6.toLowerCase();
  if (normalized.startsWith("fe80:")) return false;
  return true;
}
function extractIpv4(value) {
  const match = value.match(/\b(\d{1,3}(?:\.\d{1,3}){3})\b/);
  return match?.[1];
}
function extractIps(value) {
  const ips = [];
  const v4 = value.match(/\b(\d{1,3}(?:\.\d{1,3}){3})\b/g) ?? [];
  ips.push(...v4);
  const v6 = value.match(/\b[0-9a-fA-F:]{2,}(?:%[0-9]+)?\b/g) ?? [];
  for (const candidate of v6) {
    if (candidate.includes("::") || candidate.includes(":")) {
      const cleaned = candidate.replace(/%[0-9]+$/, "");
      if (!/^\d+(?:\.\d+){3}$/.test(cleaned)) ips.push(cleaned);
    }
  }
  return ips;
}
function normalizeIpconfigValue(value) {
  const trimmed = value.trim();
  if (!trimmed) return void 0;
  return trimmed.replace(/\(.*\)\s*$/, "").trim() || void 0;
}
function parseIpconfig(output) {
  if (!output || output.trim().length === 0) return [];
  const adapters = [];
  const lines = output.split(/\r?\n/);
  let current;
  let dns = [];
  let gatewayCandidates = [];
  let continuation;
  const flush = () => {
    if (!current) return;
    if (dns.length > 0) current.dns = dns;
    const ipv4Gateway = gatewayCandidates.map(extractIpv4).find(Boolean);
    if (ipv4Gateway) current.gateway = ipv4Gateway;
    if (current.name || current.ip || current.description || current.ipv6) {
      adapters.push(current);
    }
    current = void 0;
    dns = [];
    gatewayCandidates = [];
    continuation = void 0;
  };
  for (const line of lines) {
    const trimmedRight = line.trimEnd();
    const trimmed = trimmedRight.trim();
    if (!trimmed) {
      continuation = void 0;
      continue;
    }
    if (!/^\s/.test(line) && trimmedRight.endsWith(":")) {
      flush();
      current = { name: trimmedRight.slice(0, -1).trim() };
      continue;
    }
    if (!current) continue;
    if (continuation && /^\s+/.test(line) && !trimmed.includes(":")) {
      if (continuation === "dns") {
        dns.push(...extractIps(trimmed));
      } else if (continuation === "gateway") {
        gatewayCandidates.push(trimmed);
      }
      continue;
    }
    continuation = void 0;
    const match = /^\s*(?<key>[^:]+?)\s*:\s*(?<value>.*)$/.exec(line);
    if (!match?.groups) continue;
    const rawKey = match.groups.key;
    const value = match.groups.value ?? "";
    const key = rawKey.replace(/\.+/g, " ").trim().toLowerCase();
    if (key.startsWith("description")) {
      current.description = normalizeIpconfigValue(value);
      continue;
    }
    if (key === "dhcp enabled") {
      const normalized = value.trim().toLowerCase();
      if (normalized === "yes") current.dhcpEnabled = true;
      else if (normalized === "no") current.dhcpEnabled = false;
      continue;
    }
    if (key === "ipv4 address") {
      current.ip = extractIpv4(value) ?? normalizeIpconfigValue(value);
      continue;
    }
    if (key === "ipv6 address") {
      const normalized = normalizeIpconfigValue(value);
      if (normalized && isGlobalIpv6(normalized) && !current.ipv6) {
        current.ipv6 = normalized.replace(/%[0-9]+$/, "");
      }
      continue;
    }
    if (key === "default gateway") {
      continuation = "gateway";
      gatewayCandidates.push(value);
      continue;
    }
    if (key === "dns servers") {
      continuation = "dns";
      dns.push(...extractIps(value));
      continue;
    }
  }
  flush();
  for (const adapter of adapters) {
    if (!adapter.dns) continue;
    adapter.dns = Array.from(new Set(adapter.dns));
  }
  return adapters;
}
function parseCpuUsage(output) {
  const processes = [];
  if (!output || output.trim().length === 0) return { processes, totals: void 0 };
  const seen = /* @__PURE__ */ new Set();
  let totals;
  for (const line of output.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("Measure time")) continue;
    if (trimmed.startsWith("System:")) continue;
    if (trimmed.startsWith("Name ")) continue;
    if (trimmed.startsWith("====")) continue;
    if (trimmed.startsWith("---")) continue;
    if (trimmed.startsWith("TOTAL:")) {
      const match = /^TOTAL:\s+.*?(?<cpu>\d+(?:\.\d+)?)%\s+(?<mem>\d+)\s*$/.exec(trimmed);
      if (match?.groups) {
        totals = {
          cpuPercent: Number(match.groups.cpu),
          memoryKb: Number.parseInt(match.groups.mem, 10)
        };
      }
      continue;
    }
    let rest = trimmed;
    let path;
    let memoryKb;
    let cpuPercent;
    const pathMatch = /\s(?<mem>\d+)\s(?<path>[A-Za-z]:\\.+)$/.exec(rest);
    if (pathMatch?.groups) {
      memoryKb = Number.parseInt(pathMatch.groups.mem, 10);
      path = pathMatch.groups.path.trim();
      rest = rest.slice(0, pathMatch.index).trimEnd();
    } else {
      const memMatch = /\s(?<mem>\d+)\s*$/.exec(rest);
      if (memMatch?.groups) {
        memoryKb = Number.parseInt(memMatch.groups.mem, 10);
        rest = rest.slice(0, memMatch.index).trimEnd();
      }
    }
    const cpuMatch = /\s(?<cpu>\d+(?:\.\d+)?)%\s*$/.exec(rest);
    if (cpuMatch?.groups) {
      cpuPercent = Number(cpuMatch.groups.cpu);
      rest = rest.slice(0, cpuMatch.index).trimEnd();
    }
    const tokens = rest.trim().split(/\s+/).filter(Boolean);
    if (tokens.length < 3) continue;
    const archIndex = tokens.findIndex((t) => /^(ARM64|x86|x64|AMD64)$/i.test(t));
    if (archIndex < 0 || archIndex + 1 >= tokens.length) continue;
    const architecture = normalizeArchitecture(tokens[archIndex]);
    const pid = Number.parseInt(tokens[archIndex + 1], 10);
    const user = tokens.slice(1, archIndex).join(" ") || void 0;
    const key = `${pid}:${path ?? ""}:${cpuPercent ?? ""}:${memoryKb ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    processes.push({
      path,
      pid: Number.isFinite(pid) ? pid : void 0,
      cpuPercent: Number.isFinite(cpuPercent ?? NaN) ? cpuPercent : void 0,
      memoryKb: Number.isFinite(memoryKb ?? NaN) ? memoryKb : void 0,
      architecture,
      user
    });
  }
  return { processes, totals };
}
function looksLikePath(value) {
  if (!value) return false;
  if (/^[A-Za-z]:\\/.test(value)) return true;
  if (/^\\Device\\/.test(value)) return true;
  return false;
}
function parsePowercfgRequests(output) {
  if (!output || output.trim().length === 0) return [];
  const requests = [];
  const lines = output.split(/\r?\n/);
  let currentType;
  let currentEntry = [];
  const flush = () => {
    if (!currentType) return;
    if (currentEntry.length === 0) return;
    const text2 = currentEntry.join(" ").replace(/\s+/g, " ").trim();
    currentEntry = [];
    if (!text2 || /^none\.$/i.test(text2)) return;
    let rest = text2;
    const bracket = /^\[[^\]]+\]\s+/.exec(rest);
    if (bracket) {
      rest = rest.slice(bracket[0].length).trim();
    }
    const paren = /^(?<before>.*)\((?<inside>[^)]+)\)\s*$/.exec(rest);
    const requestor = paren?.groups?.inside?.trim() || rest;
    const before = paren?.groups?.before?.trim();
    const path = before && looksLikePath(before) ? before : void 0;
    requests.push({
      type: currentType,
      requestor: requestor || void 0,
      path
    });
  };
  for (const line of lines) {
    const trimmed = line.trim();
    const section = /^([A-Z][A-Z0-9]+)\s*:\s*$/.exec(trimmed);
    if (section) {
      flush();
      currentType = section[1];
      continue;
    }
    if (!currentType) continue;
    if (!trimmed) {
      flush();
      continue;
    }
    if (/^none\.$/i.test(trimmed)) {
      currentEntry = [];
      continue;
    }
    if (trimmed.startsWith("[") && currentEntry.length > 0) {
      flush();
    }
    currentEntry.push(trimmed);
  }
  flush();
  return requests;
}
const windowsVersions = [
  {
    name: "Windows 11, Version 26H1",
    version: "10.0",
    build: "28000",
    releaseDate: "2026-02-10"
  },
  {
    name: "Windows 11, Version 25H2",
    version: "10.0",
    build: "26200",
    releaseDate: "2025-09-30"
  },
  {
    name: "Windows Server 2025 (LTSC)",
    version: "10.0",
    build: "26100",
    releaseDate: "2024-11-01"
  },
  {
    name: "Windows 11, Version 24H2",
    version: "10.0",
    build: "26100",
    releaseDate: "2024-10-01"
  },
  {
    name: "Windows 11, Version 23H2",
    version: "10.0",
    build: "22631",
    releaseDate: "2023-10-31"
  },
  {
    name: "Windows Server, Version 23H2",
    version: "10.0",
    build: "25398",
    releaseDate: "2023-10-24"
  },
  {
    name: "Windows 10, Version 22H2",
    version: "10.0",
    build: "19045",
    releaseDate: "2022-10-18"
  },
  {
    name: "Windows 11, Version 22H2",
    version: "10.0",
    build: "22621",
    releaseDate: "2022-09-20"
  },
  {
    name: "Windows 10, Version 21H2",
    version: "10.0",
    build: "19044",
    releaseDate: "2021-11-16"
  },
  {
    name: "Windows 11, Version 21H2",
    version: "10.0",
    build: "22000",
    releaseDate: "2021-10-04"
  },
  {
    name: "Windows Server 2022, Version 21H2",
    version: "10.0",
    build: "20348",
    releaseDate: "2021-08-18"
  },
  {
    name: "Windows 10, Version 21H1",
    version: "10.0",
    build: "19043",
    releaseDate: "2021-05-18"
  },
  {
    name: "Windows Server, Version 20H2",
    version: "10.0",
    build: "19042",
    releaseDate: "2020-10-20"
  },
  {
    name: "Windows 10, Version 20H2",
    version: "10.0",
    build: "19042",
    releaseDate: "2020-10-20"
  },
  {
    name: "Windows Server, Version 2004",
    version: "10.0",
    build: "19041",
    releaseDate: "2020-05-27"
  },
  {
    name: "Windows 10, Version 2004",
    version: "10.0",
    build: "19041",
    releaseDate: "2020-05-27"
  },
  {
    name: "Windows Server, Version 1909",
    version: "10.0",
    build: "18363",
    releaseDate: "2019-11-12"
  },
  {
    name: "Windows 10, Version 1909",
    version: "10.0",
    build: "18363",
    releaseDate: "2019-11-12"
  },
  {
    name: "Windows 10, Version 1903",
    version: "10.0",
    build: "18362",
    releaseDate: "2019-05-21"
  },
  {
    name: "Windows Server 2008, Service Pack 2, Rollup KB4489887",
    version: "6.0",
    build: "6003",
    releaseDate: "2019-03-19"
  },
  {
    name: "Windows 10, Version 1809",
    version: "10.0",
    build: "17763",
    releaseDate: "2018-11-13"
  },
  {
    name: "Windows Server 2019, Version 1809",
    version: "10.0",
    build: "17763",
    releaseDate: "2018-11-13"
  },
  {
    name: "Windows 10, Version 1803",
    version: "10.0",
    build: "17134",
    releaseDate: "2018-04-30"
  },
  {
    name: "Windows 10, Version 1709",
    version: "10.0",
    build: "16299",
    releaseDate: "2017-10-17"
  },
  {
    name: "Windows 10, Version 1703",
    version: "10.0",
    build: "15063",
    releaseDate: "2017-04-05"
  },
  {
    name: "Windows Server 2016, Version 1607",
    version: "10.0",
    build: "14393",
    releaseDate: "2016-10-15"
  },
  {
    name: "Windows 10, Version 1607",
    version: "10.0",
    build: "14393",
    releaseDate: "2016-08-02"
  },
  {
    name: "Windows 10, Version 1511",
    version: "10.0",
    build: "10586",
    releaseDate: "2015-11-10"
  },
  {
    name: "Windows 10, Version 1507",
    version: "10.0",
    build: "10240",
    releaseDate: "2015-07-29"
  },
  {
    name: "Windows Server 2012 R2",
    version: "6.3",
    build: "9600",
    releaseDate: "2013-10-18"
  },
  {
    name: "Windows 8.1",
    version: "6.3",
    build: "9600",
    releaseDate: "2013-08-27"
  },
  {
    name: "Windows 8",
    version: "6.2",
    build: "9200",
    releaseDate: "2012-10-26"
  },
  {
    name: "Windows Server 2012",
    version: "6.2",
    build: "9200",
    releaseDate: "2012-09-04"
  },
  {
    name: "Windows Home Server 2011",
    version: "6.1",
    build: "8400",
    releaseDate: "2011-04-06"
  },
  {
    name: "Windows Server 2008 R2, Service Pack 1",
    version: "6.1",
    build: "7601",
    releaseDate: "2011-02-22"
  },
  {
    name: "Windows 7, Service Pack 1",
    version: "6.1",
    build: "7601",
    releaseDate: "2011-02-22"
  },
  {
    name: "Windows Server 2008 R2",
    version: "6.1",
    build: "7600",
    releaseDate: "2009-10-22"
  },
  {
    name: "Windows 7",
    version: "6.1",
    build: "7600",
    releaseDate: "2009-10-22"
  },
  {
    name: "Windows Server 2008, Service Pack 2",
    version: "6.0",
    build: "6002",
    releaseDate: "2009-05-26"
  },
  {
    name: "Windows Vista, Service Pack 2",
    version: "6.0",
    build: "6002",
    releaseDate: "2009-05-26"
  },
  {
    name: "Windows XP, Service Pack 3",
    version: "5.1",
    build: "2600",
    releaseDate: "2008-04-21"
  },
  {
    name: "Windows Server 2008",
    version: "6.0",
    build: "6001",
    releaseDate: "2008-02-27"
  },
  {
    name: "Windows Vista, Service Pack 1",
    version: "6.0",
    build: "6001",
    releaseDate: "2008-02-04"
  },
  {
    name: "Windows Home Server",
    version: "5.2",
    build: "4500",
    releaseDate: "2007-11-04"
  },
  {
    name: "Windows Server 2003, Service Pack 2",
    version: "5.2",
    build: "3790",
    releaseDate: "2007-03-13"
  },
  {
    name: "Windows Vista",
    version: "6.0",
    build: "6000",
    releaseDate: "2007-01-30"
  },
  {
    name: "Windows Server 2003 R2",
    version: "5.2",
    build: "3790",
    releaseDate: "2005-12-06"
  },
  {
    name: "Windows Server 2003, Service Pack 1",
    version: "5.2",
    build: "3790.1180",
    releaseDate: "2005-03-30"
  },
  {
    name: "Windows XP, Service Pack 2",
    version: "5.1",
    build: "2600.2180",
    releaseDate: "2004-08-25"
  },
  {
    name: "Windows Server 2003",
    version: "5.2",
    build: "3790",
    releaseDate: "2003-04-24"
  },
  {
    name: "Windows XP, Service Pack 1",
    version: "5.1",
    build: "2600.1105-1106",
    releaseDate: "2002-09-09"
  },
  {
    name: "Windows XP",
    version: "5.1",
    build: "2600",
    releaseDate: "2001-10-25"
  },
  {
    name: "Windows Me",
    version: "4.90",
    build: "3000",
    releaseDate: "2000-09-14"
  },
  {
    name: "Windows 2000",
    version: "5.0",
    build: "2195",
    releaseDate: "2000-02-17"
  },
  {
    name: "Windows 98 Second Edition (SE)",
    version: "4.10",
    build: "2222",
    releaseDate: "1999-05-05"
  },
  {
    name: "Windows 98",
    version: "4.10",
    build: "1998",
    releaseDate: "1998-05-15"
  },
  {
    name: "Windows 95 OEM Service Release 2.5",
    version: "4.00",
    build: "950 C",
    releaseDate: "1997-11-26"
  },
  {
    name: "Windows 95 OEM Service Release 2.1",
    version: "4.00",
    build: "950 B",
    releaseDate: "1997-08-27"
  },
  {
    name: "Windows NT 4.0",
    version: "4.0",
    build: "1381",
    releaseDate: "1996-08-24"
  },
  {
    name: "Windows 95 OEM Service Release 2",
    version: "4.00",
    build: "950 B",
    releaseDate: "1996-08-24"
  },
  {
    name: "Windows 95 OEM Service Release 1",
    version: "4.00",
    build: "950 A",
    releaseDate: "1996-02-14"
  },
  {
    name: "Windows 95",
    version: "4.00",
    build: "950",
    releaseDate: "1995-08-24"
  },
  {
    name: "Windows NT 3.51",
    version: "3.51",
    build: "1057",
    releaseDate: "1995-05-30"
  },
  {
    name: "Windows NT 3.1, Service Pack 3",
    version: "3.10",
    build: "528",
    releaseDate: "1994-11"
  },
  {
    name: "Windows NT 3.5",
    version: "3.50",
    build: "807",
    releaseDate: "1994-09-21"
  },
  {
    name: "Windows NT 3.1",
    version: "3.10",
    build: "511",
    releaseDate: "1993-07-27"
  }
];
function getWindowsVersionEntry(version) {
  return windowsVersions.find((w) => `${w.version}.${w.build}` === version) ?? null;
}
function parseWindowsVersionParts(fullVersion) {
  const m = /^(?<majorMinor>\d+\.\d+)\.(?<build>.+)$/.exec(fullVersion.trim());
  const majorMinor = m?.groups?.majorMinor;
  const buildRaw = m?.groups?.build;
  if (!majorMinor || !buildRaw) return null;
  const buildNum = /^\d+$/.test(buildRaw) ? Number.parseInt(buildRaw, 10) : null;
  return { majorMinor, buildRaw, buildNum: Number.isFinite(buildNum) ? buildNum : null };
}
function getMaxKnownWindowsBuild(majorMinor) {
  const entries = windowsVersions.filter((w) => w.version === majorMinor).map((w) => ({ entry: w, buildNum: /^\d+$/.test(w.build) ? Number.parseInt(w.build, 10) : NaN })).filter((x) => Number.isFinite(x.buildNum));
  if (entries.length === 0) return null;
  return entries.reduce((best, cur) => cur.buildNum > best.buildNum ? cur : best);
}
function looksLikeWindowsType(type) {
  const t = (type ?? "").toLowerCase();
  return t === "windows" || t.includes("win");
}
function parseXml$2(xml) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "application/xml");
    const parseError = doc.querySelector("parsererror");
    if (parseError) {
      console.error("[parseGuestOs] XML parsing error:", parseError.textContent);
      return null;
    }
    return doc;
  } catch (e) {
    console.error("[parseGuestOs] Failed to parse XML:", e);
    return null;
  }
}
function getText$2(doc, selector) {
  const el = doc.querySelector(selector);
  return el?.textContent?.trim() || void 0;
}
function parseGuestOs(xmlData) {
  if (!xmlData) {
    console.warn("[parseGuestOs] No XML data provided");
    return null;
  }
  const doc = parseXml$2(xmlData);
  if (!doc) return null;
  const type = getText$2(doc, "ConfOsType");
  const versionRaw = getText$2(doc, "RealOsVersion");
  const kernel = getText$2(doc, "OsKernelVersion");
  const version = versionRaw?.replace(/,\s*$/, "") ?? "";
  const winEntry = getWindowsVersionEntry(version);
  const releaseDate = winEntry?.releaseDate;
  let name = winEntry?.name ?? version;
  if (!winEntry && looksLikeWindowsType(type) && version) {
    const parts = parseWindowsVersionParts(version);
    if (parts && parts.buildNum != null) {
      const maxKnown = getMaxKnownWindowsBuild(parts.majorMinor);
      if (maxKnown && parts.buildNum > maxKnown.buildNum) {
        name = `Unknown Windows version (newer than ${maxKnown.entry.name})`;
      }
    }
  }
  return {
    type,
    version,
    name,
    releaseDate,
    kernel
  };
}
function parseXml$1(xml) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "application/xml");
    const parseError = doc.querySelector("parsererror");
    if (parseError) {
      console.error("[parseHostInfo] XML parsing error:", parseError.textContent);
      return null;
    }
    return doc;
  } catch (e) {
    console.error("[parseHostInfo] Failed to parse XML:", e);
    return null;
  }
}
function getText$1(el, selector) {
  const target = el.querySelector(selector);
  return target?.textContent?.trim() || void 0;
}
function toInt(value) {
  if (!value) return null;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : null;
}
function toBool01(value) {
  if (value === void 0) return null;
  if (value === "1") return true;
  if (value === "0") return false;
  return null;
}
function humanFileSize(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
}
function diskIdentifierFromDevPath(value) {
  if (!value) return null;
  const trimmed = value.trim();
  const m = /\/dev\/(disk\d+)/.exec(trimmed);
  return m?.[1] ?? null;
}
function stripDiskSuffix(name) {
  return name.replace(/\s*\(disk\d+\)\s*$/, "").trim();
}
function partitionSchemeFromValue(value) {
  switch (value) {
    case "1":
      return "GPT";
    case "2":
      return "MBR";
    case "3":
      return "APFS";
    default:
      return "unknown";
  }
}
function netAdapterTypeFromValue(value) {
  switch (value) {
    case "0":
      return "ethernet";
    case "2":
      return "wifi";
    default:
      return "other";
  }
}
function pickIpv6(candidates) {
  if (candidates.length === 0) return null;
  const nonLinkLocal = candidates.find((c) => !c.toLowerCase().startsWith("fe80:"));
  return nonLinkLocal ?? candidates[0] ?? null;
}
function parseNetAddress(value) {
  const raw = value.trim();
  const idx = raw.indexOf("/");
  if (idx === -1) return { addr: raw, suffix: null };
  return { addr: raw.slice(0, idx), suffix: raw.slice(idx + 1) || null };
}
function usbSpeedFromValue(value) {
  const v = (value ?? "").toLowerCase().trim();
  if (v === "low" || v === "full" || v === "high" || v === "super" || v === "unknown") return v;
  return "unknown";
}
function usbStateFromValue(value) {
  if (value === void 0) return null;
  switch (value) {
    case "0":
      return "connected";
    case "1":
      return "in-use";
    case "2":
      return "disconnected";
    default:
      return null;
  }
}
function parseUsbUuid(rawUuid) {
  if (!rawUuid) {
    return { rawUuid: null, location: null, vendorId: null, productId: null, speed: "unknown", serial: null };
  }
  const parts = rawUuid.split("|");
  if (parts.length >= 4) {
    const location = parts[0]?.trim() || null;
    const vendorId = parts[1]?.trim() || null;
    const productId = parts[2]?.trim() || null;
    const speed = usbSpeedFromValue(parts[3]);
    const serialRaw = (parts[5] ?? "").trim();
    const serial = !serialRaw || serialRaw === "Empty" || serialRaw === "--" ? null : serialRaw;
    return { rawUuid, location, vendorId, productId, speed, serial };
  }
  return { rawUuid, location: null, vendorId: null, productId: null, speed: "unknown", serial: null };
}
function parseOsPresentation(value) {
  if (!value) return { name: null, version: null, build: null };
  const raw = value.trim();
  const m = /^(.+?)\s+([0-9]+(?:\.[0-9]+)*)(?:\(([^)]+)\))?$/.exec(raw);
  if (!m) return { name: null, version: null, build: null };
  return { name: m[1]?.trim() || null, version: m[2]?.trim() || null, build: m[3]?.trim() || null };
}
function audioTypeFromUuidAndName(uuid, name, direction) {
  const u = uuid ?? "";
  const n = name.toLowerCase();
  if (!u && !name) return "other";
  if (u.includes("BuiltInSpeakerDevice") || u.includes("BuiltInMicrophoneDevice")) return "builtin";
  if (n === "mute" || u.toLowerCase().includes("null")) return "mute";
  if (u.includes("AppleUSBAudioEngine")) return "usb";
  if (/([0-9a-f]{2}-){5}[0-9a-f]{2}/i.test(u)) return "bluetooth";
  if (n.includes("teams") || n.includes("zoom") || n.includes("loopback") || u.toLowerCase().includes("loopback")) return "virtual";
  if (n.includes("iphone") || n.includes("ipad") || u.toLowerCase().includes("iphone") || u.toLowerCase().includes("ipad"))
    return "continuity";
  if (direction === "out") {
    const looksLikeDisplay = n.includes("dell") || n.includes("lg") || n.includes("samsung") || n.includes("display") || n.includes("monitor");
    if (u.endsWith("_out") && looksLikeDisplay) return "monitor";
  }
  return "other";
}
function transportFromValue(value) {
  const v = (value ?? "").trim();
  if (!v) return "unknown";
  if (v === "USB" || v === "Bluetooth" || v === "Bluetooth Low Energy" || v === "FIFO" || v === "SPI") {
    return v;
  }
  return "unknown";
}
function inputRole(isKeyboard, isMouse, isGameController) {
  if (isKeyboard && isMouse) return "combo";
  if (isKeyboard) return "keyboard";
  if (isMouse) return "mouse";
  if (isGameController) return "gamepad";
  return "unknown";
}
function parseHostInfo(xmlData) {
  if (!xmlData) {
    console.warn("[parseHostInfo] No XML data provided");
    return null;
  }
  const doc = parseXml$1(xmlData);
  if (!doc) return null;
  const hasDisplayLink = xmlData.includes("DisplayLink");
  const hardwareUuid = getText$1(doc.documentElement, "HardwareUuid") ?? null;
  const isNotebook = (getText$1(doc.documentElement, "HostNotebookFlag") ?? "") === "1";
  const osEl = doc.querySelector("OsVersion");
  const osPresentation = getText$1(osEl ?? doc.documentElement, "StringPresentation");
  const osParsed = parseOsPresentation(osPresentation);
  const osArchitecture = toInt(getText$1(osEl ?? doc.documentElement, "OsArchitecture"));
  const cpuEl = doc.querySelector("Cpu");
  const cpuCores = toInt(getText$1(cpuEl ?? doc.documentElement, "Number"));
  const cpuSpeed = toInt(getText$1(cpuEl ?? doc.documentElement, "Speed"));
  const hvtNptAvail = toBool01(getText$1(cpuEl ?? doc.documentElement, "HvtNptAvail"));
  const hvtUnrestrictedAvail = toBool01(getText$1(cpuEl ?? doc.documentElement, "HvtUnrestrictedAvail"));
  const hvtSupported = hvtNptAvail === null && hvtUnrestrictedAvail === null ? null : Boolean(hvtNptAvail || hvtUnrestrictedAvail);
  const memoryEl = doc.querySelector("MemorySettings");
  const hostRamMb = toInt(getText$1(memoryEl ?? doc.documentElement, "HostRamSize"));
  const maxVmMemoryMb = toInt(getText$1(memoryEl ?? doc.documentElement, "MaxVmMemory"));
  const recommendedMaxMb = toInt(getText$1(memoryEl ?? doc.documentElement, "RecommendedMaxMemory"));
  const memLiveEl = memoryEl?.querySelector("AdvancedMemoryInfo");
  const liveFreeMb = toInt(getText$1(memLiveEl ?? memoryEl ?? doc.documentElement, "FreeMemSize"));
  const liveWiredMb = toInt(getText$1(memLiveEl ?? memoryEl ?? doc.documentElement, "WireMemSize"));
  const liveInactiveMb = toInt(getText$1(memLiveEl ?? memoryEl ?? doc.documentElement, "InactiveMemSize"));
  const liveActiveMb = toInt(getText$1(memLiveEl ?? memoryEl ?? doc.documentElement, "ActiveMemSize"));
  const memoryLive = liveFreeMb === null && liveWiredMb === null && liveInactiveMb === null && liveActiveMb === null ? null : {
    freeMb: liveFreeMb ?? 0,
    wiredMb: liveWiredMb ?? 0,
    inactiveMb: liveInactiveMb ?? 0,
    activeMb: liveActiveMb ?? 0
  };
  const privacyEl = doc.querySelector("PrivacyRestrictions");
  const cameraAllowed = toBool01(getText$1(privacyEl ?? doc.documentElement, "Camera"));
  const microphoneAllowed = toBool01(getText$1(privacyEl ?? doc.documentElement, "Microphone"));
  const hardDisks = [];
  const hddElements = doc.querySelectorAll("HardDisks > HardDisk");
  hddElements.forEach((el) => {
    const rawName = getText$1(el, "Name") ?? "";
    const name = stripDiskSuffix(rawName) || rawName || "Disk";
    const uuid = getText$1(el, "Uuid");
    const identifier = diskIdentifierFromDevPath(uuid) ?? /(\bdisk\d+\b)/.exec(rawName)?.[1] ?? "";
    const sizeBytes = toInt(getText$1(el, "Size"));
    const sizeFormatted = sizeBytes === null ? null : humanFileSize(sizeBytes);
    const partitions = [];
    el.querySelectorAll("Partition").forEach((p) => {
      const pSizeBytes = toInt(getText$1(p, "Size"));
      const pFreeBytes = toInt(getText$1(p, "FreeSize"));
      partitions.push({
        name: getText$1(p, "Name") ?? "Partition",
        systemName: getText$1(p, "SystemName") ?? null,
        sizeBytes: pSizeBytes,
        freeSizeBytes: pFreeBytes,
        typeName: getText$1(p, "TypeName") ?? null,
        gptType: getText$1(p, "GptType") ?? null
      });
    });
    hardDisks.push({
      name,
      identifier,
      sizeBytes,
      sizeFormatted,
      logicalSectorSize: toInt(getText$1(el, "LogicalSectorSize")),
      removable: toBool01(getText$1(el, "Removable")),
      external: toBool01(getText$1(el, "External")),
      isVirtualDisk: toBool01(getText$1(el, "IsVirtualDisk")),
      parentStore: (getText$1(el, "ParentStoreName") ?? "").trim() || null,
      partitionScheme: partitionSchemeFromValue(getText$1(el, "PartitionScheme")),
      partitions
    });
  });
  const networkAdapters = [];
  const netElements = doc.querySelectorAll("NetworkAdapters > NetworkAdapter");
  netElements.forEach((el) => {
    const netAddresses = Array.from(el.querySelectorAll("NetAddress")).map((a) => a.textContent?.trim()).filter((a) => Boolean(a));
    const ipv4Candidate = netAddresses.find((a) => /\b\d{1,3}(\.\d{1,3}){3}\b/.test(a)) ?? null;
    const ipv6Candidates = netAddresses.filter((a) => a.includes(":"));
    const ipv6Candidate = pickIpv6(ipv6Candidates);
    const ipv4Parsed = ipv4Candidate ? parseNetAddress(ipv4Candidate) : null;
    const ipv6Parsed = ipv6Candidate ? parseNetAddress(ipv6Candidate) : null;
    const vlanTagRaw = toInt(getText$1(el, "VLANTag"));
    const vlanTag = vlanTagRaw === 65535 ? null : vlanTagRaw;
    networkAdapters.push({
      name: getText$1(el, "Name") ?? "Adapter",
      identifier: getText$1(el, "Uuid") ?? "",
      type: netAdapterTypeFromValue(getText$1(el, "Type")),
      enabled: toBool01(getText$1(el, "Enabled")),
      mac: getText$1(el, "MacAddress") ?? null,
      addresses: {
        ipv4: ipv4Parsed?.addr ?? null,
        ipv4Subnet: ipv4Parsed?.suffix ?? null,
        ipv6: ipv6Parsed?.addr ?? null,
        ipv6Prefix: ipv6Parsed?.suffix ?? null
      },
      dhcp: toBool01(getText$1(el, "ConfigureWithDhcp")),
      dhcpv6: toBool01(getText$1(el, "ConfigureWithDhcpIPv6")),
      vlanTag
    });
  });
  const usbDevices = [];
  const usbElements = doc.querySelectorAll("UsbDevices > UsbDevice");
  usbElements.forEach((el) => {
    const uuid = getText$1(el, "Uuid");
    const parsed = parseUsbUuid(uuid);
    usbDevices.push({
      name: getText$1(el, "Name") ?? "USB Device",
      rawUuid: parsed.rawUuid,
      location: parsed.location,
      vendorId: parsed.vendorId,
      productId: parsed.productId,
      speed: parsed.speed,
      serial: parsed.serial,
      state: usbStateFromValue(getText$1(el, "DeviceState")),
      vfSupported: toBool01(getText$1(el, "SupportedByVirtualizationFramework"))
    });
  });
  const outputs = [];
  const inputs = [];
  doc.querySelectorAll("SoundDevices OutputDevices OutputDevice").forEach((el) => {
    const name = getText$1(el, "Name") ?? "Output";
    const id = getText$1(el, "Uuid") ?? null;
    outputs.push({ name, id, type: audioTypeFromUuidAndName(id, name, "out") });
  });
  doc.querySelectorAll("SoundDevices MixerDevices MixerDevice").forEach((el) => {
    const name = getText$1(el, "Name") ?? "Input";
    const id = getText$1(el, "Uuid") ?? null;
    inputs.push({ name, id, type: audioTypeFromUuidAndName(id, name, "in") });
  });
  const inputDevices = [];
  doc.querySelectorAll("HIDDevices > HIDDevice").forEach((el) => {
    const name = getText$1(el, "Name") ?? "";
    const vendorId = toInt(getText$1(el, "VendorID"));
    const productId = toInt(getText$1(el, "ProductID"));
    const transport = transportFromValue(getText$1(el, "Transport"));
    const isMouse = toBool01(getText$1(el, "IsMouse"));
    const isKeyboard = toBool01(getText$1(el, "IsKeyboard"));
    const isGameController = toBool01(getText$1(el, "IsGameController"));
    const isNoise = !name.trim() && (vendorId ?? 0) === 0 && (productId ?? 0) === 0;
    if (isNoise) return;
    inputDevices.push({
      name: name.trim() || "HID Device",
      identifier: getText$1(el, "Uuid") ?? "",
      transport,
      vendorId,
      productId,
      isMouse,
      isKeyboard,
      isGameController,
      role: inputRole(isKeyboard, isMouse, isGameController)
    });
  });
  const printers = [];
  doc.querySelectorAll("Printers > Printer").forEach((el) => {
    printers.push({
      name: getText$1(el, "Name") ?? "Printer",
      isDefault: toBool01(getText$1(el, "Default"))
    });
  });
  const cameras = [];
  doc.querySelectorAll("Cameras > Camera").forEach((el) => {
    const name = getText$1(el, "Name") ?? el.textContent?.trim() ?? "";
    cameras.push({ name: name || "Camera" });
  });
  const smartCardReaders = [];
  doc.querySelectorAll("SmartCardReaders > SmartCardReader").forEach((el) => {
    const name = getText$1(el, "Name") ?? el.textContent?.trim() ?? "";
    smartCardReaders.push({ name: name || "Smart Card Reader" });
  });
  const bluetoothDevices = [];
  doc.querySelectorAll("SerialPorts > SerialPort").forEach((el) => {
    const port = getText$1(el, "Name") ?? getText$1(el, "Uuid") ?? "";
    if (!port.startsWith("/dev/cu.")) return;
    if (port === "/dev/cu.debug-console") return;
    if (port === "/dev/cu.Bluetooth-Incoming-Port") return;
    const name = port.replace("/dev/cu.", "").trim();
    if (!name) return;
    bluetoothDevices.push({ name, port });
  });
  const hasBluetoothAudio = outputs.some((d) => d.type === "bluetooth") || inputs.some((d) => d.type === "bluetooth");
  const hasExternalDisks = hardDisks.some((d) => d.external === true);
  const hasUsbCamera = usbDevices.some((d) => /camera|webcam/i.test(d.name)) || inputDevices.some((d) => /camera|webcam/i.test(d.name));
  const privacyRestricted = cameraAllowed === false || microphoneAllowed === false;
  const lowMemory = (() => {
    if (!memoryLive || !hostRamMb) return false;
    const active = memoryLive.activeMb ?? 0;
    const wired = memoryLive.wiredMb ?? 0;
    const ratio = (active + wired) / hostRamMb;
    return ratio >= 0.85;
  })();
  return {
    system: {
      hardwareUuid,
      isNotebook,
      os: {
        name: osParsed.name,
        version: osParsed.version,
        build: osParsed.build,
        displayString: osPresentation?.trim() ?? null,
        architecture: osArchitecture
      },
      cpu: {
        model: getText$1(cpuEl ?? doc.documentElement, "Model") ?? null,
        cores: cpuCores,
        speedMhz: cpuSpeed,
        hvtSupported
      },
      memory: {
        hostRamMb,
        hostRamGb: hostRamMb === null ? null : Math.round(hostRamMb / 1024),
        maxVmMemoryMb,
        recommendedMaxMb,
        live: memoryLive
      },
      privacy: { cameraAllowed, microphoneAllowed }
    },
    hardDisks,
    networkAdapters,
    usbDevices,
    audio: { outputs, inputs },
    inputDevices,
    bluetoothDevices,
    printers,
    cameras,
    smartCardReaders,
    flags: {
      hasExternalDisks,
      hasBluetoothAudio,
      hasUsbCamera,
      privacyRestricted,
      lowMemory,
      isNotebook
    },
    hasDisplayLink
  };
}
function parseInstalledSoftware(textData) {
  if (!textData || textData.trim().length === 0) {
    return null;
  }
  try {
    const cleanedText = textData.replace(/<\/?InstalledSoftware>/g, "");
    const apps = [];
    const uniqueApps = /* @__PURE__ */ new Set();
    const lines = cleanedText.split("\n");
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;
      const m = /^(?<path>\/.*?\.app)\s*:\s*(?<version>.*)$/.exec(line);
      const path = m?.groups?.path?.trim();
      if (!path) continue;
      if (path.toLowerCase().includes(".app/")) continue;
      const version = (m?.groups?.version ?? "").trim();
      const name = path.split("/").pop() ?? path;
      const appKey = `${path}:${version}`;
      if (uniqueApps.has(appKey)) continue;
      uniqueApps.add(appKey);
      apps.push({
        name,
        path,
        version: version || void 0
      });
    }
    apps.sort((a, b) => a.name.localeCompare(b.name));
    return {
      apps,
      appCount: apps.length
    };
  } catch (error) {
    console.error("[parseInstalledSoftware] Parse error:", error);
    return null;
  }
}
function parseLaunchdInfo(textData) {
  if (!textData || textData.trim().length === 0) {
    return null;
  }
  try {
    const formattedListing = parseLsLr(textData);
    const tree = parseLsLrTree(textData, { rootName: "launchd" });
    const stats = tree ? {
      ...countLsTree(tree),
      rootOwnedFiles: countOwner(tree, "root")
    } : void 0;
    return {
      formattedListing,
      tree,
      stats
    };
  } catch (error) {
    console.error("[parseLaunchdInfo] Parse error:", error);
    return null;
  }
}
const LICENSE_TYPE_MAP = {
  1: "STD",
  2: "PDB",
  3: "Pro"
};
function parseLicenseData(jsonData) {
  if (!jsonData) {
    console.warn("[parseLicenseData] No JSON data provided");
    return null;
  }
  try {
    const data = JSON.parse(jsonData);
    const license = data?.license;
    if (!license) {
      console.warn("[parseLicenseData] No license object found in JSON");
      return null;
    }
    const edition = license.edition;
    const editionName = LICENSE_TYPE_MAP[edition] || `Unknown (${edition})`;
    const expirationDate = license.main_period_ends_at;
    let isPirated = false;
    let expirationTimestamp;
    if (expirationDate) {
      expirationTimestamp = Date.parse(expirationDate);
      const now = Date.now();
      const twelveYears = 12 * 365 * 24 * 3600 * 1e3;
      isPirated = expirationTimestamp - now > twelveYears;
    }
    return {
      edition,
      editionName,
      expirationDate,
      expirationTimestamp,
      isPirated,
      // License properties
      isAutoRenewable: license.is_auto_renewable,
      isBeta: license.is_beta,
      isBytebot: license.is_bytebot,
      isChina: license.is_china,
      isExpired: license.is_expired,
      isGracePeriod: license.is_grace_period,
      isNfr: license.is_nfr,
      isPurchasedOnline: license.is_purchased_online,
      isSublicense: license.is_sublicense,
      isSuspended: license.is_suspended,
      isTrial: license.is_trial,
      isUpgrade: license.is_upgrade
    };
  } catch (e) {
    console.error("[parseLicenseData] Failed to parse JSON:", e);
    return null;
  }
}
const KNOWN_BAD_KEXTS = [
  // Common hackintosh kexts
  "org.hwsensors",
  "as.acidanthera",
  "com.rehabman",
  "org.vanilla",
  "org.netkas",
  "org.tgwbd",
  "com.insanelymac"
  // Add more as needed
];
function parseLoadedDrivers(textData, cpuModel, hostOsMajor) {
  if (!textData || textData.trim().length === 0) {
    return null;
  }
  const nonAppleRegex = /^((?!com\.apple|LoadedDrivers|Linked Against|com\.parallels).)+$/gm;
  const kextNameRegex = / (\w+\.[^ ]*)/gm;
  const prlMatches = textData.match(/com\.parallels[^\s]*/g);
  const hasPrlKexts = prlMatches !== null && prlMatches.length > 0;
  const nonAppleMatches = textData.match(nonAppleRegex);
  const hasNonAppleKexts = nonAppleMatches !== null && nonAppleMatches.length > 0;
  const nonAppleKexts = [];
  const badKexts = [];
  let hasBadKexts = false;
  if (nonAppleMatches) {
    for (const match of nonAppleMatches) {
      const kextMatch = match.match(kextNameRegex);
      if (kextMatch && kextMatch[0]) {
        const kextName = kextMatch[0].trim();
        nonAppleKexts.push(kextName);
        if (KNOWN_BAD_KEXTS.some((bad) => kextName.includes(bad))) {
          badKexts.push(kextName);
          hasBadKexts = true;
        }
      }
    }
  }
  const isAppleSilicon = cpuModel?.includes("Apple") ?? false;
  const isKextless = hostOsMajor !== void 0 && hostOsMajor >= 12;
  const onlyApple = !hasNonAppleKexts && (!hasPrlKexts || isAppleSilicon || isKextless);
  return {
    kexts: [...prlMatches || [], ...nonAppleKexts],
    nonAppleKexts,
    badKexts,
    hasPrlKexts,
    hasNonAppleKexts,
    hasBadKexts,
    onlyApple,
    isHackintosh: hasBadKexts
  };
}
function parseMoreHostInfo(xmlData) {
  if (!xmlData || xmlData.trim().length < 120) {
    return null;
  }
  if (xmlData.includes("Windows")) {
    return null;
  }
  try {
    const cleanedXml = xmlData.replace(/\<MoreHostInfo[^$]*dtd\"\>/gm, "").replace(/\<\=/g, "").replace(/\<\/MoreHostInfo>/g, "");
    const parser = new DOMParser();
    const doc = parser.parseFromString(cleanedXml, "text/xml");
    const parserError = doc.querySelector("parsererror");
    if (parserError) {
      console.warn("[parseMoreHostInfo] XML parsing error:", parserError.textContent);
      return null;
    }
    const gpus = [];
    let displayCount = 0;
    const spDisplaysSections = findPlistDictsByDataType(doc, "SPDisplaysDataType");
    for (const section of spDisplaysSections) {
      const itemsArray = getDictValue(section, "_items");
      if (!itemsArray || itemsArray.nodeName !== "array") continue;
      for (const gpuDict of directChildDicts(itemsArray)) {
        const gpu = parseGpu(gpuDict);
        if (!gpu) continue;
        gpus.push(gpu);
        displayCount += gpu.displays.length;
      }
    }
    return {
      gpus,
      displayCount,
      hasNoDisplays: displayCount === 0
    };
  } catch (error) {
    console.error("[parseMoreHostInfo] Parse error:", error);
    return null;
  }
}
function dictEntries(dictEl) {
  const entries = [];
  const children = Array.from(dictEl.children);
  for (let i = 0; i < children.length; i++) {
    const el = children[i];
    if (el.nodeName !== "key") continue;
    const key = el.textContent?.trim() || "";
    const valueEl = children[i + 1] ?? null;
    entries.push({ key, valueEl });
  }
  return entries;
}
function getDictValue(dictEl, keyName) {
  for (const { key, valueEl } of dictEntries(dictEl)) {
    if (key === keyName) return valueEl;
  }
  return null;
}
function findPlistDictsByDataType(doc, dataType) {
  const out = [];
  for (const dictEl of Array.from(doc.querySelectorAll("dict"))) {
    const dtEl = getDictValue(dictEl, "_dataType");
    const dt = dtEl?.textContent?.trim();
    if (dt === dataType) out.push(dictEl);
  }
  return out;
}
function directChildDicts(arrayEl) {
  return Array.from(arrayEl.children).filter((c) => c.nodeName === "dict");
}
function parseGpu(dictEl) {
  let name = "";
  let type = "unknown";
  const displays = [];
  for (const { key, valueEl } of dictEntries(dictEl)) {
    if (!valueEl) continue;
    if (key === "sppci_model" || key === "_name") {
      name = valueEl.textContent?.trim() || name;
      continue;
    }
    if (key === "sppci_bus") {
      const v = valueEl.textContent?.trim() || "";
      if (v.includes("builtin")) type = "integrated";
      else if (v.toLowerCase().includes("pcie")) type = "discrete";
      continue;
    }
    if (key === "spdisplays_ndrvs" && valueEl.nodeName === "array") {
      for (const displayDict of directChildDicts(valueEl)) {
        const display = parseDisplay(displayDict);
        if (display) displays.push(display);
      }
    }
  }
  if (!name) return null;
  return { name, type, displays };
}
function parseWxH(input) {
  const m = input.match(/(?<w>\d+)\s*x\s*(?<h>\d+)/i);
  if (!m?.groups) return null;
  const w = Number.parseInt(m.groups.w, 10);
  const h = Number.parseInt(m.groups.h, 10);
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return null;
  return { w, h };
}
function parseResolutionWithRefresh(input) {
  const parts = input.split("@").map((p) => p.trim());
  const base = parseWxH(parts[0] || "");
  if (!base) return null;
  const hzPart = parts[1];
  if (!hzPart) return { ...base };
  const hzMatch = hzPart.match(/(?<hz>\d+(?:\.\d+)?)\s*hz/i);
  const hz = hzMatch?.groups?.hz ? Number.parseFloat(hzMatch.groups.hz) : void 0;
  return { ...base, hz: Number.isFinite(hz ?? NaN) ? hz : void 0 };
}
function parseDisplay(dictEl) {
  let name = "";
  let physical = null;
  let logical = null;
  let vendorId = "";
  let builtin = false;
  for (const { key, valueEl } of dictEntries(dictEl)) {
    const value = valueEl?.textContent?.trim();
    switch (key) {
      case "_name":
        name = value || "";
        break;
      case "_spdisplays_display-vendor-id":
        vendorId = value || "";
        break;
      case "_spdisplays_pixels":
        physical = value ? parseWxH(value) : null;
        break;
      case "_spdisplays_resolution":
        logical = value ? parseResolutionWithRefresh(value) : null;
        break;
      case "spdisplays_connection_type":
        builtin = (value || "").includes("internal");
        break;
    }
  }
  if (name === "Color LCD" && vendorId === "610") {
    name = "MacBook Built-In Display";
  }
  if (!name) {
    return null;
  }
  if (!physical && logical) physical = { w: logical.w, h: logical.h };
  if (!logical && physical) logical = { w: physical.w, h: physical.h, hz: void 0 };
  if (!physical || !logical) return null;
  return {
    name,
    physicalWidth: physical.w,
    physicalHeight: physical.h,
    logicalWidth: logical.w,
    logicalHeight: logical.h,
    refreshRate: logical.hz,
    builtin
  };
}
function parseMountInfo(textData) {
  if (!textData || textData.trim().length === 0) {
    return null;
  }
  const volumes = [];
  let hasNtfsVolumes = false;
  const parseWarnings = [];
  let skippedVolumes = 0;
  const mountLineRegex = /^\s*(?<id>.+?)\s+on\s+(?<mountedOn>.+?)\s+\((?<filesystem>[^,]+)/;
  function parseDfTableLines(lines2) {
    const headerIdx = lines2.findIndex((l) => /^\s*Filesystem\s+/i.test(l) && /Mounted\s+on/i.test(l));
    if (headerIdx < 0) return [];
    const out = [];
    for (let i = headerIdx + 1; i < lines2.length; i++) {
      const line = lines2[i].replace(/\r$/, "");
      if (!line.trim()) continue;
      const tokens = line.trim().split(/\s+/);
      if (tokens.length < 6) continue;
      const capIdx = tokens.findIndex((t) => /^\d+%$/.test(t));
      if (capIdx < 4) continue;
      const identifier = tokens[0];
      const size = tokens[1];
      const used = tokens[2];
      const free = tokens[3];
      const capacityStr = tokens[capIdx];
      const mountedStart = tokens.length >= capIdx + 4 ? capIdx + 4 : capIdx + 1;
      const mountedOn = tokens.slice(mountedStart).join(" ");
      if (!mountedOn) continue;
      out.push({ identifier, size, used, free, capacityStr, mountedOn });
    }
    return out;
  }
  const filesystems = {};
  const mountedOnById = {};
  const flagsById = {};
  const lines = textData.split("\n");
  for (const rawLine of lines) {
    const line = rawLine.replace(/\r$/, "");
    const fsMatch = line.match(mountLineRegex);
    if (!fsMatch?.groups) continue;
    const id = fsMatch.groups.id.trim();
    const filesystem = fsMatch.groups.filesystem.trim();
    const mountedOn = fsMatch.groups.mountedOn.trim();
    const parenStart = line.indexOf("(");
    const parenEnd = line.lastIndexOf(")");
    const flagsRaw = parenStart >= 0 && parenEnd > parenStart ? line.slice(parenStart + 1, parenEnd) : "";
    const flags = flagsRaw.split(",").map((t) => t.trim()).filter(Boolean).slice(1);
    filesystems[id] = filesystem;
    mountedOnById[id] = mountedOn;
    flagsById[id] = flags;
    if (filesystem.toLowerCase().includes("ntfs")) {
      hasNtfsVolumes = true;
    }
  }
  const dfRows = parseDfTableLines(lines);
  for (const row of dfRows) {
    const identifier = row.identifier;
    if (identifier.match(/(devfs)/)) {
      skippedVolumes += 1;
      continue;
    }
    const capacity = parseInt(row.capacityStr.match(/^(\d+)\%/)?.[1] || "0", 10);
    const filesystem = filesystems[identifier];
    const isNtfs = filesystem?.toLowerCase().includes("ntfs") ?? false;
    row.mountedOn.includes("/System/Volumes/");
    volumes.push({
      identifier,
      mountedOn: row.mountedOn,
      size: row.size,
      used: row.used,
      free: row.free,
      capacity,
      capacityStr: row.capacityStr,
      filesystem,
      isNtfs,
      flags: flagsById[identifier]
    });
  }
  if (volumes.length === 0) {
    for (const [identifier, filesystem] of Object.entries(filesystems)) {
      if (identifier.match(/(map|devfs)/)) continue;
      const mountedOn = mountedOnById[identifier];
      if (!mountedOn) continue;
      const isNtfs = filesystem.toLowerCase().includes("ntfs");
      volumes.push({
        identifier,
        mountedOn,
        size: "—",
        used: "—",
        free: "—",
        capacity: 0,
        capacityStr: "—",
        filesystem,
        isNtfs
      });
    }
  }
  if (volumes.length === 0) {
    for (const rawLine of lines) {
      const line = rawLine.replace(/\r$/, "").trim();
      if (!line) continue;
      const onIdx = line.indexOf(" on ");
      const parenIdx = line.indexOf(" (");
      if (onIdx <= 0 || parenIdx <= onIdx) continue;
      const identifier = line.slice(0, onIdx).trim();
      const mountedOn = line.slice(onIdx + 4, parenIdx).trim();
      const fsChunk = line.slice(parenIdx + 2);
      const filesystem = fsChunk.split(",")[0]?.replace(/^\(/, "").trim();
      if (!identifier || !mountedOn || !filesystem) continue;
      if (identifier.match(/(map|devfs)/)) continue;
      const isNtfs = filesystem.toLowerCase().includes("ntfs");
      if (isNtfs) hasNtfsVolumes = true;
      volumes.push({
        identifier,
        mountedOn,
        size: "—",
        used: "—",
        free: "—",
        capacity: 0,
        capacityStr: "—",
        filesystem,
        isNtfs
      });
    }
  }
  volumes.sort((a, b) => a.identifier.localeCompare(b.identifier));
  function parseSizeToGiB(input) {
    const raw = input.trim();
    if (!raw || raw === "—") return 0;
    if (raw === "0Bi") return 0;
    const match = /^([\d.]+)([KMGTP])i?$/i.exec(raw);
    if (!match) return 0;
    const value = Number(match[1]);
    const unit = match[2].toUpperCase();
    if (!Number.isFinite(value)) return 0;
    const toGi = {
      K: 1 / (1024 * 1024),
      M: 1 / 1024,
      G: 1,
      T: 1024,
      P: 1024 * 1024
    };
    return value * (toGi[unit] ?? 0);
  }
  function safeDecode(value) {
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }
  function isNetworkVolume(vol) {
    const fs = (vol.filesystem ?? "").toLowerCase();
    if (vol.identifier.startsWith("//")) return true;
    if (fs === "smbfs" || fs === "nfs" || fs === "cifs") return true;
    return false;
  }
  function isSkippable(vol) {
    const id = vol.identifier;
    const fs = (vol.filesystem ?? "").toLowerCase();
    if (fs === "devfs" || fs === "autofs") return true;
    if (id.startsWith("map ")) return true;
    if (id === "map" || id === "map-auto_home") return true;
    if (vol.size === "0Bi" || vol.capacityStr === "100%") {
      if (fs === "autofs" || id.startsWith("map ")) return true;
    }
    return false;
  }
  const palette = ["#3B82F6", "#6366F1", "#8B5CF6", "#A855F7", "#F59E0B", "#10B981", "#EC4899", "#06B6D4"];
  const localCandidates = volumes.filter((v) => !isSkippable(v) && !isNetworkVolume(v));
  const networkCandidates = volumes.filter((v) => !isSkippable(v) && isNetworkVolume(v));
  const byDiskId = /* @__PURE__ */ new Map();
  for (const vol of localCandidates) {
    const m = /^\/dev\/(?<diskId>disk\d+)/.exec(vol.identifier);
    if (!m?.groups?.diskId) continue;
    const diskId = m.groups.diskId;
    const arr = byDiskId.get(diskId) ?? [];
    if (!byDiskId.has(diskId)) byDiskId.set(diskId, arr);
    arr.push(vol);
  }
  function labelVolumeByMount(mount) {
    const m = mount.trim();
    if (m === "/") return "macOS";
    if (m === "/System/Volumes/Data") return "User Data";
    if (m === "/System/Volumes/VM") return "VM Swap";
    if (m === "/System/Volumes/Preboot") return "Preboot";
    if (m === "/System/Volumes/Update/mnt1") return "System Snapshot";
    if (m.startsWith("/System/Volumes/Update/SFR/")) return "SFR Recovery";
    if (m === "/System/Volumes/Update") return "Update";
    if (m === "/System/Volumes/xarts") return "xarts";
    if (m === "/System/Volumes/iSCPreboot") return "iSCPreboot";
    if (m === "/System/Volumes/Hardware") return "Hardware";
    const last = m.split("/").filter(Boolean).pop();
    return last ?? m;
  }
  const localDisks = [];
  for (const [diskId, vols] of byDiskId.entries()) {
    const sizeGi = Math.max(...vols.map((v) => parseSizeToGiB(v.size)));
    const freeGi = Math.max(...vols.map((v) => parseSizeToGiB(v.free)));
    const cap = Math.max(...vols.map((v) => v.capacity ?? 0));
    const fs = vols.find((v) => v.filesystem)?.filesystem ?? "unknown";
    const hasRoot = vols.some((v) => v.mountedOn === "/");
    const hasData = vols.some((v) => v.mountedOn === "/System/Volumes/Data");
    const hasSfr = vols.some((v) => v.mountedOn.includes("/System/Volumes/Update/SFR"));
    const label = hasRoot || hasData ? "System Disk" : hasSfr ? "Recovery" : sizeGi > 0 && sizeGi < 1 ? "System Firmware" : diskId;
    const usedGi = Math.max(0, sizeGi - freeGi);
    const significant = sizeGi >= 10 || cap >= 80 || hasRoot;
    const perVol = vols.map((v) => ({
      v,
      usedGi: parseSizeToGiB(v.used)
    })).sort((a, b) => b.usedGi - a.usedGi);
    const colorById = /* @__PURE__ */ new Map();
    for (let i = 0; i < perVol.length; i++) {
      const id = perVol[i].v.identifier.replace(/^\/dev\//, "");
      colorById.set(id, palette[i % palette.length]);
    }
    const parsedVolumes = vols.map((v) => {
      const id = v.identifier.replace(/^\/dev\//, "");
      return {
        id,
        label: labelVolumeByMount(v.mountedOn),
        mount: v.mountedOn,
        usedGi: parseSizeToGiB(v.used),
        filesystem: v.filesystem ?? "unknown",
        flags: v.flags ?? [],
        color: colorById.get(id) ?? palette[0]
      };
    });
    localDisks.push({
      diskId,
      label,
      filesystem: fs,
      containerSizeGi: sizeGi,
      freeGi,
      usedGi,
      capacityPercent: cap,
      significant,
      volumes: parsedVolumes
    });
  }
  localDisks.sort((a, b) => b.containerSizeGi - a.containerSizeGi);
  const networkShares = networkCandidates.map((v, idx) => {
    const decodedId = safeDecode(v.identifier);
    const decodedMount = safeDecode(v.mountedOn);
    const mountPoint = decodedMount.split("/").filter(Boolean).pop() ?? decodedMount;
    const source = decodedId.includes("/") ? decodedId.split("/").slice(0, -1).join("/") : decodedId;
    const share = decodedId.includes("/") ? decodedId.split("/").pop() ?? decodedId : decodedId;
    const shareClean = safeDecode(share);
    const driveLetter = /\[(?<letter>[A-Z])\]/.exec(mountPoint)?.groups?.letter;
    const label = driveLetter ? `Windows VM — ${driveLetter}:` : shareClean;
    const sizeGi = parseSizeToGiB(v.size);
    const freeGi = parseSizeToGiB(v.free);
    const usedGi = parseSizeToGiB(v.used);
    return {
      shareId: `net-${idx}`,
      label,
      protocol: v.filesystem ?? "unknown",
      source,
      mountPoint,
      sizeGi,
      freeGi,
      usedGi,
      capacityPercent: v.capacity ?? 0
    };
  });
  const alerts = {
    lowStorage: localDisks.some((d) => d.capacityPercent >= 90),
    hddFull: localDisks.some((d) => d.capacityPercent >= 99),
    hasNtfs: hasNtfsVolumes
  };
  const parsed = {
    localDisks,
    networkShares,
    alerts,
    meta: {
      totalVolumes: volumes.length,
      skippedVolumes,
      parseWarnings
    }
  };
  return {
    volumes,
    lowStorage: alerts.lowStorage,
    hddFull: alerts.hddFull,
    hasNtfsVolumes,
    parsed
  };
}
function parseXml(xml) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "application/xml");
    const parseError = doc.querySelector("parsererror");
    if (parseError) {
      console.error("[parseNetConfig] XML parsing error:", parseError.textContent);
      return null;
    }
    return doc;
  } catch (e) {
    console.error("[parseNetConfig] Failed to parse XML:", e);
    return null;
  }
}
function getText(el, selector) {
  const target = el.querySelector(selector);
  return target?.textContent?.trim() || void 0;
}
function parseNetConfig(xmlData, hostOsMajor) {
  if (!xmlData) {
    console.warn("[parseNetConfig] No XML data provided");
    return null;
  }
  const doc = parseXml(xmlData);
  if (!doc) return null;
  const kextless = doc.querySelector("UseKextless")?.textContent?.trim();
  let kextlessMode = "unknown";
  if (kextless === "1" || kextless === "-1") {
    kextlessMode = "kextless";
  } else if (kextless === "0") {
    kextlessMode = "kext";
  }
  const networkElements = doc.querySelectorAll("VirtualNetwork");
  const networks = [];
  let hasSharedNetwork = false;
  let hasHostOnlyNetwork = false;
  networkElements.forEach((netEl) => {
    const networkType = getText(netEl, "NetworkType");
    if (networkType === "0") {
      return;
    }
    const name = getText(netEl, "Description");
    const dhcpIp = getText(netEl, "HostOnlyNetwork DhcpIPAddress");
    const netMask = getText(netEl, "HostOnlyNetwork IPNetMask");
    const hostIp = getText(netEl, "HostOnlyNetwork HostIPAddress");
    const dhcpEnabled = getText(netEl, "HostOnlyNetwork DHCPServer Enabled");
    const dhcpV6Enabled = getText(netEl, "HostOnlyNetwork DHCPv6Server Enabled");
    networks.push({
      name,
      dhcpIp,
      netMask,
      hostIp,
      dhcpEnabled,
      dhcpV6Enabled,
      networkType
    });
    if (name?.toLowerCase().includes("shared")) {
      hasSharedNetwork = true;
    }
    if (name?.toLowerCase().includes("host only") || name?.toLowerCase().includes("host-only")) {
      hasHostOnlyNetwork = true;
    }
  });
  return {
    kextless,
    kextlessMode,
    networks,
    hasSharedNetwork,
    hasHostOnlyNetwork
  };
}
function parseParallelsSystemLog(textData) {
  if (!textData || textData.trim().length === 0) {
    return null;
  }
  try {
    const last50000chars = textData.slice(Math.max(0, textData.length - 5e4));
    const coherenceMatches = last50000chars.match(/Coherence state full dump/gm);
    const hasCoherenceDump = !!coherenceMatches;
    const coherenceDumpCount = coherenceMatches?.length || 0;
    return {
      hasCoherenceDump,
      coherenceDumpCount: hasCoherenceDump ? coherenceDumpCount : void 0
    };
  } catch (error) {
    console.error("[parseParallelsSystemLog] Parse error:", error);
    return null;
  }
}
function parseTimeZone(xmlData) {
  if (!xmlData || xmlData.trim().length === 0) {
    return null;
  }
  try {
    const timezoneRegex = /<TimeZone>([+-]?\d+)<\/TimeZone>/;
    const match = xmlData.match(timezoneRegex);
    if (!match || !match[1]) {
      return null;
    }
    const timezoneOffset = parseInt(match[1], 10);
    const sign = timezoneOffset >= 0 ? "+" : "";
    const timezoneOffsetStr = `UTC${sign}${timezoneOffset}`;
    return {
      timezoneOffset,
      timezoneOffsetStr
    };
  } catch (error) {
    console.error("[parseTimeZone] Parse error:", error);
    return null;
  }
}
function parseToolsLog(textData, guestOsType) {
  const isWindows = guestOsType ? /Windows/i.test(guestOsType) : true;
  if (!textData || textData.trim().length === 0) {
    return {
      isWindows,
      status: "empty",
      entries: []
    };
  }
  try {
    const lines = textData.split("\n");
    const last1000chars = textData.slice(textData.length - 1e3);
    let status = "warning";
    let toolsSuccess = false;
    if (last1000chars.match(/successful/i)) {
      status = "success";
      toolsSuccess = true;
    } else if (last1000chars.match(/FatalError/i)) {
      status = "error";
    }
    const entries = [];
    const lineRegex = /(?<dateString>\d\d-\d\d \d\d:\d\d:\d\d).*WIN_TOOLS_SETUP\](?<message>.*)/;
    const linesInterpreter = {
      ".*Installation type ([A-Z]+) detected": "$1",
      " Installer exited with error code 3010: The requested operation is successful.*": "Installation successful!",
      " Setup finished with code 3010 \\(0xbc2\\)": "Installation successful!",
      " The requested operation is successful": "Installation successful!",
      " Setup finished with code 0 \\(0x0\\)": "Installation successful!",
      " Setup finished with code 1641 \\(0x669\\)": "Installation successful!",
      " \\*{14} Setup mode: UPDATE from version (\\d\\d\\.\\d\\.\\d\\.\\d{5})": "Updating from $1",
      " \\*{14} Setup mode: EXPRESS INSTALL.": "Original installation.",
      " \\*{14} Setup mode: INSTALL.": "Manual installation.",
      " \\*{14} Setup mode: REINSTALL": "Reinstalling.",
      " Setup completed with code 1603": "Installation failed."
    };
    for (const line of lines) {
      const lineMatch = lineRegex.exec(line);
      if (!lineMatch?.groups) continue;
      const { dateString, message } = lineMatch.groups;
      let interpretedMessage = message;
      for (const [regexPattern, replacement] of Object.entries(linesInterpreter)) {
        const re = new RegExp(regexPattern);
        if (interpretedMessage.match(re)) {
          interpretedMessage = interpretedMessage.replace(re, replacement);
          entries.push({
            timestamp: dateString,
            message: interpretedMessage
          });
          break;
        }
      }
    }
    const last300Lines = lines.slice(-300).join("\n");
    const last30Lines = lines.slice(-30).join("\n");
    const hasCorruptRegistry = /configuration registry database is corrupt/i.test(last300Lines);
    const hasPrlDdIssue = /prl_dd\.inf/i.test(last30Lines) && !toolsSuccess;
    return {
      isWindows,
      status,
      entries,
      hasCorruptRegistry,
      hasPrlDdIssue,
      kbArticle: hasPrlDdIssue ? "KB125243" : void 0
    };
  } catch (error) {
    console.error("[parseToolsLog] Parse error:", error);
    return null;
  }
}
function parseVmDirectory(xmlData) {
  if (!xmlData || xmlData.trim().length === 0) {
    return null;
  }
  try {
    const cleanedXml = xmlData.replace(/&/g, "_");
    const doc = parseXml$4(cleanedXml);
    if (!doc) {
      return null;
    }
    const vms = [];
    const vmElements = doc.querySelectorAll("VirtualMachine");
    for (const vmEl of Array.from(vmElements)) {
      const name = getText$3(vmEl, "VmName");
      const location = getText$3(vmEl, "VmHome");
      const uuid = getText$3(vmEl, "Uuid");
      const registeredOn = getText$3(vmEl, "RegistrationDateTime");
      if (name || location) {
        vms.push({
          name,
          location,
          uuid,
          registeredOn
        });
      }
    }
    return {
      vms,
      vmCount: vms.length
    };
  } catch (error) {
    console.error("[parseVmDirectory] Parse error:", error);
    return null;
  }
}
function deriveCurrentVmFields(summary) {
  const vmHomeRaw = summary.vmHome || "";
  const hdds = summary.hdds || [];
  const netAdapters = summary.netAdapters || [];
  function normalizePosixPath(input) {
    const trimmed = input.trim();
    if (!trimmed) return "";
    const collapsed = trimmed.replace(/\/{2,}/g, "/");
    if (collapsed.length > 1 && collapsed.endsWith("/")) return collapsed.slice(0, -1);
    return collapsed;
  }
  function dirnamePosix2(absPath) {
    const p = normalizePosixPath(absPath);
    const idx = p.lastIndexOf("/");
    if (idx <= 0) return "/";
    return p.slice(0, idx);
  }
  function normalizePvmBundleRoot(vmHomeValue) {
    const vmHome2 = normalizePosixPath(vmHomeValue);
    if (!vmHome2) return "";
    const pvmMatch = /^(?<root>.*?\.pvm)(?:\/|$)/i.exec(vmHome2);
    const root = pvmMatch?.groups?.root;
    if (root) return normalizePosixPath(root);
    if (/\.(pvs|xml|txt|log|json)$/i.test(vmHome2)) {
      return dirnamePosix2(vmHome2);
    }
    return vmHome2;
  }
  const vmHome = normalizePvmBundleRoot(vmHomeRaw);
  const isBootCamp = hdds.some(
    (hdd) => hdd.expanding === "0" && (hdd.actualSize === "0" || hdd.actualSize === "0 B")
  );
  const externalVhddLocations = hdds.map((hdd) => hdd.location).filter((loc) => typeof loc === "string").filter((rawLoc) => {
    const location = normalizePosixPath(rawLoc);
    if (!location || !vmHome) return false;
    if (!location.startsWith("/")) return false;
    const rootPrefix = vmHome.endsWith("/") ? vmHome : `${vmHome}/`;
    return !location.startsWith(rootPrefix);
  });
  const isExternalVhdd = externalVhddLocations.length > 0;
  const isCopied = !!(summary.sourceVmUuid && summary.vmUuid && summary.sourceVmUuid !== summary.vmUuid);
  const isOnExternalVolume = vmHome.startsWith("/Volumes/");
  const isPlainDisk = hdds.some((hdd) => hdd.expanding === "0") && !isBootCamp;
  const hasSplittedDisk = hdds.some((hdd) => hdd.splitted === "1");
  const hasTrimEnabled = hdds.some((hdd) => hdd.trim === "1");
  const hasDisconnectedAdapter = netAdapters.some((adapter) => adapter.connected === "0");
  const hasNetworkConditioner = netAdapters.some((adapter) => adapter.conditionerEnabled === "1");
  const hasNetworkConditionerLimited = hasNetworkConditioner;
  const isSharedNetwork = netAdapters.some((adapter) => adapter.mode?.toLowerCase().includes("shared"));
  const isBridgedNetwork = netAdapters.some((adapter) => adapter.mode?.toLowerCase().includes("bridged"));
  return {
    ...summary,
    isBootCamp,
    isExternalVhdd,
    pvmBundleRoot: vmHome || void 0,
    externalVhddLocations,
    isCopied,
    isOnExternalVolume,
    isPlainDisk,
    hasSplittedDisk,
    hasTrimEnabled,
    hasNetworkConditioner,
    hasNetworkConditionerLimited,
    hasDisconnectedAdapter,
    isSharedNetwork,
    isBridgedNetwork,
    isLinkedClone: false,
    // Would need linkedVmUuid field
    linkedVmUuid: void 0
  };
}
function createEmptyReportModel() {
  return {
    meta: {},
    host: {},
    hostDevices: null,
    license: null,
    currentVm: null,
    advancedVm: null,
    guestOs: null,
    drivers: null,
    processes: null,
    storage: null,
    network: null,
    moreHostInfo: null,
    vmDirectory: null,
    guestCommands: null,
    appConfig: null,
    clientInfo: null,
    proxy: null,
    installedSoftware: null,
    // Phase 4 fields
    timezone: null,
    toolsLog: null,
    systemLog: null,
    launchdInfo: null,
    autoStatisticInfo: null
  };
}
const nodeRegistry = {
  TimeZone: { filenameHints: ["Report.xml"], parse: (raw) => parseTimeZone(raw) },
  CurrentVm: { filenameHints: ["CurrentVm.xml"], parse: (raw) => parseCurrentVm(raw) },
  GuestOs: { filenameHints: ["GuestOs.xml"], parse: (raw) => parseGuestOs(raw) },
  LicenseData: { filenameHints: ["LicenseData.json", "Report.xml"], parse: (raw) => parseLicenseData(raw) },
  NetConfig: { filenameHints: ["NetConfig.xml"], parse: (raw) => parseNetConfig(raw) },
  AdvancedVmInfo: { filenameHints: ["AdvancedVmInfo.xml"], parse: (raw) => parseAdvancedVmInfo(raw) },
  HostInfo: { filenameHints: ["HostInfo.xml"], parse: (raw) => parseHostInfo(raw) },
  LoadedDrivers: { filenameHints: ["LoadedDrivers.txt", "AllLoadedDrivers.txt"], parse: (raw) => parseLoadedDrivers(raw) },
  // MountInfo is sometimes embedded directly in Report.xml as CDATA.
  MountInfo: { filenameHints: ["MountInfo.txt", "Report.xml"], parse: (raw) => parseMountInfo(raw) },
  AllProcesses: { filenameHints: ["AllProcesses.txt"], parse: (raw) => parseAllProcesses(raw) },
  MoreHostInfo: { filenameHints: ["MoreHostInfo.xml"], parse: (raw) => parseMoreHostInfo(raw) },
  VmDirectory: { filenameHints: ["VmDirectory.xml"], parse: (raw) => parseVmDirectory(raw) },
  // GuestCommands may be an archive ref in Report.xml (<NameInArchive>GuestCommands.xml</NameInArchive>)
  // or embedded inline as <GuestCommands><GuestCommand>...</GuestCommand></GuestCommands>.
  GuestCommands: { filenameHints: ["GuestCommands.xml", "GuestCommands.json", "Report.xml"], parse: (raw, ctx) => parseGuestCommands(raw, ctx?.guestOsType) },
  AppConfig: { filenameHints: ["AppConfig.xml"], parse: (raw) => parseAppConfig(raw) },
  // Some reports store ClientInfo in ClientInfo.xml and reference it from Report.xml.
  ClientInfo: { filenameHints: ["ClientInfo.txt", "ClientInfo.xml", "Report.xml"], parse: (raw) => parseClientInfo(raw) },
  ClientProxyInfo: { filenameHints: ["ClientProxyInfo.txt"], parse: (raw) => parseClientProxyInfo(raw) },
  InstalledSoftware: { filenameHints: ["InstalledSoftware.txt"], parse: (raw) => parseInstalledSoftware(raw) },
  ToolsLog: { filenameHints: ["tools.log"], parse: (raw) => parseToolsLog(raw) },
  ParallelsSystemLog: { filenameHints: ["parallels-system.log"], parse: (raw) => parseParallelsSystemLog(raw) },
  LaunchdInfo: { filenameHints: ["LaunchdInfo.txt"], parse: (raw) => parseLaunchdInfo(raw) },
  // AutoStatisticInfo is often embedded (or references an archive file) via Report.xml.
  AutoStatisticInfo: { filenameHints: ["AutoStatisticInfo.xml", "Report.xml"], parse: (raw) => parseAutoStatisticInfo(raw) }
};
function resolveFileByFilename(index, filename) {
  const direct = index.files.find((f) => f.filename === filename);
  if (direct) return direct;
  return index.files.find((f) => f.path.endsWith("/" + filename));
}
async function fetchNodePayload(client, reportId, index, nodeKey, opts) {
  for (const hint of nodeRegistry[nodeKey].filenameHints) {
    const entry = resolveFileByFilename(index, hint);
    if (!entry) continue;
    if (hint === "Report.xml" || entry.filename === "Report.xml") {
      const reportXml = await client.downloadFileText(reportId, entry.path, opts);
      if (nodeKey === "TimeZone") {
        return { ...reportXml, sourceFile: entry };
      }
      const extracted = extractNodePayloadFromReportXml(reportXml.text, nodeKey);
      if (extracted) {
        const archiveRef = extractNameInArchive(extracted, nodeKey);
        if (archiveRef) {
          const refEntry = resolveFileByFilename(index, archiveRef);
          if (refEntry) {
            const refPayload = await client.downloadFileText(reportId, refEntry.path, opts);
            return { ...refPayload, sourceFile: refEntry };
          }
        }
        return { text: extracted, truncated: reportXml.truncated, sourceFile: entry };
      }
      continue;
    }
    const result = await client.downloadFileText(reportId, entry.path, opts);
    return { ...result, sourceFile: entry };
  }
  return null;
}
function extractNodePayloadFromReportXml(reportXml, nodeKey) {
  const tag = nodeKey;
  const re = new RegExp(`<${tag}(\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "i");
  const match = re.exec(reportXml);
  if (!match) return null;
  const inner = match[2] ?? "";
  const cdata = /<!\[CDATA\[([\s\S]*?)\]\]>/i.exec(inner);
  const rawInner = (cdata ? cdata[1] : inner).trim();
  if (nodeKey === "GuestCommands" || nodeKey === "AutoStatisticInfo" || nodeKey === "AdvancedVmInfo") {
    return match[0].trim();
  }
  return rawInner.length ? rawInner : null;
}
function extractNameInArchive(extractedXmlOrText, nodeKey) {
  if (nodeKey !== "ClientInfo" && nodeKey !== "GuestCommands" && nodeKey !== "AutoStatisticInfo") return null;
  const m = /<NameInArchive>\s*([^<\s]+)\s*<\/NameInArchive>/i.exec(extractedXmlOrText);
  const filename = m?.[1]?.trim();
  return filename ? filename : null;
}
function buildReportModelFromRawPayloads(payloads) {
  const report = createEmptyReportModel();
  const summaries = {};
  const guestOs = payloads.GuestOs ? parseGuestOs(payloads.GuestOs) : null;
  summaries.GuestOs = guestOs;
  report.guestOs = guestOs;
  const currentVmSummary = payloads.CurrentVm ? parseCurrentVm(payloads.CurrentVm) : null;
  summaries.CurrentVm = currentVmSummary;
  report.currentVm = currentVmSummary ? deriveCurrentVmFields(currentVmSummary) : null;
  report.license = payloads.LicenseData ? parseLicenseData(payloads.LicenseData) : null;
  summaries.LicenseData = report.license;
  report.network = payloads.NetConfig ? parseNetConfig(payloads.NetConfig) : null;
  summaries.NetConfig = report.network;
  report.advancedVm = payloads.AdvancedVmInfo ? parseAdvancedVmInfo(payloads.AdvancedVmInfo) : null;
  summaries.AdvancedVmInfo = report.advancedVm;
  report.hostDevices = payloads.HostInfo ? parseHostInfo(payloads.HostInfo) : null;
  summaries.HostInfo = report.hostDevices;
  report.drivers = payloads.LoadedDrivers ? parseLoadedDrivers(payloads.LoadedDrivers) : null;
  summaries.LoadedDrivers = report.drivers;
  report.storage = payloads.MountInfo ? parseMountInfo(payloads.MountInfo) : null;
  summaries.MountInfo = report.storage;
  report.processes = payloads.AllProcesses ? parseAllProcesses(payloads.AllProcesses) : null;
  summaries.AllProcesses = report.processes;
  report.moreHostInfo = payloads.MoreHostInfo ? parseMoreHostInfo(payloads.MoreHostInfo) : null;
  summaries.MoreHostInfo = report.moreHostInfo;
  report.vmDirectory = payloads.VmDirectory ? parseVmDirectory(payloads.VmDirectory) : null;
  summaries.VmDirectory = report.vmDirectory;
  report.appConfig = payloads.AppConfig ? parseAppConfig(payloads.AppConfig) : null;
  summaries.AppConfig = report.appConfig;
  report.clientInfo = payloads.ClientInfo ? parseClientInfo(payloads.ClientInfo) : null;
  summaries.ClientInfo = report.clientInfo;
  report.proxy = payloads.ClientProxyInfo ? parseClientProxyInfo(payloads.ClientProxyInfo) : null;
  summaries.ClientProxyInfo = report.proxy;
  report.installedSoftware = payloads.InstalledSoftware ? parseInstalledSoftware(payloads.InstalledSoftware) : null;
  summaries.InstalledSoftware = report.installedSoftware;
  report.launchdInfo = payloads.LaunchdInfo ? parseLaunchdInfo(payloads.LaunchdInfo) : null;
  summaries.LaunchdInfo = report.launchdInfo;
  report.autoStatisticInfo = payloads.AutoStatisticInfo ? parseAutoStatisticInfo(payloads.AutoStatisticInfo) : null;
  summaries.AutoStatisticInfo = report.autoStatisticInfo;
  report.toolsLog = payloads.ToolsLog ? parseToolsLog(payloads.ToolsLog) : null;
  summaries.ToolsLog = report.toolsLog;
  report.systemLog = payloads.ParallelsSystemLog ? parseParallelsSystemLog(payloads.ParallelsSystemLog) : null;
  summaries.ParallelsSystemLog = report.systemLog;
  report.timezone = payloads.TimeZone ? parseTimeZone(payloads.TimeZone) : null;
  summaries.TimeZone = report.timezone;
  report.guestCommands = payloads.GuestCommands ? parseGuestCommands(payloads.GuestCommands, guestOs?.type) : null;
  summaries.GuestCommands = report.guestCommands;
  return { report, summaries };
}
function ensureDomParser() {
  if (typeof globalThis.DOMParser !== "undefined") return;
  const { window } = parseHTML("<html></html>");
  globalThis.DOMParser = window.DOMParser;
  globalThis.XMLSerializer = window.XMLSerializer;
}

export { buildReportModelFromRawPayloads as b, ensureDomParser as e, fetchNodePayload as f, nodeRegistry as n, parseGuestOs as p };
//# sourceMappingURL=runtime-BkNQ314W.js.map
