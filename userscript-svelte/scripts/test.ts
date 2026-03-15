import assert from 'node:assert/strict';
import { deriveCurrentVmFields, discoverPerVmFiles, fetchNodePayload, type NodeKey } from '@prv/report-core';
import type { ReportusClient, ReportusReportIndex } from '@prv/report-api';
import {
	APP_MICROSOFT_CATEGORY,
	APP_SYSTEM_CATEGORY,
	APP_THIRD_PARTY_CATEGORY
} from '../apps/web/src/lib/lab/log-timeline/appCategories';
import {
	buildCompactTimeline,
} from '../apps/web/src/lib/lab/log-timeline/buildCompactPayload';
import { classifyWindowsTimelineApp } from '../apps/web/src/lib/lab/log-timeline/classifyWindowsTimelineApp';
import { POINT_EVENT_THRESHOLD_MS } from '../apps/web/src/lib/lab/log-timeline/displaySemantics';
import {
	clusterTimelineEvents,
	type VisibleWindow
} from '../apps/web/src/lib/lab/log-timeline/clustering/clusterTimelineEvents';
import { extractTimelineEventsFromRows } from '../apps/web/src/lib/lab/log-timeline/extractEvents';
import { parseLogText } from '../apps/web/src/lib/lab/log-index/parse';
import type { TimelineEvent } from '../apps/web/src/lib/lab/timeline/types';

function testDiscoverPerVmFiles() {
  const uuid = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
  const index: ReportusReportIndex = {
    _id: 'x',
    filename: 'report-x.tar.gz',
    files: [
      { filename: `vm-${uuid}-config.pvs.log`, path: `root/vm-${uuid}-config.pvs.log`, size: 10, offset: 0 },
      { filename: `vm-${uuid}.log`, path: `root/vm-${uuid}.log`, size: 11, offset: 0 },
      { filename: `tools-${uuid}.log`, path: `root/tools-${uuid}.log`, size: 12, offset: 0 },
      { filename: 'vm.log', path: 'root/vm.log', size: 13, offset: 0 },
      { filename: 'vm.1.gz.log', path: 'root/vm.1.gz.log', size: 14, offset: 0 },
      { filename: 'tools.log', path: 'root/tools.log', size: 15, offset: 0 },
      { filename: 'PrlProblemReportHostScreen-1.png', path: 'root/PrlProblemReportHostScreen-1.png', size: 16, offset: 0 },
      { filename: 'something-else.txt', path: 'root/something-else.txt', size: 17, offset: 0 }
    ]
  };

  const perVm = discoverPerVmFiles(index);
  assert.equal(perVm.vmConfigByUuid[uuid].filename, `vm-${uuid}-config.pvs.log`);
  assert.equal(perVm.vmLogByUuid[uuid].filename, `vm-${uuid}.log`);
  assert.equal(perVm.toolsLogByUuid[uuid].filename, `tools-${uuid}.log`);
  assert.equal(perVm.currentVmLog?.filename, 'vm.log');
  assert.equal(perVm.currentToolsLog?.filename, 'tools.log');
  assert.equal(perVm.screenshots.length, 1);
}

async function testFetchNodePayloadFromReportXml() {
  const reportId = '512022712';
  const reportXml = `<?xml version="1.0" encoding="utf-8"?>
<Report>
  <LicenseData><![CDATA[{\"edition\":\"pro\",\"expires\":\"never\"}]]></LicenseData>
  <GuestCommands><NameInArchive>GuestCommands.xml</NameInArchive></GuestCommands>
</Report>`;

  const index: Pick<ReportusReportIndex, 'files'> = {
    files: [{ filename: 'Report.xml', path: 'root/Report.xml', size: reportXml.length, offset: 0 }]
  };

  const client: ReportusClient = {
    async getReportIndex() {
      throw new Error('not used');
    },
    async downloadFileText(_rid, filePath) {
      if (filePath === 'root/Report.xml') return { text: reportXml, truncated: false };
      if (filePath === 'root/GuestCommands.xml') return { text: '<GuestCommands><GuestCommand>ok</GuestCommand></GuestCommands>', truncated: false };
      throw new Error(`unexpected filePath: ${filePath}`);
    },
    async downloadFileBytes() {
      throw new Error('not used');
    }
  };

  const lic = await fetchNodePayload(client, reportId, index, 'LicenseData', { maxBytes: 1024 });
  assert.ok(lic?.text.includes('"edition":"pro"'));
  assert.ok(!lic?.text.includes('<Report>'), 'LicenseData should not receive full Report.xml');

  const guest = await fetchNodePayload(client, reportId, {
    files: [
      ...index.files,
      { filename: 'GuestCommands.xml', path: 'root/GuestCommands.xml', size: 10, offset: 0 }
    ]
  }, 'GuestCommands' satisfies NodeKey, { maxBytes: 1024 });
  assert.ok(guest?.text.includes('<GuestCommands'), 'GuestCommands should be full element XML');
}

