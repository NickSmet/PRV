import type { SvelteComponent } from 'svelte';
import {
	AlertTriangle,
	Bluetooth,
	Clipboard,
	Clock,
	Cloud,
	Cpu,
	Disc,
	FileText,
	FolderOpen,
	HardDrive,
	Keyboard,
	Monitor,
	Mouse,
	Network,
	Plane,
	Printer,
	Settings,
	Shield,
	Usb,
	Webcam
} from '@lucide/svelte';

export type IconComponent = new (...args: any[]) => SvelteComponent;

export function iconComponentForKey(iconKey: string | undefined): IconComponent | null {
	switch (iconKey) {
		case 'hdd':
			return HardDrive;
		case 'bridged':
		case 'shared':
		case 'net':
			return Network;
		case 'travel':
			return Plane;
		case 'gpu':
		case 'vm':
		case 'monitor':
			return Monitor;
		case 'warn':
			return AlertTriangle;
		case 'keyboard':
			return Keyboard;
		case 'mouse':
			return Mouse;
		case 'cd':
		case 'disc':
			return Disc;
		case 'camera':
			return Webcam;
		case 'bluetooth':
			return Bluetooth;
		case 'usb':
			return Usb;
		case 'printer':
			return Printer;
		case 'cloud':
			return Cloud;
		case 'folder':
			return FolderOpen;
		case 'clipboard':
			return Clipboard;
		case 'clock':
			return Clock;
		case 'shield':
			return Shield;
		case 'cpu':
			return Cpu;
		case 'settings':
			return Settings;
		case 'file':
			return FileText;
		default:
			return null;
	}
}
