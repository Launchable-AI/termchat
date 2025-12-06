import Conf from 'conf'
import { nanoid } from 'nanoid'

export interface Session {
  id: string
  title: string
  model: string
  messages: ChatMessage[]
  createdAt: string
  updatedAt: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  reasoning?: string
  timestamp: string
  model?: string
}

export interface Settings {
  theme: string
  defaultModel: string
  favoriteModels: string[]
  recentModels: string[]
  apiKey?: string
  systemPrompt: string
}

interface StorageSchema {
  sessions: Session[]
  settings: Settings
}

const DEFAULT_SETTINGS: Settings = {
  theme: 'opencode',
  defaultModel: 'anthropic/claude-sonnet-4',
  favoriteModels: [
    'anthropic/claude-sonnet-4',
    'anthropic/claude-3.5-sonnet',
    'openai/gpt-4o',
    'openai/gpt-4o-mini',
    'deepseek/deepseek-chat:free',
    'deepseek/deepseek-r1:free',
    'google/gemini-2.0-flash-exp:free',
  ],
  recentModels: [],
  systemPrompt: 'You are a helpful AI assistant.',
}

class Storage {
  private store: Conf<StorageSchema>

  constructor() {
    this.store = new Conf<StorageSchema>({
      projectName: 'termchat',
      defaults: {
        sessions: [],
        settings: DEFAULT_SETTINGS,
      },
    })
  }

  // Sessions
  getSessions(): Session[] {
    const sessions = this.store.get('sessions') || []
    // Sort by most recent first
    return sessions.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  }

  getSession(id: string): Session | undefined {
    const sessions = this.getSessions()
    return sessions.find((s) => s.id === id)
  }

  createSession(model?: string): Session {
    const settings = this.getSettings()
    const session: Session = {
      id: nanoid(),
      title: 'New Chat',
      model: model || settings.defaultModel,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const sessions = this.store.get('sessions') || []
    sessions.push(session)
    this.store.set('sessions', sessions)
    return session
  }

  updateSession(id: string, updates: Partial<Session>): Session | undefined {
    const sessions = this.store.get('sessions') || []
    const index = sessions.findIndex((s) => s.id === id)
    if (index === -1) return undefined

    sessions[index] = {
      ...sessions[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    this.store.set('sessions', sessions)
    return sessions[index]
  }

  deleteSession(id: string): boolean {
    const sessions = this.store.get('sessions') || []
    const filtered = sessions.filter((s) => s.id !== id)
    if (filtered.length === sessions.length) return false
    this.store.set('sessions', filtered)
    return true
  }

  addMessage(sessionId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage {
    const msg: ChatMessage = {
      ...message,
      id: nanoid(),
      timestamp: new Date().toISOString(),
    }

    const sessions = this.store.get('sessions') || []
    const index = sessions.findIndex((s) => s.id === sessionId)
    if (index !== -1) {
      sessions[index].messages.push(msg)
      sessions[index].updatedAt = new Date().toISOString()
      this.store.set('sessions', sessions)
    }

    return msg
  }

  updateMessage(
    sessionId: string,
    messageId: string,
    updates: Partial<ChatMessage>
  ): ChatMessage | undefined {
    const sessions = this.store.get('sessions') || []
    const sessionIndex = sessions.findIndex((s) => s.id === sessionId)
    if (sessionIndex === -1) return undefined

    const msgIndex = sessions[sessionIndex].messages.findIndex((m) => m.id === messageId)
    if (msgIndex === -1) return undefined

    sessions[sessionIndex].messages[msgIndex] = {
      ...sessions[sessionIndex].messages[msgIndex],
      ...updates,
    }
    sessions[sessionIndex].updatedAt = new Date().toISOString()
    this.store.set('sessions', sessions)
    return sessions[sessionIndex].messages[msgIndex]
  }

  // Settings
  getSettings(): Settings {
    return this.store.get('settings') || DEFAULT_SETTINGS
  }

  updateSettings(updates: Partial<Settings>): Settings {
    const current = this.getSettings()
    const updated = { ...current, ...updates }
    this.store.set('settings', updated)
    return updated
  }

  // Favorites
  toggleFavoriteModel(modelId: string): boolean {
    const settings = this.getSettings()
    const index = settings.favoriteModels.indexOf(modelId)
    if (index === -1) {
      settings.favoriteModels.push(modelId)
      this.store.set('settings', settings)
      return true
    } else {
      settings.favoriteModels.splice(index, 1)
      this.store.set('settings', settings)
      return false
    }
  }

  isFavoriteModel(modelId: string): boolean {
    const settings = this.getSettings()
    return settings.favoriteModels.includes(modelId)
  }

  // Recent models
  addRecentModel(modelId: string): void {
    const settings = this.getSettings()
    const recents = settings.recentModels.filter((m) => m !== modelId)
    recents.unshift(modelId)
    settings.recentModels = recents.slice(0, 5) // Keep last 5
    this.store.set('settings', settings)
  }

  // Theme
  setTheme(theme: string): void {
    this.updateSettings({ theme })
  }

  getTheme(): string {
    return this.getSettings().theme
  }

  // API Key
  setApiKey(key: string): void {
    this.updateSettings({ apiKey: key })
  }

  getApiKey(): string | undefined {
    return this.getSettings().apiKey
  }

  // Export session to markdown
  exportSession(sessionId: string): string {
    const session = this.getSession(sessionId)
    if (!session) return ''

    let md = `# ${session.title}\n\n`
    md += `Model: ${session.model}\n`
    md += `Created: ${new Date(session.createdAt).toLocaleString()}\n\n`
    md += `---\n\n`

    for (const msg of session.messages) {
      const roleLabel = msg.role === 'user' ? '**You**' : '**Assistant**'
      md += `${roleLabel}\n\n${msg.content}\n\n`
      if (msg.reasoning) {
        md += `<details><summary>Reasoning</summary>\n\n${msg.reasoning}\n\n</details>\n\n`
      }
      md += `---\n\n`
    }

    return md
  }
}

export const storage = new Storage()
export default storage
