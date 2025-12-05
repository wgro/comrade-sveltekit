<script lang="ts">
	import ActionButton from '$components/ActionButton.svelte';
	import CategoryBadge from '$components/CategoryBadge.svelte';
	import { extractStory } from '$lib/api/stories.remote';
	import PhFileArrowDownFill from '~icons/ph/file-arrow-down-fill';
	import SvgSpinners90RingWithBg from '~icons/svg-spinners/90-ring-with-bg';
	import Highlight, { LineNumbers } from 'svelte-highlight';
	import xml from 'svelte-highlight/languages/xml';

	interface ExtractedContent {
		title: string;
		content: string;
		textContent: string;
		author: string | null;
		excerpt: string | null;
		siteName: string | null;
		length: number;
	}

	interface Props {
		title: string;
		description: string;
		link: string;
		pubDate: string;
		categories: string[];
		excludedCategories?: Set<string>;
	}

	let { title, description, link, pubDate, categories, excludedCategories = new Set() }: Props =
		$props();

	let isExcluded = $derived(categories.some((c) => excludedCategories.has(c)));

	let extracted: ExtractedContent | null = $state(null);
	let loading = $state(false);
	let error: string | null = $state(null);

	async function handleExtract(): Promise<void> {
		if (!link || loading) return;

		loading = true;
		error = null;

		try {
			extracted = await extractStory(link);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to extract story';
		} finally {
			loading = false;
		}
	}
</script>

<article class="story-card" class:story-card--excluded={isExcluded}>
	<header class="story-card__header">
		<h3 class="story-card__title">{title}</h3>
		{#if pubDate}
			<time class="story-card__date">{pubDate}</time>
		{/if}
	</header>
	{#if description}
		<p class="story-card__desc">{description}</p>
	{/if}
	{#if categories.length > 0}
		<div class="story-card__categories">
			{#each categories as category, ci (ci)}
				<CategoryBadge label={category} excluded={excludedCategories.has(category)} />
			{/each}
		</div>
	{/if}
	{#if link}
		<div class="story-card__link">
			<a href={link} target="_blank" rel="noopener">{link}</a>
		</div>
	{/if}
	{#if error}
		<div class="story-card__error">{error}</div>
	{/if}

	{#if extracted}
		<div class="story-card__extracted">
			<h4 class="story-card__extracted-title">{extracted.title}</h4>
			{#if extracted.author}
				<p class="story-card__extracted-author">By {extracted.author}</p>
			{/if}
			<div class="story-card__extracted-content">
				<Highlight language={xml} code={extracted.content} let:highlighted>
					<LineNumbers {highlighted} wrapLines />
				</Highlight>
			</div>
		</div>
	{/if}

	<footer class="story-card__actions">
		{#if link}
			{#if loading}
				<span class="story-card__loading"><SvgSpinners90RingWithBg /></span>
			{:else}
				<ActionButton
					icon={PhFileArrowDownFill}
					title="Extract Story"
					onclick={handleExtract}
				/>
			{/if}
		{/if}
	</footer>
</article>

<style lang="scss">
	@use '$styles/colors' as *;

	.story-card {
		border: 1px solid $color-stone-2;
		border-radius: 4px;
		padding: 1rem;
		background: $color-ivory-0;
	}

	.story-card--excluded {
		border-color: $color-chili-3;
	}

	.story-card__header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
		margin-bottom: 0.5rem;
	}

	.story-card__title {
		margin: 0;
		font-size: 0.9rem;
		font-weight: 600;
		color: $color-teal-10;
	}

	.story-card__date {
		font-size: 0.75rem;
		color: $color-stone-5;
		white-space: nowrap;
	}

	.story-card__desc {
		margin: 0 0 0.5rem;
		font-size: 0.8rem;
		color: $color-stone-7;
		line-height: 1.4;
	}

	.story-card__categories {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
		margin-bottom: 0.5rem;
	}

	.story-card__link {
		font-size: 0.75rem;
		margin-bottom: 0.5rem;

		a {
			color: $color-steel-5;
			text-decoration: none;
			word-break: break-all;

			&:hover {
				text-decoration: underline;
			}
		}
	}

	.story-card__actions {
		display: flex;
		gap: 0.5rem;
		padding-top: 0.5rem;
		border-top: 1px solid $color-stone-1;
	}

	.story-card__error {
		padding: 0.5rem;
		margin-bottom: 0.5rem;
		font-size: 0.75rem;
		color: $color-chili-5;
		background: $color-chili-0;
		border-radius: 4px;
	}

	.story-card__loading {
		display: inline-flex;
		align-items: center;
		color: $color-stone-5;
	}

	.story-card__extracted {
		margin: 0.5rem 0;
		padding: 0.75rem;
		background: $color-stone-0;
		border-radius: 4px;
		border: 1px solid $color-stone-2;
	}

	.story-card__extracted-title {
		margin: 0 0 0.25rem;
		font-size: 0.85rem;
		font-weight: 600;
		color: $color-stone-8;
	}

	.story-card__extracted-author {
		margin: 0 0 0.5rem;
		font-size: 0.75rem;
		color: $color-stone-5;
	}

	.story-card__extracted-content {
		max-height: 300px;
		overflow: auto;
		font-size: 0.75rem;
	}
</style>
