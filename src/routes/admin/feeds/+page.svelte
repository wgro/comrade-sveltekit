<script lang="ts">
	import AdminPage from '$components/AdminPage.svelte';
	import DataTable from '$components/DataTable.svelte';
	import { getFeeds } from '$lib/api/feeds.remote';

	const columns = [
		{ key: 'name', label: 'Name' },
		{
			key: 'publisher',
			label: 'Publisher',
			render: (_: unknown, row: { publisher?: { name: string } }) => row.publisher?.name ?? ''
		},
		{ key: 'url', label: 'URL' },
		{
			key: 'active',
			label: 'Status',
			render: (value: unknown) => (value ? 'Active' : 'Inactive')
		},
		{
			key: 'lastPolledAt',
			label: 'Last Polled',
			render: (value: unknown) => {
				if (!value) return 'Never';
				const date = new Date(value as string);
				return date.toLocaleString();
			}
		}
	];
</script>

<AdminPage title="Feeds" subtitle="Manage RSS feeds and data sources">
	{#await getFeeds()}
		<p>Loading...</p>
	{:then feeds}
		<DataTable {columns} data={feeds} emptyMessage="No feeds found" />
	{:catch}
		<p>Error loading feeds</p>
	{/await}
</AdminPage>
