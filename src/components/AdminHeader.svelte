<script lang="ts">
	import Breadcrumbs from './Breadcrumbs.svelte';
	interface Props {
		title: string;
		subtitle?: string;
		lastBreadcrumbSegment?: string;
		actions?: import('svelte').Snippet;
	}

	let { title, subtitle, lastBreadcrumbSegment, actions }: Props = $props();
</script>

<header class="header">
	<Breadcrumbs lastBreadcrumbSegment={lastBreadcrumbSegment ?? undefined} />
	<div class="header__row">
		<div class="header__text">
			<h1 class="header__title">{title}</h1>
			{#if subtitle}
				<p class="header__subtitle">{subtitle}</p>
			{/if}
		</div>
		{#if actions}
			<div class="header__actions">
				{@render actions()}
			</div>
		{/if}
	</div>
</header>

<style lang="scss">
	.header {
		margin-bottom: 2rem;

		&__row {
			display: grid;
			grid-template-columns: 1fr auto;
			gap: 1rem;
			align-items: start;

			@media (max-width: 600px) {
				grid-template-columns: 1fr;
			}
		}

		&__title {
			font-size: 2rem;
			font-weight: 600;
			margin: 0 0 0.5rem 0;
		}

		&__subtitle {
			color: #666;
			font-size: 1rem;
			margin: 0;
		}

		&__actions {
			display: flex;
			gap: 0.5rem;
			flex-wrap: wrap;
		}
	}
</style>
