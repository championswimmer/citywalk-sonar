import { createPerplexity } from '@ai-sdk/perplexity';
import { generateText } from 'ai';

const perplexity = createPerplexity({
  apiKey: import.meta.env.PERPLEXITY_API_KEY,
});

export interface AIGenerationOptions {
  model: string;
  temperature?: number;
  maxTokens?: number;
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
    maxTokens: options.maxTokens || 1000,
  });

  return result.text;
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
