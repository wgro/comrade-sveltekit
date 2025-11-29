<script lang="ts">
	import { page } from '$app/state';

	// Generate breadcrumbs from current path
	const breadcrumbs = $derived(() => {
		const path = page.url.pathname;
		const segments = path.split('/').filter(Boolean);

		return segments.map((segment, index) => ({
			label: segment.charAt(0).toUpperCase() + segment.slice(1),
			href: '/' + segments.slice(0, index + 1).join('/')
		}));
	});
</script>

<div class="breadcrumbs">
	{#each breadcrumbs() as crumb, index}
		{#if index > 0}
			<span class="breadcrumbs__separator">/</span>
		{/if}
		<a href={crumb.href} class="breadcrumbs__crumb">
			{crumb.label}
		</a>
	{/each}
</div>

<style lang="scss">
	.breadcrumbs {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex: 1;
		margin: 0 2rem;

		@media (max-width: 768px) {
			display: none;
		}

		&__separator {
			color: #999;
		}

		&__crumb {
			color: #666;
			text-decoration: none;

			&:hover {
				color: #1a1a1a;
			}
		}
	}
</style>
