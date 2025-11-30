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

export const previewFeed = query(z.string().url(), async (feedUrl) => {
	const response = await fetch(feedUrl);
	if (!response.ok) {
		throw new Error(`Failed to fetch feed: HTTP ${response.status}`);
	}
	return await response.text();
});
