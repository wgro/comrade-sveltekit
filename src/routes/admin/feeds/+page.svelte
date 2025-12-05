<script lang="ts">
	import AdminPage from '$components/AdminPage.svelte';
	import ActionButton from '$components/ActionButton.svelte';
	import Modal from '$components/Modal.svelte';
	import { getFeeds, previewFeed } from '$lib/api/feeds.remote';
	import PhPencilLineDuotone from '~icons/ph/pencil-line-duotone';
	import PhArrowsClockwiseDuotone from '~icons/ph/arrows-clockwise-duotone';
	import PhEyeDuotone from '~icons/ph/eye-duotone';
	import SvgSpinners90RingWithBg from '~icons/svg-spinners/90-ring-with-bg';
	import Highlight from 'svelte-highlight';
	import xml from 'svelte-highlight/languages/xml';
	import github from 'svelte-highlight/styles/github';

	type GetFeedsResult = Awaited<ReturnType<typeof getFeeds>>;
	type Feed = GetFeedsResult[number];

	let previewModalOpen = $state(false);
	let selectedFeed: Feed | null = $state(null);
	let previewContent: string | null = $state(null);
	let previewLoading = $state(false);
	let previewError: string | null = $state(null);

	function handleEdit(feed: Feed): void {
		// TODO: implement edit action
	}

	function handleRequeue(feed: Feed): void {
		// TODO: implement requeue action
	}

	async function handlePreview(feed: Feed): Promise<void> {
		selectedFeed = feed;
		previewModalOpen = true;
		previewLoading = true;
		previewError = null;
		previewContent = null;

		try {
			previewContent = await previewFeed(feed.url);
		} catch (error) {
			previewError = error instanceof Error ? error.message : 'Failed to fetch feed';
		} finally {
			previewLoading = false;
		}
	}

	function closePreviewModal(): void {
		previewModalOpen = false;
		selectedFeed = null;
		previewContent = null;
		previewError = null;
	}
</script>

<svelte:head>
	<style>
{github}
	</style>
</svelte:head>

<AdminPage title="Feeds" subtitle="Manage RSS feeds and data sources">
	{#await getFeeds()}
		<p>Loading...</p>
	{:then feeds}
		<div class="feeds-table">
			<table class="table">
				<thead>
					<tr>
						<th>Name</th>
						<th>Publisher</th>
						<th>URL</th>
						<th>Status</th>
						<th>Last Polled</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{#if feeds.length === 0}
						<tr>
							<td colspan="6" class="empty">No feeds found</td>
						</tr>
					{:else}
						{#each feeds as feed (feed.id)}
							<tr>
								<td>{feed.name}</td>
								<td>{feed.publisher?.name ?? ''}</td>
								<td class="url">{feed.url}</td>
								<td>{feed.active ? 'Active' : 'Inactive'}</td>
								<td>{feed.lastPolledAt ? new Date(feed.lastPolledAt).toLocaleString() : 'Never'}</td
								>
								<td class="actions">
									<ActionButton
										icon={PhPencilLineDuotone}
										title="Edit feed"
										onclick={() => handleEdit(feed)}
									/>
									<ActionButton
										icon={PhArrowsClockwiseDuotone}
										title="Requeue feed"
										onclick={() => handleRequeue(feed)}
									/>
									<ActionButton
										icon={PhEyeDuotone}
										title="Preview feed"
										onclick={() => handlePreview(feed)}
									/>
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	{:catch}
		<p>Error loading feeds</p>
	{/await}
</AdminPage>

<Modal
	open={previewModalOpen}
	title={selectedFeed?.name ?? 'Feed Preview'}
	onClose={closePreviewModal}
>
	{#if previewLoading}
		<div class="preview-loading">
			<SvgSpinners90RingWithBg />
			<span>Loading feed...</span>
		</div>
	{:else if previewError}
		<div class="preview-error">{previewError}</div>
	{:else if previewContent}
		<div class="preview-content">
			<Highlight language={xml} code={previewContent} />
		</div>
	{/if}
</Modal>

<style lang="scss">
	@use '$styles/colors' as *;

	.feeds-table {
		width: 100%;
		overflow-x: auto;
	}

	.table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.875rem;
	}

	th {
		text-align: left;
		padding: 0.75rem 1rem;
		font-weight: 600;
		color: $color-stone-5;
		border-bottom: 2px solid $color-stone-2;
		background: $color-stone-0;
		white-space: nowrap;
	}

	td {
		padding: 0.75rem 1rem;
		border-bottom: 1px solid $color-stone-2;
	}

	tr:hover {
		background: $color-stone-0;
	}

	.url {
		max-width: 300px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.empty {
		padding: 2rem 1rem;
		text-align: center;
		color: $color-stone-4;
	}

	.actions {
		display: flex;
		gap: 0.25rem;
	}

	.preview-loading {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 2rem;
		color: $color-stone-5;
	}

	.preview-error {
		padding: 1rem;
		color: $color-chili-5;
		background: $color-chili-0;
		border-radius: 4px;
	}

	.preview-content {
		max-height: 60vh;
		overflow: auto;
		font-size: 0.75rem;
	}
</style>
