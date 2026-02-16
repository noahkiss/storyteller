// Database record types
export interface Version {
  id: number;
  content_id: string;
  content: string;
  version_type: 'auto' | 'manual' | 'generation';
  created_at: number;
}

export interface Generation {
  id: number;
  prompt: string;
  output: string;
  model: string;
  parameters: string; // JSON string of generation params
  token_count: number;
  created_at: number;
}

export interface Preset {
  id: number;
  name: string;
  temperature: number;
  max_tokens: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  is_builtin: boolean;
}

export interface CompressionEvent {
  id: number;
  source_tier: string;
  target_tier: string;
  original_tokens: number;
  compressed_tokens: number;
  summary_text: string;
  created_at: number;
}

// Context engine types
export interface ContextTier {
  label: string;
  content: string;
  tokens: number;
  priority: number;
  color: string;
}

// LLM types
export interface LLMSettings {
  baseURL: string;
  apiKey: string;
  model: string;
}

export interface GenerationParams {
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
}

// Library types
export type LibraryItemType = 'character' | 'setting' | 'theme';
export type CharacterCategory = 'POV' | 'Named' | 'Background';

export interface LibraryItem {
  id: string;
  type: LibraryItemType;
  name: string;
  category: string;
  tags: string[];
  content: string; // Full markdown with frontmatter
  version: number;
  created_at: number;
  updated_at: number;
}

// Story types
export type StoryStatus = 'setup' | 'outlining' | 'writing' | 'complete';

export interface Story {
  id: string;
  title: string;
  premise: string;
  status: StoryStatus;
  ai_config_id: string | null;
  created_at: number;
  updated_at: number;
}

// Forked library item within a story
export interface StoryItem {
  id: string;
  story_id: string;
  library_id: string;
  forked_from_version: number;
  content: string;
  has_local_changes: boolean;
  created_at: number;
  updated_at: number;
}

// Outline types
export interface Outline {
  id: string;
  story_id: string;
  content: string; // Markdown outline document
  created_at: number;
  updated_at: number;
}

export interface Scene {
  title: string;
  summary: string;
  characters: string[];
  setting: string;
  mood: string;
  chapter?: string;
}

// AI config types
export interface AIConfig {
  id: string;
  name: string;
  content: string; // Markdown with frontmatter
  is_global: boolean;
  story_id: string | null;
  created_at: number;
  updated_at: number;
}

// Template types
export type TemplateType = 'character' | 'setting' | 'theme' | 'outline' | 'ai_config';

export interface Template {
  id: string;
  type: TemplateType;
  name: string;
  content: string; // Markdown template with frontmatter
  is_builtin: boolean;
  created_at: number;
  updated_at: number;
}

// Frontmatter types (parsed from markdown content)
export interface CharacterFrontmatter {
  name: string;
  role: string;
  category: CharacterCategory;
  tags: string[];
  traits: string[];
  relationships: string[];
  appearance: string;
  voice: string;
  backstory: string;
  arc_notes: string;
}

export interface SettingFrontmatter {
  name: string;
  type: string;
  atmosphere: string;
  sensory_details: string;
  character_associations: string[];
}

export interface AIConfigFrontmatter {
  name: string;
  stage: string;
}

// Marker types for AI expansion
export type MarkerType = 'character' | 'setting' | 'expand' | 'ref' | 'instruct';

export interface AIMarker {
  type: MarkerType;
  value: string;
  start: number;
  end: number;
}

// Merge types
export interface MergeResult {
  success: boolean;
  content: string;
  conflictCount: number;
}

// Library reference (auto-detected in outlines)
export interface LibraryReference {
  type: 'character' | 'setting';
  id: string;
  name: string;
  occurrences: number;
}
