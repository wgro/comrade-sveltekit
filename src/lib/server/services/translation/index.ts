import { generateText, LlmError } from '../llm';

/**
 * Custom error class for translation-related failures.
 */
export class TranslationError extends Error {
	constructor(
		message: string,
		public readonly cause?: unknown
	) {
		super(message);
		this.name = 'TranslationError';
	}
}

/**
 * Input for the translation service.
 */
export interface TranslationInput {
	/** The article title to translate */
	title: string;
	/** The article content to translate (plain text) */
	content: string;
	/** Source language name (e.g., 'Ukrainian', 'Russian') */
	sourceLanguage: string;
	/** Target language code (defaults to 'en') */
	targetLanguage?: string;
}

/**
 * Result from the translation service.
 */
export interface TranslationResult {
	/** Translated title */
	translatedTitle: string;
	/** Translated content in markdown format */
	translatedContent: string;
	/** The model name used for translation */
	modelName: string;
	/** Total token count (input + output), or null if not available */
	tokenCount: number | null;
}

const TITLE_DELIMITER = '---TITLE---';
const CONTENT_DELIMITER = '---CONTENT---';

/**
 * Builds the translation prompt for the LLM.
 */
function buildPrompt(input: TranslationInput): string {
	const targetLang = input.targetLanguage ?? 'English';

	return `You are a professional translator. Translate the following news article from ${input.sourceLanguage} to ${targetLang}.

Instructions:
- Translate accurately while preserving the original meaning and tone
- Format the translated content as clean markdown
- Use appropriate markdown formatting (paragraphs, headers if present, lists, etc.)
- Do not add any commentary or notes

Return your translation in this exact format:
${TITLE_DELIMITER}
[translated title here]
${CONTENT_DELIMITER}
[translated content in markdown here]

Original article:

Title: ${input.title}

Content:
${input.content}`;
}

/**
 * Parses the LLM response to extract translated title and content.
 *
 * @param response - The raw LLM response text
 * @returns Object containing translatedTitle and translatedContent
 * @throws {TranslationError} If the response format is invalid
 */
function parseResponse(response: string): { translatedTitle: string; translatedContent: string } {
	const titleIndex = response.indexOf(TITLE_DELIMITER);
	const contentIndex = response.indexOf(CONTENT_DELIMITER);

	if (titleIndex === -1 || contentIndex === -1) {
		throw new TranslationError('Invalid response format: missing delimiters');
	}

	const titleStart = titleIndex + TITLE_DELIMITER.length;
	const translatedTitle = response.slice(titleStart, contentIndex).trim();

	const contentStart = contentIndex + CONTENT_DELIMITER.length;
	const translatedContent = response.slice(contentStart).trim();

	if (!translatedTitle) {
		throw new TranslationError('Invalid response format: empty title');
	}

	if (!translatedContent) {
		throw new TranslationError('Invalid response format: empty content');
	}

	return { translatedTitle, translatedContent };
}

/**
 * Translates article content from one language to another using Google Gemini.
 *
 * @param input - The translation input containing title, content, and language info
 * @returns A promise that resolves to the translation result with metadata
 * @throws {TranslationError} If translation fails or response parsing fails
 *
 * @example
 * ```ts
 * const result = await translateContent({
 *   title: 'Заголовок статті',
 *   content: 'Зміст статті українською мовою...',
 *   sourceLanguage: 'Ukrainian'
 * });
 * console.log(result.translatedTitle);
 * console.log(result.translatedContent);
 * ```
 */
export async function translateContent(input: TranslationInput): Promise<TranslationResult> {
	const prompt = buildPrompt(input);

	try {
		const response = await generateText(prompt, {
			temperature: 0.3, // Lower temperature for accurate translation
			maxOutputTokens: 8192 // Allow for long articles
		});

		const { translatedTitle, translatedContent } = parseResponse(response.text);

		return {
			translatedTitle,
			translatedContent,
			modelName: response.modelName,
			tokenCount: response.tokenCount
		};
	} catch (error) {
		if (error instanceof TranslationError) {
			throw error;
		}
		if (error instanceof LlmError) {
			throw new TranslationError(`LLM error during translation: ${error.message}`, error);
		}
		throw new TranslationError(
			`Translation failed: ${error instanceof Error ? error.message : String(error)}`,
			error
		);
	}
}
