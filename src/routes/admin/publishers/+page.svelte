<script lang="ts">
	import AdminHeader from '$components/AdminHeader.svelte';
	import { getPublishers } from '$lib/api/publishers.remote';
</script>

<AdminHeader title="Publishers" subtitle="Manage news publishers and organizations" />

{#await getPublishers()}
	<p>Loading...</p>
{:then publishers}
	{#if publishers.length === 0}
		<p class="empty">No publishers found</p>
	{:else}
		<table class="table">
			<thead>
				<tr>
					<th>Name</th>
					<th>Type</th>
					<th>Language</th>
					<th>Status</th>
				</tr>
			</thead>
			<tbody>
				{#each publishers as publisher (publisher.id)}
					<tr>
						<td><a href="/admin/publishers/{publisher.id}">{publisher.name}</a></td>
						<td>{publisher.type}</td>
						<td>{publisher.language?.name ?? ''}</td>
						<td>{publisher.active ? 'Active' : 'Inactive'}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
{:catch}
	<p>Error loading publishers</p>
{/await}

<style>
	.table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.875rem;
	}

	th {
		text-align: left;
		padding: 0.75rem 1rem;
		font-weight: 600;
		color: #495057;
		border-bottom: 2px solid #dee2e6;
		background: #f8f9fa;
	}

	td {
		padding: 0.75rem 1rem;
		border-bottom: 1px solid #e9ecef;
	}

	tr:hover {
		background: #f8f9fa;
	}

	a {
		color: #0066cc;
		text-decoration: none;
	}

	a:hover {
		text-decoration: underline;
	}

	.empty {
		padding: 2rem 1rem;
		text-align: center;
		color: #6c757d;
	}
</style>
