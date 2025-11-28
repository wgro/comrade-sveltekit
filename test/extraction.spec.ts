import { describe, it, expect } from 'vitest';
import {
	extractFromUrl,
	extractFromHtml,
	ExtractionError
} from '../src/lib/server/services/extraction';

const TEST_ARTICLE_URL =
	'https://www.rferl.org/a/ukraine-corruption-nabu-search-yermak-office/33607673.html';

describe('Content extraction service', () => {
	describe('extractFromUrl', () => {
		it('should extract title from RFE/RL article', async () => {
			const content = await extractFromUrl(TEST_ARTICLE_URL);

			expect(content.title).toBeDefined();
			expect(typeof content.title).toBe('string');
			expect(content.title.length).toBeGreaterThan(0);
			expect(content.title.toLowerCase()).toContain('yermak');
		});

		it('should extract article content', async () => {
			const content = await extractFromUrl(TEST_ARTICLE_URL);

			expect(content.content).toBeDefined();
			expect(typeof content.content).toBe('string');
			expect(content.content.length).toBeGreaterThan(100);
		});

		it('should extract plain text content', async () => {
			const content = await extractFromUrl(TEST_ARTICLE_URL);

			expect(content.textContent).toBeDefined();
			expect(typeof content.textContent).toBe('string');
			expect(content.textContent.length).toBeGreaterThan(100);
			// textContent should not contain HTML tags
			expect(content.textContent).not.toMatch(/<[^>]+>/);
		});

		it('should have content length', async () => {
			const content = await extractFromUrl(TEST_ARTICLE_URL);

			expect(content.length).toBeDefined();
			expect(typeof content.length).toBe('number');
			expect(content.length).toBeGreaterThan(0);
		});

		it('should throw ExtractionError for invalid URL', async () => {
			await expect(extractFromUrl('https://invalid.example.test/404')).rejects.toThrow(
				ExtractionError
			);
		});
	});

	describe('extractFromHtml', () => {
		it('should extract content from raw HTML', () => {
			const html = `
				<!DOCTYPE html>
				<html>
				<head><title>Test Article</title></head>
				<body>
					<article>
						<h1>Test Headline</h1>
						<p>This is the first paragraph of the article content.</p>
						<p>This is the second paragraph with more details.</p>
					</article>
				</body>
				</html>
			`;

			const content = extractFromHtml(html, 'https://example.com/test');

			expect(content.title).toBe('Test Article');
			expect(content.textContent).toContain('first paragraph');
			expect(content.textContent).toContain('second paragraph');
		});

		it('should throw ExtractionError for empty content', () => {
			const html = `
				<!DOCTYPE html>
				<html>
				<head><title>Empty Page</title></head>
				<body></body>
				</html>
			`;

			expect(() => extractFromHtml(html, 'https://example.com/empty')).toThrow(ExtractionError);
		});

		it('should handle excerpt extraction', () => {
			const html = `
				<!DOCTYPE html>
				<html>
				<head>
					<title>Article With Meta</title>
					<meta name="description" content="This is the article excerpt.">
				</head>
				<body>
					<article>
						<h1>Main Headline</h1>
						<p>Article body content here with enough text to be considered readable content by the Readability algorithm.</p>
						<p>More content to ensure extraction works properly.</p>
					</article>
				</body>
				</html>
			`;

			const content = extractFromHtml(html, 'https://example.com/meta');

			expect(content.title).toBeDefined();
			expect(content.content).toBeDefined();
		});
	});
});