function testDeriveCurrentVmFieldsIndicators() {
  {
    const vm = deriveCurrentVmFields({
      hdds: [],
      cds: [],
      netAdapters: [],
      usbDevices: [],
      linkedVmUuid: '11111111-2222-3333-4444-555555555555'
    });
    assert.equal(vm.isLinkedClone, true);
    assert.equal(vm.linkedVmUuid, '11111111-2222-3333-4444-555555555555');
  }

  {
    const vm = deriveCurrentVmFields({
      hdds: [],
      cds: [],
      netAdapters: [],
      usbDevices: [],
      creationDate: '1751-12-31 00:00:00'
    });
    assert.equal(vm.isImported, true);
  }

  {
    const vm = deriveCurrentVmFields({
      hdds: [],
      cds: [],
      netAdapters: [
        {
          conditionerEnabled: '1',
          conditionerTxBps: '0',
          conditionerRxBps: '0',
          conditionerTxLossPpm: '0',
          conditionerRxLossPpm: '0',
          conditionerTxDelayMs: '0',
          conditionerRxDelayMs: '0'
        }
      ],
      usbDevices: []
    });
    assert.equal(vm.hasNetworkConditioner, true);
    assert.equal(vm.hasNetworkConditionerLimited, false);
  }

  {
    const vm = deriveCurrentVmFields({
      hdds: [],
      cds: [],
      netAdapters: [
        {
          conditionerEnabled: '1',
          conditionerTxBps: '1000',
          conditionerRxBps: '0',
          conditionerTxLossPpm: '0',
          conditionerRxLossPpm: '0',
          conditionerTxDelayMs: '0',
          conditionerRxDelayMs: '0'
        }
      ],
      usbDevices: []
    });
    assert.equal(vm.hasNetworkConditioner, true);
    assert.equal(vm.hasNetworkConditionerLimited, true);
  }
}

function testTimelineAppClassification() {
  assert.equal(
    classifyWindowsTimelineApp('C:\\Windows\\system32\\LogonUI.exe\\d2d1.dll'),
    APP_SYSTEM_CATEGORY
  );
  assert.equal(
    classifyWindowsTimelineApp(
      'C:\\Program Files\\WindowsApps\\Microsoft.WindowsNotepad_11.2508.38.0_arm64__8wekyb3d8bbwe\\Notepad\\Notepad.exe\\d2d1.dll'
    ),
    APP_MICROSOFT_CATEGORY
  );
  assert.equal(
    classifyWindowsTimelineApp('C:\\Users\\nick\\AppData\\Local\\Microsoft\\OneDrive\\OneDrive.exe\\d2d1.dll'),
    APP_MICROSOFT_CATEGORY
  );
  assert.equal(
    classifyWindowsTimelineApp('C:\\Program Files\\iCloud\\iCloudHome.exe\\d2d1.dll'),
    APP_THIRD_PARTY_CATEGORY
  );
}

