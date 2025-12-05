import { query, form } from '$app/server';
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

export const getFeed = query(z.string(), async (id) => {
	return await prisma.feed.findUnique({
		where: { id },
		include: {
			publisher: { include: { language: true } },
			exclusions: { orderBy: { category: 'asc' } },
			_count: { select: { stories: true } }
		}
	});
});

export const updateFeed = form(
	z.object({
		id: z.string(),
		name: z.string().min(1, 'Name is required'),
		url: z.string().url('Must be a valid URL'),
		type: z.enum(['rss']),
		active: z.boolean().optional().default(false)
	}),
	async (data) => {
		const { id, ...updateData } = data;
		await prisma.feed.update({
			where: { id },
			data: updateData
		});
		await getFeed(id).refresh();
	}
);

export const addFeedExclusion = form(
	z.object({
		feedId: z.string(),
		category: z.string().min(1, 'Category is required')
	}),
	async (data) => {
		await prisma.feedExclusion.create({
			data: {
				feedId: data.feedId,
				category: data.category.trim()
			}
		});
		await getFeed(data.feedId).refresh();
	}
);

export const removeFeedExclusion = form(
	z.object({
		id: z.string()
	}),
	async (data) => {
		const exclusion = await prisma.feedExclusion.delete({
			where: { id: data.id }
		});
		await getFeed(exclusion.feedId).refresh();
	}
);

export type GetFeedResult = Awaited<ReturnType<typeof getFeed>>;
export type FeedDetail = NonNullable<GetFeedResult>;
export type FeedExclusion = FeedDetail['exclusions'][number];
