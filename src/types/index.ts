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
