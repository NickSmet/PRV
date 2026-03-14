import type { PageServerLoad } from './$types';

import { loadLogWorkspacePageData } from '$lib/server/log-workspace';

export const load: PageServerLoad = async ({ params }) => {
	return await loadLogWorkspacePageData(params.reportId);
};
