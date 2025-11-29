<script lang="ts">
	import { page } from '$app/state';
	import type { Component } from 'svelte';
	import NavItem from './NavItem.svelte';
	import PhChartLineUpDuotone from '~icons/ph/chart-line-up-duotone';
	import PhNewspaperDuotone from '~icons/ph/newspaper-duotone';
	import PhRssSimpleDuotone from '~icons/ph/rss-simple-duotone';
	import PhArticleDuotone from '~icons/ph/article-duotone';

	interface SidebarProps {
		mobileOpen?: boolean;
		onClose?: () => void;
	}

	let { mobileOpen = false, onClose }: SidebarProps = $props();

	interface NavItemConfig {
		label: string;
		href: string;
		icon: Component;
	}

	const navItems: NavItemConfig[] = [
		{ label: 'Dashboard', href: '/admin', icon: PhChartLineUpDuotone },
		{ label: 'Publishers', href: '/admin/publishers', icon: PhNewspaperDuotone },
		{ label: 'Feeds', href: '/admin/feeds', icon: PhRssSimpleDuotone },
		{ label: 'Stories', href: '/admin/stories', icon: PhArticleDuotone }
	];

	function isActive(href: string): boolean {
		const currentPath = page.url.pathname;
		if (href === '/admin') {
			return currentPath === '/admin';
		}
		return currentPath.startsWith(href);
	}

	function handleLinkClick(): void {
		if (onClose) {
			onClose();
		}
	}
</script>

<aside class="sidebar" class:sidebar--mobile-open={mobileOpen}>
	{#if mobileOpen}
		<button class="sidebar__overlay" onclick={onClose} aria-label="Close sidebar"></button>
	{/if}

	<div class="sidebar__content">
		<nav class="sidebar__nav">
			{#each navItems as item}
				<NavItem
					href={item.href}
					label={item.label}
					icon={item.icon}
					active={isActive(item.href)}
					onclick={handleLinkClick}
				/>
			{/each}
		</nav>
	</div>
</aside>

<style lang="scss">
	.sidebar {
		width: 250px;
		background: #f8f9fa;
		border-right: 1px solid #e0e0e0;
		height: 100%;
		overflow-y: auto;

		@media (max-width: 768px) {
			position: fixed;
			top: 0;
			left: 0;
			z-index: 999;
			transform: translateX(-100%);
			transition: transform 0.3s ease;
			box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);

			&--mobile-open {
				transform: translateX(0);
			}
		}

		&__overlay {
			display: none;

			@media (max-width: 768px) {
				display: block;
				position: fixed;
				top: 0;
				left: 0;
				right: 0;
				bottom: 0;
				background: rgba(0, 0, 0, 0.5);
				z-index: -1;
				border: none;
				padding: 0;
				cursor: pointer;
			}
		}

		&__content {
			padding: 1rem 0;
			height: 100%;
		}

		&__nav {
			display: flex;
			flex-direction: column;
			gap: 0.25rem;
			padding: 0 0.5rem;
		}
	}
</style>
