<script lang="ts">
	interface Props {
		ruleType: 'og_type' | 'json_ld_type' | string;
		value: string;
		description?: string | null;
	}

	let { ruleType, value, description = null }: Props = $props();

	const label = $derived(ruleType === 'og_type' ? 'og:type' : '@type');
</script>

<span class="badge" title={description ?? undefined}>
	<span class="badge__rule">{label}</span>
	<span class="badge__value">{value}</span>
	{#if description}
		<span class="badge__info">ℹ</span>
	{/if}
</span>

<style lang="scss">
	@use '$styles/colors' as *;

	.badge {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.7rem;
		padding: 0.125rem 0.375rem;
		background: $color-stone-1;
		color: $color-stone-6;
		border-radius: 2px;
		border: 1px solid $color-stone-2;
	}

	.badge__rule {
		font-family: monospace;
		color: $color-stone-5;
	}

	.badge__value {
		color: $color-stone-8;
	}

	.badge__info {
		color: $color-stone-5;
		cursor: help;
	}
</style>
