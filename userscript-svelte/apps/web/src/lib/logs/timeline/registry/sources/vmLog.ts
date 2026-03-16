import { classifyWindowsTimelineApp } from '../../classifyWindowsTimelineApp';
import {
	APP_MICROSOFT_CATEGORY,
	APP_SYSTEM_CATEGORY,
	APP_THIRD_PARTY_CATEGORY
} from '../../appCategories';
import type { SourceRuleRegistry } from '../runtime';
import {
	createRowEvent,
	type RowRule
} from '../runtime';
import {
	DEVICES_CATEGORY,
	ERRORS_CATEGORY,
	HOST_ISSUES_CATEGORY,
	NETWORK_CATEGORY,
	TOOLS_CATEGORY,
	VM_LIFECYCLE_CATEGORY
} from '../categories';

const REGULAR_WINDOWS_APPS_RE =
	/(\\TextInputHost\.exe|mstsc.exe|HxOutlook.exe|AcrobatNotification|Cortana.exe|Adobe Desktop Service\.exe|Microsoft\.AAD\.BrokerPlugin\.exe|FirstLogonAnim\.exe|rundll32\.exe|SearchApp\.exe|msedge\.exe|svchost\.exe|Dwm\.exe|explorer\.exe|consent\.exe|wwahost|Microsoft\.Photos\.exe|SkypeApp|StartMenuExperienceHost|SystemSettings|LogonUI|ShellExperienceHost|WindowsInternal|taskhostw|SearchUI|WinStore|GameBar|CredentialUIBroker|LockApp|Explorer\.EXE|YourPhone|dwm\.exe)/;

function regexRowRule(opts: {
	ruleId: string;
	pattern: RegExp;
	category: string;
	label: string | ((match: RegExpExecArray) => string);
	severity?: 'info' | 'warn' | 'danger';
	cooldownMs?: number;
	dedupeKey?: string;
	detail?: (match: RegExpExecArray, text: string) => string;
}): RowRule {
	return {
		kind: 'row',
		ruleId: opts.ruleId,
		match: (ctx) => {
			if (!ctx.at) return false;
			return opts.pattern.exec(ctx.text);
		},
		cooldownMs: opts.cooldownMs,
		dedupeKey: () => opts.dedupeKey ?? opts.ruleId,
		buildEvents: (ctx, match) =>
			createRowEvent({
				ruleId: opts.ruleId,
				row: ctx.row,
				category: opts.category,
				severity: opts.severity ?? 'info',
				label: typeof opts.label === 'function' ? opts.label(match as RegExpExecArray) : opts.label,
				detail: opts.detail?.(match as RegExpExecArray, ctx.text) ?? ctx.text
			})
	};
}

