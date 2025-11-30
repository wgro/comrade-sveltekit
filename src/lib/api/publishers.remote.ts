import { query } from '$app/server';
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
