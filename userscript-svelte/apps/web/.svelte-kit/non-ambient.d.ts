
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
		RouteId(): "/" | "/api" | "/api/reports" | "/api/reports/[id]" | "/api/reports/[id]/files-raw" | "/api/reports/[id]/files-raw/[...filePath]" | "/api/reports/[id]/files" | "/api/reports/[id]/files/[...filePath]" | "/api/reports/[id]/mental-model" | "/api/reports/[id]/model" | "/api/reports/[id]/nodes" | "/api/reports/[id]/nodes/[nodeKey]" | "/api/reports/[id]/raw" | "/api/reports/[id]/raw/node" | "/api/reports/[id]/raw/node/[nodeKey]" | "/lab" | "/lab/icons" | "/lab/[reportId=reportId]" | "/nodes" | "/nodes/[reportId=reportId]" | "/[reportId=reportId]";
		RouteParams(): {
			"/api/reports/[id]": { id: string };
			"/api/reports/[id]/files-raw": { id: string };
			"/api/reports/[id]/files-raw/[...filePath]": { id: string; filePath: string };
			"/api/reports/[id]/files": { id: string };
			"/api/reports/[id]/files/[...filePath]": { id: string; filePath: string };
			"/api/reports/[id]/mental-model": { id: string };
			"/api/reports/[id]/model": { id: string };
			"/api/reports/[id]/nodes": { id: string };
			"/api/reports/[id]/nodes/[nodeKey]": { id: string; nodeKey: string };
			"/api/reports/[id]/raw": { id: string };
			"/api/reports/[id]/raw/node": { id: string };
			"/api/reports/[id]/raw/node/[nodeKey]": { id: string; nodeKey: string };
			"/lab/[reportId=reportId]": { reportId: string };
			"/nodes/[reportId=reportId]": { reportId: string };
			"/[reportId=reportId]": { reportId: string }
		};
		LayoutParams(): {
			"/": { id?: string; filePath?: string; nodeKey?: string; reportId?: string };
			"/api": { id?: string; filePath?: string; nodeKey?: string };
			"/api/reports": { id?: string; filePath?: string; nodeKey?: string };
			"/api/reports/[id]": { id: string; filePath?: string; nodeKey?: string };
			"/api/reports/[id]/files-raw": { id: string; filePath?: string };
			"/api/reports/[id]/files-raw/[...filePath]": { id: string; filePath: string };
			"/api/reports/[id]/files": { id: string; filePath?: string };
			"/api/reports/[id]/files/[...filePath]": { id: string; filePath: string };
			"/api/reports/[id]/mental-model": { id: string };
			"/api/reports/[id]/model": { id: string };
			"/api/reports/[id]/nodes": { id: string; nodeKey?: string };
			"/api/reports/[id]/nodes/[nodeKey]": { id: string; nodeKey: string };
			"/api/reports/[id]/raw": { id: string; nodeKey?: string };
			"/api/reports/[id]/raw/node": { id: string; nodeKey?: string };
			"/api/reports/[id]/raw/node/[nodeKey]": { id: string; nodeKey: string };
			"/lab": { reportId?: string };
			"/lab/icons": Record<string, never>;
			"/lab/[reportId=reportId]": { reportId: string };
			"/nodes": { reportId?: string };
			"/nodes/[reportId=reportId]": { reportId: string };
			"/[reportId=reportId]": { reportId: string }
		};
		Pathname(): "/" | `/api/reports/${string}` & {} | `/api/reports/${string}/files-raw/${string}` & {} | `/api/reports/${string}/files/${string}` & {} | `/api/reports/${string}/mental-model` & {} | `/api/reports/${string}/model` & {} | `/api/reports/${string}/nodes/${string}` & {} | `/api/reports/${string}/raw/node/${string}` & {} | "/lab/icons" | `/lab/${string}` & {} | `/nodes/${string}` & {} | `/${string}` & {};
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/icons/parallels.ico" | "/reportus-parser-icons/100492918-868e3000-3142-11eb-9ee6-44826cd637c7.png" | "/reportus-parser-icons/1089503.png" | "/reportus-parser-icons/118004041-c728e100-b351-11eb-9018-516a78e18a28.png" | "/reportus-parser-icons/1200px-OOjs_UI_icon_alert-warning.svg.png" | "/reportus-parser-icons/121571351-9230ac80-ca2b-11eb-91e7-bd75ea4f6ae4.png" | "/reportus-parser-icons/121824353-5ceabf80-ccb4-11eb-9120-b5cbd15e31e9.png" | "/reportus-parser-icons/1443588.png" | "/reportus-parser-icons/1451546.png" | "/reportus-parser-icons/1503641514_parallels.png" | "/reportus-parser-icons/179879.png" | "/reportus-parser-icons/1828520.png" | "/reportus-parser-icons/1930805.png" | "/reportus-parser-icons/1978024.png" | "/reportus-parser-icons/2183366.png" | "/reportus-parser-icons/2238506.png" | "/reportus-parser-icons/2293934.png" | "/reportus-parser-icons/2313811.png" | "/reportus-parser-icons/2333550.png" | "/reportus-parser-icons/2335410.png" | "/reportus-parser-icons/2499379.png" | "/reportus-parser-icons/2606574.png" | "/reportus-parser-icons/2756717-200.png" | "/reportus-parser-icons/2817912.png" | "/reportus-parser-icons/2966844.png" | "/reportus-parser-icons/3125811.png" | "/reportus-parser-icons/3126554.png" | "/reportus-parser-icons/3273973.png" | "/reportus-parser-icons/3512155.png" | "/reportus-parser-icons/3634746.png" | "/reportus-parser-icons/3637372.png" | "/reportus-parser-icons/3653500.png" | "/reportus-parser-icons/3796075.png" | "/reportus-parser-icons/4528584.png" | "/reportus-parser-icons/4562583.png" | "/reportus-parser-icons/4643333.png" | "/reportus-parser-icons/5123714.png" | "/reportus-parser-icons/5201125.png" | "/reportus-parser-icons/5693296.png" | "/reportus-parser-icons/595-5952790_download-svg-download-png-shield-icon-png.png" | "/reportus-parser-icons/6504020.png" | "/reportus-parser-icons/71d177d628bca6aff2813176cba0c18f.png" | "/reportus-parser-icons/859521.png" | "/reportus-parser-icons/96313515-5cf7ca00-1016-11eb-87d7-4eb1784e6eab.png" | "/reportus-parser-icons/96314275-97616700-1016-11eb-9990-8b2e92d49052.png" | "/reportus-parser-icons/972564.png" | "/reportus-parser-icons/983874.png" | "/reportus-parser-icons/Applications-Folder-Blue-icon.png" | "/reportus-parser-icons/CCID.png" | "/reportus-parser-icons/External-Drive-Red-icon.png" | "/reportus-parser-icons/OS_Apple.webp" | "/reportus-parser-icons/bad.png" | "/reportus-parser-icons/coherence.png" | "/reportus-parser-icons/data-funnel-icon-5.jpg" | "/reportus-parser-icons/ethernet.png" | "/reportus-parser-icons/gpu2.png" | "/reportus-parser-icons/hdd.png" | "/reportus-parser-icons/input.png" | "/reportus-parser-icons/legacyBios.png" | "/reportus-parser-icons/lowStorage.png" | "/reportus-parser-icons/macvm.png" | "/reportus-parser-icons/networkAdapter.png" | "/reportus-parser-icons/printer.png" | "/reportus-parser-icons/pvm.png" | "/reportus-parser-icons/security_denied.png" | "/reportus-parser-icons/snapshot.png" | "/reportus-parser-icons/unnamed.png" | "/reportus-parser-icons/usb.png" | "/reportus-parser-icons/warning.png" | string & {};
	}
}