import { defineConfig, RegistryItem } from 'jsrepo';
import { svelte } from 'jsrepo/langs';

export default defineConfig({
    // configure where stuff comes from here
    registries: ['@ieedan/shadcn-svelte-extras'],
    // configure were stuff goes here
    paths: {
		lib: './src/lib',
		ui: './src/lib/components/ui',
		hook: './src/lib/hooks',
		action: './src/lib/actions',
		util: './src/lib/utils'
	},
	languages: [svelte()],
});