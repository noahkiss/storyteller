import OpenAI from 'openai';

/**
 * Create an OpenAI-compatible client instance
 *
 * Note: Uses dangerouslyAllowBrowser: true because we're connecting
 * to local LLM servers (localhost). This is acceptable for this use case.
 */
export function createLLMClient(baseURL: string, apiKey: string): OpenAI {
  return new OpenAI({
    baseURL,
    apiKey,
    dangerouslyAllowBrowser: true,
  });
}

export interface ConnectionTestResult {
  success: boolean;
  models?: string[];
  error?: string;
}

/**
 * Test connection to LLM endpoint and fetch available models
 * Timeout after 5 seconds (local LLMs should respond quickly)
 */
export async function testConnection(
  baseURL: string,
  apiKey: string
): Promise<ConnectionTestResult> {
  try {
    const client = createLLMClient(baseURL, apiKey);

    // Set a timeout for the request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await client.models.list();

    clearTimeout(timeoutId);

    const models = response.data.map((model) => model.id);

    return {
      success: true,
      models,
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'Connection timeout (5s)',
        };
      }
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: 'Unknown error',
    };
  }
}

export interface GenerateTestResult {
  success: boolean;
  output?: string;
  latencyMs?: number;
  error?: string;
}

/**
 * Test full generation pipeline with a simple prompt
 * Validates that the model can actually generate text
 */
export async function testGenerate(
  baseURL: string,
  apiKey: string,
  model: string
): Promise<GenerateTestResult> {
  const startTime = Date.now();

  try {
    const client = createLLMClient(baseURL, apiKey);

    const response = await client.chat.completions.create({
      model,
      messages: [
        {
          role: 'user',
          content: 'Reply with OK if you can read this.',
        },
      ],
      max_tokens: 10,
      stream: false,
    });

    const latencyMs = Date.now() - startTime;
    const output = response.choices[0]?.message?.content || '';

    return {
      success: true,
      output,
      latencyMs,
    };
  } catch (error) {
    const latencyMs = Date.now() - startTime;

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
        latencyMs,
      };
    }
    return {
      success: false,
      error: 'Unknown error',
      latencyMs,
    };
  }
}

/**
 * Fetch available models from the LLM endpoint
 * Returns empty array on failure (fallback to manual input)
 */
export async function fetchModels(
  baseURL: string,
  apiKey: string
): Promise<string[]> {
  try {
    const result = await testConnection(baseURL, apiKey);
    return result.models || [];
  } catch {
    return [];
  }
}
