import { createPerplexity } from '@ai-sdk/perplexity';
import { generateText, generateObject } from 'ai';
import { z } from 'zod';

const perplexity = createPerplexity({
  apiKey: import.meta.env.PERPLEXITY_API_KEY,
});

export interface AIGenerationOptions {
  model: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIObjectGenerationOptions<T = unknown> extends AIGenerationOptions {
  schema: z.ZodSchema<T>;
}

/**
 * Generate text using Perplexity AI with specified options
 * @param prompt - The prompt to send to the AI
 * @param options - Generation options including model, temperature, and maxTokens
 * @returns Promise with the generated text
 */
export async function generateAIText(
  prompt: string,
  options: AIGenerationOptions
): Promise<string> {
  const result = await generateText({
    model: perplexity(options.model),
    prompt: prompt,
    temperature: options.temperature || 0.3,
  });

  return result.text;
}

/**
 * Generate structured object using Perplexity AI with specified schema
 * @param prompt - The prompt to send to the AI
 * @param options - Generation options including model, temperature, maxTokens, and schema
 * @returns Promise with the generated object
 */
export async function generateAIObject<T>(
  prompt: string,
  options: AIObjectGenerationOptions<T>
): Promise<T> {
  console.log("Schema", options.schema);
  try {
    const { object } = await generateObject({
      model: perplexity(options.model),
      prompt: prompt,
      output: 'object',
      schema: options.schema,
      temperature: options.temperature || 0.3,
    });

    return object as T;
  } catch (error) {
    console.error('generateAIObject error:', error);
    console.error('Prompt was:', prompt);
    throw error;
  }
}

/**
 * Read a prompt template from a text file
 * @param filename - Name of the prompt file (e.g., 'about.txt')
 * @returns Promise with the prompt content
 */
export async function readPromptTemplate(filename: string): Promise<string> {
  try {
    const response = await fetch(`/assets/prompts/${filename}`);
    if (!response.ok) {
      throw new Error(`Failed to load prompt file: ${filename}`);
    }
    return await response.text();
  } catch (error) {
    console.error(`Error reading prompt file ${filename}:`, error);
    throw error;
  }
}

/**
 * Replace placeholders in a prompt template
 * @param template - The prompt template with placeholders
 * @param replacements - Object with placeholder values
 * @returns The processed prompt
 */
export function processPromptTemplate(template: string, replacements: Record<string, string>): string {
  let processedPrompt = template;
  Object.entries(replacements).forEach(([key, value]) => {
    processedPrompt = processedPrompt.replace(new RegExp(`{${key}}`, 'g'), value);
  });
  return processedPrompt;
}
