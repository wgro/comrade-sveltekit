<script lang="ts">
	import type { Component, Snippet } from 'svelte';

	interface Props {
		icon: Component;
		title: string;
		onclick?: () => void;
	}

	let { icon: Icon, title, onclick }: Props = $props();
</script>

<button class="action-btn" {title} {onclick} type="button">
	<Icon />
</button>

<style lang="scss">
	@use '$styles/colors' as *;

	.action-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		padding: 0;
		border: none;
		background: transparent;
		color: $color-stone-5;
		border-radius: 4px;
		cursor: pointer;
		transition: background 0.15s, color 0.15s;

		&:hover {
			background: $color-stone-1;
			color: $color-stone-7;
		}

		:global(svg) {
			width: 18px;
			height: 18px;
		}
	}
</style>
