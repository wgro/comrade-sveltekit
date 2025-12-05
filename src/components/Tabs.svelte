<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Tab {
		id: string;
		label: string;
	}

	interface Props {
		tabs: Tab[];
		activeTab: string;
		onTabChange: (tabId: string) => void;
		children: Snippet;
	}

	let { tabs, activeTab, onTabChange, children }: Props = $props();
</script>

<div class="tabs">
	<div class="tabs__header">
		{#each tabs as tab (tab.id)}
			<button
				class="tabs__btn"
				class:active={activeTab === tab.id}
				onclick={() => onTabChange(tab.id)}
			>
				{tab.label}
			</button>
		{/each}
	</div>
	<div class="tabs__content">
		{@render children()}
	</div>
</div>

<style lang="scss">
	@use '$styles/colors' as *;

	.tabs {
		display: flex;
		flex-direction: column;
	}

	.tabs__header {
		display: flex;
		gap: 0;
		border-bottom: 1px solid $color-stone-2;
	}

	.tabs__btn {
		padding: 0.5rem 1rem;
		background: transparent;
		border: none;
		border-bottom: 2px solid transparent;
		cursor: pointer;
		color: $color-stone-5;
		font-size: 0.875rem;

		&:hover {
			color: $color-teal-8;
		}

		&.active {
			color: $color-teal-10;
			border-bottom-color: $color-flame-6;
		}
	}

	.tabs__content {
		padding-top: 1rem;
	}
</style>
