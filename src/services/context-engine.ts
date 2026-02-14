import { ContextTier } from '@/types';
import { countTokens, truncateToTokens } from './tokens';

/**
 * Create a context tier with auto-calculated token count
 * @param label - Display label for the tier
 * @param content - Text content of the tier
 * @param priority - Priority level (higher = more important)
 * @param color - Color for visualization
 * @returns ContextTier object
 */
export function createContextTier(
  label: string,
  content: string,
  priority: number,
  color: string
): ContextTier {
  return {
    label,
    content,
    priority,
    color,
    tokens: countTokens(content),
  };
}

/**
 * Pack context tiers into a token budget, trimming lowest-priority tiers first
 * @param tiers - Array of context tiers
 * @param maxTokens - Maximum token budget
 * @returns Object with packed tiers, total tokens, and overflow flag
 */
export function packContext(
  tiers: ContextTier[],
  maxTokens: number
): {
  packed: ContextTier[];
  totalTokens: number;
  overflow: boolean;
} {
  if (tiers.length === 0) {
    return {
      packed: [],
      totalTokens: 0,
      overflow: false,
    };
  }

  // Sort by priority (highest first)
  const sorted = [...tiers].sort((a, b) => b.priority - a.priority);

  // Calculate total tokens
  let totalTokens = sorted.reduce((sum, tier) => sum + tier.tokens, 0);

  // If under budget, return all tiers unchanged
  if (totalTokens <= maxTokens) {
    return {
      packed: sorted,
      totalTokens,
      overflow: false,
    };
  }

  // Need to trim - use greedy algorithm from highest to lowest priority
  const packed: ContextTier[] = [];
  let currentTokens = 0;
  let highestPriorityTrimmed = false;

  for (let i = 0; i < sorted.length; i++) {
    const tier = sorted[i];
    const remaining = maxTokens - currentTokens;

    if (tier.tokens <= remaining) {
      // Entire tier fits
      packed.push(tier);
      currentTokens += tier.tokens;
    } else if (remaining > 0) {
      // Truncate to fit remaining budget
      const truncatedContent = truncateToTokens(tier.content, remaining);
      const actualTokens = countTokens(truncatedContent);

      if (actualTokens > 0) {
        packed.push({
          ...tier,
          content: truncatedContent,
          tokens: actualTokens,
        });
        currentTokens += actualTokens;
      }

      // Mark if this was the highest priority tier
      if (i === 0) {
        highestPriorityTrimmed = true;
      }

      // Budget exhausted
      break;
    }
    // else: no budget left, skip this and all lower priority tiers
  }

  return {
    packed,
    totalTokens: currentTokens,
    overflow: highestPriorityTrimmed,
  };
}

/**
 * Compress context by removing entire tiers (starting from lowest priority)
 * More aggressive than packContext - removes whole tiers instead of truncating
 * @param tiers - Array of context tiers
 * @param maxTokens - Maximum token budget
 * @returns Array of tiers that fit within budget
 */
export function compressToFit(
  tiers: ContextTier[],
  maxTokens: number
): ContextTier[] {
  if (tiers.length === 0) return [];

  // Sort by priority (highest first)
  const sorted = [...tiers].sort((a, b) => b.priority - a.priority);

  const result: ContextTier[] = [];
  let currentTokens = 0;

  for (const tier of sorted) {
    if (currentTokens + tier.tokens <= maxTokens) {
      // Entire tier fits
      result.push(tier);
      currentTokens += tier.tokens;
    } else {
      // Try to fit truncated version
      const remainingBudget = maxTokens - currentTokens;
      if (remainingBudget > 0) {
        const truncatedContent = truncateToTokens(tier.content, remainingBudget);
        const actualTokens = countTokens(truncatedContent);

        if (actualTokens > 0) {
          result.push({
            ...tier,
            content: truncatedContent,
            tokens: actualTokens,
          });
          currentTokens += actualTokens;
        }
      }
      // Stop adding more tiers - budget exhausted
      break;
    }
  }

  return result;
}
