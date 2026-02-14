import { describe, it, expect } from 'vitest';
import { createContextTier, packContext, compressToFit } from '../context-engine';

describe('createContextTier', () => {
  it('should create a context tier with auto-calculated token count', () => {
    const tier = createContextTier(
      'System Prompt',
      'You are a helpful assistant.',
      100,
      '#FF0000'
    );

    expect(tier.label).toBe('System Prompt');
    expect(tier.content).toBe('You are a helpful assistant.');
    expect(tier.priority).toBe(100);
    expect(tier.color).toBe('#FF0000');
    expect(tier.tokens).toBeGreaterThan(0);
  });

  it('should handle empty content', () => {
    const tier = createContextTier('Empty', '', 50, '#000000');
    expect(tier.tokens).toBe(0);
  });
});

describe('packContext', () => {
  it('should return all tiers unchanged when under budget', () => {
    const tiers = [
      createContextTier('System', 'System prompt text', 100, '#FF0000'),
      createContextTier('Recent', 'Recent conversation text', 90, '#00FF00'),
      createContextTier('History', 'Historical context', 70, '#0000FF'),
    ];

    const totalTokens = tiers.reduce((sum, t) => sum + t.tokens, 0);
    const result = packContext(tiers, totalTokens + 100);

    expect(result.packed.length).toBe(3);
    expect(result.overflow).toBe(false);
    expect(result.totalTokens).toBe(totalTokens);
  });

  it('should sort tiers by priority (highest first)', () => {
    const tiers = [
      createContextTier('Low', 'low priority', 30, '#000000'),
      createContextTier('High', 'high priority', 100, '#FF0000'),
      createContextTier('Medium', 'medium priority', 70, '#00FF00'),
    ];

    const result = packContext(tiers, 10000);

    expect(result.packed[0].label).toBe('High');
    expect(result.packed[1].label).toBe('Medium');
    expect(result.packed[2].label).toBe('Low');
  });

  it('should trim lowest-priority tiers when over budget', () => {
    const systemTier = createContextTier('System', 'System prompt', 100, '#FF0000');
    const recentTier = createContextTier('Recent', 'Recent text here', 90, '#00FF00');
    const historyTier = createContextTier('History', 'A very long history text that should be trimmed down to fit the budget', 70, '#0000FF');

    const tiers = [systemTier, recentTier, historyTier];
    const totalTokens = systemTier.tokens + recentTier.tokens;

    // Budget only allows system + recent (history should be trimmed or removed)
    const result = packContext(tiers, totalTokens + 5);

    expect(result.packed[0].label).toBe('System');
    expect(result.packed[1].label).toBe('Recent');
    expect(result.totalTokens).toBeLessThanOrEqual(totalTokens + 5);
    expect(result.overflow).toBe(false);
  });

  it('should set overflow=true when even highest priority cannot fit', () => {
    const tier = createContextTier('System', 'Very long system prompt text that exceeds the budget', 100, '#FF0000');
    const result = packContext([tier], 5);

    expect(result.overflow).toBe(true);
    expect(result.totalTokens).toBeLessThanOrEqual(5);
  });

  it('should never trim a tier below 0 tokens', () => {
    const tiers = [
      createContextTier('High', 'High priority', 100, '#FF0000'),
      createContextTier('Low', 'Low priority', 50, '#0000FF'),
    ];

    const result = packContext(tiers, 3);

    // Should trim low priority tier completely
    const lowTier = result.packed.find(t => t.label === 'Low');
    expect(lowTier?.tokens || 0).toBeGreaterThanOrEqual(0);
  });

  it('should handle empty tiers array', () => {
    const result = packContext([], 100);
    expect(result.packed.length).toBe(0);
    expect(result.totalTokens).toBe(0);
    expect(result.overflow).toBe(false);
  });
});

describe('compressToFit', () => {
  it('should return all tiers when under budget', () => {
    const tiers = [
      createContextTier('System', 'System prompt', 100, '#FF0000'),
      createContextTier('Recent', 'Recent text', 90, '#00FF00'),
    ];

    const totalTokens = tiers.reduce((sum, t) => sum + t.tokens, 0);
    const result = compressToFit(tiers, totalTokens + 100);

    expect(result.length).toBe(2);
  });

  it('should remove entire tiers when over budget', () => {
    const systemTier = createContextTier('System', 'System prompt', 100, '#FF0000');
    const recentTier = createContextTier('Recent', 'Recent text', 90, '#00FF00');
    const historyTier = createContextTier('History', 'Historical context', 70, '#0000FF');

    const tiers = [systemTier, recentTier, historyTier];
    const budget = systemTier.tokens + recentTier.tokens;

    // Budget only allows system + recent
    const result = compressToFit(tiers, budget);

    expect(result.length).toBeLessThanOrEqual(2);
    expect(result[0].label).toBe('System');

    const totalTokens = result.reduce((sum, t) => sum + t.tokens, 0);
    expect(totalTokens).toBeLessThanOrEqual(budget);
  });

  it('should prioritize higher-priority tiers', () => {
    const lowTier = createContextTier('Low', 'Low priority content', 30, '#000000');
    const highTier = createContextTier('High', 'High priority content', 100, '#FF0000');

    const tiers = [lowTier, highTier];
    const budget = highTier.tokens + 5;

    const result = compressToFit(tiers, budget);

    // High priority should remain
    expect(result.some(t => t.label === 'High')).toBe(true);
  });

  it('should handle budget smaller than highest priority tier', () => {
    const tier = createContextTier('System', 'Long system prompt', 100, '#FF0000');
    const result = compressToFit([tier], 5);

    // Should still try to include the tier (truncated)
    const totalTokens = result.reduce((sum, t) => sum + t.tokens, 0);
    expect(totalTokens).toBeLessThanOrEqual(5);
  });
});
