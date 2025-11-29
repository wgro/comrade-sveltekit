<script lang="ts">
	import { page } from '$app/state';

	interface SidebarProps {
		mobileOpen?: boolean;
		onClose?: () => void;
	}

	let { mobileOpen = false, onClose }: SidebarProps = $props();

	interface NavItem {
		label: string;
		href: string;
		icon: string;
	}

	const navItems: NavItem[] = [
		{ label: 'Dashboard', href: '/admin', icon: '📊' },
		{ label: 'Publishers', href: '/admin/publishers', icon: '📰' },
		{ label: 'Feeds', href: '/admin/feeds', icon: '📡' },
		{ label: 'Stories', href: '/admin/stories', icon: '📄' }
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
				<a
					href={item.href}
					class="sidebar__link"
					class:sidebar__link--active={isActive(item.href)}
					onclick={handleLinkClick}
				>
					<span class="sidebar__icon">{item.icon}</span>
					<span class="sidebar__label">{item.label}</span>
				</a>
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

		&__link {
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
		}

		&__icon {
			font-size: 1.25rem;
		}

		&__label {
			font-weight: 500;
		}
	}
</style>
