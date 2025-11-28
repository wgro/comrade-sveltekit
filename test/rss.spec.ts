import { describe, it, expect } from 'vitest';
import { fetchAndParseFeed, type FeedEntry } from '../src/lib/server/services/rss';

const CENTRAL_NEWSROOM_URL = 'https://www.rferl.org/api/';

describe('RSS parsing service', () => {
	describe('Central Newsroom feed', () => {
		it('should fetch and parse entries with title, link, and pubDate', async () => {
			const feed = await fetchAndParseFeed(CENTRAL_NEWSROOM_URL);

			expect(feed.entries.length).toBeGreaterThan(0);

			for (const entry of feed.entries) {
				expect(entry.title).toBeDefined();
				expect(typeof entry.title).toBe('string');
				expect(entry.title.length).toBeGreaterThan(0);

				expect(entry.link).toBeDefined();
				expect(typeof entry.link).toBe('string');
				expect(entry.link).toMatch(/^https?:\/\//);

				expect(entry.pubDate).toBeDefined();
				expect(entry.pubDate).toBeInstanceOf(Date);
				expect(entry.pubDate!.getTime()).not.toBeNaN();
			}
		});

		it('should have a feed title', async () => {
			const feed = await fetchAndParseFeed(CENTRAL_NEWSROOM_URL);

			expect(feed.title).toBeDefined();
			expect(typeof feed.title).toBe('string');
		});

		it('should have guid for each entry', async () => {
			const feed = await fetchAndParseFeed(CENTRAL_NEWSROOM_URL);

			for (const entry of feed.entries) {
				expect(entry.guid).toBeDefined();
				expect(typeof entry.guid).toBe('string');
				expect(entry.guid.length).toBeGreaterThan(0);
			}
		});
	});
});
