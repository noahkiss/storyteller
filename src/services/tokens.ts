import { encodingForModel, Tiktoken } from 'js-tiktoken';

/**
 * Count tokens in text using BPE encoding
 * @param text - Text to count tokens for
 * @param model - Model name for encoding (defaults to gpt-4o-mini for o200k_base)
 * @returns Number of tokens
 */
export function countTokens(text: string, model: string = 'gpt-4o-mini'): number {
  if (!text) return 0;

  let encoding: Tiktoken;

  try {
    encoding = encodingForModel(model as any);
  } catch {
    // Fallback to o200k_base for unknown models
    encoding = encodingForModel('gpt-4o-mini' as any);
  }

  const tokens = encoding.encode(text).length;

  return tokens;
}

/**
 * Truncate text to fit within token limit
 * @param text - Text to truncate
 * @param maxTokens - Maximum number of tokens
 * @param model - Model name for encoding (defaults to gpt-4o-mini for o200k_base)
 * @returns Truncated text
 */
export function truncateToTokens(
  text: string,
  maxTokens: number,
  model: string = 'gpt-4o-mini'
): string {
  if (!text) return '';

  let encoding: Tiktoken;

  try {
    encoding = encodingForModel(model as any);
  } catch {
    // Fallback to o200k_base for unknown models
    encoding = encodingForModel('gpt-4o-mini' as any);
  }

  const tokens = encoding.encode(text);

  if (tokens.length <= maxTokens) {
    return text;
  }

  // Truncate to max tokens
  const truncatedTokens = tokens.slice(0, maxTokens);
  const truncatedText = encoding.decode(truncatedTokens);

  return truncatedText;
}
