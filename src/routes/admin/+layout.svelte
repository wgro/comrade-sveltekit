<script lang="ts">
	import Navbar from '$components/Navbar.svelte';
	import Sidebar from '$components/Sidebar.svelte';
	import '$styles/_admin.scss';

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

<div class="admin-layout">
	<div class="admin-layout__navbar">
		<Navbar onToggleSidebar={toggleSidebar} />
	</div>

	<div class="admin-layout__sidebar">
		<Sidebar mobileOpen={sidebarMobileOpen} onClose={closeSidebar} />
	</div>

	<main class="admin-layout__main">
		{@render children()}
	</main>
</div>
