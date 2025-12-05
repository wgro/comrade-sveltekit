import { parseFeed } from 'feedsmith';

export interface FeedEntry {
	guid: string;
	title: string;
	link: string;
	pubDate: Date | null;
	categories: string[];
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

/**
 * Fetches an RSS/Atom feed from a URL and parses it into a structured format.
 *
 * @param url - The URL of the RSS/Atom feed to fetch
 * @returns A promise that resolves to the parsed feed data
 * @throws {RssParseError} If the fetch fails, returns a non-OK status, or parsing fails
 *
 * @example
 * ```ts
 * const feed = await fetchAndParseFeed('https://example.com/feed.xml');
 * console.log(feed.title, feed.entries.length);
 * ```
 */
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

/**
 * Parses RSS/Atom feed content from a string into a structured format.
 * Handles both RSS (items) and Atom (entries) feed formats.
 *
 * @param content - The raw XML content of the feed
 * @returns The parsed feed with title and entries
 * @throws {RssParseError} If parsing fails or the feed structure is invalid
 *
 * @remarks
 * Only entries with both a GUID and link are included in the result.
 * Missing titles default to empty strings.
 */
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
			const categories = extractCategories(item);

			if (guid && link) {
				entries.push({
					guid,
					title: title || '',
					link,
					pubDate,
					categories
				});
			}
		}
	}

	return {
		title: extractTitle(feed) || '',
		entries
	};
}

/**
 * Extracts a unique identifier (GUID) from a feed entry.
 * Tries multiple fields in order: guid, id, link.
 *
 * @param item - The feed entry object
 * @returns The extracted GUID, or null if none found
 *
 * @remarks
 * Handles both string values and objects with a 'value' property (RSS 2.0 format).
 * Falls back to using the link as GUID if no explicit identifier exists.
 */
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

/**
 * Extracts the title from a feed or feed entry.
 *
 * @param item - The feed or feed entry object
 * @returns The extracted title, or null if none found
 *
 * @remarks
 * Handles both string values and objects with a 'value' property.
 */
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

/**
 * Extracts the link URL from a feed entry.
 *
 * @param item - The feed entry object
 * @returns The extracted link URL, or null if none found
 *
 * @remarks
 * Handles multiple link formats:
 * - String values (RSS 2.0)
 * - Objects with 'href' property (Atom)
 * - Arrays of links (takes first item)
 */
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

/**
 * Extracts the publication date from a feed entry.
 * Tries multiple common date field names in order.
 *
 * @param item - The feed entry object
 * @returns The extracted date, or null if none found or invalid
 *
 * @remarks
 * Checks the following fields in order: pubDate, published, updated, date.
 * Handles both Date objects and ISO 8601 date strings.
 * Returns null for invalid date strings.
 */
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

/**
 * Extracts categories from a feed entry.
 * Handles both RSS and Atom category formats.
 *
 * @param item - The feed entry object
 * @returns An array of category strings
 *
 * @remarks
 * Handles multiple category formats:
 * - RSS: string values or objects with 'value' property
 * - Atom: objects with 'term' or 'label' property
 * - Single values or arrays of categories
 */
function extractCategories(item: Record<string, unknown>): string[] {
	const categories: string[] = [];

	if (!('category' in item) && !('categories' in item)) {
		return categories;
	}

	const rawCategories = item.category ?? item.categories;

	if (!rawCategories) {
		return categories;
	}

	const categoryList = Array.isArray(rawCategories) ? rawCategories : [rawCategories];

	for (const cat of categoryList) {
		if (typeof cat === 'string') {
			categories.push(cat);
		} else if (cat && typeof cat === 'object') {
			// RSS format: { value: "Category Name" }
			if ('value' in cat && typeof (cat as { value: unknown }).value === 'string') {
				categories.push((cat as { value: string }).value);
			}
			// Atom format: { term: "category-slug", label: "Category Name" }
			else if ('term' in cat && typeof (cat as { term: unknown }).term === 'string') {
				categories.push((cat as { term: string }).term);
			} else if ('label' in cat && typeof (cat as { label: unknown }).label === 'string') {
				categories.push((cat as { label: string }).label);
			}
		}
	}

	return categories;
}
