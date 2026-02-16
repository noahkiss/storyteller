// Three-way merge service using node-diff3
// Merges library updates into story-local versions while preserving local changes

import { diff3Merge } from 'node-diff3';
import type { MergeResult } from '@/types';

/**
 * Perform three-way merge to reconcile library updates with story-local changes
 *
 * @param storyVersion - Current content in the story (with local modifications)
 * @param libraryBase - Original library content at time of forking
 * @param libraryUpdate - Latest library content to merge in
 * @returns Merge result with success flag, merged content, and conflict count
 */
export function mergeLibraryUpdate(
  storyVersion: string,
  libraryBase: string,
  libraryUpdate: string
): MergeResult {
  // Normalize line endings to \n for consistent diff behavior
  const normalizeLineEndings = (text: string) => text.replace(/\r\n/g, '\n');

  const story = normalizeLineEndings(storyVersion);
  const base = normalizeLineEndings(libraryBase);
  const update = normalizeLineEndings(libraryUpdate);

  // Split into lines for diff3Merge
  const storyLines = story.split('\n');
  const baseLines = base.split('\n');
  const updateLines = update.split('\n');

  // Perform three-way merge
  const result = diff3Merge(
    storyLines,
    baseLines,
    updateLines,
    {
      stringSeparator: '\n'
    }
  );

  let mergedContent = '';
  let conflictCount = 0;

  // Build merged content with conflict markers
  for (const chunk of result) {
    if (chunk.ok) {
      // Clean merge - use the merged result
      mergedContent += chunk.ok.join('\n') + '\n';
    } else if (chunk.conflict) {
      // Conflict - insert git-style conflict markers
      conflictCount++;
      mergedContent += '<<<<<<< Story Version\n';
      mergedContent += chunk.conflict.a.join('\n') + '\n';
      mergedContent += '=======\n';
      mergedContent += chunk.conflict.b.join('\n') + '\n';
      mergedContent += '>>>>>>> Library Update\n';
    }
  }

  // Remove trailing newline if present
  mergedContent = mergedContent.replace(/\n$/, '');

  // Log warning if conflict rate is high (>50%)
  const totalChunks = result.length;
  const conflictRate = totalChunks > 0 ? conflictCount / totalChunks : 0;

  if (conflictRate > 0.5) {
    console.warn(
      `[Merge] High conflict rate: ${Math.round(conflictRate * 100)}% (${conflictCount}/${totalChunks} chunks). ` +
      'Consider manual merge or version reset.'
    );
  }

  return {
    success: conflictCount === 0,
    content: mergedContent,
    conflictCount
  };
}
