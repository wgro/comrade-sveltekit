<script lang="ts">
	import DataTable from '$components/DataTable.svelte';

	interface Feed {
		id: string;
		name: string;
		url: string;
		publisher: string;
		active: boolean;
		lastPolled: string | null;
	}

	const feeds: Feed[] = [
		{
			id: '1',
			name: 'Central Newsroom',
			url: 'https://www.rferl.org/api/',
			publisher: 'RFE/RL - Central Newsroom',
			active: true,
			lastPolled: '2024-01-15 10:30'
		},
		{
			id: '2',
			name: 'Ukrainian Service',
			url: 'https://www.radiosvoboda.org/api/',
			publisher: 'RFE/RL - Ukrainian Service',
			active: true,
			lastPolled: '2024-01-15 10:25'
		},
		{
			id: '3',
			name: 'Russian Service',
			url: 'https://www.svoboda.org/api/',
			publisher: 'RFE/RL - Russian Service',
			active: true,
			lastPolled: '2024-01-15 10:20'
		}
	];

	const columns = [
		{ key: 'name', label: 'Name' },
		{ key: 'publisher', label: 'Publisher' },
		{ key: 'url', label: 'URL' },
		{
			key: 'active',
			label: 'Status',
			render: (value: unknown) => (value ? 'Active' : 'Inactive')
		},
		{
			key: 'lastPolled',
			label: 'Last Polled',
			render: (value: unknown) => (value as string) || 'Never'
		}
	];
</script>

<div class="admin-page">
	<header class="admin-page__header">
		<h1 class="admin-page__title">Feeds</h1>
		<p class="admin-page__subtitle">Manage RSS feeds and data sources</p>
	</header>

	<div class="admin-page__content">
		<DataTable {columns} data={feeds} emptyMessage="No feeds found" />
	</div>
</div>
