<script lang="ts">
	import UnixPermissions from './unix-permissions.svelte';

	const examples = [
		{ permissions: '-rw-r--r--', description: 'Regular file, owner read/write' },
		{ permissions: '-rwxr-xr-x', description: 'Executable by all' },
		{ permissions: '-rw-------', description: 'Private file, owner only' },
		{ permissions: 'drwxr-xr-x', description: 'Directory, typical' },
		{ permissions: '-rwxrwxrwx', description: 'World writable (dangerous!)' },
		{ permissions: '-r--------', description: 'Read-only, owner only' },
		{ permissions: '-rw-------@', description: 'Extended attributes (`@`) suffix' }
	];
</script>

<div class="p-6 font-sans">
	<div class="space-y-4">
		{#each examples as example (example.permissions)}
			<div class="flex items-center gap-4">
				<UnixPermissions permissions={example.permissions} />
				<span class="text-sm text-slate-600">{example.description}</span>
			</div>
		{/each}
	</div>
</div>

