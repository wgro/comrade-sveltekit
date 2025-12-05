<script lang="ts">
	interface Props {
		label: string;
		excluded?: boolean;
	}

	let { label, excluded = false }: Props = $props();
</script>

<span class="badge" class:badge--excluded={excluded}>{label}</span>

<style lang="scss">
	@use '$styles/colors' as *;

	.badge {
		font-size: 0.7rem;
		padding: 0.125rem 0.375rem;
		background: $color-stone-1;
		color: $color-stone-6;
		border-radius: 2px;
	}

	.badge--excluded {
		background: $color-chili-2;
		color: $color-chili-8;
	}
</style>
