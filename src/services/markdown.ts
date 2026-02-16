import matter from 'gray-matter';

/**
 * Parse markdown content with YAML frontmatter.
 * Returns the frontmatter data object and the markdown content body.
 */
export function parseMarkdown<T = Record<string, unknown>>(
  markdown: string
): { data: T; content: string } {
  const result = matter(markdown);
  return {
    data: result.data as T,
    content: result.content
  };
}

/**
 * Stringify frontmatter data and markdown content back into a single string.
 */
export function stringifyMarkdown(
  content: string,
  data: Record<string, unknown>
): string {
  return matter.stringify(content, data);
}

/**
 * Extract the name from a markdown document's frontmatter.
 * Returns empty string if no name field found.
 */
export function extractName(markdown: string): string {
  try {
    const { data } = parseMarkdown<{ name?: string }>(markdown);
    return data.name || '';
  } catch {
    return '';
  }
}

/**
 * Update a single frontmatter field without touching the content body.
 */
export function updateFrontmatterField(
  markdown: string,
  field: string,
  value: unknown
): string {
  const { data, content } = parseMarkdown(markdown);
  return stringifyMarkdown(content, { ...data, [field]: value });
}

/**
 * Detect AI expansion markers in text.
 * Marker syntax: {{type:value}}
 * Types: character, setting, expand, ref, instruct
 */
export function detectMarkers(
  text: string
): Array<{ type: string; value: string; start: number; end: number }> {
  const MARKER_REGEX = /\{\{(\w+):([^}]+)\}\}/g;
  const markers: Array<{ type: string; value: string; start: number; end: number }> = [];
  let match;

  while ((match = MARKER_REGEX.exec(text)) !== null) {
    markers.push({
      type: match[1],
      value: match[2].trim(),
      start: match.index,
      end: match.index + match[0].length
    });
  }

  return markers;
}

/**
 * Replace a marker in text with replacement content.
 */
export function replaceMarker(
  text: string,
  marker: { start: number; end: number },
  replacement: string
): string {
  return text.slice(0, marker.start) + replacement + text.slice(marker.end);
}

/**
 * Escape special regex characters in a string (for safe use in RegExp constructor).
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
