import { generateStructuredContent, LlmError, Type, type Schema } from '../llm';

/**
 * Custom error class for summarization-related failures.
 */
export class SummarizationError extends Error {
	constructor(
		message: string,
		public readonly cause?: unknown
	) {
		super(message);
		this.name = 'SummarizationError';
	}
}

/**
 * Input for the summarization service.
 */
export interface SummarizationInput {
	/** The article title (already in English) */
	title: string;
	/** The article content to summarize (already in English) */
	content: string;
}

/**
 * Result from the summarization service.
 */
export interface SummarizationResult {
	/** Summarized title */
	summarizedTitle: string;
	/** Summary of the content (max 200 words) */
	summary: string;
	/** The model name used for summarization */
	modelName: string;
	/** Total token count (input + output), or null if not available */
	tokenCount: number | null;
}

/**
 * Internal type for the structured response from the LLM.
 */
interface SummaryResponse {
	summarizedTitle: string;
	summary: string;
}

/**
 * JSON schema for the summarization response.
 */
const SUMMARY_SCHEMA: Schema = {
	type: Type.OBJECT,
	properties: {
		summarizedTitle: {
			type: Type.STRING,
			description: 'A concise, engaging title that captures the essence of the article'
		},
		summary: {
			type: Type.STRING,
			description: 'A factual summary of the article content, maximum 200 words'
		}
	},
	required: ['summarizedTitle', 'summary'],
	propertyOrdering: ['summarizedTitle', 'summary']
};

/**
 * Builds the summarization prompt for the LLM.
 */
function buildPrompt(input: SummarizationInput): string {
	return `You are a professional news editor. Create a concise summary of the following news article.

Instructions:
- Generate a summarized title that is concise and captures the main point
- Write a factual, objective summary of the article content
- The summary must not exceed 200 words
- Focus on the key facts: who, what, when, where, why
- Maintain a neutral, journalistic tone
- Do not add opinions or commentary

Article Title: ${input.title}

Article Content:
${input.content}`;
}

/**
 * Summarizes article content using Google Gemini with structured output.
 *
 * @param input - The summarization input containing title and content
 * @returns A promise that resolves to the summarization result with metadata
 * @throws {SummarizationError} If summarization fails
 *
 * @example
 * ```ts
 * const result = await summarizeContent({
 *   title: 'Major Climate Summit Reaches Historic Agreement',
 *   content: 'World leaders gathered in Geneva today to finalize...'
 * });
 * console.log(result.summarizedTitle);
 * console.log(result.summary);
 * ```
 */
export async function summarizeContent(input: SummarizationInput): Promise<SummarizationResult> {
	const prompt = buildPrompt(input);

	try {
		const response = await generateStructuredContent<SummaryResponse>(prompt, SUMMARY_SCHEMA, {
			temperature: 0.3, // Lower temperature for factual accuracy
			maxOutputTokens: 1024 // Sufficient for 200-word summary + title
		});

		return {
			summarizedTitle: response.data.summarizedTitle,
			summary: response.data.summary,
			modelName: response.modelName,
			tokenCount: response.tokenCount
		};
	} catch (error) {
		if (error instanceof SummarizationError) {
			throw error;
		}
		if (error instanceof LlmError) {
			throw new SummarizationError(`LLM error during summarization: ${error.message}`, error);
		}
		throw new SummarizationError(
			`Summarization failed: ${error instanceof Error ? error.message : String(error)}`,
			error
		);
	}
}
