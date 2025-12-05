import { Job } from 'sidequest';
import { prisma } from '../../src/lib/server/db/connection.ts';
import { fetchAndParseFeed, type FeedEntry } from '../../src/lib/server/services/rss/index.ts';
import { StoryStatus } from '../../src/lib/server/db/models/index.ts';
import {
	extractFromUrl,
	type ExtractedContent,
	type ExtractedMetadata
} from '../../src/lib/server/services/extraction/index.ts';
import { TranslateStoryJob } from './TranslateStoryJob.ts';

interface StoryExclusion {
	ruleType: string;
	value: string;
}

/**
 * Checks if extracted metadata matches any story exclusion rule.
 */
function matchesStoryExclusion(
	metadata: ExtractedMetadata,
	exclusions: StoryExclusion[]
): StoryExclusion | null {
	for (const exclusion of exclusions) {
		if (exclusion.ruleType === 'og_type') {
			if (metadata.ogType?.toLowerCase() === exclusion.value.toLowerCase()) {
				return exclusion;
			}
		} else if (exclusion.ruleType === 'json_ld_type') {
			const hasMatch = metadata.jsonLdTypes.some(
				(t) => t.toLowerCase() === exclusion.value.toLowerCase()
			);
			if (hasMatch) {
				return exclusion;
			}
		}
	}
	return null;
}

export class PollFeedJob extends Job {
	async run(feedId: string) {
		// 1. Fetch feed with publisher -> language relation and all exclusions
		const feed = await prisma.feed.findUnique({
			where: { id: feedId },
			include: {
				publisher: { include: { language: true } },
				categoryExclusions: true,
				storyExclusions: true
			}
		});

		if (!feed) {
			throw new Error(`Feed not found: ${feedId}`);
		}

		if (!feed.active) {
			return { skipped: true, reason: 'Feed inactive' };
		}

		// Log exclusion counts for debugging
		console.log(
			`[PollFeedJob] Feed ${feed.name}: ${feed.categoryExclusions.length} category exclusions, ${feed.storyExclusions.length} story exclusions`
		);

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

			// 5. Filter out entries with excluded categories (case-insensitive)
			const excludedCategories = new Set(
				feed.categoryExclusions.map((ex) => ex.category.toLowerCase())
			);
			const afterCategoryFilter: FeedEntry[] = [];
			let categoryExcludedCount = 0;

			for (const entry of newEntries) {
				const hasExcludedCategory = entry.categories.some((cat) =>
					excludedCategories.has(cat.toLowerCase())
				);
				if (hasExcludedCategory) {
					categoryExcludedCount++;
					console.log(
						`[PollFeedJob] Category excluded: "${entry.title}" (categories: ${entry.categories.join(', ')})`
					);
				} else {
					afterCategoryFilter.push(entry);
				}
			}

			// 6. For remaining entries, fetch content and check story exclusions
			const createdStories = [];
			const failedStories = [];
			let storyExcludedCount = 0;

			for (const entry of afterCategoryFilter) {
				let extracted: ExtractedContent | null = null;
				let extractError: string | null = null;

				try {
					extracted = await extractFromUrl(entry.link);
				} catch (error) {
					extractError = error instanceof Error ? error.message : String(error);
					console.log(`[PollFeedJob] Extraction failed for "${entry.title}": ${extractError}`);
				}

				// Check story exclusions if extraction succeeded
				if (extracted) {
					const matchedExclusion = matchesStoryExclusion(extracted.metadata, feed.storyExclusions);

					if (matchedExclusion) {
						storyExcludedCount++;
						console.log(
							`[PollFeedJob] Story excluded: "${entry.title}" (${matchedExclusion.ruleType}=${matchedExclusion.value})`
						);
						continue; // Skip this entry entirely
					}
				}

				// Create story record
				if (extracted) {
					// Success: create with fetched content
					const story = await prisma.story.create({
						data: {
							feedId,
							guid: entry.guid,
							sourceUrl: entry.link,
							originalTitle: entry.title,
							originalContent: extracted.textContent,
							author: extracted.author,
							originalLanguage: feed.publisher.language.code,
							status: StoryStatus.FETCHED,
							publishedAt: entry.pubDate
						}
					});
					createdStories.push(story);
					// TODO: Uncomment this when we have a working translation service
					// await Sidequest.build(TranslateStoryJob).queue('stories').enqueue(story.id);
				} else {
					// Extraction failed: create with FAILED status
					const story = await prisma.story.create({
						data: {
							feedId,
							guid: entry.guid,
							sourceUrl: entry.link,
							originalTitle: entry.title,
							originalLanguage: feed.publisher.language.code,
							status: StoryStatus.FAILED,
							errorMessage: extractError,
							publishedAt: entry.pubDate
						}
					});
					failedStories.push(story);
				}
			}

			// 7. Update feed lastPolledAt, clear any previous error
			await prisma.feed.update({
				where: { id: feedId },
				data: { lastPolledAt: new Date(), lastError: null }
			});

			const totalExcluded = categoryExcludedCount + storyExcludedCount;
			console.log(
				`[PollFeedJob] Feed ${feed.name}: found ${parsed.entries.length} entries, ` +
					`${newEntries.length} new, excluded ${totalExcluded} (${categoryExcludedCount} category, ${storyExcludedCount} story), ` +
					`created ${createdStories.length} stories, ${failedStories.length} failed`
			);

			return {
				entriesFound: parsed.entries.length,
				newEntries: newEntries.length,
				categoryExcluded: categoryExcludedCount,
				storyExcluded: storyExcludedCount,
				storiesCreated: createdStories.length,
				storiesFailed: failedStories.length
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
