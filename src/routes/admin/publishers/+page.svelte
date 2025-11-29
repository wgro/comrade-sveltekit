<script lang="ts">
	import DataTable from '$components/DataTable.svelte';

	interface Publisher {
		id: string;
		name: string;
		slug: string;
		type: string;
		baseUrl: string;
		language: string;
		active: boolean;
	}

	const publishers: Publisher[] = [
		{
			id: '1',
			name: 'Radio Free Europe/Radio Liberty - Central Newsroom',
			slug: 'rferl-en',
			type: 'primary',
			baseUrl: 'https://www.rferl.org',
			language: 'English',
			active: true
		},
		{
			id: '2',
			name: 'Radio Free Europe/Radio Liberty - Ukrainian Service',
			slug: 'rferl-uk',
			type: 'primary',
			baseUrl: 'https://www.radiosvoboda.org',
			language: 'Ukrainian',
			active: true
		},
		{
			id: '3',
			name: 'Radio Free Europe/Radio Liberty - Russian Service',
			slug: 'rferl-ru',
			type: 'primary',
			baseUrl: 'https://www.svoboda.org',
			language: 'Russian',
			active: true
		}
	];

	const columns = [
		{ key: 'name', label: 'Name' },
		{ key: 'slug', label: 'Slug' },
		{ key: 'type', label: 'Type' },
		{ key: 'language', label: 'Language' },
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
		<DataTable {columns} data={publishers} emptyMessage="No publishers found" />
	</div>
</div>