function testExtractTimelineEventsBucketsApps() {
  const rows = [
    {
      id: 'row-1',
      sourceFile: 'vm.log',
      lineNo: 10,
      message: 'D3D11.32: C:\\Windows\\explorer.exe\\d2d1.dll',
      raw: 'D3D11.32: C:\\Windows\\explorer.exe\\d2d1.dll',
      tsWallMs: Date.UTC(2026, 0, 10, 12, 0, 0)
    },
    {
      id: 'row-2',
      sourceFile: 'vm.log',
      lineNo: 11,
      message: 'D3D11.32: C:\\Users\\nick\\AppData\\Local\\Microsoft\\OneDrive\\OneDrive.exe\\d2d1.dll',
      raw: 'D3D11.32: C:\\Users\\nick\\AppData\\Local\\Microsoft\\OneDrive\\OneDrive.exe\\d2d1.dll',
      tsWallMs: Date.UTC(2026, 0, 10, 12, 0, 1)
    },
    {
      id: 'row-3',
      sourceFile: 'vm.log',
      lineNo: 12,
      message: 'D3D11.32: C:\\Program Files\\iCloud\\iCloudHome.exe\\d2d1.dll',
      raw: 'D3D11.32: C:\\Program Files\\iCloud\\iCloudHome.exe\\d2d1.dll',
      tsWallMs: Date.UTC(2026, 0, 10, 12, 0, 2)
    }
  ] as any[];

  const events = extractTimelineEventsFromRows(rows);
  assert.deepEqual(
    events.map((event) => event.category),
    [APP_SYSTEM_CATEGORY, APP_MICROSOFT_CATEGORY, APP_THIRD_PARTY_CATEGORY]
  );
  assert.ok(events.every((event) => event.end == null));
}

function testExtractTimelineEventsDedupesNearDuplicateAppSightings() {
  const rows = [
    {
      id: 'row-app-1',
      sourceFile: 'vm.log',
      lineNo: 10,
      message: 'D3D11.32: C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      raw: 'D3D11.32: C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      tsWallMs: Date.UTC(2026, 0, 10, 12, 0, 0, 0)
    },
    {
      id: 'row-app-2',
      sourceFile: 'vm.log',
      lineNo: 11,
      message: 'D3D12.20: C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      raw: 'D3D12.20: C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      tsWallMs: Date.UTC(2026, 0, 10, 12, 0, 1, 500)
    },
    {
      id: 'row-app-3',
      sourceFile: 'vm.log',
      lineNo: 12,
      message: 'D3D11.32: C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      raw: 'D3D11.32: C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      tsWallMs: Date.UTC(2026, 0, 10, 12, 0, 3, 500)
    }
  ] as any[];

  const events = extractTimelineEventsFromRows(rows);
  assert.equal(events.length, 2);
  assert.ok(events.every((event) => event.end == null));
  assert.equal(events[0]?.start.getTime(), Date.UTC(2026, 0, 10, 12, 0, 0, 0));
  assert.equal(events[1]?.start.getTime(), Date.UTC(2026, 0, 10, 12, 0, 3, 500));
}

function testExtractTimelineEventsToolsLog() {
  const rows = [
    {
      id: 'tools-1',
      sourceFile: 'tools.log',
      lineNo: 1,
      message: '[WIN_TOOLS_SETUP] ************** Setup mode: UPDATE from version 19.4.0.12345',
      raw: '01-10 12:00:00.000 I /prl_tools/ [WIN_TOOLS_SETUP] ************** Setup mode: UPDATE from version 19.4.0.12345',
      tsWallMs: Date.UTC(2026, 0, 10, 12, 0, 0)
    },
    {
      id: 'tools-2',
      sourceFile: 'tools.log',
      lineNo: 2,
      message: '[WIN_TOOLS_SETUP] Setup completed with code 1603',
      raw: '01-10 12:01:00.000 I /prl_tools/ [WIN_TOOLS_SETUP] Setup completed with code 1603',
      tsWallMs: Date.UTC(2026, 0, 10, 12, 1, 0)
    },
    {
      id: 'tools-3',
      sourceFile: 'tools.log',
      lineNo: 3,
      message: '[WIN_TOOLS_SETUP] configuration registry database is corrupt',
      raw: '01-10 12:02:00.000 I /prl_tools/ [WIN_TOOLS_SETUP] configuration registry database is corrupt',
      tsWallMs: Date.UTC(2026, 0, 10, 12, 2, 0)
    },
    {
      id: 'tools-4',
      sourceFile: 'tools.log',
      lineNo: 4,
      message: '[WIN_TOOLS_SETUP] driver install failed for prl_dd.inf',
      raw: '01-10 12:03:00.000 I /prl_tools/ [WIN_TOOLS_SETUP] driver install failed for prl_dd.inf',
      tsWallMs: Date.UTC(2026, 0, 10, 12, 3, 0)
    }
  ] as any[];

  const events = extractTimelineEventsFromRows(rows);
  assert.ok(events.some((event) => event.category === 'Tools Install' && event.label === 'Updating from 19.4.0.12345'));
  assert.ok(events.some((event) => event.category === 'Tools Install' && event.label === 'Installation failed.' && event.severity === 'danger'));
  assert.ok(events.some((event) => event.category === 'Tools Issues' && event.label === 'Registry database is corrupt'));
  assert.ok(events.some((event) => event.category === 'Tools Issues' && event.label.includes('KB125243')));
}

