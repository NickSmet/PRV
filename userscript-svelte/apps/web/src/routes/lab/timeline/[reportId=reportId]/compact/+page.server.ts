import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url }) => {
	const query = url.searchParams.toString();
	const suffix = query ? `?${query}` : '';
	throw redirect(307, `/${encodeURIComponent(params.reportId)}/logs${suffix}`);
};
