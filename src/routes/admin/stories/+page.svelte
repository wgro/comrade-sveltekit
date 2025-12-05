<script lang="ts">
	import AdminHeader from '$components/AdminHeader.svelte';
	import Button from '$components/Button.svelte';
	import DataTable from '$components/DataTable.svelte';
	import Modal from '$components/Modal.svelte';
	import { getStories, deleteAllStories } from '$lib/api/stories.remote';
	import PhTrashDuotone from '~icons/ph/trash-duotone';

	let deleteModalOpen = $state(false);

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

	function openDeleteModal(): void {
		deleteModalOpen = true;
	}

	function closeDeleteModal(): void {
		deleteModalOpen = false;
	}
</script>

<AdminHeader title="Stories" subtitle="View and manage news stories and articles">
	{#snippet actions()}
		<Button variant="danger" onclick={openDeleteModal}>
			{#snippet icon()}
				<PhTrashDuotone />
			{/snippet}
			Delete All
		</Button>
	{/snippet}
</AdminHeader>

<Modal open={deleteModalOpen} title="Delete All Stories" onClose={closeDeleteModal}>
	<p>Are you sure you want to delete all stories? This action cannot be undone.</p>
	<form
		class="modal-actions"
		{...deleteAllStories.enhance(async ({ submit }) => {
			await submit();
			closeDeleteModal();
		})}
	>
		<Button type="button" onclick={closeDeleteModal}>Cancel</Button>
		<Button type="submit" variant="danger">Delete All</Button>
	</form>
</Modal>

{#await getStories()}
	<p>Loading...</p>
{:then stories}
	<DataTable {columns} data={stories} emptyMessage="No stories found" />
{:catch}
	<p>Error loading stories</p>
{/await}

<style lang="scss">
	.modal-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
		margin-top: 1.5rem;
	}
</style>
