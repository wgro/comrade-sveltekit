import { query, form } from '$app/server';
import { z } from 'zod';
import { prisma } from '$lib/server/db/connection';

export const getPublishers = query(async () => {
	const publishers = await prisma.publisher.findMany({
		include: {
			language: true
		},
		orderBy: {
			name: 'asc'
		}
	});
	return publishers;
});

export const getPublisher = query(z.string(), async (id) => {
	const publisher = await prisma.publisher.findUnique({
		where: { id },
		include: {
			language: true,
			feeds: {
				orderBy: { name: 'asc' },
				include: {
					_count: {
						select: { stories: true }
					}
				}
			}
		}
	});
	return publisher;
});

export const getPublisherStories = query(z.string(), async (publisherId) => {
	const stories = await prisma.story.findMany({
		where: {
			feed: {
				publisherId
			}
		},
		orderBy: { createdAt: 'desc' },
		take: 20,
		include: {
			feed: {
				select: { name: true }
			},
			translations: {
				where: { targetLanguage: 'en' },
				take: 1
			},
			summaries: {
				take: 1
			}
		}
	});
	return stories;
});

export const getLanguages = query(async () => {
	const languages = await prisma.language.findMany({
		orderBy: { name_en: 'asc' }
	});
	return languages;
});

export const updatePublisher = form(
	z.object({
		id: z.string(),
		name: z.string().min(1, 'Name is required'),
		slug: z.string().min(1, 'Slug is required'),
		type: z.enum(['rferl', 'competitor']),
		baseUrl: z.string().url('Must be a valid URL'),
		languageId: z.string().min(1, 'Language is required'),
		active: z.boolean().optional().default(false)
	}),
	async (data) => {
		const { id, ...updateData } = data;
		await prisma.publisher.update({
			where: { id },
			data: updateData
		});
		await getPublisher(id).refresh();
	}
);

// Derived types from remote function return values
export type GetPublisherResult = Awaited<ReturnType<typeof getPublisher>>;
export type PublisherDetail = NonNullable<GetPublisherResult>;
export type FeedWithCount = PublisherDetail['feeds'][number];

export type GetPublisherStoriesResult = Awaited<ReturnType<typeof getPublisherStories>>;
export type StoryListItem = GetPublisherStoriesResult[number];

export type GetLanguagesResult = Awaited<ReturnType<typeof getLanguages>>;
export type LanguageItem = GetLanguagesResult[number];
