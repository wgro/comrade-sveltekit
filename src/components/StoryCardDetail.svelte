<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<div class="detail">
	{@render children()}
</div>

<style lang="scss">
	@use '$styles/colors' as *;

	.detail {
		margin: 0.5rem 0;
		padding: 0.75rem;
		background: $color-stone-0;
		border-radius: 4px;
		border: 1px solid $color-stone-2;
	}
</style>