export const vmLogRegistry: SourceRuleRegistry = {
	sourceFile: 'vm.log',
	rules: [
		regexRowRule({
			ruleId: 'vm.report_collection_started',
			pattern: /VM state\(VmStateProblemReport\)\: started/i,
			category: VM_LIFECYCLE_CATEGORY,
			label: 'Collecting report'
		}),
		regexRowRule({
			ruleId: 'vm.start',
			pattern: /VM state\(VmStateInitFinish\): changed to VmStateRunning/i,
			category: VM_LIFECYCLE_CATEGORY,
			label: 'start'
		}),
		regexRowRule({
			ruleId: 'vm.shutdown',
			pattern: /SHUTDOWN: type 0x21/i,
			category: VM_LIFECYCLE_CATEGORY,
			label: 'shutdown'
		}),
		regexRowRule({
			ruleId: 'vm.suspend',
			pattern: /VM state\(VmStateSuspending\): changed to VmStateStopped/i,
			category: VM_LIFECYCLE_CATEGORY,
			label: 'Suspended'
		}),
		regexRowRule({
			ruleId: 'vm.resume',
			pattern: /VM state\(VmStateInitFinish\): changed to VmStateResuming/i,
			category: VM_LIFECYCLE_CATEGORY,
			label: 'Resume'
		}),
		regexRowRule({
			ruleId: 'vm.reset',
			pattern: /("VM state\(VmStateStopped\): changed to VmStateInit"|System reset via stop\-start)/i,
			category: VM_LIFECYCLE_CATEGORY,
			label: 'reset'
		}),
		regexRowRule({
			ruleId: 'vm.pause',
			pattern: /VM state\(VmStateRunning\): enqueued 'VmLocalCmdPause'/i,
			category: VM_LIFECYCLE_CATEGORY,
			label: 'pause'
		}),
		regexRowRule({
			ruleId: 'vm.unpause',
			pattern: /VM state\((VmStatePaused|f)\): enqueued 'VmLocalCmdStart'/i,
			category: VM_LIFECYCLE_CATEGORY,
			label: 'unpause'
		}),
		regexRowRule({
			ruleId: 'vm.hardware_reset',
			pattern: /VM state\(VmStateRunning\): enqueued 'VmLocalCmdHardwareReset'\(20007\) command/i,
			category: VM_LIFECYCLE_CATEGORY,
			label: 'reset(WIN)',
			detail: (_match, text) =>
				`VM reset initiated by guest OS (e.g., via Windows GUI).\n${text}`
		}),
		regexRowRule({
			ruleId: 'vm.guest_hibernate',
			pattern: /SHUTDOWN: type 0x74/i,
			category: VM_LIFECYCLE_CATEGORY,
			label: 'hibern(WIN)'
		}),
		regexRowRule({
			ruleId: 'vm.snapshot_create',
			pattern: /VM state\(VmStateRunning\): enqueued 'DspCmdVmCreateSnapshot'/i,
			category: VM_LIFECYCLE_CATEGORY,
			label: 'Creating Snapshot'
		}),
		regexRowRule({
			ruleId: 'vm.video_crash',
			pattern: /Caught Abort trap\(.+\) in video device thread/i,
			category: ERRORS_CATEGORY,
			label: 'video crash',
			severity: 'danger'
		}),
		regexRowRule({
			ruleId: 'vm.guest_display_info_error',
			pattern: /Error retrieve information about guest displays/i,
			category: DEVICES_CATEGORY,
			label: "PDFM-111627'ish",
			severity: 'danger'
		}),
		regexRowRule({
			ruleId: 'vm.io_cnt_not_zero',
			pattern: /while io_cnt is not zero\!/i,
			category: DEVICES_CATEGORY,
			label: 'PDFM-96373(ish)',
			severity: 'warn'
		}),
		regexRowRule({
			ruleId: 'vm.disk_incorrectly_closed',
			pattern: /OpenDisk\(\) returned error PRL_ERR_DISK_INCORRECTLY_CLOSED/i,
			category: ERRORS_CATEGORY,
			label: 'INCORRECTLY_CLOSED',
			severity: 'danger'
		}),
		regexRowRule({
			ruleId: 'vm.host_hdd_error',
			pattern: /(Error writing\/reading HDD sectors|DIO ERROR)/i,
			category: HOST_ISSUES_CATEGORY,
			label: 'Host HDD issues',
			severity: 'danger'
		}),
		regexRowRule({
			ruleId: 'vm.bind_mode_netif_failed',
			pattern: /Failed to setup bind-mode virtual netif/i,
			category: NETWORK_CATEGORY,
			label: 'PDFM-98595',
			severity: 'warn'
		}),
		regexRowRule({
			ruleId: 'vm.kexts_not_loaded',
			pattern: /USB Connect Service not found\!/i,
			category: ERRORS_CATEGORY,
			label: 'need kext-consent',
			severity: 'danger'
		}),
		regexRowRule({
			ruleId: 'vm.tpm_invalid_signature',
			pattern: /\[Tpm2\] TVNS \- invalid signature/i,
			category: DEVICES_CATEGORY,
			label: 'PDFM-97737',
			severity: 'danger'
		}),
		regexRowRule({
			ruleId: 'vm.tools_outdated',
			pattern: /\[PTIAHOST\] Guest tools started: outdated/i,
			category: TOOLS_CATEGORY,
			label: 'Tools outdated',
			severity: 'info',
			cooldownMs: 200_000
		}),
		regexRowRule({
			ruleId: 'vm.tools_update_started',
			pattern: /\[PTIA_GUEST\] Start installation:/i,
			category: TOOLS_CATEGORY,
			label: 'Updating tools'
		}),
		regexRowRule({
			ruleId: 'vm.tools_update_failed',
			pattern: /\[PTIA_GUEST\] Tools installation failed\./i,
			category: TOOLS_CATEGORY,
			label: 'Tools upd failed',
			severity: 'danger'
		}),
		regexRowRule({
			ruleId: 'vm.pd_version',
			pattern: /Parallels Desktop (\d\d\.\d\.\d)/i,
			category: VM_LIFECYCLE_CATEGORY,
			label: (match) => `PD ${match[1]}`,
			severity: 'info'
		}),
		{
			kind: 'row',
			ruleId: 'vm.crash_separator',
			match: (ctx) => {
				if (!ctx.at) return false;
				if (!/={20,}/.test(ctx.text)) return false;
				return true;
			},
			buildEvents: (ctx) => {
				if (!ctx.prevRow) return null;
				const prevText = ctx.prevRow.message || ctx.prevRow.raw;
				if (
					/Vm will be stopped|BattWatcher|Encryption plugin|Terminating VM Process \.\.\.|VM process exiting with code 0|VM state\(VmStateNone\): enqueued 'VmLocalCmdStart'\(20001\) command/i.test(
						prevText
					)
				) {
					return null;
				}
				return createRowEvent({
					ruleId: 'vm.crash_separator',
					row: ctx.row,
					category: ERRORS_CATEGORY,
					severity: 'danger',
					label: 'crash(host?)',
					detail: ctx.text
				});
			}
		},
		{
			kind: 'stateful',
			ruleId: 'vm.app_sighting',
			create: () => {
				const lastSeenByPath = new Map<string, number>();
				const APP_SIGHTING_DEDUPE_MS = 2000;

				return {
					ruleId: 'vm.app_sighting',
					consumeRow(ctx) {
						if (!ctx.at) return;
						if (REGULAR_WINDOWS_APPS_RE.test(ctx.text)) return;

						const d3d = /\b(?<driver>D3D\d+\.\d+):\s+(?<path>.+)$/.exec(ctx.text);
						const openGl =
							/\b(?<driver>OpenGL\.\d{3}\.\d{3})\.[^\n]*?(?<path>[A-Z]:\\.*?\.exe)\b/i.exec(ctx.text);
						const match = d3d?.groups?.driver && d3d.groups.path ? d3d : openGl;
						if (!match?.groups?.driver || !match.groups.path) return;

						const appPath = match.groups.path.trim();
						const exePathMatch = /(?<exePath>.*?\.exe)\b/i.exec(appPath);
						const exePath = (exePathMatch?.groups?.exePath ?? appPath).trim();
						const exeMatch = exePath.match(/([^\\\/]+\.exe)\b/i);
						const exe = exeMatch?.[1] ?? null;
						if (!exe) return;

						const category = classifyWindowsTimelineApp(appPath);
						if (
							category !== APP_SYSTEM_CATEGORY &&
							category !== APP_MICROSOFT_CATEGORY &&
							category !== APP_THIRD_PARTY_CATEGORY
						) {
							return;
						}

						const dedupeKey = `${category}|${exePath.toLowerCase()}`;
						const seenAtMs = lastSeenByPath.get(dedupeKey);
						if (seenAtMs != null && ctx.at.getTime() - seenAtMs <= APP_SIGHTING_DEDUPE_MS) {
							return;
						}
						lastSeenByPath.set(dedupeKey, ctx.at.getTime());

						const driver = match.groups.driver;
						const severity = driver.includes('210.330') ? 'warn' : 'info';
						const detail = severity === 'warn' ? `${exePath}\nKnown problematic GPU profile: ${driver}` : exePath;

						ctx.emit(
							createRowEvent({
								ruleId: 'vm.app_sighting',
								row: ctx.row,
								category,
								severity,
								label: `${exe} (${driver})`,
								detail,
								idSuffix: exePath.toLowerCase().replace(/[^a-z0-9]+/g, '-')
							})
						);
					}
				};
			}
		}
	]
};
