import { Job, logger } from 'sidequest';
import { prisma } from '../../src/lib/server/db/connection.ts';
import { fetchAndParseFeed, type FeedEntry } from '../../src/lib/server/services/rss/index.ts';
import { StoryStatus } from '../../src/lib/server/db/models/index.ts';
import {
	extractFromUrl,
	type ExtractedContent,
	type ExtractedMetadata
} from '../../src/lib/server/services/extraction/index.ts';

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
		const log = logger('PollFeedJob');

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

		log.debug('Starting feed poll', {
			feedId,
			feedName: feed.name,
			categoryExclusions: feed.categoryExclusions.length,
			storyExclusions: feed.storyExclusions.length
		});

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
					log.debug('Category excluded', {
						title: entry.title,
						categories: entry.categories
					});
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
					// Rate limit: wait 5 seconds between extractions
					await new Promise((resolve) => setTimeout(resolve, 1000));
				} catch (error) {
					extractError = error instanceof Error ? error.message : String(error);
					log.warn('Extraction failed', {
						title: entry.title,
						url: entry.link,
						error: extractError
					});
				}

				// Check story exclusions if extraction succeeded
				if (extracted) {
					const matchedExclusion = matchesStoryExclusion(extracted.metadata, feed.storyExclusions);

					if (matchedExclusion) {
						storyExcludedCount++;
						log.debug('Story excluded', {
							title: entry.title,
							ruleType: matchedExclusion.ruleType,
							ruleValue: matchedExclusion.value
						});
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
					log.info('Story created', {
						storyId: story.id,
						title: story.originalTitle,
						status: story.status
					});
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
					log.warn('Story created with failed status', {
						storyId: story.id,
						title: story.originalTitle,
						status: story.status,
						error: extractError
					});
				}
			}

			// 7. Update feed lastPolledAt, clear any previous error
			await prisma.feed.update({
				where: { id: feedId },
				data: { lastPolledAt: new Date(), lastError: null }
			});

			log.info('Feed poll completed', {
				feedId,
				feedName: feed.name,
				entriesFound: parsed.entries.length,
				newEntries: newEntries.length,
				categoryExcluded: categoryExcludedCount,
				storyExcluded: storyExcludedCount,
				storiesCreated: createdStories.length,
				storiesFailed: failedStories.length
			});

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
