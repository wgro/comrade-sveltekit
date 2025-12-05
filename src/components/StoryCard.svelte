<script lang="ts">
	import CategoryBadge from '$components/CategoryBadge.svelte';

	interface Props {
		title: string;
		description: string;
		link: string;
		pubDate: string;
		categories: string[];
	}

	let { title, description, link, pubDate, categories }: Props = $props();
</script>

<article class="story-card">
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
				<CategoryBadge label={category} />
			{/each}
		</div>
	{/if}
	{#if link}
		<div class="story-card__link">
			<a href={link} target="_blank" rel="noopener">{link}</a>
		</div>
	{/if}
	<footer class="story-card__actions">
		<!-- Actions to be implemented -->
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
</style>
