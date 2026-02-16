import type { ReportModel, PerVmDiscoveredFiles } from '@prv/report-core';
import type { ReportusReportIndex } from '@prv/report-api';
import type { RealityCardModel, RealityModel, RealityVmModel } from './realityModel';

export function buildRealityModel(opts: {
  reportId: string;
  report: ReportModel;
  index: ReportusReportIndex;
  perVm: PerVmDiscoveredFiles;
}): RealityModel {
  const { reportId, report, perVm } = opts;

  const currentUuid = (report.currentVm?.vmUuid ?? '').toLowerCase();
  const vms = report.vmDirectory?.vms ?? [];

  const vmModels: RealityVmModel[] = vms
    .filter((vm) => vm.uuid && vm.name)
    .map((vm) => {
      const uuid = (vm.uuid ?? '').toLowerCase();
      const isCurrent = !!uuid && !!currentUuid && uuid === currentUuid;
      const cards: RealityCardModel[] = [];

      const cfgEntry = perVm.vmConfigByUuid[uuid];
      const hasConfig = isCurrent ? !!report.currentVm : !!cfgEntry;

      if (uuid && hasConfig) {
        cards.push({
          id: `vm.${uuid}.settings`,
          title: 'Settings',
          iconKey: 'folder',
          openByDefault: false,
          sources: isCurrent
            ? [{ kind: 'node', nodeKey: 'CurrentVm' }]
            : cfgEntry
              ? [{ kind: 'file', filePath: cfgEntry.path, filename: cfgEntry.filename, vmUuid: uuid }]
              : [],
          render: { kind: 'vmSettings', vmUuid: uuid }
        });
      }

      if (isCurrent) {
        cards.push({
          id: `vm.${uuid}.advanced`,
          title: 'Storage & Snapshots',
          iconKey: 'hdd',
          openByDefault: false,
          sources: [
            { kind: 'node', nodeKey: 'CurrentVm' },
            { kind: 'node', nodeKey: 'AdvancedVmInfo' }
          ],
          render: { kind: 'nodeKey', nodeKey: 'AdvancedVmInfo' }
        });

        cards.push({
          id: `vm.${uuid}.guest-os`,
          title: 'Guest OS',
          iconKey: 'vm',
          openByDefault: false,
          sources: [{ kind: 'node', nodeKey: 'GuestOs' }],
          render: { kind: 'nodeKey', nodeKey: 'GuestOs' }
        });

        cards.push({
          id: `vm.${uuid}.guest-commands`,
          title: 'Inside the VM',
          iconKey: 'vm',
          openByDefault: false,
          sources: [{ kind: 'node', nodeKey: 'GuestCommands' }],
          render: { kind: 'nodeKey', nodeKey: 'GuestCommands' }
        });
      }

      cards.push({
        id: `vm.${uuid}.logs`,
        title: 'Logs',
        iconKey: 'clipboard',
        openByDefault: false,
        sources: [
          ...(perVm.toolsLogByUuid[uuid]
            ? [{
                kind: 'file' as const,
                filePath: perVm.toolsLogByUuid[uuid].path,
                filename: perVm.toolsLogByUuid[uuid].filename,
                vmUuid: uuid
              }]
            : []),
          ...(perVm.vmLogByUuid[uuid]
            ? [{
                kind: 'file' as const,
                filePath: perVm.vmLogByUuid[uuid].path,
                filename: perVm.vmLogByUuid[uuid].filename,
                vmUuid: uuid
              }]
            : []),
          ...(isCurrent && perVm.currentToolsLog
            ? [{
                kind: 'file' as const,
                filePath: perVm.currentToolsLog.path,
                filename: perVm.currentToolsLog.filename,
                vmUuid: uuid
              }]
            : []),
          ...(isCurrent && perVm.currentVmLog
            ? [{
                kind: 'file' as const,
                filePath: perVm.currentVmLog.path,
                filename: perVm.currentVmLog.filename,
                vmUuid: uuid
              }]
            : [])
        ],
        render: { kind: 'vmLogs', vmUuid: uuid }
      });

      return {
        uuid,
        name: vm.name ?? uuid,
        isCurrent,
        cards
      };
    });

  const hostCards: RealityCardModel[] = [
    {
      id: 'host.hardware',
      title: 'Hardware & OS',
      iconKey: 'cpu',
      openByDefault: false,
      sources: [
        { kind: 'node', nodeKey: 'HostInfo' },
        { kind: 'node', nodeKey: 'MoreHostInfo' }
      ],
      render: { kind: 'nodeKey', nodeKey: 'HostInfo' }
    },
    {
      id: 'host.gpu',
      title: 'GPU & Displays',
      iconKey: 'gpu',
      openByDefault: false,
      sources: [{ kind: 'node', nodeKey: 'MoreHostInfo' }],
      render: { kind: 'nodeKey', nodeKey: 'MoreHostInfo' }
    },
    {
      id: 'host.storage',
      title: 'Storage',
      iconKey: 'hdd',
      openByDefault: false,
      sources: [
        { kind: 'node', nodeKey: 'MountInfo' },
        { kind: 'node', nodeKey: 'HostInfo' }
      ],
      render: { kind: 'nodeKey', nodeKey: 'MountInfo' }
    },
    {
      id: 'host.kexts',
      title: 'Kernel Extensions',
      iconKey: 'shield',
      openByDefault: false,
      sources: [{ kind: 'node', nodeKey: 'LoadedDrivers' }],
      render: { kind: 'nodeKey', nodeKey: 'LoadedDrivers' }
    },
    {
      id: 'host.processes',
      title: 'Running Processes',
      iconKey: 'clipboard',
      openByDefault: false,
      sources: [{ kind: 'node', nodeKey: 'AllProcesses' }],
      render: { kind: 'nodeKey', nodeKey: 'AllProcesses' }
    },
    {
      id: 'host.services',
      title: 'Services (launchd)',
      iconKey: 'folder',
      openByDefault: false,
      sources: [{ kind: 'node', nodeKey: 'LaunchdInfo' }],
      render: { kind: 'nodeKey', nodeKey: 'LaunchdInfo' }
    },
    {
      id: 'host.software',
      title: 'Installed Software',
      iconKey: 'folder',
      openByDefault: false,
      sources: [{ kind: 'node', nodeKey: 'InstalledSoftware' }],
      render: { kind: 'nodeKey', nodeKey: 'InstalledSoftware' }
    }
  ];

  const pdCards: RealityCardModel[] = [
    {
      id: 'pd.license',
      title: 'License',
      iconKey: 'shield',
      openByDefault: false,
      sources: [{ kind: 'node', nodeKey: 'LicenseData' }],
      render: { kind: 'nodeKey', nodeKey: 'LicenseData' }
    },
    {
      id: 'pd.network',
      title: 'Virtual Networking',
      iconKey: 'net',
      openByDefault: false,
      sources: [{ kind: 'node', nodeKey: 'NetConfig' }],
      render: { kind: 'nodeKey', nodeKey: 'NetConfig' }
    },
    {
      id: 'pd.config',
      title: 'App Configuration',
      iconKey: 'folder',
      openByDefault: false,
      sources: [{ kind: 'node', nodeKey: 'AppConfig' }],
      render: { kind: 'nodeKey', nodeKey: 'AppConfig' }
    },
    {
      id: 'pd.client',
      title: 'Client & Proxy',
      iconKey: 'cloud',
      openByDefault: false,
      sources: [
        { kind: 'node', nodeKey: 'ClientInfo' },
        { kind: 'node', nodeKey: 'ClientProxyInfo' }
      ],
      render: { kind: 'nodeKey', nodeKey: 'ClientInfo' }
    },
    {
      id: 'pd.history',
      title: 'Installation History',
      iconKey: 'clock',
      openByDefault: false,
      sources: [{ kind: 'node', nodeKey: 'AutoStatisticInfo' }],
      render: { kind: 'nodeKey', nodeKey: 'AutoStatisticInfo' }
    }
  ];

  return {
    reportId,
    sections: [
      { id: 'header', title: 'Report', openByDefault: true, cards: [] },
      { id: 'host', title: 'Host', openByDefault: true, cards: hostCards },
      { id: 'parallels', title: 'Parallels Desktop', openByDefault: true, cards: pdCards },
      {
        id: 'vms',
        title: 'Virtual Machines',
        openByDefault: true,
        cards: [],
        vms: vmModels
      },
      {
        id: 'raw',
        title: 'Raw',
        openByDefault: false,
        cards: [
          {
            id: 'raw.index',
            title: 'Raw Report Nodes',
            iconKey: 'folder',
            openByDefault: false,
            sources: [],
            render: { kind: 'rawIndex' }
          }
        ]
      }
    ]
  };
}
