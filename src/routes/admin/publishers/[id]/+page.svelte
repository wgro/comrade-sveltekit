<script lang="ts">
	import { page } from '$app/state';
	import AdminPage from '$components/AdminPage.svelte';
	import Button from '$components/Button.svelte';
	import ButtonGroup from '$components/ButtonGroup.svelte';
	import FeedPreviewModal from '$components/FeedPreviewModal.svelte';
	import Modal from '$components/Modal.svelte';
	import {
		getPublisher,
		getPublisherStories,
		getLanguages,
		updatePublisher,
		type FeedWithCount
	} from '$lib/api/publishers.remote';
	import ActionButton from '$components/ActionButton.svelte';
	import PhPencilLineDuotone from '~icons/ph/pencil-line-duotone';
	import PhTrashDuotone from '~icons/ph/trash-duotone';
	import PhArrowsClockwiseDuotone from '~icons/ph/arrows-clockwise-duotone';
	import PhEyeDuotone from '~icons/ph/eye-duotone';
	import github from 'svelte-highlight/styles/github';

	let previewFeedUrl: string | null = $state(null);
	let previewFeedTitle: string = $state('Feed Preview');

	function handleEditFeed(feed: FeedWithCount): void {
		// TODO: implement edit action
	}

	function handleRequeueFeed(feed: FeedWithCount): void {
		// TODO: implement requeue action
	}

	function handlePreviewFeed(feed: FeedWithCount): void {
		previewFeedUrl = feed.url;
		previewFeedTitle = feed.name;
	}

	function closePreviewModal(): void {
		previewFeedUrl = null;
	}

	const id = $derived(page.params.id!);
	const publisherPromise = $derived(getPublisher(id));

	let editModalOpen = $state(false);

	function openEditModal(publisher: {
		id: string;
		name: string;
		slug: string;
		type: string;
		baseUrl: string;
		languageId: string;
		active: boolean;
	}): void {
		updatePublisher.fields.set({
			id: publisher.id,
			name: publisher.name,
			slug: publisher.slug,
			type: publisher.type as 'rferl' | 'competitor',
			baseUrl: publisher.baseUrl,
			languageId: publisher.languageId,
			active: publisher.active
		});
		editModalOpen = true;
	}

	function closeEditModal(): void {
		editModalOpen = false;
	}
</script>

<svelte:head>
	{@html github}
</svelte:head>

