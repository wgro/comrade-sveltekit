<script lang="ts">
	import { page } from '$app/state';
	import AdminPage from '$components/AdminPage.svelte';
	import Button from '$components/Button.svelte';
	import ButtonGroup from '$components/ButtonGroup.svelte';
	import FeedPreviewModal from '$components/FeedPreviewModal.svelte';
	import Modal from '$components/Modal.svelte';
	import {
		getFeed,
		updateFeed,
		addFeedExclusion,
		removeFeedExclusion,
		type FeedDetail
	} from '$lib/api/feeds.remote';
	import PhPencilLineDuotone from '~icons/ph/pencil-line-duotone';
	import PhTrashDuotone from '~icons/ph/trash-duotone';
	import PhXCircleDuotone from '~icons/ph/x-circle-duotone';
	import PhPlusDuotone from '~icons/ph/plus-duotone';
	import PhArrowsClockwiseDuotone from '~icons/ph/arrows-clockwise-duotone';
	import PhEyeDuotone from '~icons/ph/eye-duotone';
	import github from 'svelte-highlight/styles/github';

	let previewFeedUrl: string | null = $state(null);
	let previewFeedId: string | undefined = $state(undefined);
	let editModalOpen = $state(false);

	const id = $derived(page.params.id!);
	const feedPromise = $derived(getFeed(id));


	function openEditModal(feed: FeedDetail): void {
		updateFeed.fields.set({
			id: feed.id,
			name: feed.name,
			url: feed.url,
			type: feed.type as 'rss',
			active: feed.active
		});
		editModalOpen = true;
	}

	function closeEditModal(): void {
		editModalOpen = false;
	}

	function handleRequeue(): void {
		// TODO: implement requeue action
	}

	function handlePreview(feedUrl: string, feedId: string): void {
		previewFeedUrl = feedUrl;
		previewFeedId = feedId;
	}

	function closePreviewModal(): void {
		previewFeedUrl = null;
		previewFeedId = undefined;
	}
</script>

<svelte:head>
	{@html github}
</svelte:head>

