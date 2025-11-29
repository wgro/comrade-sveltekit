<script lang="ts">
	import DataTable from '$components/DataTable.svelte';

	interface Story {
		id: string;
		title: string;
		publisher: string;
		status: string;
		language: string;
		publishedAt: string;
	}

	const stories: Story[] = [
		{
			id: '1',
			title: 'Ukraine Receives New Military Aid Package',
			publisher: 'RFE/RL - Ukrainian Service',
			status: 'fetched',
			language: 'Ukrainian',
			publishedAt: '2024-01-15 09:00'
		},
		{
			id: '2',
			title: 'Russian Opposition Leader Speaks Out',
			publisher: 'RFE/RL - Russian Service',
			status: 'pending',
			language: 'Russian',
			publishedAt: '2024-01-15 08:30'
		},
		{
			id: '3',
			title: 'Central Asia Economic Summit Concludes',
			publisher: 'RFE/RL - Central Newsroom',
			status: 'fetched',
			language: 'English',
			publishedAt: '2024-01-15 07:45'
		},
		{
			id: '4',
			title: 'Belarus Border Tensions Rise',
			publisher: 'RFE/RL - Central Newsroom',
			status: 'failed',
			language: 'English',
			publishedAt: '2024-01-14 22:15'
		}
	];

	const columns = [
		{ key: 'title', label: 'Title' },
		{ key: 'publisher', label: 'Publisher' },
		{ key: 'language', label: 'Language' },
		{
			key: 'status',
			label: 'Status',
			render: (value: unknown) => {
				const status = value as string;
				return status.charAt(0).toUpperCase() + status.slice(1);
			}
		},
		{ key: 'publishedAt', label: 'Published' }
	];
</script>

<div class="admin-page">
	<header class="admin-page__header">
		<h1 class="admin-page__title">Stories</h1>
		<p class="admin-page__subtitle">View and manage news stories and articles</p>
	</header>

	<div class="admin-page__content">
		<DataTable {columns} data={stories} emptyMessage="No stories found" />
	</div>
</div>
