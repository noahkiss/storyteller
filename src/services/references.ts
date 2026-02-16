// Auto-detection of library item mentions in text

import type { LibraryItem, LibraryReference } from '@/types';
import { escapeRegex } from './markdown';

/**
 * Detect library item references in text using word-boundary matching.
 * Filters out items with names < 3 chars to avoid false positives.
 * Returns references sorted by occurrence count descending.
 */
export function detectLibraryReferences(
  text: string,
  libraryItems: LibraryItem[]
): LibraryReference[] {
  const references: LibraryReference[] = [];

  // Filter items with names >= 3 characters to avoid false positives
  const validItems = libraryItems.filter(item => item.name.length >= 3);

  for (const item of validItems) {
    // Create word-boundary regex for this item name
    const escapedName = escapeRegex(item.name);
    const regex = new RegExp(`\\b${escapedName}\\b`, 'gi');

    // Count occurrences in the text
    const matches = text.match(regex);
    const occurrences = matches ? matches.length : 0;

    // Only include items with at least 1 occurrence
    if (occurrences > 0) {
      references.push({
        type: item.type as 'character' | 'setting',
        id: item.id,
        name: item.name,
        occurrences
      });
    }
  }

  // Sort by occurrences descending
  references.sort((a, b) => b.occurrences - a.occurrences);

  return references;
}
