import { Job, Sidequest } from 'sidequest';
import { prisma } from '$lib/server/db/connection';
import { fetchAndParseFeed } from '$lib/server/services/rss';
import { StoryStatus } from '$lib/server/db/models';
import { FetchStoryJob } from './FetchStoryJob';

export class PollFeedJob extends Job {
	async run(feedId: string) {
		// 1. Fetch feed with publisher -> language relation
		const feed = await prisma.feed.findUnique({
			where: { id: feedId },
			include: { publisher: { include: { language: true } } }
		});

		if (!feed) {
			throw new Error(`Feed not found: ${feedId}`);
		}

		if (!feed.active) {
			return { skipped: true, reason: 'Feed inactive' };
		}

		try {
			// 2. Fetch and parse RSS
			const parsed = await fetchAndParseFeed(feed.url);

			// 3. Get existing guids to avoid duplicates
			const existingGuids = await prisma.story.findMany({
				where: { feedId },
				select: { guid: true }
			});
			const existingSet = new Set(existingGuids.map((s) => s.guid));

			// 4. Filter to new entries only
			const newEntries = parsed.entries.filter((e) => !existingSet.has(e.guid));

			// 5. Create stories and enqueue jobs
			const createdStories = [];
			for (const entry of newEntries) {
				const story = await prisma.story.create({
					data: {
						feedId,
						guid: entry.guid,
						sourceUrl: entry.link,
						originalTitle: entry.title,
						originalLanguage: feed.publisher.language.code,
						status: StoryStatus.PENDING,
						publishedAt: entry.pubDate
					}
				});
				createdStories.push(story);
				await Sidequest.build(FetchStoryJob).enqueue(story.id);
			}

			// 6. Update feed lastPolledAt, clear any previous error
			await prisma.feed.update({
				where: { id: feedId },
				data: { lastPolledAt: new Date(), lastError: null }
			});

			console.log(
				`[PollFeedJob] Feed ${feed.name}: found ${parsed.entries.length} entries, created ${createdStories.length} new stories`
			);

			return {
				entriesFound: parsed.entries.length,
				storiesCreated: createdStories.length
			};
		} catch (error) {
			// Update feed with error info
			const errorMsg = error instanceof Error ? error.message : String(error);
			await prisma.feed.update({
				where: { id: feedId },
				data: { lastError: errorMsg, lastPolledAt: new Date() }
			});
			throw error; // Re-throw for Sidequest retry handling
		}
	}
}
