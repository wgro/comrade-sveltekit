<script lang="ts">
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

<div class="admin-page">
	<header class="admin-page__header">
		<h1 class="admin-page__title">Publishers</h1>
		<p class="admin-page__subtitle">Manage news publishers and organizations</p>
	</header>

	<div class="admin-page__content">
		{#await getPublishers()}
			<p>Loading...</p>
		{:then publishers}
			<DataTable {columns} data={publishers} emptyMessage="No publishers found" />
		{:catch}
			<p>Error loading publishers</p>
		{/await}
	</div>
</div>