{#await publisherPromise}
	<AdminPage title="Publisher Details" subtitle="View publisher information, feeds, and stories">
		<p>Loading publisher...</p>
	</AdminPage>
{:then publisher}
	<AdminPage
		title="Publisher Details"
		subtitle="View publisher information, feeds, and stories"
		lastBreadcrumbSegment={publisher?.name}
	>
		{#if !publisher}
			<p class="error">Publisher not found</p>
		{:else}
			<section class="details">
				<h2>Details</h2>
				<dl>
					<dt>Name</dt>
					<dd>{publisher.name}</dd>

					<dt>Slug</dt>
					<dd>{publisher.slug}</dd>

					<dt>Type</dt>
					<dd>{publisher.type}</dd>

					<dt>Language</dt>
					<dd>{publisher.language?.name ?? 'N/A'} ({publisher.language?.code})</dd>

					<dt>Base URL</dt>
					<dd><a href={publisher.baseUrl} target="_blank">{publisher.baseUrl}</a></dd>

					<dt>Status</dt>
					<dd>{publisher.active ? 'Active' : 'Inactive'}</dd>

					<dt>Created</dt>
					<dd>{new Date(publisher.createdAt).toLocaleDateString()}</dd>
				</dl>

				<ButtonGroup>
					<Button onclick={() => openEditModal(publisher)}>
						{#snippet icon()}
							<PhPencilLineDuotone />
						{/snippet}
						Edit
					</Button>
					<Button variant="danger">
						{#snippet icon()}
							<PhTrashDuotone />
						{/snippet}
						Delete
					</Button>
				</ButtonGroup>

				<Modal open={editModalOpen} title="Edit Publisher" onClose={closeEditModal}>
					<form
						{...updatePublisher.enhance(async ({ submit }) => {
							try {
								await submit();
								closeEditModal();
							} catch (error) {
								console.error('Form submission error:', error);
							}
						})}
						class="edit-form"
					>
						<input type="hidden" name="id" value={updatePublisher.fields.id.value()} />

						<div class="field">
							<label for="name">Name</label>
							<input id="name" {...updatePublisher.fields.name.as('text')} />
							{#each updatePublisher.fields.name.issues() as issue}
								<span class="field-error">{issue.message}</span>
							{/each}
						</div>

						<div class="field">
							<label for="slug">Slug</label>
							<input id="slug" {...updatePublisher.fields.slug.as('text')} />
							{#each updatePublisher.fields.slug.issues() as issue}
								<span class="field-error">{issue.message}</span>
							{/each}
						</div>

						<div class="field">
							<label for="type">Type</label>
							<select id="type" {...updatePublisher.fields.type.as('select')}>
								<option value="rferl">RFE/RL</option>
								<option value="competitor">Competitor</option>
							</select>
							{#each updatePublisher.fields.type.issues() as issue}
								<span class="field-error">{issue.message}</span>
							{/each}
						</div>

						<div class="field">
							<label for="baseUrl">Base URL</label>
							<input id="baseUrl" {...updatePublisher.fields.baseUrl.as('url')} />
							{#each updatePublisher.fields.baseUrl.issues() as issue}
								<span class="field-error">{issue.message}</span>
							{/each}
						</div>

						<div class="field">
							<label for="languageId">Language</label>
							<select id="languageId" {...updatePublisher.fields.languageId.as('select')}>
								<option value="">Select a language</option>
								{#await getLanguages() then languages}
									{#each languages as language (language.id)}
										<option value={language.id}>{language.name_en} ({language.code})</option>
									{/each}
								{/await}
							</select>
							{#each updatePublisher.fields.languageId.issues() as issue}
								<span class="field-error">{issue.message}</span>
							{/each}
						</div>

						<div class="field field--checkbox">
							<label>
								<input {...updatePublisher.fields.active.as('checkbox')} />
								Active
							</label>
						</div>

						<div class="actions">
							<Button type="submit">Save Changes</Button>
						</div>
					</form>
				</Modal>
			</section>

			<section class="feeds">
				<h2>Feeds ({publisher.feeds.length})</h2>
				{#if publisher.feeds.length === 0}
					<p class="empty">No feeds configured</p>
				{:else}
					<table class="table">
						<thead>
							<tr>
								<th>Name</th>
								<th>URL</th>
								<th>Stories</th>
								<th>Last Polled</th>
								<th>Status</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{#each publisher.feeds as feed (feed.id)}
								<tr>
									<td>{feed.name}</td>
									<td class="url"><a href={feed.url} target="_blank">{feed.url}</a></td>
									<td>{feed._count.stories}</td>
									<td
										>{feed.lastPolledAt
											? new Date(feed.lastPolledAt).toLocaleString()
											: 'Never'}</td
									>
									<td class:error={feed.lastError}>
										{#if feed.lastError}
											Error
										{:else}
											{feed.active ? 'Active' : 'Inactive'}
										{/if}
									</td>
									<td class="actions">
										<ActionButton
											icon={PhPencilLineDuotone}
											title="Edit feed"
											onclick={() => handleEditFeed(feed)}
										/>
										<ActionButton
											icon={PhArrowsClockwiseDuotone}
											title="Requeue feed"
											onclick={() => handleRequeueFeed(feed)}
										/>
										<ActionButton
											icon={PhEyeDuotone}
											title="Preview feed"
											onclick={() => handlePreviewFeed(feed)}
										/>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				{/if}
			</section>

			<section class="stories">
				<h2>Recent Stories</h2>
				{#await getPublisherStories(id)}
					<p>Loading stories...</p>
				{:then stories}
					{#if stories.length === 0}
						<p class="empty">No stories yet</p>
					{:else}
						<table class="table">
							<thead>
								<tr>
									<th>Title</th>
									<th>Feed</th>
									<th>Status</th>
									<th>Translation</th>
									<th>Summary</th>
									<th>Published</th>
								</tr>
							</thead>
							<tbody>
								{#each stories as story (story.id)}
									<tr>
										<td class="title">
											<a href={story.sourceUrl} target="_blank">{story.originalTitle}</a>
										</td>
										<td>{story.feed.name}</td>
										<td class:error={story.status === 'failed'}>
											{story.status}
										</td>
										<td>
											{#if story.translations.length > 0}
												{story.translations[0].status}
											{:else}
												-
											{/if}
										</td>
										<td>
											{#if story.summaries.length > 0}
												{story.summaries[0].status}
											{:else}
												-
											{/if}
										</td>
										<td>
											{story.publishedAt ? new Date(story.publishedAt).toLocaleDateString() : '-'}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					{/if}
				{:catch}
					<p class="error">Error loading stories</p>
				{/await}
			</section>
		{/if}
	</AdminPage>
{:catch}
	<AdminPage title="Publisher Details" subtitle="View publisher information, feeds, and stories">
		<p class="error">Error loading publisher</p>
	</AdminPage>
{/await}

<FeedPreviewModal feedUrl={previewFeedUrl} title={previewFeedTitle} onClose={closePreviewModal} />

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
	}

	dt {
		font-weight: 600;
		color: $color-stone-4;
	}

	dd {
		margin: 0;
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
	}

	td {
		padding: 0.75rem 1rem;
		border-bottom: 1px solid $color-stone-2;
	}

	tr:hover {
		background: $color-stone-0;
	}

	.url,
	.title {
		max-width: 300px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.empty {
		color: $color-stone-4;
		font-style: italic;
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
		display: flex;
		gap: 0.25rem;
	}

	.edit-form .actions {
		margin-top: 0.5rem;
		justify-content: flex-end;
	}
</style>
