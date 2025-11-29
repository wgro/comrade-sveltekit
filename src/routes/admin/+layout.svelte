<script lang="ts">
	import Navbar from '$components/Navbar.svelte';
	import Sidebar from '$components/Sidebar.svelte';

	interface LayoutProps {
		children: import('svelte').Snippet;
	}

	let { children }: LayoutProps = $props();

	let sidebarMobileOpen = $state(false);

	function toggleSidebar(): void {
		sidebarMobileOpen = !sidebarMobileOpen;
	}

	function closeSidebar(): void {
		sidebarMobileOpen = false;
	}
</script>

<div class="layout">
	<div class="layout__navbar">
		<Navbar onToggleSidebar={toggleSidebar} />
	</div>

	<div class="layout__sidebar">
		<Sidebar mobileOpen={sidebarMobileOpen} onClose={closeSidebar} />
	</div>

	<main class="layout__main">
		{@render children()}
	</main>
</div>

<style lang="scss">
	.layout {
		display: grid;
		grid-template-areas:
			'navbar navbar'
			'sidebar main';
		grid-template-columns: 250px 1fr;
		grid-template-rows: 60px 1fr;
		height: 100vh;
		overflow: hidden;

		@media (max-width: 768px) {
			grid-template-areas:
				'navbar'
				'main';
			grid-template-columns: 1fr;
		}

		&__navbar {
			grid-area: navbar;
		}

		&__sidebar {
			grid-area: sidebar;
		}

		&__main {
			grid-area: main;
			overflow-y: auto;
			padding: 2rem;
			background: #fff;

			@media (max-width: 768px) {
				padding: 1rem;
			}
		}
	}
</style>
