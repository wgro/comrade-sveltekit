<script lang="ts">
	import Modal from '$components/Modal.svelte';
	import StoryCard from '$components/StoryCard.svelte';
	import Tabs from '$components/Tabs.svelte';
	import { previewFeed, getFeedCategoryExclusions } from '$lib/api/feeds.remote';
	import SvgSpinners90RingWithBg from '~icons/svg-spinners/90-ring-with-bg';
	import Highlight, { LineNumbers } from 'svelte-highlight';
	import xml from 'svelte-highlight/languages/xml';

	interface FeedItem {
		title: string;
		description: string;
		link: string;
		pubDate: string;
		categories: string[];
	}

	interface Props {
		feedUrl: string | null;
		feedId?: string;
		title?: string;
		onClose: () => void;
	}

	let { feedUrl, feedId, title = 'Feed Preview', onClose }: Props = $props();

	let content: string | null = $state(null);
	let loading = $state(false);
	let error: string | null = $state(null);
	let activeTab = $state('xml');
	let exclusions: string[] = $state([]);

	let excludedCategories = $derived(new Set(exclusions.map((e) => e.toLowerCase())));

	const tabs = [
		{ id: 'xml', label: 'XML' },
		{ id: 'stories', label: 'Stories' }
	];

	let items: FeedItem[] = $derived.by(() => {
		if (!content) return [];
		return parseItems(content);
	});

	function parseItems(xmlContent: string): FeedItem[] {
		const parser = new DOMParser();
		const doc = parser.parseFromString(xmlContent, 'text/xml');
		const itemElements = doc.querySelectorAll('item');

		return Array.from(itemElements).map((item) => {
			const categoryElements = item.querySelectorAll('category');
			return {
				title: item.querySelector('title')?.textContent ?? '',
				description: item.querySelector('description')?.textContent ?? '',
				link: item.querySelector('link')?.textContent ?? '',
				pubDate: item.querySelector('pubDate')?.textContent ?? '',
				categories: Array.from(categoryElements).map((c) => c.textContent ?? '')
			};
		});
	}

	$effect(() => {
		if (feedUrl) {
			fetchFeed(feedUrl);
		} else {
			content = null;
			error = null;
		}
	});

	$effect(() => {
		if (feedId) {
			getFeedCategoryExclusions(feedId).then((result) => {
				exclusions = result;
			});
		} else {
			exclusions = [];
		}
	});

	async function fetchFeed(url: string): Promise<void> {
		loading = true;
		error = null;
		content = null;

		try {
			content = await previewFeed(url);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to fetch feed';
		} finally {
			loading = false;
		}
	}

	function handleClose(): void {
		onClose();
	}
</script>

<Modal open={!!feedUrl} {title} onClose={handleClose}>
	<Tabs {tabs} {activeTab} onTabChange={(id) => (activeTab = id)}>
		{#if activeTab === 'xml'}
			{#if loading}
				<div class="preview-loading">
					<SvgSpinners90RingWithBg />
					<span>Loading feed...</span>
				</div>
			{:else if error}
				<div class="preview-error">{error}</div>
			{:else if content}
				<div class="preview-content">
					<Highlight language={xml} code={content} let:highlighted>
						<LineNumbers {highlighted} wrapLines />
					</Highlight>
				</div>
			{/if}
		{:else if activeTab === 'stories'}
			{#if loading}
				<div class="preview-loading">
					<SvgSpinners90RingWithBg />
					<span>Loading feed...</span>
				</div>
			{:else if error}
				<div class="preview-error">{error}</div>
			{:else if items.length === 0}
				<div class="preview-empty">No items found in feed</div>
			{:else}
				<div class="stories">
					{#each items as item, i (i)}
						<StoryCard {...item} {excludedCategories} />
					{/each}
				</div>
			{/if}
		{/if}
	</Tabs>
</Modal>

<style lang="scss">
	@use '$styles/colors' as *;

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

	.preview-empty {
		padding: 2rem;
		text-align: center;
		color: $color-stone-5;
	}

	.preview-content {
		max-height: 60vh;
		overflow: auto;
		font-size: 0.75rem;
	}

	.stories {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		max-height: 60vh;
		overflow: auto;
	}
</style>