function testExtractTimelineEventsToolsLogSuppressesKbIssueAfterSuccess() {
  const rows = [
    {
      id: 'tools-success-1',
      sourceFile: 'tools.log',
      lineNo: 1,
      message: '[WIN_TOOLS_SETUP] driver install failed for prl_dd.inf',
      raw: '01-10 12:03:00.000 I /prl_tools/ [WIN_TOOLS_SETUP] driver install failed for prl_dd.inf',
      tsWallMs: Date.UTC(2026, 0, 10, 12, 3, 0)
    },
    {
      id: 'tools-success-2',
      sourceFile: 'tools.log',
      lineNo: 2,
      message: '[WIN_TOOLS_SETUP] Setup finished with code 0 (0x0)',
      raw: '01-10 12:04:00.000 I /prl_tools/ [WIN_TOOLS_SETUP] Setup finished with code 0 (0x0)',
      tsWallMs: Date.UTC(2026, 0, 10, 12, 4, 0)
    }
  ] as any[];

  const events = extractTimelineEventsFromRows(rows);
  assert.ok(events.some((event) => event.category === 'Tools Install' && event.label === 'Installation successful!'));
  assert.ok(!events.some((event) => event.category === 'Tools Issues' && event.label.includes('KB125243')));
}

function testExtractTimelineEventsToolsLogFromParsedTags() {
  const text = [
    '01-10 12:00:00.000 I /prl_tools/ [G] [WIN_TOOLS_SETUP] SIProp0368> Installation type UPDATE detected',
    '01-10 12:01:00.000 I /prl_tools/ [G] [WIN_TOOLS_SETUP] Installer exited with error code 3010: The requested operation is successful. Changes will not be effective until the system is rebooted.'
  ].join('\n');

  const parsed = parseLogText({
    text,
    reportId: 'fixture-tools-parse',
    sourceFile: 'tools.log',
    baseYear: 2026,
    yearInferredFrom: 'default'
  });

  const events = extractTimelineEventsFromRows(parsed.rows);
  assert.ok(events.some((event) => event.category === 'Tools Install' && event.label === 'Installation type: UPDATE'));
  assert.ok(events.some((event) => event.category === 'Tools Install' && event.label === 'Installation successful!'));
}

function testExtractTimelineEventsKeepsConfigDiffsSeparate() {
  const rows = [
    {
      id: 'cfg-1',
      sourceFile: 'parallels-system.log',
      lineNo: 101,
      message: "VmCfgCommitDiff: Key: 'Hardware.USB[0].Connected', New value: '1', Old value: '0'",
      raw: "VmCfgCommitDiff: Key: 'Hardware.USB[0].Connected', New value: '1', Old value: '0'",
      tsWallMs: Date.UTC(2026, 0, 10, 12, 0, 0, 0)
    },
    {
      id: 'cfg-2',
      sourceFile: 'parallels-system.log',
      lineNo: 102,
      message: "VmCfgCommitDiff: Key: 'Hardware.Hdd[0].SizeOnDisk', New value: '107541', Old value: '107526'",
      raw: "VmCfgCommitDiff: Key: 'Hardware.Hdd[0].SizeOnDisk', New value: '107541', Old value: '107526'",
      tsWallMs: Date.UTC(2026, 0, 10, 12, 0, 0, 100)
    }
  ] as any[];

  const events = extractTimelineEventsFromRows(rows);
  const configEvents = events.filter((event) => event.category === 'Config Diffs');

  assert.equal(configEvents.length, 2);
  assert.deepEqual(
    configEvents.map((event) => event.label),
    ['Hardware.USB[0].Connected', 'Hardware.Hdd[0].SizeOnDisk']
  );
  assert.ok(configEvents.every((event) => event.end == null));
}

