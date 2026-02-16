import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDatabase } from '../services/db';
import type { Template, TemplateType } from '../types';
import { extractName, stringifyMarkdown } from '../services/markdown';

/**
 * Query all templates, optionally filtered by type.
 */
export function useTemplates(type?: TemplateType) {
  return useQuery({
    queryKey: ['templates', type],
    queryFn: async (): Promise<Template[]> => {
      const db = await getDatabase();

      let sql: string;
      let params: any[];

      if (type) {
        sql = 'SELECT * FROM templates WHERE type = ? ORDER BY is_builtin DESC, name ASC';
        params = [type];
      } else {
        sql = 'SELECT * FROM templates ORDER BY is_builtin DESC, name ASC';
        params = [];
      }

      const results: Template[] = [];
      db.exec({
        sql,
        bind: params,
        callback: (row: any) => {
          results.push({
            id: row[0],
            type: row[1] as TemplateType,
            name: row[2],
            content: row[3],
            is_builtin: Boolean(row[4]),
            created_at: row[5],
            updated_at: row[6]
          });
        }
      });

      return results;
    },
    refetchInterval: 5000, // Poll every 5s
  });
}

/**
 * Query a single template by ID.
 * Disabled when id is null.
 */
export function useTemplate(id: string | null) {
  return useQuery({
    queryKey: ['template', id],
    queryFn: async (): Promise<Template | null> => {
      if (!id) return null;

      const db = await getDatabase();

      let result: Template | null = null;
      db.exec({
        sql: 'SELECT * FROM templates WHERE id = ?',
        bind: [id],
        callback: (row: any) => {
          result = {
            id: row[0],
            type: row[1] as TemplateType,
            name: row[2],
            content: row[3],
            is_builtin: Boolean(row[4]),
            created_at: row[5],
            updated_at: row[6]
          };
        }
      });

      return result;
    },
    enabled: id !== null,
  });
}

/**
 * Create a new template.
 * Takes { type, name }
 */
export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      type: TemplateType;
      name: string;
    }): Promise<string> => {
      const db = await getDatabase();
      const now = Date.now();
      const id = `tpl_${now}_${Math.random().toString(36).substr(2, 9)}`;

      // Generate type-appropriate default content
      const defaultContent = getDefaultTemplateContent(params.type, params.name);

      db.exec({
        sql: `INSERT INTO templates (id, type, name, content, is_builtin, created_at, updated_at)
              VALUES (?, ?, ?, ?, 0, ?, ?)`,
        bind: [id, params.type, params.name, defaultContent, now, now]
      });

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });
}

/**
 * Update a template's content and name (re-extracted from frontmatter).
 */
export function useUpdateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: string;
      content: string;
    }): Promise<void> => {
      const db = await getDatabase();
      const now = Date.now();

      // Extract name from frontmatter
      const name = extractName(params.content);

      db.exec({
        sql: 'UPDATE templates SET content = ?, name = ?, updated_at = ? WHERE id = ?',
        bind: [params.content, name, now, params.id]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      queryClient.invalidateQueries({ queryKey: ['template'] });
    },
  });
}

/**
 * Delete a template by ID.
 * Prevents deleting builtin templates (is_builtin=1).
 */
export function useDeleteTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const db = await getDatabase();

      // Check if this is a builtin template
      let isBuiltin = false;
      db.exec({
        sql: 'SELECT is_builtin FROM templates WHERE id = ?',
        bind: [id],
        callback: (row: any) => {
          if (row[0]) {
            isBuiltin = true;
          }
        }
      });

      if (isBuiltin) {
        throw new Error('Cannot delete a built-in template');
      }

      db.exec({
        sql: 'DELETE FROM templates WHERE id = ?',
        bind: [id]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });
}

/**
 * Generate type-appropriate default template content.
 */
function getDefaultTemplateContent(type: TemplateType, name: string): string {
  switch (type) {
    case 'character':
      return stringifyMarkdown(
        `# Character Notes

(Write additional notes, backstory details, or scene ideas here)`,
        {
          name,
          role: '',
          category: 'Named',
          tags: [],
          traits: [],
          relationships: [],
          appearance: '',
          voice: '',
          backstory: '',
          arc_notes: ''
        }
      );

    case 'setting':
      return stringifyMarkdown(
        `# Setting Notes

(Write additional details, history, or mood descriptions here)`,
        {
          name,
          type: '',
          atmosphere: '',
          sensory_details: '',
          character_associations: []
        }
      );

    case 'theme':
      return stringifyMarkdown(
        `# Theme Notes

(Describe the thematic elements, symbolism, or recurring motifs)`,
        {
          name,
          elements: [],
          symbols: [],
          questions: []
        }
      );

    case 'outline':
      return stringifyMarkdown(
        `# Story Outline

## Act 1

## Act 2

## Act 3`,
        {
          name,
          structure: 'three-act'
        }
      );

    case 'ai_config':
      return stringifyMarkdown(
        `# Writing Style

(Define the AI's writing approach here)

## Tone

## Voice

## Avoid`,
        {
          name,
          stage: 'general'
        }
      );

    default:
      return stringifyMarkdown('# Notes', { name });
  }
}
