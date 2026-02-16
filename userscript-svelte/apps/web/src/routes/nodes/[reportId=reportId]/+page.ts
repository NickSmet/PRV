import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
  const res = await fetch(`/api/reports/${encodeURIComponent(params.reportId)}/model`);
  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    throw error(res.status, msg || `HTTP ${res.status}`);
  }
  return (await res.json()) as unknown;
};