function testParseLogTextFallsBackForInvalidTimestampEntry() {
  const text = [
    '01-10 12:00:00.000 W /prl_vm/ First event',
    '13-77 99:99:99.999 D /prl_vm/ [WIN_TOOLS_SETUP] Broken timestamp event'
  ].join('\n');

  const parsed = parseLogText({
    text,
    reportId: 'parse-fallback-invalid-ts',
    sourceFile: 'tools.log',
    baseYear: 2026,
    yearInferredFrom: 'default'
  });

  assert.equal(parsed.rows.length, 2);
  assert.equal(parsed.rows[0]?.kind, 'entry');
  assert.equal(parsed.rows[1]?.kind, 'entry');
  assert.equal(parsed.rows[0]?.tsWallMs, Date.UTC(2026, 0, 10, 12, 0, 0, 0));
  assert.equal(parsed.rows[1]?.tsWallMs, Date.UTC(2026, 0, 10, 12, 0, 0, 1));
  assert.equal(parsed.rows[1]?.tsRaw, '13-77 99:99:99.999');
  assert.equal(parsed.rows[1]?.level, 'D');
  assert.equal(parsed.rows[1]?.component, 'prl_vm');
  assert.deepEqual(parsed.rows[1]?.tags, ['WIN_TOOLS_SETUP']);
  assert.equal(parsed.rows[1]?.message, 'Broken timestamp event');
  assert.equal(parsed.stats.entryWithTs, 1);
}

function testParseLogTextFallsBackForMissingTimestampEntry() {
  const text = [
    '01-10 12:00:00.000 I /prl_tools/ Start install',
    '/prl_tools/ [G] Missing timestamp payload',
    'I /prl_tools/ Explicit level without timestamp',
    '01-10 12:00:00.000 i /prl_tools/ Lowercase level falls back'
  ].join('\n');

  const parsed = parseLogText({
    text,
    reportId: 'parse-fallback-missing-ts',
    sourceFile: 'tools.log',
    baseYear: 2026,
    yearInferredFrom: 'default'
  });

  assert.equal(parsed.rows.length, 4);
  assert.equal(parsed.rows[1]?.kind, 'entry');
  assert.equal(parsed.rows[1]?.tsWallMs, Date.UTC(2026, 0, 10, 12, 0, 0, 1));
  assert.equal(parsed.rows[1]?.tsRaw, null);
  assert.equal(parsed.rows[1]?.level, 'I');
  assert.equal(parsed.rows[1]?.component, 'prl_tools');
  assert.deepEqual(parsed.rows[1]?.tags, ['G']);
  assert.equal(parsed.rows[1]?.message, 'Missing timestamp payload');
  assert.equal(parsed.rows[2]?.kind, 'entry');
  assert.equal(parsed.rows[2]?.tsWallMs, Date.UTC(2026, 0, 10, 12, 0, 0, 2));
  assert.equal(parsed.rows[2]?.level, 'I');
  assert.equal(parsed.rows[3]?.kind, 'entry');
  assert.equal(parsed.rows[3]?.tsWallMs, Date.UTC(2026, 0, 10, 12, 0, 0, 0));
  assert.equal(parsed.rows[3]?.tsRaw, '01-10 12:00:00.000');
  assert.equal(parsed.rows[3]?.level, 'I');
}

function testParseLogTextFallsBackForMalformedRepeatTimestamp() {
  const text = [
    '01-10 12:00:00.000 I /prl_tools/ Base entry',
    '02-99 12:61:00.000 Last message repeated 3 times.'
  ].join('\n');

  const parsed = parseLogText({
    text,
    reportId: 'parse-fallback-repeat-ts',
    sourceFile: 'tools.log',
    baseYear: 2026,
    yearInferredFrom: 'default'
  });

  assert.equal(parsed.rows.length, 2);
  assert.equal(parsed.rows[1]?.kind, 'repeat');
  assert.equal(parsed.rows[1]?.parentId, parsed.rows[0]?.id ?? null);
  assert.equal(parsed.rows[1]?.repeatCount, 3);
  assert.equal(parsed.rows[1]?.tsWallMs, Date.UTC(2026, 0, 10, 12, 0, 0, 1));
  assert.equal(parsed.rows[1]?.tsRaw, '02-99 12:61:00.000');
}

