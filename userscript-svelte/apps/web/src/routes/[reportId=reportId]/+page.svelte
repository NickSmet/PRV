<script lang="ts">
  import { RealityViewer } from '@prv/report-ui-svelte';
  import type { NodeModel, RealityModel, RealityRawItem } from '@prv/report-viewmodel';
  import type { Marker, CurrentVmModel } from '@prv/report-core';

  let { data }: {
    data: {
      reality: RealityModel;
      reportMeta: {
        report_id: number;
        report_type: string | null;
        report_reason: string | null;
        product: string | null;
        product_version: string | null;
        received: string | null;
        parsed: string | null;
        problem_description: string | null;
        server_uuid: string | null;
        computer_model: string | null;
        md5: string | null;
      };
      hostSummary: {
        os: string | null;
        cpu: string | null;
        ramGb: number | null;
        isNotebook: boolean | null;
        computerModel: string | null;
        systemDisk: { free: string | null; capacity: string | null } | null;
      };
      vmIpsByUuid: Record<string, string[]>;
      markers: Marker[];
      nodes: NodeModel[];
      rawItems: RealityRawItem[];
      vmConfigByUuid: Record<string, CurrentVmModel | null>;
      toolsLogMetaByUuid: Record<
        string,
        { status?: string; hasCorruptRegistry?: boolean; hasPrlDdIssue?: boolean; kbArticle?: string } | null
      >;
    };
  } = $props();
</script>

<main class="p-4">
  <RealityViewer
    reportId={data.reality.reportId}
    reality={data.reality}
    reportMeta={data.reportMeta}
    hostSummary={data.hostSummary}
    vmIpsByUuid={data.vmIpsByUuid}
    markers={data.markers}
    nodes={data.nodes}
    rawItems={data.rawItems}
    vmConfigByUuid={data.vmConfigByUuid}
    toolsLogMetaByUuid={data.toolsLogMetaByUuid}
  />
</main>
