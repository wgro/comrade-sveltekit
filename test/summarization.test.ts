import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { summarizeContent } from '../src/lib/server/services/summarization';

const SAMPLE_ARTICLE_PATH = join(__dirname, 'fixtures/sample-translated-article.txt');

describe('summarizeContent', () => {
	it('summarizes an article and generates a summarized title', async () => {
		// Read the sample article
		const articleContent = readFileSync(SAMPLE_ARTICLE_PATH, 'utf-8');

		// Call the summarization service
		const result = await summarizeContent({
			title: "Trump Claims Biden's Fountain Pen Signatures Are Invalid",
			content: articleContent
		});

		console.log('\n--- Summarization Result ---');
		console.log('Summarized Title:', result.summarizedTitle);
		console.log('Model:', result.modelName);
		console.log('Token Count:', result.tokenCount);
		console.log('\n--- Summary ---');
		console.log(result.summary);

		// Count words in summary
		const wordCount = result.summary.split(/\s+/).filter((word) => word.length > 0).length;
		console.log('\nWord count:', wordCount);

		// Assertions
		expect(result.summarizedTitle).toBeTruthy();
		expect(result.summary).toBeTruthy();
		expect(result.modelName).toBeTruthy();

		// Verify the summary doesn't exceed 200 words
		expect(wordCount).toBeLessThanOrEqual(200);

		// Verify the summarized title is concise (not too long)
		expect(result.summarizedTitle.length).toBeLessThan(200);

		// Verify we got metadata
		expect(result.tokenCount).toBeGreaterThan(0);
	}, 60000); // 60 second timeout for API call
});