function makeTimelineEvent(id: string, category: string, offsetMinutes: number): TimelineEvent {
  const start = new Date(Date.UTC(2026, 0, 10, 12, offsetMinutes, 0));
  return {
    id,
    sourceFile: 'vm.log',
    category,
    severity: 'info',
    start,
    end: new Date(start.getTime() + 60_000),
    label: id,
    startRef: null,
    endRef: null
  };
}

function testBuildCompactTimelineKeepsHiddenAppRows() {
  const payload = buildCompactTimeline(
    [makeTimelineEvent('third-party-visible', APP_THIRD_PARTY_CATEGORY, 0)],
    {
      categoryTotals: {
        [APP_SYSTEM_CATEGORY]: 2,
        [APP_MICROSOFT_CATEGORY]: 3,
        [APP_THIRD_PARTY_CATEGORY]: 1
      },
      ensureCategories: [
        APP_SYSTEM_CATEGORY,
        APP_MICROSOFT_CATEGORY,
        APP_THIRD_PARTY_CATEGORY
      ],
      extentEvents: [
        makeTimelineEvent('system-hidden', APP_SYSTEM_CATEGORY, 0),
        makeTimelineEvent('microsoft-hidden', APP_MICROSOFT_CATEGORY, 1),
        makeTimelineEvent('third-party-visible', APP_THIRD_PARTY_CATEGORY, 2)
      ]
    }
  );

  const groupContent = payload.groups
    .filter((group) => String(group.id).startsWith('cat:vm:'))
    .map((group) => String(group.content));

  assert.equal(payload.items.length, 1);
  assert.equal(groupContent.length, 3);
  assert.ok(groupContent.some((content) => content.includes(APP_SYSTEM_CATEGORY) && content.includes('2')));
  assert.ok(groupContent.some((content) => content.includes(APP_MICROSOFT_CATEGORY) && content.includes('3')));
  assert.ok(groupContent.some((content) => content.includes(APP_THIRD_PARTY_CATEGORY) && content.includes('1')));
}

function testBuildCompactTimelineInflatesSingletonsAtWideZoom() {
  const event = makeTimelineEvent('tools-singleton', 'Tools Install', 0);
  event.end = undefined;
  const later = makeTimelineEvent('tools-later', 'Tools Install', 3 * 24 * 60);

  const payload = buildCompactTimeline([event], {
    visibleSpanMs: 15 * 24 * 60 * 60 * 1000,
    extentEvents: [event, later]
  });

  assert.equal(payload.items.length, 1);
  const item = payload.items[0] as { start: Date; end?: Date; type?: string };
  assert.equal(item.type, 'point');
  assert.equal(item.end, undefined);
}

function testBuildCompactTimelineInitialWindowPadsPastLastTimestamp() {
  const first = makeTimelineEvent('tools-a', 'Tools Install', 0);
  const last = makeTimelineEvent('tools-b', 'Tools Install', 120);
  last.end = new Date(last.start.getTime() + 5 * 60 * 1000);

  const payload = buildCompactTimeline([first, last]);

  assert.ok(payload.initialWindow);
  assert.ok(payload.customTimes);
  assert.equal(payload.customTimes?.[0]?.id, 'report-cutoff');
  assert.equal(payload.customTimes?.[0]?.time.getTime(), last.end.getTime());
  assert.equal(payload.initialWindow?.end.getTime(), last.end.getTime() + 60 * 60 * 1000);
  assert.equal(
    payload.initialWindow?.end.getTime() - payload.initialWindow!.start.getTime(),
    5 * 60 * 60 * 1000
  );
}

function testBuildCompactTimelineTreatsShortRangesAsPoints() {
  const gui = makeTimelineEvent('gui-short', 'GUI Messages', 0);
  gui.end = new Date(gui.start.getTime() + POINT_EVENT_THRESHOLD_MS);
  const later = makeTimelineEvent('gui-later', 'GUI Messages', 60);

  const payload = buildCompactTimeline([gui], {
    visibleSpanMs: 35 * 60 * 1000,
    extentEvents: [gui, later]
  });

  assert.equal(payload.items.length, 1);
  const item = payload.items[0] as { start: Date; end?: Date; type?: string; className?: string };
  assert.equal(item.type, 'point');
  assert.equal(item.end, undefined);
  assert.ok(String(item.className).includes('prv-ct-item--point'));
}

