import { describe, it, expect } from 'vitest';
import { extractFromUrl } from '../src/lib/server/services/extraction';
import { translateContent } from '../src/lib/server/services/translation/index';

const UKRAINIAN_ARTICLE_URL =
	'https://www.radiosvoboda.org/a/news-tramp-ukazy-baydena-skasuvannya/33608172.html';

describe('translateContent', () => {
	it('translates Ukrainian article to English', async () => {
		// Step 1: Extract article content from URL
		const extracted = await extractFromUrl(UKRAINIAN_ARTICLE_URL);

		console.log('\n--- Original Article ---');
		console.log('Title:', extracted.title);
		console.log('Content length:', extracted.textContent.length, 'characters');

		// Step 2: Translate the content
		const result = await translateContent({
			title: extracted.title,
			content: extracted.textContent,
			sourceLanguage: 'Ukrainian'
		});

		console.log('\n--- Translation Result ---');
		console.log('Translated Title:', result.translatedTitle);
		console.log('Model:', result.modelName);
		console.log('Token Count:', result.tokenCount);
		console.log('\n--- Translated Content ---');
		console.log(result.translatedContent);

		// Assertions
		expect(result.translatedTitle).toBeTruthy();
		expect(result.translatedContent).toBeTruthy();
		expect(result.modelName).toBeTruthy();

		// Check that the output is in English (no Cyrillic characters)
		const cyrillicRegex = /[\u0400-\u04FF]/;
		expect(cyrillicRegex.test(result.translatedTitle)).toBe(false);
		expect(cyrillicRegex.test(result.translatedContent)).toBe(false);

		// Check for markdown formatting (at least paragraphs)
		expect(result.translatedContent.includes('\n')).toBe(true);
	}, 60000); // 60 second timeout for API call
});
