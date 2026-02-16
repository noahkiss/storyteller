import { detectMarkers, replaceMarker } from './markdown';
import type { LibraryItem, AIMarker } from '@/types';

export interface MarkerProcessingResult {
  processed: string;
  resolvedCount: number;
  changes: Array<{ marker: string; replacement: string }>;
}

export interface MarkerChange {
  marker: string;
  replacement: string;
}

/**
 * Process all markers in the content.
 * Resolves character/setting/ref markers by looking up library items,
 * and expand/instruct markers by calling the LLM.
 *
 * Processing order: REVERSE (end to start) to preserve positions as content changes.
 *
 * Note: This function does NOT create version points. The caller is responsible
 * for creating a version point before processing and after processing.
 */
export async function processAllMarkers(
  content: string,
  libraryItems: LibraryItem[],
  llmGenerate: (prompt: string) => Promise<string>
): Promise<MarkerProcessingResult> {
  const markers = detectMarkers(content);
  if (markers.length === 0) {
    return { processed: content, resolvedCount: 0, changes: [] };
  }

  // Process markers in reverse order to preserve positions
  const reversedMarkers = [...markers].reverse();
  const changes: MarkerChange[] = [];
  let processed = content;

  for (const marker of reversedMarkers) {
    // Cast to AIMarker (detectMarkers returns generic type)
    const typedMarker = marker as AIMarker;
    const replacement = await resolveMarker(typedMarker, libraryItems, llmGenerate, processed);
    const markerText = content.slice(marker.start, marker.end);

    changes.push({
      marker: markerText,
      replacement,
    });

    processed = replaceMarker(
      processed,
      { start: marker.start, end: marker.end },
      replacement
    );
  }

  // Reverse changes array to show in document order
  changes.reverse();

  return {
    processed,
    resolvedCount: markers.length,
    changes,
  };
}

/**
 * Resolve a single marker to its replacement content
 */
async function resolveMarker(
  marker: AIMarker,
  libraryItems: LibraryItem[],
  llmGenerate: (prompt: string) => Promise<string>,
  fullContent: string
): Promise<string> {
  switch (marker.type) {
    case 'character':
      return resolveLibraryReference(marker.value, 'character', libraryItems);

    case 'setting':
      return resolveLibraryReference(marker.value, 'setting', libraryItems);

    case 'ref':
      return resolveLibraryReference(marker.value, null, libraryItems);

    case 'expand':
      return await resolveExpand(marker, llmGenerate, fullContent);

    case 'instruct':
      return await resolveInstruct(marker, llmGenerate, fullContent);

    default:
      return `[Unknown marker type: ${marker.type}]`;
  }
}

/**
 * Resolve character/setting/ref markers by looking up in library
 */
function resolveLibraryReference(
  name: string,
  type: 'character' | 'setting' | null,
  libraryItems: LibraryItem[]
): string {
  // Filter by type if specified, otherwise search all
  const candidates = type
    ? libraryItems.filter((item) => item.type === type)
    : libraryItems;

  // Case-insensitive name match
  const item = candidates.find(
    (item) => item.name.toLowerCase() === name.toLowerCase()
  );

  if (!item) {
    const typeLabel = type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Item';
    return `[${typeLabel} not found: ${name}]`;
  }

  return item.content;
}

/**
 * Resolve expand marker by calling LLM with surrounding context
 */
async function resolveExpand(
  marker: AIMarker,
  llmGenerate: (prompt: string) => Promise<string>,
  fullContent: string
): Promise<string> {
  // Extract surrounding context (100 chars before/after)
  const contextBefore = fullContent.slice(Math.max(0, marker.start - 100), marker.start);
  const contextAfter = fullContent.slice(marker.end, Math.min(fullContent.length, marker.end + 100));

  const prompt = `Expand the following into a detailed paragraph: "${marker.value}".

Write in the style of the surrounding context.

Context before: ${contextBefore}
Context after: ${contextAfter}

Write only the expanded content, no commentary.`;

  try {
    return await llmGenerate(prompt);
  } catch (error) {
    console.error('Error resolving expand marker:', error);
    return `[Expand failed: ${error instanceof Error ? error.message : 'Unknown error'}]`;
  }
}

/**
 * Resolve instruct marker by calling LLM with instruction and surrounding context
 */
async function resolveInstruct(
  marker: AIMarker,
  llmGenerate: (prompt: string) => Promise<string>,
  fullContent: string
): Promise<string> {
  // Extract surrounding context (200 chars before/after)
  const contextBefore = fullContent.slice(Math.max(0, marker.start - 200), marker.start);
  const contextAfter = fullContent.slice(marker.end, Math.min(fullContent.length, marker.end + 200));

  const prompt = `Follow this instruction: ${marker.value}

Context before: ${contextBefore}
Context after: ${contextAfter}

Write only the content that follows the instruction, no commentary.`;

  try {
    return await llmGenerate(prompt);
  } catch (error) {
    console.error('Error resolving instruct marker:', error);
    return `[Instruction failed: ${error instanceof Error ? error.message : 'Unknown error'}]`;
  }
}