function testBuildCompactTimelineExpandsUnreadableRangesFromStart() {
  const gui = makeTimelineEvent('gui-readable', 'GUI Messages', 0);
  gui.end = new Date(gui.start.getTime() + 8000);
  const later = makeTimelineEvent('gui-later', 'GUI Messages', 60);

  const payload = buildCompactTimeline([gui], {
    visibleSpanMs: 35 * 60 * 1000,
    extentEvents: [gui, later]
  });

  assert.equal(payload.items.length, 1);
  const item = payload.items[0] as { start: Date; end?: Date; type?: string; className?: string };
  assert.equal(item.type, 'range');
  assert.ok(item.end instanceof Date);
  assert.equal(item.start.getTime(), gui.start.getTime());
  assert.ok(item.end!.getTime() > gui.end!.getTime());
  assert.ok(String(item.className).includes('prv-ct-item--readability'));
}

function testBuildCompactTimelineKeepsReadableRangesAtRealDuration() {
  const gui = makeTimelineEvent('gui-range', 'GUI Messages', 0);
  gui.end = new Date(gui.start.getTime() + 8 * 60 * 1000);
  const later = makeTimelineEvent('gui-later', 'GUI Messages', 60);

  const payload = buildCompactTimeline([gui], {
    visibleSpanMs: 35 * 60 * 1000,
    extentEvents: [gui, later]
  });

  assert.equal(payload.items.length, 1);
  const item = payload.items[0] as { start: Date; end?: Date; type?: string; className?: string };
  assert.equal(item.type, 'range');
  assert.ok(item.end instanceof Date);
  assert.equal(item.end!.getTime() - item.start.getTime(), 8 * 60 * 1000);
  assert.ok(String(item.className).includes('prv-ct-item--range'));
}

function testBuildCompactTimelineCapsClusterDisplayWidth() {
  const cluster = makeTimelineEvent('cluster:config-diffs:all:0:0:0', 'Config Diffs', 0);
  cluster.end = new Date(cluster.start.getTime() + 4 * 60 * 1000);
  cluster.label = '3 config changes';
  const later = makeTimelineEvent('config-later', 'Config Diffs', 5);
  later.end = new Date(later.start.getTime() + 60 * 1000);

  const payload = buildCompactTimeline([cluster], {
    visibleSpanMs: 6 * 60 * 1000,
    extentEvents: [cluster, later]
  });

  assert.equal(payload.items.length, 1);
  const item = payload.items[0] as { start: Date; end?: Date };
  assert.ok(item.end instanceof Date);
  const durationMs = item.end!.getTime() - item.start.getTime();
  assert.equal(durationMs, Math.round(6 * 60 * 1000 * (220 / 800)));
}

function testBuildCompactTimelineClipsInflatedEndAtReportCutoff() {
  const cluster = makeTimelineEvent('cluster:config-diffs:all:0:0:0', 'Config Diffs', 0);
  cluster.end = undefined;
  cluster.label = '3 config changes';

  const payload = buildCompactTimeline([cluster], {
    visibleSpanMs: 17 * 60 * 1000
  });

  assert.equal(payload.items.length, 1);
  const item = payload.items[0] as { start: Date; end?: Date };
  assert.equal(item.start.getTime(), cluster.start.getTime());
  assert.equal(item.end, undefined);
}

function testClusterTimelineEventsByAppCategory() {
  const events: TimelineEvent[] = [];
  for (let index = 0; index < 6; index += 1) {
    events.push(makeTimelineEvent(`system-${index}`, APP_SYSTEM_CATEGORY, index));
    events.push(makeTimelineEvent(`third-${index}`, APP_THIRD_PARTY_CATEGORY, index));
  }

  const window: VisibleWindow = {
    startMs: Date.UTC(2026, 0, 10, 12, 0, 0),
    endMs: Date.UTC(2026, 0, 10, 19, 0, 0),
    spanMs: 7 * 60 * 60 * 1000
  };

  const model = clusterTimelineEvents(events, window);
  assert.equal(model.mode, 'clustered');
  assert.ok((model.stats.clusteredByCategory[APP_SYSTEM_CATEGORY] ?? 0) > 0);
  assert.ok((model.stats.clusteredByCategory[APP_THIRD_PARTY_CATEGORY] ?? 0) > 0);
}

