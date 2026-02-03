import 'dotenv/config'
import { create } from 'zustand'
import { shallow } from 'zustand/shallow'
import storage, { Session, ChatMessage, Settings } from '../storage/index.js'
import { OpenRouterClient, Model, FAVORITE_MODELS } from '../api/openrouter.js'
import { getTheme, ResolvedTheme, getAvailableThemes } from '../themes/index.js'

// Re-export shallow for convenience
export { shallow }

export type AppMode = 'normal' | 'insert' | 'scroll'
export type DialogType =
  | 'none'
  | 'models'
  | 'sessions'
  | 'themes'
  | 'help'
  | 'confirm'
  | 'command'
  | 'apikey'

interface Tab {
  sessionId: string
  title: string
}

interface CodeBlock {
  id: string
  messageId: string
  language: string
  code: string
  startLine: number
  endLine: number
}

interface AppState {
  // App state
  mode: AppMode
  dialog: DialogType
  sidebarVisible: boolean
  
  // Scroll state
  scrollOffset: number
  selectedCodeBlockIndex: number
  codeBlocks: CodeBlock[]
  
  // Tabs
  tabs: Tab[]
  activeTabIndex: number
  
  // Theme
  theme: ResolvedTheme
  themeName: string
  
  // Session
  currentSessionId: string | null
  sessions: Session[]
  
  // Models
  models: Model[]
  allModels: Model[]
  currentModel: string
  isLoadingModels: boolean
  
  // Streaming
  isStreaming: boolean
  streamAbortController: AbortController | null
  
  // API
  client: OpenRouterClient
  isConnected: boolean
  
  // Error
  error: string | null
  
  // Input
  inputValue: string
  
  // Notification (for copy feedback)
  notification: string | null
  
  // Actions
  setMode: (mode: AppMode) => void
  setDialog: (dialog: DialogType) => void
  toggleSidebar: () => void
  
  // Scroll actions
  setScrollOffset: (offset: number) => void
  scrollUp: (lines?: number) => void
  scrollDown: (lines?: number) => void
  scrollToTop: () => void
  scrollToBottom: () => void
  setCodeBlocks: (blocks: CodeBlock[]) => void
  selectNextCodeBlock: () => void
  selectPrevCodeBlock: () => void
  copySelectedCodeBlock: () => Promise<void>
  
  setTheme: (name: string) => void
  cycleTheme: () => void
  
  loadSessions: () => void
  createSession: (model?: string) => Session
  selectSession: (id: string) => void
  deleteSession: (id: string) => void
  updateSessionTitle: (id: string, title: string) => void
  getCurrentSession: () => Session | null
  
  // Tab actions
  openTab: (sessionId: string) => void
  closeTab: (index: number) => void
  switchTab: (index: number) => void
  nextTab: () => void
  prevTab: () => void
  
  loadModels: () => Promise<void>
  setCurrentModel: (modelId: string) => void
  toggleFavorite: (modelId: string) => void
  
  setStreaming: (streaming: boolean, controller?: AbortController) => void
  cancelStreaming: () => void
  
  setApiKey: (key: string) => void
  testConnection: () => Promise<boolean>
  
  setError: (error: string | null) => void
  setNotification: (msg: string | null) => void
  
  setInputValue: (value: string) => void
  
  sendMessage: (content: string) => Promise<void>
  
