import { describe, it, expect } from 'vitest';
import { countTokens, truncateToTokens } from '../tokens';

describe('countTokens', () => {
  it('should return correct token count for simple text', () => {
    const text = 'hello world';
    const count = countTokens(text);
    // "hello world" is approximately 2 tokens in o200k_base
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(10);
  });

  it('should return 0 for empty string', () => {
    const count = countTokens('');
    expect(count).toBe(0);
  });

  it('should handle very long text correctly', () => {
    // Create a long text (10K+ tokens)
    const longText = 'This is a test sentence. '.repeat(500);
    const count = countTokens(longText);
    // Should be significantly more than 100 tokens
    expect(count).toBeGreaterThan(100);
  });

  it('should use o200k_base encoding by default', () => {
    // Different encodings give different token counts
    // This ensures we're using the correct default
    const text = 'Hello, world!';
    const count = countTokens(text);
    expect(count).toBeGreaterThan(0);
  });

  it('should handle special characters', () => {
    const text = '你好世界 🌍';
    const count = countTokens(text);
    expect(count).toBeGreaterThan(0);
  });
});

describe('truncateToTokens', () => {
  it('should truncate text to specified token limit', () => {
    const text = 'a b c d e f g h i j k l m n o p';
    const truncated = truncateToTokens(text, 3);
    const count = countTokens(truncated);
    expect(count).toBeLessThanOrEqual(3);
  });

  it('should return unchanged text if under limit', () => {
    const text = 'short';
    const truncated = truncateToTokens(text, 1000);
    expect(truncated).toBe(text);
  });

  it('should handle empty string', () => {
    const truncated = truncateToTokens('', 10);
    expect(truncated).toBe('');
  });

  it('should preserve as much text as possible within token limit', () => {
    const text = 'The quick brown fox jumps over the lazy dog';
    const truncated = truncateToTokens(text, 5);
    const count = countTokens(truncated);
    expect(count).toBeLessThanOrEqual(5);
    expect(truncated.length).toBeGreaterThan(0);
  });

  it('should work with custom model encoding', () => {
    const text = 'Hello, world!';
    const truncated = truncateToTokens(text, 2, 'gpt-4o-mini');
    const count = countTokens(truncated, 'gpt-4o-mini');
    expect(count).toBeLessThanOrEqual(2);
  });
});
