<script lang="ts">
	import { page } from '$app/state';
	import AdminPage from '$components/AdminPage.svelte';
	import Button from '$components/Button.svelte';
	import ButtonGroup from '$components/ButtonGroup.svelte';
	import FeedPreviewModal from '$components/FeedPreviewModal.svelte';
	import { getFeed } from '$lib/api/feeds.remote';
	import PhPencilLineDuotone from '~icons/ph/pencil-line-duotone';
	import PhTrashDuotone from '~icons/ph/trash-duotone';
	import PhArrowsClockwiseDuotone from '~icons/ph/arrows-clockwise-duotone';
	import PhEyeDuotone from '~icons/ph/eye-duotone';
	import github from 'svelte-highlight/styles/github';

	let previewFeedUrl: string | null = $state(null);

	const id = $derived(page.params.id!);
	const feedPromise = $derived(getFeed(id));

	function handleEdit(): void {
		// TODO: implement edit action
	}

	function handleRequeue(): void {
		// TODO: implement requeue action
	}

	function handlePreview(feedUrl: string): void {
		previewFeedUrl = feedUrl;
	}

	function closePreviewModal(): void {
		previewFeedUrl = null;
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
					<Button onclick={handleEdit}>
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
					<Button onclick={() => handlePreview(feed.url)}>
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
			</section>
		{/if}
	</AdminPage>
{:catch}
	<AdminPage title="Feed Details" subtitle="View feed information and stories">
		<p class="error">Error loading feed</p>
	</AdminPage>
{/await}

<FeedPreviewModal feedUrl={previewFeedUrl} onClose={closePreviewModal} />

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
		grid-template-columns: 120px 1fr;
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
</style>
