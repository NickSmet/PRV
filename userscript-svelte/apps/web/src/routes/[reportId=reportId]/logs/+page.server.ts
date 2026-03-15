import type { PageServerLoad } from './$types';

import { loadLogWorkspacePageData } from '$lib/server/log-workspace';

export const load: PageServerLoad = async ({ params, url }) => {
	return await loadLogWorkspacePageData(params.reportId, {
		forceReparse: url.searchParams.get('reparse') === '1'
	});
};
