// Re-export Prisma types
export type { Publisher, Feed, Story, Translation, Summary } from '../generated/client';

// Type-safe constants for enum-like fields
export const PublisherType = {
	PRIMARY: 'primary',
	COMPETITOR: 'competitor'
} as const;

export const StoryStatus = {
	PENDING: 'pending',
	FETCHED: 'fetched',
	FAILED: 'failed'
} as const;

export const TranslationStatus = {
	PENDING: 'pending',
	COMPLETED: 'completed',
	FAILED: 'failed'
} as const;

export const SummaryStatus = {
	PENDING: 'pending',
	COMPLETED: 'completed',
	FAILED: 'failed'
} as const;

export const ContentType = {
	ARTICLE: 'article',
	VIDEO: 'video',
	NEWSLETTER: 'newsletter'
} as const;

export const FeedContentType = {
	TEXT: 'text'
} as const;

export const StoryExclusionRuleType = {
	OG_TYPE: 'og_type',
	JSON_LD_TYPE: 'json_ld_type'
} as const;

export const SummaryType = {
	BRIEF: 'brief',
	DETAILED: 'detailed',
	BULLETS: 'bullets'
} as const;
