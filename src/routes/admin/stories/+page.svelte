<script lang="ts">
	import DataTable from '$components/DataTable.svelte';
	import { getStories } from '$lib/api/stories.remote';

	const columns = [
		{ key: 'originalTitle', label: 'Title' },
		{
			key: 'feed',
			label: 'Publisher',
			render: (_: unknown, row: { feed?: { publisher?: { name: string } } }) =>
				row.feed?.publisher?.name ?? ''
		},
		{ key: 'originalLanguage', label: 'Language' },
		{
			key: 'status',
			label: 'Status',
			render: (value: unknown) => {
				const status = value as string;
				return status.charAt(0).toUpperCase() + status.slice(1);
			}
		},
		{
			key: 'publishedAt',
			label: 'Published',
			render: (value: unknown) => {
				if (!value) return '-';
				const date = new Date(value as string);
				return date.toLocaleString();
			}
		}
	];
</script>

<div class="admin-page">
	<header class="admin-page__header">
		<h1 class="admin-page__title">Stories</h1>
		<p class="admin-page__subtitle">View and manage news stories and articles</p>
	</header>

	<div class="admin-page__content">
		{#await getStories()}
			<p>Loading...</p>
		{:then stories}
			<DataTable {columns} data={stories} emptyMessage="No stories found" />
		{:catch}
			<p>Error loading stories</p>
		{/await}
	</div>
</div>
