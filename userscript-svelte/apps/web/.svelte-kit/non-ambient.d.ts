
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/" | "/api" | "/api/reports" | "/api/reports/[id]" | "/api/reports/[id]/files" | "/api/reports/[id]/files/[...filePath]" | "/api/reports/[id]/model" | "/api/reports/[id]/nodes" | "/api/reports/[id]/nodes/[nodeKey]";
		RouteParams(): {
			"/api/reports/[id]": { id: string };
			"/api/reports/[id]/files": { id: string };
			"/api/reports/[id]/files/[...filePath]": { id: string; filePath: string };
			"/api/reports/[id]/model": { id: string };
			"/api/reports/[id]/nodes": { id: string };
			"/api/reports/[id]/nodes/[nodeKey]": { id: string; nodeKey: string }
		};
		LayoutParams(): {
			"/": { id?: string; filePath?: string; nodeKey?: string };
			"/api": { id?: string; filePath?: string; nodeKey?: string };
			"/api/reports": { id?: string; filePath?: string; nodeKey?: string };
			"/api/reports/[id]": { id: string; filePath?: string; nodeKey?: string };
			"/api/reports/[id]/files": { id: string; filePath?: string };
			"/api/reports/[id]/files/[...filePath]": { id: string; filePath: string };
			"/api/reports/[id]/model": { id: string };
			"/api/reports/[id]/nodes": { id: string; nodeKey?: string };
			"/api/reports/[id]/nodes/[nodeKey]": { id: string; nodeKey: string }
		};
		Pathname(): "/" | `/api/reports/${string}` & {} | `/api/reports/${string}/files/${string}` & {} | `/api/reports/${string}/model` & {} | `/api/reports/${string}/nodes/${string}` & {};
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): string & {};
	}
}