import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';

export interface ExtractedMetadata {
	ogType: string | null;
	jsonLdTypes: string[];
}

export interface ExtractedContent {
	title: string;
	content: string;
	rawHtml: string;
	textContent: string;
	author: string | null;
	excerpt: string | null;
	siteName: string | null;
	length: number;
	metadata: ExtractedMetadata;
}

export class ExtractionError extends Error {
	override readonly cause?: unknown;

	constructor(message: string, cause?: unknown) {
		super(message);
		this.name = 'ExtractionError';
		this.cause = cause;
	}
}

/**
 * Extracts metadata (og:type, JSON-LD @type) from the raw HTML document.
 * Must be called before Readability processes the document, as Readability strips <head>.
 */
function extractMetadata(document: Document): ExtractedMetadata {
	// Extract og:type from <meta property="og:type" content="...">
	const ogTypeMeta = document.querySelector('meta[property="og:type"]');
	const ogType = ogTypeMeta?.getAttribute('content') || null;

	// Extract @type from all JSON-LD script blocks
	const jsonLdTypes: string[] = [];
	const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');

	for (const script of jsonLdScripts) {
		try {
			const data = JSON.parse(script.textContent || '');
			// Handle single object or array of objects
			const objects = Array.isArray(data) ? data : [data];
			for (const obj of objects) {
				if (obj['@type']) {
					// @type can be a string or array of strings
					const types = Array.isArray(obj['@type']) ? obj['@type'] : [obj['@type']];
					jsonLdTypes.push(...types);
				}
			}
		} catch {
			// Ignore malformed JSON-LD
		}
	}

	return { ogType, jsonLdTypes };
}

/**
 * Fetches a web page and extracts the main article content.
 *
 * @param url - The URL of the page to extract content from
 * @returns A promise that resolves to the extracted content
 * @throws {ExtractionError} If the fetch fails, returns a non-OK status, or extraction fails
 *
 * @example
 * ```ts
 * const content = await extractFromUrl('https://example.com/article');
 * console.log(content.title, content.content);
 * ```
 */
export async function extractFromUrl(url: string): Promise<ExtractedContent> {
	let response: Response;
	try {
		response = await fetch(url, {
			headers: {
				'User-Agent':
					'Mozilla/5.0 (compatible; Comrade/1.0; +https://github.com/comrade)',
				Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
			}
		});
	} catch (error) {
		throw new ExtractionError(`Failed to fetch page from ${url}`, error);
	}

	if (!response.ok) {
		throw new ExtractionError(`HTTP ${response.status}: Failed to fetch page from ${url}`);
	}

	const html = await response.text();
	return extractFromHtml(html, url);
}

/**
 * Extracts the main article content from an HTML string.
 *
 * @param html - The raw HTML content of the page
 * @param url - The URL of the page (used for resolving relative links)
 * @returns The extracted content
 * @throws {ExtractionError} If parsing fails or no readable content is found
 *
 * @remarks
 * Uses Mozilla's Readability library to identify and extract the main article content,
 * similar to Firefox's Reader View functionality.
 */
export function extractFromHtml(html: string, url: string): ExtractedContent {
	let dom: JSDOM;
	try {
		dom = new JSDOM(html, { url });
	} catch (error) {
		throw new ExtractionError('Failed to parse HTML', error);
	}

	const document = dom.window.document;

	// Extract metadata BEFORE Readability processes the document
	// (Readability modifies the DOM and may remove head elements)
	const metadata = extractMetadata(document);

	const reader = new Readability(document);

	let article;
	try {
		article = reader.parse();
	} catch (error) {
		throw new ExtractionError('Readability parsing failed', error);
	}

	if (!article) {
		throw new ExtractionError('No readable content found on page');
	}

	return {
		title: article.title || '',
		content: article.content || '',
		rawHtml: html,
		textContent: article.textContent || '',
		author: article.byline || null,
		excerpt: article.excerpt || null,
		siteName: article.siteName || null,
		length: article.length || 0,
		metadata
	};
}
