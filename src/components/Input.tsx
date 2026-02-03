import React from 'react'
import { Box, Text, useInput } from 'ink'
import TextInput from 'ink-text-input'
import { useStore } from '../hooks/useStore.js'
import { useTerminalSize } from '../hooks/useTerminalSize.js'

// Custom prompt characters
const PROMPT_CHARS = {
  active: '┃',
  inactive: '┃',
  bottom: '╹',
}

export default function Input() {
  // Use selective subscriptions
  const theme = useStore(s => s.theme)
  const mode = useStore(s => s.mode)
  const inputValue = useStore(s => s.inputValue)
  const isStreaming = useStore(s => s.isStreaming)
  const dialog = useStore(s => s.dialog)
  const sidebarVisible = useStore(s => s.sidebarVisible)
  
  const { width } = useTerminalSize()
  
  const isActive = mode === 'insert' && dialog === 'none'
  
  // Calculate input width
  const sidebarWidth = sidebarVisible ? 28 : 0
  const inputWidth = width - sidebarWidth - (sidebarVisible ? 1 : 0)
  
  // Handle input submission
  const handleSubmit = async (value: string) => {
    const trimmed = value.trim()
    if (!trimmed || isStreaming) return
    
    const store = useStore.getState()
    
    // Check for slash commands
    if (trimmed.startsWith('/')) {
      const cmd = trimmed.slice(1).toLowerCase().split(' ')[0]
      switch (cmd) {
        case 'help':
        case 'h':
          store.setDialog('help')
          store.setInputValue('')
          return
        case 'models':
        case 'm':
          store.setDialog('models')
          store.setInputValue('')
          return
        case 'sessions':
        case 's':
          store.setDialog('sessions')
          store.setInputValue('')
          return
        case 'theme':
        case 't':
          store.setDialog('themes')
          store.setInputValue('')
          return
        case 'new':
        case 'n':
          store.createSession()
          store.setInputValue('')
          return
        case 'clear':
        case 'c':
          const sessionId = store.currentSessionId
          if (sessionId) {
            store.updateSessionTitle(sessionId, 'New Chat')
          }
          store.setInputValue('')
          return
        case 'quit':
        case 'q':
          process.exit(0)
        default:
          store.setError(`Unknown command: /${cmd}. Type /help for available commands.`)
          store.setInputValue('')
          return
      }
    }
    
    store.setInputValue('')
    await store.sendMessage(trimmed)
  }
  
  // Handle special keys in insert mode
  useInput(
    (input, key) => {
      if (!isActive) return
      
      if (key.return && !key.shift) {
        handleSubmit(inputValue)
        return
      }
      
      if (key.escape) {
        useStore.getState().setMode('normal')
        return
      }
    },
    { isActive }
  )
  
  const accentColor = isActive ? theme.accent : theme.border
  const promptText = isActive 
    ? 'Type a message...' 
    : 'Press i or Enter to type...'
  
  return (
    <Box flexDirection="column" width={inputWidth} paddingX={1}>
      {/* Top border line */}
      <Box>
        <Text color={theme.border}>{'─'.repeat(inputWidth - 2)}</Text>
      </Box>
      
      {/* Input row */}
      <Box>
        <Text color={accentColor}>{PROMPT_CHARS.active}</Text>
        <Text color={theme.backgroundPanel}> </Text>
        
        {isActive ? (
          <Box flexGrow={1}>
            <TextInput
              value={inputValue}
              onChange={(v) => useStore.getState().setInputValue(v)}
              placeholder={promptText}
              focus={true}
            />
          </Box>
        ) : (
          <Box flexGrow={1}>
            <Text color={theme.textMuted}>
              {inputValue || promptText}
            </Text>
          </Box>
        )}
      </Box>
      
      {/* Status row */}
      <Box>
        <Text color={accentColor}>{PROMPT_CHARS.bottom}</Text>
        <Text color={theme.textMuted}> </Text>
        {isStreaming ? (
          <Text color={theme.warning}>Streaming... press Ctrl+C to cancel</Text>
        ) : (
          <Text color={theme.textMuted}>
            {isActive ? 'Enter to send, Esc to exit' : 'i to insert, / for commands'}
          </Text>
        )}
      </Box>
    </Box>
  )
}
