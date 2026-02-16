import { StateField, Extension } from '@codemirror/state';
import { Decoration, DecorationSet, EditorView } from '@codemirror/view';
import type { Text } from '@codemirror/state';

/**
 * Marker regex: {{type:value}}
 * Supports types: character, setting, expand, ref, instruct
 */
const MARKER_REGEX = /\{\{(\w+):([^}]+)\}\}/g;

/**
 * Valid marker types with their associated CSS classes
 */
const MARKER_TYPES = new Set(['character', 'setting', 'expand', 'ref', 'instruct']);

/**
 * Find all markers in the entire document
 */
function findAllMarkers(doc: Text): DecorationSet {
  const decorations: Array<{ from: number; to: number; type: string }> = [];
  const text = doc.toString();
  let match;

  MARKER_REGEX.lastIndex = 0; // Reset regex state
  while ((match = MARKER_REGEX.exec(text)) !== null) {
    const type = match[1];
    if (MARKER_TYPES.has(type)) {
      decorations.push({
        from: match.index,
        to: match.index + match[0].length,
        type,
      });
    }
  }

  return Decoration.set(
    decorations.map((d) =>
      Decoration.mark({
        class: `cm-marker-${d.type}`,
      }).range(d.from, d.to)
    )
  );
}

/**
 * Find markers within a specific range of the document
 */
function findMarkersInRange(doc: Text, from: number, to: number): Array<{ from: number; to: number; decoration: Decoration }> {
  const decorations: Array<{ from: number; to: number; decoration: Decoration }> = [];
  const text = doc.sliceString(from, to);
  let match;

  MARKER_REGEX.lastIndex = 0; // Reset regex state
  while ((match = MARKER_REGEX.exec(text)) !== null) {
    const type = match[1];
    if (MARKER_TYPES.has(type)) {
      const absFrom = from + match.index;
      const absTo = absFrom + match[0].length;
      decorations.push({
        from: absFrom,
        to: absTo,
        decoration: Decoration.mark({
          class: `cm-marker-${type}`,
        }),
      });
    }
  }

  return decorations;
}

/**
 * StateField for incremental marker highlighting
 * Uses change tracking to only update decorations in changed ranges
 */
const markerField = StateField.define<DecorationSet>({
  create(state) {
    return findAllMarkers(state.doc);
  },
  update(decorations, tr) {
    // If no document changes, just map decorations through the transaction
    if (!tr.docChanged) {
      return decorations.map(tr.changes);
    }

    // Map existing decorations through the changes
    let deco = decorations.map(tr.changes);

    // Incrementally update only the changed ranges
    tr.changes.iterChangedRanges((_fromA, _toA, fromB, toB) => {
      // Expand range to full lines for correct boundary detection
      const lineFrom = tr.state.doc.lineAt(fromB);
      const lineTo = tr.state.doc.lineAt(toB);

      // Remove old decorations in changed range
      deco = deco.update({
        filterFrom: lineFrom.from,
        filterTo: lineTo.to,
        filter: () => false,
      });

      // Add new decorations for changed range
      const newDecos = findMarkersInRange(tr.state.doc, lineFrom.from, lineTo.to);
      if (newDecos.length > 0) {
        deco = deco.update({
          add: newDecos.map((d) => d.decoration.range(d.from, d.to)),
          sort: true,
        });
      }
    });

    return deco;
  },
  provide: (f) => EditorView.decorations.from(f),
});

/**
 * Base theme defining marker highlighting styles
 * Color scheme:
 * - character (blue): reference a character profile
 * - setting (green): reference a setting
 * - expand (amber): expand/elaborate this section
 * - ref (purple): generic reference
 * - instruct (red-orange): instruction to the AI
 */
const markerTheme = EditorView.baseTheme({
  '.cm-marker-character': {
    backgroundColor: 'rgba(74, 158, 255, 0.2)',
    borderRadius: '3px',
    padding: '0 2px',
  },
  '.cm-marker-setting': {
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
    borderRadius: '3px',
    padding: '0 2px',
  },
  '.cm-marker-expand': {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderRadius: '3px',
    padding: '0 2px',
  },
  '.cm-marker-ref': {
    backgroundColor: 'rgba(167, 139, 250, 0.2)',
    borderRadius: '3px',
    padding: '0 2px',
  },
  '.cm-marker-instruct': {
    backgroundColor: 'rgba(251, 146, 60, 0.2)',
    borderRadius: '3px',
    padding: '0 2px',
  },
});

/**
 * Combined marker highlighting extension
 * Includes the StateField for decoration tracking and the base theme for styling
 */
export const markerHighlighting: Extension = [markerField, markerTheme];
