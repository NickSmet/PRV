import assert from 'node:assert/strict';
import { deriveCurrentVmFields, discoverPerVmFiles, fetchNodePayload, type NodeKey } from '@prv/report-core';
import type { ReportusClient, ReportusReportIndex } from '@prv/report-api';

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

async function main() {
  testDiscoverPerVmFiles();
  testDeriveCurrentVmFieldsIndicators();
  await testFetchNodePayloadFromReportXml();
  // eslint-disable-next-line no-console
  console.log('ok');
}

await main();