  // Settings
  getSettings: () => Settings
}

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  mode: 'normal',
  dialog: 'none',
  sidebarVisible: true,
  
  // Scroll state
  scrollOffset: 0,
  selectedCodeBlockIndex: -1,
  codeBlocks: [],
  
  // Tabs
  tabs: [],
  activeTabIndex: 0,
  
  theme: getTheme(storage.getTheme()),
  themeName: storage.getTheme(),
  
  currentSessionId: null,
  sessions: [],
  
  models: FAVORITE_MODELS,
  allModels: [],
  currentModel: storage.getSettings().defaultModel,
  isLoadingModels: false,
  
  isStreaming: false,
  streamAbortController: null,
  
  client: new OpenRouterClient(storage.getApiKey() || process.env.OPENROUTER_API_KEY),
  isConnected: false,
  
  error: null,
  notification: null,
  
  inputValue: '',
  
  // Actions
  setMode: (mode) => set({ mode }),
  
  setDialog: (dialog) => set({ dialog }),
  
  toggleSidebar: () => set((s) => ({ sidebarVisible: !s.sidebarVisible })),
  
  // Scroll actions
  setScrollOffset: (offset) => set({ scrollOffset: Math.max(0, offset) }),
  
  scrollUp: (lines = 3) => set((s) => ({ scrollOffset: Math.max(0, s.scrollOffset - lines) })),
  
  scrollDown: (lines = 3) => set((s) => ({ scrollOffset: s.scrollOffset + lines })),
  
  scrollToTop: () => set({ scrollOffset: 0 }),
  
  scrollToBottom: () => set({ scrollOffset: 0 }), // Will be adjusted by Messages component
  
  setCodeBlocks: (blocks) => set({ codeBlocks: blocks }),
  
  selectNextCodeBlock: () => set((s) => {
    if (s.codeBlocks.length === 0) return s
    const next = s.selectedCodeBlockIndex + 1
    return { selectedCodeBlockIndex: next >= s.codeBlocks.length ? 0 : next }
  }),
  
  selectPrevCodeBlock: () => set((s) => {
    if (s.codeBlocks.length === 0) return s
    const prev = s.selectedCodeBlockIndex - 1
    return { selectedCodeBlockIndex: prev < 0 ? s.codeBlocks.length - 1 : prev }
  }),
  
  copySelectedCodeBlock: async () => {
    const { codeBlocks, selectedCodeBlockIndex, setNotification } = get()
    if (selectedCodeBlockIndex < 0 || selectedCodeBlockIndex >= codeBlocks.length) {
      setNotification('No code block selected')
      return
    }
    
    const block = codeBlocks[selectedCodeBlockIndex]
    try {
      const clipboard = await import('clipboardy')
      await clipboard.default.write(block.code)
      setNotification(`Copied ${block.language || 'code'} block to clipboard`)
    } catch (err) {
      setNotification('Failed to copy to clipboard')
    }
    
    // Clear notification after 2 seconds
    setTimeout(() => get().setNotification(null), 2000)
  },
  
  setTheme: (name) => {
    storage.setTheme(name)
    set({ theme: getTheme(name), themeName: name })
  },
  
  cycleTheme: () => {
    const themes = getAvailableThemes()
    const current = get().themeName
    const index = themes.indexOf(current)
    const next = themes[(index + 1) % themes.length]
    get().setTheme(next)
  },
  
  loadSessions: () => {
    const sessions = storage.getSessions()
    set({ sessions })
    
    // Select the most recent session if none selected
    const currentId = get().currentSessionId
    if (!currentId && sessions.length > 0) {
      set({ currentSessionId: sessions[0].id })
    } else if (currentId && !sessions.find((s) => s.id === currentId)) {
      set({ currentSessionId: sessions.length > 0 ? sessions[0].id : null })
    }
  },
  
  createSession: (model) => {
    const session = storage.createSession(model || get().currentModel)
    get().loadSessions()
    // Open in a new tab
    get().openTab(session.id)
    // Reset scroll
    set({ scrollOffset: 0, selectedCodeBlockIndex: -1, codeBlocks: [] })
    return session
  },
  
  selectSession: (id) => {
    const session = storage.getSession(id)
    if (session) {
      get().openTab(id)
      set({ currentModel: session.model, scrollOffset: 0, selectedCodeBlockIndex: -1 })
    }
  },
  
  deleteSession: (id) => {
    storage.deleteSession(id)
    get().loadSessions()
  },
  
  updateSessionTitle: (id, title) => {
    storage.updateSession(id, { title })
    get().loadSessions()
  },
  
  getCurrentSession: () => {
    const { currentSessionId } = get()
    if (!currentSessionId) return null
    return storage.getSession(currentSessionId) || null
  },
  
  // Tab management
  openTab: (sessionId) => {
    const { tabs } = get()
    const existingIndex = tabs.findIndex((t) => t.sessionId === sessionId)
    if (existingIndex !== -1) {
      // Tab already open, switch to it
      set({ activeTabIndex: existingIndex, currentSessionId: sessionId })
      return
    }
    
    const session = storage.getSession(sessionId)
    if (!session) return
    
    const newTab: Tab = { sessionId, title: session.title }
    set({
      tabs: [...tabs, newTab],
      activeTabIndex: tabs.length,
      currentSessionId: sessionId,
    })
  },
  
  closeTab: (index) => {
    const { tabs, activeTabIndex } = get()
    if (tabs.length <= 1) return // Keep at least one tab
    
    const newTabs = tabs.filter((_, i) => i !== index)
    let newActiveIndex = activeTabIndex
    
    if (index <= activeTabIndex) {
      newActiveIndex = Math.max(0, activeTabIndex - 1)
    }
    if (newActiveIndex >= newTabs.length) {
      newActiveIndex = newTabs.length - 1
    }
    
    set({
      tabs: newTabs,
      activeTabIndex: newActiveIndex,
      currentSessionId: newTabs[newActiveIndex]?.sessionId || null,
    })
  },
  
  switchTab: (index) => {
    const { tabs } = get()
    if (index < 0 || index >= tabs.length) return
    set({
      activeTabIndex: index,
      currentSessionId: tabs[index].sessionId,
      scrollOffset: 0,
      selectedCodeBlockIndex: -1,
    })
  },
  
  nextTab: () => {
    const { tabs, activeTabIndex } = get()
    if (tabs.length === 0) return
    const next = (activeTabIndex + 1) % tabs.length
    get().switchTab(next)
  },
  
  prevTab: () => {
    const { tabs, activeTabIndex } = get()
    if (tabs.length === 0) return
    const prev = (activeTabIndex - 1 + tabs.length) % tabs.length
    get().switchTab(prev)
  },
  
  loadModels: async () => {
    set({ isLoadingModels: true })
    try {
      const allModels = await get().client.getModels()
      set({ allModels })
      
      // Combine favorites with fetched models info
      const settings = storage.getSettings()
      const favoriteIds = new Set(settings.favoriteModels)
      const favorites = allModels
        .filter((m) => favoriteIds.has(m.id))
        .sort((a, b) => a.name.localeCompare(b.name))
      
      set({ models: favorites.length > 0 ? favorites : FAVORITE_MODELS })
    } catch (err) {
      // Keep default favorites on error
      set({ models: FAVORITE_MODELS })
    } finally {
      set({ isLoadingModels: false })
    }
  },
  
  setCurrentModel: (modelId) => {
    storage.addRecentModel(modelId)
    set({ currentModel: modelId })
    
    // Update current session's model
    const session = get().getCurrentSession()
    if (session) {
      storage.updateSession(session.id, { model: modelId })
      get().loadSessions()
    }
  },
  
  toggleFavorite: (modelId) => {
    const isFav = storage.toggleFavoriteModel(modelId)
    // Reload favorites
    get().loadModels()
    return isFav
  },
  
  setStreaming: (streaming, controller) =>
    set({ isStreaming: streaming, streamAbortController: controller || null }),
  
  cancelStreaming: () => {
    const controller = get().streamAbortController
    if (controller) {
      controller.abort()
    }
    set({ isStreaming: false, streamAbortController: null })
  },
  
  setApiKey: (key) => {
    storage.setApiKey(key)
    get().client.setApiKey(key)
  },
  
  testConnection: async () => {
    const result = await get().client.testConnection()
    set({ isConnected: result.success })
    if (!result.success) {
      set({ error: result.error })
    }
    return result.success
  },
  
  setError: (error) => set({ error }),
  setNotification: (notification) => set({ notification }),
  
  setInputValue: (value) => set({ inputValue: value }),
  
  sendMessage: async (content) => {
    const { currentSessionId, currentModel, client } = get()
    
    // Create session if needed
    let sessionId = currentSessionId
    if (!sessionId) {
      const session = get().createSession(currentModel)
      sessionId = session.id
    }
    
    // Add user message
    const userMessage = storage.addMessage(sessionId, {
      role: 'user',
      content,
    })
    get().loadSessions()
    
    // Prepare messages for API
    const session = storage.getSession(sessionId)
    if (!session) return
    
    const messages = session.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }))
    
    // Create assistant message placeholder
    const assistantMsg = storage.addMessage(sessionId, {
      role: 'assistant',
      content: '',
      model: currentModel,
    })
    get().loadSessions()
    
    // Start streaming
    const abortController = new AbortController()
    set({ isStreaming: true, streamAbortController: abortController, scrollOffset: 0 })
    
    let fullContent = ''
    let fullReasoning = ''
    
    try {
      for await (const chunk of client.streamCompletion(
        { model: currentModel, messages },
        abortController.signal
      )) {
        if (chunk.done) break
        
        if (chunk.content) {
          fullContent += chunk.content
        }
        if (chunk.reasoning) {
          fullReasoning += chunk.reasoning
        }
        
        // Update message in storage
        storage.updateMessage(sessionId, assistantMsg.id, {
          content: fullContent,
          reasoning: fullReasoning || undefined,
        })
        get().loadSessions()
      }
      
      // Generate title if first exchange
      const updatedSession = storage.getSession(sessionId)
      if (updatedSession && updatedSession.messages.length === 2) {
        client.generateTitle(messages).then((title) => {
          get().updateSessionTitle(sessionId, title)
        })
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        set({ error: `Streaming error: ${err.message}` })
        // Remove empty assistant message on error
        const s = storage.getSession(sessionId)
        if (s) {
          const msgs = s.messages.filter((m) => m.id !== assistantMsg.id)
          storage.updateSession(sessionId, { messages: msgs })
          get().loadSessions()
        }
      }
    } finally {
      set({ isStreaming: false, streamAbortController: null })
    }
  },
  
  getSettings: () => storage.getSettings(),
}))

export default useStore
