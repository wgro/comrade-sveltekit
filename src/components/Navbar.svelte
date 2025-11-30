<script lang="ts">
	import Avatar from './Avatar.svelte';


	interface NavbarProps {
		onToggleSidebar?: () => void;
	}

	let { onToggleSidebar }: NavbarProps = $props();

	function handleToggleSidebar(): void {
		if (onToggleSidebar) {
			onToggleSidebar();
		}
	}
</script>

<nav class="navbar">
	<div class="navbar__left">
		<button
			class="navbar__toggle"
			onclick={handleToggleSidebar}
			aria-label="Toggle sidebar"
		>
			☰
		</button>
		<a href="/admin" class="navbar__logo">
			Comrade
		</a>
	</div>



	<div class="navbar__right">
		<Avatar />
	</div>
</nav>

<style lang="scss">
	.navbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem;
		background: #fff;
		border-bottom: 1px solid #e0e0e0;
		height: 60px;

		&__left {
			display: flex;
			align-items: center;
			gap: 1rem;
		}

		&__toggle {
			display: none;
			background: none;
			border: none;
			font-size: 1.5rem;
			cursor: pointer;
			padding: 0.25rem;

			@media (max-width: 768px) {
				display: block;
			}
		}

		&__logo {
			font-size: 1.25rem;
			font-weight: 600;
			color: #1a1a1a;
			text-decoration: none;
		}

		&__right {
			display: flex;
			align-items: center;
		}
	}
</style>
