<script lang="ts">
	import type { Component } from 'svelte';
	import SvgSpinners90RingWithBg from '~icons/svg-spinners/90-ring-with-bg';

	interface Props {
		icon: Component;
		title: string;
		label?: string;
		opened?: boolean;
		loading?: boolean;
		onclick?: () => void;
	}

	let { icon: Icon, title, label, opened = false, loading = false, onclick }: Props = $props();
</script>

<button
	class="action-btn"
	class:action-btn--opened={opened}
	class:action-btn--with-label={label}
	{title}
	{onclick}
	type="button"
	disabled={loading}
>
	{#if loading}
		<SvgSpinners90RingWithBg />
	{:else}
		<Icon />
	{/if}
	{#if label}
		<span class="action-btn__label">{label}</span>
	{/if}
</button>

<style lang="scss">
	@use '$styles/colors' as *;

	.action-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.25rem;
		height: 28px;
		padding: 0 0.5rem;
		border: none;
		background: transparent;
		color: $color-stone-5;
		border-radius: 4px;
		cursor: pointer;
		transition:
			background 0.15s,
			color 0.15s;

		&:hover:not(:disabled) {
			background: $color-stone-1;
			color: $color-stone-7;
		}

		&:disabled {
			cursor: not-allowed;
			opacity: 0.7;
		}

		:global(svg) {
			width: 18px;
			height: 18px;
			flex-shrink: 0;
		}
	}

	.action-btn:not(.action-btn--with-label) {
		width: 28px;
		padding: 0;
	}

	.action-btn--opened {
		background: $color-stone-2;
		color: $color-stone-8;
	}

	.action-btn__label {
		font-size: 0.75rem;
		font-weight: 500;
	}
</style>
