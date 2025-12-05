import { query, form } from '$app/server';
import { z } from 'zod';
import { prisma } from '$lib/server/db/connection';
import { extractFromUrl } from '$lib/server/services/extraction';

export const extractStory = query(z.string().url(), async (url) => {
	const extracted = await extractFromUrl(url);
	return extracted;
});

export const getStories = query(async () => {
	const stories = await prisma.story.findMany({
		include: {
			feed: {
				include: {
					publisher: true
				}
			}
		},
		orderBy: {
			createdAt: 'desc'
		},
		take: 100
	});
	return stories;
});

export const deleteAllStories = form(z.object({}), async () => {
	await prisma.story.deleteMany();
	await getStories().refresh();
});
