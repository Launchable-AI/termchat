// OpenRouter API client with streaming support

export interface Model {
  id: string
  name: string
  description?: string
  context_length?: number
  pricing?: {
    prompt: string
    completion: string
  }
  top_provider?: {
    context_length?: number
    max_completion_tokens?: number
  }
}

export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface StreamChunk {
  content?: string
  reasoning?: string
  done: boolean
}

export interface ChatCompletionRequest {
  model: string
  messages: Message[]
  stream?: boolean
  max_tokens?: number
  temperature?: number
}

export class OpenRouterClient {
  private apiKey: string
  private baseUrl = 'https://openrouter.ai/api/v1'

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENROUTER_API_KEY || ''
  }

  setApiKey(key: string) {
    this.apiKey = key
  }

  hasApiKey(): boolean {
    return this.apiKey.length > 0
  }

  validateApiKey(): { valid: boolean; error?: string } {
    if (!this.apiKey) {
      return { valid: false, error: 'API key is empty' }
    }
    if (!this.apiKey.startsWith('sk-or-')) {
      return { valid: false, error: 'Invalid format - OpenRouter keys start with sk-or-' }
    }
    if (this.apiKey.length < 20) {
      return { valid: false, error: 'API key too short' }
    }
    return { valid: true }
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    const validation = this.validateApiKey()
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    try {
      const res = await fetch(`${this.baseUrl}/models?limit=1`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://github.com/termchat',
          'X-Title': 'TermChat',
        },
      })

      if (!res.ok) {
        const body = await res.text()
        return { success: false, error: `API error (${res.status}): ${body}` }
      }

      return { success: true }
    } catch (err) {
      return { success: false, error: `Connection failed: ${err}` }
    }
  }

  async getModels(): Promise<Model[]> {
    const validation = this.validateApiKey()
    if (!validation.valid) {
      throw new Error(validation.error)
    }

    const res = await fetch(`${this.baseUrl}/models`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/termchat',
        'X-Title': 'TermChat',
      },
    })

    if (!res.ok) {
      throw new Error(`Failed to fetch models: ${res.status}`)
    }

    const data = (await res.json()) as { data: Model[] }
    return data.data
  }

  async *streamCompletion(
    request: ChatCompletionRequest,
    signal?: AbortSignal
  ): AsyncGenerator<StreamChunk> {
    const validation = this.validateApiKey()
    if (!validation.valid) {
      throw new Error(validation.error)
    }

    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        'Cache-Control': 'no-cache',
        'HTTP-Referer': 'https://github.com/termchat',
        'X-Title': 'TermChat',
      },
      body: JSON.stringify({
        ...request,
        stream: true,
      }),
      signal,
    })

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`API error (${res.status}): ${body}`)
    }

    const reader = res.body?.getReader()
    if (!reader) {
      throw new Error('No response body')
    }

    const decoder = new TextDecoder()
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6)

          if (data === '[DONE]') {
            yield { done: true }
            return
          }

          try {
            const event = JSON.parse(data)
            const choice = event.choices?.[0]
            if (choice) {
              if (choice.finish_reason) {
                yield { done: true }
                return
              }
              yield {
                content: choice.delta?.content || undefined,
                reasoning: choice.delta?.reasoning || undefined,
                done: false,
              }
            }
          } catch {
            // Skip malformed JSON
          }
        }
      }
    } finally {
      reader.releaseLock()
    }

    yield { done: true }
  }

  async generateTitle(messages: Message[]): Promise<string> {
    if (messages.length < 2) {
      return 'New Chat'
    }

    try {
      const res = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://github.com/termchat',
          'X-Title': 'TermChat',
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-chat:free',
          messages: [
            {
              role: 'system',
              content:
                'Generate a concise title (2-6 words) for this conversation. Return only the title, no quotes.',
            },
            { role: 'user', content: messages[0].content },
            { role: 'assistant', content: messages[1].content },
          ],
          stream: false,
        }),
      })

      if (!res.ok) {
        return 'New Chat'
      }

      const data = (await res.json()) as { choices?: { message?: { content?: string } }[] }
      const title = data.choices?.[0]?.message?.content?.trim()
      return title || 'New Chat'
    } catch {
      return 'New Chat'
    }
  }
}

// Default favorite models
export const FAVORITE_MODELS: Model[] = [
  // Reasoning Models
  { id: 'openai/o3-mini', name: 'o3 Mini', description: 'Fast reasoning model' },
  { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1', description: 'Advanced reasoning' },
  { id: 'deepseek/deepseek-r1:free', name: 'DeepSeek R1 (Free)', description: 'Free reasoning' },
  // General Purpose
  { id: 'anthropic/claude-sonnet-4', name: 'Claude Sonnet 4', description: 'Balanced Claude' },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', description: 'Previous gen' },
  { id: 'openai/gpt-4o', name: 'GPT-4o', description: 'Multimodal GPT-4' },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', description: 'Fast & cheap' },
  { id: 'google/gemini-2.0-flash-001', name: 'Gemini 2.0 Flash', description: 'Fast Google model' },
  // Free Models
  { id: 'deepseek/deepseek-chat:free', name: 'DeepSeek V3 (Free)', description: 'Free DeepSeek' },
  { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini Flash (Free)', description: 'Free Gemini' },
]

// Reasoning model detection
export const REASONING_MODELS = new Set([
  'openai/o3-pro',
  'openai/o3',
  'openai/o3-mini',
  'openai/o1-preview',
  'openai/o1-mini',
  'deepseek/deepseek-r1',
  'deepseek/deepseek-r1:free',
  'google/gemini-2.5-pro-preview',
])

export function isReasoningModel(modelId: string): boolean {
  return REASONING_MODELS.has(modelId)
}

export function isFreeTierModel(modelId: string): boolean {
  return modelId.includes(':free') || modelId.endsWith('-free')
}

export function formatModelPrice(pricing?: { prompt: string; completion: string }): string {
  if (!pricing) return ''
  const prompt = parseFloat(pricing.prompt) * 1_000_000
  const completion = parseFloat(pricing.completion) * 1_000_000
  if (prompt === 0 && completion === 0) return 'Free'
  return `$${prompt.toFixed(2)}/$${completion.toFixed(2)} per 1M`
}
