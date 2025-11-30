<script lang="ts">
	import type { Snippet } from 'svelte';
	import PhXBold from '~icons/ph/x-bold';

	interface Props {
		open: boolean;
		title: string;
		onClose: () => void;
		children: Snippet;
	}

	let { open, title, onClose, children }: Props = $props();

	function handleKeydown(event: KeyboardEvent): void {
		if (event.key === 'Escape') {
			onClose();
		}
	}

	function handleOverlayClick(event: MouseEvent): void {
		if (event.target === event.currentTarget) {
			onClose();
		}
	}

	function handleOverlayKeydown(event: KeyboardEvent): void {
		if ((event.key === 'Enter' || event.key === ' ') && event.target === event.currentTarget) {
			event.preventDefault();
			onClose();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<div class="modal__overlay" onclick={handleOverlayClick} onkeydown={handleOverlayKeydown} role="dialog" aria-modal="true" tabindex="-1">
		<div class="modal__container">
			<header class="modal__header">
				<h2 class="modal__title">{title}</h2>
				<button class="modal__close" onclick={onClose} aria-label="Close modal">
					<PhXBold />
				</button>
			</header>
			<div class="modal__body">
				{@render children()}
			</div>
		</div>
	</div>
{/if}

<style lang="scss">
	@use '$styles/colors' as *;

	.modal__overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba($color-teal, 0.6);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.modal__container {
		background: white;
		border-radius: 8px;
		width: 600px;
		max-width: 90vw;
		max-height: 90vh;
		overflow: auto;
		box-shadow: 0 4px 20px rgba($color-teal, 0.15);
	}

	.modal__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid $color-stone-2;
	}

	.modal__title {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 600;
	}

	.modal__close {
		background: none;
		border: none;
		cursor: pointer;
		padding: 0.25rem;
		display: flex;
		align-items: center;
		justify-content: center;
		color: $color-stone-5;
		border-radius: 4px;

		&:hover {
			background: $color-stone-1;
			color: $color-stone-7;
		}
	}

	.modal__body {
		padding: 1.5rem;
	}
</style>
