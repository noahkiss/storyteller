import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDatabase } from '@/services/db';
import { extractName, parseMarkdown } from '@/services/markdown';
import { LibraryItem, LibraryItemType } from '@/types';

/**
 * Query hook to fetch all library items of a given type.
 * Polls every 5 seconds to keep list in sync.
 */
export function useLibraryItems(type: LibraryItemType) {
  return useQuery({
    queryKey: ['library-items', type],
    queryFn: async () => {
      const db = await getDatabase();
      const items: LibraryItem[] = [];

      db.exec({
        sql: 'SELECT * FROM library_items WHERE type = ? ORDER BY updated_at DESC',
        bind: [type],
        callback: (row: any) => {
          items.push({
            id: row.id,
            type: row.type,
            name: row.name,
            category: row.category,
            tags: JSON.parse(row.tags || '[]'),
            content: row.content,
            version: row.version,
            created_at: row.created_at,
            updated_at: row.updated_at,
          });
        },
      });

      return items;
    },
    refetchInterval: 5000, // Poll every 5s
  });
}

/**
 * Query hook to fetch a single library item by ID.
 * Disabled when id is null.
 */
export function useLibraryItem(id: string | null) {
  return useQuery<LibraryItem | null>({
    queryKey: ['library-item', id],
    queryFn: async (): Promise<LibraryItem | null> => {
      if (!id) return null;

      const db = await getDatabase();
      let item: LibraryItem | null = null;

      db.exec({
        sql: 'SELECT * FROM library_items WHERE id = ?',
        bind: [id],
        callback: (row: any) => {
          item = {
            id: row.id,
            type: row.type,
            name: row.name,
            category: row.category,
            tags: JSON.parse(row.tags || '[]'),
            content: row.content,
            version: row.version,
            created_at: row.created_at,
            updated_at: row.updated_at,
          };
        },
      });

      return item;
    },
    enabled: id !== null,
  });
}

/**
 * Mutation to create a new library item from template.
 * Fetches the default template for the given type and creates a new item.
 */
export function useCreateLibraryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (type: LibraryItemType) => {
      const db = await getDatabase();

      // Fetch the default template for this type
      let templateContent = '';
      db.exec({
        sql: 'SELECT content FROM templates WHERE type = ? AND is_builtin = 1 LIMIT 1',
        bind: [type],
        callback: (row: any) => {
          templateContent = row.content;
        },
      });

      if (!templateContent) {
        throw new Error(`No template found for type: ${type}`);
      }

      // Create new item
      const id = crypto.randomUUID();
      const now = Date.now();
      const name = extractName(templateContent) || 'Untitled';

      // Parse frontmatter to extract category and tags
      const { data } = parseMarkdown<{ category?: string; tags?: string[] }>(templateContent);
      const category = data.category || '';
      const tags = JSON.stringify(data.tags || []);

      db.exec({
        sql: `INSERT INTO library_items (id, type, name, category, tags, content, version, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)`,
        bind: [id, type, name, category, tags, templateContent, now, now],
      });

      const newItem: LibraryItem = {
        id,
        type,
        name,
        category,
        tags: JSON.parse(tags),
        content: templateContent,
        version: 1,
        created_at: now,
        updated_at: now,
      };

      return newItem;
    },
    onSuccess: (data) => {
      // Invalidate the list query for this type
      queryClient.invalidateQueries({ queryKey: ['library-items', data.type] });
      queryClient.invalidateQueries({ queryKey: ['library-item', data.id] });
    },
  });
}

/**
 * Mutation to update a library item.
 * Re-extracts name, category, and tags from frontmatter.
 */
export function useUpdateLibraryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const db = await getDatabase();
      const now = Date.now();

      // Extract metadata from frontmatter
      const name = extractName(content) || 'Untitled';
      const { data } = parseMarkdown<{ category?: string; tags?: string[] }>(content);
      const category = data.category || '';
      const tags = JSON.stringify(data.tags || []);

      // Update the item, incrementing version
      db.exec({
        sql: `UPDATE library_items
              SET content = ?, name = ?, category = ?, tags = ?, version = version + 1, updated_at = ?
              WHERE id = ?`,
        bind: [content, name, category, tags, now, id],
      });

      return { id, content, name, category, tags: JSON.parse(tags), updated_at: now };
    },
    onSuccess: (data) => {
      // Invalidate queries to refresh lists
      queryClient.invalidateQueries({ queryKey: ['library-items'] });
      queryClient.invalidateQueries({ queryKey: ['library-item', data.id] });
    },
  });
}

/**
 * Mutation to delete a library item by ID.
 */
export function useDeleteLibraryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, type }: { id: string; type: LibraryItemType }) => {
      const db = await getDatabase();
      db.exec({
        sql: 'DELETE FROM library_items WHERE id = ?',
        bind: [id],
      });
      return { id, type };
    },
    onSuccess: (data) => {
      // Invalidate the list query for this type
      queryClient.invalidateQueries({ queryKey: ['library-items', data.type] });
      queryClient.invalidateQueries({ queryKey: ['library-item', data.id] });
    },
  });
}
