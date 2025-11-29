import { query } from '$app/server';
import { z } from 'zod';
import { find } from 'feedfinder-ts';
import { prisma } from '$lib/server/db/connection';

export const findFeeds = query(z.string().url(), async (url) => {
	const feeds = await find(url, {
		timeout: 6000
	});
	return feeds;
});

export const getFeeds = query(async () => {
	const feeds = await prisma.feed.findMany({
		include: {
			publisher: true
		},
		orderBy: {
			name: 'asc'
		}
	});
	return feeds;
});
