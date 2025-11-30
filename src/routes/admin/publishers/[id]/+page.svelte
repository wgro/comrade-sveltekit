<script lang="ts">
	import { page } from '$app/state';
	import AdminPage from '$components/AdminPage.svelte';
	import { getPublisher, getPublisherStories } from '$lib/api/publishers.remote';

	const id = $derived(page.params.id!);
</script>

<AdminPage title="Publisher Details" subtitle="View publisher information, feeds, and stories">
	<p><a href="/admin/publishers" class="back">&larr; Back to Publishers</a></p>

	{#await getPublisher(id)}
		<p>Loading publisher...</p>
	{:then publisher}
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
							</tr>
						</thead>
						<tbody>
							{#each publisher.feeds as feed (feed.id)}
								<tr>
									<td>{feed.name}</td>
									<td class="url"><a href={feed.url} target="_blank">{feed.url}</a></td>
									<td>{feed._count.stories}</td>
									<td>{feed.lastPolledAt ? new Date(feed.lastPolledAt).toLocaleString() : 'Never'}</td>
									<td class:error={feed.lastError}>
										{#if feed.lastError}
											Error
										{:else}
											{feed.active ? 'Active' : 'Inactive'}
										{/if}
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
											{story.publishedAt
												? new Date(story.publishedAt).toLocaleDateString()
												: '-'}
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
	{:catch}
		<p class="error">Error loading publisher</p>
	{/await}
</AdminPage>

<style>
	.back {
		color: #0066cc;
		text-decoration: none;
	}

	.back:hover {
		text-decoration: underline;
	}

	section {
		margin-bottom: 2rem;
	}

	h2 {
		font-size: 1.25rem;
		font-weight: 600;
		margin-bottom: 1rem;
		color: #333;
	}

	dl {
		display: grid;
		grid-template-columns: 120px 1fr;
		gap: 0.5rem 1rem;
	}

	dt {
		font-weight: 600;
		color: #666;
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

	.url,
	.title {
		max-width: 300px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	a {
		color: #0066cc;
		text-decoration: none;
	}

	a:hover {
		text-decoration: underline;
	}

	.empty {
		color: #6c757d;
		font-style: italic;
	}

	.error {
		color: #dc3545;
	}
</style>
