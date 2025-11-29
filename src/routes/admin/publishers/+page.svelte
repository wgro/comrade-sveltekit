<script lang="ts">
	import AdminPage from '$components/AdminPage.svelte';
	import DataTable from '$components/DataTable.svelte';
	import { getPublishers } from '$lib/api/publishers.remote';

	const columns = [
		{ key: 'name', label: 'Name' },
		{ key: 'slug', label: 'Slug' },
		{ key: 'type', label: 'Type' },
		{
			key: 'language',
			label: 'Language',
			render: (_: unknown, row: { language?: { name: string } }) => row.language?.name ?? ''
		},
		{
			key: 'active',
			label: 'Status',
			render: (value: unknown) => (value ? 'Active' : 'Inactive')
		}
	];
</script>

<AdminPage title="Publishers" subtitle="Manage news publishers and organizations">
	{#await getPublishers()}
		<p>Loading...</p>
	{:then publishers}
		<DataTable {columns} data={publishers} emptyMessage="No publishers found" />
	{:catch}
		<p>Error loading publishers</p>
	{/await}
</AdminPage>
