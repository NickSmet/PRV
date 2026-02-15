const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([]),
	mimeTypes: {},
	_: {
		client: {start:"_app/immutable/entry/start.BtmOS9vy.js",app:"_app/immutable/entry/app.LYnAXmjI.js",imports:["_app/immutable/entry/start.BtmOS9vy.js","_app/immutable/chunks/pDUiNlPC.js","_app/immutable/chunks/DtKEd5CY.js","_app/immutable/chunks/CsBEXXNy.js","_app/immutable/entry/app.LYnAXmjI.js","_app/immutable/chunks/DtKEd5CY.js","_app/immutable/chunks/C4pO_Vz6.js","_app/immutable/chunks/CWO55960.js","_app/immutable/chunks/CsBEXXNy.js","_app/immutable/chunks/BIN3lAd4.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./chunks/0-fzJMpkCl.js')),
			__memo(() => import('./chunks/1-BY4lMoyK.js')),
			__memo(() => import('./chunks/2-PwbATH87.js'))
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
				endpoint: __memo(() => import('./chunks/_server.ts-BScNzVQW.js'))
			},
			{
				id: "/api/reports/[id]/files/[...filePath]",
				pattern: /^\/api\/reports\/([^/]+?)\/files(?:\/([^]*))?\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false},{"name":"filePath","optional":false,"rest":true,"chained":true}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-C1sj3HYI.js'))
			},
			{
				id: "/api/reports/[id]/model",
				pattern: /^\/api\/reports\/([^/]+?)\/model\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-DEFQFYod.js'))
			},
			{
				id: "/api/reports/[id]/nodes/[nodeKey]",
				pattern: /^\/api\/reports\/([^/]+?)\/nodes\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false},{"name":"nodeKey","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-BB29df24.js'))
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();

const prerendered = new Set([]);

const base = "";

export { base, manifest, prerendered };
//# sourceMappingURL=manifest.js.map
