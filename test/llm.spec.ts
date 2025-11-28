import { describe, it, expect } from 'vitest';
import { generateText, LlmError, type LlmResponse } from '../src/lib/server/services/llm';

describe('LLM service', () => {
	describe('generateText', () => {
		it('should generate text from a simple prompt', async () => {
			const response = await generateText('What is 2+2? Answer with just the number.');

			expect(response.text).toBeDefined();
			expect(typeof response.text).toBe('string');
			expect(response.text.length).toBeGreaterThan(0);
			expect(response.text).toContain('4');
		});

		it('should return token count metadata', async () => {
			const response = await generateText('Say hello');

			expect(response.tokenCount).toBeDefined();
			expect(typeof response.tokenCount).toBe('number');
			expect(response.tokenCount).toBeGreaterThan(0);
		});

		it('should use the default model name', async () => {
			const response = await generateText('Hi');

			expect(response.modelName).toBe('gemini-2.5-flash-lite');
		});

		it('should use a custom model when specified', async () => {
			const response = await generateText('Hi', { model: 'gemini-2.5-flash' });

			expect(response.modelName).toBe('gemini-2.5-flash');
		});

		it('should return a finish reason', async () => {
			const response = await generateText('Say just the word "test"');

			expect(response.finishReason).toBeDefined();
			expect(typeof response.finishReason).toBe('string');
		});

		it('should respect maxOutputTokens config', async () => {
			const shortResponse = await generateText('Write a long story about a dragon', {
				maxOutputTokens: 20
			});

			expect(shortResponse.text.length).toBeLessThan(500);
		});
	});
});
