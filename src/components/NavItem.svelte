<script lang="ts">
	import type { Component } from 'svelte';

	interface NavItemProps {
		label: string;
		href: string;
		icon?: Component;
		active?: boolean;
		onclick?: () => void;
	}

	let { label, href, icon, active = false, onclick }: NavItemProps = $props();
</script>

<a
	{href}
	class="nav-item"
	class:nav-item--active={active}
	{onclick}
>
	{#if icon}
		{@const Icon = icon}
		<span class="nav-item__icon">
			<Icon />
		</span>
	{/if}
	<span class="nav-item__label">{label}</span>
</a>

<style lang="scss">
	.nav-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		color: #495057;
		text-decoration: none;
		border-radius: 4px;
		transition: background 0.2s;

		&:hover {
			background: #e9ecef;
		}

		&--active {
			background: #007bff;
			color: #fff;

			&:hover {
				background: #0056b3;
			}
		}

		&__icon {
			font-size: 1.25rem;
			display: flex;
			align-items: center;
		}

		&__label {
			font-weight: 500;
		}
	}
</style>
