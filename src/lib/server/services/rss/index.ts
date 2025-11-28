import { parseFeed } from 'feedsmith';

export interface FeedEntry {
	guid: string;
	title: string;
	link: string;
	pubDate: Date | null;
}

export interface ParsedFeed {
	title: string;
	entries: FeedEntry[];
}

export class RssParseError extends Error {
	constructor(
		message: string,
		public readonly cause?: unknown
	) {
		super(message);
		this.name = 'RssParseError';
	}
}

export async function fetchAndParseFeed(url: string): Promise<ParsedFeed> {
	let response: Response;
	try {
		response = await fetch(url);
	} catch (error) {
		throw new RssParseError(`Failed to fetch feed from ${url}`, error);
	}

	if (!response.ok) {
		throw new RssParseError(`HTTP ${response.status}: Failed to fetch feed from ${url}`);
	}

	const content = await response.text();
	return parseFeedContent(content);
}

export function parseFeedContent(content: string): ParsedFeed {
	let result;
	try {
		result = parseFeed(content);
	} catch (error) {
		throw new RssParseError('Failed to parse feed content', error);
	}

	if (!result || !result.feed) {
		throw new RssParseError('Invalid feed: no feed data found');
	}

	const { feed } = result;

	const entries: FeedEntry[] = [];

	const items = 'items' in feed ? feed.items : 'entries' in feed ? feed.entries : [];

	if (items && Array.isArray(items)) {
		for (const item of items) {
			const guid = extractGuid(item);
			const title = extractTitle(item);
			const link = extractLink(item);
			const pubDate = extractPubDate(item);

			if (guid && link) {
				entries.push({
					guid,
					title: title || '',
					link,
					pubDate
				});
			}
		}
	}

	return {
		title: extractTitle(feed) || '',
		entries
	};
}

function extractGuid(item: Record<string, unknown>): string | null {
	if ('guid' in item) {
		const guid = item.guid;
		if (typeof guid === 'string') return guid;
		if (guid && typeof guid === 'object' && 'value' in guid) {
			return String((guid as { value: unknown }).value);
		}
	}
	if ('id' in item && typeof item.id === 'string') return item.id;
	if ('link' in item && typeof item.link === 'string') return item.link;
	return null;
}

function extractTitle(item: Record<string, unknown>): string | null {
	if ('title' in item) {
		const title = item.title;
		if (typeof title === 'string') return title;
		if (title && typeof title === 'object' && 'value' in title) {
			return String((title as { value: unknown }).value);
		}
	}
	return null;
}

function extractLink(item: Record<string, unknown>): string | null {
	if ('link' in item) {
		const link = item.link;
		if (typeof link === 'string') return link;
		if (link && typeof link === 'object' && 'href' in link) {
			return String((link as { href: unknown }).href);
		}
		if (Array.isArray(link) && link.length > 0) {
			const first = link[0];
			if (typeof first === 'string') return first;
			if (first && typeof first === 'object' && 'href' in first) {
				return String((first as { href: unknown }).href);
			}
		}
	}
	return null;
}

function extractPubDate(item: Record<string, unknown>): Date | null {
	const dateFields = ['pubDate', 'published', 'updated', 'date'];

	for (const field of dateFields) {
		if (field in item) {
			const value = item[field];
			if (value instanceof Date) return value;
			if (typeof value === 'string') {
				const parsed = new Date(value);
				if (!isNaN(parsed.getTime())) return parsed;
			}
		}
	}

	return null;
}
