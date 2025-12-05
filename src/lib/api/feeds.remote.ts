import { query, form } from '$app/server';
import { z } from 'zod';
import { find } from 'feedfinder-ts';
import { prisma } from '$lib/server/db/connection';
import { Sidequest } from 'sidequest';
import { PollFeedJob } from '../../../worker/jobs/PollFeedJob';

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

export const getFeedCategoryExclusions = query(z.string(), async (feedId) => {
	const exclusions = await prisma.feedCategoryExclusion.findMany({
		where: { feedId },
		select: { category: true }
	});
	return exclusions.map((e) => e.category);
});

export const getFeedStoryExclusions = query(z.string(), async (feedId) => {
	return await prisma.feedStoryExclusion.findMany({
		where: { feedId, active: true },
		select: { id: true, ruleType: true, value: true, description: true }
	});
});

export const getFeed = query(z.string(), async (id) => {
	return await prisma.feed.findUnique({
		where: { id },
		include: {
			publisher: { include: { language: true } },
			categoryExclusions: { orderBy: { category: 'asc' } },
			storyExclusions: { orderBy: { createdAt: 'asc' } },
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

export const addFeedCategoryExclusion = form(
	z.object({
		feedId: z.string(),
		category: z.string().min(1, 'Category is required')
	}),
	async (data) => {
		await prisma.feedCategoryExclusion.create({
			data: {
				feedId: data.feedId,
				category: data.category.trim()
			}
		});
		await getFeed(data.feedId).refresh();
	}
);

export const removeFeedCategoryExclusion = form(
	z.object({
		id: z.string()
	}),
	async (data) => {
		const exclusion = await prisma.feedCategoryExclusion.delete({
			where: { id: data.id }
		});
		await getFeed(exclusion.feedId).refresh();
	}
);

export const addFeedStoryExclusion = form(
	z.object({
		feedId: z.string(),
		ruleType: z.enum(['og_type', 'json_ld_type']),
		value: z.string().min(1, 'Value is required'),
		description: z.string().optional()
	}),
	async (data) => {
		await prisma.feedStoryExclusion.create({
			data: {
				feedId: data.feedId,
				ruleType: data.ruleType,
				value: data.value.trim(),
				description: data.description?.trim() || null
			}
		});
		await getFeed(data.feedId).refresh();
	}
);

export const removeFeedStoryExclusion = form(
	z.object({
		id: z.string()
	}),
	async (data) => {
		const exclusion = await prisma.feedStoryExclusion.delete({
			where: { id: data.id }
		});
		await getFeed(exclusion.feedId).refresh();
	}
);

export const requeueFeed = query(z.string(), async (feedId) => {
	const feed = await prisma.feed.findUnique({
		where: { id: feedId },
		select: { id: true, name: true }
	});
	if (!feed) {
		throw new Error(`Feed not found: ${feedId}`);
	}
	await Sidequest.build(PollFeedJob).enqueue(feedId);
	return { success: true, feedName: feed.name };
});

export type GetFeedResult = Awaited<ReturnType<typeof getFeed>>;
export type FeedType = GetFeedResult extends { type: infer T } ? T : string;
export type FeedDetail = NonNullable<GetFeedResult> & {
	type: FeedType;
	publisher: {
		id: string;
		name: string;
		type: string;
		baseUrl: string;
		active: boolean;
		language: {
			id: string;
			code: string;
			name: string;
			name_en: string;
		} | null;
	};
	categoryExclusions: Array<{
		id: string;
		category: string;
	}>;
	storyExclusions: Array<{
		id: string;
		ruleType: string;
		value: string;
		description: string | null;
		active: boolean;
	}>;
	_count: {
		stories: number;
	};
};
export type FeedCategoryExclusion = FeedDetail['categoryExclusions'][number];
export type FeedStoryExclusion = FeedDetail['storyExclusions'][number];
