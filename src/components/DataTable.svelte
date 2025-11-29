<script lang="ts" generics="T">
	interface Column {
		key: keyof T | string;
		label: string;
		render?: (value: unknown, row: T) => string;
	}

	interface Props {
		columns: Column[];
		data: T[];
		emptyMessage?: string;
	}

	let { columns, data, emptyMessage = 'No data available' }: Props = $props();

	function getCellValue(row: T, column: Column): string {
		const value = (row as Record<string, unknown>)[column.key as string];
		if (column.render) {
			return column.render(value, row);
		}
		return String(value ?? '');
	}
</script>

<div class="data-table">
	<table class="data-table__table">
		<thead class="data-table__head">
			<tr>
				{#each columns as column (column.key)}
					<th class="data-table__th">{column.label}</th>
				{/each}
			</tr>
		</thead>
		<tbody class="data-table__body">
			{#if data.length === 0}
				<tr>
					<td class="data-table__empty" colspan={columns.length}>{emptyMessage}</td>
				</tr>
			{:else}
				{#each data as row, i (i)}
					<tr class="data-table__row">
						{#each columns as column (column.key)}
							<td class="data-table__td">{getCellValue(row, column)}</td>
						{/each}
					</tr>
				{/each}
			{/if}
		</tbody>
	</table>
</div>

<style>
	.data-table {
		width: 100%;
		overflow-x: auto;
	}

	.data-table__table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.875rem;
	}

	.data-table__head {
		background: #f8f9fa;
	}

	.data-table__th {
		text-align: left;
		padding: 0.75rem 1rem;
		font-weight: 600;
		color: #495057;
		border-bottom: 2px solid #dee2e6;
		white-space: nowrap;
	}

	.data-table__body {
		background: #fff;
	}

	.data-table__row:hover {
		background: #f8f9fa;
	}

	.data-table__td {
		padding: 0.75rem 1rem;
		border-bottom: 1px solid #e9ecef;
		color: #212529;
	}

	.data-table__empty {
		padding: 2rem 1rem;
		text-align: center;
		color: #6c757d;
	}
</style>