{#await feedPromise}
	<AdminPage title="Feed Details" subtitle="View feed information and stories">
		<p>Loading feed...</p>
	</AdminPage>
{:then feed}
	<AdminPage
		title="Feed Details"
		subtitle="View feed information and stories"
		lastBreadcrumbSegment={feed?.name}
	>
		{#if !feed}
			<p class="error">Feed not found</p>
		{:else}
			<section class="details">
				<h2>Details</h2>
				<dl>
					<dt>Name</dt>
					<dd>{feed.name}</dd>

					<dt>Type</dt>
					<dd>{feed.type}</dd>

					<dt>URL</dt>
					<dd><a href={feed.url} target="_blank">{feed.url}</a></dd>

					<dt>Publisher</dt>
					<dd>
						<a href="/admin/publishers/{feed.publisher.id}">{feed.publisher.name}</a>
						({feed.publisher.language?.name_en ?? 'N/A'})
					</dd>

					<dt>Status</dt>
					<dd>{feed.active ? 'Active' : 'Inactive'}</dd>

					<dt>Stories</dt>
					<dd>{feed._count.stories}</dd>

					<dt>Last Polled</dt>
					<dd>{feed.lastPolledAt ? new Date(feed.lastPolledAt).toLocaleString() : 'Never'}</dd>

					{#if feed.lastError}
						<dt>Last Error</dt>
						<dd class="error">{feed.lastError}</dd>
					{/if}

					<dt>Created</dt>
					<dd>{new Date(feed.createdAt).toLocaleDateString()}</dd>
				</dl>

				<ButtonGroup>
					<Button onclick={() => openEditModal(feed)}>
						{#snippet icon()}
							<PhPencilLineDuotone />
						{/snippet}
						Edit
					</Button>
					<Button onclick={handleRequeue}>
						{#snippet icon()}
							<PhArrowsClockwiseDuotone />
						{/snippet}
						Requeue
					</Button>
					<Button onclick={() => handlePreview(feed.url, feed.id)}>
						{#snippet icon()}
							<PhEyeDuotone />
						{/snippet}
						Preview
					</Button>
					<Button variant="danger">
						{#snippet icon()}
							<PhTrashDuotone />
						{/snippet}
						Delete
					</Button>
				</ButtonGroup>

				<Modal open={editModalOpen} title="Edit Feed" onClose={closeEditModal}>
					<form
						{...updateFeed.enhance(async ({ submit }) => {
							try {
								await submit();
								closeEditModal();
							} catch (error) {
								console.error('Form submission error:', error);
							}
						})}
						class="edit-form"
					>
						<input type="hidden" name="id" value={updateFeed.fields.id.value()} />

						<div class="field">
							<label for="name">Name</label>
							<input id="name" {...updateFeed.fields.name.as('text')} />
							{#each updateFeed.fields.name.issues() as issue}
								<span class="field-error">{issue.message}</span>
							{/each}
						</div>

						<div class="field">
							<label for="url">URL</label>
							<input id="url" {...updateFeed.fields.url.as('url')} />
							{#each updateFeed.fields.url.issues() as issue}
								<span class="field-error">{issue.message}</span>
							{/each}
						</div>

						<div class="field">
							<label for="type">Type</label>
							<select id="type" {...updateFeed.fields.type.as('select')}>
								<option value="rss">RSS</option>
							</select>
							{#each updateFeed.fields.type.issues() as issue}
								<span class="field-error">{issue.message}</span>
							{/each}
						</div>

						<div class="field field--checkbox">
							<label>
								<input {...updateFeed.fields.active.as('checkbox')} />
								Active
							</label>
						</div>

						<div class="actions">
							<Button type="submit">Save Changes</Button>
						</div>
					</form>
				</Modal>
			</section>

			<section class="exclusions">
				<h2>Category Exclusions</h2>
				<p class="help">Items with these categories will be skipped during feed polling.</p>

				{#if feed.exclusions.length > 0}
					<div class="tags">
						{#each feed.exclusions as exclusion}
							{@const remove = removeFeedExclusion.for(exclusion.id)}
							<form class="tag" {...remove.enhance(async ({ submit }) => submit())}>
								<input type="hidden" name="id" value={exclusion.id} />
								<span>{exclusion.category}</span>
								<button
									type="submit"
									class="tag__remove"
									disabled={!!remove.pending}
									aria-label="Remove {exclusion.category}"
								>
									<PhXCircleDuotone />
								</button>
							</form>
						{/each}
					</div>
				{:else}
					<p class="empty">No exclusions configured.</p>
				{/if}

				{#if feed}
					{@const add = addFeedExclusion.for(feed.id)}
					<form
						class="add-exclusion"
						{...add.enhance(async ({ form, submit }) => {
							await submit();
							form.reset();
						})}
					>
						<input type="hidden" name="feedId" value={feed.id} />
						<input
							type="text"
							name="category"
							placeholder="Category to exclude..."
							required
						/>
						<Button type="submit" disabled={!!add.pending}>
							{#snippet icon()}
								<PhPlusDuotone />
							{/snippet}
							Add
						</Button>
					</form>
				{/if}
			</section>
		{/if}
	</AdminPage>
{:catch}
	<AdminPage title="Feed Details" subtitle="View feed information and stories">
		<p class="error">Error loading feed</p>
	</AdminPage>
{/await}

<FeedPreviewModal feedUrl={previewFeedUrl} feedId={previewFeedId} onClose={closePreviewModal} />

<style lang="scss">
	@use '$styles/colors' as *;

	section {
		margin-bottom: 2rem;
	}

	h2 {
		font-size: 1.25rem;
		font-weight: 600;
		margin-bottom: 1rem;
	}

	dl {
		display: grid;
		grid-template-columns: 120px 1fr 120px 1fr;
		gap: 0.5rem 1rem;
		margin-bottom: 1.5rem;
	}

	dt {
		font-weight: 600;
		color: $color-stone-4;
	}

	dd {
		margin: 0;
	}

	.error {
		color: $color-chili-5;
	}

	.edit-form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;

		label {
			font-weight: 600;
			font-size: 0.875rem;
			color: $color-stone-6;
		}

		input,
		select {
			padding: 0.5rem 0.75rem;
			border: 1px solid $color-stone-3;
			border-radius: 4px;
			font-size: 0.875rem;

			&:focus {
				outline: none;
				border-color: $color-teal-5;
			}

			&[aria-invalid='true'] {
				border-color: $color-chili-5;
			}
		}

		select {
			background: white;
		}
	}

	.field--checkbox {
		flex-direction: row;
		align-items: center;

		label {
			display: flex;
			align-items: center;
			gap: 0.5rem;
			font-weight: 400;
			cursor: pointer;
		}

		input {
			width: auto;
		}
	}

	.field-error {
		color: $color-chili-5;
		font-size: 0.75rem;
	}

	.actions {
		margin-top: 0.5rem;
		display: flex;
		justify-content: flex-end;
	}

	.exclusions {
		.help {
			font-size: 0.875rem;
			color: $color-stone-5;
			margin-bottom: 1rem;
		}

		.empty {
			font-size: 0.875rem;
			color: $color-stone-4;
			font-style: italic;
			margin-bottom: 1rem;
		}
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.tag {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.25rem 0.5rem;
		background: $color-stone-2;
		border-radius: 4px;
		font-size: 0.875rem;
	}

	.tag__remove {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		border: none;
		background: none;
		cursor: pointer;
		color: $color-stone-5;

		&:hover {
			color: $color-chili-5;
		}
	}

	.add-exclusion {
		display: flex;
		gap: 0.5rem;
		align-items: center;

		input {
			flex: 1;
			max-width: 300px;
			padding: 0.5rem 0.75rem;
			border: 1px solid $color-stone-3;
			border-radius: 4px;
			font-size: 0.875rem;

			&:focus {
				outline: none;
				border-color: $color-teal-5;
			}
		}
	}
</style>
