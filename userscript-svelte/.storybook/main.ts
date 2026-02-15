import type { StorybookConfig } from '@storybook/svelte-vite';
import path from 'path';

const config: StorybookConfig = {
	stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|svelte|mdx)'],
	addons: ['@storybook/addon-essentials'],
	framework: {
		name: '@storybook/svelte-vite',
		options: {}
	},
	viteFinal: async (viteConfig) => {
		// Storybook loads `.storybook/main.ts` in a restricted CJS context; import ESM-only
		// modules (like `@tailwindcss/vite`) via dynamic import.
		const { default: tailwindcss } = await import('@tailwindcss/vite');

		// Storybook (Svelte + Vite) will merge in the project's Vite config by default.
		// This project uses `vite-plugin-monkey` for userscript builds; its CSS pipeline
		// can conflict with Storybook's own virtual assets (`\0/sb-common-assets/...`).
		// Filter out monkey plugins for Storybook.
		const flattenedPlugins: NonNullable<typeof viteConfig.plugins>[number][] = [];
		const pushPlugin = (plugin: unknown) => {
			if (!plugin) return;
			if (Array.isArray(plugin)) {
				for (const item of plugin) pushPlugin(item);
				return;
			}
			flattenedPlugins.push(plugin as NonNullable<typeof viteConfig.plugins>[number]);
		};
		pushPlugin(viteConfig.plugins);
		viteConfig.plugins = flattenedPlugins.filter((plugin) => {
			const name = typeof plugin === 'object' && plugin && 'name' in plugin ? String(plugin.name) : '';
			return !name.includes('monkey');
		});

		viteConfig.plugins = [...viteConfig.plugins, tailwindcss()];
		// Work around Svelte 5 HMR runtime crashes inside Storybook (e.g. `Object.getOwnPropertyDescriptors`
		// on `undefined` from HMR-wrapped component functions). Full reloads are fine for our use-case.
		viteConfig.server = { ...(viteConfig.server ?? {}), hmr: false };
		viteConfig.resolve = viteConfig.resolve ?? {};
		viteConfig.resolve.conditions = ['browser', 'default'];
		viteConfig.resolve.alias = {
			...(viteConfig.resolve.alias ?? {}),
			$lib: path.resolve(process.cwd(), 'src/lib'),
			$ui: path.resolve(process.cwd(), 'src/ui')
		};
		return viteConfig;
	}
};

export default config;
