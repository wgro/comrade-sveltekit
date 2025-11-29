import { query } from '$app/server';
import { prisma } from '$lib/server/db/connection';

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
