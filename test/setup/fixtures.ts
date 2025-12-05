import type { TransactionClient } from './db';
import {
	PublisherType,
	StoryStatus,
	TranslationStatus,
	SummaryStatus,
	ContentType
} from '$lib/server/db/models';

// Default data generators
let idCounter = 0;
function uniqueId(prefix: string): string {
	return `${prefix}-${Date.now()}-${++idCounter}`;
}

// ============================================
// Language Fixtures
// ============================================

export interface CreateLanguageOptions {
	code?: string;
	name?: string;
	name_en?: string;
}

export async function createTestLanguage(
	tx: TransactionClient,
	options: CreateLanguageOptions = {}
) {
	const code = options.code ?? uniqueId('lang');
	return tx.language.create({
		data: {
			code,
			name: options.name ?? `Test Language ${code}`,
			name_en: options.name_en ?? `Test Language EN ${code}`
		}
	});
}

// ============================================
// Publisher Fixtures
// ============================================

export interface CreatePublisherOptions {
	name?: string;
	type?: string;
	baseUrl?: string;
	languageId?: string;
	active?: boolean;
}

export async function createTestPublisher(
	tx: TransactionClient,
	options: CreatePublisherOptions = {}
) {
	// Create a language if not provided
	let languageId = options.languageId;
	if (!languageId) {
		const language = await createTestLanguage(tx);
		languageId = language.id;
	}

	const pubId = uniqueId('pub');
	return tx.publisher.create({
		data: {
			name: options.name ?? `Test Publisher ${pubId}`,
			type: options.type ?? PublisherType.PRIMARY,
			baseUrl: options.baseUrl ?? `https://${pubId}.example.com`,
			languageId,
			active: options.active ?? true
		}
	});
}

// ============================================
// Feed Fixtures
// ============================================

export interface CreateFeedOptions {
	publisherId?: string;
	name?: string;
	url?: string;
	active?: boolean;
}

export async function createTestFeed(tx: TransactionClient, options: CreateFeedOptions = {}) {
	// Create a publisher if not provided
	let publisherId = options.publisherId;
	if (!publisherId) {
		const publisher = await createTestPublisher(tx);
		publisherId = publisher.id;
	}

	const feedId = uniqueId('feed');
	return tx.feed.create({
		data: {
			publisherId,
			name: options.name ?? `Test Feed ${feedId}`,
			url: options.url ?? `https://example.com/feed/${feedId}.rss`,
			active: options.active ?? true
		}
	});
}

// ============================================
// Story Fixtures
// ============================================

export interface CreateStoryOptions {
	feedId?: string;
	guid?: string;
	sourceUrl?: string;
	originalTitle?: string;
	originalContent?: string;
	originalLanguage?: string;
	status?: string;
	contentType?: string;
	publishedAt?: Date;
	author?: string;
	imageUrl?: string;
}

export async function createTestStory(tx: TransactionClient, options: CreateStoryOptions = {}) {
	// Create a feed if not provided
	let feedId = options.feedId;
	if (!feedId) {
		const feed = await createTestFeed(tx);
		feedId = feed.id;
	}

	const storyId = uniqueId('story');
	return tx.story.create({
		data: {
			feedId,
			guid: options.guid ?? storyId,
			sourceUrl: options.sourceUrl ?? `https://example.com/article/${storyId}`,
			originalTitle: options.originalTitle ?? `Test Story Title ${storyId}`,
			originalContent:
				options.originalContent ?? `Test story content for ${storyId}. This is sample article text.`,
			originalLanguage: options.originalLanguage ?? 'en',
			status: options.status ?? StoryStatus.PENDING,
			contentType: options.contentType ?? ContentType.ARTICLE,
			publishedAt: options.publishedAt,
			author: options.author,
			imageUrl: options.imageUrl
		}
	});
}

// ============================================
// Translation Fixtures
// ============================================

export interface CreateTranslationOptions {
	storyId?: string;
	targetLanguage?: string;
	translatedTitle?: string;
	translatedContent?: string;
	status?: string;
	modelName?: string;
	tokenCount?: number;
}

export async function createTestTranslation(
	tx: TransactionClient,
	options: CreateTranslationOptions = {}
) {
	// Create a story if not provided
	let storyId = options.storyId;
	if (!storyId) {
		const story = await createTestStory(tx);
		storyId = story.id;
	}

	return tx.translation.create({
		data: {
			storyId,
			targetLanguage: options.targetLanguage ?? 'en',
			translatedTitle: options.translatedTitle ?? 'Translated Test Title',
			translatedContent: options.translatedContent ?? 'Translated test content.',
			status: options.status ?? TranslationStatus.COMPLETED,
			modelName: options.modelName ?? 'gemini-1.5-flash',
			tokenCount: options.tokenCount ?? 100,
			generatedAt: new Date()
		}
	});
}

// ============================================
// Summary Fixtures
// ============================================

export interface CreateSummaryOptions {
	storyId?: string;
	translationId?: string;
	summarizedTitle?: string;
	content?: string;
	status?: string;
	modelName?: string;
	tokenCount?: number;
}

export async function createTestSummary(tx: TransactionClient, options: CreateSummaryOptions = {}) {
	// Create a story if not provided
	let storyId = options.storyId;
	if (!storyId) {
		const story = await createTestStory(tx);
		storyId = story.id;
	}

	return tx.summary.create({
		data: {
			storyId,
			translationId: options.translationId,
			summarizedTitle: options.summarizedTitle ?? 'Test Summary Title',
			content: options.content ?? 'This is a test summary of the article content.',
			status: options.status ?? SummaryStatus.COMPLETED,
			modelName: options.modelName ?? 'gemini-1.5-flash',
			tokenCount: options.tokenCount ?? 50,
			generatedAt: new Date()
		}
	});
}

// ============================================
// Composite Fixtures (for complex test scenarios)
// ============================================

export interface CreateFullStoryPipelineOptions {
	language?: CreateLanguageOptions;
	publisher?: Omit<CreatePublisherOptions, 'languageId'>;
	feed?: Omit<CreateFeedOptions, 'publisherId'>;
	story?: Omit<CreateStoryOptions, 'feedId'>;
	translation?: Omit<CreateTranslationOptions, 'storyId'>;
	summary?: Omit<CreateSummaryOptions, 'storyId' | 'translationId'>;
}

/**
 * Creates a complete story pipeline: Language -> Publisher -> Feed -> Story -> Translation -> Summary
 */
export async function createFullStoryPipeline(
	tx: TransactionClient,
	options: CreateFullStoryPipelineOptions = {}
) {
	const language = await createTestLanguage(tx, options.language);

	const publisher = await createTestPublisher(tx, {
		...options.publisher,
		languageId: language.id
	});

	const feed = await createTestFeed(tx, {
		...options.feed,
		publisherId: publisher.id
	});

	const story = await createTestStory(tx, {
		...options.story,
		feedId: feed.id
	});

	const translation = await createTestTranslation(tx, {
		...options.translation,
		storyId: story.id
	});

	const summary = await createTestSummary(tx, {
		...options.summary,
		storyId: story.id,
		translationId: translation.id
	});

	return { language, publisher, feed, story, translation, summary };
}
