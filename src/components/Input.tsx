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
  const {
    theme,
    mode,
    inputValue,
    setInputValue,
    setMode,
    sendMessage,
    isStreaming,
    dialog,
    setDialog,
    sidebarVisible,
  } = useStore()
  const { width } = useTerminalSize()
  
  const isActive = mode === 'insert' && dialog === 'none'
  
  // Calculate input width
  const sidebarWidth = sidebarVisible ? 28 : 0
  const inputWidth = width - sidebarWidth - (sidebarVisible ? 1 : 0)
  
  // Handle input submission
  const handleSubmit = async (value: string) => {
    const trimmed = value.trim()
    if (!trimmed || isStreaming) return
    
    // Check for slash commands
    if (trimmed.startsWith('/')) {
      const cmd = trimmed.slice(1).toLowerCase().split(' ')[0]
      switch (cmd) {
        case 'help':
        case 'h':
          setDialog('help')
          setInputValue('')
          return
        case 'models':
        case 'm':
          setDialog('models')
          setInputValue('')
          return
        case 'sessions':
        case 's':
          setDialog('sessions')
          setInputValue('')
          return
        case 'theme':
        case 't':
          setDialog('themes')
          setInputValue('')
          return
        case 'new':
        case 'n':
          useStore.getState().createSession()
          setInputValue('')
          return
        case 'clear':
        case 'c':
          const session = useStore.getState().getCurrentSession()
          if (session) {
            useStore.getState().updateSessionTitle(session.id, 'New Chat')
          }
          setInputValue('')
          return
        case 'quit':
        case 'q':
          process.exit(0)
        default:
          useStore.getState().setError(`Unknown command: /${cmd}. Type /help for available commands.`)
          setInputValue('')
          return
      }
    }
    
    setInputValue('')
    await sendMessage(trimmed)
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
        setMode('normal')
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
              onChange={setInputValue}
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
