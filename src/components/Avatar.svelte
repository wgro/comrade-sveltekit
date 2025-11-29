<script lang="ts">
	interface AvatarProps {
		name?: string;
		initial?: string;
	}

	let { name = 'Admin', initial = 'A' }: AvatarProps = $props();

	let menuOpen = $state(false);

	function toggleMenu(): void {
		menuOpen = !menuOpen;
	}
</script>

<div class="avatar">
	<button class="avatar__btn" onclick={toggleMenu} aria-label="User menu">
		<span class="avatar__circle">{initial}</span>
		<span class="avatar__name">{name}</span>
	</button>

	{#if menuOpen}
		<div class="avatar__menu">
			<a href="/admin/settings" class="avatar__menu-item">Settings</a>
			<a href="/logout" class="avatar__menu-item">Logout</a>
		</div>
	{/if}
</div>

<style lang="scss">
	.avatar {
		position: relative;

		&__btn {
			display: flex;
			align-items: center;
			gap: 0.5rem;
			background: none;
			border: none;
			cursor: pointer;
			padding: 0.5rem;
		}

		&__circle {
			width: 32px;
			height: 32px;
			border-radius: 50%;
			background: #007bff;
			color: #fff;
			display: flex;
			align-items: center;
			justify-content: center;
			font-weight: 600;
		}

		&__name {
			@media (max-width: 768px) {
				display: none;
			}
		}

		&__menu {
			position: absolute;
			top: 100%;
			right: 0;
			background: #fff;
			border: 1px solid #e0e0e0;
			border-radius: 4px;
			box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
			min-width: 150px;
			margin-top: 0.5rem;
			z-index: 1000;
		}

		&__menu-item {
			display: block;
			padding: 0.75rem 1rem;
			color: #1a1a1a;
			text-decoration: none;

			&:hover {
				background: #f5f5f5;
			}
		}
	}
</style>
