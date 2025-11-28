import { GoogleGenAI } from '@google/genai';

/**
 * Custom error class for LLM-related failures.
 */
export class LlmError extends Error {
	constructor(
		message: string,
		public readonly cause?: unknown
	) {
		super(message);
		this.name = 'LlmError';
	}
}

/**
 * Response from text generation with metadata.
 */
export interface LlmResponse {
	/** The generated text content */
	text: string;
	/** Total token count (input + output), or null if not available */
	tokenCount: number | null;
	/** The model name used for generation */
	modelName: string;
	/** The reason generation stopped, or null if not available */
	finishReason: string | null;
}

/**
 * Configuration options for text generation.
 */
export interface LlmConfig {
	/** Model to use (defaults to gemini-2.5-flash-lite) */
	model?: string;
	/** Maximum tokens in the response */
	maxOutputTokens?: number;
	/** Temperature for generation (0-2, higher = more creative) */
	temperature?: number;
	/** Maximum retry attempts for transient failures */
	maxRetries?: number;
}

const DEFAULT_MODEL = 'gemini-2.5-flash-lite';
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_RETRY_DELAY_MS = 1000;

let client: GoogleGenAI | null = null;

/**
 * Gets or creates the GoogleGenAI client singleton.
 *
 * @returns The GoogleGenAI client instance
 * @throws {LlmError} If GEMINI_API_KEY environment variable is not set
 */
function getClient(): GoogleGenAI {
	if (!client) {
		const apiKey = process.env.GEMINI_API_KEY;
		if (!apiKey) {
			throw new LlmError('GEMINI_API_KEY environment variable is not set');
		}
		client = new GoogleGenAI({ apiKey });
	}
	return client;
}

/**
 * Determines if an error is retryable (transient network or rate limit errors).
 *
 * @param error - The error to check
 * @returns true if the error is retryable
 */
function isRetryableError(error: unknown): boolean {
	if (error instanceof Error) {
		const message = error.message.toLowerCase();
		return (
			message.includes('network') ||
			message.includes('timeout') ||
			message.includes('rate limit') ||
			message.includes('429') ||
			message.includes('503') ||
			message.includes('500')
		);
	}
	return false;
}

/**
 * Delays execution for a specified duration.
 *
 * @param ms - Milliseconds to delay
 */
function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generates text content using Google's Gemini models.
 *
 * @param prompt - The text prompt to send to the model
 * @param config - Optional configuration for the generation
 * @returns A promise that resolves to the generated response with metadata
 * @throws {LlmError} If generation fails after all retries or on non-retryable errors
 *
 * @example
 * ```ts
 * const response = await generateText('Explain quantum computing briefly');
 * console.log(response.text);
 * console.log('Tokens used:', response.tokenCount);
 * ```
 *
 * @example
 * ```ts
 * const response = await generateText('Write a poem', {
 *   model: 'gemini-2.5-flash',
 *   temperature: 0.9,
 *   maxOutputTokens: 500
 * });
 * ```
 */
export async function generateText(prompt: string, config: LlmConfig = {}): Promise<LlmResponse> {
	const ai = getClient();
	const modelName = config.model ?? DEFAULT_MODEL;
	const maxRetries = config.maxRetries ?? DEFAULT_MAX_RETRIES;

	let lastError: unknown;

	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			const response = await ai.models.generateContent({
				model: modelName,
				contents: prompt,
				config: {
					maxOutputTokens: config.maxOutputTokens,
					temperature: config.temperature
				}
			});

			const text = response.text;
			if (text === undefined || text === null) {
				throw new LlmError('No text content in response');
			}

			return {
				text,
				tokenCount: response.usageMetadata?.totalTokenCount ?? null,
				modelName,
				finishReason: response.candidates?.[0]?.finishReason ?? null
			};
		} catch (error) {
			lastError = error;

			if (error instanceof LlmError) {
				throw error;
			}

			if (!isRetryableError(error) || attempt === maxRetries) {
				throw new LlmError(`Failed to generate text: ${error instanceof Error ? error.message : String(error)}`, error);
			}

			const delayMs = DEFAULT_RETRY_DELAY_MS * Math.pow(2, attempt);
			await delay(delayMs);
		}
	}

	throw new LlmError(`Failed to generate text after ${maxRetries + 1} attempts`, lastError);
}
