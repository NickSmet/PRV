export type LegacyParityStatus = 'kept' | 'superseded' | 'deferred';

export type LegacyParityEntry = {
	legacyRuleId: string;
	log: string;
	patternFamily: string;
	currentStatus: LegacyParityStatus;
	targetCategory: string;
	ruleType: 'row' | 'stateful' | 'derived';
	notes: string;
};

export const LEGACY_TIMELINE_PARITY_REGISTRY: LegacyParityEntry[] = [
	{
		legacyRuleId: 'Report_collected',
		log: 'vm.log',
		patternFamily: 'synthetic report end marker',
		currentStatus: 'superseded',
		targetCategory: 'VM Lifecycle',
		ruleType: 'derived',
		notes: 'Replaced by the shared report-end marker / initial-window logic instead of a row-backed event.'
	},
	{
		legacyRuleId: 'Started_report_collection',
		log: 'vm.log',
		patternFamily: 'lifecycle',
		currentStatus: 'kept',
		targetCategory: 'VM Lifecycle',
		ruleType: 'row',
		notes: 'Mapped to vm.report_collection_started.'
	},
	{
		legacyRuleId: 'PD_Version',
		log: 'vm.log',
		patternFamily: 'metadata/lifecycle context',
		currentStatus: 'kept',
		targetCategory: 'VM Lifecycle',
		ruleType: 'row',
		notes: 'Emitted as a lightweight contextual event.'
	},
	{
		legacyRuleId: 'start|shutdown|suspend|resume|reset|pause|unpause|hw_reset|guest_hibernate|snapshot',
		log: 'vm.log',
		patternFamily: 'lifecycle',
		currentStatus: 'kept',
		targetCategory: 'VM Lifecycle',
		ruleType: 'row',
		notes: 'Normalized into VM Lifecycle events.'
	},
	{
		legacyRuleId: 'crash|video_crash|closed_incorrectly|kexts_not_loaded',
		log: 'vm.log',
		patternFamily: 'errors',
		currentStatus: 'kept',
		targetCategory: 'Errors',
		ruleType: 'row',
		notes: 'Crash sentinel retains previous-line false-positive suppression.'
	},
	{
		legacyRuleId: "PDFM-111627'ish|PDFM_96373|PDFM_97737",
		log: 'vm.log',
		patternFamily: 'device issues',
		currentStatus: 'kept',
		targetCategory: 'Devices',
		ruleType: 'row',
		notes: 'Mapped into the shared Devices category.'
	},
	{
		legacyRuleId: 'hostHddError',
		log: 'vm.log',
		patternFamily: 'host issues',
		currentStatus: 'kept',
		targetCategory: 'Host Issues',
		ruleType: 'row',
		notes: 'Mapped directly.'
	},
	{
		legacyRuleId: 'PDFM_98595',
		log: 'vm.log',
		patternFamily: 'network issues',
		currentStatus: 'kept',
		targetCategory: 'Network',
		ruleType: 'row',
		notes: 'Mapped directly.'
	},
	{
		legacyRuleId: 'tools_outdated|tools_update|tools_update_failed',
		log: 'vm.log',
		patternFamily: 'tools state',
		currentStatus: 'kept',
		targetCategory: 'Tools',
		ruleType: 'row',
		notes: 'vm.log tools state remains distinct from tools.log install milestones.'
	},
	{
		legacyRuleId: 'app_launched',
		log: 'vm.log',
		patternFamily: 'app sightings',
		currentStatus: 'kept',
		targetCategory: 'Apps:*',
		ruleType: 'stateful',
		notes: 'Now supports D3D and OpenGL, ignore-list filtering, and path-based dedupe.'
	},
	{
		legacyRuleId: 'settings',
		log: 'parallels-system.log',
		patternFamily: 'config diffs',
		currentStatus: 'superseded',
		targetCategory: 'Config Diffs',
		ruleType: 'row',
		notes: 'Kept as per-row config events with a legacy noise skip-list; no old style-only SystemFlags special case.'
	},
	{
		legacyRuleId: 'msg',
		log: 'parallels-system.log',
		patternFamily: 'GUI messages',
		currentStatus: 'superseded',
		targetCategory: 'GUI Messages',
		ruleType: 'stateful',
		notes: 'Old single-row prompt events replaced by show/close lifecycle ranges with attached Message data details.'
	},
	{
		legacyRuleId: 'closed_incorrectly|bad_internet|font_not_found|PDFM_100983|PDFM-102106|PDFM-102112',
		log: 'parallels-system.log',
		patternFamily: 'system errors',
		currentStatus: 'kept',
		targetCategory: 'Errors/Network',
		ruleType: 'row',
		notes: 'KMErrorDomain retains legacy cooldown dedupe.'
	},
	{
		legacyRuleId: 'tools.log timeline rules',
		log: 'tools.log',
		patternFamily: 'install milestones and issues',
		currentStatus: 'superseded',
		targetCategory: 'Tools',
		ruleType: 'stateful',
		notes: 'Modern tools.log extraction kept and normalized under a single Tools category.'
	},
	{
		legacyRuleId: 'system.log BOOT_TIME|SHUTDOWN_TIME',
		log: 'system.log',
		patternFamily: 'legacy deferred scope',
		currentStatus: 'deferred',
		targetCategory: 'VM Lifecycle',
		ruleType: 'row',
		notes: 'Explicitly out of the current shared-workspace scope.'
	}
];