function testClusterTimelineEventsKeepsSingletonBurstsUnclustered() {
  const events: TimelineEvent[] = [
    makeTimelineEvent('tools-a', 'Tools Install', 0),
    makeTimelineEvent('tools-b', 'Tools Install', 24 * 60),
    makeTimelineEvent('tools-c', 'Tools Install', 48 * 60),
    makeTimelineEvent('tools-d', 'Tools Install', 72 * 60),
    makeTimelineEvent('tools-e', 'Tools Install', 96 * 60),
    makeTimelineEvent('tools-f', 'Tools Install', 120 * 60)
  ];

  const window: VisibleWindow = {
    startMs: Date.UTC(2026, 0, 10, 12, 0, 0),
    endMs: Date.UTC(2026, 0, 20, 12, 0, 0),
    spanMs: 10 * 24 * 60 * 60 * 1000
  };

  const model = clusterTimelineEvents(events, window);
  assert.equal(model.mode, 'none');
  assert.equal(model.events.length, events.length);
  assert.ok(model.events.every((event) => !event.id.startsWith('cluster:')));
  assert.equal(model.stats.clusteredByCategory['Tools Install'] ?? 0, 0);
}

function testClusterTimelineEventsClustersPointLikeSummaryItemsByDisplayFootprint() {
  const events: TimelineEvent[] = [
    makeTimelineEvent('cfg-1', 'Config Diffs', 0),
    makeTimelineEvent('cfg-2', 'Config Diffs', 10),
    makeTimelineEvent('cfg-3', 'Config Diffs', 20),
    makeTimelineEvent('cfg-4', 'Config Diffs', 30),
    makeTimelineEvent('cfg-5', 'Config Diffs', 40),
    makeTimelineEvent('cfg-6', 'Config Diffs', 50)
  ];

  for (const event of events) {
    event.label = '3 config changes';
    event.end = new Date(event.start.getTime() + 250);
  }

  const window: VisibleWindow = {
    startMs: Date.UTC(2026, 0, 10, 12, 0, 0),
    endMs: Date.UTC(2026, 0, 10, 19, 0, 0),
    spanMs: 7 * 60 * 60 * 1000
  };

  const model = clusterTimelineEvents(events, window);
  assert.equal(model.mode, 'clustered');
  assert.ok(model.events.some((event) => event.id.startsWith('cluster:')));
  assert.ok(model.events.every((event) => event.id.startsWith('cluster:')));
  assert.equal(model.events.length, 1);
}

async function main() {
  testDiscoverPerVmFiles();
  testDeriveCurrentVmFieldsIndicators();
  testTimelineAppClassification();
  testExtractTimelineEventsBucketsApps();
  testExtractTimelineEventsDedupesNearDuplicateAppSightings();
  testExtractTimelineEventsToolsLog();
  testExtractTimelineEventsToolsLogSuppressesKbIssueAfterSuccess();
  testExtractTimelineEventsToolsLogFromParsedTags();
  testExtractTimelineEventsKeepsConfigDiffsSeparate();
  testParseLogTextFallsBackForInvalidTimestampEntry();
  testParseLogTextFallsBackForMissingTimestampEntry();
  testParseLogTextFallsBackForMalformedRepeatTimestamp();
  testBuildCompactTimelineKeepsHiddenAppRows();
  testBuildCompactTimelineInflatesSingletonsAtWideZoom();
  testBuildCompactTimelineInitialWindowPadsPastLastTimestamp();
  testBuildCompactTimelineTreatsShortRangesAsPoints();
  testBuildCompactTimelineExpandsUnreadableRangesFromStart();
  testBuildCompactTimelineKeepsReadableRangesAtRealDuration();
  testBuildCompactTimelineCapsClusterDisplayWidth();
  testBuildCompactTimelineClipsInflatedEndAtReportCutoff();
  testClusterTimelineEventsByAppCategory();
  testClusterTimelineEventsKeepsSingletonBurstsUnclustered();
  testClusterTimelineEventsClustersPointLikeSummaryItemsByDisplayFootprint();
  await testFetchNodePayloadFromReportXml();
  // eslint-disable-next-line no-console
  console.log('ok');
}

await main();
