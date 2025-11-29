<script lang="ts">
	interface Props {
		title: string;
		subtitle?: string;
		children: import('svelte').Snippet;
	}

	let { title, subtitle, children }: Props = $props();
</script>

<div class="page">
	<header class="page__header">
		<h1 class="page__title">{title}</h1>
		{#if subtitle}
			<p class="page__subtitle">{subtitle}</p>
		{/if}
	</header>

	<div class="page__content">
		{@render children()}
	</div>
</div>

<style lang="scss">
	.page {
		max-width: 1200px;

		&__header {
			margin-bottom: 2rem;
		}

		&__title {
			font-size: 2rem;
			font-weight: 600;
			color: #1a1a1a;
			margin: 0 0 0.5rem 0;
		}

		&__subtitle {
			color: #666;
			font-size: 1rem;
			margin: 0;
		}

		&__content {
			background: #fff;
		}
	}
</style>
