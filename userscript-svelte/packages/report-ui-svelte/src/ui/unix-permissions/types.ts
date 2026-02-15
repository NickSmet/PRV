export type UnixPermissionsTriad = {
	raw: string;
	read: boolean;
	write: boolean;
	execute: boolean;
};

export type UnixPermissionsParsed = {
	raw: string;
	fileType: string;
	owner: UnixPermissionsTriad;
	group: UnixPermissionsTriad;
	others: UnixPermissionsTriad;
	octal: string;
	suffix: string;
};

export type UnixPermissionsProps = {
	/**
	 * Typical `ls -l` permissions string (e.g. `-rw-r--r--`, `drwxr-xr-x`, `-rw-------@`).
	 * Trailing suffixes like `@` are preserved and shown.
	 */
	permissions?: string | null;
	/**
	 * `rich` shows the colored triads inline.
	 * `subtle` shows the raw permissions string inline (tooltip still shows full legend).
	 */
	variant?: 'rich' | 'subtle';
	class?: string;
};
