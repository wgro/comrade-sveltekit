import { Job, Sidequest } from 'sidequest';
import { prisma } from '../../src/lib/server/db/connection.ts';
import { extractFromUrl, type ExtractedContent } from '../../src/lib/server/services/extraction/index.ts';
import { StoryStatus } from '../../src/lib/server/db/models/index.ts';
import { TranslateStoryJob } from './TranslateStoryJob.ts';

interface FetchStoryOptions {
	preview?: boolean;
}

interface FetchStoryResult {
	storyId?: string;
	url: string;
	extracted: ExtractedContent;
	saved: boolean;
}

export class FetchStoryJob extends Job {
	/**
	 * Fetch and extract content from a story URL.
	 *
	 * @param storyIdOrUrl - Either a story ID or a raw URL to extract
	 * @param options - { preview: true } to skip DB operations
	 */
	async run(storyIdOrUrl: string, options: FetchStoryOptions = {}): Promise<FetchStoryResult> {
		const { preview = false } = options;
		const isUrl = storyIdOrUrl.startsWith('http://') || storyIdOrUrl.startsWith('https://');

		let url: string;
		let storyId: string | undefined;

		if (isUrl) {
			url = storyIdOrUrl;
		} else {
			storyId = storyIdOrUrl;
			const story = await prisma.story.findUnique({ where: { id: storyId } });
			if (!story) throw new Error(`Story not found: ${storyId}`);
			url = story.sourceUrl;
		}

		const extracted = await extractFromUrl(url);
		console.log(
			`[FetchStoryJob] Extracted from ${url}: "${extracted.title}" (${extracted.length} chars)`
		);

		// Preview mode or raw URL: return without saving
		if (preview || isUrl) {
			return { storyId, url, extracted, saved: false };
		}

		// Normal mode: update story and enqueue next job
		try {
			await prisma.story.update({
				where: { id: storyId },
				data: {
					originalContent: extracted.textContent,
					author: extracted.author,
					status: StoryStatus.FETCHED
				}
			});

			await Sidequest.build(TranslateStoryJob).enqueue(storyId!);

			return { storyId, url, extracted, saved: true };
		} catch (error) {
			const errorMsg = error instanceof Error ? error.message : String(error);
			await prisma.story.update({
				where: { id: storyId },
				data: { status: StoryStatus.FAILED, errorMessage: errorMsg }
			});
			throw error;
		}
	}
}
