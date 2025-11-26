import { query } from '$app/server';
import { z } from 'zod';
import { find } from 'feedfinder-ts';

export const findFeeds = query(z.string().url(), async (url) => {
	const feeds = await find(url, {
		timeout: 6000
	});
	return feeds;
});
