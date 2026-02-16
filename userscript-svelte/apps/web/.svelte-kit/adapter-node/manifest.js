export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["icons/parallels.ico","reportus-parser-icons/100492918-868e3000-3142-11eb-9ee6-44826cd637c7.png","reportus-parser-icons/1089503.png","reportus-parser-icons/118004041-c728e100-b351-11eb-9018-516a78e18a28.png","reportus-parser-icons/1200px-OOjs_UI_icon_alert-warning.svg.png","reportus-parser-icons/121571351-9230ac80-ca2b-11eb-91e7-bd75ea4f6ae4.png","reportus-parser-icons/121824353-5ceabf80-ccb4-11eb-9120-b5cbd15e31e9.png","reportus-parser-icons/1443588.png","reportus-parser-icons/1451546.png","reportus-parser-icons/1503641514_parallels.png","reportus-parser-icons/179879.png","reportus-parser-icons/1828520.png","reportus-parser-icons/1930805.png","reportus-parser-icons/1978024.png","reportus-parser-icons/2183366.png","reportus-parser-icons/2238506.png","reportus-parser-icons/2293934.png","reportus-parser-icons/2313811.png","reportus-parser-icons/2333550.png","reportus-parser-icons/2335410.png","reportus-parser-icons/2499379.png","reportus-parser-icons/2606574.png","reportus-parser-icons/2756717-200.png","reportus-parser-icons/2817912.png","reportus-parser-icons/2966844.png","reportus-parser-icons/3125811.png","reportus-parser-icons/3126554.png","reportus-parser-icons/3273973.png","reportus-parser-icons/3512155.png","reportus-parser-icons/3634746.png","reportus-parser-icons/3637372.png","reportus-parser-icons/3653500.png","reportus-parser-icons/3796075.png","reportus-parser-icons/4528584.png","reportus-parser-icons/4562583.png","reportus-parser-icons/4643333.png","reportus-parser-icons/5123714.png","reportus-parser-icons/5201125.png","reportus-parser-icons/5693296.png","reportus-parser-icons/595-5952790_download-svg-download-png-shield-icon-png.png","reportus-parser-icons/6504020.png","reportus-parser-icons/71d177d628bca6aff2813176cba0c18f.png","reportus-parser-icons/859521.png","reportus-parser-icons/96313515-5cf7ca00-1016-11eb-87d7-4eb1784e6eab.png","reportus-parser-icons/96314275-97616700-1016-11eb-9990-8b2e92d49052.png","reportus-parser-icons/972564.png","reportus-parser-icons/983874.png","reportus-parser-icons/Applications-Folder-Blue-icon.png","reportus-parser-icons/CCID.png","reportus-parser-icons/External-Drive-Red-icon.png","reportus-parser-icons/OS_Apple.webp","reportus-parser-icons/bad.png","reportus-parser-icons/coherence.png","reportus-parser-icons/data-funnel-icon-5.jpg","reportus-parser-icons/ethernet.png","reportus-parser-icons/gpu2.png","reportus-parser-icons/hdd.png","reportus-parser-icons/input.png","reportus-parser-icons/legacyBios.png","reportus-parser-icons/lowStorage.png","reportus-parser-icons/macvm.png","reportus-parser-icons/networkAdapter.png","reportus-parser-icons/printer.png","reportus-parser-icons/pvm.png","reportus-parser-icons/security_denied.png","reportus-parser-icons/snapshot.png","reportus-parser-icons/unnamed.png","reportus-parser-icons/usb.png","reportus-parser-icons/warning.png"]),
	mimeTypes: {".png":"image/png",".webp":"image/webp",".jpg":"image/jpeg"},
	_: {
		client: {start:"_app/immutable/entry/start.BR63KH0d.js",app:"_app/immutable/entry/app.DDxcA6sV.js",imports:["_app/immutable/entry/start.BR63KH0d.js","_app/immutable/chunks/r_RXrI8_.js","_app/immutable/chunks/CE0v8GQi.js","_app/immutable/chunks/BUApaBEI.js","_app/immutable/chunks/DXifBooD.js","_app/immutable/entry/app.DDxcA6sV.js","_app/immutable/chunks/CE0v8GQi.js","_app/immutable/chunks/C386bdmT.js","_app/immutable/chunks/CW5_oAvW.js","_app/immutable/chunks/DitqRtVT.js","_app/immutable/chunks/DXifBooD.js","_app/immutable/chunks/C5DkBA5D.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js')),
			__memo(() => import('./nodes/5.js')),
			__memo(() => import('./nodes/6.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/api/reports/[id]",
				pattern: /^\/api\/reports\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/reports/_id_/_server.ts.js'))
			},
			{
				id: "/api/reports/[id]/files-raw/[...filePath]",
				pattern: /^\/api\/reports\/([^/]+?)\/files-raw(?:\/([^]*))?\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false},{"name":"filePath","optional":false,"rest":true,"chained":true}],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/reports/_id_/files-raw/_...filePath_/_server.ts.js'))
			},
			{
				id: "/api/reports/[id]/files/[...filePath]",
				pattern: /^\/api\/reports\/([^/]+?)\/files(?:\/([^]*))?\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false},{"name":"filePath","optional":false,"rest":true,"chained":true}],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/reports/_id_/files/_...filePath_/_server.ts.js'))
			},
			{
				id: "/api/reports/[id]/mental-model",
				pattern: /^\/api\/reports\/([^/]+?)\/mental-model\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/reports/_id_/mental-model/_server.ts.js'))
			},
			{
				id: "/api/reports/[id]/model",
				pattern: /^\/api\/reports\/([^/]+?)\/model\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/reports/_id_/model/_server.ts.js'))
			},
			{
				id: "/api/reports/[id]/nodes/[nodeKey]",
				pattern: /^\/api\/reports\/([^/]+?)\/nodes\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false},{"name":"nodeKey","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/reports/_id_/nodes/_nodeKey_/_server.ts.js'))
			},
			{
				id: "/api/reports/[id]/raw/node/[nodeKey]",
				pattern: /^\/api\/reports\/([^/]+?)\/raw\/node\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false},{"name":"nodeKey","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/reports/_id_/raw/node/_nodeKey_/_server.ts.js'))
			},
			{
				id: "/lab/icons",
				pattern: /^\/lab\/icons\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/lab/[reportId=reportId]",
				pattern: /^\/lab\/([^/]+?)\/?$/,
				params: [{"name":"reportId","matcher":"reportId","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/nodes/[reportId=reportId]",
				pattern: /^\/nodes\/([^/]+?)\/?$/,
				params: [{"name":"reportId","matcher":"reportId","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 6 },
				endpoint: null
			},
			{
				id: "/[reportId=reportId]",
				pattern: /^\/([^/]+?)\/?$/,
				params: [{"name":"reportId","matcher":"reportId","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			const { match: reportId } = await import ('./entries/matchers/reportId.js')
			return { reportId };
		},
		server_assets: {}
	}
}
})();

export const prerendered = new Set([]);

export const base = "";