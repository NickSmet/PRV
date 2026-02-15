import type { Meta, StoryObj } from '@storybook/svelte';

import UnixPermissions from './unix-permissions.svelte';
import UnixPermissionsGallery from './unix-permissions-gallery.svelte';

const meta = {
	title: 'UI/UnixPermissions',
	component: UnixPermissions,
	args: { permissions: '-rw-r--r--' }
} satisfies Meta<typeof UnixPermissions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithSuffix: Story = {
	args: { permissions: '-rw-------@' }
};

export const Gallery: Story = {
	render: () => ({ Component: UnixPermissionsGallery })
};

