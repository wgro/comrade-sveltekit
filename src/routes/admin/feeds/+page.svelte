<script lang="ts">
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

<div class="admin-page">
	<header class="admin-page__header">
		<h1 class="admin-page__title">Feeds</h1>
		<p class="admin-page__subtitle">Manage RSS feeds and data sources</p>
	</header>

	<div class="admin-page__content">
		{#await getFeeds()}
			<p>Loading...</p>
		{:then feeds}
			<DataTable {columns} data={feeds} emptyMessage="No feeds found" />
		{:catch}
			<p>Error loading feeds</p>
		{/await}
	</div>
</div>
