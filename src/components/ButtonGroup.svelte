<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<div class="btn-group">
	{@render children()}
</div>

<style lang="scss">
	@use '$styles/colors' as *;

	.btn-group {
		margin-top: 1rem;
		display: flex;
		gap: 0.5rem;
		justify-content: flex-end;
	}
</style>
