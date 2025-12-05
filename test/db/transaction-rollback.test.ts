import { describe, it, expect } from 'vitest';
import {
	setupTestDb,
	createTestLanguage,
	createTestPublisher,
	createTestFeed,
	createTestStory,
	createFullStoryPipeline
} from '../setup';
import { PublisherType, StoryStatus } from '$lib/server/db/models';

describe('Database Transaction Rollback', () => {
	const { getContext } = setupTestDb();

	describe('Basic CRUD operations', () => {
		it('creates a publisher with language', async () => {
			const { tx } = getContext();

			const language = await createTestLanguage(tx, {
				code: 'uk',
				name: 'Українська',
				name_en: 'Ukrainian'
			});

			const publisher = await createTestPublisher(tx, {
				name: 'Radio Svoboda',
				type: PublisherType.PRIMARY,
				baseUrl: 'https://www.radiosvoboda.org',
				languageId: language.id
			});

			expect(publisher.id).toBeDefined();
			expect(publisher.name).toBe('Radio Svoboda');
			expect(publisher.languageId).toBe(language.id);
		});

		it('finds publisher by baseUrl', async () => {
			const { tx } = getContext();

			await createTestPublisher(tx, { baseUrl: 'https://test.example.com' });

			const found = await tx.publisher.findUnique({
				where: { baseUrl: 'https://test.example.com' }
			});

			expect(found).not.toBeNull();
			expect(found?.baseUrl).toBe('https://test.example.com');
		});

		it('updates publisher active status', async () => {
			const { tx } = getContext();

			const publisher = await createTestPublisher(tx, { active: true });

			const updated = await tx.publisher.update({
				where: { id: publisher.id },
				data: { active: false }
			});

			expect(updated.active).toBe(false);
		});

		it('deletes publisher cascades to feeds', async () => {
			const { tx } = getContext();

			const publisher = await createTestPublisher(tx);
			await createTestFeed(tx, { publisherId: publisher.id });
			await createTestFeed(tx, { publisherId: publisher.id });

			// Verify feeds exist
			const feedsBefore = await tx.feed.count({
				where: { publisherId: publisher.id }
			});
			expect(feedsBefore).toBe(2);

			// Delete publisher
			await tx.publisher.delete({
				where: { id: publisher.id }
			});

			// Verify feeds are deleted (cascade)
			const feedsAfter = await tx.feed.count({
				where: { publisherId: publisher.id }
			});
			expect(feedsAfter).toBe(0);
		});
	});

	describe('Test isolation (rollback proof)', () => {
		it('first test creates a publisher with specific baseUrl', async () => {
			const { tx } = getContext();

			await createTestPublisher(tx, { baseUrl: 'https://isolation-test.example.com' });

			const count = await tx.publisher.count();
			// Should only have the one we just created (plus auto-created language)
			expect(count).toBe(1);
		});

		it('second test has clean slate - previous data was rolled back', async () => {
			const { tx } = getContext();

			// The publisher from the previous test should NOT exist
			const found = await tx.publisher.findUnique({
				where: { baseUrl: 'https://isolation-test.example.com' }
			});
			expect(found).toBeNull();

			// Count should be 0 - proves rollback worked
			const count = await tx.publisher.count();
			expect(count).toBe(0);
		});

		it('third test also has clean slate', async () => {
			const { tx } = getContext();

			const languageCount = await tx.language.count();
			const publisherCount = await tx.publisher.count();
			const feedCount = await tx.feed.count();
			const storyCount = await tx.story.count();

			expect(languageCount).toBe(0);
			expect(publisherCount).toBe(0);
			expect(feedCount).toBe(0);
			expect(storyCount).toBe(0);
		});
	});

	describe('Relationship queries', () => {
		it('includes feeds in publisher query', async () => {
			const { tx } = getContext();

			const publisher = await createTestPublisher(tx);
			await createTestFeed(tx, { publisherId: publisher.id, name: 'Feed 1' });
			await createTestFeed(tx, { publisherId: publisher.id, name: 'Feed 2' });

			const result = await tx.publisher.findUnique({
				where: { id: publisher.id },
				include: {
					feeds: true,
					language: true
				}
			});

			expect(result?.feeds).toHaveLength(2);
			expect(result?.language).toBeDefined();
		});

		it('queries story with full relationship chain', async () => {
			const { tx } = getContext();

			const { story } = await createFullStoryPipeline(tx);

			const result = await tx.story.findUnique({
				where: { id: story.id },
				include: {
					feed: {
						include: {
							publisher: {
								include: { language: true }
							}
						}
					},
					translations: true,
					summaries: true
				}
			});

			expect(result).not.toBeNull();
			expect(result?.feed.publisher.language).toBeDefined();
			expect(result?.translations).toHaveLength(1);
			expect(result?.summaries).toHaveLength(1);
		});
	});

	describe('Full pipeline fixture', () => {
		it('creates complete story pipeline', async () => {
			const { tx } = getContext();

			const pipeline = await createFullStoryPipeline(tx, {
				story: { originalTitle: 'Breaking News' },
				translation: { translatedTitle: 'Breaking News (EN)' },
				summary: { content: 'Brief summary of the news.' }
			});

			expect(pipeline.language).toBeDefined();
			expect(pipeline.publisher).toBeDefined();
			expect(pipeline.feed).toBeDefined();
			expect(pipeline.story.originalTitle).toBe('Breaking News');
			expect(pipeline.translation.translatedTitle).toBe('Breaking News (EN)');
			expect(pipeline.summary.content).toBe('Brief summary of the news.');
		});

		it('updates story status through pipeline', async () => {
			const { tx } = getContext();

			const story = await createTestStory(tx, { status: StoryStatus.PENDING });

			const updated = await tx.story.update({
				where: { id: story.id },
				data: { status: StoryStatus.FETCHED }
			});

			expect(updated.status).toBe(StoryStatus.FETCHED);
		});
	});

	describe('Unique constraint handling', () => {
		it('handles unique constraint on feedId + guid', async () => {
			const { tx } = getContext();

			const story = await createTestStory(tx, { guid: 'unique-guid-123' });

			// Attempting to create another story with same feedId + guid should fail
			await expect(
				tx.story.create({
					data: {
						feedId: story.feedId,
						guid: 'unique-guid-123',
						sourceUrl: 'https://example.com/different',
						originalTitle: 'Different Title',
						originalLanguage: 'en'
					}
				})
			).rejects.toThrow();
		});
	});
});
