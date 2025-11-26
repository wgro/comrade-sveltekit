<script lang="ts">
	import { findFeeds } from '$libApi/feeds.remote';

	let url = $state('');
	let feeds = $state<{ title: string; link: string }[] | null>(null);
	let error = $state<string | null>(null);
	let loading = $state(false);

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		error = null;
		feeds = null;
		loading = true;

		try {
			feeds = await findFeeds(url);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to find feeds';
		} finally {
			loading = false;
		}
	}
</script>

<h1>Feed Finder Test</h1>

<form onsubmit={handleSubmit}>
	<input type="url" bind:value={url} placeholder="Enter URL" required />
	<button type="submit" disabled={loading}>
		{loading ? 'Searching...' : 'Find Feeds'}
	</button>
</form>

{#if error}
	<p>Error: {error}</p>
{/if}

{#if feeds}
	{#if feeds.length === 0}
		<p>No feeds found</p>
	{:else}
		<h2>Found {feeds.length} feed(s):</h2>
		<ul>
			{#each feeds as feed}
				<li>
					<a href={feed.link} target="_blank">{feed.title || feed.link}</a>
				</li>
			{/each}
		</ul>
	{/if}
{/if}
