<script lang="ts">
	interface Props {
		label: string;
	}

	let { label }: Props = $props();
</script>

<span class="badge">{label}</span>

<style lang="scss">
	@use '$styles/colors' as *;

	.badge {
		font-size: 0.7rem;
		padding: 0.125rem 0.375rem;
		background: $color-stone-1;
		color: $color-stone-6;
		border-radius: 2px;
	}
</style>
