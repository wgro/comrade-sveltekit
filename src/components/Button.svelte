<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		icon?: Snippet;
		variant?: 'default' | 'danger';
		onclick?: () => void;
	}

	let { children, icon, variant = 'default', onclick }: Props = $props();
</script>

<button class="btn btn--{variant}" {onclick}>
	{#if icon}
		<span class="btn__icon">
			{@render icon()}
		</span>
	{/if}
	<span class="btn__label">{@render children()}</span>
</button>

<style lang="scss">
	@use '$styles/colors' as *;

	.btn {
		--shadow-height: 2px;
		--shadow-height-active: 0px;

		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
		font-weight: 500;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		transition: transform 0.1s, box-shadow 0.1s;

		&--default {
			background: $color-stone-1;
			color: $color-stone-9;
			box-shadow:
				0 var(--shadow-height) 0 $color-stone-3,
				0 var(--shadow-height) 6px rgba(0, 0, 0, 0.1);

			&:hover {
				background: $color-stone-2;
			}

			&:active {
				transform: translateY(calc(var(--shadow-height) - var(--shadow-height-active)));
				box-shadow:
					0 var(--shadow-height-active) 0 $color-stone-4,
					0 var(--shadow-height-active) 3px rgba(0, 0, 0, 0.1);
			}
		}

		&--danger {
			background: $color-chili-5;
			color: white;
			box-shadow:
				0 var(--shadow-height) 0 $color-chili-8,
				0 var(--shadow-height) 6px rgba(0, 0, 0, 0.1);

			&:hover {
				background: $color-chili-6;
			}

			&:active {
				transform: translateY(calc(var(--shadow-height) - var(--shadow-height-active)));
				box-shadow:
					0 var(--shadow-height-active) 0 $color-chili-8,
					0 var(--shadow-height-active) 3px rgba(0, 0, 0, 0.1);
			}
		}

		&__icon {
			display: flex;
			align-items: center;
			font-size: 1.125rem;
		}

		&__label {
			line-height: 1;
		}
	}
</style>
